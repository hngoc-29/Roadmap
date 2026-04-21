// ============================================================
// MODELS/ROADMAP.TS - Mongoose Schema & Model
// ============================================================
// Đây là trái tim của database layer. Schema được thiết kế để:
// 1. Lưu toàn bộ graph (nodes + edges) trong 1 document
// 2. Mỗi node có slug riêng → tạo SEO URL độc lập
// 3. Hỗ trợ incremental updates (chỉ save field thay đổi)

import mongoose, { Schema, Document, Model, models } from "mongoose";

// ──────────────────────────────────────────────
// SUB-SCHEMAS
// ──────────────────────────────────────────────

/**
 * Resource Schema - tài liệu tham khảo trong mỗi Node
 */
const ResourceSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["article", "video", "course", "book"],
      default: "article",
    },
  },
  { _id: false } // Không cần _id riêng cho sub-document nhỏ
);

/**
 * NodeData Schema - dữ liệu tùy chỉnh trong mỗi React Flow Node
 * Đây là phần quan trọng nhất cho SEO: mỗi node là 1 trang học riêng
 */
const NodeDataSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, "Label của node là bắt buộc"],
      trim: true,
      maxlength: [100, "Label không quá 100 ký tự"],
    },
    // ✅ contentSlug: link tới Content collection → /content/[slug]
    contentSlug: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    // ✅ SEO KEY: Slug này tạo URL /roadmap/[roadmap-slug]/[node-slug]
    slug: {
      type: String,
      required: [true, "Slug của node là bắt buộc"],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ"],
    },
    // ✅ Content lưu dạng Markdown string, render bằng next-mdx-remote
    content: {
      type: String,
      default: "",
    },
    // ✅ Description ngắn dùng cho <meta name="description"> và preview card
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description không quá 300 ký tự"],
    },
    status: {
      type: String,
      enum: ["locked", "available", "active", "completed"],
      default: "available",
    },
    icon: { type: String, default: "📚" },
    estimatedTime: { type: String },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    tags: [{ type: String, trim: true }],
    prerequisites: [{ type: String }], // mảng node slugs
    resources: [ResourceSchema],
  },
  { _id: false }
);

/**
 * Node Schema - React Flow node (bao gồm vị trí & data)
 */
const NodeSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "roadmapNode", // Custom node type trong React Flow
    },
    position: {
      x: { type: Number, required: true, default: 0 },
      y: { type: Number, required: true, default: 0 },
    },
    data: {
      type: NodeDataSchema,
      required: true,
    },
    // React Flow style options
    style: { type: Schema.Types.Mixed },
    className: { type: String },
  },
  { _id: false }
);

/**
 * Edge Schema - đường kết nối giữa các nodes trong React Flow
 */
const EdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true }, // node id nguồn
    target: { type: String, required: true }, // node id đích
    type: {
      type: String,
      default: "smoothstep", // React Flow edge type
    },
    animated: { type: Boolean, default: false },
    label: { type: String },
    style: { type: Schema.Types.Mixed },
    markerEnd: { type: Schema.Types.Mixed }, // Arrow head config
  },
  { _id: false }
);

// ──────────────────────────────────────────────
// MAIN ROADMAP SCHEMA
// ──────────────────────────────────────────────

export interface IRoadmapDocument extends Document {
  title: string;
  slug: string;
  description: string;
  author: { name: string; avatar?: string };
  category?: string;
  tags?: string[];
  coverImage?: string;
  nodes: mongoose.Types.DocumentArray<mongoose.Document>;
  edges: mongoose.Types.DocumentArray<mongoose.Document>;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema = new Schema<IRoadmapDocument>(
  {
    // ──────── Core Info ────────
    title: {
      type: String,
      required: [true, "Tiêu đề roadmap là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không quá 200 ký tự"],
    },

    // ✅ SEO KEY: Slug chính tạo URL /roadmap/[slug]
    // Unique index đảm bảo không trùng lặp → tránh duplicate content
    slug: {
      type: String,
      required: [true, "Slug là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ"],
    },

    // ✅ SEO: Description cho trang roadmap (dùng cho meta description)
    description: {
      type: String,
      required: [true, "Mô tả roadmap là bắt buộc"],
      trim: true,
      maxlength: [500, "Mô tả không quá 500 ký tự"],
    },

    // ──────── Author ────────
    author: {
      name: { type: String, required: true },
      avatar: { type: String },
    },

    // ──────── Classification (dùng cho structured data) ────────
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    coverImage: { type: String }, // URL ảnh bìa (OpenGraph image)

    // ──────── Graph Data (React Flow) ────────
    nodes: [NodeSchema],
    edges: [EdgeSchema],

    // ──────── Publishing ────────
    isPublished: {
      type: Boolean,
      default: false,
      index: true, // Query: db.roadmaps.find({ isPublished: true })
    },

    // ──────── Analytics ────────
    viewCount: { type: Number, default: 0, min: 0 },
  },
  {
    // ✅ PERFORMANCE: timestamps tự động thêm createdAt, updatedAt
    // updatedAt quan trọng cho sitemap <lastmod> tag
    timestamps: true,

    // Tối ưu: chỉ lấy fields cần thiết khi query (override trong code)
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id.toString();
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

// ──────────────────────────────────────────────
// INDEXES - Tối ưu query performance
// ──────────────────────────────────────────────

// Compound index: query roadmaps published, sắp xếp theo mới nhất
RoadmapSchema.index({ isPublished: 1, createdAt: -1 });

// Text search index: cho tính năng search roadmaps
RoadmapSchema.index(
  { title: "text", description: "text", tags: "text" },
  { name: "roadmap_text_search", weights: { title: 10, description: 5, tags: 3 } }
);

// ──────────────────────────────────────────────
// VIRTUAL FIELDS
// ──────────────────────────────────────────────

// URL đầy đủ của roadmap (dùng cho sitemap, canonical URL)
RoadmapSchema.virtual("url").get(function () {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/roadmap/${this.slug}`;
});

// Số lượng nodes
RoadmapSchema.virtual("nodeCount").get(function () {
  return this.nodes.length;
});

// ──────────────────────────────────────────────
// MODEL EXPORT - Singleton pattern để tránh recompile trong Next.js
// ──────────────────────────────────────────────

// Index cho backlinks query
RoadmapSchema.index({ "nodes.data.contentSlug": 1 });

const Roadmap: Model<IRoadmapDocument> =
  models.Roadmap ?? mongoose.model<IRoadmapDocument>("Roadmap", RoadmapSchema);

export default Roadmap;