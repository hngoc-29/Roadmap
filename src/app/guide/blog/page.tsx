// ============================================================
// APP/GUIDE/BLOG/PAGE.TSX
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Step, InfoBox, PageNav } from "../_components";

export const metadata: Metadata = {
  title: "Viết Blog",
  description: "Hướng dẫn tạo, chỉnh sửa và xuất bản bài viết blog với định dạng MDX.",
};

export default function BlogGuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">✍️</span>
          <h2 className="text-2xl font-bold">Viết Blog</h2>
        </div>
        <p className="text-muted-foreground">
          Chia sẻ bài viết, hướng dẫn và kinh nghiệm học tập. Blog hỗ trợ định dạng{" "}
          <strong>MDX</strong> (Markdown + JSX) với syntax highlighting đầy đủ.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">📝 Tạo và Xuất bản Bài viết</h3>
        <div className="border-l-2 border-border ml-3 space-y-0">
          <Step number={1} title="Tạo bài viết mới">
            Vào <Link href="/blog/new" className="text-primary hover:underline">/blog/new</Link>{" "}
            hoặc chọn <strong>✍️ Viết bài mới</strong> trong menu người dùng.
          </Step>
          <Step number={2} title="Điền thông tin bài viết">
            Nhập tiêu đề, mô tả ngắn, chọn danh mục và thêm URL ảnh bìa (tùy chọn).
            Thêm tags để dễ tìm kiếm.
          </Step>
          <Step number={3} title="Viết nội dung MDX">
            Sử dụng Markdown chuẩn với code block syntax highlighting, bảng, danh sách,
            liên kết, hình ảnh và blockquote.
            Xem <Link href="/guide/mdx" className="text-primary hover:underline">trang hướng dẫn MDX</Link> để biết thêm cú pháp.
          </Step>
          <Step number={4} title="Xuất bản hoặc Lưu nháp">
            Bật <strong>Xuất bản ngay</strong> để đăng công khai, hoặc để tắt để lưu nháp —
            chỉ bạn mới thấy.
          </Step>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">📋 Các trường của bài viết</h3>
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
                ["Tiêu đề",     "Tên bài viết — cũng dùng cho SEO title",    "✅"],
                ["Slug",        "Định danh URL (tự động từ tiêu đề)",         "✅"],
                ["Mô tả",       "Meta description — hiển thị trong danh sách","❌"],
                ["Nội dung",    "Nội dung bài viết Markdown/MDX",             "✅"],
                ["Ảnh bìa",     "URL ảnh bìa hiển thị đầu bài",              "❌"],
                ["Danh mục",    "Phân loại bài viết",                         "❌"],
                ["Tags",        "Nhãn tìm kiếm, cách nhau dấu phẩy",         "❌"],
                ["Xuất bản",    "true = public, false = nháp",               "❌"],
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

      <InfoBox type="warning">
        Bài viết ở chế độ <strong>nháp</strong> chỉ hiển thị với chính bạn (chủ sở hữu).
        Người khác sẽ thấy thông báo không có quyền truy cập.
      </InfoBox>

      <InfoBox type="tip">
        <strong>Liên kết Roadmap:</strong> Bạn có thể liên kết bài viết với một roadmap liên quan
        để người đọc có thể khám phá lộ trình học tập chi tiết hơn.
      </InfoBox>

      <PageNav
        prev={{ href: "/guide/roadmap", label: "Tạo Roadmap" }}
        next={{ href: "/guide/content", label: "Quản lý Nội dung" }}
      />
    </div>
  );
}
