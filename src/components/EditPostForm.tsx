// ============================================================
// COMPONENTS/EDIT-POST-FORM.TSX
// ============================================================
// Form chỉnh sửa bài viết blog (pre-populated)

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePost } from "@/actions/post";
import type { IPost } from "@/types";

const CATEGORIES = [
  "Tutorial", "Guide", "Tips & Tricks", "Career", "Tool",
  "Frontend", "Backend", "DevOps", "AI/ML", "Tin tức", "Khác",
];

interface EditPostFormProps {
  post: IPost;
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState(post.title ?? "");
  const [description, setDescription] = useState(post.description ?? "");
  const [content, setContent] = useState(post.content ?? "");
  const [authorName, setAuthorName] = useState(post.author?.name ?? "");
  const [category, setCategory] = useState(post.category ?? "");
  const [tagsInput, setTagsInput] = useState((post.tags ?? []).join(", "));
  const [coverImage, setCoverImage] = useState(post.coverImage ?? "");
  const [relatedRoadmapsInput, setRelatedRoadmapsInput] = useState(
    (post.relatedRoadmaps ?? []).join(", ")
  );
  const [isPublished, setIsPublished] = useState(post.isPublished ?? false);

  const postId = (post._id ?? post.id) as string;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề"); return; }
    if (!authorName.trim()) { setError("Vui lòng nhập tên tác giả"); return; }
    setError("");
    setSuccess("");

    const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const relatedRoadmaps = relatedRoadmapsInput.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

    startTransition(async () => {
      try {
        await updatePost(postId, {
          title: title.trim(),
          description: description.trim(),
          content: content.trim() || undefined,
          author: { name: authorName.trim() },
          category: category || undefined,
          tags,
          coverImage: coverImage.trim() || undefined,
          relatedRoadmaps,
          isPublished,
        });
        setSuccess("✅ Đã lưu thay đổi!");
        setTimeout(() => router.push(`/blog/${post.slug}`), 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.");
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
          Tiêu đề bài viết <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Hướng dẫn học React từ A đến Z"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Mô tả ngắn{" "}
          <span className="text-muted-foreground font-normal">(tối đa 160 ký tự cho SEO)</span>
        </label>
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
          Nội dung{" "}
          <span className="text-muted-foreground font-normal">(Markdown)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
      </div>

      {/* Author + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Tác giả <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
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
          placeholder="react, javascript, tutorial"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Ảnh bìa{" "}
          <span className="text-muted-foreground font-normal">(URL)</span>
        </label>
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/cover.png"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Related Roadmaps */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Roadmaps liên quan{" "}
          <span className="text-muted-foreground font-normal">(slugs, phân cách bằng dấu phẩy)</span>
        </label>
        <input
          type="text"
          value={relatedRoadmapsInput}
          onChange={(e) => setRelatedRoadmapsInput(e.target.value)}
          placeholder="frontend-roadmap, reactjs-roadmap"
          className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Publish toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="sr-only peer"
          />
          <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
        </label>
        <div>
          <p className="text-sm font-medium">
            {isPublished ? "✅ Xuất bản công khai" : "📝 Lưu nháp"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isPublished ? "Bài viết hiển thị trên /blog" : "Chỉ bạn thấy, có thể publish sau"}
          </p>
        </div>
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
