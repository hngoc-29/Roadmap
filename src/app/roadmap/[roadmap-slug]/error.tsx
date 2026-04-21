"use client";
// APP/ROADMAP/[ROADMAP-SLUG]/ERROR.TSX
import { useEffect } from "react";
import Link from "next/link";

export default function RoadmapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Roadmap error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">🗺️</p>
      <h2 className="text-2xl font-bold mb-2">Không thể tải Roadmap</h2>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Roadmap này tạm thời không thể tải được. Có thể do lỗi kết nối database.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          🔄 Thử lại
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          ← Trang chủ
        </Link>
      </div>
    </div>
  );
}
