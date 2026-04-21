// ============================================================
// COMPONENTS/ROADMAP-BUILDER.TSX
// Fix 1: Tên roadmap không còn che nút lưu (đưa vào toolbar)
// Fix 2: Node mới tạo cục bộ không gọi updateNodeContent (isNew)
// Fix 3: Navigate tới /blog/[slug] nếu postSlug tồn tại
// ============================================================

"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { saveRoadmapGraph, togglePublishRoadmap } from "@/actions/roadmap";
import { createSlug } from "@/lib/utils";
import NodeEditModal from "./NodeEditModal";
import CustomRoadmapNode from "./CustomRoadmapNode";

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
  const [mode, setMode] = useState<AppMode>(initialMode);
  const [isPublished, setIsPublished] = useState(roadmap.isPublished);
  const [publishPending, startPublishTransition] = useTransition();

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

  const [editingNode, setEditingNode] = useState<{ id: string; data: RoadmapNodeData } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✅ Fix 2: Track node mới tạo cục bộ chưa lưu DB
  const [isNewNode, setIsNewNode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // ── Navigate thông minh khi click node ──
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      if (mode === "view") {
        const nodeData = node.data as RoadmapNodeData;
        if (nodeData.status === "locked") return;
        // ✅ Fix 3: Ưu tiên postSlug → /blog/[slug]
        if (nodeData.postSlug) {
          router.push(`/blog/${nodeData.postSlug}`);
        } else if (nodeData.contentSlug) {
          router.push(`/content/${nodeData.contentSlug}`);
        } else if (nodeData.content || nodeData.slug) {
          router.push(`/roadmap/${roadmap.slug}/${nodeData.slug}`);
        }
      } else {
        // ✅ Fix 2: node đang click để sửa = node đã có trong DB
        setIsNewNode(false);
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

  const handleAddNode = useCallback(() => {
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
    setNodes((nds) => [...nds, newNode]);
    setTimeout(() => {
      // ✅ Fix 2: Đánh dấu là node mới → modal sẽ không gọi updateNodeContent
      setIsNewNode(true);
      setEditingNode({ id: newNode.id, data: newNode.data });
      setIsModalOpen(true);
    }, 100);
  }, [setNodes]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      await saveRoadmapGraph(roadmap._id!, {
        nodes: nodes.map((n) => ({
          id: n.id, type: n.type, position: n.position,
          data: n.data as RoadmapNodeData,
        })),
        edges: edges.map((e) => ({
          id: e.id, source: e.source, target: e.target,
          type: e.type, animated: e.animated,
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

  const handleNodeSave = useCallback(
    (nodeId: string, newData: RoadmapNodeData) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: newData } : n))
      );
      setIsModalOpen(false);
      setEditingNode(null);
      setIsNewNode(false);
    },
    [setNodes]
  );

  const handleEdgesChangeFromModal = useCallback(
    (newEdges: typeof edges) => { setEdges(newEdges); },
    [setEdges]
  );

  const allNodesForModal = nodes.map((n) => ({ id: n.id, data: n.data }));

  return (
    <div id="roadmap-canvas" className="w-full relative" style={{ height: "calc(100vh - 3.5rem)" }}>
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

        {/* ── Toolbar + Title gộp chung ── */}
        {/* ✅ Fix 1: Tên roadmap nằm trong cùng toolbar → không che nút */}
        <Panel position="top-left">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm flex-wrap max-w-[calc(100vw-2rem)]">
            {/* Tên roadmap */}
            <span className="text-sm font-semibold truncate max-w-[160px]" title={roadmap.title}>
              {roadmap.title}
            </span>

            <div className="w-px h-4 bg-border" />

            <button
              onClick={() => setMode(mode === "view" ? "edit" : "view")}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                mode === "edit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {mode === "view" ? "✏️ Chỉnh sửa" : "👁️ Xem"}
            </button>

            {mode === "edit" && (
              <>
                <button
                  onClick={handleAddNode}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  ➕ Thêm node
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Đang lưu..." : "💾 Lưu"}
                </button>
                <button
                  onClick={handleTogglePublish}
                  disabled={publishPending}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                    isPublished
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {publishPending ? "..." : isPublished ? "📝 Draft" : "🌐 Xuất bản"}
                </button>
              </>
            )}

            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isPublished
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {isPublished ? "🌐 Public" : "📝 Draft"}
            </span>
          </div>

          {saveMessage && (
            <div className="mt-2 text-xs bg-card border border-border px-3 py-2 rounded-lg shadow-sm">
              {saveMessage}
            </div>
          )}
        </Panel>

        {mode === "edit" && (
          <Panel position="bottom-center">
            <p className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-lg">
              Click node để chỉnh sửa • Kéo từ handle để tạo kết nối • Kéo node để di chuyển
            </p>
          </Panel>
        )}

        {mode === "view" && (
          <Panel position="bottom-right">
            <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm border border-border px-3 py-2 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Hoàn thành</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Đang học</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300" /> Mở khoá</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-200" /> Có sẵn</div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {isModalOpen && editingNode && (
        <NodeEditModal
          nodeId={editingNode.id}
          nodeData={editingNode.data}
          roadmapId={roadmap._id!}
          isOpen={isModalOpen}
          isNew={isNewNode}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNode(null);
            setIsNewNode(false);
          }}
          onSave={handleNodeSave}
          allNodes={allNodesForModal}
          currentEdges={edges}
          onEdgesChange={handleEdgesChangeFromModal}
        />
      )}
    </div>
  );
}
