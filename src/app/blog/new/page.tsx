// ============================================================
// APP/BLOG/NEW/PAGE.TSX - Viết bài mới (yêu cầu đăng nhập)
// ============================================================

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import CreatePostForm from "@/components/CreatePostForm";

export const metadata: Metadata = {
  title: "Viết bài mới",
  description: "Tạo bài viết blog mới",
  robots: { index: false },
};

export default async function BlogNewPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/blog/new");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Bài viết mới</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">✍️ Viết bài mới</h1>
          <p className="text-muted-foreground">
            Tạo bài viết blog với nội dung Markdown đầy đủ.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-card shadow-sm">
          <CreatePostForm />
        </div>
      </div>
    </div>
  );
}
