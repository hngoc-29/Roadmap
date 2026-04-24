// ============================================================
// APP/GUIDE/ROADMAP/PAGE.TSX — Hướng dẫn tạo và quản lý Roadmap
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Step, Card, InfoBox, PageNav } from "../_components";
import type { BadgeColor } from "../_components";

export const metadata: Metadata = {
  title: "Tạo Roadmap",
  description: "Hướng dẫn tạo roadmap, thêm node, import file, export ZIP và xuất bản.",
};

export default function RoadmapGuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🛤️</span>
          <h2 className="text-2xl font-bold">Tạo Roadmap</h2>
        </div>
        <p className="text-muted-foreground">
          Xây dựng lộ trình học tập dạng sơ đồ kéo thả với các node bài học liên kết nhau.
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Tag label="Node" color="blue" />
          <Tag label="Import" color="green" />
          <Tag label="Export ZIP" color="purple" />
          <Tag label="Publish" color="orange" />
        </div>
      </div>

      {/* Tạo roadmap */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📍 Tạo và Publish Roadmap</h3>
        <InfoBox type="info">
          Bạn cần <strong>đăng nhập bằng GitHub</strong> để tạo và chỉnh sửa roadmap.
        </InfoBox>
        <div className="mt-5 border-l-2 border-border ml-3 space-y-0">
          <Step number={1} title="Tạo roadmap mới">
            Nhấn nút <strong>➕ Tạo</strong> trên thanh điều hướng hoặc vào{" "}
            <Link href="/builder/new" className="text-primary hover:underline">/builder/new</Link>.
            Điền tiêu đề, mô tả và chọn danh mục.
          </Step>
          <Step number={2} title="Thêm và kết nối node">
            Trong Builder, nhấn <strong>+ Thêm Node</strong> để thêm bài học mới.
            Kéo từ chấm kết nối của một node sang node khác để tạo liên kết.
          </Step>
          <Step number={3} title="Chỉnh sửa nội dung node">
            Nhấn đúp vào node để mở modal chỉnh sửa. Bạn có thể đặt nhãn, mô tả, trạng thái (
            <Tag label="locked" color="red" />{" "}
            <Tag label="available" color="green" />{" "}
            <Tag label="active" color="blue" />{" "}
            <Tag label="completed" color="purple" />),
            thêm nội dung Markdown và import file.
          </Step>
          <Step number={4} title="Lưu và Xuất bản">
            Nhấn <strong>💾 Lưu</strong> để lưu thay đổi. Bật <strong>🌐 Xuất bản</strong> để roadmap xuất hiện công khai.
          </Step>
          <Step number={5} title="Chia sẻ với cộng tác viên">
            Nhấn <strong>🔗 Chia sẻ</strong> để mở ShareModal. Thêm GitHub username của cộng tác viên.
          </Step>
        </div>
        <InfoBox type="tip">
          <strong>Mẹo:</strong> Dùng phím{" "}
          <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 text-xs font-mono">Ctrl+S</kbd>{" "}
          để lưu nhanh trong Builder.
        </InfoBox>
      </div>

      {/* Chỉnh sửa node */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📍 Các trường trong Node</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold">Trường</th>
                <th className="text-left py-2 px-3 font-semibold">Mô tả</th>
                <th className="text-left py-2 px-3 font-semibold">Bắt buộc</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Nhãn (Label)",      "Tên hiển thị trên sơ đồ",                    "✅"],
                ["Slug",              "Định danh URL (tự động tạo)",                "✅"],
                ["Nội dung (MDX)",    "Nội dung bài học Markdown/MDX",               "❌"],
                ["Mô tả",             "Tóm tắt ngắn gọn",                            "❌"],
                ["Trạng thái",        "locked / available / active / completed",     "❌"],
                ["Icon",              "Emoji đại diện cho node",                     "❌"],
                ["Thời gian ước tính","Ví dụ: 2 giờ, 1 tuần",                       "❌"],
                ["Độ khó",            "beginner / intermediate / advanced",          "❌"],
              ].map(([f, d, r]) => (
                <tr key={f as string} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{f}</td>
                  <td className="py-2 px-3 text-muted-foreground">{d}</td>
                  <td className="py-2 px-3">{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import file */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📂 Import file vào Node</h3>
        <InfoBox type="tip">
          Import file được xử lý <strong>hoàn toàn trên trình duyệt</strong> (FileReader API) —
          không upload lên server → không bị giới hạn 4.5MB của Vercel.
        </InfoBox>
        <div className="mt-4 space-y-3">
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Tag label=".txt / .md" color="green" />
              <span className="font-semibold text-sm">→ Fill vào ô Nội dung</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Khi import file <code className="bg-muted px-1 rounded font-mono">.txt</code> hoặc{" "}
              <code className="bg-muted px-1 rounded font-mono">.md</code>, nội dung sẽ tự động được
              điền vào ô Markdown của tab <strong>Nội dung</strong>.
            </p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Tag label=".json" color="blue" />
              <span className="font-semibold text-sm">→ Fill vào đúng từng field</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              File JSON đúng format sẽ điền vào tất cả các field tương ứng (label, slug, mô tả,
              icon, độ khó, trạng thái, nội dung...):
            </p>
            <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto">{`{
  "label": "Tiêu đề node",
  "slug": "tieu-de-node",
  "description": "Mô tả ngắn",
  "icon": "📚",
  "estimatedTime": "2 giờ",
  "difficulty": "beginner",
  "status": "available",
  "content": "# Nội dung Markdown\\n\\n..."
}`}</pre>
          </Card>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Nút import xuất hiện ở <strong>header modal</strong> (dùng cho mọi loại file)
            và trong từng tab riêng để tiện lọc theo loại.
          </p>
        </div>
      </div>

      {/* Export ZIP */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📦 Export ZIP Roadmap</h3>
        <p className="text-muted-foreground mb-4">
          Nhấn nút <strong>📦 Export ZIP</strong> trên toolbar của Builder để tải về file ZIP chứa:
        </p>
        <div className="space-y-2">
          {[
            {
              name: "[roadmap-slug].json",
              color: "blue" as BadgeColor,
              desc: "Dữ liệu đầy đủ của roadmap. Các trường content vẫn là chuỗi Markdown — dễ re-import hoặc xử lý programmatically.",
            },
            {
              name: "[roadmap-slug].md",
              color: "green" as BadgeColor,
              desc: "Nội dung tổng hợp tất cả node dưới dạng Markdown — dễ đọc và chỉnh sửa bằng bất kỳ text editor nào.",
            },
            {
              name: "nodes/[node-slug].md",
              color: "purple" as BadgeColor,
              desc: "File Markdown riêng cho từng node có nội dung — tiện để import ngược lại hoặc chia sẻ từng bài học.",
            },
          ].map(({ name, color, desc }) => (
            <Card key={name} className="flex gap-3 items-start">
              <Tag label={name} color={color} />
              <p className="text-sm text-muted-foreground flex-1">{desc}</p>
            </Card>
          ))}
        </div>
        <InfoBox type="info">
          Export ZIP được tạo hoàn toàn client-side — không gửi dữ liệu lên server.
          Nội dung trong file <code className="font-mono">.md</code> và trong <code className="font-mono">.json</code> là giống nhau.
        </InfoBox>
      </div>

      <PageNav
        prev={{ href: "/guide/install", label: "Cài đặt & Cấu hình" }}
        next={{ href: "/guide/blog", label: "Viết Blog" }}
      />
    </div>
  );
}
