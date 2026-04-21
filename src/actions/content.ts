// ============================================================
// ACTIONS/CONTENT.TS - Server Actions cho Content collection
// ============================================================
// Content tách biệt với Roadmap để:
// - Nhiều roadmap link tới cùng 1 content
// - URL /content/[slug] ngắn gọn, dễ chia sẻ
// - Quản lý tập trung, không duplicate

"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Content from "@/models/Content";
import Roadmap from "@/models/Roadmap";
import { serializeDoc, createSlug } from "@/lib/utils";
import type { IContent } from "@/types";
import { customAlphabet } from "nanoid";

// ✅ FIX: Chỉ dùng ký tự lowercase alphanumeric để slug luôn pass regex
const nanoidSafe = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

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
    // Trả về 10 content mới nhất khi không có query
    const results = await Content.find(
      {},
      { title: 1, slug: 1, description: 1, icon: 1, difficulty: 1, estimatedTime: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return serializeDoc(results) as unknown as IContent[];
  }

  // Full-text search (dùng index đã tạo)
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

  // Fallback: regex search nếu text search không có kết quả
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
    {
      // ✅ FIX: Bỏ isPublished filter
      "nodes.data.contentSlug": contentSlug,
    },
    { title: 1, slug: 1, "nodes.data.label": 1, "nodes.data.contentSlug": 1 }
  ).lean();

  type RoadmapResult = {
    title: string;
    slug: string;
    nodes: Array<{ data: { label: string; contentSlug?: string } }>;
  };

  const results: Array<{ title: string; slug: string; nodeLabel: string }> = [];
  for (const r of roadmaps as unknown as RoadmapResult[]) {
    const matchingNodes = r.nodes.filter(
      (n) => n.data?.contentSlug === contentSlug
    );
    for (const node of matchingNodes) {
      results.push({
        title: r.title,
        slug: r.slug,
        nodeLabel: node.data.label,
      });
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
  });

  // revalidateTag("contents"); // ✅ Removed: not needed with force-dynamic
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
// DELETE: Xóa content
// ──────────────────────────────────────────────
export async function deleteContent(id: string): Promise<{ success: boolean }> {
  await connectDB();
  const doc = await Content.findByIdAndDelete(id).lean() as { slug: string } | null;
  if (!doc) throw new Error("Không tìm thấy content");

  revalidatePath(`/content/${doc.slug}`);
  revalidatePath("/content");
  return { success: true };
}
