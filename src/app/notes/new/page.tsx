// ============================================================
// APP/NOTES/NEW/PAGE.TSX
// ============================================================
// Trang tạo ghi chú mới

import type { Metadata } from "next";
import Link from "next/link";
import CreateNoteForm from "@/components/CreateNoteForm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tạo ghi chú mới",
  robots: { index: false },
};

export default async function NewNotePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/notes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Về danh sách ghi chú
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Tạo mới</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">📝 Tạo ghi chú mới</h1>
          <p className="text-muted-foreground text-sm">
            Ghi lại ý tưởng, tài liệu hoặc công thức nhanh.
          </p>
        </div>
        <CreateNoteForm />
      </div>
    </div>
  );
}
