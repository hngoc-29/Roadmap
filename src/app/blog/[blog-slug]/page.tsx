// ============================================================
// APP/BLOG/[BLOG-SLUG]/PAGE.TSX - Trang bài viết blog chi tiết
// ============================================================
// ✅ SSG + ISR – pre-render, SEO-ready
// ✅ MDX rendering server-side
// ✅ JSON-LD BlogPosting schema
// ✅ Related Roadmaps sidebar

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  getPostBySlug,
  getAllPostSlugs,
  incrementPostViewCount,
} from "@/actions/post";
import { getRoadmapBySlug } from "@/actions/roadmap";
import {
  getCanonicalUrl,
  extractExcerpt,
  estimateReadingTime,
} from "@/lib/utils";
import PostDetailActions from "@/components/PostDetailActions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic"; // ✅ FIX: luôn fetch mới

// ── generateStaticParams ──
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((s) => ({ "blog-slug": s.slug }));
  } catch {
    return [];
  }
}

// ── generateMetadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ "blog-slug": string }>;
}): Promise<Metadata> {
  const { "blog-slug": slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post)
    return { title: "Bài viết không tồn tại", robots: { index: false } };

  const description =
    post.description || extractExcerpt(post.content ?? "", 160);
  const url = getCanonicalUrl("blog", slug);

  return {
    title: post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: url },
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : [{ url: "/og-default.png", width: 1200, height: 630 }],
      locale: "vi_VN",
      publishedTime: post.publishedAt?.toString(),
      modifiedTime: post.updatedAt?.toString(),
      tags: post.tags,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : ["/og-default.png"],
    },
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
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
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

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ── Page ──
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ "blog-slug": string }>;
}) {
  const { "blog-slug": slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // 🔒 Draft: chỉ owner mới được xem
  if (!post.isPublished) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");
    const userId = (session.user as { id?: string })?.id;
    const userEmail = session.user?.email ?? "";
    const isOwner =
      (!post.ownerId && !post.ownerEmail) ||
      (post.ownerId && post.ownerId === userId) ||
      (post.ownerEmail && post.ownerEmail === userEmail);
    if (!isOwner) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center border border-destructive/30 rounded-2xl p-10 bg-destructive/5">
            <p className="text-5xl mb-4">🔒</p>
            <h1 className="text-xl font-bold mb-2 text-destructive">Bài viết chưa được công khai</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Bài viết này đang ở chế độ nháp và chỉ chủ sở hữu mới có thể xem.
            </p>
            <Link href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              ← Về danh sách bài viết
            </Link>
          </div>
        </div>
      );
    }
  }

  // Fire-and-forget: tăng view count
  void incrementPostViewCount(slug);

  const readingTime = estimateReadingTime(post.content ?? "");

  // Load related roadmaps (parallel)
  const relatedRoadmapData = await Promise.all(
    (post.relatedRoadmaps ?? []).map((s) =>
      getRoadmapBySlug(s).catch(() => null)
    )
  );
  const relatedRoadmaps = relatedRoadmapData.filter(Boolean);

  // JSON-LD BlogPosting
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const canonicalUrl = getCanonicalUrl("blog", slug);
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": canonicalUrl,
    headline: post.title,
    description: post.description || extractExcerpt(post.content ?? "", 160),
    url: canonicalUrl,
    image: post.coverImage
      ? { "@type": "ImageObject", url: post.coverImage }
      : { "@type": "ImageObject", url: `${appUrl}/og-default.png` },
    author: { "@type": "Person", name: post.author.name },
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "Roadmap Builder",
      url: appUrl,
    },
    datePublished: post.publishedAt?.toString(),
    dateModified: post.updatedAt?.toString(),
    keywords: post.tags?.join(", "),
    inLanguage: "vi",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: appUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${appUrl}/blog`,
        },
        { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Draft banner */}
      {!post.isPublished && (
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
          <span>📝</span>
          <span className="font-medium">Chế độ Draft</span>
          <span className="text-yellow-600 dark:text-yellow-400 ml-1 hidden sm:inline">— Bài viết này chưa được xuất bản.</span>
        </div>
      )}
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPosting) }}
      />

      {/* Cover image hero */}
      {post.coverImage && (
        <div
          className="w-full h-64 md:h-80 bg-cover bg-center border-b border-border"
          style={{ backgroundImage: `url(${post.coverImage})` }}
          aria-hidden
        />
      )}

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="border-b bg-muted/30 px-4 py-3"
      >
        <ol className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Trang chủ
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li
            aria-current="page"
            className="text-foreground font-medium truncate max-w-xs"
          >
            {post.title}
          </li>
        </ol>
      </nav>

      {/* ── Actions bar: Edit / Delete ── */}
      <div className="border-b bg-gradient-to-r from-muted/50 via-background to-background px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-4 rounded-full bg-primary/50 hidden sm:block" />
            <span className="hidden sm:block font-medium">Quản lý bài viết</span>
          </div>
          <PostDetailActions
            postId={(post._id ?? post.id) as string}
            postSlug={post.slug}
            isPublished={post.isPublished ?? false}
            postData={{
              title: post.title,
              slug: post.slug,
              description: post.description,
              content: post.content,
              author: post.author,
              category: post.category,
              tags: post.tags,
              coverImage: post.coverImage,
              isPublished: post.isPublished,
            }}
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">
        {/* Article */}
        <article className="flex-1 min-w-0">
          <header className="mb-8">
            {post.category && (
              <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
              {post.title}
            </h1>

            {post.description && (
              <p className="text-lg text-muted-foreground mb-5">
                {post.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-5 border-b border-border">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
                {post.author.name}
              </span>
              {post.publishedAt && (
                <span>📅 {formatDate(post.publishedAt)}</span>
              )}
              <span>📖 {readingTime}</span>
              {post.viewCount !== undefined && post.viewCount > 0 && (
                <span>👁 {post.viewCount} lượt xem</span>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* MDX Content */}
          <div className="prose-content">
            {post.content ? (
              <MDXRemote
                source={post.content}
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
          {post.resources && post.resources.length > 0 && (
            <section className="mt-10 pt-6 border-t border-border">
              <h2 className="text-lg font-semibold mb-4">📚 Tài liệu tham khảo</h2>
              <ul className="space-y-2">
                {post.resources.map((r, i) => (
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
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              ← Về trang Blog
            </Link>
          </footer>
        </article>

        {/* Sidebar */}
        {relatedRoadmaps.length > 0 && (
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-20">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                🗺️ Roadmaps liên quan
              </h3>
              <ul className="space-y-2">
                {relatedRoadmaps.map((r) => (
                  <li key={r!.slug}>
                    <Link
                      href={`/roadmap/${r!.slug}`}
                      className="block rounded-lg border border-border px-3 py-2.5 hover:border-primary/50 hover:bg-muted/50 transition-all text-sm"
                    >
                      <p className="font-medium leading-snug line-clamp-2">
                        {r!.title}
                      </p>
                      {r!.category && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r!.category}
                        </p>
                      )}
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
