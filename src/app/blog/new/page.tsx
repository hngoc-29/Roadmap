// ============================================================
// APP/BLOG/NEW/PAGE.TSX - Trang tạo bài viết mới
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import CreatePostForm from "@/components/CreatePostForm";

export const metadata: Metadata = {
  title: "Viết bài mới",
  description: "Tạo bài viết blog mới cho hệ thống Roadmap Builder",
  robots: { index: false },
};

export default function BlogNewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Bài viết mới</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            ✍️ Viết bài mới
          </h1>
          <p className="text-muted-foreground">
            Tạo bài viết blog với nội dung Markdown đầy đủ. Bài viết có thể
            được gắn vào nhiều roadmap khác nhau để tái sử dụng nội dung.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-card shadow-sm">
          <CreatePostForm />
        </div>

        {/* Tips */}
        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="text-sm font-semibold mb-3">
            🔗 Tại sao Blog tốt hơn Content Library?
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">✍️ Blog posts</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>URL: /blog/[slug] – SEO tốt</li>
                <li>Có tác giả, ngày đăng, ảnh bìa</li>
                <li>Gắn vào nhiều roadmaps</li>
                <li>Hiển thị dạng danh sách bài viết</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">📚 Content Library</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>URL: /content/[slug]</li>
                <li>Nội dung kỹ thuật thuần túy</li>
                <li>Link vào node cụ thể</li>
                <li>Không có tác giả/ngày đăng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
