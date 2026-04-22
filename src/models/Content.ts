// ============================================================
// MODELS/CONTENT.TS - Content độc lập, có thể dùng chung
// ============================================================
// Content được tách ra khỏi Roadmap node để:
// 1. Nhiều roadmap / node có thể link tới cùng 1 content
// 2. URL sạch: /content/[slug] thay vì /roadmap/x/y
// 3. Quản lý content tập trung, tránh duplicate

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

export interface IContentDocument extends Document {
  title: string;
  slug: string;
  content: string;
  description?: string;
  tags?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedTime?: string;
  icon?: string;
  ownerId?: string;
  ownerEmail?: string;
  resources?: Array<{ title: string; url: string; type: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContentDocument>(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không quá 200 ký tự"],
    },
    // ✅ Slug toàn cục, unique – tạo URL /content/[slug]
    slug: {
      type: String,
      required: [true, "Slug là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ"],
    },
    content: { type: String, default: "" },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Mô tả không quá 300 ký tự"],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    estimatedTime: { type: String },
    icon: { type: String, default: "📄" },
    ownerId: { type: String, index: true },
    ownerEmail: { type: String, index: true },
    resources: [ResourceSchema],
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

// Full-text search index
ContentSchema.index(
  { title: "text", description: "text", tags: "text" },
  {
    name: "content_text_search",
    weights: { title: 10, description: 5, tags: 3 },
  }
);

const Content: Model<IContentDocument> =
  models.Content ?? mongoose.model<IContentDocument>("Content", ContentSchema);

export default Content;