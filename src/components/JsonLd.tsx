// ============================================================
// COMPONENTS/JSON-LD.TSX - Structured Data (Schema.org)
// ============================================================
// ✅ Server Component - render trực tiếp trong <head>
// ✅ Giúp Google hiểu nội dung tốt hơn → Rich Results
// ✅ Zero client-side JS (không dùng 'use client')

import type { IRoadmap } from "@/types";
import { getCanonicalUrl } from "@/lib/utils";

// ──────────────────────────────────────────────
// TYPE DEFINITIONS
// ──────────────────────────────────────────────
interface CourseJsonLdProps {
  roadmap: IRoadmap;
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  roadmapSlug: string;
  authorName: string;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
}

// ──────────────────────────────────────────────
// COMPONENT 1: Course Schema (cho trang Roadmap)
// Hiển thị trên Google Search dạng "Course"
// ──────────────────────────────────────────────
export function CourseJsonLd({ roadmap }: CourseJsonLdProps) {
  const url = getCanonicalUrl("roadmap", roadmap.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": url,
    name: roadmap.title,
    description: roadmap.description,
    url,
    // Nhà cung cấp khóa học
    provider: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "Roadmap Builder",
      url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    },
    // Tác giả
    author: {
      "@type": "Person",
      name: roadmap.author.name,
    },
    // Danh sách modules (mỗi node = 1 bài học)
    hasCourseInstance: roadmap.nodes.map((node) => ({
      "@type": "CourseInstance",
      name: node.data.label,
      url: getCanonicalUrl("roadmap", roadmap.slug, node.data.slug),
      courseMode: "online",
    })),
    // Keywords từ tags
    keywords: roadmap.tags?.join(", "),
    // Ảnh thumbnail
    ...(roadmap.coverImage && {
      image: {
        "@type": "ImageObject",
        url: roadmap.coverImage,
        width: 1200,
        height: 630,
      },
    }),
    // Ngày tạo & cập nhật (quan trọng cho SEO freshness)
    dateCreated: roadmap.createdAt?.toString(),
    dateModified: roadmap.updatedAt?.toString(),
    // Breadcrumb cho trang roadmap
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang chủ",
          item: process.env.NEXT_PUBLIC_APP_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: roadmap.title,
          item: url,
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      // ✅ dangerouslySetInnerHTML cần thiết cho JSON-LD
      // An toàn vì chúng ta serialize từ server data đã validate
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ──────────────────────────────────────────────
// COMPONENT 2: Article Schema (cho trang bài học)
// Hiển thị trên Google Search dạng "Article" với breadcrumbs
// ──────────────────────────────────────────────
export function ArticleJsonLd({
  title,
  description,
  slug,
  roadmapSlug,
  authorName,
  publishedAt,
  updatedAt,
  tags,
}: ArticleJsonLdProps) {
  const url = getCanonicalUrl("roadmap", roadmapSlug, slug);
  const roadmapUrl = getCanonicalUrl("roadmap", roadmapSlug);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Roadmap Builder";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: title,
    description,
    url,
    // ✅ Author schema
    author: {
      "@type": "Person",
      name: authorName,
    },
    // ✅ Publisher schema
    publisher: {
      "@type": "Organization",
      name: appName,
      url: appUrl,
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/logo.png`,
      },
    },
    // ✅ Dates (quan trọng cho Google indexing freshness)
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    // Keywords
    keywords: tags?.join(", "),
    // ✅ isPartOf: Chỉ ra bài này thuộc khóa học nào
    isPartOf: {
      "@type": "Course",
      "@id": roadmapUrl,
    },
    // ✅ Breadcrumbs: Hiển thị path trên Google Search
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang chủ",
          item: appUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Roadmap",
          item: roadmapUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: url,
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ──────────────────────────────────────────────
// COMPONENT 3: WebSite Schema (cho trang chủ)
// Kích hoạt Sitelinks Searchbox trên Google
// ──────────────────────────────────────────────
export function WebSiteJsonLd() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Roadmap Builder";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${appUrl}/#website`,
    name: appName,
    url: appUrl,
    description:
      "Xây dựng và chia sẻ lộ trình học lập trình trực quan với công cụ kéo thả.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${appUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
