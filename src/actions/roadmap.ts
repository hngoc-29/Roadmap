// ============================================================
// ACTIONS/ROADMAP.TS - Next.js Server Actions (với Auth)
// ============================================================

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import { serializeDoc, createSlug } from "@/lib/utils";
import type { IRoadmap } from "@/types";
import { customAlphabet } from "nanoid";

// ✅ FIX: Chỉ dùng ký tự lowercase alphanumeric để slug luôn pass regex
const nanoidSafe = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

// Helper: lấy session hoặc throw
async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
  }
  return session;
}

// Helper: kiểm tra quyền edit roadmap
async function canEditRoadmap(roadmapId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const roadmap = await Roadmap.findById(roadmapId, {
    ownerId: 1,
    ownerEmail: 1,
    collaborators: 1,
    allowPublicEdit: 1,
  }).lean() as { ownerId?: string; ownerEmail?: string; collaborators?: string[]; allowPublicEdit?: boolean } | null;

  if (!roadmap) return false;
  if (roadmap.allowPublicEdit) return true;

  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email ?? "";

  if (roadmap.ownerId && roadmap.ownerId === userId) return true;
  if (roadmap.ownerEmail && roadmap.ownerEmail === userEmail) return true;
  if (roadmap.collaborators?.includes(userEmail)) return true;

  return false;
}

// ──────────────────────────────────────────────
// GET: Lấy tất cả roadmaps (public)
// ──────────────────────────────────────────────
interface IRoadmapLean {
  title: string;
  slug: string;
  nodes: { data: { slug: string; content: string; label: string } }[];
}

export async function getPublishedRoadmaps() {
  await connectDB();
  const roadmaps = await Roadmap.find(
    { isPublished: true }, // 🔐 Chỉ trả về roadmap đã publish
    {
      title: 1, slug: 1, description: 1, author: 1, category: 1, tags: 1,
      coverImage: 1, viewCount: 1, isPublished: 1, createdAt: 1, updatedAt: 1,
      "nodes.id": 1, "nodes.data.label": 1, "nodes.data.slug": 1, "nodes.data.status": 1,
    }
  ).sort({ createdAt: -1 }).lean<IRoadmapLean>();

  return serializeDoc(roadmaps) as unknown as IRoadmap[];
}

// ──────────────────────────────────────────────
// GET: Lấy roadmaps của user hiện tại
// ──────────────────────────────────────────────
export async function getMyRoadmaps() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  await connectDB();
  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email ?? "";

  const roadmaps = await Roadmap.find(
    {
      $or: [
        { ownerId: userId },
        { ownerEmail: userEmail },
        { collaborators: userEmail },
      ],
    },
    {
      title: 1, slug: 1, description: 1, author: 1, category: 1,
      isPublished: 1, allowPublicEdit: 1, collaborators: 1,
      createdAt: 1, "nodes.id": 1,
    }
  ).sort({ createdAt: -1 }).lean<IRoadmapLean>();

  return serializeDoc(roadmaps) as unknown as IRoadmap[];
}

// ──────────────────────────────────────────────
// GET: Lấy 1 roadmap theo slug
// ──────────────────────────────────────────────
export async function getRoadmapBySlug(slug: string) {
  await connectDB();
  const roadmap = await Roadmap.findOne({ slug }).lean();
  if (!roadmap) return null;
  return serializeDoc(roadmap) as unknown as IRoadmap;
}

// ──────────────────────────────────────────────
// GET: Lấy nội dung 1 Node theo slug
// ──────────────────────────────────────────────
interface INodeLean {
  title: string;
  slug: string;
  nodes: { data: { slug: string; content: string; label: string; description?: string; tags?: string[] } }[];
}

export async function getNodeBySlug(roadmapSlug: string, nodeSlug: string) {
  await connectDB();
  const roadmap = await Roadmap.findOne(
    { slug: roadmapSlug },
    { title: 1, slug: 1, nodes: { $elemMatch: { "data.slug": nodeSlug } } }
  ).lean<INodeLean>();

  if (!roadmap || !roadmap.nodes?.length) return null;

  const node = (roadmap.nodes as Array<{ data: { content: string; label: string; description?: string; tags?: string[] } }>)[0];
  return {
    roadmapTitle: roadmap.title,
    roadmapSlug: roadmap.slug,
    node: serializeDoc(node),
  };
}

