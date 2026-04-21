// ============================================================
// ACTIONS/POST.TS - Server Actions cho Blog Posts
// ============================================================

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { serializeDoc, createSlug } from "@/lib/utils";
import type { IPost } from "@/types";
import { nanoid } from "nanoid";

// ──────────────────────────────────────────────
// GET: Tất cả bài viết đã publish (cho trang /blog)
// ──────────────────────────────────────────────
export async function getAllPosts(): Promise<IPost[]> {
  await connectDB();
  const posts = await Post.find(
    { }, // ✅ FIX: Hiển thị cả draft
    {
      title: 1, slug: 1, description: 1,
      author: 1, category: 1, tags: 1,
      coverImage: 1, viewCount: 1,
      publishedAt: 1, createdAt: 1, updatedAt: 1,
    }
  )
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  return serializeDoc(posts) as unknown as IPost[];
}

// ──────────────────────────────────────────────
// GET: 1 bài viết theo slug
// ──────────────────────────────────────────────
export async function getPostBySlug(slug: string): Promise<IPost | null> {
  await connectDB();
  // ✅ FIX: Bỏ isPublished filter → post draft vừa tạo load được
  const post = await Post.findOne({ slug }).lean();
  if (!post) return null;
  return serializeDoc(post) as unknown as IPost;
}

// ──────────────────────────────────────────────
// GET: Tất cả slugs (cho generateStaticParams + sitemap)
// ──────────────────────────────────────────────
export async function getAllPostSlugs(): Promise<
  Array<{ slug: string; updatedAt: string }>
> {
  await connectDB();
  const posts = await Post.find(
    {}, // ✅ FIX: Tất cả slugs kể cả draft
    { slug: 1, updatedAt: 1 }
  ).lean();
  return serializeDoc(posts) as unknown as Array<{
    slug: string;
    updatedAt: string;
  }>;
}

// ──────────────────────────────────────────────
// GET: Bài viết theo category
// ──────────────────────────────────────────────
export async function getPostsByCategory(category: string): Promise<IPost[]> {
  await connectDB();
  const posts = await Post.find(
    { category }, // ✅ FIX
    { title: 1, slug: 1, description: 1, author: 1, tags: 1, coverImage: 1, publishedAt: 1 }
  )
    .sort({ publishedAt: -1 })
    .lean();
  return serializeDoc(posts) as unknown as IPost[];
}

// ──────────────────────────────────────────────
// GET: Tăng view count
// ──────────────────────────────────────────────
export async function incrementPostViewCount(slug: string) {
  await connectDB();
  await Post.updateOne({ slug }, { $inc: { viewCount: 1 } });
}

// ──────────────────────────────────────────────
// CREATE: Tạo bài viết mới
// ──────────────────────────────────────────────
export async function createPost(data: {
  title: string;
  description?: string;
  content?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  relatedRoadmaps?: string[];
  isPublished?: boolean;
}): Promise<IPost> {
  await connectDB();

  const baseSlug = createSlug(data.title);
  const existing = await Post.findOne({ slug: baseSlug });
  const slug = existing ? `${baseSlug}-${nanoid(4)}` : baseSlug;

  const doc = await Post.create({
    title: data.title,
    slug,
    description: data.description ?? "",
    content:
      data.content ??
      `# ${data.title}\n\nThêm nội dung bài viết ở đây...\n\n## Giới thiệu\n\n...\n\n## Nội dung chính\n\n...\n\n## Kết luận\n\n...`,
    author: { name: data.authorName ?? "Roadmap Builder" },
    category: data.category,
    tags: data.tags ?? [],
    coverImage: data.coverImage,
    relatedRoadmaps: data.relatedRoadmaps ?? [],
    isPublished: data.isPublished ?? false,
    publishedAt: data.isPublished ? new Date() : undefined,
    viewCount: 0,
  });

  revalidateTag("posts");
  revalidatePath("/blog");
  return serializeDoc(doc.toJSON()) as unknown as IPost;
}

// ──────────────────────────────────────────────
// UPDATE: Cập nhật bài viết
// ──────────────────────────────────────────────
export async function updatePost(
  id: string,
  data: Partial<Omit<IPost, "_id" | "id" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean }> {
  await connectDB();

  // Nếu publish lần đầu thì set publishedAt
  const existing = await Post.findById(id).lean() as any;
  const publishedAt =
    data.isPublished && existing && !existing.isPublished
      ? new Date()
      : undefined;

  const updateData = {
    ...data,
    ...(publishedAt ? { publishedAt } : {}),
    updatedAt: new Date(),
  };

  const doc = await Post.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!doc) throw new Error("Không tìm thấy bài viết");

  const updated = doc as unknown as { slug: string };
  revalidatePath(`/blog/${updated.slug}`);
  revalidatePath("/blog");
  revalidateTag("posts");

  return { success: true };
}

// ──────────────────────────────────────────────
// DELETE: Xóa bài viết
// ──────────────────────────────────────────────
export async function deletePost(id: string): Promise<{ success: boolean }> {
  await connectDB();
  const doc = await Post.findByIdAndDelete(id).lean() as any;
  if (!doc) throw new Error("Không tìm thấy bài viết");

  revalidatePath("/blog");
  revalidateTag("posts");
  return { success: true };
}

// ──────────────────────────────────────────────
// GET: Draft posts (cho admin xem trước khi publish)
// ──────────────────────────────────────────────
export async function getDraftPosts(): Promise<IPost[]> {
  await connectDB();
  const posts = await Post.find(
    { isPublished: false },
    { title: 1, slug: 1, description: 1, author: 1, createdAt: 1, updatedAt: 1 }
  )
    .sort({ updatedAt: -1 })
    .lean();
  return serializeDoc(posts) as unknown as IPost[];
}

// ──────────────────────────────────────────────
// GET: Tìm kiếm blog posts (cho LibraryPicker trong NodeEditModal)
// ──────────────────────────────────────────────
export async function searchPosts(query: string): Promise<IPost[]> {
  await connectDB();
  const trimmed = query.trim();

  if (!trimmed) {
    const posts = await Post.find(
      {},
      { title: 1, slug: 1, description: 1, isPublished: 1, category: 1, tags: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return serializeDoc(posts) as unknown as IPost[];
  }

  const regex = new RegExp(trimmed, "i");
  const posts = await Post.find(
    { $or: [{ title: regex }, { description: regex }, { tags: regex }, { category: regex }] },
    { title: 1, slug: 1, description: 1, isPublished: 1, category: 1, tags: 1 }
  )
    .limit(15)
    .lean();
  return serializeDoc(posts) as unknown as IPost[];
}
