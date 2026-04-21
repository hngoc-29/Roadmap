// ============================================================
// APP/API/REVALIDATE/ROUTE.TS - On-Demand ISR Revalidation
// ============================================================
// POST /api/revalidate
// Body: { "secret": "...", "type": "roadmap"|"blog"|"content", "slug": "...", "nodeSlug"?: "..." }
//
// Dùng khi publish nội dung mới để rebuild pages ngay lập tức

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type RevalidateType = "roadmap" | "blog" | "content";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, slug, nodeSlug, type = "roadmap" } = body as {
      secret: string;
      slug: string;
      nodeSlug?: string;
      type?: RevalidateType;
    };

    // ✅ Xác thực secret key
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: "Invalid revalidation secret" },
        { status: 401 }
      );
    }

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const revalidated: string[] = [];

    if (type === "roadmap") {
      revalidatePath(`/roadmap/${slug}`);
      revalidated.push(`/roadmap/${slug}`);

      if (nodeSlug) {
        revalidatePath(`/roadmap/${slug}/${nodeSlug}`);
        revalidated.push(`/roadmap/${slug}/${nodeSlug}`);
      }

      revalidatePath("/");
  // revalidateTag("roadmaps"); // ✅ Removed: not needed with force-dynamic
      revalidated.push("/", "tag:roadmaps");
    } else if (type === "blog") {
      revalidatePath(`/blog/${slug}`);
      revalidatePath("/blog");
      revalidatePath("/");
  // revalidateTag("posts"); // ✅ Removed: not needed with force-dynamic
      revalidated.push(`/blog/${slug}`, "/blog", "/", "tag:posts");
    } else if (type === "content") {
      revalidatePath(`/content/${slug}`);
      revalidatePath("/content");
  // revalidateTag("contents"); // ✅ Removed: not needed with force-dynamic
      revalidated.push(`/content/${slug}`, "/content", "tag:contents");
    }

    return NextResponse.json({
      revalidated: true,
      type,
      slug,
      nodeSlug: nodeSlug ?? null,
      paths: revalidated,
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

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
