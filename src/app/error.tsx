"use client";
// APP/ERROR.TSX - Global Error Boundary
// Next.js sẽ render component này khi có lỗi runtime

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (e.g. Sentry)
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-6">⚠️</p>
      <h1 className="text-3xl font-bold mb-3">Đã xảy ra lỗi</h1>
      <p className="text-muted-foreground mb-2 max-w-sm">
        Có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc quay về trang chủ.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono mb-6">
          Error ID: {error.digest}
        </p>
      )}
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
          🏠 Về trang chủ
        </Link>
      </div>
    </div>
  );
}
