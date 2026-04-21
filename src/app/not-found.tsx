// APP/NOT-FOUND.TSX - Custom 404 Page
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 – Không tìm thấy trang",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl mb-6">🗺️</p>
      <h1 className="text-4xl font-bold tracking-tight mb-3">404</h1>
      <p className="text-xl text-muted-foreground mb-2">
        Trang không tồn tại
      </p>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        Roadmap, bài học hoặc bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          🏠 Về trang chủ
        </Link>
        <Link
          href="/blog"
          className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          ✍️ Xem Blog
        </Link>
      </div>
    </div>
  );
}
