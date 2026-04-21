// ============================================================
// APP/LAYOUT.TSX - Root Layout với SEO Metadata & NavBar
// ============================================================
// ✅ Dùng local font (không phụ thuộc network khi build)

import type { Metadata, Viewport } from "next";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Interactive Roadmap Builder | Tạo lộ trình học tập trực quan",
    template: "%s | Roadmap Builder",
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
    "blog lập trình",
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
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Interactive Roadmap Builder" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@roadmapbuilder",
    creator: "@roadmapbuilder",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
                     focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
                     focus:rounded-md focus:outline-none"
        >
          Bỏ qua đến nội dung chính
        </a>
        <NavBar />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
