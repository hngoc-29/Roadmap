// ============================================================
// COMPONENTS/NOTE-CARD-ACTIONS.TSX
// ============================================================
"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { deleteNote, togglePinNote, checkNoteEditPermission } from "@/actions/note";

interface NoteCardActionsProps {
  noteId: string;
  noteSlug: string;
  isPinned: boolean;
}

export default function NoteCardActions({ noteId, noteSlug, isPinned }: NoteCardActionsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [deletePending, startDeleteTransition] = useTransition();
  const [pinPending, startPinTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!session) return;
    checkNoteEditPermission(noteId).then(({ canEdit }) => setCanEdit(canEdit));
  }, [session, noteId]);

  if (status === "loading" || !session || !canEdit) return null;

  const handlePin = () => {
    startPinTransition(async () => {
      try {
        await togglePinNote(noteId, !isPinned);
        router.refresh();
      } catch (err) { console.error(err); }
    });
  };

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    startDeleteTransition(async () => {
      try {
        await deleteNote(noteId);
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa ghi chú");
      } finally { setConfirming(false); }
    });
  };

  return (
    <div className="flex items-center gap-1.5 mt-2 pt-3 border-t border-black/10 dark:border-white/10">
      <button onClick={(e) => { e.preventDefault(); handlePin(); }} disabled={pinPending}
        title={isPinned ? "Bỏ ghim" : "Ghim"}
        className="flex-none text-xs font-medium px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors disabled:opacity-50">
        {pinPending ? "…" : isPinned ? "📌" : "📍"}
      </button>
      <button onClick={(e) => { e.preventDefault(); router.push(`/notes/${noteSlug}/edit`); }}
        className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        Sửa
      </button>
      <button onClick={(e) => { e.preventDefault(); handleDelete(); }} disabled={deletePending}
        className={`flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          confirming ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
        }`}>
        {deletePending ? "…" : confirming ? "⚠️ Xác nhận?" : "🗑️ Xóa"}
      </button>
      {confirming && (
        <button onClick={(e) => { e.preventDefault(); setConfirming(false); }}
          className="flex-none text-xs px-2 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
          Hủy
        </button>
      )}
    </div>
  );
}
