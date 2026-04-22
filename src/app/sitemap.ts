import type { MetadataRoute } from "next";
import { getAllRoadmapSlugs } from "@/actions/roadmap";
import { getAllContentSlugs } from "@/actions/content";
import { getAllPostSlugs } from "@/actions/post";

export const revalidate = 43200;

/**
 * Hàm hỗ trợ xử lý ngày tháng an toàn.
 * Nếu updatedAt bị thiếu hoặc không hợp lệ, sẽ trả về ngày hiện tại.
 */
const safeDate = (dateStr: string | Date | undefined | null): Date => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${appUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${appUrl}/content`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${appUrl}/guide`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    // Gọi API lấy dữ liệu đồng thời để tối ưu hiệu suất
    const [roadmaps, contentSlugs, postSlugs] = await Promise.all([
      getAllRoadmapSlugs(),
      getAllContentSlugs(),
      getAllPostSlugs(),
    ]);

    // 2. Roadmap Pages
    const roadmapPages: MetadataRoute.Sitemap = roadmaps.map((r) => ({
      url: `${appUrl}/roadmap/${r.slug}`,
      lastModified: safeDate(r.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    // 3. Node Lesson Pages (FlatMap từ roadmaps)
    const nodeLessonPages: MetadataRoute.Sitemap = roadmaps.flatMap((r) =>
      r.nodes.map((node: { data: { slug: string } }) => ({
        url: `${appUrl}/roadmap/${r.slug}/${node.data.slug}`,
        lastModified: safeDate(r.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    );

    // 4. Content Pages
    const contentPages: MetadataRoute.Sitemap = contentSlugs.map((c) => ({
      url: `${appUrl}/content/${c.slug}`,
      lastModified: safeDate(c.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // 5. Blog Posts
    const blogPages: MetadataRoute.Sitemap = postSlugs.map((p) => ({
      url: `${appUrl}/blog/${p.slug}`,
      lastModified: safeDate(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [
      ...staticPages,
      ...roadmapPages,
      ...nodeLessonPages,
      ...contentPages,
      ...blogPages,
    ];
  } catch (error) {
    console.error("Lỗi khi tạo sitemap:", error);
    // Nếu lỗi, vẫn trả về các trang tĩnh để không làm hỏng build
    return staticPages;
  }
}
