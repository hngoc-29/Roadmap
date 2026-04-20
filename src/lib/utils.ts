// ============================================================
// LIB/UTILS.TS - Utility functions dùng chung toàn dự án
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

// ──────────────────────────────────────────────
// Shadcn/UI cn() helper - merge Tailwind classes
// ──────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ──────────────────────────────────────────────
// Tạo slug từ text (hỗ trợ tiếng Việt)
// ──────────────────────────────────────────────
export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });
}

// ──────────────────────────────────────────────
// Trích xuất mô tả ngắn từ Markdown (cho SEO meta description)
// Lấy đoạn text đầu tiên, giới hạn 160 ký tự
// ──────────────────────────────────────────────
export function extractExcerpt(markdown: string, maxLength = 160): string {
  // Loại bỏ: headings, links, images, bold, italic, code blocks
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]+`/g, "")        // inline code
    .replace(/#{1,6}\s+/g, "")      // headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text only
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")    // images
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1") // bold/italic
    .replace(/\n+/g, " ")           // newlines → spaces
    .trim();

  if (plainText.length <= maxLength) return plainText;
  // Cắt tại khoảng trắng gần nhất để tránh cắt giữa chữ
  return plainText.substring(0, plainText.lastIndexOf(" ", maxLength)) + "…";
}

// ──────────────────────────────────────────────
// Format số lượng views (1200 → "1.2K")
// ──────────────────────────────────────────────
export function formatViewCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

// ──────────────────────────────────────────────
// Ước tính thời gian đọc từ Markdown
// ──────────────────────────────────────────────
export function estimateReadingTime(markdown: string): string {
  const wordsPerMinute = 200; // Tốc độ đọc trung bình tiếng Việt
  const wordCount = markdown.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes <= 1 ? "1 phút đọc" : `${minutes} phút đọc`;
}

// ──────────────────────────────────────────────
// Tạo canonical URL
// ──────────────────────────────────────────────
export function getCanonicalUrl(...paths: string[]): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const joined = paths
    .map((p) => p.replace(/^\/|\/$/g, ""))
    .filter(Boolean)
    .join("/");
  return `${base}/${joined}`;
}

// ──────────────────────────────────────────────
// Serialize MongoDB document (loại bỏ _id ObjectId, Date)
// Dùng trước khi truyền data từ Server → Client Component
// ──────────────────────────────────────────────
export function serializeDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

// ──────────────────────────────────────────────
// Delay helper (dùng trong dev/testing)
// ──────────────────────────────────────────────
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
