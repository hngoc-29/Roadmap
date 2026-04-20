// ============================================================
// ACTIONS/ROADMAP.TS - Next.js Server Actions
// ============================================================
// Server Actions chạy hoàn toàn trên server → an toàn với DB
// Không cần tạo API routes riêng cho các thao tác CRUD đơn giản

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import { serializeDoc, createSlug } from "@/lib/utils";
import type { IRoadmap } from "@/types";
import { nanoid } from "nanoid";

// ──────────────────────────────────────────────
// GET: Lấy tất cả roadmaps đã publish (cho trang chủ)
// ──────────────────────────────────────────────
interface IRoadmapLean {
  title: string;
  slug: string;
  nodes: {
    data: {
      slug: string;
      content: string;
      label: string;
    };
  }[];
}
export async function getPublishedRoadmaps() {
  await connectDB();

  const roadmaps = await Roadmap.find(
    { isPublished: true },
    {
      title: 1,
      slug: 1,
      description: 1,
      author: 1,
      category: 1,
      tags: 1,
      coverImage: 1,
      viewCount: 1,
      createdAt: 1,
      updatedAt: 1,
      "nodes.id": 1,
      "nodes.data.label": 1,
      "nodes.data.slug": 1,
      "nodes.data.status": 1,
    }
  )
    .sort({ createdAt: -1 })
    .lean<IRoadmapLean>();

  return serializeDoc(roadmaps) as unknown as IRoadmap[];
}

// ──────────────────────────────────────────────
// GET: Lấy 1 roadmap theo slug (đầy đủ để render Builder)
// ──────────────────────────────────────────────
export async function getRoadmapBySlug(slug: string) {
  await connectDB();

  const roadmap = await Roadmap.findOne({ slug, isPublished: true }).lean();

  if (!roadmap) return null;
  return serializeDoc(roadmap) as unknown as IRoadmap;
}

// ──────────────────────────────────────────────
// GET: Lấy nội dung 1 Node theo slug (cho trang bài học)
// ──────────────────────────────────────────────
interface INodeLean {
  title: string;
  slug: string;
  nodes: {
    data: {
      slug: string;
      content: string;
      label: string;
      description?: string;
      tags?: string[];
    };
  }[];
}
export async function getNodeBySlug(roadmapSlug: string, nodeSlug: string) {
  await connectDB();

  const roadmap = await Roadmap.findOne(
    { slug: roadmapSlug, isPublished: true },
    {
      title: 1,
      slug: 1,
      nodes: { $elemMatch: { "data.slug": nodeSlug } },
    }
  ).lean<INodeLean>();

  if (!roadmap || !roadmap.nodes || roadmap.nodes.length === 0) return null;

  const node = (roadmap.nodes as Array<{ data: { content: string; label: string; description?: string; tags?: string[] } }>)[0];
  return {
    roadmapTitle: roadmap.title,
    roadmapSlug: roadmap.slug,
    node: serializeDoc(node),
  };
}

// ──────────────────────────────────────────────
// CREATE: Tạo Roadmap mới
// ──────────────────────────────────────────────
export async function createRoadmap(data: {
  title: string;
  description: string;
  authorName: string;
  category?: string;
}) {
  await connectDB();

  const slug = createSlug(data.title);

  const existing = await Roadmap.findOne({ slug });
  const finalSlug = existing ? `${slug}-${nanoid(4)}` : slug;

  const roadmap = await Roadmap.create({
    title: data.title,
    slug: finalSlug,
    description: data.description,
    author: { name: data.authorName },
    category: data.category,
    isPublished: false,
    nodes: [
      {
        id: nanoid(),
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

  revalidateTag("roadmaps");
  return serializeDoc(roadmap.toJSON()) as unknown as IRoadmap;
}

// ──────────────────────────────────────────────
// UPDATE: Lưu toàn bộ graph (nodes + edges sau khi edit)
// ──────────────────────────────────────────────
export async function saveRoadmapGraph(
  roadmapId: string,
  data: { nodes: IRoadmap["nodes"]; edges: IRoadmap["edges"] }
) {
  await connectDB();

  const roadmap = await Roadmap.findByIdAndUpdate(
    roadmapId,
    {
      $set: {
        nodes: data.nodes,
        edges: data.edges,
        updatedAt: new Date(),
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!roadmap) throw new Error("Không tìm thấy roadmap");

  revalidatePath(`/roadmap/${(roadmap as unknown as { slug: string }).slug}`);
  return { success: true };
}

// ──────────────────────────────────────────────
// UPDATE: Cập nhật nội dung Markdown của 1 Node
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

  const updateFields: Record<string, string> = {};
  if (data.label !== undefined) updateFields["nodes.$.data.label"] = data.label;
  if (data.content !== undefined) updateFields["nodes.$.data.content"] = data.content;
  if (data.description !== undefined)
    updateFields["nodes.$.data.description"] = data.description;
  if (data.slug !== undefined) updateFields["nodes.$.data.slug"] = data.slug;
  if (data.contentSlug !== undefined)
    updateFields["nodes.$.data.contentSlug"] = data.contentSlug ?? "";

  const roadmap = await Roadmap.findOneAndUpdate(
    { _id: roadmapId, "nodes.id": nodeId },
    { $set: updateFields },
    { new: true, select: "slug nodes.data.slug" }
  ).lean();

  if (!roadmap) throw new Error("Không tìm thấy node");

  const r = roadmap as unknown as { slug: string; nodes: Array<{ data: { slug: string } }> };
  const updatedNode = r.nodes.find((n) => n.data.slug === data.slug);

  revalidatePath(`/roadmap/${r.slug}`);
  if (updatedNode) {
    revalidatePath(`/roadmap/${r.slug}/${updatedNode.data.slug}`);
  }

  return { success: true };
}

// ──────────────────────────────────────────────
// UPDATE: Tăng view count (dùng $inc để atomic)
// ──────────────────────────────────────────────
export async function incrementViewCount(roadmapSlug: string) {
  await connectDB();
  await Roadmap.updateOne(
    { slug: roadmapSlug },
    { $inc: { viewCount: 1 } }
  );
}

// ──────────────────────────────────────────────
// GET: Lấy tất cả slugs (cho generateStaticParams & Sitemap)
// ──────────────────────────────────────────────
export async function getAllRoadmapSlugs() {
  await connectDB();
  const roadmaps = await Roadmap.find(
    { isPublished: true },
    { slug: 1, "nodes.data.slug": 1, updatedAt: 1 }
  ).lean();

  return serializeDoc(roadmaps) as unknown as Array<{
    slug: string;
    nodes: Array<{ data: { slug: string } }>;
    updatedAt: string;
  }>;
}