// ──────────────────────────────────────────────
// CREATE: Tạo Roadmap mới (yêu cầu đăng nhập)
// ──────────────────────────────────────────────
export async function createRoadmap(data: {
  title: string;
  description: string;
  authorName: string;
  category?: string;
}) {
  const session = await requireAuth();
  await connectDB();

  const baseSlug = createSlug(data.title) || nanoidSafe();
  const existing = await Roadmap.findOne({ slug: baseSlug });
  const finalSlug = existing ? `${baseSlug}-${nanoidSafe()}` : baseSlug;

  const userId = (session.user as { id?: string } | undefined)?.id;
  const userEmail = session.user?.email ?? "";
  const userImage = session.user?.image ?? undefined;

  const roadmap = await Roadmap.create({
    title: data.title,
    slug: finalSlug,
    description: data.description,
    author: { name: data.authorName, avatar: userImage },
    ownerId: userId,
    ownerEmail: userEmail,
    collaborators: [],
    allowPublicEdit: false,
    category: data.category,
    isPublished: false,
    nodes: [
      {
        id: nanoidSafe(),
        type: "roadmapNode",
        position: { x: 250, y: 100 },
        data: {
          label: "Bước khởi đầu",
          slug: "buoc-khoi-dau",
          content: "# Bước khởi đầu\n\nThêm nội dung bài học ở đây...",
          description: "Điểm bắt đầu của lộ trình học tập",
          status: "available",
          icon: "🚀",
        },
      },
    ],
    edges: [],
  });

  return serializeDoc(roadmap.toJSON()) as unknown as IRoadmap;
}

// ──────────────────────────────────────────────
// UPDATE: Lưu graph (nodes + edges)
// ──────────────────────────────────────────────
export async function saveRoadmapGraph(
  roadmapId: string,
  data: { nodes: IRoadmap["nodes"]; edges: IRoadmap["edges"] }
) {
  await connectDB();

  const hasPermission = await canEditRoadmap(roadmapId);
  if (!hasPermission) {
    throw new Error("Bạn không có quyền chỉnh sửa roadmap này");
  }

  const roadmap = await Roadmap.findByIdAndUpdate(
    roadmapId,
    { $set: { nodes: data.nodes, edges: data.edges, updatedAt: new Date() } },
    { new: true, runValidators: true }
  ).lean();

  if (!roadmap) throw new Error("Không tìm thấy roadmap");

  revalidatePath(`/roadmap/${(roadmap as unknown as { slug: string }).slug}`);
  return { success: true };
}

// ──────────────────────────────────────────────
// UPDATE: Cập nhật nội dung 1 Node
// ──────────────────────────────────────────────
export async function updateNodeContent(
  roadmapId: string,
  nodeId: string,
  data: {
    label?: string;
    content?: string;
    description?: string;
    slug?: string;
    contentSlug?: string | undefined;
  }
) {
  await connectDB();

  const hasPermission = await canEditRoadmap(roadmapId);
  if (!hasPermission) {
    throw new Error("Bạn không có quyền chỉnh sửa roadmap này");
  }

  const updateFields: Record<string, string> = {};
  if (data.label !== undefined) updateFields["nodes.$.data.label"] = data.label;
  if (data.content !== undefined) updateFields["nodes.$.data.content"] = data.content;
  if (data.description !== undefined) updateFields["nodes.$.data.description"] = data.description;
  if (data.slug !== undefined) updateFields["nodes.$.data.slug"] = data.slug;
  if (data.contentSlug !== undefined) updateFields["nodes.$.data.contentSlug"] = data.contentSlug ?? "";

  const roadmap = await Roadmap.findOneAndUpdate(
    { _id: roadmapId, "nodes.id": nodeId },
    { $set: updateFields },
    { new: true, select: "slug nodes.data.slug" }
  ).lean();

  if (!roadmap) throw new Error("Không tìm thấy node");

  const r = roadmap as unknown as { slug: string; nodes: Array<{ data: { slug: string } }> };
  const updatedNode = r.nodes.find((n) => n.data.slug === data.slug);

  revalidatePath(`/roadmap/${r.slug}`);
  if (updatedNode) revalidatePath(`/roadmap/${r.slug}/${updatedNode.data.slug}`);

  return { success: true };
}

// ──────────────────────────────────────────────
// UPDATE: Tăng view count
// ──────────────────────────────────────────────
export async function incrementViewCount(roadmapSlug: string) {
  await connectDB();
  await Roadmap.updateOne({ slug: roadmapSlug }, { $inc: { viewCount: 1 } });
}

