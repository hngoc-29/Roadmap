// ============================================================
// APP/API/REVALIDATE/ROUTE.TS - On-Demand ISR Revalidation
// ============================================================
// ✅ Gọi API này khi publish roadmap mới để rebuild pages ngay lập tức
// ✅ Bảo vệ bằng secret key
// 
// Usage: POST /api/revalidate
// Body: { "secret": "...", "slug": "ten-roadmap" }

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, slug, nodeSlug } = body;

    // ✅ Xác thực secret key
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: "Invalid revalidation secret" },
        { status: 401 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "slug is required" },
        { status: 400 }
      );
    }

    // Revalidate trang roadmap
    revalidatePath(`/roadmap/${slug}`);

    // Nếu có nodeSlug, revalidate trang bài học đó
    if (nodeSlug) {
      revalidatePath(`/roadmap/${slug}/${nodeSlug}`);
    }

    // Revalidate trang chủ (danh sách roadmaps)
    revalidatePath("/");
    revalidateTag("roadmaps");

    return NextResponse.json({
      revalidated: true,
      slug,
      nodeSlug: nodeSlug ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}

// Chỉ cho phép POST
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
