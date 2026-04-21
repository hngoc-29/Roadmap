// ============================================================
// APP/BLOG/PAGE.TSX – Trang danh sách bài viết blog
// ============================================================
// ✅ SSG + ISR: pre-render lúc build, revalidate mỗi 60s
// ✅ SEO: metadata đầy đủ, JSON-LD WebPage

import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/actions/post";
import { estimateReadingTime } from "@/lib/utils";
import type { IPost } from "@/types";

export const dynamic = "force-dynamic"; // ✅ FIX: luôn fetch mới

export const metadata: Metadata = {
  title: "Blog | Bài viết học lập trình",
  description:
    "Các bài viết hướng dẫn, tutorial và tips học lập trình. Tái sử dụng trong nhiều roadmap khác nhau.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog | Roadmap Builder",
    description: "Bài viết hướng dẫn học lập trình chất lượng cao",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    locale: "vi_VN",
  },
};

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getAllPosts().catch(() => []);

  // Group by category for filtering display
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            ✍️ Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Bài viết hướng dẫn, tutorial và tips học lập trình. Mỗi bài có thể
            được gắn vào nhiều roadmap khác nhau.
          </p>
          <div className="mt-5">
            <Link
              href="/blog/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              ✍️ Viết bài mới
            </Link>
          </div>
        </div>
      </section>

      {/* Categories filter */}
      {categories.length > 0 && (
        <div className="border-b bg-background/60">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Danh mục:
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full whitespace-nowrap"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-xl mb-2">Chưa có bài viết nào.</p>
            <Link
              href="/blog/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              ✍️ Viết bài đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: IPost) => {
              const readingTime = estimateReadingTime(post.content ?? "");
              return (
                <Link
                  key={post._id ?? post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/50 transition-all bg-card"
                >
                  {/* Cover image */}
                  {post.coverImage ? (
                    <div
                      className="h-40 bg-cover bg-center bg-muted"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-4xl opacity-30">✍️</span>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Status + Category */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {post.isPublished ? (
                        <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">✅ Public</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">📝 Draft</span>
                      )}
                      {post.category && (
                        <span className="text-xs font-medium text-primary">{post.category}</span>
                      )}
                    </div>

                    <h2 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>

                    {post.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                        {post.description}
                      </p>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border mt-auto">
                      <span>✍️ {post.author.name}</span>
                      <span className="flex items-center gap-2">
                        <span>📖 {readingTime}</span>
                        {post.publishedAt && (
                          <span>{formatDate(post.publishedAt)}</span>
                        )}
                      </span>
                    </div>
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
