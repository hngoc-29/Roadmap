// ============================================================
// APP/CONTENT/[CONTENT-SLUG]/PAGE.TSX
// ============================================================
// Trang content độc lập – URL: /content/[slug]
// Nhiều roadmap có thể link tới cùng 1 trang này
// ✅ SSG + ISR, MDX render server-side

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { getContentBySlug, getLinkedRoadmaps, getAllContentSlugs } from "@/actions/content";
import ContentDetailActions from "@/components/ContentDetailActions";
import { getCanonicalUrl, extractExcerpt, estimateReadingTime } from "@/lib/utils";

export const dynamic = "force-dynamic"; // ✅ FIX: luôn fetch mới

// ── Static Params ──
export async function generateStaticParams() {
  try {
    const slugs = await getAllContentSlugs();
    return slugs.map((s) => ({ "content-slug": s.slug }));
  } catch {
    return [];
  }
}

// ── Metadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ "content-slug": string }>;
}): Promise<Metadata> {
  const { "content-slug": slug } = await params;
  const content = await getContentBySlug(slug);

  if (!content) return { title: "Không tìm thấy nội dung", robots: { index: false } };

  const description =
    content.description || extractExcerpt(content.content ?? "", 160);
  const url = getCanonicalUrl("content", slug);

  return {
    title: content.title,
    description,
    keywords: content.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: content.title,
      description,
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
      locale: "vi_VN",
      tags: content.tags,
    },
    twitter: { card: "summary_large_image", title: content.title, description },
  };
}

// ── MDX Components ──
const mdxComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 scroll-mt-20">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3 scroll-mt-20">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-xl font-medium mt-5 mb-2 scroll-mt-20">{children}</h3>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto border border-border text-sm my-4">
      {children}
    </pre>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    if (className) return <code className={className}>{children}</code>;
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    );
  },
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-4 py-1 italic text-muted-foreground my-4">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </a>
  ),
};

// ── Page ──
export default async function ContentPage({
  params,
}: {
  params: Promise<{ "content-slug": string }>;
}) {
  const { "content-slug": slug } = await params;

  const [content, linkedRoadmaps] = await Promise.all([
    getContentBySlug(slug),
    getLinkedRoadmaps(slug),
  ]);

  if (!content) notFound();

  const readingTime = estimateReadingTime(content.content ?? "");

  return (
    <div className="min-h-screen bg-background">
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="border-b bg-muted/30 px-4 py-3">
        <ol className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Trang chủ
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/content" className="hover:text-foreground transition-colors">
              Thư viện nội dung
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground font-medium truncate max-w-xs">
            {content.title}
          </li>
        </ol>
      </nav>

      {/* ── Actions bar: Edit / Delete ── */}
      <div className="border-b bg-gradient-to-r from-muted/50 via-background to-background px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-4 rounded-full bg-primary/50 hidden sm:block" />
            <span className="hidden sm:block font-medium">Quản lý nội dung</span>
          </div>
          <ContentDetailActions
            contentId={(content._id ?? content.id) as string}
            contentSlug={content.slug}
          />
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">
        {/* ── Article ── */}
        <article className="flex-1 min-w-0">
          <header className="mb-8">
            {content.icon && (
              <div className="text-5xl mb-4">{content.icon}</div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {content.title}
            </h1>

            {content.description && (
              <p className="text-lg text-muted-foreground mb-4">
                {content.description}
              </p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                📖 {readingTime}
              </span>
              {content.estimatedTime && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  ⏱️ {content.estimatedTime}
                </span>
              )}
              {content.difficulty && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    content.difficulty === "beginner"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : content.difficulty === "intermediate"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {content.difficulty === "beginner"
                    ? "Cơ bản"
                    : content.difficulty === "intermediate"
                    ? "Trung cấp"
                    : "Nâng cao"}
                </span>
              )}
            </div>

            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* MDX Content */}
          <div className="prose-content">
            {content.content ? (
              <MDXRemote
                source={content.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm, remarkMath],
                    rehypePlugins: [rehypeSlug, rehypeHighlight, rehypeKatex],
                  },
                }}
              />
            ) : (
              <p className="text-muted-foreground italic">
                Nội dung đang được cập nhật...
              </p>
            )}
          </div>

          {/* Resources */}
          {content.resources && content.resources.length > 0 && (
            <section className="mt-10 pt-6 border-t border-border">
              <h2 className="text-lg font-semibold mb-4">📚 Tài liệu tham khảo</h2>
              <ul className="space-y-2">
                {content.resources.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-xs px-2 py-0.5 bg-secondary rounded-md uppercase">
                      {r.type}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="mt-12 pt-6 border-t border-border">
            <Link
              href="/content"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              ← Về thư viện nội dung
            </Link>
          </footer>
        </article>

        {/* ── Sidebar: Roadmaps liên kết ── */}
        {linkedRoadmaps.length > 0 && (
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                🗺️ Có trong các Roadmap
              </h3>
              <ul className="space-y-2">
                {linkedRoadmaps.map((r, i) => (
                  <li key={i}>
                    <Link
                      href={`/roadmap/${r.slug}`}
                      className="block rounded-lg border border-border px-3 py-2.5 hover:border-primary/50 hover:bg-muted/50 transition-all text-sm"
                    >
                      <p className="font-medium leading-snug line-clamp-2">
                        {r.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Node: {r.nodeLabel}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
