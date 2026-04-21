// ============================================================
// COMPONENTS/SHARE-MODAL.TSX - Modal chia sẻ Roadmap
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { updateShareSettings } from "@/actions/roadmap";
import type { IRoadmap } from "@/types";

interface ShareModalProps {
  roadmap: IRoadmap;
  onClose: () => void;
  onUpdated?: (updated: Partial<IRoadmap>) => void;
}

export default function ShareModal({ roadmap, onClose, onUpdated }: ShareModalProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [allowPublicEdit, setAllowPublicEdit] = useState(roadmap.allowPublicEdit ?? false);
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>(roadmap.collaborators ?? []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const shareUrl = `${appUrl}/roadmap/${roadmap.slug}`;

  const isOwner =
    session?.user?.email === roadmap.ownerEmail ||
    (session?.user as { id?: string } | undefined)?.id === roadmap.ownerId;

  const addCollaborator = () => {
    const email = collaboratorInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }
    if (collaborators.includes(email)) {
      setError("Email này đã có trong danh sách");
      return;
    }
    setCollaborators([...collaborators, email]);
    setCollaboratorInput("");
    setError("");
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email));
  };

  const handleSave = () => {
    if (!roadmap._id) return;
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await updateShareSettings(roadmap._id!, { allowPublicEdit, collaborators });
        setSuccess("Đã lưu cài đặt chia sẻ!");
        onUpdated?.({ allowPublicEdit, collaborators });
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      }
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setSuccess("Đã sao chép link!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-base">🔗 Chia sẻ Roadmap</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Share link */}
          <div>
            <label className="block text-sm font-medium mb-2">Link chia sẻ</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 border border-input bg-muted rounded-lg px-3 py-2 text-sm font-mono truncate"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                📋 Sao chép
              </button>
            </div>
          </div>

          {/* Publish status */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <span className="font-medium">Trạng thái: </span>
            {roadmap.isPublished ? (
              <span className="text-green-600 dark:text-green-400">✓ Đã xuất bản (ai cũng xem được)</span>
            ) : (
              <span className="text-muted-foreground">⚠ Draft (chỉ người có link + quyền)</span>
            )}
          </div>

          {/* Settings - chỉ owner mới chỉnh được */}
          {isOwner ? (
            <>
              {/* Allow public edit toggle */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Cho phép mọi người edit</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bất kỳ ai có link đều có thể chỉnh sửa roadmap này
                  </p>
                </div>
                <button
                  onClick={() => setAllowPublicEdit(!allowPublicEdit)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    allowPublicEdit ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                  role="switch"
                  aria-checked={allowPublicEdit}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      allowPublicEdit ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Collaborators */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Người cộng tác
                  <span className="text-muted-foreground font-normal ml-1">(thêm bằng email)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={collaboratorInput}
                    onChange={(e) => setCollaboratorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCollaborator())}
                    placeholder="email@example.com"
                    className="flex-1 border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={addCollaborator}
                    type="button"
                    className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    + Thêm
                  </button>
                </div>

                {collaborators.length > 0 ? (
                  <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                    {collaborators.map((email) => (
                      <li
                        key={email}
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-1.5 text-sm"
                      >
                        <span className="truncate">{email}</span>
                        <button
                          onClick={() => removeCollaborator(email)}
                          className="text-destructive hover:text-destructive/70 ml-2 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Chưa có người cộng tác nào. Thêm email để cho phép họ edit.
                  </p>
                )}
              </div>

              {/* Error / Success */}
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">{success}</p>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={isPending}
                className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Đang lưu..." : "💾 Lưu cài đặt"}
              </button>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {collaborators.length > 0 ? (
                <p>Bạn là người cộng tác của roadmap này.</p>
              ) : allowPublicEdit ? (
                <p>Roadmap này cho phép mọi người chỉnh sửa.</p>
              ) : (
                <p>Bạn đang xem roadmap này. Chỉ chủ sở hữu mới có thể thay đổi cài đặt chia sẻ.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
