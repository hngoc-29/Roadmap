"use client";
// APP/CONTENT/ERROR.TSX
import { useEffect } from "react";
import Link from "next/link";

export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Content error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">📚</p>
      <h2 className="text-2xl font-bold mb-2">Không thể tải nội dung</h2>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Nội dung này tạm thời không thể tải. Vui lòng thử lại.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          🔄 Thử lại
        </button>
        <Link
          href="/content"
          className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          ← Thư viện
        </Link>
      </div>
    </div>
  );
}
