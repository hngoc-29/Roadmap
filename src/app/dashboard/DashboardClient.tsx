"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteRoadmap, togglePublishRoadmap } from "@/actions/roadmap";
import type { IRoadmap, IPost, IContent } from "@/types";
import type { INote } from "@/actions/note";

// ── Shared badge helpers ──────────────────────────────────────
function PublishedBadge({ isPublished }: { isPublished: boolean }) {
  return isPublished ? (
    <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
      ✅ Public
    </span>
  ) : (
    <span className="text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
      📝 Draft
    </span>
  );
}

function TagList({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.slice(0, 4).map((t) => (
        <span key={t} className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded">
          #{t}
        </span>
      ))}
    </div>
  );
}

function EmptyState({ icon, message, href, cta }: { icon: string; message: string; href: string; cta: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-border rounded-2xl">
      <p className="text-5xl mb-3">{icon}</p>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Link href={href}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
        {cta}
      </Link>
    </div>
  );
}

// ── Roadmap Tab ───────────────────────────────────────────────
function RoadmapTab({ roadmaps }: { roadmaps: IRoadmap[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function handleDelete(id: string, title: string) {
    if (!confirm(`Xóa roadmap "${title}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteRoadmap(id);
        router.refresh();
      } catch (e) {
        alert((e as Error).message);
      } finally {
        setDeletingId(null);
      }
    });
  }

  function handleTogglePublish(id: string, current: boolean) {
    setTogglingId(id);
    startTransition(async () => {
      try {
        await togglePublishRoadmap(id, !current);
        router.refresh();
      } catch (e) {
        alert((e as Error).message);
      } finally {
        setTogglingId(null);
      }
    });
  }

  if (!roadmaps.length)
    return <EmptyState icon="🗺️" message="Bạn chưa có roadmap nào." href="/builder/new" cta="➕ Tạo roadmap đầu tiên" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {roadmaps.map((rm) => (
        <div key={rm._id} className="border border-border rounded-xl p-4 bg-card flex flex-col gap-3 hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <PublishedBadge isPublished={rm.isPublished} />
              {rm.allowPublicEdit && (
                <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                  🔓 Mọi người có thể sửa
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {rm.nodes?.length ?? 0} bài học
            </span>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold line-clamp-2 mb-1">{rm.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{rm.description}</p>
            <TagList tags={rm.tags} />
          </div>

          {rm.collaborators && rm.collaborators.length > 0 && (
            <p className="text-xs text-muted-foreground">
              👥 {rm.collaborators.length} collaborator{rm.collaborators.length > 1 ? "s" : ""}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
            <Link href={`/roadmap/${rm.slug}`}
              className="flex-1 text-center text-xs px-2 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              👁 Xem
            </Link>
            <Link href={`/builder/new?edit=${rm._id}`}
              className="flex-1 text-center text-xs px-2 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              ✏️ Sửa
            </Link>
            <button
              onClick={() => handleTogglePublish(rm._id!, rm.isPublished)}
              disabled={pending && togglingId === rm._id}
              className="flex-1 text-center text-xs px-2 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
              {togglingId === rm._id ? "..." : rm.isPublished ? "📥 Ẩn" : "📤 Publish"}
            </button>
            <button
              onClick={() => handleDelete(rm._id!, rm.title)}
              disabled={pending && deletingId === rm._id}
              className="text-xs px-2 py-1.5 border border-destructive/50 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50">
              {deletingId === rm._id ? "..." : "🗑️"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Post Tab ──────────────────────────────────────────────────
function PostTab({ posts }: { posts: IPost[] }) {
  if (!posts.length)
    return <EmptyState icon="✍️" message="Bạn chưa có bài viết nào." href="/blog/new" cta="✍️ Viết bài đầu tiên" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div key={post._id ?? post.id}
          className="border border-border rounded-xl p-4 bg-card flex flex-col gap-3 hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <PublishedBadge isPublished={post.isPublished} />
            {post.viewCount !== undefined && (
              <span className="text-xs text-muted-foreground">👁 {post.viewCount}</span>
            )}
          </div>

          <div className="flex-1">
            {post.category && (
              <span className="text-xs font-medium text-primary">{post.category}</span>
            )}
            <h3 className="font-semibold line-clamp-2 mb-1 mt-0.5">{post.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
            <TagList tags={post.tags} />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Link href={`/blog/${post.slug}`}
              className="flex-1 text-center text-xs px-2 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              👁 Xem
            </Link>
            <Link href={`/blog/${post.slug}/edit`}
              className="flex-1 text-center text-xs px-2 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              ✏️ Sửa
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Note Tab ──────────────────────────────────────────────────
const NOTE_COLORS: Record<string, string> = {
  yellow: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800",
  blue: "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800",
  green: "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800",
  pink: "bg-pink-50 border-pink-200 dark:bg-pink-900/10 dark:border-pink-800",
  purple: "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800",
  default: "bg-card border-border",
};

function NoteTab({ notes }: { notes: INote[] }) {
  if (!notes.length)
    return <EmptyState icon="📝" message="Bạn chưa có ghi chú nào." href="/notes/new" cta="📝 Tạo ghi chú đầu tiên" />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {notes.map((note) => {
        const colorClass = NOTE_COLORS[note.color ?? "default"] ?? NOTE_COLORS.default;
        const preview = note.content?.replace(/[#*`>_]/g, "").trim().slice(0, 100);
        return (
          <div key={note._id ?? note.id}
            className={`border rounded-xl p-4 flex flex-col gap-2 ${colorClass} hover:shadow-sm transition-all`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold line-clamp-1 flex-1">{note.title}</span>
              {note.isPinned && <span title="Đã ghim">📌</span>}
            </div>
            {preview && <p className="text-sm text-muted-foreground line-clamp-3">{preview}</p>}
            <TagList tags={note.tags} />
            <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-auto">
              <Link href={`/notes/${note.slug}`}
                className="flex-1 text-center text-xs px-2 py-1.5 border border-border/60 rounded-lg hover:bg-background/50 transition-colors">
                👁 Xem
              </Link>
              <Link href={`/notes/${note.slug}/edit`}
                className="flex-1 text-center text-xs px-2 py-1.5 border border-border/60 rounded-lg hover:bg-background/50 transition-colors">
                ✏️ Sửa
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Content Tab ───────────────────────────────────────────────
const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function ContentTab({ contents }: { contents: IContent[] }) {
  if (!contents.length)
    return <EmptyState icon="📚" message="Bạn chưa có nội dung nào." href="/content/new" cta="📚 Thêm nội dung đầu tiên" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {contents.map((ct) => (
        <div key={ct._id ?? ct.id}
          className="border border-border rounded-xl p-4 bg-card flex flex-col gap-3 hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <span className="text-2xl">{ct.icon ?? "📄"}</span>
            <div className="flex flex-wrap gap-1">
              {ct.difficulty && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[ct.difficulty] ?? ""}`}>
                  {ct.difficulty === "beginner" ? "🌱 Cơ bản" : ct.difficulty === "intermediate" ? "🔥 Trung bình" : "⚡ Nâng cao"}
                </span>
              )}
              {ct.estimatedTime && (
                <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                  ⏱ {ct.estimatedTime}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold line-clamp-2 mb-1">{ct.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{ct.description}</p>
            <TagList tags={ct.tags} />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Link href={`/content/${ct.slug}`}
              className="flex-1 text-center text-xs px-2 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              👁 Xem
            </Link>
            <Link href={`/content/${ct.slug}/edit`}
              className="flex-1 text-center text-xs px-2 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              ✏️ Sửa
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────
interface Props {
  roadmaps: IRoadmap[];
  posts: IPost[];
  notes: INote[];
  contents: IContent[];
  userEmail: string;
}

const TABS = [
  { id: "roadmaps", label: "🗺️ Roadmaps" },
  { id: "posts", label: "✍️ Bài viết" },
  { id: "notes", label: "📝 Ghi chú" },
  { id: "contents", label: "📚 Nội dung" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DashboardClient({ roadmaps, posts, notes, contents }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("roadmaps");

  const counts: Record<TabId, number> = {
    roadmaps: roadmaps.length,
    posts: posts.length,
    notes: notes.length,
    contents: contents.length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            id={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {counts[id]}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "roadmaps" && <RoadmapTab roadmaps={roadmaps} />}
        {activeTab === "posts" && <PostTab posts={posts} />}
        {activeTab === "notes" && <NoteTab notes={notes} />}
        {activeTab === "contents" && <ContentTab contents={contents} />}
      </div>
    </div>
  );
}
