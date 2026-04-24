// ============================================================
// APP/GUIDE/CONTENT/PAGE.TSX
// ============================================================

import type { Metadata } from "next";
import { Card, InfoBox, PageNav } from "../_components";

export const metadata: Metadata = {
  title: "Quản lý Nội dung",
  description: "Hướng dẫn sử dụng thư viện nội dung — tạo tài liệu, liên kết vào node và tìm kiếm.",
};

export default function ContentGuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📚</span>
          <h2 className="text-2xl font-bold">Quản lý Nội dung</h2>
        </div>
        <p className="text-muted-foreground">
          Thư viện Nội dung lưu trữ tài liệu học tập có thể được liên kết vào nhiều node roadmap
          khác nhau — tránh trùng lặp nội dung.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">🔑 Tại sao dùng Thư viện Nội dung?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "♻️", title: "Tái sử dụng",        desc: "Viết một lần, liên kết vào nhiều node roadmap khác nhau." },
            { icon: "🔗", title: "Liên kết tập trung", desc: "Node chỉ cần lưu slug tham chiếu, không lưu nội dung trùng lặp." },
            { icon: "✏️", title: "Chỉnh sửa dễ dàng", desc: "Sửa một chỗ, tất cả node liên kết tới đều cập nhật ngay." },
            { icon: "🔍", title: "Tìm kiếm nhanh",    desc: "Tìm kiếm theo tên, mô tả hoặc tags ngay trong modal node." },
          ].map(({ icon, title, desc }) => (
            <Card key={title}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold mb-1 text-sm">{title}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">📋 Các trường của Nội dung</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold">Trường</th>
                <th className="text-left py-2 px-3 font-semibold">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Tiêu đề",          "Tên tài liệu"],
                ["Slug",             "Định danh URL → /content/[slug]"],
                ["Mô tả",            "Tóm tắt ngắn, hiển thị trong danh sách"],
                ["Nội dung (MDX)",   "Nội dung đầy đủ — hỗ trợ Markdown/MDX"],
                ["Icon",             "Emoji đại diện"],
                ["Độ khó",           "beginner / intermediate / advanced"],
                ["Thời gian ước tính","VD: 2 giờ, 1 tuần"],
                ["Tags",             "Nhãn phân loại, hiển thị trong picker"],
              ].map(([f, d]) => (
                <tr key={f as string} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{f}</td>
                  <td className="py-2 px-3 text-muted-foreground">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">🔗 Liên kết vào Node</h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-bold text-foreground">1.</span>
            Trong modal chỉnh sửa node, chọn tab <strong>📝 Nội dung</strong>.
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">2.</span>
            Chuyển sang chế độ <strong>🔗 Dùng Content thư viện</strong>.
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">3.</span>
            Tìm kiếm và chọn tài liệu từ picker. Node sẽ link đến{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono">/content/[slug]</code> khi nhấp vào.
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">4.</span>
            Hoặc nhấn <strong>+ Tạo content mới từ đây</strong> để tạo nhanh mà không rời modal.
          </li>
        </ol>
      </div>

      <InfoBox type="info">
        Tìm kiếm nội dung trong picker của node chỉ hiện tài liệu <strong>của bạn</strong>.
        Nội dung của người khác không xuất hiện trong gợi ý — đảm bảo riêng tư.
      </InfoBox>

      <PageNav
        prev={{ href: "/guide/blog", label: "Viết Blog" }}
        next={{ href: "/guide/notes", label: "Ghi chú & Quyền riêng tư" }}
      />
    </div>
  );
}
