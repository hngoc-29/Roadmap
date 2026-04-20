// ============================================================
// APP/ROBOTS.TS - Robots.txt Generator
// ============================================================
// ✅ Hướng dẫn Google Bot cách crawl site

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/roadmap/",
        ],
        disallow: [
          "/api/",          // Không index API routes
          "/builder/",      // Không index editor UI
          "/_next/",        // Next.js internals
        ],
      },
      {
        // Cho phép Googlebot crawl mọi thứ (trừ admin)
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/admin/", "/builder/"],
      },
    ],
    // ✅ Trỏ đến sitemap để Google biết cần crawl ở đâu
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
