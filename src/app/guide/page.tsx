// ============================================================
// APP/GUIDE/PAGE.TSX - Trang hướng dẫn sử dụng
// ============================================================
// Nội dung được viết trực tiếp bằng MDX/JSX thay vì file riêng
// Tags, badges, steps đều được định nghĩa inline trong file này

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng | Roadmap Builder",
  description:
    "Hướng dẫn chi tiết cách tạo roadmap, viết blog, quản lý ghi chú và nội dung trên Roadmap Builder.",
};

// ── Inline component definitions (không tách file riêng) ─────

type BadgeColor = "green" | "blue" | "purple" | "orange" | "red";

const BADGE_COLORS: Record<BadgeColor, string> = {
  green:  "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  blue:   "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  purple: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  orange: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  red:    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

function Tag({ label, color = "blue" }: { label: string; color?: BadgeColor }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${BADGE_COLORS[color]}`}>
      {label}
    </span>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div className="flex-1 pb-6">
        <h4 className="font-semibold mb-1.5">{title}</h4>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border rounded-xl p-5 bg-card ${className}`}>
      {children}
    </div>
  );
}

function InfoBox({ type, children }: { type: "tip" | "warning" | "info"; children: React.ReactNode }) {
  const styles = {
    tip:     { icon: "💡", cls: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" },
    warning: { icon: "⚠️", cls: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300" },
    info:    { icon: "ℹ️", cls: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" },
  }[type];
  return (
    <div className={`flex gap-3 border rounded-xl p-4 text-sm ${styles.cls}`}>
      <span className="text-base flex-shrink-0">{styles.icon}</span>
      <div>{children}</div>
    </div>
  );
}

// ── TOC entries ───────────────────────────────────────────────
const TOC = [
  { id: "overview",   icon: "🗺️", label: "Tổng quan" },
  { id: "roadmap",    icon: "🛤️", label: "Tạo Roadmap" },
  { id: "node",       icon: "📍", label: "Chỉnh sửa Node" },
  { id: "blog",       icon: "✍️", label: "Viết Blog" },
  { id: "content",    icon: "📚", label: "Quản lý Nội dung" },
  { id: "notes",      icon: "📝", label: "Ghi chú" },
  { id: "dashboard",  icon: "📊", label: "Dashboard" },
  { id: "privacy",    icon: "🔒", label: "Quyền riêng tư" },
  { id: "mdx",        icon: "📄", label: "Viết MDX" },
  { id: "faq",        icon: "❓", label: "Câu hỏi thường gặp" },
];

// ── Page ─────────────────────────────────────────────────────
export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-gradient-to-b from-muted/50 to-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-5xl mb-4">📖</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Hướng dẫn sử dụng</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tìm hiểu cách sử dụng đầy đủ các tính năng của Roadmap Builder —
            từ tạo lộ trình học tập đến quản lý nội dung và ghi chú cá nhân.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Tag label="Roadmap" color="blue" />
            <Tag label="Blog" color="green" />
            <Tag label="Ghi chú" color="purple" />
            <Tag label="MDX" color="orange" />
            <Tag label="Dashboard" color="red" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 flex gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Mục lục
            </p>
            <nav className="space-y-1">
              {TOC.map(({ id, icon, label }) => (
                <a key={id} href={`#${id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <span>{icon}</span>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* ── Tổng quan ── */}
          <Section id="overview" icon="🗺️" title="Tổng quan">
            <p className="text-muted-foreground mb-5">
              Roadmap Builder là nền tảng giúp bạn tạo, chia sẻ và khám phá các lộ trình học tập
              trực quan. Nền tảng gồm 4 thành phần chính:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "🗺️", title: "Roadmap",  color: "blue"   as BadgeColor, desc: "Lộ trình học dạng sơ đồ kéo thả với các node bài học liên kết nhau." },
                { icon: "✍️", title: "Blog",     color: "green"  as BadgeColor, desc: "Bài viết hướng dẫn, tutorial và chia sẻ kinh nghiệm học lập trình." },
                { icon: "📚", title: "Nội dung", color: "purple" as BadgeColor, desc: "Thư viện tài liệu học tập dùng chung, gắn liền với node roadmap." },
                { icon: "📝", title: "Ghi chú",  color: "orange" as BadgeColor, desc: "Ghi chú cá nhân riêng tư, chỉ bạn mới được xem." },
              ].map(({ icon, title, color, desc }) => (
                <Card key={title}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-semibold">{title}</span>
                    <Tag label={title} color={color} />
                  </div>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>
          </Section>

          {/* ── Tạo Roadmap ── */}
          <Section id="roadmap" icon="🛤️" title="Tạo Roadmap">
            <InfoBox type="info">
              Bạn cần <strong>đăng nhập bằng GitHub</strong> để tạo và chỉnh sửa roadmap.
            </InfoBox>
            <div className="mt-5 space-y-0 border-l-2 border-border ml-3 pl-0">
              <Step number={1} title="Tạo roadmap mới">
                Nhấn nút <strong>➕ Tạo</strong> trên thanh điều hướng hoặc vào{" "}
                <Link href="/builder/new" className="text-primary hover:underline">/builder/new</Link>.
                Điền tiêu đề, mô tả và chọn danh mục phù hợp.
              </Step>
              <Step number={2} title="Thêm và kết nối node">
                Trong Builder, nhấn <strong>+ Thêm Node</strong> để thêm bài học mới.
                Kéo từ chấm kết nối của một node sang node khác để tạo liên kết.
                Có thể di chuyển node bằng cách kéo thả.
              </Step>
              <Step number={3} title="Chỉnh sửa nội dung node">
                Nhấn đúp vào node để mở modal chỉnh sửa. Bạn có thể đặt nhãn,
                mô tả, trạng thái (<Tag label="locked" color="red" />{" "}
                <Tag label="available" color="green" />{" "}
                <Tag label="active" color="blue" />{" "}
                <Tag label="completed" color="purple" />),
                thêm tags và liên kết tài liệu từ thư viện Nội dung.
              </Step>
              <Step number={4} title="Lưu và xuất bản">
                Nhấn <strong>💾 Lưu</strong> để lưu thay đổi. Khi sẵn sàng chia sẻ,
                bật <strong>📤 Publish</strong> để roadmap xuất hiện công khai trên trang chủ.
              </Step>
              <Step number={5} title="Chia sẻ và cộng tác">
                Mở <strong>Cài đặt chia sẻ</strong> để thêm collaborators (theo email)
                hoặc bật chế độ <em>Mọi người có thể sửa</em> cho phép công khai chỉnh sửa.
              </Step>
            </div>
            <InfoBox type="tip">
              <strong>Mẹo:</strong> Dùng phím <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 text-xs font-mono">Ctrl+S</kbd> để lưu nhanh trong Builder.
            </InfoBox>
          </Section>

          {/* ── Node ── */}
          <Section id="node" icon="📍" title="Chỉnh sửa Node">
            <p className="text-muted-foreground mb-4">
              Mỗi node trong roadmap là một bài học. Node hỗ trợ các trường sau:
            </p>
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
                    ["Nhãn (Label)",      "Tên hiển thị của node trên sơ đồ",                   "✅"],
                    ["Slug",             "Định danh URL của node (tự động tạo)",                "✅"],
                    ["Nội dung (MDX)",   "Nội dung bài học viết bằng Markdown/MDX",             "❌"],
                    ["Mô tả",            "Tóm tắt ngắn gọn về bài học",                         "❌"],
                    ["Trạng thái",       "locked / available / active / completed",             "❌"],
                    ["Icon",             "Emoji đại diện cho node",                              "❌"],
                    ["Thời gian ước tính", "Ví dụ: 2 giờ, 1 tuần",                             "❌"],
                    ["Độ khó",           "beginner / intermediate / advanced",                  "❌"],
                    ["Tags",             "Nhãn phân loại (cách nhau bởi dấu phẩy)",             "❌"],
                    ["Liên kết nội dung", "Gắn tài liệu từ thư viện Content vào node",         "❌"],
                  ].map(([field, desc, req]) => (
                    <tr key={field} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">{field}</td>
                      <td className="py-2 px-3 text-muted-foreground">{desc}</td>
                      <td className="py-2 px-3">{req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Blog ── */}
          <Section id="blog" icon="✍️" title="Viết Blog">
            <p className="text-muted-foreground mb-5">
              Blog là nơi bạn chia sẻ bài viết, hướng dẫn và kinh nghiệm học tập.
              Bài viết hỗ trợ định dạng <strong>MDX</strong> (Markdown + JSX).
            </p>
            <div className="space-y-0 border-l-2 border-border ml-3">
              <Step number={1} title="Tạo bài viết mới">
                Vào <Link href="/blog/new" className="text-primary hover:underline">/blog/new</Link>{" "}
                hoặc chọn <strong>✍️ Viết bài mới</strong> trong menu người dùng.
              </Step>
              <Step number={2} title="Điền thông tin">
                Nhập tiêu đề, mô tả ngắn, chọn danh mục và thêm ảnh bìa (URL).
                Thêm tags để dễ tìm kiếm.
              </Step>
              <Step number={3} title="Viết nội dung MDX">
                Sử dụng Markdown chuẩn. Hỗ trợ code block với syntax highlighting,
                bảng, danh sách, liên kết, hình ảnh và blockquote.
              </Step>
              <Step number={4} title="Xuất bản hoặc lưu nháp">
                Bật <strong>Xuất bản ngay</strong> để đăng công khai, hoặc để tắt
                để lưu dưới dạng nháp — chỉ bạn mới thấy.
              </Step>
            </div>
            <InfoBox type="warning">
              Bài viết ở chế độ <strong>nháp</strong> chỉ hiển thị với chính bạn (chủ sở hữu).
              Người khác sẽ thấy thông báo không có quyền truy cập.
            </InfoBox>
          </Section>

          {/* ── Content ── */}
          <Section id="content" icon="📚" title="Quản lý Nội dung">
            <p className="text-muted-foreground mb-5">
              Thư viện Nội dung lưu trữ tài liệu học tập có thể được liên kết vào
              nhiều node roadmap khác nhau, tránh trùng lặp nội dung.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                { icon: "📄", title: "Tạo tài liệu", desc: "Viết nội dung bài học độc lập, có thể dùng trong nhiều roadmap." },
                { icon: "🔗", title: "Liên kết vào Node", desc: "Trong modal chỉnh sửa node, chọn tài liệu từ thư viện." },
                { icon: "🔍", title: "Tìm kiếm", desc: "Tìm nội dung theo tên, mô tả hoặc tags." },
                { icon: "🏷️", title: "Phân loại", desc: "Gán độ khó, thời gian ước tính và tags cho từng tài liệu." },
              ].map(({ icon, title, desc }) => (
                <Card key={title}>
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="font-semibold mb-1 text-sm">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </Card>
              ))}
            </div>
            <InfoBox type="info">
              Tìm kiếm nội dung trong picker của node chỉ hiện tài liệu <strong>của bạn</strong>.
              Nội dung của người khác không xuất hiện trong gợi ý.
            </InfoBox>
          </Section>

          {/* ── Notes ── */}
          <Section id="notes" icon="📝" title="Ghi chú">
            <p className="text-muted-foreground mb-5">
              Ghi chú là không gian cá nhân hoàn toàn riêng tư. Chỉ bạn mới thấy ghi chú của mình.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { color: "yellow" as BadgeColor, label: "🟡 Vàng" },
                { color: "blue"   as BadgeColor, label: "🔵 Xanh dương" },
                { color: "green"  as BadgeColor, label: "🟢 Xanh lá" },
                { color: "pink"   as BadgeColor, label: "🩷 Hồng" },
                { color: "purple" as BadgeColor, label: "🟣 Tím" },
              ].map(({ color, label }) => (
                <Tag key={color} label={label} color={color} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Chọn màu cho ghi chú để phân loại trực quan. Ghim ghi chú quan trọng để
              hiển thị lên đầu danh sách.
            </p>
            <InfoBox type="warning">
              <strong>Ghi chú là hoàn toàn riêng tư.</strong> Ngay cả khi bạn có link trực tiếp,
              người dùng khác sẽ thấy thông báo không có quyền truy cập và không thể đọc nội dung.
            </InfoBox>
          </Section>

          {/* ── Dashboard ── */}
          <Section id="dashboard" icon="📊" title="Dashboard">
            <p className="text-muted-foreground mb-5">
              Dashboard là trung tâm quản lý tất cả dữ liệu của bạn trên một trang duy nhất.
            </p>
            <div className="space-y-3">
              {[
                { icon: "🗺️", title: "Tab Roadmaps", desc: "Xem, sửa, publish/ẩn và xóa roadmap. Hiển thị số node, trạng thái publish và danh sách collaborators." },
                { icon: "✍️", title: "Tab Bài viết",  desc: "Quản lý toàn bộ bài viết blog của bạn kể cả nháp. Truy cập nhanh để xem và chỉnh sửa." },
                { icon: "📝", title: "Tab Ghi chú",   desc: "Xem tất cả ghi chú cá nhân với màu sắc trực quan. Phân biệt ghi chú đã ghim." },
                { icon: "📚", title: "Tab Nội dung",  desc: "Quản lý thư viện tài liệu cá nhân. Hiển thị độ khó, thời gian ước tính." },
              ].map(({ icon, title, desc }) => (
                <Card key={title} className="flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <div className="font-semibold mb-0.5 text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                📊 Mở Dashboard của tôi
              </Link>
            </div>
          </Section>

          {/* ── Privacy ── */}
          <Section id="privacy" icon="🔒" title="Quyền riêng tư">
            <p className="text-muted-foreground mb-5">
              Roadmap Builder có hệ thống kiểm soát truy cập rõ ràng cho từng loại nội dung:
            </p>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-2 px-3 font-semibold">Loại nội dung</th>
                    <th className="text-left py-2 px-3 font-semibold">Chế độ công khai</th>
                    <th className="text-left py-2 px-3 font-semibold">Chế độ riêng tư</th>
                    <th className="text-left py-2 px-3 font-semibold">Gợi ý tìm kiếm</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Roadmap",  "isPublished = true → tất cả xem được", "isPublished = false → chỉ owner + collaborators", "Chỉ roadmap đã publish"],
                    ["Blog",     "isPublished = true → tất cả xem được", "isPublished = false → chỉ owner xem được",        "Chỉ bài đã publish"],
                    ["Nội dung", "Có thể xem công khai nếu truy cập URL", "Gợi ý picker chỉ hiện của bạn",                  "Chỉ nội dung của bạn"],
                    ["Ghi chú",  "Không có chế độ công khai",            "Luôn riêng tư — chỉ owner xem được",              "Luôn riêng tư"],
                  ].map(([type, pub, priv, suggest]) => (
                    <tr key={type} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">{type}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">{pub}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">{priv}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">{suggest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <InfoBox type="warning">
              Khi cố truy cập nội dung riêng tư mà không có quyền, hệ thống sẽ hiển thị
              trang cảnh báo <strong>🔒 Không có quyền truy cập</strong> thay vì thông báo lỗi 404.
            </InfoBox>
          </Section>

          {/* ── MDX ── */}
          <Section id="mdx" icon="📄" title="Viết MDX">
            <p className="text-muted-foreground mb-5">
              Nội dung trong roadmap, blog và ghi chú đều hỗ trợ định dạng{" "}
              <strong>MDX</strong> — Markdown nâng cao với hỗ trợ syntax highlighting.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Tag label="Cú pháp" color="blue" /> Ví dụ Markdown
                </p>
                <pre className="bg-muted border border-border rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`# Tiêu đề lớn
## Tiêu đề nhỏ

**In đậm**, *in nghiêng*

- Danh sách gạch đầu dòng
1. Danh sách đánh số

\`code inline\`

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> Trích dẫn nổi bật

[Liên kết](https://example.com)

| Cột 1 | Cột 2 |
|-------|-------|
| A     | B     |`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Tag label="Kết quả" color="green" /> Hiển thị
                </p>
                <Card className="text-sm space-y-2">
                  <h3 className="text-lg font-bold">Tiêu đề lớn</h3>
                  <h4 className="text-base font-semibold">Tiêu đề nhỏ</h4>
                  <p><strong>In đậm</strong>, <em>in nghiêng</em></p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Danh sách gạch đầu dòng</li>
                  </ul>
                  <p><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">code inline</code></p>
                  <pre className="bg-muted rounded p-2 text-xs font-mono overflow-x-auto">
                    {`const hello = "world";\nconsole.log(hello);`}
                  </pre>
                  <blockquote className="border-l-4 border-primary pl-3 text-muted-foreground italic">
                    Trích dẫn nổi bật
                  </blockquote>
                </Card>
              </div>
            </div>
            <InfoBox type="tip">
              <strong>Tags trong nội dung MDX</strong> được định nghĩa trực tiếp trong từng file trang
              (không tách thành file riêng). Ví dụ: tags, badges, step components đều viết inline
              trong cùng file TSX — đây là pattern được khuyến khích trong dự án này.
            </InfoBox>
          </Section>

          {/* ── FAQ ── */}
          <Section id="faq" icon="❓" title="Câu hỏi thường gặp">
            <div className="space-y-4">
              {[
                {
                  q: "Tôi có thể tạo roadmap mà không cần đăng nhập không?",
                  a: "Không. Bạn cần đăng nhập bằng tài khoản GitHub để tạo và chỉnh sửa roadmap. Xem roadmap đã public thì không cần đăng nhập.",
                },
                {
                  q: "Roadmap của tôi có bị người khác chỉnh sửa không?",
                  a: "Mặc định thì không. Chỉ chủ sở hữu và collaborators được thêm vào mới có quyền chỉnh sửa. Bạn có thể bật 'Mọi người có thể sửa' nếu muốn cho phép cộng đồng đóng góp.",
                },
                {
                  q: "Ghi chú của tôi có bị người khác xem không?",
                  a: "Không bao giờ. Ghi chú luôn riêng tư — ngay cả admin cũng không thể xem ghi chú của bạn. Hệ thống chặn truy cập và hiển thị cảnh báo nếu ai cố truy cập.",
                },
                {
                  q: "Tôi có thể liên kết một tài liệu vào nhiều node roadmap không?",
                  a: "Có. Tạo tài liệu trong thư viện Nội dung, sau đó liên kết vào bất kỳ node nào từ bất kỳ roadmap nào. Đây là tính năng tái sử dụng nội dung.",
                },
                {
                  q: "Làm sao để xóa roadmap?",
                  a: "Vào Dashboard, chọn tab Roadmaps và nhấn nút 🗑️ bên cạnh roadmap muốn xóa. Chỉ chủ sở hữu mới có thể xóa — collaborators không thể xóa.",
                },
                {
                  q: "Bài viết nháp có xuất hiện trên trang chủ không?",
                  a: "Không. Trang chủ và danh sách blog chỉ hiển thị bài đã publish. Bài nháp chỉ bạn mới thấy trong Dashboard và khi truy cập trực tiếp URL.",
                },
              ].map(({ q, a }) => (
                <Card key={q}>
                  <p className="font-semibold mb-2 text-sm">❓ {q}</p>
                  <p className="text-sm text-muted-foreground">{a}</p>
                </Card>
              ))}
            </div>
          </Section>

          {/* Footer CTA */}
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground mb-4">Sẵn sàng bắt đầu?</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/builder/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                🚀 Tạo Roadmap đầu tiên
              </Link>
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
                📊 Mở Dashboard
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
