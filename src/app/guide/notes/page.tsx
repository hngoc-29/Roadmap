import type { Metadata } from "next";
import { Card, InfoBox, PageNav } from "../_components";

export const metadata: Metadata = {
  title: "Ghi chú & Quyền riêng tư",
  description: "Ghi chú cá nhân riêng tư, màu sắc, ghim và kiểm soát quyền truy cập.",
};

export default function NotesGuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📝</span>
          <h2 className="text-2xl font-bold">Ghi chú & Quyền riêng tư</h2>
        </div>
        <p className="text-muted-foreground">
          Ghi chú cá nhân luôn riêng tư — không ai khác có thể xem, kể cả admin.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">📌 Tính năng Ghi chú</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "🎨", title: "Màu sắc",       desc: "6 màu để phân loại: đỏ, vàng, xanh lá, xanh dương, tím, hồng." },
            { icon: "📌", title: "Ghim",           desc: "Ghim ghi chú quan trọng lên đầu danh sách." },
            { icon: "🔍", title: "Tìm kiếm",       desc: "Tìm theo tiêu đề hoặc nội dung theo thời gian thực." },
            { icon: "🔒", title: "Luôn riêng tư",  desc: "Hệ thống chặn truy cập cứng — không thể chia sẻ hay public." },
          ].map(({ icon, title, desc }) => (
            <Card key={title}>
              <p className="text-xl mb-1">{icon}</p>
              <p className="font-semibold text-sm mb-1">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <InfoBox type="warning">
        <strong>Quyền riêng tư tuyệt đối:</strong> Ghi chú <strong>không bao giờ</strong> xuất hiện
        trên trang công khai, không có trong sitemap, và không được trả về trong bất kỳ API public nào.
        Nếu ai đó cố truy cập URL ghi chú của người khác, hệ thống sẽ hiển thị cảnh báo.
      </InfoBox>

      <div>
        <h3 className="text-lg font-semibold mb-4">🔐 Kiểm soát quyền truy cập</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold">Thao tác</th>
                <th className="text-left py-2 px-3 font-semibold">Chủ sở hữu</th>
                <th className="text-left py-2 px-3 font-semibold">Người khác</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Xem ghi chú",       "✅", "❌ (403)"],
                ["Tạo ghi chú",       "✅", "❌"],
                ["Chỉnh sửa",         "✅", "❌"],
                ["Xóa",               "✅", "❌"],
                ["Xuất hiện sitemap", "❌", "❌"],
                ["Chia sẻ công khai", "❌", "❌"],
              ].map(([action, owner, other]) => (
                <tr key={action as string} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{action}</td>
                  <td className="py-2 px-3">{owner}</td>
                  <td className="py-2 px-3 text-muted-foreground">{other}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PageNav
        prev={{ href: "/guide/content", label: "Quản lý Nội dung" }}
        next={{ href: "/guide/mdx", label: "Viết MDX" }}
      />
    </div>
  );
}
