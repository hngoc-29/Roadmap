// ============================================================
// APP/CONTENT/NEW/PAGE.TSX - Trang tạo Content mới
// ============================================================
// Content = bài học độc lập, có thể link vào nhiều nodes/roadmaps

import type { Metadata } from "next";
import Link from "next/link";
import CreateContentForm from "@/components/CreateContentForm";

export const metadata: Metadata = {
  title: "Tạo nội dung mới",
  description: "Tạo bài học độc lập cho thư viện nội dung",
  robots: { index: false },
};

export default function ContentNewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/content" className="hover:text-foreground transition-colors">Thư viện nội dung</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Tạo mới</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">📄 Tạo nội dung mới</h1>
          <p className="text-muted-foreground">
            Tạo bài học độc lập với nội dung Markdown đầy đủ.
            Content này có thể được gắn vào nhiều node trong các roadmap khác nhau.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-card shadow-sm">
          <CreateContentForm />
        </div>

        {/* Tips */}
        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground mb-3">💡 Content vs Node content</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-foreground mb-1">📄 Content Library</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>URL: /content/[slug] — dễ chia sẻ</li>
                <li>Tái sử dụng nhiều roadmap</li>
                <li>Quản lý tập trung</li>
                <li>Thích hợp bài học dài, kỹ thuật</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">📚 Node inline content</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>URL: /roadmap/[r]/[node-slug]</li>
                <li>Gắn riêng với 1 node</li>
                <li>Viết trực tiếp trong editor</li>
                <li>Thích hợp nội dung ngắn, cụ thể</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
