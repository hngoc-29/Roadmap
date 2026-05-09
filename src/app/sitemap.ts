// ============================================================
// APP/SITEMAP.TS — Dynamic sitemap (force-dynamic, no cache)
// ============================================================
// Dùng force-dynamic + truy vấn DB trực tiếp (không qua
// unstable_cache) để sitemap luôn phản ánh dữ liệu mới nhất
// ngay khi bất kỳ nội dung public nào được thêm/xóa.

import type { MetadataRoute } from "next";
import mongoose from "mongoose";

// Force Next.js không cache route /sitemap.xml
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ── Helper ───────────────────────────────────────────────────
const safeDate = (d: unknown): Date => {
  if (!d) return new Date();
  const parsed = new Date(d as string | Date);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// ── Direct DB fetch (bypass all cache layers) ─────────────────
// Truy vấn MongoDB trực tiếp qua connection singleton của Mongoose
// (không qua Mongoose model để tránh bất kỳ model-level caching nào)
async function fetchSitemapData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return { roadmaps: [], posts: [], contents: [] };

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
  }

  const db = mongoose.connection.db;
  if (!db) return { roadmaps: [], posts: [], contents: [] };

  const [roadmaps, posts, contents] = await Promise.all([
    db
      .collection("roadmaps")
      .find(
        { isPublished: true },
        { projection: { slug: 1, "nodes.data.slug": 1, updatedAt: 1 } }
      )
      .toArray(),
    db
      .collection("posts")
      .find({ isPublished: true }, { projection: { slug: 1, updatedAt: 1 } })
      .toArray(),
    db
      .collection("contents")
      .find({}, { projection: { slug: 1, updatedAt: 1 } })
      .toArray(),
  ]);

  return { roadmaps, posts, contents };
}

// ── Sitemap ───────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const now = new Date();

  // 1. Trang tĩnh
  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${appUrl}/blog`,          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${appUrl}/content`,       lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${appUrl}/guide`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${appUrl}/guide/install`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/roadmap`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/blog`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/content`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/notes`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/guide/mdx`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const { roadmaps, posts, contents } = await fetchSitemapData();

    type RawRoadmap = {
      slug: string;
      nodes?: { data?: { slug?: string } }[];
      updatedAt?: Date;
    };

    // 2. Roadmap pages (chỉ published)
    const roadmapPages: MetadataRoute.Sitemap = (roadmaps as unknown as RawRoadmap[]).map(
      (r) => ({
        url: `${appUrl}/roadmap/${r.slug}`,
        lastModified: safeDate(r.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })
    );

    // 3. Node lesson pages
    const nodePages: MetadataRoute.Sitemap = (roadmaps as unknown as RawRoadmap[]).flatMap(
      (r) =>
        (r.nodes ?? [])
          .filter((n) => n?.data?.slug)
          .map((n) => ({
            url: `${appUrl}/roadmap/${r.slug}/${n.data!.slug}`,
            lastModified: safeDate(r.updatedAt),
            changeFrequency: "monthly" as const,
            priority: 0.7,
          }))
    );

    // 4. Content pages
    const contentPages: MetadataRoute.Sitemap = (
      contents as unknown as { slug: string; updatedAt: Date }[]
    ).map((c) => ({
      url: `${appUrl}/content/${c.slug}`,
      lastModified: safeDate(c.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // 5. Blog pages (chỉ published)
    const blogPages: MetadataRoute.Sitemap = (
      posts as unknown as { slug: string; updatedAt: Date }[]
    ).map((p) => ({
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
