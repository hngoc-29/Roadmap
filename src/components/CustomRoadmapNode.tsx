// ============================================================
// COMPONENTS/CUSTOM-ROADMAP-NODE.TSX - Custom React Flow Node
// ============================================================
// ✅ Giao diện đẹp cho mỗi node trong Roadmap
// ✅ Visual feedback theo status (completed/active/locked)
// ✅ Memo để tránh re-render không cần thiết

"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { RoadmapNodeData } from "@/types";
import { cn } from "@/lib/utils";

// Status → màu sắc mapping
const STATUS_STYLES: Record<string, string> = {
  completed:
    "border-green-400 bg-green-50 dark:bg-green-950/30 dark:border-green-600",
  active:
    "border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500",
  locked:
    "border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 opacity-60",
  available: "border-border bg-card",
};

const STATUS_ICON: Record<string, string> = {
  completed: "✅",
  active: "🔵",
  locked: "🔒",
  available: "",
};

// ✅ memo(): Component chỉ re-render khi props thực sự thay đổi
const CustomRoadmapNode = memo(({ data, selected }: NodeProps<RoadmapNodeData>) => {
  const status = data.status ?? "available";
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.available;
  const statusIcon = STATUS_ICON[status];

  return (
    <>
      {/* Handle trên (input) - nơi kết nối đến từ node khác */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
      />

      {/* Node body */}
      <div
        className={cn(
          "roadmap-node relative",
          statusStyle,
          selected && "ring-2 ring-primary ring-offset-2",
          status === "locked" && "cursor-not-allowed"
        )}
        role="button"
        aria-label={`${data.label}${status === "locked" ? " (đã khóa)" : ""}`}
        aria-pressed={status === "active"}
      >
        {/* Status indicator dot */}
        {status !== "available" && (
          <div
            className={cn(
              "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-xs",
              status === "completed" && "bg-green-500",
              status === "active" && "bg-blue-500",
              status === "locked" && "bg-gray-400"
            )}
            aria-hidden
          >
            <span className="text-[10px]">
              {status === "completed" ? "✓" : status === "active" ? "▶" : "🔒"}
            </span>
          </div>
        )}

        {/* Icon */}
        <div className="flex items-center gap-2 mb-1">
          {data.icon && (
            <span className="text-lg leading-none" aria-hidden>
              {data.icon}
            </span>
          )}
          {statusIcon && <span aria-hidden>{statusIcon}</span>}
        </div>

        {/* Label */}
        <p className="text-sm font-semibold leading-tight line-clamp-2">
          {data.label}
        </p>

        {/* Description preview */}
        {data.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Meta: thời gian ước tính */}
        {data.estimatedTime && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            ⏱️ {data.estimatedTime}
          </p>
        )}

        {/* Content library indicator */}
        {data.contentSlug && (
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 flex items-center gap-1">
            🔗 content library
          </p>
        )}
      </div>

      {/* Handle dưới (output) - kéo từ đây để tạo edge mới */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </>
  );
});

CustomRoadmapNode.displayName = "CustomRoadmapNode";

export default CustomRoadmapNode;
