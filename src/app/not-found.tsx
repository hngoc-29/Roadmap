// ============================================================
// APP/NOT-FOUND.TSX - Custom 404 Page
// ============================================================
// ✅ Tối ưu SEO: 404 page không được index

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Trang không tìm thấy",
  description: "Trang bạn tìm kiếm không tồn tại.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="text-8xl mb-6">🗺️</div>
      <h1 className="text-4xl font-bold mb-3">404</h1>
      <h2 className="text-xl font-semibold mb-2">Trang không tìm thấy</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Lộ trình hoặc bài học bạn đang tìm kiếm không tồn tại, có thể đã bị
        xóa hoặc URL không chính xác.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          🏠 Về trang chủ
        </Link>
        <Link
          href="/builder/new"
          className="px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          ✏️ Tạo roadmap mới
        </Link>
      </div>
    </div>
  );
}
