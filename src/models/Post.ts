// ============================================================
// MODELS/POST.TS - Blog Post model
// ============================================================
// Bài viết blog độc lập có thể được:
// 1. Truy cập qua URL /blog/[slug] → SEO tốt
// 2. Liên kết từ nhiều Roadmap (relatedRoadmaps)
// 3. Tái sử dụng nội dung giữa các roadmap

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

export interface IPostDocument extends Document {
  title: string;
  slug: string;
  content: string;
  description?: string;
  coverImage?: string;
  author: { name: string; avatar?: string };
  ownerId?: string;
  ownerEmail?: string;
  category?: string;
  tags?: string[];
  relatedRoadmaps?: string[]; // mảng slugs của roadmap liên quan
  resources?: Array<{ title: string; url: string; type: string }>;
  isPublished: boolean;
  publishedAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPostDocument>(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề bài viết là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không quá 200 ký tự"],
    },
    // ✅ SEO: /blog/[slug]
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
      maxlength: [500, "Mô tả không quá 500 ký tự"],
    },
    // URL ảnh bìa (OpenGraph image)
    coverImage: { type: String },
    author: {
      name: { type: String, required: true, default: "Roadmap Builder" },
      avatar: { type: String },
    },
    ownerId: { type: String, index: true },
    ownerEmail: { type: String, index: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    // Slugs của các roadmap có liên quan → hiển thị ở sidebar
    relatedRoadmaps: [{ type: String, trim: true, lowercase: true }],
    resources: [ResourceSchema],
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
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

// Full-text search index
PostSchema.index(
  { title: "text", description: "text", tags: "text", content: "text" },
  {
    name: "post_text_search",
    weights: { title: 10, description: 5, tags: 3, content: 1 },
  }
);

// Compound index
PostSchema.index({ isPublished: 1, publishedAt: -1 });

// Virtual: URL
PostSchema.virtual("url").get(function () {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/blog/${this.slug}`;
});

const Post: Model<IPostDocument> =
  models.Post ?? mongoose.model<IPostDocument>("Post", PostSchema);

export default Post;
