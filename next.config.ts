import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tối ưu hình ảnh cho Core Web Vitals (LCP)
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Bật compression để giảm TTFB
  compress: true,

  // Tối ưu bundle size
  experimental: {
    // Tối ưu loading của packages lớn
    optimizePackageImports: ["lucide-react", "reactflow", "@radix-ui/react-dialog"],
  },

  // Headers bảo mật & Cache-Control tối ưu SEO
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Cache tĩnh lâu dài cho assets
        source: "/(.*)\\.(ico|png|svg|jpg|jpeg|webp|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirects cơ bản để tránh duplicate content (SEO)
  async redirects() {
    return [
      {
        source: "/roadmaps",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
