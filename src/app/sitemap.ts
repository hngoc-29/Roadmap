// ============================================================
// APP/SITEMAP.TS - Dynamic Sitemap Generator
// ============================================================
// ✅ Next.js 15 Metadata Route API - tự động generate /sitemap.xml
// ✅ Google dùng sitemap để crawl & index tất cả trang
// ✅ Bao gồm cả roadmap pages lẫn node lesson pages

import type { MetadataRoute } from "next";
import { getAllRoadmapSlugs } from "@/actions/roadmap";

// Revalidate sitemap mỗi 12 giờ
export const revalidate = 43200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // ── Static pages ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0, // Trang chủ quan trọng nhất
    },
    {
      url: `${appUrl}/builder/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── Dynamic pages từ MongoDB ──
  try {
    const roadmaps = await getAllRoadmapSlugs();

    const roadmapPages: MetadataRoute.Sitemap = roadmaps.map((r) => ({
      url: `${appUrl}/roadmap/${r.slug}`,
      lastModified: new Date(r.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9, // Trang roadmap khá quan trọng
    }));

    // Tất cả node lesson pages (quan trọng nhất về content SEO)
    const nodeLessonPages: MetadataRoute.Sitemap = roadmaps.flatMap((r) =>
      r.nodes.map((node) => ({
        url: `${appUrl}/roadmap/${r.slug}/${node.data.slug}`,
        lastModified: new Date(r.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8, // Cao vì đây là content pages
      }))
    );

    return [...staticPages, ...roadmapPages, ...nodeLessonPages];
  } catch {
    // Nếu DB lỗi, chỉ trả về static pages
    return staticPages;
  }
}
