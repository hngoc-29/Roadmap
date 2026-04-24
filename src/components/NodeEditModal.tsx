// ============================================================
// COMPONENTS/NODE-EDIT-MODAL.TSX
// ============================================================
// Modal chỉnh sửa node với 3 tab:
//   1. Cơ bản  – icon, label, slug, mô tả, status, độ khó, thời gian
//   2. Nội dung – viết inline hoặc link tới Content thư viện
//              + Import file (.txt/.md → content, .json → tất cả fields)
//   3. Kết nối  – quản lý edges tới/từ node này (không cần kéo thả)
//
// ✅ File import xử lý hoàn toàn client-side (FileReader) →
//    không gửi lên server → không bị giới hạn 4.5MB Vercel

"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import type { Edge } from 'reactflow';
import * as Dialog from "@radix-ui/react-dialog";
import { updateNodeContent } from "@/actions/roadmap";
import { createContent, searchContent } from "@/actions/content";
import { createSlug } from "@/lib/utils";
import type { RoadmapNodeData, IContent } from "@/types";

// ──────────────────────────────────────────────
type ModalTab = "basic" | "content" | "connections";
type ContentMode = "inline" | "library";

interface NodeEditModalProps {
  nodeId: string;
  nodeData: RoadmapNodeData;
  roadmapId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, newData: RoadmapNodeData) => void;
  allNodes?: Array<{ id: string; data: RoadmapNodeData }>;
  currentEdges?: Edge[];
  onEdgesChange: (newEdges: Edge[]) => void;
  isNew?: boolean;
}

// ──────────────────────────────────────────────
// JSON import format (chuẩn hóa)
// ──────────────────────────────────────────────
interface NodeImportJSON {
  label?: string;
  slug?: string;
  description?: string;
  icon?: string;
  estimatedTime?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  status?: "locked" | "available" | "active" | "completed";
  content?: string;
  tags?: string[];
}

// ──────────────────────────────────────────────
// Inline Markdown Preview
// ──────────────────────────────────────────────
function SimpleMarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-muted-foreground italic text-sm">Chưa có nội dung...</p>;
  }
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) return <p key={i} className="text-lg font-bold">{line.slice(2)}</p>;
        if (line.startsWith("## ")) return <p key={i} className="text-base font-semibold">{line.slice(3)}</p>;
        if (line.startsWith("### ")) return <p key={i} className="text-sm font-semibold">{line.slice(4)}</p>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <p key={i} className="ml-3">• {line.slice(2)}</p>;
        if (line.startsWith("```")) return <hr key={i} className="border-dashed border-muted-foreground/30" />;
        if (line === "") return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
