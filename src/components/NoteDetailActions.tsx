// ============================================================
// COMPONENTS/NOTE-DETAIL-ACTIONS.TSX
// ============================================================
"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import { deleteNote, togglePinNote } from "@/actions/note";

interface NoteDetailActionsProps {
  noteId: string;
  noteSlug: string;
  isPinned: boolean;
}

export default function NoteDetailActions({ noteId, noteSlug, isPinned }: NoteDetailActionsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [deletePending, startDeleteTransition] = useTransition();
  const [pinPending, startPinTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [pinned, setPinned] = useState(isPinned);

  if (status === "loading") return <div className="h-9 w-64 rounded-xl bg-muted animate-pulse" />;
  if (!session) return null;

  const handlePin = () => {
    startPinTransition(async () => {
      try {
        await togglePinNote(noteId, !pinned);
        setPinned(!pinned);
        router.refresh();
      } catch (err) { console.error(err); }
    });
  };

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    startDeleteTransition(async () => {
      try {
        await deleteNote(noteId);
        router.push("/notes");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa ghi chú");
        setConfirming(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/70 border border-border/60 shadow-sm">
      {/* Pin */}
      <button onClick={handlePin} disabled={pinPending}
        className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border/40 shadow-sm transition-all disabled:opacity-50 ${
          pinned ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                 : "bg-background hover:bg-muted text-foreground"
        }`}>
        {pinPending ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill={pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        )}
        {pinned ? "Bỏ ghim" : "Ghim"}
      </button>

      <div className="w-px h-5 bg-border/60 mx-0.5" />

      {/* Edit */}
      <button onClick={() => router.push(`/notes/${noteSlug}/edit`)}
        className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg bg-background hover:bg-muted text-foreground border border-border/40 shadow-sm transition-all hover:shadow">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        Chỉnh sửa
      </button>

      <div className="w-px h-5 bg-border/60 mx-0.5" />

      {/* Delete */}
      {confirming ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-red-600 dark:text-red-400 font-medium px-2">Xóa ghi chú này?</span>
          <button onClick={handleDelete} disabled={deletePending}
            className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all">
            {deletePending ? "Đang xóa…" : "Xác nhận"}
          </button>
          <button onClick={() => setConfirming(false)}
            className="text-sm px-3 py-1.5 rounded-lg bg-background hover:bg-muted text-muted-foreground border border-border/40 transition-all">
            Hủy
          </button>
        </div>
      ) : (
        <button onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Xóa ghi chú
        </button>
      )}
    </div>
  );
}
