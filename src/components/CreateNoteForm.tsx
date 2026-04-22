// ============================================================
// COMPONENTS/CREATE-NOTE-FORM.TSX
// ============================================================
// Form tạo / chỉnh sửa ghi chú

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNote, updateNote } from "@/actions/note";
import type { INote } from "@/actions/note";

const COLORS: { value: INote["color"]; label: string; class: string }[] = [
  { value: "default", label: "Mặc định", class: "bg-card border-border" },
  { value: "yellow",  label: "Vàng",     class: "bg-yellow-50  border-yellow-200  dark:bg-yellow-900/20  dark:border-yellow-700" },
  { value: "blue",    label: "Xanh dương", class: "bg-blue-50  border-blue-200    dark:bg-blue-900/20    dark:border-blue-700" },
  { value: "green",   label: "Xanh lá",  class: "bg-green-50  border-green-200   dark:bg-green-900/20   dark:border-green-700" },
  { value: "pink",    label: "Hồng",     class: "bg-pink-50   border-pink-200    dark:bg-pink-900/20    dark:border-pink-700" },
  { value: "purple",  label: "Tím",      class: "bg-purple-50 border-purple-200  dark:bg-purple-900/20  dark:border-purple-700" },
];

interface CreateNoteFormProps {
  note?: INote; // nếu có → edit mode
  onSuccess?: () => void;
}

export default function CreateNoteForm({ note, onSuccess }: CreateNoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [title,     setTitle]     = useState(note?.title   ?? "");
  const [content,   setContent]   = useState(note?.content ?? "");
  const [color,     setColor]     = useState<INote["color"]>(note?.color ?? "default");
  const [isPinned,  setIsPinned]  = useState(note?.isPinned ?? false);
  const [tagsInput, setTagsInput] = useState((note?.tags ?? []).join(", "));

  const isEdit = !!note;
  const noteId = (note?._id ?? note?.id) as string | undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề"); return; }
    setError("");
    setSuccess("");

    const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

    startTransition(async () => {
      try {
        if (isEdit && noteId) {
          await updateNote(noteId, {
            title: title.trim(),
            content: content.trim() || `# ${title.trim()}\n\nThêm nội dung ở đây...`,
            color,
            isPinned,
            tags,
          });
          setSuccess("✅ Đã lưu thay đổi!");
          setTimeout(() => { onSuccess?.(); router.refresh(); }, 600);
        } else {
          const created = await createNote({
            title: title.trim(),
            content: content.trim() || undefined,
            color,
            isPinned,
            tags,
          });
          router.push(`/notes/${created.slug}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
        console.error(err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Tiêu đề <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Ghi chú học React"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={200}
          autoFocus
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Nội dung <span className="text-muted-foreground font-normal">(Markdown)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`# ${title || "Tiêu đề"}\n\nViết ghi chú ở đây...`}
          rows={10}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium mb-2">Màu nền</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${c.class} ${
                color === c.value ? "ring-2 ring-primary ring-offset-1" : "opacity-70 hover:opacity-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Tags <span className="text-muted-foreground font-normal">(phân cách bằng dấu phẩy)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="react, hooks, tips"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Pin toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="sr-only peer"
          />
          <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
        </label>
        <p className="text-sm font-medium">{isPinned ? "📌 Đã ghim" : "Ghim ghi chú"}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Đang lưu..." : isEdit ? "💾 Lưu thay đổi" : "📝 Tạo ghi chú"}
        </button>
      </div>
    </form>
  );
}
