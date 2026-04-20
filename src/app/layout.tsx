// ============================================================
// APP/LAYOUT.TSX - Root Layout với SEO Metadata mặc định
// ============================================================
// ✅ Server Component (không có 'use client')
// ✅ Metadata API của Next.js 15 (thay thế next/head)

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ──────────────────────────────────────────────
// FONT LOADING - next/font tự động tối ưu:
// 1. Self-hosted → không request đến Google Fonts (tăng tốc)
// 2. font-display: swap → tránh FOIT (Flash of Invisible Text)
// 3. size-adjust → giảm CLS khi font load xong
// ──────────────────────────────────────────────
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ──────────────────────────────────────────────
// VIEWPORT CONFIG - Tối ưu cho mobile
// ──────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// ──────────────────────────────────────────────
// DEFAULT METADATA - Áp dụng cho tất cả trang
// Các trang con có thể override bằng generateMetadata của riêng chúng
// ──────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Interactive Roadmap Builder | Tạo lộ trình học tập trực quan",
    template: "%s | Roadmap Builder", // Tên trang con | Tên app
  },
  description:
    "Xây dựng lộ trình học tập trực quan với công cụ kéo thả thông minh. Chia sẻ roadmap học Frontend, Backend, DevOps và nhiều hơn nữa.",
  keywords: [
    "roadmap học tập",
    "lộ trình học lập trình",
    "frontend roadmap",
    "backend roadmap",
    "devops roadmap",
    "học lập trình",
    "lộ trình học web",
  ],
  authors: [{ name: "Roadmap Builder Team" }],
  creator: "Roadmap Builder",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Interactive Roadmap Builder",
    title: "Interactive Roadmap Builder | Tạo lộ trình học tập trực quan",
    description:
      "Xây dựng và chia sẻ lộ trình học tập trực quan với công cụ kéo thả thông minh.",
    images: [
      {
        url: "/og-default.png", // 1200x630px
        width: 1200,
        height: 630,
        alt: "Interactive Roadmap Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@roadmapbuilder",
    creator: "@roadmapbuilder",
  },
  // ✅ SEO: Hướng dẫn bot cách index
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // ✅ Verification cho Google Search Console
  // verification: {
  //   google: "your-google-verification-code",
  // },
};

// ──────────────────────────────────────────────
// ROOT LAYOUT COMPONENT
// ──────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      // Thêm class "dark" ở đây để enable dark mode theo system preference
      suppressHydrationWarning // Cần thiết cho dark mode để tránh hydration mismatch
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {/* ✅ Skip-to-content link cho accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 
                     focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
                     focus:rounded-md focus:outline-none"
        >
          Bỏ qua đến nội dung chính
        </a>

        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
