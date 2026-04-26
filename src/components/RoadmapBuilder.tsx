// ============================================================
// COMPONENTS/ROADMAP-BUILDER.TSX
// ============================================================
// ✅ FIX LAYOUT: Toolbar được đưa ra NGOÀI ReactFlow thành một
//    bar cố định phía trên canvas — không còn đè lên title nữa.
//    Cấu trúc: [Toolbar bar] + [ReactFlow canvas bên dưới]
//
// ✅ FIX ADD NODE: Khi thêm node mới, lập tức saveRoadmapGraph
//    để node tồn tại trong MongoDB trước khi mở modal. Tránh lỗi
//    "không tìm thấy node" khi updateNodeContent được gọi.

"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
  type OnConnect,
  BackgroundVariant,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { nanoid } from "nanoid";

import type { IRoadmap, RoadmapNodeData, AppMode } from "@/types";
import type { Edge } from "reactflow";
import { saveRoadmapGraph, togglePublishRoadmap, deleteRoadmap } from "@/actions/roadmap";
import { createSlug } from "@/lib/utils";
import { createZipBlob, downloadBlob } from "@/lib/client-zip";
import NodeEditModal from "./NodeEditModal";
import CustomRoadmapNode from "./CustomRoadmapNode";
import ShareModal from "./ShareModal";

const nodeTypes = { roadmapNode: CustomRoadmapNode };

interface RoadmapBuilderProps {
  roadmap: IRoadmap;
  mode?: AppMode;
}

