// ============================================================
// COMPONENTS/POST-DETAIL-ACTIONS.TSX
// ============================================================
"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { deletePost, checkPostEditPermission } from "@/actions/post";

interface PostDetailActionsProps {
  postId: string;
  postSlug: string;
  isPublished: boolean;
}

export default function PostDetailActions({ postId, postSlug, isPublished }: PostDetailActionsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!session) return;
    checkPostEditPermission(postId).then(({ canEdit }) => setCanEdit(canEdit));
  }, [session, postId]);

  if (status === "loading") return <div className="h-9 w-52 rounded-xl bg-muted animate-pulse" />;
  if (!session || !canEdit) return null;

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    startTransition(async () => {
      try {
        await deletePost(postId);
        router.push("/blog");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa bài viết");
        setConfirming(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${
        isPublished
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {isPublished ? "Public" : "Draft"}
      </span>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/70 border border-border/60 shadow-sm">
        <button
          onClick={() => router.push(`/blog/${postSlug}/edit`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg bg-background hover:bg-muted text-foreground border border-border/40 shadow-sm transition-all hover:shadow"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Chỉnh sửa
        </button>

        <div className="w-px h-5 bg-border/60 mx-0.5" />

        {confirming ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-600 dark:text-red-400 font-medium px-2">Xóa bài viết này?</span>
            <button onClick={handleDelete} disabled={isPending}
              className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all">
              {isPending ? "Đang xóa…" : "Xác nhận"}
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
            Xóa bài viết
          </button>
        )}
      </div>
    </div>
  );
}
