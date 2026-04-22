// ============================================================
// ACTIONS/NOTE.TS - Server Actions cho Notes
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import { serializeDoc, createSlug } from "@/lib/utils";
import { customAlphabet } from "nanoid";

const nanoidSafe = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này");
  return session;
}

// Helper: kiểm tra quyền edit/delete note (chỉ owner)
async function canEditNote(noteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const note = await Note.findById(noteId, { ownerId: 1, ownerEmail: 1 }).lean() as {
    ownerId?: string; ownerEmail?: string;
  } | null;

  if (!note) return false;
  // Note cũ chưa có owner → cho phép edit (backward compat)
  if (!note.ownerId && !note.ownerEmail) return true;

  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email ?? "";
  if (note.ownerId && note.ownerId === userId) return true;
  if (note.ownerEmail && note.ownerEmail === userEmail) return true;
  return false;
}

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
  ownerId?: string;
  ownerEmail?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ──────────────────────────────────────────────
// GET: Ghi chú của user hiện tại (pinned trước)
// ⚠️  Ghi chú luôn là riêng tư – chỉ trả về của session user
// ──────────────────────────────────────────────
export async function getAllNotes(): Promise<INote[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  await connectDB();
  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email ?? "";

  // Chỉ lấy ghi chú thuộc về user hiện tại
  const notes = await Note.find(
    {
      $or: [
        { ownerId: userId },
        { ownerEmail: userEmail },
        // backward compat: ghi chú cũ chưa có owner field
        { ownerId: { $exists: false }, ownerEmail: { $exists: false } },
      ],
    },
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
// GET: Tìm kiếm ghi chú (chỉ trong ghi chú của user)
// ──────────────────────────────────────────────
export async function searchNotes(query: string): Promise<INote[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  await connectDB();
  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email ?? "";
  const ownerFilter = {
    $or: [
      { ownerId: userId },
      { ownerEmail: userEmail },
      { ownerId: { $exists: false }, ownerEmail: { $exists: false } },
    ],
  };

  const trimmed = query.trim();
  if (!trimmed) return getAllNotes();

  const results = await Note.find(
    { ...ownerFilter, $text: { $search: trimmed } },
    { score: { $meta: "textScore" }, title: 1, slug: 1, content: 1, color: 1, isPinned: 1, tags: 1 }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .lean();

  if (results.length === 0) {
    const regex = new RegExp(trimmed, "i");
    const fallback = await Note.find(
      { ...ownerFilter, $or: [{ title: regex }, { content: regex }, { tags: regex }] },
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
  const session = await requireAuth();

  const userId = (session.user as { id?: string } | undefined)?.id;
  const userEmail = session.user?.email ?? "";

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
    ownerId: userId,
    ownerEmail: userEmail,
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

  const hasPermission = await canEditNote(id);
  if (!hasPermission) throw new Error("Bạn không có quyền chỉnh sửa ghi chú này");

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

  const hasPermission = await canEditNote(id);
  if (!hasPermission) throw new Error("Bạn không có quyền thực hiện thao tác này");

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

  const hasPermission = await canEditNote(id);
  if (!hasPermission) throw new Error("Bạn không có quyền xóa ghi chú này");

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

// ──────────────────────────────────────────────
// GET: Kiểm tra quyền edit (dùng ở client)
// ──────────────────────────────────────────────
export async function checkNoteEditPermission(noteId: string) {
  await connectDB();
  const can = await canEditNote(noteId);
  return { canEdit: can };
}

// ──────────────────────────────────────────────
// GET: Lấy ghi chú của user hiện tại (dashboard)
// ──────────────────────────────────────────────
export async function getMyNotes(): Promise<INote[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  await connectDB();
  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email ?? "";

  const notes = await Note.find(
    { $or: [{ ownerId: userId }, { ownerEmail: userEmail }] },
    { title: 1, slug: 1, content: 1, color: 1, isPinned: 1, tags: 1, roadmapSlug: 1, createdAt: 1, updatedAt: 1 }
  )
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();
  return serializeDoc(notes) as unknown as INote[];
}
