// ============================================================
// APP/CONTENT/PAGE.TSX – Thư viện nội dung
// ============================================================
// Tổng hợp tất cả content độc lập, dễ tìm và tái sử dụng

import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent } from "@/actions/content";
import type { IContent } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Thư viện nội dung",
  description: "Tổng hợp các bài học và nội dung học tập",
  alternates: { canonical: "/content" },
};

const DIFFICULTY_LABELS: Record<string, { label: string; class: string }> = {
  beginner: {
    label: "Cơ bản",
    class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  intermediate: {
    label: "Trung cấp",
    class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  advanced: {
    label: "Nâng cao",
    class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export default async function ContentLibraryPage() {
  const contents = await getAllContent().catch(() => []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-14 px-4">
        <div className="max-w-4xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              📚 Thư viện nội dung
            </h1>
            <p className="text-muted-foreground text-lg">
              Các bài học độc lập – có thể được sử dụng trong nhiều roadmap khác nhau.
            </p>
          </div>
          <Link
            href="/content/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            ➕ Thêm nội dung
          </Link>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {contents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-xl">Chưa có nội dung nào.</p>
            <p className="text-sm mt-2">
              Tạo content từ node editor trong Roadmap để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contents.map((c: IContent) => {
              const diff = c.difficulty ? DIFFICULTY_LABELS[c.difficulty] : null;
              return (
                <Link
                  key={c._id ?? c.id}
                  href={`/content/${c.slug}`}
                  className="group block border border-border rounded-xl p-5 hover:shadow-md
                             hover:border-primary/50 transition-all bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{c.icon ?? "📄"}</span>
                    {diff && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.class}`}>
                        {diff.label}
                      </span>
                    )}
                  </div>

                  <h2 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                    {c.title}
                  </h2>

                  {c.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                    {c.estimatedTime ? (
                      <span>⏱️ {c.estimatedTime}</span>
                    ) : (
                      <span />
                    )}
                    {c.tags && c.tags.length > 0 && (
                      <span className="truncate max-w-[120px]">
                        #{c.tags.slice(0, 2).join(" #")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
