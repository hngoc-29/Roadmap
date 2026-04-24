import type { Metadata } from "next";
import { InfoBox, PageNav } from "../_components";

export const metadata: Metadata = {
  title: "Viết MDX",
  description: "Cú pháp Markdown nâng cao, code block syntax highlighting, bảng và shortcode.",
};

export default function MdxGuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📄</span>
          <h2 className="text-2xl font-bold">Viết MDX</h2>
        </div>
        <p className="text-muted-foreground">
          Nội dung trong Roadmap Builder sử dụng Markdown — một cú pháp đơn giản để tạo văn bản có định dạng.
        </p>
      </div>

      {/* Cú pháp cơ bản */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📝 Cú pháp cơ bản</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold">Cú pháp</th>
                <th className="text-left py-2 px-3 font-semibold">Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["# Tiêu đề 1",        "Tiêu đề lớn nhất (h1)"],
                ["## Tiêu đề 2",       "Tiêu đề cấp 2 (h2)"],
                ["### Tiêu đề 3",      "Tiêu đề cấp 3 (h3)"],
                ["**đậm**",            "Chữ đậm"],
                ["*nghiêng*",          "Chữ nghiêng"],
                ["`code inline`",      "Code trong dòng"],
                ["- Danh sách",        "Danh sách không thứ tự"],
                ["1. Danh sách",       "Danh sách có thứ tự"],
                ["> Blockquote",       "Trích dẫn"],
                ["---",                "Đường kẻ ngang"],
                ["[text](url)",        "Liên kết"],
                ["![alt](url)",        "Hình ảnh"],
              ].map(([syntax, result]) => (
                <tr key={syntax as string} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-mono text-xs bg-muted/30">{syntax}</td>
                  <td className="py-2 px-3 text-muted-foreground">{result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code block */}
      <div>
        <h3 className="text-lg font-semibold mb-3">💻 Code Block với Syntax Highlighting</h3>
        <p className="text-sm text-muted-foreground mb-3">Dùng ba dấu backtick và tên ngôn ngữ:</p>
        <pre className="bg-muted border border-border rounded-xl px-5 py-4 text-xs font-mono overflow-x-auto leading-relaxed">{`\`\`\`javascript
const hello = "Hello, World!";
console.log(hello);
\`\`\`

\`\`\`python
def greet(name):
    return f"Xin chào, {name}!"
\`\`\`

\`\`\`bash
npm install && npm run dev
\`\`\``}</pre>
        <p className="text-xs text-muted-foreground mt-2">
          Hỗ trợ: js, ts, python, bash, html, css, json, sql, go, rust, java, c, cpp, ...
        </p>
      </div>

      {/* Bảng */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📊 Bảng (Table)</h3>
        <pre className="bg-muted border border-border rounded-xl px-5 py-4 text-xs font-mono overflow-x-auto">{`| Cột 1     | Cột 2    | Cột 3    |
|-----------|----------|----------|
| Hàng 1A   | Hàng 1B  | Hàng 1C  |
| Hàng 2A   | Hàng 2B  | Hàng 2C  |`}</pre>
      </div>

      {/* Ví dụ node đầy đủ */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📋 Ví dụ nội dung Node đầy đủ</h3>
        <pre className="bg-muted border border-border rounded-xl px-5 py-4 text-xs font-mono overflow-x-auto leading-relaxed">{`# Giới thiệu về HTML

> **Thời gian học:** 2 giờ | **Độ khó:** 🟢 Cơ bản

HTML (HyperText Markup Language) là ngôn ngữ đánh dấu chuẩn để tạo trang web.

## Cấu trúc cơ bản

\`\`\`html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Trang của tôi</title>
  </head>
  <body>
    <h1>Xin chào!</h1>
  </body>
</html>
\`\`\`

## Các thẻ quan trọng

| Thẻ         | Mục đích              |
|-------------|-----------------------|
| \`<h1>-<h6>\` | Tiêu đề               |
| \`<p>\`       | Đoạn văn              |
| \`<a>\`       | Liên kết              |
| \`<img>\`     | Hình ảnh              |
| \`<div>\`     | Khối chứa             |

## Bài tập

1. Tạo trang HTML hiển thị tên của bạn
2. Thêm một liên kết tới trang web yêu thích
3. Nhúng một hình ảnh vào trang`}</pre>
      </div>

      <InfoBox type="tip">
        Nội dung trong file <strong>.md</strong> export từ ZIP và nội dung trong ô soạn thảo là
        giống nhau — bạn có thể soạn trước bằng bất kỳ editor nào (VS Code, Obsidian...) rồi
        import vào node qua nút <strong>📂 Import file</strong>.
      </InfoBox>

      <PageNav
        prev={{ href: "/guide/notes", label: "Ghi chú & Quyền riêng tư" }}
      />
    </div>
  );
}
