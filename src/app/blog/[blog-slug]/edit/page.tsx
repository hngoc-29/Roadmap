// ============================================================
// APP/BLOG/[BLOG-SLUG]/EDIT/PAGE.TSX
// ============================================================
// Trang chỉnh sửa bài viết blog

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { getPostBySlug } from "@/actions/post";
import EditPostForm from "@/components/EditPostForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "blog-slug": string }>;
}): Promise<Metadata> {
  const { "blog-slug": slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };
  return { title: `Chỉnh sửa: ${post.title}`, robots: { index: false } };
}

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ "blog-slug": string }>;
}) {
  const { "blog-slug": slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/blog/${slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay lại bài viết
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Chỉnh sửa</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">✏️ Chỉnh sửa bài viết</h1>
          <p className="text-muted-foreground text-sm">
            Cập nhật nội dung và metadata của bài viết
          </p>
        </div>

        <EditPostForm post={post} />
      </div>
    </div>
  );
}
