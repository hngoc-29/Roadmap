// ============================================================
// MODELS/NOTE.TS - Note model (ghi chú cá nhân)
// ============================================================

import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface INoteDocument extends Document {
  title: string;
  slug: string;
  content: string;
  color?: string;
  isPinned: boolean;
  tags?: string[];
  roadmapSlug?: string; // liên kết tới roadmap nếu có
  ownerId?: string;
  ownerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề ghi chú là bắt buộc"],
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
    content: { type: String, default: "" },
    color: {
      type: String,
      enum: ["yellow", "blue", "green", "pink", "purple", "default"],
      default: "default",
    },
    isPinned: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true }],
    roadmapSlug: { type: String, trim: true, lowercase: true },
    ownerId: { type: String, index: true },
    ownerEmail: { type: String, index: true },
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

NoteSchema.index({ isPinned: -1, updatedAt: -1 });
NoteSchema.index(
  { title: "text", content: "text", tags: "text" },
  { name: "note_text_search", weights: { title: 10, content: 3, tags: 5 } }
);

const Note: Model<INoteDocument> =
  models.Note ?? mongoose.model<INoteDocument>("Note", NoteSchema);

export default Note;
