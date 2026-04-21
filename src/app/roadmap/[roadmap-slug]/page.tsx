// ============================================================
// APP/ROADMAP/[ROADMAP-SLUG]/PAGE.TSX
// ============================================================
// ✅ FIX 1: force-dynamic → không cache, data luôn mới
// ✅ FIX 2: getRoadmapBySlug bỏ isPublished → draft không 404
// ✅ FIX 3: Đọc ?mode=edit từ URL → mở edit mode ngay sau khi tạo

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getRoadmapBySlug,
  getAllRoadmapSlugs,
  incrementViewCount,
} from "@/actions/roadmap";
import { getCanonicalUrl, extractExcerpt } from "@/lib/utils";
import { CourseJsonLd } from "@/components/JsonLd";
import RoadmapBuilder from "@/components/RoadmapBuilder";
import type { IRoadmap, AppMode } from "@/types";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const roadmaps = await getAllRoadmapSlugs();
    return roadmaps.map((r) => ({ "roadmap-slug": r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "roadmap-slug": string }>;
}): Promise<Metadata> {
  const { "roadmap-slug": slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);
  if (!roadmap)
    return { title: "Roadmap không tồn tại", robots: { index: false } };

  const url = getCanonicalUrl("roadmap", roadmap.slug);
  const description = extractExcerpt(roadmap.description, 160);
  return {
    title: roadmap.title,
    description,
    keywords: roadmap.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: roadmap.title,
      description,
      images: roadmap.coverImage
        ? [{ url: roadmap.coverImage, width: 1200, height: 630, alt: roadmap.title }]
        : [{ url: "/og-default.png", width: 1200, height: 630 }],
      siteName: process.env.NEXT_PUBLIC_APP_NAME,
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: roadmap.title,
      description,
    },
    robots: roadmap.isPublished
      ? { index: true, follow: true }
      : { index: false },
  };
}

export default async function RoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ "roadmap-slug": string }>;
  // ✅ FIX: Đọc ?mode=edit từ URL
  searchParams: Promise<{ mode?: string }>;
}) {
  const { "roadmap-slug": slug } = await params;
  const { mode: modeParam } = await searchParams;

  const roadmap = await getRoadmapBySlug(slug);
  if (!roadmap) notFound();

  // ✅ FIX: Nếu URL có ?mode=edit → mở edit mode ngay
  // Dùng khi CreateRoadmapForm redirect sau khi tạo thành công
  const initialMode: AppMode = modeParam === "edit" ? "edit" : "view";

  if (roadmap.isPublished) void incrementViewCount(slug);

  return (
    <>
      {roadmap.isPublished && <CourseJsonLd roadmap={roadmap as IRoadmap} />}

      {/* Banner Draft */}
      {!roadmap.isPublished && (
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
          <span>📝</span>
          <span className="font-medium">Chế độ Draft</span>
          <span className="text-yellow-600 dark:text-yellow-400 ml-1">
            — Roadmap này chưa được xuất bản. Chuyển sang Edit mode để thêm nội dung và Publish.
          </span>
        </div>
      )}

      {/* ✅ Truyền initialMode từ URL param vào Builder */}
      <RoadmapBuilder
        roadmap={roadmap as IRoadmap}
        mode={initialMode}
      />
    </>
  );
}
