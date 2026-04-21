// ============================================================
// APP/AUTH/SIGNIN/PAGE.TSX - Trang đăng nhập
// ============================================================

"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <span>🗺️</span>
            <span>Roadmap Builder</span>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">
            Đăng nhập để tạo và quản lý roadmap của bạn
          </p>
        </div>

        {/* Card */}
        <div className="border border-border rounded-2xl p-8 bg-card shadow-sm">
          <h1 className="text-xl font-semibold mb-6 text-center">Đăng nhập</h1>

          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-xl font-medium transition-colors"
          >
            {/* GitHub SVG icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Đăng nhập với GitHub
          </button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <Link href="/" className="underline hover:text-foreground">
              điều khoản sử dụng
            </Link>{" "}
            của chúng tôi.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Quay về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
