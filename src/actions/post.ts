// ============================================================
// ACTIONS/POST.TS - Server Actions cho Blog Posts
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { serializeDoc, createSlug } from "@/lib/utils";
import type { IPost } from "@/types";
import { customAlphabet } from "nanoid";

// 2705 FIX: Ch1ec9 d00f9ng k00fd t1ef1 lowercase alphanumeric 01111ec3 slug lu00f4n pass regex
const nanoidSafe = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này");
  return session;
}

// ──────────────────────────────────────────────
// GET: Tất cả bài viết đã publish (cho trang /blog)
// ──────────────────────────────────────────────
export async function getAllPosts(): Promise<IPost[]> {
  await connectDB();
  const posts = await Post.find(
    {}, // ✅ FIX: hiển thị cả draft
    {
      title: 1, slug: 1, description: 1,
      author: 1, category: 1, tags: 1,
      coverImage: 1, viewCount: 1,
      isPublished: 1,
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
  const post = await Post.findOne({ slug }).lean(); // ✅ FIX: draft load được
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
    {}, // ✅ FIX: hiển thị cả draft
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
  await connectDB()
  await requireAuth();

  const baseSlug = createSlug(data.title) || nanoidSafe();
  const existing = await Post.findOne({ slug: baseSlug });
  const slug = existing ? `${baseSlug}-${nanoidSafe()}` : baseSlug;

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

  // revalidateTag("posts"); // ✅ Removed: not needed with force-dynamic
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
  await requireAuth();
  // Nếu publish lần đầu thì set publishedAt
  const existing = await Post.findById(id).lean() as { isPublished?: boolean } | null;
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
  // revalidateTag("posts"); // ✅ Removed: not needed with force-dynamic

  return { success: true };
}

// ──────────────────────────────────────────────
// DELETE: Xóa bài viết
// ──────────────────────────────────────────────
export async function deletePost(id: string): Promise<{ success: boolean }> {
  await requireAuth();
  await connectDB();
  const doc = await Post.findByIdAndDelete(id).lean() as { slug: string } | null;
  if (!doc) throw new Error("Không tìm thấy bài viết");

  revalidatePath("/blog");
  // revalidateTag("posts"); // ✅ Removed: not needed with force-dynamic
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
