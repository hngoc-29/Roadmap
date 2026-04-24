// ============================================================
// APP/GUIDE/PAGE.TSX — Tổng quan & FAQ
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Card, InfoBox, PageNav } from "./_components";
import type { BadgeColor } from "./_components";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Tổng quan về Roadmap Builder — nền tảng tạo, chia sẻ và khám phá lộ trình học tập.",
};

const GUIDE_SECTIONS = [
  { href: "/guide/install",  icon: "⚙️", title: "Cài đặt & Cấu hình",     color: "orange"  as BadgeColor, desc: "Cài đặt môi trường, biến môi trường, chạy local." },
  { href: "/guide/roadmap",  icon: "🛤️", title: "Tạo Roadmap",              color: "blue"   as BadgeColor, desc: "Tạo sơ đồ kéo thả, thêm node, kết nối và xuất bản." },
  { href: "/guide/blog",     icon: "✍️", title: "Viết Blog",                 color: "green"  as BadgeColor, desc: "Bài viết, tutorial, hướng dẫn với định dạng MDX." },
  { href: "/guide/content",  icon: "📚", title: "Quản lý Nội dung",          color: "purple" as BadgeColor, desc: "Thư viện tài liệu gắn liền với node roadmap." },
  { href: "/guide/notes",    icon: "📝", title: "Ghi chú & Quyền riêng tư", color: "yellow" as BadgeColor, desc: "Ghi chú cá nhân riêng tư và kiểm soát truy cập." },
  { href: "/guide/mdx",      icon: "📄", title: "Viết MDX",                  color: "pink"   as BadgeColor, desc: "Cú pháp Markdown nâng cao, code block, bảng." },
];

export default function GuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-2">🗺️ Tổng quan</h2>
        <p className="text-muted-foreground mb-6">
          Roadmap Builder là nền tảng giúp bạn tạo, chia sẻ và khám phá các lộ trình học tập
          trực quan. Chọn chủ đề bạn muốn tìm hiểu:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GUIDE_SECTIONS.map(({ href, icon, title, color, desc }) => (
            <Link key={href} href={href}>
              <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-semibold">{title}</span>
                  <Tag label={color} color={color} />
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">🚀 Bắt đầu nhanh</h3>
        <div className="space-y-0 border-l-2 border-border ml-3">
          {[
            { n: 1, title: "Đăng nhập GitHub", desc: <span>Truy cập <Link href="/auth/signin" className="text-primary hover:underline">/auth/signin</Link>.</span> },
            { n: 2, title: "Cài đặt môi trường", desc: <span>Xem <Link href="/guide/install" className="text-primary hover:underline">Cài đặt & Cấu hình</Link> để thiết lập MongoDB và OAuth.</span> },
            { n: 3, title: "Tạo Roadmap đầu tiên", desc: <span>Nhấn <Link href="/builder/new" className="text-primary hover:underline">➕ Tạo</Link> và xây dựng lộ trình của bạn.</span> },
            { n: 4, title: "Chia sẻ công khai", desc: "Bật Publish để roadmap xuất hiện trang chủ. Dùng Share để thêm cộng tác viên." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{n}</div>
              <div className="flex-1 pb-5">
                <p className="font-semibold text-sm mb-1">{title}</p>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">📋 Bốn thành phần chính</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-2 px-3 font-semibold">Thành phần</th>
                <th className="text-left py-2 px-3 font-semibold">Chức năng</th>
                <th className="text-left py-2 px-3 font-semibold">Quyền riêng tư</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["🗺️ Roadmap",  "Sơ đồ lộ trình học tập kéo thả",        "Public khi publish / private"],
                ["✍️ Blog",     "Bài viết, tutorial định dạng MDX",        "Public khi publish / nháp"],
                ["📚 Nội dung", "Thư viện tài liệu gắn vào node",          "Xem được nếu biết URL"],
                ["📝 Ghi chú",  "Ghi chú cá nhân màu sắc và ghim",         "Luôn riêng tư"],
              ].map(([comp, func, priv]) => (
                <tr key={comp as string} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{comp}</td>
                  <td className="py-2 px-3 text-muted-foreground">{func}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{priv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">❓ Câu hỏi thường gặp</h3>
        <div className="space-y-3">
          {[
            { q: "Tôi có thể tạo roadmap không cần đăng nhập không?", a: "Không. Bạn cần GitHub để tạo/chỉnh sửa. Xem roadmap đã public không cần đăng nhập." },
            { q: "Roadmap của tôi có bị người khác chỉnh sửa không?", a: "Không. Chỉ chủ sở hữu và collaborators được thêm qua ShareModal mới có quyền." },
            { q: "Ghi chú có bị người khác xem không?", a: "Không bao giờ. Ghi chú luôn riêng tư — hệ thống chặn và cảnh báo nếu ai cố truy cập." },
            { q: "Import file có bị giới hạn kích thước không?", a: "Không — import xử lý hoàn toàn client-side (FileReader API), không upload server → không bị giới hạn 4.5MB Vercel." },
            { q: "Export ZIP chứa gì?", a: "ZIP chứa [slug].json (dữ liệu đầy đủ, content là md), [slug].md (nội dung tổng hợp), và nodes/[node].md (md riêng cho từng node)." },
          ].map(({ q, a }) => (
            <Card key={q}>
              <p className="font-semibold mb-2 text-sm">❓ {q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </Card>
          ))}
        </div>
      </div>

      <InfoBox type="info">
        Cần thêm hỗ trợ? Xem từng trang hướng dẫn chi tiết trong menu bên trái.
      </InfoBox>

      <PageNav next={{ href: "/guide/install", label: "Cài đặt & Cấu hình" }} />
    </div>
  );
}
