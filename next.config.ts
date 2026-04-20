import type { NextConfig } from "next";

// Trích xuất hostname từ URL (ví dụ: loại bỏ https:// và port)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
const appHostname = appUrl.replace(/^https?:\/\//, "").split(":")[0];

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

  // Cấu hình Experimental
  experimental: {
    // Tối ưu loading của packages lớn
    optimizePackageImports: ["lucide-react", "reactflow", "@radix-ui/react-dialog"],
    
    // ✅ FIX LỖI SERVER ACTIONS TẠI ĐÂY
    serverActions: {
      allowedOrigins: appHostname ? [appHostname, "localhost:3000"] : ["localhost:3000"],
    },
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
