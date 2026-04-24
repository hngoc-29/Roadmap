// ============================================================
// LIB/IMPORT-EXPORT.TS
// ============================================================
// Client-side utilities cho import file và export ZIP.
// Không upload lên server → không bị giới hạn 4.5MB Vercel.

import { createZipBlob, downloadBlob } from "./client-zip";

// ── Types ─────────────────────────────────────────────────────
export interface PostImportData {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  isPublished?: boolean;
}

export interface ContentImportData {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  icon?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedTime?: string;
  tags?: string[];
}

export interface NoteImportData {
  title?: string;
  content?: string;
  color?: "default" | "yellow" | "blue" | "green" | "pink" | "purple";
  isPinned?: boolean;
  tags?: string[];
}

// ── Import helpers ────────────────────────────────────────────

/**
 * Đọc file text/md/json bằng FileReader (client-side).
 * Trả về { text, filename } qua callback — không upload server.
 */
export function readFileClientSide(
  file: File,
  onResult: (text: string, filename: string) => void,
  onError?: (msg: string) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text !== undefined) onResult(text, file.name);
    else onError?.("Không đọc được nội dung file");
  };
  reader.onerror = () => onError?.("Lỗi đọc file");
  reader.readAsText(file, "utf-8");
}

/** Parse JSON an toàn — trả về null nếu lỗi */
export function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ── Export: Blog Post ─────────────────────────────────────────
export function exportPostZip(post: {
  slug: string;
  title: string;
  description?: string;
  content?: string;
  author?: { name?: string };
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  coverImage?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}) {
  const slug = post.slug || "post";

  // JSON: lưu toàn bộ data, content là chuỗi md
  const jsonContent = JSON.stringify(
    {
      title: post.title,
      slug,
      description: post.description ?? "",
      content: post.content ?? "",
      authorName: post.author?.name ?? "",
      category: post.category ?? "",
      tags: post.tags ?? [],
      coverImage: post.coverImage ?? "",
      isPublished: post.isPublished ?? false,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );

  // MD: nội dung dễ đọc/sửa — giống hệt content trong JSON
  const mdContent = [
    `# ${post.title}`,
    ``,
    post.description ? `> ${post.description}` : "",
    ``,
    post.author?.name ? `**Tác giả:** ${post.author.name}` : "",
    post.category ? `**Danh mục:** ${post.category}` : "",
    (post.tags ?? []).length > 0 ? `**Tags:** ${post.tags!.join(", ")}` : "",
    ``,
    `---`,
    ``,
    post.content ?? "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  const blob = createZipBlob([
    { name: `${slug}.json`, content: jsonContent },
    { name: `${slug}.md`, content: mdContent },
  ]);
  downloadBlob(blob, `blog-${slug}.zip`);
}

// ── Export: Content ───────────────────────────────────────────
export function exportContentZip(item: {
  slug: string;
  title: string;
  description?: string;
  content?: string;
  icon?: string;
  difficulty?: string;
  estimatedTime?: string;
  tags?: string[];
}) {
  const slug = item.slug || "content";

  const jsonContent = JSON.stringify(
    {
      title: item.title,
      slug,
      description: item.description ?? "",
      content: item.content ?? "",
      icon: item.icon ?? "📄",
      difficulty: item.difficulty ?? "beginner",
      estimatedTime: item.estimatedTime ?? "",
      tags: item.tags ?? [],
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );

  const mdContent = [
    `# ${item.icon ?? "📄"} ${item.title}`,
    ``,
    item.description ? `> ${item.description}` : "",
    item.difficulty ? `**Độ khó:** ${item.difficulty}` : "",
    item.estimatedTime ? `**Thời gian:** ${item.estimatedTime}` : "",
    (item.tags ?? []).length > 0 ? `**Tags:** ${item.tags!.join(", ")}` : "",
    ``,
    `---`,
    ``,
    item.content ?? "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  const blob = createZipBlob([
    { name: `${slug}.json`, content: jsonContent },
    { name: `${slug}.md`, content: mdContent },
  ]);
  downloadBlob(blob, `content-${slug}.zip`);
}

// ── Export: Note ──────────────────────────────────────────────
export function exportNoteZip(note: {
  slug: string;
  title: string;
  content?: string;
  color?: string;
  isPinned?: boolean;
  tags?: string[];
  createdAt?: string | Date;
}) {
  const slug = note.slug || "note";

  const jsonContent = JSON.stringify(
    {
      title: note.title,
      slug,
      content: note.content ?? "",
      color: note.color ?? "default",
      isPinned: note.isPinned ?? false,
      tags: note.tags ?? [],
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );

  const mdContent = [
    `# ${note.title}`,
    ``,
    note.color && note.color !== "default" ? `**Màu:** ${note.color}` : "",
    note.isPinned ? `**Đã ghim:** ✅` : "",
    (note.tags ?? []).length > 0 ? `**Tags:** ${note.tags!.join(", ")}` : "",
    ``,
    `---`,
    ``,
    note.content ?? "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  const blob = createZipBlob([
    { name: `${slug}.json`, content: jsonContent },
    { name: `${slug}.md`, content: mdContent },
  ]);
  downloadBlob(blob, `note-${slug}.zip`);
}
