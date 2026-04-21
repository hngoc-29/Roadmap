// ============================================================
// ACTIONS/NOTE.TS - Server Actions cho Notes
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import { serializeDoc, createSlug } from "@/lib/utils";
import { customAlphabet } from "nanoid";

const nanoidSafe = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

export interface INote {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  color?: "yellow" | "blue" | "green" | "pink" | "purple" | "default";
  isPinned: boolean;
  tags?: string[];
  roadmapSlug?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ──────────────────────────────────────────────
// GET: Tất cả ghi chú (pinned trước)
// ──────────────────────────────────────────────
export async function getAllNotes(): Promise<INote[]> {
  await connectDB();
  const notes = await Note.find(
    {},
    { title: 1, slug: 1, content: 1, color: 1, isPinned: 1, tags: 1, roadmapSlug: 1, createdAt: 1, updatedAt: 1 }
  )
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();
  return serializeDoc(notes) as unknown as INote[];
}

// ──────────────────────────────────────────────
// GET: 1 ghi chú theo slug
// ──────────────────────────────────────────────
export async function getNoteBySlug(slug: string): Promise<INote | null> {
  await connectDB();
  const note = await Note.findOne({ slug }).lean();
  if (!note) return null;
  return serializeDoc(note) as unknown as INote;
}

// ──────────────────────────────────────────────
// GET: Tìm kiếm ghi chú
// ──────────────────────────────────────────────
export async function searchNotes(query: string): Promise<INote[]> {
  await connectDB();
  const trimmed = query.trim();
  if (!trimmed) return getAllNotes();

  const results = await Note.find(
    { $text: { $search: trimmed } },
    { score: { $meta: "textScore" }, title: 1, slug: 1, content: 1, color: 1, isPinned: 1, tags: 1 }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .lean();

  if (results.length === 0) {
    const regex = new RegExp(trimmed, "i");
    const fallback = await Note.find(
      { $or: [{ title: regex }, { content: regex }, { tags: regex }] },
      { title: 1, slug: 1, content: 1, color: 1, isPinned: 1, tags: 1 }
    )
      .limit(15)
      .lean();
    return serializeDoc(fallback) as unknown as INote[];
  }

  return serializeDoc(results) as unknown as INote[];
}

// ──────────────────────────────────────────────
// CREATE: Tạo ghi chú mới
// ──────────────────────────────────────────────
export async function createNote(data: {
  title: string;
  content?: string;
  color?: INote["color"];
  isPinned?: boolean;
  tags?: string[];
  roadmapSlug?: string;
}): Promise<INote> {
  await connectDB();

  const baseSlug = createSlug(data.title) || nanoidSafe();
  const existing = await Note.findOne({ slug: baseSlug });
  const slug = existing ? `${baseSlug}-${nanoidSafe()}` : baseSlug;

  const doc = await Note.create({
    title: data.title,
    slug,
    content: data.content ?? `# ${data.title}\n\nThêm nội dung ghi chú ở đây...`,
    color: data.color ?? "default",
    isPinned: data.isPinned ?? false,
    tags: data.tags ?? [],
    roadmapSlug: data.roadmapSlug,
  });

  revalidatePath("/notes");
  return serializeDoc(doc.toJSON()) as unknown as INote;
}

// ──────────────────────────────────────────────
// UPDATE: Cập nhật ghi chú
// ──────────────────────────────────────────────
export async function updateNote(
  id: string,
  data: Partial<Omit<INote, "_id" | "id" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean }> {
  await connectDB();

  const doc = await Note.findByIdAndUpdate(
    id,
    { $set: { ...data, updatedAt: new Date() } },
    { new: true, runValidators: true }
  ).lean();

  if (!doc) throw new Error("Không tìm thấy ghi chú");

  const updated = doc as unknown as { slug: string };
  revalidatePath(`/notes/${updated.slug}`);
  revalidatePath("/notes");
  return { success: true };
}

// ──────────────────────────────────────────────
// UPDATE: Toggle pin
// ──────────────────────────────────────────────
export async function togglePinNote(id: string, pin: boolean): Promise<{ success: boolean }> {
  await connectDB();

  const doc = await Note.findByIdAndUpdate(
    id,
    { $set: { isPinned: pin, updatedAt: new Date() } },
    { new: true, select: "slug isPinned" }
  ).lean();

  if (!doc) throw new Error("Không tìm thấy ghi chú");

  revalidatePath("/notes");
  return { success: true };
}

// ──────────────────────────────────────────────
// DELETE: Xóa ghi chú
// ──────────────────────────────────────────────
export async function deleteNote(id: string): Promise<{ success: boolean }> {
  await connectDB();
  const doc = await Note.findByIdAndDelete(id).lean() as { slug: string } | null;
  if (!doc) throw new Error("Không tìm thấy ghi chú");

  revalidatePath(`/notes/${doc.slug}`);
  revalidatePath("/notes");
  return { success: true };
}

// ──────────────────────────────────────────────
// GET: Tất cả slugs (sitemap)
// ──────────────────────────────────────────────
export async function getAllNoteSlugs(): Promise<Array<{ slug: string; updatedAt: string }>> {
  await connectDB();
  const notes = await Note.find({}, { slug: 1, updatedAt: 1 }).lean();
  return serializeDoc(notes) as unknown as Array<{ slug: string; updatedAt: string }>;
}
