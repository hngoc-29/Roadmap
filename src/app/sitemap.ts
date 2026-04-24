// ============================================================
// APP/SITEMAP.TS — Dynamic sitemap với proper caching
// ============================================================
// Vấn đề cũ:
//   1. `revalidate = 43200` không có tác dụng với sitemap —
//      Next.js App Router không áp dụng route segment config cho
//      sitemap.ts theo cách ISR thông thường.
//   2. Các Server Actions không cache → mỗi request /sitemap.xml
//      đều hit MongoDB trực tiếp, gây chậm và tốn kết nối.
//   3. Hiển thị cả roadmap chưa publish và blog nháp lên sitemap.
//   4. Thiếu các trang guide sub-pages.
//
// Giải pháp:
//   - Wrap mỗi DB query bằng `unstable_cache` (Next.js built-in)
//     với revalidate 12h — cache được lưu trong Data Cache của Next.js
//     và tự động invalidate khi gọi revalidateTag().
//   - Lọc đúng isPublished = true cho roadmap và blog.
//   - Thêm đầy đủ guide sub-pages.

import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import Post from "@/models/Post";
import Content from "@/models/Content";

// ── Cache TTL ────────────────────────────────────────────────
const SITEMAP_CACHE_SECONDS = 60 * 60 * 12; // 12 giờ

// ── Helper ───────────────────────────────────────────────────
const safeDate = (d: string | Date | undefined | null): Date => {
  if (!d) return new Date();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// ── Cached DB fetchers ────────────────────────────────────────
// unstable_cache tạo một layer cache trên Data Cache của Next.js.
// Key cache độc lập với request → nhiều request đến /sitemap.xml
// trong 12h chỉ hit DB một lần duy nhất.

type RoadmapLean = {
  slug: string;
  nodes?: { data?: { slug?: string } }[];
  updatedAt?: Date;
};

const getCachedPublishedRoadmaps = unstable_cache(
  async () => {
    await connectDB();
    const docs = await Roadmap.find(
      { isPublished: true },
      { slug: 1, "nodes.data.slug": 1, updatedAt: 1 }
    ).lean<RoadmapLean[]>();
    return docs as Array<{
      slug: string;
      nodes: Array<{ data: { slug: string } }>;
      updatedAt: Date;
    }>;
  },
  ["sitemap-roadmaps"],
  { revalidate: SITEMAP_CACHE_SECONDS, tags: ["sitemap", "roadmaps"] }
);

const getCachedPublishedPosts = unstable_cache(
  async () => {
    await connectDB();
    const docs = await Post.find(
      { isPublished: true },
      { slug: 1, updatedAt: 1 }
    ).lean();
    return docs as Array<{ slug: string; updatedAt: Date }>;
  },
  ["sitemap-posts"],
  { revalidate: SITEMAP_CACHE_SECONDS, tags: ["sitemap", "posts"] }
);

const getCachedContentSlugs = unstable_cache(
  async () => {
    await connectDB();
    const docs = await Content.find({}, { slug: 1, updatedAt: 1 }).lean();
    return docs as Array<{ slug: string; updatedAt: Date }>;
  },
  ["sitemap-content"],
  { revalidate: SITEMAP_CACHE_SECONDS, tags: ["sitemap", "content"] }
);

// ── Sitemap ───────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  // 1. Trang tĩnh
  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl,                     lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
    { url: `${appUrl}/blog`,           lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
    { url: `${appUrl}/content`,        lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // Guide — index + tất cả sub-pages
    { url: `${appUrl}/guide`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${appUrl}/guide/install`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/roadmap`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/blog`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/content`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/notes`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/mdx`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const [roadmaps, posts, contents] = await Promise.all([
      getCachedPublishedRoadmaps(),
      getCachedPublishedPosts(),
      getCachedContentSlugs(),
    ]);

    // 2. Roadmap pages (chỉ đã publish)
    const roadmapPages: MetadataRoute.Sitemap = roadmaps.map((r) => ({
      url: `${appUrl}/roadmap/${r.slug}`,
      lastModified: safeDate(r.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    // 3. Node lesson pages
    const nodePages: MetadataRoute.Sitemap = roadmaps.flatMap((r) =>
      (r.nodes ?? [])
        .filter((n) => n?.data?.slug)
        .map((n) => ({
          url: `${appUrl}/roadmap/${r.slug}/${n.data.slug}`,
          lastModified: safeDate(r.updatedAt),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }))
    );

    // 4. Content pages
    const contentPages: MetadataRoute.Sitemap = contents.map((c) => ({
      url: `${appUrl}/content/${c.slug}`,
      lastModified: safeDate(c.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // 5. Blog pages (chỉ đã publish)
    const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${appUrl}/blog/${p.slug}`,
      lastModified: safeDate(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [
      ...staticPages,
      ...roadmapPages,
      ...nodePages,
      ...contentPages,
      ...blogPages,
    ];
  } catch (err) {
    console.error("[sitemap] Lỗi khi tạo sitemap:", err);
    return staticPages;
  }
}
