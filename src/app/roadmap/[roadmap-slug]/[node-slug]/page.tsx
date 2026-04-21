// ============================================================
// APP/ROADMAP/[ROADMAP-SLUG]/[NODE-SLUG]/PAGE.TSX
// ============================================================
// Đây là trang bài học chi tiết - mục tiêu SEO chính của dự án
// ✅ Mỗi node → 1 trang riêng → Google index từng bài học
// ✅ Server Component render MDX content (SSG + ISR)

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { getNodeBySlug, getAllRoadmapSlugs } from "@/actions/roadmap";
import { getCanonicalUrl, extractExcerpt, estimateReadingTime } from "@/lib/utils";
import { ArticleJsonLd } from "@/components/JsonLd";

// ──────────────────────────────────────────────
// CACHE: Node pages thay đổi ít → cache lâu
// ──────────────────────────────────────────────
export const revalidate = 3600;

// ──────────────────────────────────────────────
// GENERATE STATIC PARAMS
// Tạo tất cả [roadmap-slug]/[node-slug] combinations lúc build
// ──────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const roadmaps = await getAllRoadmapSlugs();
    return roadmaps.flatMap((roadmap) =>
      roadmap.nodes.map((node) => ({
        "roadmap-slug": roadmap.slug,
        "node-slug": node.data.slug,
      }))
    );
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
// GENERATE METADATA - SEO tối ưu cho từng bài học
// ──────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ "roadmap-slug": string; "node-slug": string }>;
}): Promise<Metadata> {
  const { "roadmap-slug": roadmapSlug, "node-slug": nodeSlug } = await params;
  const result = await getNodeBySlug(roadmapSlug, nodeSlug);

  if (!result) {
    return {
      title: "Bài học không tồn tại",
      robots: { index: false },
    };
  }

  const { roadmapTitle, node } = result;
  const nodeData = (node as { data: { label: string; content: string; description?: string; tags?: string[] } }).data;
  
  // ✅ Description: ưu tiên description riêng, fallback sang excerpt từ content
  const description =
    nodeData.description ||
    extractExcerpt(nodeData.content ?? "", 160) ||
    `Bài học ${nodeData.label} trong lộ trình ${roadmapTitle}`;

  const url = getCanonicalUrl("roadmap", roadmapSlug, nodeSlug);

  return {
    // ✅ Title pattern: "Tên bài học | Tên Roadmap | App Name"
    title: `${nodeData.label} | ${roadmapTitle}`,
    description,
    keywords: nodeData.tags,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: "article",
      url,
      title: `${nodeData.label} | ${roadmapTitle}`,
      description,
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
      locale: "vi_VN",
      // Article-specific OG tags
      publishedTime: new Date().toISOString(), // ideally từ DB
      tags: nodeData.tags,
    },

    twitter: {
      card: "summary_large_image",
      title: `${nodeData.label} | ${roadmapTitle}`,
      description,
    },
  };
}

// ──────────────────────────────────────────────
// MDX COMPONENTS - Custom render cho Markdown elements
// ──────────────────────────────────────────────
const mdxComponents = {
  // Override default elements với styled versions
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 scroll-mt-20">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3 scroll-mt-20">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-xl font-medium mt-5 mb-2 scroll-mt-20">{children}</h3>
  ),
  // Code block với syntax highlighting
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto border border-border text-sm my-4">
      {children}
    </pre>
  ),
  // Inline code
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    // Nếu có className = đây là code block (đã được render bởi <pre>)
    if (className) return <code className={className}>{children}</code>;
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  },
  // Callout boxes
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-4 py-1 italic text-muted-foreground my-4">
      {children}
    </blockquote>
  ),
  // Links
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

// ──────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────
export default async function NodeLessonPage({
  params,
}: {
  params: Promise<{ "roadmap-slug": string; "node-slug": string }>;
}) {
  const { "roadmap-slug": roadmapSlug, "node-slug": nodeSlug } = await params;

  const result = await getNodeBySlug(roadmapSlug, nodeSlug);
  if (!result) notFound();

  const { roadmapTitle, roadmapSlug: rSlug, node } = result;
  const nodeData = (node as { data: { label: string; content: string; description?: string; tags?: string[]; estimatedTime?: string; difficulty?: string; icon?: string } }).data;
  const readingTime = estimateReadingTime(nodeData.content ?? "");

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ JSON-LD cho trang bài học */}
      <ArticleJsonLd
        title={nodeData.label}
        description={nodeData.description ?? extractExcerpt(nodeData.content ?? "")}
        slug={nodeSlug}
        roadmapSlug={rSlug}
        authorName="Roadmap Builder"
        tags={nodeData.tags}
      />

      {/* ── Navigation breadcrumb ── */}
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
              href={`/roadmap/${rSlug}`}
              className="hover:text-foreground transition-colors"
            >
              {roadmapTitle}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li
            aria-current="page"
            className="text-foreground font-medium truncate max-w-xs"
          >
            {nodeData.label}
          </li>
        </ol>
      </nav>

      {/* ── Main content ── */}
      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* Article Header */}
        <header className="mb-8">
          {nodeData.icon && (
            <div className="text-5xl mb-4">{nodeData.icon}</div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {nodeData.label}
          </h1>

          {nodeData.description && (
            <p className="text-lg text-muted-foreground mb-4">
              {nodeData.description}
            </p>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              📖 {readingTime}
            </span>
            {nodeData.estimatedTime && (
              <span className="flex items-center gap-1 text-muted-foreground">
                ⏱️ {nodeData.estimatedTime}
              </span>
            )}
            {nodeData.difficulty && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  nodeData.difficulty === "beginner"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : nodeData.difficulty === "intermediate"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {nodeData.difficulty === "beginner"
                  ? "Cơ bản"
                  : nodeData.difficulty === "intermediate"
                  ? "Trung cấp"
                  : "Nâng cao"}
              </span>
            )}
          </div>

          {/* Tags */}
          {nodeData.tags && nodeData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {nodeData.tags.map((tag) => (
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

        {/* ✅ MDX Content - Server-side rendered (tốt cho SEO) */}
        {/* next-mdx-remote/rsc chạy trên server → không cần client JS */}
        <div className="prose-content">
          {nodeData.content ? (
            <MDXRemote
              source={nodeData.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,      // Thêm id cho headings (anchor links)
                    rehypeHighlight, // Syntax highlighting cho code blocks
                  ],
                },
              }}
            />
          ) : (
            <p className="text-muted-foreground italic">
              Nội dung đang được cập nhật...
            </p>
          )}
        </div>

        {/* Navigation: Back to roadmap */}
        <footer className="mt-12 pt-6 border-t border-border">
          <Link
            href={`/roadmap/${rSlug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            ← Quay về lộ trình {roadmapTitle}
          </Link>
        </footer>
      </article>
    </div>
  );
}