// Content Picker
// ──────────────────────────────────────────────
function ContentPicker({ selected, onSelect }: { selected: string; onSelect: (slug: string, title: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { doSearch(""); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = (q: string) => {
    setLoading(true);
    startTransition(async () => {
      try { const res = await searchContent(q); setResults(res); }
      finally { setLoading(false); }
    });
  };

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const DIFF_LABELS: Record<string, string> = {
    beginner: "🟢 Cơ bản", intermediate: "🟡 Trung cấp", advanced: "🔴 Nâng cao",
  };

  return (
    <div className="space-y-3">
      <input type="text" value={query} onChange={(e) => handleInput(e.target.value)}
        placeholder="🔍 Tìm theo tên, tag..."
        className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      {loading && <p className="text-xs text-muted-foreground text-center py-2">Đang tìm...</p>}
      <div className="space-y-1.5 max-h-52 overflow-y-auto">
        {!loading && results.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Không tìm thấy content nào.</p>}
        {results.map((c) => (
          <button key={c._id ?? c.id} type="button" onClick={() => onSelect(c.slug, c.title)}
            className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all text-sm hover:border-primary/50 ${selected === c.slug ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium line-clamp-1">{c.icon ?? "📄"} {c.title}</span>
              {c.difficulty && <span className="text-xs text-muted-foreground shrink-0">{DIFF_LABELS[c.difficulty]}</span>}
            </div>
            {c.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>}
            <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">/content/{c.slug}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// FileImportButton — xử lý client-side hoàn toàn
// ──────────────────────────────────────────────
interface FileImportButtonProps {
  accept: string;
  label: string;
  onImport: (text: string, filename: string) => void;
}

function FileImportButton({ accept, label, onImport }: FileImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Đọc file hoàn toàn trên client — không upload lên server
    // → không bị giới hạn 4.5MB body size của Vercel
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) onImport(text, file.name);
    };
    reader.readAsText(file, "utf-8");

    // Reset input để có thể import lại cùng file
    e.target.value = "";
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
        📂 {label}
      </button>
    </>
  );
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export default function NodeEditModal({
  nodeId, nodeData, roadmapId, isOpen, onClose, onSave,
  allNodes = [], currentEdges = [], onEdgesChange, isNew = false,
}: NodeEditModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("basic");

  // Tab 1: Cơ bản
  const [label, setLabel] = useState(nodeData.label);
  const [slug, setSlug] = useState(nodeData.slug);
  const [description, setDescription] = useState(nodeData.description ?? "");
  const [icon, setIcon] = useState(nodeData.icon ?? "📚");
  const [estimatedTime, setEstimatedTime] = useState(nodeData.estimatedTime ?? "");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">(nodeData.difficulty ?? "beginner");
  const [status, setStatus] = useState(nodeData.status ?? "available");
  const [slugEdited, setSlugEdited] = useState(false);

  // Tab 2: Nội dung
  const [contentMode, setContentMode] = useState<ContentMode>(nodeData.contentSlug ? "library" : "inline");
  const [inlineContent, setInlineContent] = useState(nodeData.content ?? "");
  const [previewMode, setPreviewMode] = useState(false);
  const [contentSlug, setContentSlug] = useState(nodeData.contentSlug ?? "");
  const [contentTitle, setContentTitle] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState(label);
  const [isCreatingContent, startCreateContent] = useTransition();

  // Tab 3: Kết nối
  const [localEdges, setLocalEdges] = useState<Edge[]>(currentEdges);

  // Import feedback
  const [importMsg, setImportMsg] = useState("");

  // Save state
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  type NodeStatus = "active" | "completed" | "locked" | "available";

  const handleLabelChange = useCallback((val: string) => {
    setLabel(val);
    if (!slugEdited) setSlug(createSlug(val) || slug);
  }, [slugEdited, slug]);

  // ── File Import Handlers ──────────────────────────────────

  /**
   * Import .txt hoặc .md → điền vào ô content (tab Nội dung)
   * Xử lý client-side qua FileReader, không upload server
   */
  const handleImportTextFile = useCallback((text: string, filename: string) => {
    setInlineContent(text);
    setContentMode("inline");
    setActiveTab("content");
    setImportMsg(`✅ Đã import "${filename}" vào nội dung`);
    setTimeout(() => setImportMsg(""), 3000);
  }, []);

  /**
   * Import .json đúng format → điền vào đúng các field
   * Format: { label, slug, description, icon, estimatedTime, difficulty, status, content }
   */
  const handleImportJSON = useCallback((text: string, filename: string) => {
    try {
      const data = JSON.parse(text) as NodeImportJSON;

      // Fill Tab 1: Cơ bản
      if (data.label) { setLabel(data.label); setSlugEdited(true); }
      if (data.slug) { setSlug(data.slug); setSlugEdited(true); }
      else if (data.label) setSlug(createSlug(data.label));
      if (data.description !== undefined) setDescription(data.description);
      if (data.icon) setIcon(data.icon);
      if (data.estimatedTime) setEstimatedTime(data.estimatedTime);
      if (data.difficulty && ["beginner", "intermediate", "advanced"].includes(data.difficulty)) {
        setDifficulty(data.difficulty);
      }
      if (data.status && ["locked", "available", "active", "completed"].includes(data.status)) {
        setStatus(data.status);
      }

      // Fill Tab 2: Nội dung
      if (data.content !== undefined) {
        setInlineContent(data.content);
        setContentMode("inline");
      }

      setImportMsg(`✅ Đã import "${filename}" vào tất cả fields`);
      setTimeout(() => setImportMsg(""), 3000);
    } catch {
      setImportMsg(`❌ File JSON không đúng định dạng`);
      setTimeout(() => setImportMsg(""), 3000);
    }
  }, []);

  /**
   * Router: dựa vào extension file để gọi đúng handler
   */
  const handleFileImport = useCallback((text: string, filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();
    if (ext === "json") {
      handleImportJSON(text, filename);
    } else {
      // .txt, .md, hoặc bất kỳ text file nào → điền vào content
      handleImportTextFile(text, filename);
    }
  }, [handleImportJSON, handleImportTextFile]);

  // ── Connections ──────────────────────────────────────────
  const toggleConnection = useCallback((targetId: string) => {
    setLocalEdges((prev) => {
      const existingIdx = prev.findIndex((e) => e.source === nodeId && e.target === targetId);
      if (existingIdx >= 0) return prev.filter((_, i) => i !== existingIdx);
      return [...prev, { id: `e-${nodeId}-${targetId}-${Date.now()}`, source: nodeId, target: targetId, type: "smoothstep", animated: false }];
    });
  }, [nodeId]);

  const isConnected = (targetId: string) => localEdges.some((e) => e.source === nodeId && e.target === targetId);

  // ── Quick-create content ──────────────────────────────────
  const handleQuickCreateContent = useCallback(() => {
    if (!newContentTitle.trim()) return;
    startCreateContent(async () => {
      try {
        const created = await createContent({
          title: newContentTitle.trim(), icon,
          difficulty: difficulty as IContent["difficulty"], estimatedTime,
        });
        setContentSlug(created.slug); setContentTitle(created.title);
        setShowQuickCreate(false); setContentMode("library");
      } catch (e) { console.error(e); setError("Không thể tạo content mới."); }
    });
  }, [newContentTitle, icon, difficulty, estimatedTime]);

  // ── Save ─────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!label.trim()) { setError("Label không được để trống"); return; }
    if (!slug.trim()) { setError("Slug không được để trống"); return; }
    setError("");

    const newData: RoadmapNodeData = {
      ...nodeData,
      label: label.trim(), slug: slug.trim(),
      content: contentMode === "inline" ? inlineContent : (nodeData.content ?? ""),
      contentSlug: contentMode === "library" ? (contentSlug || undefined) : undefined,
      description: description.trim(), icon,
      estimatedTime: estimatedTime.trim(),
      difficulty: difficulty as RoadmapNodeData["difficulty"],
      status: status as RoadmapNodeData["status"],
    };

    startTransition(async () => {
      try {
        if (!isNew) {
          await updateNodeContent(roadmapId, nodeId, {
            label: newData.label, content: newData.content,
            description: newData.description, slug: newData.slug,
            contentSlug: newData.contentSlug,
          });
        }
        if (onEdgesChange) {
          const otherEdges = currentEdges.filter((e) => e.source !== nodeId && e.target !== nodeId);
          const incomingEdges = currentEdges.filter((e) => e.target === nodeId);
          const outgoingEdges = localEdges.filter((e) => e.source === nodeId);
          onEdgesChange([...otherEdges, ...incomingEdges, ...outgoingEdges]);
        }
        onSave(nodeId, newData);
      } catch (err) { setError("Lỗi khi lưu. Vui lòng thử lại."); console.error(err); }
    });
  }, [label, slug, contentMode, inlineContent, contentSlug, description, icon, estimatedTime, difficulty, status, nodeData, roadmapId, nodeId, isNew, onSave, onEdgesChange, currentEdges, localEdges]);

  const TAB_LABELS: Record<ModalTab, string> = { basic: "⚙️ Cơ bản", content: "📝 Nội dung", connections: "🔗 Kết nối" };
  const otherNodes = allNodes.filter((n) => n.id !== nodeId);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl max-h-[92vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          aria-describedby="modal-desc">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold">
              {isNew ? "✨ Tạo node mới" : "✏️ Chỉnh sửa node"}
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {/* Import button — luôn hiển thị ở header để tiện dùng */}
              <FileImportButton
                accept=".txt,.md,.json"
                label="Import file"
                onImport={handleFileImport}
              />
              <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Đóng">✕</Dialog.Close>
            </div>
          </div>

          {/* Import feedback toast */}
          {importMsg && (
            <div className={`mx-6 mt-3 text-xs px-4 py-2 rounded-lg border flex-shrink-0 ${importMsg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"}`}>
              {importMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border px-6 flex-shrink-0">
            {(["basic", "content", "connections"] as ModalTab[]).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {TAB_LABELS[tab]}
                {tab === "connections" && otherNodes.length > 0 && (
                  <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
                    {localEdges.filter((e) => e.source === nodeId || e.target === nodeId).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <p id="modal-desc" className="sr-only">Form chỉnh sửa node trong roadmap</p>

            {error && <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">{error}</div>}

            {/* ═══ TAB 1: CƠ BẢN ═══ */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                {/* JSON import hint */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Điền thông tin cơ bản cho node</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Import từ file:</span>
                    <FileImportButton accept=".json" label=".json" onImport={handleImportJSON} />
                  </div>
                </div>

                {/* Icon + Label */}
                <div className="flex gap-3">
                  <div className="w-20">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Icon</label>
                    <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)}
                      className="w-full border border-input bg-background rounded-lg px-2 py-2 text-center text-xl focus:outline-none focus:ring-2 focus:ring-ring" maxLength={2} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tiêu đề <span className="text-destructive">*</span></label>
                    <input type="text" value={label} onChange={(e) => handleLabelChange(e.target.value)}
                      className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="VD: Giới thiệu về HTML" />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Slug node <span className="font-normal">(dùng cho fallback URL)</span></label>
                  <div className="flex items-center gap-2 border border-input bg-background rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">/roadmap/.../</span>
                    <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); setSlugEdited(true); }}
                      className="flex-1 text-sm bg-transparent focus:outline-none font-mono" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Mô tả ngắn <span className="font-normal">(SEO meta description)</span></label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={300}
                    className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Mô tả ngắn gọn..." />
                  <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/300</p>
                </div>

                {/* Status + Difficulty + Time */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Trạng thái</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as NodeStatus)}
                      className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="available">✅ Mở</option>
                      <option value="active">🔵 Đang học</option>
                      <option value="completed">🏆 Hoàn thành</option>
                      <option value="locked">🔒 Khoá</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Mức độ</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")}
                      className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="beginner">🟢 Cơ bản</option>
                      <option value="intermediate">🟡 Trung cấp</option>
                      <option value="advanced">🔴 Nâng cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Thời gian</label>
                    <input type="text" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="2 giờ" />
                  </div>
                </div>

                {/* JSON Format Guide */}
                <details className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                  <summary className="px-4 py-2.5 text-xs font-medium cursor-pointer hover:bg-muted/60 transition-colors text-muted-foreground">
                    📋 Format JSON import
                  </summary>
                  <pre className="px-4 pb-4 pt-2 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed">{`{
  "label": "Tiêu đề node",
  "slug": "tieu-de-node",
  "description": "Mô tả ngắn",
  "icon": "📚",
  "estimatedTime": "2 giờ",
  "difficulty": "beginner",
  "status": "available",
  "content": "# Nội dung Markdown\\n\\n..."
}`}</pre>
                </details>
              </div>
            )}

            {/* ═══ TAB 2: NỘI DUNG ═══ */}
            {activeTab === "content" && (
              <div className="space-y-4">
                {/* Mode toggle */}
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button type="button" onClick={() => setContentMode("inline")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${contentMode === "inline" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted/50"}`}>
                    ✍️ Viết trực tiếp
                    <p className="text-xs font-normal mt-0.5 opacity-80">Lưu nội dung trong node này</p>
                  </button>
                  <button type="button" onClick={() => setContentMode("library")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-l border-border ${contentMode === "library" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted/50"}`}>
                    🔗 Dùng Content thư viện
                    <p className="text-xs font-normal mt-0.5 opacity-80">Nhiều node cùng dùng 1 content</p>
                  </button>
                </div>

                {/* ── INLINE MODE ── */}
                {contentMode === "inline" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-muted-foreground">Nội dung Markdown</label>
                      <div className="flex items-center gap-2">
                        {/* File import buttons */}
                        <FileImportButton accept=".txt,.md" label=".txt / .md" onImport={handleImportTextFile} />
                        <FileImportButton accept=".json" label=".json" onImport={handleImportJSON} />
                        {/* Preview toggle */}
                        <div className="flex gap-1 bg-muted rounded-lg p-1">
                          <button type="button" onClick={() => setPreviewMode(false)}
                            className={`text-xs px-3 py-1 rounded-md transition-colors ${!previewMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            📝 Soạn
                          </button>
                          <button type="button" onClick={() => setPreviewMode(true)}
                            className={`text-xs px-3 py-1 rounded-md transition-colors ${previewMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            👁️ Preview
                          </button>
                        </div>
                      </div>
                    </div>

                    {!previewMode ? (
                      <textarea value={inlineContent} onChange={(e) => setInlineContent(e.target.value)} rows={14}
                        className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder={`# ${label}\n\nNhập nội dung Markdown...\n\n## Nội dung chính\n\n- Điểm 1\n- Điểm 2`} spellCheck={false} />
                    ) : (
                      <div className="min-h-[200px] max-h-[300px] border border-border rounded-lg p-4 overflow-y-auto bg-background">
                        <SimpleMarkdownPreview content={inlineContent} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Hỗ trợ Markdown đầy đủ · Import .txt hoặc .md để điền tự động
                    </p>
                  </div>
                )}

                {/* ── LIBRARY MODE ── */}
                {contentMode === "library" && (
                  <div className="space-y-3">
                    {contentSlug ? (
                      <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{contentTitle || contentSlug}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">/content/{contentSlug}</p>
                        </div>
                        <button type="button" onClick={() => { setContentSlug(""); setContentTitle(""); }}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                          ✕ Bỏ chọn
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Chọn content từ thư viện để node này link tới <span className="font-mono">/content/[slug]</span>
                      </p>
                    )}
                    <ContentPicker selected={contentSlug} onSelect={(s, t) => { setContentSlug(s); setContentTitle(t); }} />
                    <div className="border-t border-border pt-3">
                      {!showQuickCreate ? (
                        <button type="button" onClick={() => { setShowQuickCreate(true); setNewContentTitle(label); }}
                          className="text-sm text-primary hover:underline">
                          + Tạo content mới từ đây
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Tạo content mới nhanh:</p>
                          <div className="flex gap-2">
                            <input type="text" value={newContentTitle} onChange={(e) => setNewContentTitle(e.target.value)}
                              className="flex-1 border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Tiêu đề content" />
                            <button type="button" onClick={handleQuickCreateContent} disabled={isCreatingContent || !newContentTitle.trim()}
                              className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap">
                              {isCreatingContent ? "..." : "✨ Tạo"}
                            </button>
                            <button type="button" onClick={() => setShowQuickCreate(false)}
                              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                              Huỷ
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ TAB 3: KẾT NỐI ═══ */}
            {activeTab === "connections" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Chọn các node mà <strong>{label}</strong> kết nối tới. Thay đổi sẽ được lưu khi bấm <strong>Lưu</strong>.
                </p>
                {otherNodes.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-3xl mb-2">🌐</p>
                    <p className="text-sm">Chưa có node nào khác trong roadmap.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {otherNodes.map((n) => {
                      const connected = isConnected(n.id);
                      const isIncoming = localEdges.some((e) => e.source === n.id && e.target === nodeId);
                      return (
                        <div key={n.id} className={`flex items-center justify-between rounded-lg border px-3 py-3 transition-all ${connected ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{n.data.icon ?? "📚"}</span>
                            <div>
                              <p className="text-sm font-medium">{n.data.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {isIncoming && "← kết nối vào node này "}
                                {connected && "→ node này kết nối tới"}
                              </p>
                            </div>
                          </div>
                          <button type="button" onClick={() => toggleConnection(n.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${connected ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-border hover:border-primary hover:bg-primary/5 hover:text-primary"}`}>
                            {connected ? "✕ Xoá kết nối" : "+ Kết nối"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {localEdges.filter((e) => e.source === nodeId).length > 0 && (
                  <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Kết nối hiện tại từ node này:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {localEdges.filter((e) => e.source === nodeId).map((e) => {
                        const targetNode = allNodes.find((n) => n.id === e.target);
                        return <span key={e.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">→ {targetNode?.data.label ?? e.target}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              {isNew ? (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Nhớ bấm &quot;💾 Lưu&quot; trên toolbar để lưu vào database</span>
              ) : contentMode === "library" && contentSlug ? (
                <>URL: <span className="font-mono">/content/{contentSlug}</span></>
              ) : (
                <>URL: <span className="font-mono">/roadmap/.../{slug}</span></>
              )}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} disabled={isPending}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50">
                Huỷ
              </button>
              <button type="button" onClick={handleSave} disabled={isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {isPending ? "Đang lưu..." : isNew ? "✨ Thêm node" : "💾 Lưu node"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
