// ============================================================
// APP/ROADMAP/[ROADMAP-SLUG]/[NODE-SLUG]/PAGE.TSX
// ============================================================
// ✅ force-dynamic + getNodeBySlug bỏ isPublished filter

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

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const roadmaps = await getAllRoadmapSlugs();
    return roadmaps.flatMap((r) =>
      r.nodes.map((node) => ({
        "roadmap-slug": r.slug,
        "node-slug": node.data.slug,
      }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "roadmap-slug": string; "node-slug": string }>;
}): Promise<Metadata> {
  const { "roadmap-slug": roadmapSlug, "node-slug": nodeSlug } = await params;
  const result = await getNodeBySlug(roadmapSlug, nodeSlug);
  if (!result) return { title: "Bài học không tồn tại", robots: { index: false } };

  const { roadmapTitle, node } = result;
  const nodeData = (node as { data: { label: string; content: string; description?: string; tags?: string[] } }).data;
  const description = nodeData.description || extractExcerpt(nodeData.content ?? "", 160);
  const url = getCanonicalUrl("roadmap", roadmapSlug, nodeSlug);

  return {
    title: `${nodeData.label} | ${roadmapTitle}`,
    description,
    keywords: nodeData.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article", url,
      title: `${nodeData.label} | ${roadmapTitle}`,
      description,
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
      locale: "vi_VN",
    },
    twitter: { card: "summary_large_image", title: `${nodeData.label} | ${roadmapTitle}`, description },
  };
}

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
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto border border-border text-sm my-4">{children}</pre>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    className ? <code className={className}>{children}</code>
    : <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-4 py-1 italic text-muted-foreground my-4">{children}</blockquote>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined}
       rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
       className="text-primary underline underline-offset-4 hover:text-primary/80">{children}</a>
  ),
};

export default async function NodeLessonPage({
  params,
}: {
  params: Promise<{ "roadmap-slug": string; "node-slug": string }>;
}) {
  const { "roadmap-slug": roadmapSlug, "node-slug": nodeSlug } = await params;
  const result = await getNodeBySlug(roadmapSlug, nodeSlug);
  if (!result) notFound();

  const { roadmapTitle, roadmapSlug: rSlug, node } = result;
  const nodeData = (node as {
    data: {
      label: string; content: string; description?: string;
      tags?: string[]; estimatedTime?: string; difficulty?: string; icon?: string;
    }
  }).data;
  const readingTime = estimateReadingTime(nodeData.content ?? "");

  return (
    <div className="min-h-screen bg-background">
      <ArticleJsonLd
        title={nodeData.label}
        description={nodeData.description ?? extractExcerpt(nodeData.content ?? "")}
        slug={nodeSlug}
        roadmapSlug={rSlug}
        authorName="Roadmap Builder"
        tags={nodeData.tags}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b bg-muted/30 px-4 py-3">
        <ol className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <li><Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/roadmap/${rSlug}`} className="hover:text-foreground transition-colors">{roadmapTitle}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground font-medium truncate max-w-xs">{nodeData.label}</li>
        </ol>
      </nav>

      <article className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          {nodeData.icon && <div className="text-5xl mb-4">{nodeData.icon}</div>}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{nodeData.label}</h1>
          {nodeData.description && (
            <p className="text-lg text-muted-foreground mb-4">{nodeData.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted-foreground">📖 {readingTime}</span>
            {nodeData.estimatedTime && <span className="text-muted-foreground">⏱️ {nodeData.estimatedTime}</span>}
            {nodeData.difficulty && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                nodeData.difficulty === "beginner" ? "bg-green-100 text-green-700"
                : nodeData.difficulty === "intermediate" ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
              }`}>
                {nodeData.difficulty === "beginner" ? "Cơ bản"
                 : nodeData.difficulty === "intermediate" ? "Trung cấp" : "Nâng cao"}
              </span>
            )}
          </div>
          {nodeData.tags && nodeData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {nodeData.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md">#{tag}</span>
              ))}
            </div>
          )}
        </header>

        <div className="prose-content">
          {nodeData.content ? (
            <MDXRemote
              source={nodeData.content}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, rehypeHighlight] } }}
            />
          ) : (
            <p className="text-muted-foreground italic">Nội dung đang được cập nhật...</p>
          )}
        </div>

        <footer className="mt-12 pt-6 border-t border-border">
          <Link href={`/roadmap/${rSlug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            ← Quay về {roadmapTitle}
          </Link>
        </footer>
      </article>
    </div>
  );
}