export default function RoadmapBuilder({
  roadmap,
  mode: initialMode = "view",
}: RoadmapBuilderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState<AppMode>(initialMode);
  const [isPublished, setIsPublished] = useState(roadmap.isPublished);
  const [publishPending, startPublishTransition] = useTransition();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();

  const handleDeleteRoadmap = useCallback(() => {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    if (!roadmap._id) return;
    startDeleteTransition(async () => {
      try {
        await deleteRoadmap(roadmap._id!);
        router.push("/");
        router.refresh();
      } catch (err) {
        setSaveMessage("❌ Không thể xóa roadmap.");
        setShowDeleteConfirm(false);
        console.error(err);
      }
    });
  }, [showDeleteConfirm, roadmap._id, router]);
  const [roadmapState, setRoadmapState] = useState(roadmap);

  // Kiểm tra quyền edit: owner, collaborator, hoặc allowPublicEdit
  const userEmail = session?.user?.email ?? "";
  const userId = (session?.user as { id?: string } | null | undefined)?.id ?? "";
  const canEdit =
    roadmapState.allowPublicEdit ||
    (!!userId && roadmapState.ownerId === userId) ||
    (!!userEmail && roadmapState.ownerEmail === userEmail) ||
    (!!userEmail && (roadmapState.collaborators ?? []).includes(userEmail));

  const [nodes, setNodes, onNodesChange] = useNodesState(
    roadmap.nodes.map((n) => ({
      id: n.id,
      type: n.type ?? "roadmapNode",
      position: n.position,
      data: n.data as RoadmapNodeData,
    }))
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    roadmap.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type ?? "smoothstep",
      animated: e.animated,
      label: e.label,
    }))
  );

  const [editingNode, setEditingNode] = useState<{
    id: string;
    data: RoadmapNodeData;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      if (mode === "view") {
        const nodeData = node.data as RoadmapNodeData;
        if (nodeData.status === "locked") return;
        if (nodeData.contentSlug) {
          router.push(`/content/${nodeData.contentSlug}`);
        } else if (nodeData.content || nodeData.slug) {
          router.push(`/roadmap/${roadmap.slug}/${nodeData.slug}`);
        }
      } else {
        setEditingNode({ id: node.id, data: node.data as RoadmapNodeData });
        setIsModalOpen(true);
      }
    },
    [mode, roadmap.slug, router]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (mode !== "edit") return;
      setEdges((eds) =>
        addEdge({ ...connection, id: nanoid(), type: "smoothstep", animated: false }, eds)
      );
    },
    [mode, setEdges]
  );

  // ──────────────────────────────────────────────────────────────
  // ✅ FIX: handleAddNode lưu node vào DB ngay lập tức
  //
  // Vấn đề cũ: node mới chỉ tồn tại trong React state. Khi user
  // đóng modal rồi click lại node đó, updateNodeContent sẽ fail
  // vì MongoDB không có node đó.
  //
  // Fix: Sau khi tạo node mới, gọi saveRoadmapGraph ngay để node
  // tồn tại trong DB. Modal sau đó mở bình thường (không cần isNew).
  // ──────────────────────────────────────────────────────────────
  const handleAddNode = useCallback(async () => {
    if (!roadmap._id || isAddingNode) return;

    const newLabel = "Node mới";
    const newNode = {
      id: nanoid(),
      type: "roadmapNode" as const,
      position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: {
        label: newLabel,
        slug: createSlug(newLabel) + "-" + nanoid(4),
        content: "# " + newLabel + "\n\nThêm nội dung ở đây...",
        status: "available" as const,
        icon: "📚",
      } satisfies RoadmapNodeData,
    };

    // 1. Cập nhật React state ngay để UI phản hồi tức thì
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setIsAddingNode(true);

    try {
      // 2. Lưu lên MongoDB ngay — node phải tồn tại trong DB
      //    trước khi modal gọi updateNodeContent
      await saveRoadmapGraph(roadmap._id, {
        nodes: updatedNodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data as RoadmapNodeData,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          animated: e.animated,
          label: e.label as string | undefined,
        })),
      });

      // 3. Mở modal — node đã có trong DB, updateNodeContent sẽ hoạt động bình thường
      setEditingNode({ id: newNode.id, data: newNode.data });
      setIsModalOpen(true);
    } catch (err) {
      // Nếu lưu DB thất bại: xóa node khỏi React state để tránh state không đồng bộ
      setNodes((nds) => nds.filter((n) => n.id !== newNode.id));
      setSaveMessage("❌ Không thể tạo node mới. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsAddingNode(false);
    }
  }, [roadmap._id, isAddingNode, nodes, edges, setNodes]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      await saveRoadmapGraph(roadmap._id!, {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data as RoadmapNodeData,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          animated: e.animated,
          label: e.label as string | undefined,
        })),
      });
      setSaveMessage("✅ Đã lưu!");
    } catch (error) {
      setSaveMessage("❌ Lỗi khi lưu.");
      console.error(error);
    } finally {
      setIsSaving(false);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [isSaving, nodes, edges, roadmap._id]);

  const handleTogglePublish = useCallback(() => {
    if (!roadmap._id) return;
    startPublishTransition(async () => {
      try {
        const result = await togglePublishRoadmap(roadmap._id!, !isPublished);
        setIsPublished(result.isPublished);
        setSaveMessage(result.isPublished ? "🌐 Đã xuất bản!" : "📝 Đã chuyển về Draft");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => setSaveMessage(""), 3000);
      } catch {
        setSaveMessage("❌ Lỗi khi thay đổi trạng thái.");
      }
    });
  }, [roadmap._id, isPublished]);

  // ── Export ZIP ──────────────────────────────────────────────
  // Tạo ZIP client-side (không qua server → không bị 4.5MB Vercel limit)
  // Chứa: roadmap.json (dữ liệu đầy đủ, content là md string)
  //       roadmap.md  (nội dung tổng hợp dễ đọc/sửa)
  //       nodes/[slug].md (file md riêng cho từng node)
  //
  // FIX: Nếu node được link tới một Content (có contentSlug),
  //      export sẽ dùng nội dung của Content đó thay vì d.content nội tuyến.
  const handleExportZip = useCallback(async () => {
    const currentNodes = nodes;
    const currentEdges = edges;

    // Thu thập các contentSlug cần fetch (tránh fetch trùng)
    const slugsToFetch = [
      ...new Set(
        currentNodes
          .map((n) => n.data.contentSlug)
          .filter((s): s is string => !!s)
      ),
    ];

    // Fetch song song tất cả content được link
    const contentMap: Record<string, string> = {};
    if (slugsToFetch.length > 0) {
      await Promise.all(
        slugsToFetch.map(async (slug) => {
          try {
            const res = await fetch(`/api/content/${encodeURIComponent(slug)}`);
            if (res.ok) {
              const json = await res.json();
              // Hỗ trợ cả { content } và { data: { content } }
              const fetched = json?.data ?? json;
              if (fetched?.content) contentMap[slug] = fetched.content as string;
            }
          } catch {
            // Nếu fetch lỗi, fallback về d.content của node
          }
        })
      );
    }

    // Helper: lấy nội dung thực tế cho một node
    const resolveContent = (d: RoadmapNodeData): string => {
      if (d.contentSlug && contentMap[d.contentSlug] !== undefined) {
        return contentMap[d.contentSlug];
      }
      return d.content ?? "";
    };

    // 1. Build JSON export (giữ nguyên cấu trúc, content là md string)
    const exportData = {
      ...roadmap,
      nodes: currentNodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          ...n.data,
          // Ghi đè content bằng nội dung đã resolve (từ linked content nếu có)
          content: resolveContent(n.data),
        },
      })),
      edges: currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        animated: e.animated,
      })),
      exportedAt: new Date().toISOString(),
    };

    // 2. Build markdown tổng hợp (cùng nội dung với JSON)
    const mdLines: string[] = [
      `# ${roadmap.title}`,
      ``,
      roadmap.description ? `> ${roadmap.description}` : "",
      ``,
      `**Tác giả:** ${roadmap.author?.name ?? "—"}  `,
      `**Danh mục:** ${roadmap.category ?? "—"}  `,
      `**Tags:** ${(roadmap.tags ?? []).join(", ") || "—"}`,
      ``,
      `---`,
      ``,
      `## Danh sách Node`,
      ``,
    ];

    for (const n of currentNodes) {
      const d = n.data;
      const resolvedContent = resolveContent(d);
      mdLines.push(`### ${d.icon ?? "📍"} ${d.label}`);
      mdLines.push(`**Slug:** \`${d.slug}\` | **Trạng thái:** ${d.status ?? "—"} | **Độ khó:** ${d.difficulty ?? "—"} | **Thời gian:** ${d.estimatedTime ?? "—"}`);
      if (d.description) mdLines.push(`\n> ${d.description}`);
      mdLines.push(``);
      if (resolvedContent) {
        mdLines.push(resolvedContent);
        mdLines.push(``);
      }
      mdLines.push(`---`);
      mdLines.push(``);
    }

    const combinedMd = mdLines.filter((l) => l !== "").join("\n");

    // 3. Tạo entries ZIP
    const zipEntries = [
      { name: `${roadmap.slug}.json`, content: JSON.stringify(exportData, null, 2) },
      { name: `${roadmap.slug}.md`, content: combinedMd },
    ];

    // Thêm file md riêng cho từng node có content (inline hoặc linked)
    for (const n of currentNodes) {
      const d = n.data;
      const resolvedContent = resolveContent(d);
      if (resolvedContent.trim()) {
        const nodeMd = [
          `# ${d.icon ?? ""} ${d.label}`.trim(),
          ``,
          d.description ? `> ${d.description}\n` : "",
          resolvedContent,
        ].join("\n");
        zipEntries.push({ name: `nodes/${d.slug}.md`, content: nodeMd });
      }
    }

    const blob = createZipBlob(zipEntries);
    downloadBlob(blob, `${roadmap.slug}-export.zip`);

    setSaveMessage("📦 Đã export ZIP thành công!");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaveMessage(""), 3000);
  }, [nodes, edges, roadmap]);

  const handleNodeSave = useCallback(
    (nodeId: string, newData: RoadmapNodeData) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: newData } : n))
      );
      setIsModalOpen(false);
      setEditingNode(null);
    },
    [setNodes]
  );

  const handleEdgesChangeFromModal = useCallback(
    (newEdges: Edge[]) => {
      setEdges(newEdges);
    },
    [setEdges]
  );

  const allNodesForModal = nodes.map((n) => ({ id: n.id, data: n.data }));

  return (
    // ✅ FIX: Wrapper bọc cả toolbar + canvas
    // flex-col đảm bảo toolbar trên, canvas dưới — không chồng lên nhau
    <div
      className="w-full flex flex-col flex-1 min-h-0"
    >
      {/* ══════════════════════════════════════════════
          TOOLBAR BAR — nằm NGOÀI ReactFlow
          Không còn dùng Panel nổi → không bao giờ bị che
      ══════════════════════════════════════════════ */}
      <div className="flex-shrink-0 border-b border-border bg-card/95 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">

          {/* ── Tên roadmap (trái) ── */}
          <h1
            className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs"
            title={roadmap.title}
          >
            🗺️ {roadmap.title}
          </h1>

          {/* ── Divider ── */}
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          {/* ── Mode toggle (chỉ hiện khi có quyền edit) ── */}
          {canEdit && (
            <button
              onClick={() => setMode(mode === "view" ? "edit" : "view")}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                mode === "edit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {mode === "view" ? "✏️ Chỉnh sửa" : "👁️ Xem"}
            </button>
          )}

          {/* ── Edit-mode buttons ── */}
          {mode === "edit" && (
            <>
              <button
                onClick={handleAddNode}
                disabled={isAddingNode}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isAddingNode ? "⏳ Đang tạo..." : "➕ Thêm node"}
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isSaving ? "Đang lưu..." : "💾 Lưu"}
              </button>

              <button
                onClick={handleTogglePublish}
                disabled={publishPending}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
                  isPublished
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {publishPending
                  ? "..."
                  : isPublished
                  ? "📝 Về Draft"
                  : "🌐 Xuất bản"}
              </button>
            </>
          )}

          {/* ── Share button ── */}
          <button
            onClick={() => setShowShareModal(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap"
          >
            🔗 Chia sẻ
          </button>

          {/* ── Export ZIP button ── */}
          <button
            onClick={handleExportZip}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 transition-colors whitespace-nowrap"
            title="Xuất file ZIP chứa .json và .md"
          >
            📦 Export ZIP
          </button>

          {/* ── Delete Roadmap button (chỉ owner + edit mode) ── */}
          {canEdit && (
            showDeleteConfirm ? (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs text-red-600 dark:text-red-400 font-medium whitespace-nowrap">Xóa roadmap?</span>
                <button
                  onClick={handleDeleteRoadmap}
                  disabled={deletePending}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {deletePending ? "..." : "✅ Xác nhận"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs font-medium px-2 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteRoadmap}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors whitespace-nowrap ml-2"
              >
                🗑️ Xóa
              </button>
            )
          )}

          {/* ── Status badge (luôn hiển thị) ── */}
          <span
            className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
              isPublished
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {isPublished ? "🌐 Public" : "📝 Draft"}
          </span>
        </div>

        {/* ── Save message (hiện dưới toolbar) ── */}
        {saveMessage && (
          <p className="mt-1.5 text-xs text-muted-foreground pl-1">{saveMessage}</p>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          REACT FLOW CANVAS — chiếm phần còn lại
      ══════════════════════════════════════════════ */}
      {/* min-h-0 cần thiết để flex-1 child không vượt quá parent trong Firefox */}
      <div className="flex-1 relative min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={mode === "edit" ? onNodesChange : undefined}
          onEdgesChange={mode === "edit" ? onEdgesChange : undefined}
          onConnect={mode === "edit" ? onConnect : undefined}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          nodesDraggable={mode === "edit"}
          nodesConnectable={mode === "edit"}
          elementsSelectable={mode === "edit"}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          aria-label={`Roadmap: ${roadmap.title}`}
          attributionPosition="bottom-right"
          style={{ width: "100%", height: "100%" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={mode === "edit"} />
          <MiniMap
            nodeColor={(node) => {
              const status = (node.data as RoadmapNodeData).status;
              if (status === "completed") return "#22c55e";
              if (status === "active") return "#3b82f6";
              if (status === "locked") return "#9ca3af";
              return "#e2e8f0";
            }}
            pannable
            zoomable
          />

          {/* Hint khi edit mode */}
          {mode === "edit" && (
            <Panel position="bottom-center">
              <p className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-lg">
                Click node để chỉnh sửa · Kéo handle để nối · Kéo node để di chuyển
              </p>
            </Panel>
          )}

          {/* Legend khi view mode */}
          {mode === "view" && (
            <Panel position="bottom-right">
              <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm border border-border px-3 py-2 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Hoàn thành
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Đang học
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-300" /> Mở khoá
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-200 border border-gray-300" /> Có sẵn
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Modal chỉnh sửa node */}
      {isModalOpen && editingNode && (
        <NodeEditModal
          nodeId={editingNode.id}
          nodeData={editingNode.data}
          roadmapId={roadmap._id!}
          isOpen={isModalOpen}
          isNew={false}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNode(null);
          }}
          onSave={handleNodeSave}
          allNodes={allNodesForModal}
          currentEdges={edges}
          onEdgesChange={handleEdgesChangeFromModal}
        />
      )}

      {/* Modal chia sẻ */}
      {showShareModal && (
        <ShareModal
          roadmap={roadmapState}
          onClose={() => setShowShareModal(false)}
          onUpdated={(updated) => {
            setRoadmapState((prev) => ({ ...prev, ...updated }));
          }}
        />
      )}
    </div>
  );
}
