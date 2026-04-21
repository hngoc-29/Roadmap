// ============================================================
// COMPONENTS/CUSTOM-ROADMAP-NODE.TSX
// ============================================================
// ✅ Proper padding, status colours, hover, memo

"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { RoadmapNodeData } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_RING: Record<string, string> = {
  completed: "ring-2 ring-green-400/40 dark:ring-green-500/40",
  active:    "ring-2 ring-blue-400/50  dark:ring-blue-400/50",
  locked:    "",
  available: "",
};

const STATUS_CARD: Record<string, string> = {
  completed: "border-green-400  bg-green-50   dark:bg-green-950/40  dark:border-green-600",
  active:    "border-blue-400   bg-blue-50    dark:bg-blue-950/40   dark:border-blue-500",
  locked:    "border-gray-200   bg-gray-50/80 dark:bg-gray-900/60   dark:border-gray-700 opacity-55",
  available: "border-border     bg-card",
};

const STATUS_DOT: Record<string, string> = {
  completed: "bg-green-500",
  active:    "bg-blue-500 animate-pulse",
  locked:    "bg-gray-400",
  available: "",
};

const STATUS_DOT_ICON: Record<string, string> = {
  completed: "✓",
  active:    "▶",
  locked:    "🔒",
  available: "",
};

const DIFF_BADGE: Record<string, string> = {
  beginner:     "bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  advanced:     "bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300",
};

const CustomRoadmapNode = memo(({ data, selected }: NodeProps<RoadmapNodeData>) => {
  const status  = data.status   ?? "available";
  const cardCls = STATUS_CARD[status] ?? STATUS_CARD.available;
  const ringCls = STATUS_RING[status] ?? "";
  const dotCls  = STATUS_DOT[status];
  const dotIcon = STATUS_DOT_ICON[status];

  return (
    <>
      {/* ── Top handle (incoming connection) ── */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground/60 !border-2 !border-background hover:!bg-primary transition-colors"
      />

      {/* ── Node card ── */}
      <div
        className={cn(
          "roadmap-node relative select-none",
          cardCls,
          ringCls,
          selected && "ring-2 ring-primary ring-offset-2",
          status === "locked" && "cursor-not-allowed"
        )}
        role="button"
        aria-label={`${data.label}${status === "locked" ? " (đã khóa)" : ""}`}
      >
        {/* Status dot badge */}
        {dotIcon && (
          <span
            className={cn(
              "absolute -top-2 -right-2 w-5 h-5 rounded-full",
              "border-2 border-background flex items-center justify-center",
              "text-white text-[10px] font-bold leading-none shadow-sm",
              dotCls
            )}
            aria-hidden
          >
            {status !== "locked" ? dotIcon : ""}
          </span>
        )}

        {/* ── Header row: icon + label ── */}
        <div className="flex items-start gap-2 mb-1.5">
          {data.icon && (
            <span className="text-xl leading-none shrink-0 mt-0.5" aria-hidden>
              {data.icon}
            </span>
          )}
          <p className="text-sm font-semibold leading-tight line-clamp-2 break-words min-w-0">
            {data.label}
          </p>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">
            {data.description}
          </p>
        )}

        {/* ── Meta row ── */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {data.difficulty && (
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none",
                DIFF_BADGE[data.difficulty] ?? ""
              )}
            >
              {data.difficulty === "beginner"
                ? "Cơ bản"
                : data.difficulty === "intermediate"
                ? "Trung cấp"
                : "Nâng cao"}
            </span>
          )}

          {data.estimatedTime && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              ⏱ {data.estimatedTime}
            </span>
          )}
        </div>

        {/* Content library indicator */}
        {data.contentSlug && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-500 dark:text-blue-400 font-medium">
            <span>🔗</span>
            <span className="truncate font-mono">/content/{data.contentSlug}</span>
          </div>
        )}
      </div>

      {/* ── Bottom handle (outgoing connection) ── */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!bg-primary/80 transition-colors"
      />
    </>
  );
});

CustomRoadmapNode.displayName = "CustomRoadmapNode";
export default CustomRoadmapNode;
