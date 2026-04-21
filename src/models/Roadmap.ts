// ============================================================
// MODELS/ROADMAP.TS - Mongoose Schema & Model
// ============================================================

import mongoose, { Schema, Document, Model, models } from "mongoose";

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
  { _id: false }
);

const NodeDataSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, "Label của node là bắt buộc"],
      trim: true,
      maxlength: [100, "Label không quá 100 ký tự"],
    },
    contentSlug: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    slug: {
      type: String,
      required: [true, "Slug của node là bắt buộc"],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ"],
    },
    content: { type: String, default: "" },
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
    prerequisites: [{ type: String }],
    resources: [ResourceSchema],
  },
  { _id: false }
);

const NodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, default: "roadmapNode" },
    position: {
      x: { type: Number, required: true, default: 0 },
      y: { type: Number, required: true, default: 0 },
    },
    data: { type: NodeDataSchema, required: true },
    style: { type: Schema.Types.Mixed },
    className: { type: String },
  },
  { _id: false }
);

const EdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, default: "smoothstep" },
    animated: { type: Boolean, default: false },
    label: { type: String },
    style: { type: Schema.Types.Mixed },
    markerEnd: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

export interface IRoadmapDocument extends Document {
  title: string;
  slug: string;
  description: string;
  author: { name: string; avatar?: string };
  // Auth fields
  ownerId?: string;          // GitHub user ID của người tạo
  ownerEmail?: string;       // Email của owner
  collaborators: string[];   // Mảng email được phép edit
  allowPublicEdit: boolean;  // Cho phép bất kỳ ai edit
  // Other fields
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
    title: {
      type: String,
      required: [true, "Tiêu đề roadmap là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không quá 200 ký tự"],
    },
    slug: {
      type: String,
      required: [true, "Slug là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ"],
    },
    description: {
      type: String,
      required: [true, "Mô tả roadmap là bắt buộc"],
      trim: true,
      maxlength: [500, "Mô tả không quá 500 ký tự"],
    },
    author: {
      name: { type: String, required: true },
      avatar: { type: String },
    },
    // ── Auth / Collaboration ──
    ownerId: { type: String, index: true },
    ownerEmail: { type: String },
    collaborators: [{ type: String, trim: true, lowercase: true }],
    allowPublicEdit: { type: Boolean, default: false },
    // ── Classification ──
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    coverImage: { type: String },
    // ── Graph Data ──
    nodes: [NodeSchema],
    edges: [EdgeSchema],
    // ── Publishing ──
    isPublished: { type: Boolean, default: false, index: true },
    // ── Analytics ──
    viewCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
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

RoadmapSchema.index({ isPublished: 1, createdAt: -1 });
RoadmapSchema.index({ ownerId: 1, createdAt: -1 });
RoadmapSchema.index(
  { title: "text", description: "text", tags: "text" },
  { name: "roadmap_text_search", weights: { title: 10, description: 5, tags: 3 } }
);
RoadmapSchema.index({ "nodes.data.contentSlug": 1 });

RoadmapSchema.virtual("url").get(function () {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/roadmap/${this.slug}`;
});

RoadmapSchema.virtual("nodeCount").get(function () {
  return this.nodes.length;
});

const Roadmap: Model<IRoadmapDocument> =
  models.Roadmap ?? mongoose.model<IRoadmapDocument>("Roadmap", RoadmapSchema);

export default Roadmap;
