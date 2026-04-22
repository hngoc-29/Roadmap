// ============================================================
// COMPONENTS/BLOG-CARD-ACTIONS.TSX
// ============================================================
"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import { deletePost } from "@/actions/post";

interface BlogCardActionsProps {
  postId: string;
  postSlug: string;
}

export default function BlogCardActions({ postId, postSlug }: BlogCardActionsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (status === "loading" || !session) return null;

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    startTransition(async () => {
      try {
        await deletePost(postId);
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa bài viết");
      } finally { setConfirming(false); }
    });
  };

  return (
    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
      <button
        onClick={(e) => { e.preventDefault(); router.push(`/blog/${postSlug}/edit`); }}
        className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        Sửa
      </button>
      <button
        onClick={(e) => { e.preventDefault(); handleDelete(); }}
        disabled={isPending}
        className={`flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          confirming ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
        }`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        {isPending ? "Đang xóa…" : confirming ? "Xác nhận?" : "Xóa"}
      </button>
      {confirming && (
        <button onClick={(e) => { e.preventDefault(); setConfirming(false); }}
          className="text-xs px-2 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
          Hủy
        </button>
      )}
    </div>
  );
}
