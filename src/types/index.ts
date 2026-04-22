// ============================================================
// TYPES & INTERFACES
// ============================================================

import type { Node as RFNode, Edge as RFEdge } from "reactflow";

export interface RoadmapNodeData {
  label: string;
  slug: string;
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

export type RoadmapNode = RFNode<RoadmapNodeData>;
export type RoadmapEdge = RFEdge;

export interface IRoadmap {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  author: { name: string; avatar?: string };
  // Auth / Collaboration
  ownerId?: string;
  ownerEmail?: string;
  collaborators?: string[];
  allowPublicEdit?: boolean;
  // Other
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
  // Auth / ownership
  ownerId?: string;
  ownerEmail?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: "article" | "video" | "course" | "book";
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type AppMode = "view" | "edit";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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

export interface RoadmapBuilderProps {
  roadmap: IRoadmap;
  mode: AppMode;
  onSave?: (updatedRoadmap: IRoadmap) => Promise<void>;
}

export interface IPost {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  coverImage?: string;
  author: { name: string; avatar?: string };
  // Auth / ownership
  ownerId?: string;
  ownerEmail?: string;
  category?: string;
  tags?: string[];
  relatedRoadmaps?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: "article" | "video" | "course" | "book";
  }>;
  isPublished: boolean;
  publishedAt?: Date | string;
  viewCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
