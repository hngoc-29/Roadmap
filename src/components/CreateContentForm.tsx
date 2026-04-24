// ============================================================
// COMPONENTS/CREATE-CONTENT-FORM.TSX
// ============================================================
// Form tạo Content Library item độc lập

"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createContent } from "@/actions/content";
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

export default function CreateContentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [importMsg, setImportMsg] = useState("");

  const showImportMsg = (msg: string) => { setImportMsg(msg); setTimeout(() => setImportMsg(""), 3500); };

  const handleFileImport = useCallback((text: string, filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "json") {
      const data = safeParseJSON<ContentImportData>(text);
      if (!data) { showImportMsg("❌ File JSON không đúng định dạng"); return; }
      if (data.title) setTitle(data.title);
      if (data.description !== undefined) setDescription(data.description);
      if (data.content !== undefined) setContent(data.content);
      if (data.icon) setIcon(data.icon);
      if (data.difficulty) setDifficulty(data.difficulty);
      if (data.estimatedTime) setEstimatedTime(data.estimatedTime);
      if (data.tags) setTagsInput(data.tags.join(", "));
      showImportMsg(`✅ Đã import "${filename}" vào tất cả fields`);
    } else {
      setContent(text);
      showImportMsg(`✅ Đã import "${filename}" vào nội dung`);
    }
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState("📄");
  const [difficulty, setDifficulty] = useState<IContent["difficulty"]>("beginner");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề"); return; }
    setError("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    startTransition(async () => {
      try {
        const created = await createContent({
          title: title.trim(),
          description: description.trim(),
          content: content.trim() || undefined,
          icon,
          difficulty,
          estimatedTime: estimatedTime.trim() || undefined,
          tags,
        });
        router.push(`/content/${created.slug}`);
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
      {/* Icon + Title */}
      <div className="flex gap-3 items-start">
        <div className="shrink-0">
          <label className="block text-sm font-medium mb-1.5">Icon</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-14 h-11 border border-input bg-background rounded-lg text-2xl flex items-center justify-center hover:bg-muted transition-colors"
            >
              {icon}
            </button>
            {showIconPicker && (
              <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl p-3 shadow-lg grid grid-cols-4 gap-1 w-40">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => { setIcon(ic); setShowIconPicker(false); }}
                    className={`w-8 h-8 text-xl rounded-lg hover:bg-muted transition-colors ${icon === ic ? "bg-primary/10" : ""}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5">
            Tiêu đề <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: JavaScript Async/Await toàn tập"
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={200}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Mô tả ngắn{" "}
          <span className="text-muted-foreground font-normal">(meta description)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tóm tắt nội dung, tối đa 300 ký tự..."
          rows={2}
          maxLength={300}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/300</p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Nội dung{" "}
          <span className="text-muted-foreground font-normal">(Markdown)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`# ${title || "Tiêu đề"}\n\n## Giới thiệu\n\n...\n\n## Nội dung chính\n\n\`\`\`javascript\n// Code example\n\`\`\``}
          rows={14}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Hỗ trợ đầy đủ Markdown với syntax highlighting
        </p>
      </div>

      {/* Difficulty + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Mức độ</label>
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
          <label className="block text-sm font-medium mb-1.5">Thời gian học</label>
          <input
            type="text"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="VD: 2 giờ, 30 phút"
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Tags{" "}
          <span className="text-muted-foreground font-normal">(phân cách bằng dấu phẩy)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="javascript, async, promise, es6"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Info */}
      <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">ℹ️ Content Library vs Blog Post</p>
        <p className="text-xs">
          Content này có URL <span className="font-mono">/content/[slug]</span> và có thể được
          gắn vào bất kỳ <strong>node</strong> nào trong Roadmap để tái sử dụng. Nếu bạn muốn
          viết bài có tác giả, ngày đăng, hãy dùng{" "}
          <Link href="/blog/new" className="text-primary hover:underline">Blog Post</Link> thay thế.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Đang tạo..." : "📄 Tạo Content"}
      </button>
    </form>
  );
}
