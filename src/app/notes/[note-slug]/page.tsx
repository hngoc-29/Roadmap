// ============================================================
// APP/NOTES/[NOTE-SLUG]/PAGE.TSX
// ============================================================
// Trang xem chi tiết ghi chú + nút Edit/Delete/Pin

import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getNoteBySlug, getAllNoteSlugs } from "@/actions/note";
import NoteDetailActions from "@/components/NoteDetailActions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const slugs = await getAllNoteSlugs();
    return slugs.map((s) => ({ "note-slug": s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "note-slug": string }>;
}): Promise<Metadata> {
  const { "note-slug": slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return { title: "Không tìm thấy ghi chú" };
  return { title: note.title, robots: { index: false } };
}

const COLOR_BG: Record<string, string> = {
  yellow:  "bg-yellow-50  dark:bg-yellow-900/10",
  blue:    "bg-blue-50    dark:bg-blue-900/10",
  green:   "bg-green-50   dark:bg-green-900/10",
  pink:    "bg-pink-50    dark:bg-pink-900/10",
  purple:  "bg-purple-50  dark:bg-purple-900/10",
  default: "bg-background",
};

function formatDate(d: Date | string | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

const mdxComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto border border-border text-sm my-3">
      {children}
    </pre>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3">
      {children}
    </blockquote>
  ),
};

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ "note-slug": string }>;
}) {
  const { "note-slug": slug } = await params;

  // 🔒 Notes là private — yêu cầu đăng nhập
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  // 🔐 Kiểm tra quyền truy cập — chỉ owner mới được xem ghi chú
  const userId = (session.user as { id?: string })?.id;
  const userEmail = session.user?.email ?? "";
  const isOwner =
    (!note.ownerId && !note.ownerEmail) || // backward compat
    (note.ownerId && note.ownerId === userId) ||
    (note.ownerEmail && note.ownerEmail === userEmail);

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center border border-destructive/30 rounded-2xl p-10 bg-destructive/5">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-xl font-bold mb-2 text-destructive">Không có quyền truy cập</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Ghi chú này là riêng tư và không được chia sẻ với bạn.
            Chỉ chủ sở hữu mới có thể xem nội dung này.
          </p>
          <Link href="/notes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            ← Về danh sách ghi chú
          </Link>
        </div>
      </div>
    );
  }

  const bgClass = COLOR_BG[note.color ?? "default"] ?? COLOR_BG.default;
  const noteId  = (note._id ?? note.id) as string;

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Breadcrumb */}
      <nav className="border-b bg-background/80 backdrop-blur-sm px-4 py-3">
        <ol className="max-w-3xl mx-auto flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/notes" className="hover:text-foreground transition-colors">Ghi chú</Link></li>
          <li aria-hidden>/</li>
          <li className="text-foreground font-medium truncate max-w-xs">{note.title}</li>
        </ol>
      </nav>

      {/* Actions bar */}
      <div className="border-b bg-gradient-to-r from-muted/50 via-background to-background backdrop-blur-sm px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-4 rounded-full bg-primary/50 hidden sm:block" />
            <span className="hidden sm:block font-medium">Quản lý ghi chú</span>
          </div>
          <NoteDetailActions noteId={noteId} noteSlug={note.slug} isPinned={note.isPinned} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              {note.isPinned && <span className="mr-2">📌</span>}
              {note.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {note.updatedAt && (
                <span>🕐 Cập nhật: {formatDate(note.updatedAt)}</span>
              )}
              {note.roadmapSlug && (
                <Link
                  href={`/roadmap/${note.roadmapSlug}`}
                  className="text-primary hover:underline"
                >
                  🗺️ {note.roadmapSlug}
                </Link>
              )}
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* MDX */}
          <div className="prose-content">
            {note.content ? (
              <MDXRemote
                source={note.content}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            ) : (
              <p className="text-muted-foreground italic">Ghi chú này chưa có nội dung.</p>
            )}
          </div>

          <footer className="mt-12 pt-6 border-t border-border">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              ← Về danh sách ghi chú
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