// ──────────────────────────────────────────────
// UPDATE: Toggle publish status
// ──────────────────────────────────────────────
export async function togglePublishRoadmap(roadmapId: string, publish: boolean) {
  await connectDB();

  const hasPermission = await canEditRoadmap(roadmapId);
  if (!hasPermission) throw new Error("Bạn không có quyền thực hiện thao tác này");

  const roadmap = await Roadmap.findByIdAndUpdate(
    roadmapId,
    { $set: { isPublished: publish, updatedAt: new Date() } },
    { new: true, select: "slug isPublished" }
  ).lean();

  if (!roadmap) throw new Error("Không tìm thấy roadmap");

  const r = roadmap as unknown as { slug: string; isPublished: boolean };
  revalidatePath(`/roadmap/${r.slug}`);
  revalidatePath("/");
  // Bust sitemap cache khi trạng thái publish thay đổi
  revalidateTag("sitemap", "page");
  revalidateTag("posts", "page");

  return { success: true, isPublished: r.isPublished };
}

// ──────────────────────────────────────────────
// UPDATE: Cài đặt chia sẻ (collaborators + public edit)
// ──────────────────────────────────────────────
export async function updateShareSettings(
  roadmapId: string,
  settings: {
    allowPublicEdit?: boolean;
    collaborators?: string[];
  }
) {
  await connectDB();

  // Chỉ owner mới được thay đổi share settings
  const session = await requireAuth();
  const userId = (session.user as { id?: string } | undefined)?.id;
  const userEmail = session.user?.email ?? "";

  const roadmap = await Roadmap.findById(roadmapId, { ownerId: 1, ownerEmail: 1 }).lean() as {
    ownerId?: string; ownerEmail?: string
  } | null;
  if (!roadmap) throw new Error("Không tìm thấy roadmap");

  const isOwner =
    (roadmap.ownerId && roadmap.ownerId === userId) ||
    (roadmap.ownerEmail && roadmap.ownerEmail === userEmail);

  if (!isOwner) throw new Error("Chỉ chủ sở hữu mới có thể thay đổi cài đặt chia sẻ");

  const updateData: Record<string, unknown> = {};
  if (settings.allowPublicEdit !== undefined) updateData.allowPublicEdit = settings.allowPublicEdit;
  if (settings.collaborators !== undefined) {
    updateData.collaborators = settings.collaborators
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }

  await Roadmap.findByIdAndUpdate(roadmapId, { $set: updateData });
  return { success: true };
}

// ──────────────────────────────────────────────
// GET: Kiểm tra quyền edit (dùng ở client)
// ──────────────────────────────────────────────
export async function checkEditPermission(roadmapId: string) {
  await connectDB();
  const can = await canEditRoadmap(roadmapId);
  return { canEdit: can };
}

// ──────────────────────────────────────────────
// DELETE: Xóa Roadmap (chỉ owner)
// ──────────────────────────────────────────────
export async function deleteRoadmap(roadmapId: string): Promise<{ success: boolean }> {
  await connectDB();

  const session = await requireAuth();
  const userId = (session.user as { id?: string } | undefined)?.id;
  const userEmail = session.user?.email ?? "";

  const roadmap = await Roadmap.findById(roadmapId, { ownerId: 1, ownerEmail: 1, slug: 1 }).lean() as {
    ownerId?: string; ownerEmail?: string; slug: string;
  } | null;

  if (!roadmap) throw new Error("Không tìm thấy roadmap");

  const isOwner =
    (roadmap.ownerId && roadmap.ownerId === userId) ||
    (roadmap.ownerEmail && roadmap.ownerEmail === userEmail);

  if (!isOwner) throw new Error("Chỉ chủ sở hữu mới có thể xóa roadmap");

  await Roadmap.findByIdAndDelete(roadmapId);

  revalidatePath("/");
  revalidatePath(`/roadmap/${roadmap.slug}`);
  revalidateTag("sitemap", "page");
  revalidateTag("posts", "page");
  return { success: true };
}

// ──────────────────────────────────────────────
// GET: Tất cả slugs (sitemap)
// ──────────────────────────────────────────────
export async function getAllRoadmapSlugs() {
  await connectDB();
  const roadmaps = await Roadmap.find({}, { slug: 1, "nodes.data.slug": 1, updatedAt: 1 }).lean();
  return serializeDoc(roadmaps) as unknown as Array<{
    slug: string;
    nodes: Array<{ data: { slug: string } }>;
    updatedAt: string;
  }>;
}
