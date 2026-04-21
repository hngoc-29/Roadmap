// ============================================================
// COMPONENTS/CREATE-CONTENT-FORM.TSX
// ============================================================
// Form tạo Content mới trong thư viện
// Sau khi tạo → redirect tới /content/[slug] để xem kết quả

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContent } from "@/actions/content";
import type { IContent } from "@/types";

const DIFFICULTIES: { value: IContent["difficulty"]; label: string; color: string }[] = [
  { value: "beginner", label: "🟢 Cơ bản", color: "text-green-700" },
  { value: "intermediate", label: "🟡 Trung cấp", color: "text-yellow-700" },
  { value: "advanced", label: "🔴 Nâng cao", color: "text-red-700" },
];

type PreviewTab = "edit" | "preview";

export default function CreateContentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState("📄");
  const [difficulty, setDifficulty] = useState<IContent["difficulty"]>("beginner");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("edit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề nội dung"); return; }
    setError("");
    setSuccess("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    startTransition(async () => {
      try {
        const doc = await createContent({
          title: title.trim(),
          description: description.trim() || undefined,
          content: content.trim() || undefined,
          icon: icon.trim() || "📄",
          difficulty,
          estimatedTime: estimatedTime.trim() || undefined,
          tags,
        });

        setSuccess(`✅ Đã tạo "${doc.title}" thành công!`);

        // Redirect sau 800ms để user thấy success message
        setTimeout(() => {
          router.push(`/content/${doc.slug}`);
        }, 800);
      } catch (err) {
        setError("Có lỗi xảy ra khi tạo nội dung. Vui lòng thử lại.");
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
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 rounded-lg px-4 py-3 flex items-center gap-2">
          {success}
          <span className="text-xs opacity-70 ml-auto">Đang chuyển hướng...</span>
        </div>
      )}

      {/* Icon + Title */}
      <div className="flex gap-3">
        <div className="w-24">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full border border-input bg-background rounded-lg px-3 py-2 text-center text-xl focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="📄"
            maxLength={2}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5">
            Tiêu đề <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='VD: Giới thiệu về React Hooks'
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={200}
            autoFocus
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Mô tả ngắn
          <span className="text-muted-foreground font-normal ml-1">(SEO meta description)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tóm tắt nội dung bài học trong 1–2 câu..."
          rows={2}
          maxLength={300}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/300</p>
      </div>

      {/* Difficulty + EstimatedTime */}
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
          placeholder="react, hooks, javascript, frontend"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {/* Tag preview */}
        {tagsInput && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Markdown Content Editor + Preview */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">
            Nội dung <span className="text-muted-foreground font-normal">(Markdown)</span>
          </label>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["edit", "preview"] as PreviewTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPreviewTab(tab)}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  previewTab === tab
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "edit" ? "📝 Soạn thảo" : "👁️ Preview"}
              </button>
            ))}
          </div>
        </div>

        {previewTab === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={`# ${title || "Tiêu đề bài học"}\n\n## Giới thiệu\n\nNhập nội dung Markdown ở đây...\n\n## Nội dung chính\n\n- Điểm 1\n- Điểm 2\n\n\`\`\`javascript\n// Code example\nconsole.log("Hello!");\n\`\`\`\n\n## Tóm tắt\n\n...`}
            spellCheck={false}
          />
        ) : (
          <div className="min-h-[200px] max-h-[350px] overflow-y-auto border border-border rounded-lg p-4 text-sm">
            {content ? (
              <div className="space-y-1.5">
                {content.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
                  if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-3 mb-1">{line.slice(3)}</h2>;
                  if (line.startsWith("### ")) return <h3 key={i} className="text-base font-medium mt-2 mb-1">{line.slice(4)}</h3>;
                  if (line.startsWith("- ") || line.startsWith("* ")) return <p key={i} className="ml-4">• {line.slice(2)}</p>;
                  if (line.startsWith("```")) return <div key={i} className="text-xs text-muted-foreground">— code block —</div>;
                  if (line === "") return <div key={i} className="h-2" />;
                  return <p key={i} className="leading-relaxed">{line}</p>;
                })}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Chưa có nội dung để preview...</p>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Hỗ trợ Markdown đầy đủ: heading, danh sách, code blocks, bảng, blockquote...
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Đang tạo nội dung...
          </span>
        ) : "📄 Tạo nội dung"}
      </button>
    </form>
  );
}
