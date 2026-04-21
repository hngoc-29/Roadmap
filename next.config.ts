import type { NextConfig } from "next";

const appUrl      = process.env.NEXT_PUBLIC_APP_URL || "";
const appHostname = appUrl.replace(/^https?:\/\//, "").split(":")[0];

const nextConfig: NextConfig = {
  // ✅ Treat ESLint warnings as warnings, never block build
  eslint: {
    ignoreDuringBuilds: false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  compress: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "reactflow",
      "@radix-ui/react-dialog",
    ],
    serverActions: {
      allowedOrigins: appHostname
        ? [appHostname, "localhost:3000"]
        : ["localhost:3000"],
    },
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
