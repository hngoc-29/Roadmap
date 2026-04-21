// ============================================================
// COMPONENTS/CREATE-ROADMAP-FORM.TSX
// ============================================================
// ✅ FIX: Sau khi tạo → redirect tới ?mode=edit
//         Roadmap mới sẽ mở ngay ở chế độ chỉnh sửa

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoadmap } from "@/actions/roadmap";

const CATEGORIES = [
  "Frontend", "Backend", "DevOps", "Mobile", "AI/ML",
  "Database", "Security", "Cloud", "Blockchain", "Khác",
];

export default function CreateRoadmapForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề roadmap"); return; }
    if (!description.trim()) { setError("Vui lòng nhập mô tả roadmap"); return; }
    if (!authorName.trim()) { setError("Vui lòng nhập tên tác giả"); return; }
    setError("");

    startTransition(async () => {
      try {
        const roadmap = await createRoadmap({
          title: title.trim(),
          description: description.trim(),
          authorName: authorName.trim(),
          category: category || undefined,
        });
        // ✅ FIX: Redirect với ?mode=edit → mở ngay chế độ chỉnh sửa
        // Người dùng vừa tạo xong cần edit ngay, không phải xem
        router.push(`/roadmap/${roadmap.slug}?mode=edit`);
      } catch (err) {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
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

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Tiêu đề Roadmap <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='VD: Lộ trình học Frontend 2025'
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={200}
          autoFocus
        />
        <p className="text-xs text-muted-foreground mt-1">{title.length}/200</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Mô tả <span className="text-destructive">*</span>
          <span className="text-muted-foreground font-normal ml-1">(dùng cho SEO meta description)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn gọn về lộ trình học này..."
          rows={3}
          maxLength={500}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/500</p>
      </div>

      {/* Author + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Tên tác giả <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Tên của bạn"
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Danh mục</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">-- Chọn danh mục --</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 px-4 py-3 text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">ℹ️ Sau khi tạo:</p>
        <ul className="space-y-0.5 list-disc list-inside text-xs text-blue-700 dark:text-blue-400">
          <li>Bạn được chuyển thẳng vào <strong>chế độ chỉnh sửa</strong></li>
          <li>Roadmap ở trạng thái <strong>Draft</strong> — chỉ bạn thấy</li>
          <li>Dùng nút <strong>🌐 Xuất bản</strong> để public cho mọi người</li>
        </ul>
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Đang tạo...
          </span>
        ) : "🚀 Tạo Roadmap & bắt đầu chỉnh sửa"}
      </button>
    </form>
  );
}
