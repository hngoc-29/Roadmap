// ============================================================
// APP/ROADMAP/[ROADMAP-SLUG]/PAGE.TSX
// ============================================================
// ✅ Server Component với generateMetadata động
// ✅ generateStaticParams cho Static Site Generation (SSG)
// ✅ ISR: Tự động rebuild khi content thay đổi

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoadmapBySlug, getAllRoadmapSlugs, incrementViewCount } from "@/actions/roadmap";
import { getCanonicalUrl, extractExcerpt } from "@/lib/utils";
import { CourseJsonLd } from "@/components/JsonLd";
import RoadmapBuilder from "@/components/RoadmapBuilder";
import type { IRoadmap } from "@/types";

// ──────────────────────────────────────────────
// CACHE STRATEGY
// ──────────────────────────────────────────────
// Trang roadmap ít thay đổi → cache lâu, revalidate theo ISR
export const revalidate = 3600; // 1 giờ

// ──────────────────────────────────────────────
// GENERATE STATIC PARAMS - Pre-render lúc build time
// ✅ Tất cả roadmaps published sẽ được generate thành HTML tĩnh
// ✅ Khi user truy cập → serve từ CDN (cực nhanh, LCP tốt)
// ──────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const roadmaps = await getAllRoadmapSlugs();
    return roadmaps.map((r) => ({ "roadmap-slug": r.slug }));
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
// GENERATE METADATA - SEO động theo từng roadmap
// ✅ Next.js tự động inject vào <head> mà không cần client JS
// ──────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ "roadmap-slug": string }>;
}): Promise<Metadata> {
  const { "roadmap-slug": slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);

  // Nếu không tìm thấy → trả về metadata mặc định (không 404 ở đây)
  if (!roadmap) {
    return {
      title: "Roadmap không tồn tại",
      description: "Roadmap bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
      robots: { index: false }, // Không index trang 404
    };
  }

  const url = getCanonicalUrl("roadmap", roadmap.slug);
  const description = extractExcerpt(roadmap.description, 160);

  return {
    title: roadmap.title,
    description,
    keywords: roadmap.tags,

    // ✅ Canonical URL: Tránh duplicate content
    alternates: {
      canonical: url,
    },

    // ✅ OpenGraph: Hiển thị đẹp khi share lên mạng xã hội
    openGraph: {
      type: "website",
      url,
      title: roadmap.title,
      description,
      images: roadmap.coverImage
        ? [
            {
              url: roadmap.coverImage,
              width: 1200,
              height: 630,
              alt: roadmap.title,
            },
          ]
        : [{ url: "/og-default.png", width: 1200, height: 630 }],
      siteName: process.env.NEXT_PUBLIC_APP_NAME,
      locale: "vi_VN",
    },

    // ✅ Twitter Card
    twitter: {
      card: "summary_large_image",
      title: roadmap.title,
      description,
      images: roadmap.coverImage ? [roadmap.coverImage] : ["/og-default.png"],
    },

    // ✅ Article-specific metadata
    other: {
      "article:author": roadmap.author.name,
      "article:tag": roadmap.tags?.join(", ") ?? "",
    },
  };
}

// ──────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────
export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ "roadmap-slug": string }>;
}) {
  const { "roadmap-slug": slug } = await params;

  // Fetch data (được cache bởi Next.js fetch cache hoặc ISR)
  const roadmap = await getRoadmapBySlug(slug);

  if (!roadmap) {
    notFound(); // → 404 page
  }

  // Tăng view count (không await để không block rendering)
  // Fire-and-forget pattern: không cần chờ DB update xong
  void incrementViewCount(slug);

  return (
    <>
      {/* ✅ JSON-LD được render trong <head> bởi Next.js */}
      <CourseJsonLd roadmap={roadmap as IRoadmap} />

      {/* 
        ✅ QUAN TRỌNG: RoadmapBuilder là Client Component
        Nhưng data được fetch ở Server → truyền xuống qua props
        Pattern: Server fetches → Client renders interactive UI
      */}
      <RoadmapBuilder
        roadmap={roadmap as IRoadmap}
        mode="view" // Mặc định là chế độ xem
      />
    </>
  );
}
