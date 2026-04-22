// ============================================================
// APP/ROADMAP/[ROADMAP-SLUG]/PAGE.TSX
// ============================================================
// ✅ force-dynamic: luôn fetch mới, không cache ISR
// ✅ getRoadmapBySlug bỏ isPublished → draft không 404
// ✅ searchParams ?mode=edit → mở edit mode ngay sau khi tạo
// ✅ Draft banner hiển thị khi chưa publish

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

// ✅ Không dùng ISR cache → data luôn mới sau khi tạo/sửa
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
  if (!roadmap) {
    return { title: "Roadmap không tồn tại", robots: { index: false } };
  }
  const url = getCanonicalUrl("roadmap", roadmap.slug);
  const description = extractExcerpt(roadmap.description, 160);
  return {
    title: roadmap.title,
    description,
    keywords: roadmap.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "website", url, title: roadmap.title, description,
      images: roadmap.coverImage
        ? [{ url: roadmap.coverImage, width: 1200, height: 630, alt: roadmap.title }]
        : [{ url: "/og-default.png", width: 1200, height: 630 }],
      siteName: process.env.NEXT_PUBLIC_APP_NAME,
      locale: "vi_VN",
    },
    twitter: { card: "summary_large_image", title: roadmap.title, description },
    robots: roadmap.isPublished ? { index: true, follow: true } : { index: false },
  };
}

export default async function RoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ "roadmap-slug": string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { "roadmap-slug": slug } = await params;
  const { mode: modeParam } = await searchParams;

  // ✅ Không còn lọc isPublished → draft không 404 sau khi tạo
  const roadmap = await getRoadmapBySlug(slug);
  if (!roadmap) notFound();

  // ✅ Đọc ?mode=edit từ URL → CreateRoadmapForm redirect vào đây
  const initialMode: AppMode = modeParam === "edit" ? "edit" : "view";

  if (roadmap.isPublished) void incrementViewCount(slug);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {roadmap.isPublished && <CourseJsonLd roadmap={roadmap as IRoadmap} />}

      {/* ✅ Banner Draft — nhắc nhở khi chưa publish */}
      {!roadmap.isPublished && (
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-300 flex-shrink-0">
          <span>📝</span>
          <span className="font-medium">Chế độ Draft</span>
          <span className="text-yellow-600 dark:text-yellow-400 ml-1 hidden sm:inline">
            — Chưa xuất bản. Bấm <strong>🌐 Xuất bản</strong> trong toolbar để public.
          </span>
        </div>
      )}

      <RoadmapBuilder
        roadmap={roadmap as IRoadmap}
        mode={initialMode}
      />
    </div>
  );
}
