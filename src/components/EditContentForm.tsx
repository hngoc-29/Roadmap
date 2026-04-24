// ============================================================
// COMPONENTS/EDIT-CONTENT-FORM.TSX
// ============================================================
// Form chỉnh sửa Content Library item (pre-populated)

"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateContent } from "@/actions/content";
import type { IContent } from "@/types";
import FileImportButton from "@/components/FileImportButton";
import { safeParseJSON } from "@/lib/import-export";
import type { ContentImportData } from "@/lib/import-export";

const DIFFICULTIES: { value: IContent["difficulty"]; label: string }[] = [
  { value: "beginner", label: "🟢 Cơ bản" },
  { value: "intermediate", label: "🟡 Trung cấp" },
  { value: "advanced", label: "🔴 Nâng cao" },
];

const ICONS = ["📄", "📚", "⚡", "🔥", "🎯", "🛠️", "🌐", "⚛️", "🗄️", "🔐", "☁️", "🤖"];

interface EditContentFormProps {
  content: IContent;
}

export default function EditContentForm({ content }: EditContentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [importMsg, setImportMsg] = useState("");

  const showImportMsg = (msg: string) => { setImportMsg(msg); setTimeout(() => setImportMsg(""), 3500); };

  const handleFileImport = useCallback((text: string, filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "json") {
      const data = safeParseJSON<ContentImportData>(text);
      if (!data) { showImportMsg("❌ File JSON không đúng định dạng"); return; }
      if (data.title) setTitle(data.title);
      if (data.description !== undefined) setDescription(data.description);
      if (data.content !== undefined) setBody(data.content);
      if (data.icon) setIcon(data.icon);
      if (data.difficulty) setDifficulty(data.difficulty);
      if (data.estimatedTime) setEstimatedTime(data.estimatedTime);
      if (data.tags) setTagsInput(data.tags.join(", "));
      showImportMsg(`✅ Đã import "${filename}" vào tất cả fields`);
    } else {
      setBody(text);
      showImportMsg(`✅ Đã import "${filename}" vào nội dung`);
    }
  }, []);

  const [title, setTitle] = useState(content.title ?? "");
  const [description, setDescription] = useState(content.description ?? "");
  const [body, setBody] = useState(content.content ?? "");
  const [icon, setIcon] = useState(content.icon ?? "📄");
  const [difficulty, setDifficulty] = useState<IContent["difficulty"]>(content.difficulty ?? "beginner");
  const [estimatedTime, setEstimatedTime] = useState(content.estimatedTime ?? "");
  const [tagsInput, setTagsInput] = useState((content.tags ?? []).join(", "));
  const [showIconPicker, setShowIconPicker] = useState(false);

  const contentId = (content._id ?? content.id) as string;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề"); return; }
    setError("");
    setSuccess("");

    const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

    startTransition(async () => {
      try {
        await updateContent(contentId, {
          title: title.trim(),
          description: description.trim(),
          content: body.trim() || undefined,
          icon,
          difficulty,
          estimatedTime: estimatedTime.trim() || undefined,
          tags,
        });
        setSuccess("✅ Đã lưu thay đổi!");
        setTimeout(() => router.push(`/content/${content.slug}`), 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.");
        console.error(err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Import toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Import từ file</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">.txt/.md → nội dung &nbsp;·&nbsp; .json → tất cả fields</p>
        </div>
        <div className="flex items-center gap-2">
          <FileImportButton accept=".txt,.md" label=".txt / .md" onImport={handleFileImport} onError={(m) => showImportMsg(`❌ ${m}`)} />
          <FileImportButton accept=".json" label=".json" onImport={handleFileImport} onError={(m) => showImportMsg(`❌ ${m}`)} />
        </div>
      </div>
      {importMsg && (
        <div className={`text-xs px-4 py-2 rounded-lg border ${importMsg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"}`}>{importMsg}</div>
      )}
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

      {/* Icon picker + Title */}
      <div className="flex gap-3 items-start">
        <div>
          <label className="block text-sm font-medium mb-1.5">Icon</label>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="w-14 h-10 text-2xl border border-input rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
          >
            {icon}
          </button>
          {showIconPicker && (
            <div className="absolute mt-1 p-2 bg-card border border-border rounded-lg shadow-lg grid grid-cols-6 gap-1 z-10">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => { setIcon(ic); setShowIconPicker(false); }}
                  className={`w-8 h-8 text-lg rounded hover:bg-muted transition-colors ${icon === ic ? "bg-muted" : ""}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5">
            Tiêu đề <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={200}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Mô tả ngắn</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={500}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/500</p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Nội dung <span className="text-muted-foreground font-normal">(Markdown)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
      </div>

      {/* Difficulty + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Độ khó</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as IContent["difficulty"])}
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Thời gian ước tính</label>
          <input
            type="text"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="VD: 30 phút, 2 giờ"
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
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
          placeholder="html, css, javascript"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
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
          {isPending ? "Đang lưu..." : "💾 Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
