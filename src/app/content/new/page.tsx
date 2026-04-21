// ============================================================
// APP/CONTENT/NEW/PAGE.TSX - Tạo Content Library item
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import CreateContentForm from "@/components/CreateContentForm";

export const metadata: Metadata = {
  title: "Thêm nội dung mới",
  description: "Tạo bài học độc lập có thể dùng trong nhiều roadmap",
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
          <span className="text-foreground font-medium">Thêm mới</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">📄 Thêm nội dung mới</h1>
          <p className="text-muted-foreground">
            Tạo bài học độc lập với nội dung Markdown. Sau khi tạo, bạn có thể gắn vào
            bất kỳ node nào trong Roadmap qua tab{" "}
            <strong>Nội dung → Dùng Content thư viện</strong>.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-card shadow-sm">
          <CreateContentForm />
        </div>
      </div>
    </div>
  );
}
