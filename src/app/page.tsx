// ============================================================
// APP/PAGE.TSX - Trang chủ (Server Component)
// ============================================================
// ✅ ISR 60s, parallel fetch roadmaps + recent posts
// ✅ WebSite JSON-LD (Sitelinks Searchbox)

import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedRoadmaps } from "@/actions/roadmap";
import { getAllPosts } from "@/actions/post";
import { formatViewCount, estimateReadingTime } from "@/lib/utils";
import { WebSiteJsonLd } from "@/components/JsonLd";
import type { IRoadmap, IPost } from "@/types";

export const dynamic = "force-dynamic"; // ✅ FIX: luôn fetch mới

export const metadata: Metadata = {
  title: "Khám phá Roadmap & Blog học lập trình",
  description:
    "Tạo, chia sẻ và khám phá lộ trình học lập trình trực quan. Đọc blog hướng dẫn chất lượng cao từ cộng đồng.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Interactive Roadmap Builder",
    description:
      "Xây dựng lộ trình học tập trực quan với kéo thả. Blog & Content Library tích hợp.",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    locale: "vi_VN",
  },
};

export default async function HomePage() {
  // Parallel fetch — graceful fallback when DB unavailable (e.g. build without .env)
  const [roadmaps, posts] = await Promise.all([
    getPublishedRoadmaps().catch(() => []),
    getAllPosts().catch(() => []),
  ]);

  const recentPosts = posts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <WebSiteJsonLd />

      {/* ── Hero Section ── */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Xây dựng lộ trình học tập{" "}
            <span className="text-primary">trực quan</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tạo, chia sẻ và khám phá các roadmap học lập trình với công cụ
            kéo thả mạnh mẽ. Từng bước rõ ràng, từng bài học chi tiết.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/builder/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              🚀 Tạo Roadmap mới
            </Link>
            <Link
              href="#explore"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              🔍 Khám phá Roadmaps
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              ✍️ Đọc Blog
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      {(roadmaps.length > 0 || posts.length > 0) && (
        <div className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center gap-8 flex-wrap text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-lg">🗺️</span>
              <strong className="text-foreground">{roadmaps.length}</strong> Roadmaps
            </span>
            <span className="hidden sm:block text-border">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">✍️</span>
              <strong className="text-foreground">{posts.length}</strong> Bài viết
            </span>
            <span className="hidden sm:block text-border">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">👁</span>
              <strong className="text-foreground">
                {formatViewCount(
                  roadmaps.reduce((s, r: IRoadmap) => s + (r.viewCount ?? 0), 0)
                )}
              </strong>{" "}
              Lượt xem
            </span>
          </div>
        </div>
      )}

      {/* ── Roadmap Grid ── */}
      <section id="explore" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-1">Roadmaps nổi bật</h2>
              <p className="text-muted-foreground">
                Chọn lộ trình phù hợp với mục tiêu của bạn
              </p>
            </div>
            <Link
              href="/builder/new"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              ➕ Tạo mới
            </Link>
          </div>

          {roadmaps.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
              <p className="text-6xl mb-4">🗺️</p>
              <p className="text-xl mb-2">Chưa có roadmap nào được xuất bản.</p>
              <Link
                href="/builder/new"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                🚀 Tạo roadmap đầu tiên
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap: IRoadmap) => (
                <Link
                  key={roadmap._id}
                  href={`/roadmap/${roadmap.slug}`}
                  className="group block border border-border rounded-xl p-6 hover:shadow-md
                             hover:border-primary/50 transition-all duration-200 bg-card"
                >
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {roadmap.isPublished ? (
                        <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          ✅ Public
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                          📝 Draft
                        </span>
                      )}
                      {roadmap.category && (
                        <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {roadmap.category}
                        </span>
                      )}
                    </div>
                    {roadmap.isPublished && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        👁 {formatViewCount(roadmap.viewCount ?? 0)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {roadmap.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {roadmap.description}
                  </p>

                  {roadmap.tags && roadmap.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {roadmap.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                    <span>✍️ {roadmap.author.name}</span>
                    <span>{roadmap.nodes?.length ?? 0} bài học</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Recent Blog Posts ── */}
      {recentPosts.length > 0 && (
        <section className="py-16 px-4 border-t bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1">Bài viết mới nhất</h2>
                <p className="text-muted-foreground">
                  Hướng dẫn, tutorial và tips học lập trình
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post: IPost) => {
                const readingTime = estimateReadingTime(post.content ?? "");
                return (
                  <Link
                    key={post._id ?? post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/50 transition-all bg-card"
                  >
                    {post.coverImage ? (
                      <div
                        className="h-36 bg-cover bg-center"
                        style={{ backgroundImage: `url(${post.coverImage})` }}
                      />
                    ) : (
                      <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <span className="text-3xl opacity-30">✍️</span>
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      {post.category && (
                        <span className="text-xs font-medium text-primary mb-1.5">
                          {post.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border mt-auto">
                        <span>{post.author.name}</span>
                        <span>📖 {readingTime}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Xem tất cả bài viết →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Footer ── */}
      <section className="py-16 px-4 border-t">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Bắt đầu ngay hôm nay</h2>
          <p className="text-muted-foreground mb-6">
            Tạo roadmap cho riêng bạn hoặc viết bài chia sẻ kiến thức
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/builder/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              🗺️ Tạo Roadmap
            </Link>
            <Link
              href="/blog/new"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              ✍️ Viết Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
