import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  compress: true,

  // ✅ Next 16: mongoose chạy server-side only
  serverExternalPackages: ["mongoose"],

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "reactflow",
      "@radix-ui/react-dialog",
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "DENY" },
          { key: "X-XSS-Protection",         value: "1; mode=block" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/(.*\\.(?:ico|png|svg|jpg|jpeg|webp|woff2))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/roadmaps", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
