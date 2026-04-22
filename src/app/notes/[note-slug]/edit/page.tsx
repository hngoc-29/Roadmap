// ============================================================
// APP/NOTES/[NOTE-SLUG]/EDIT/PAGE.TSX
// ============================================================
// Trang chỉnh sửa ghi chú

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { getNoteBySlug } from "@/actions/note";
import CreateNoteForm from "@/components/CreateNoteForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "note-slug": string }>;
}): Promise<Metadata> {
  const { "note-slug": slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return { title: "Không tìm thấy ghi chú" };
  return { title: `Chỉnh sửa: ${note.title}`, robots: { index: false } };
}

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ "note-slug": string }>;
}) {
  const { "note-slug": slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/notes/${slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay lại ghi chú
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Chỉnh sửa</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">✏️ Chỉnh sửa ghi chú</h1>
          <p className="text-muted-foreground text-sm">
            Cập nhật nội dung và màu sắc ghi chú.
          </p>
        </div>
        <CreateNoteForm note={note} />
      </div>
    </div>
  );
}
