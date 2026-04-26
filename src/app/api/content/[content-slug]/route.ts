// ============================================================
// API/CONTENT/[content-slug]/ROUTE.TS
// ============================================================
// GET endpoint để client-side fetch nội dung của một Content theo slug.
// Được dùng bởi RoadmapBuilder khi export ZIP: nếu node có contentSlug,
// export sẽ lấy nội dung từ đây thay vì dùng d.content nội tuyến.

import { NextRequest, NextResponse } from "next/server";
import { getContentBySlug } from "@/actions/content";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ "content-slug": string }> }
) {
  const slug = (await params)["content-slug"];

  if (!slug) {
    return NextResponse.json({ success: false, error: "Thiếu slug" }, { status: 400 });
  }

  try {
    const content = await getContentBySlug(slug);

    if (!content) {
      return NextResponse.json({ success: false, error: "Không tìm thấy content" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: content });
  } catch (err) {
    console.error("[API /api/content/:slug] Lỗi:", err);
    return NextResponse.json({ success: false, error: "Lỗi server" }, { status: 500 });
  }
}
