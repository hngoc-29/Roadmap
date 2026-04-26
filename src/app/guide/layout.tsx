// ============================================================
// APP/GUIDE/LAYOUT.TSX — Layout dùng chung cho tất cả trang hướng dẫn
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { template: "%s | Hướng dẫn | Roadmap Builder", default: "Hướng dẫn | Roadmap Builder" },
  description: "Hướng dẫn chi tiết cách cài đặt và sử dụng Roadmap Builder.",
};

const NAV_ITEMS = [
  { href: "/guide",          icon: "🗺️", label: "Tổng quan" },
  { href: "/guide/install",  icon: "⚙️", label: "Cài đặt & Cấu hình" },
  { href: "/guide/roadmap",  icon: "🛤️", label: "Tạo Roadmap" },
  { href: "/guide/blog",     icon: "✍️", label: "Viết Blog" },
  { href: "/guide/content",  icon: "📚", label: "Quản lý Nội dung" },
  { href: "/guide/notes",    icon: "📝", label: "Ghi chú & Quyền riêng tư" },
  { href: "/guide/mdx",      icon: "📄", label: "Viết MDX" },
];

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero strip */}
      <div className="border-b bg-gradient-to-b from-muted/50 to-background py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/guide" className="text-4xl hover:scale-110 transition-transform">📖</Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hướng dẫn sử dụng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tìm hiểu đầy đủ các tính năng của Roadmap Builder
            </p>
          </div>
        </div>
      </div>

      {/* Mobile nav — full width, outside the flex row */}
      <div className="lg:hidden max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 flex-wrap">
          {NAV_ITEMS.map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors">
              {icon} {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Mục lục
            </p>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map(({ href, icon, label }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Bắt đầu ngay:</p>
              <Link href="/builder/new"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                🚀 Tạo Roadmap đầu tiên
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
