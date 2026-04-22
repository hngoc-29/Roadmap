// ============================================================
// ACTIONS/CONTENT.TS - Server Actions cho Content collection
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Content from "@/models/Content";
import Roadmap from "@/models/Roadmap";
import { serializeDoc, createSlug } from "@/lib/utils";
import type { IContent } from "@/types";
import { customAlphabet } from "nanoid";

const nanoidSafe = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này");
  return session;
}

// Helper: kiểm tra quyền edit/delete content (chỉ owner)
async function canEditContent(contentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const content = await Content.findById(contentId, { ownerId: 1, ownerEmail: 1 }).lean() as {
    ownerId?: string; ownerEmail?: string;
  } | null;

  if (!content) return false;
  // Content cũ chưa có owner → cho phép edit (backward compat)
  if (!content.ownerId && !content.ownerEmail) return true;

  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email ?? "";
  if (content.ownerId && content.ownerId === userId) return true;
  if (content.ownerEmail && content.ownerEmail === userEmail) return true;
  return false;
}

// ──────────────────────────────────────────────
// GET: Lấy tất cả content (cho thư viện /content)
// ──────────────────────────────────────────────
export async function getAllContent() {
  await connectDB();
  const contents = await Content.find(
    {},
    { title: 1, slug: 1, description: 1, tags: 1, difficulty: 1, estimatedTime: 1, icon: 1, createdAt: 1 }
  )
    .sort({ createdAt: -1 })
    .lean();
  return serializeDoc(contents) as unknown as IContent[];
}

// ──────────────────────────────────────────────
// GET: Tìm kiếm content theo từ khoá (cho picker trong modal)
// ──────────────────────────────────────────────
export async function searchContent(query: string): Promise<IContent[]> {
  await connectDB();

  const trimmed = query.trim();
  if (!trimmed) {
    const results = await Content.find(
      {},
      { title: 1, slug: 1, description: 1, icon: 1, difficulty: 1, estimatedTime: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return serializeDoc(results) as unknown as IContent[];
  }

  const results = await Content.find(
    { $text: { $search: trimmed } },
    {
      score: { $meta: "textScore" },
      title: 1, slug: 1, description: 1, icon: 1, difficulty: 1, estimatedTime: 1,
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(15)
    .lean();

  if (results.length === 0) {
    const regex = new RegExp(trimmed, "i");
    const fallback = await Content.find(
      { $or: [{ title: regex }, { description: regex }, { tags: regex }] },
      { title: 1, slug: 1, description: 1, icon: 1, difficulty: 1, estimatedTime: 1 }
    )
      .limit(10)
      .lean();
    return serializeDoc(fallback) as unknown as IContent[];
  }

  return serializeDoc(results) as unknown as IContent[];
}

// ──────────────────────────────────────────────
// GET: Lấy 1 content theo slug
// ──────────────────────────────────────────────
export async function getContentBySlug(slug: string): Promise<IContent | null> {
  await connectDB();
  const content = await Content.findOne({ slug }).lean();
  if (!content) return null;
  return serializeDoc(content) as unknown as IContent;
}

// ──────────────────────────────────────────────
// GET: Tìm các roadmaps link tới content này (backlinks)
// ──────────────────────────────────────────────
export async function getLinkedRoadmaps(
  contentSlug: string
): Promise<Array<{ title: string; slug: string; nodeLabel: string }>> {
  await connectDB();

  const roadmaps = await Roadmap.find(
    { "nodes.data.contentSlug": contentSlug },
    { title: 1, slug: 1, "nodes.data.label": 1, "nodes.data.contentSlug": 1 }
  ).lean();

  type RoadmapResult = {
    title: string;
    slug: string;
    nodes: Array<{ data: { label: string; contentSlug?: string } }>;
  };

  const results: Array<{ title: string; slug: string; nodeLabel: string }> = [];
  for (const r of roadmaps as unknown as RoadmapResult[]) {
    const matchingNodes = r.nodes.filter((n) => n.data?.contentSlug === contentSlug);
    for (const node of matchingNodes) {
      results.push({ title: r.title, slug: r.slug, nodeLabel: node.data.label });
    }
  }
  return results;
}

// ──────────────────────────────────────────────
// CREATE: Tạo content mới
// ──────────────────────────────────────────────
export async function createContent(data: {
  title: string;
  description?: string;
  content?: string;
  icon?: string;
  difficulty?: IContent["difficulty"];
  estimatedTime?: string;
  tags?: string[];
}) {
  await connectDB();
  const session = await requireAuth();

  const userId = (session.user as { id?: string } | undefined)?.id;
  const userEmail = session.user?.email ?? "";

  const baseSlug = createSlug(data.title) || nanoidSafe();
  const existing = await Content.findOne({ slug: baseSlug });
  const slug = existing ? `${baseSlug}-${nanoidSafe()}` : baseSlug;

  const doc = await Content.create({
    title: data.title,
    slug,
    description: data.description ?? "",
    content: data.content ?? `# ${data.title}\n\nThêm nội dung ở đây...`,
    icon: data.icon ?? "📄",
    difficulty: data.difficulty,
    estimatedTime: data.estimatedTime,
    tags: data.tags ?? [],
    ownerId: userId,
    ownerEmail: userEmail,
  });

  revalidatePath("/content");
  return serializeDoc(doc.toJSON()) as unknown as IContent;
}

// ──────────────────────────────────────────────
// UPDATE: Cập nhật content
// ──────────────────────────────────────────────
export async function updateContent(
  id: string,
  data: Partial<Omit<IContent, "_id" | "id" | "createdAt" | "updatedAt">>
) {
  await connectDB();

  const hasPermission = await canEditContent(id);
  if (!hasPermission) throw new Error("Bạn không có quyền chỉnh sửa nội dung này");

  const doc = await Content.findByIdAndUpdate(
    id,
    { $set: { ...data, updatedAt: new Date() } },
    { new: true, runValidators: true }
  ).lean();

  if (!doc) throw new Error("Không tìm thấy content");

  const updated = doc as unknown as { slug: string };
  revalidatePath(`/content/${updated.slug}`);
  revalidatePath("/content");
  return { success: true };
}

// ──────────────────────────────────────────────
// DELETE: Xóa content
// ──────────────────────────────────────────────
export async function deleteContent(id: string): Promise<{ success: boolean }> {
  await connectDB();

  const hasPermission = await canEditContent(id);
  if (!hasPermission) throw new Error("Bạn không có quyền xóa nội dung này");

  const doc = await Content.findByIdAndDelete(id).lean() as { slug: string } | null;
  if (!doc) throw new Error("Không tìm thấy content");

  revalidatePath(`/content/${doc.slug}`);
  revalidatePath("/content");
  return { success: true };
}

// ──────────────────────────────────────────────
// GET: Lấy tất cả slugs (cho generateStaticParams & sitemap)
// ──────────────────────────────────────────────
export async function getAllContentSlugs(): Promise<
  Array<{ slug: string; updatedAt: string }>
> {
  await connectDB();
  const contents = await Content.find({}, { slug: 1, updatedAt: 1 }).lean();
  return serializeDoc(contents) as unknown as Array<{ slug: string; updatedAt: string }>;
}

// ──────────────────────────────────────────────
// GET: Kiểm tra quyền edit (dùng ở client)
// ──────────────────────────────────────────────
export async function checkContentEditPermission(contentId: string) {
  await connectDB();
  const can = await canEditContent(contentId);
  return { canEdit: can };
}
