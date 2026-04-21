// ============================================================
// APP/BUILDER/NEW/PAGE.TSX - Tạo Roadmap mới (yêu cầu đăng nhập)
// ============================================================

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import CreateRoadmapForm from "@/components/CreateRoadmapForm";

export const metadata: Metadata = {
  title: "Tạo Roadmap mới",
  description: "Tạo lộ trình học tập trực quan của riêng bạn",
  robots: { index: false },
};

export default async function BuilderNewPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/builder/new");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Tạo Roadmap mới</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">🚀 Tạo Roadmap mới</h1>
          <p className="text-muted-foreground">
            Điền thông tin cơ bản. Sau khi tạo, bạn có thể thêm nodes và nội dung trong editor trực quan.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6 bg-card shadow-sm">
          <CreateRoadmapForm />
        </div>

        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="text-sm font-semibold mb-3">💡 Mẹo tạo Roadmap hiệu quả</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Tiêu đề rõ ràng</strong> – VD: &quot;Lộ trình học Backend Node.js 2025&quot;</li>
            <li><strong className="text-foreground">Mô tả đầy đủ</strong> – Google dùng mô tả này cho snippet tìm kiếm</li>
            <li><strong className="text-foreground">Chọn danh mục</strong> – Giúp người dùng tìm roadmap theo lĩnh vực</li>
            <li><strong className="text-foreground">Bắt đầu từ ít nodes</strong> – 5–10 nodes là vừa đủ, sau đó thêm dần</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
