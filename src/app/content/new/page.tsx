// ============================================================
// APP/CONTENT/NEW/PAGE.TSX - Thêm nội dung mới (yêu cầu đăng nhập)
// ============================================================

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import CreateContentForm from "@/components/CreateContentForm";

export const metadata: Metadata = {
  title: "Thêm nội dung mới",
  description: "Tạo bài học độc lập có thể dùng trong nhiều roadmap",
  robots: { index: false },
};

export default async function ContentNewPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/content/new");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
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
            bất kỳ node nào trong Roadmap.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-card shadow-sm">
          <CreateContentForm />
        </div>
      </div>
    </div>
  );
}
