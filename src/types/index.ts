// ============================================================
// TYPES & INTERFACES
// ============================================================

import type { Node as RFNode, Edge as RFEdge } from "reactflow";

// ──────────────────────────────────────────────
// 1. ROADMAP NODE DATA
// ──────────────────────────────────────────────
export interface RoadmapNodeData {
  label: string;
  slug: string;
  // ✅ MỚI: contentSlug → link tới Content collection (/content/[slug])
  // Nếu có contentSlug, node navigate tới /content/[contentSlug]
  // Nếu không, fallback về inline /roadmap/[roadmap]/[node]
  contentSlug?: string;
  content: string;
  description?: string;
  status?: "locked" | "available" | "active" | "completed";
  icon?: string;
  estimatedTime?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  prerequisites?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: "article" | "video" | "course" | "book";
  }>;
}

// ──────────────────────────────────────────────
// 2. REACT FLOW NODE & EDGE TYPES
// ──────────────────────────────────────────────
export type RoadmapNode = RFNode<RoadmapNodeData>;
export type RoadmapEdge = RFEdge;

// ──────────────────────────────────────────────
// 3. ROADMAP DOCUMENT (MongoDB)
// ──────────────────────────────────────────────
export interface IRoadmap {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  author: { name: string; avatar?: string };
  category?: string;
  tags?: string[];
  coverImage?: string;
  nodes: Array<{
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: RoadmapNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
    label?: string;
    style?: Record<string, string | number>;
  }>;
  isPublished: boolean;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ──────────────────────────────────────────────
// 4. CONTENT DOCUMENT (MongoDB) – độc lập
// ──────────────────────────────────────────────
export interface IContent {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  tags?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedTime?: string;
  icon?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: "article" | "video" | "course" | "book";
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ──────────────────────────────────────────────
// 5. APP MODE
// ──────────────────────────────────────────────
export type AppMode = "view" | "edit";

// ──────────────────────────────────────────────
// 6. API RESPONSE TYPES
// ──────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ──────────────────────────────────────────────
// 7. SEO METADATA HELPERS
// ──────────────────────────────────────────────
export interface PageSeoProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  type?: "website" | "article";
}

// ──────────────────────────────────────────────
// 8. ROADMAP BUILDER PROPS
// ──────────────────────────────────────────────
export interface RoadmapBuilderProps {
  roadmap: IRoadmap;
  mode: AppMode;
  onSave?: (updatedRoadmap: IRoadmap) => Promise<void>;
}
