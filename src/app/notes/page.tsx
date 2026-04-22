// ============================================================
// APP/NOTES/PAGE.TSX – Trang quản lý ghi chú
// ============================================================
// ✅ List tất cả notes, pinned trước
// ✅ Nút: Tạo mới, Chỉnh sửa, Xoá, Ghim/Bỏ ghim

import type { Metadata } from "next";
import Link from "next/link";
import { getAllNotes } from "@/actions/note";
import type { INote } from "@/actions/note";
import NoteCardActions from "@/components/NoteCardActions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ghi chú",
  description: "Quản lý ghi chú cá nhân",
  alternates: { canonical: "/notes" },
  robots: { index: false },
};

const COLOR_MAP: Record<string, string> = {
  yellow: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700",
  blue:   "bg-blue-50   border-blue-200   dark:bg-blue-900/20   dark:border-blue-700",
  green:  "bg-green-50  border-green-200  dark:bg-green-900/20  dark:border-green-700",
  pink:   "bg-pink-50   border-pink-200   dark:bg-pink-900/20   dark:border-pink-700",
  purple: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700",
  default: "bg-card border-border",
};

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function excerpt(content: string, max = 120): string {
  const plain = content.replace(/^#+\s*/gm, "").replace(/[*_`]/g, "").trim();
  return plain.length > max ? plain.slice(0, max) + "…" : plain;
}

export default async function NotesPage() {
  // 🔒 Notes là private — yêu cầu đăng nhập
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const notes = await getAllNotes().catch(() => []);
  const pinned   = notes.filter((n) => n.isPinned);
  const unpinned = notes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-14 px-4">
        <div className="max-w-4xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              📝 Ghi chú
            </h1>
            <p className="text-muted-foreground text-lg">
              Lưu nhanh ý tưởng, công thức và tài liệu tham khảo.
            </p>
          </div>
          <Link
            href="/notes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            ➕ Tạo ghi chú mới
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {notes.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">🗒️</p>
            <p className="text-xl mb-2">Chưa có ghi chú nào.</p>
            <Link
              href="/notes/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              📝 Tạo ghi chú đầu tiên
            </Link>
          </div>
        ) : (
          <>
            {/* ── Pinned ── */}
            {pinned.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  📌 Đã ghim ({pinned.length})
                </h2>
                <NoteGrid notes={pinned} />
              </div>
            )}

            {/* ── All / Unpinned ── */}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    🗒️ Tất cả ({unpinned.length})
                  </h2>
                )}
                <NoteGrid notes={unpinned} />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function NoteGrid({ notes }: { notes: INote[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => {
        const noteId = (note._id ?? note.id) as string;
        const colorClass = COLOR_MAP[note.color ?? "default"] ?? COLOR_MAP.default;
        return (
          <div
            key={noteId}
            className={`flex flex-col rounded-xl border overflow-hidden transition-all hover:shadow-md ${colorClass}`}
          >
            {/* Clickable area → detail */}
            <Link href={`/notes/${note.slug}`} className="block p-5 flex-1 group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {note.isPinned && <span className="mr-1">📌</span>}
                  {note.title}
                </h3>
              </div>

              {note.content && (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {excerpt(note.content)}
                </p>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-auto">
                {formatDate(note.updatedAt ?? note.createdAt)}
              </p>
            </Link>

            {/* Action buttons */}
            <div className="px-5 pb-4">
              <NoteCardActions noteId={noteId} noteSlug={note.slug} isPinned={note.isPinned} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
