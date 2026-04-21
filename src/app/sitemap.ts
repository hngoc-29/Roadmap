// ============================================================
// APP/SITEMAP.TS - Dynamic Sitemap Generator
// ============================================================
// ✅ Bao gồm: static pages, roadmap pages, node pages, content pages, blog posts

import type { MetadataRoute } from "next";
import { getAllRoadmapSlugs } from "@/actions/roadmap";
import { getAllContentSlugs } from "@/actions/content";
import { getAllPostSlugs } from "@/actions/post";

export const revalidate = 43200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${appUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${appUrl}/content`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const [roadmaps, contentSlugs, postSlugs] = await Promise.all([
      getAllRoadmapSlugs(),
      getAllContentSlugs(),
      getAllPostSlugs(),
    ]);

    const roadmapPages: MetadataRoute.Sitemap = roadmaps.map((r) => ({
      url: `${appUrl}/roadmap/${r.slug}`,
      lastModified: new Date(r.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const nodeLessonPages: MetadataRoute.Sitemap = roadmaps.flatMap((r) =>
      r.nodes.map((node) => ({
        url: `${appUrl}/roadmap/${r.slug}/${node.data.slug}`,
        lastModified: new Date(r.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    );

    const contentPages: MetadataRoute.Sitemap = contentSlugs.map((c) => ({
      url: `${appUrl}/content/${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const blogPages: MetadataRoute.Sitemap = postSlugs.map((p) => ({
      url: `${appUrl}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...roadmapPages, ...nodeLessonPages, ...contentPages, ...blogPages];
  } catch {
    return staticPages;
  }
}
