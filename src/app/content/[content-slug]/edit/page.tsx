// ============================================================
// APP/CONTENT/[CONTENT-SLUG]/EDIT/PAGE.TSX
// ============================================================
// Trang chỉnh sửa content

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { getContentBySlug } from "@/actions/content";
import EditContentForm from "@/components/EditContentForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "content-slug": string }>;
}): Promise<Metadata> {
  const { "content-slug": slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content) return { title: "Không tìm thấy nội dung" };
  return { title: `Chỉnh sửa: ${content.title}`, robots: { index: false } };
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ "content-slug": string }>;
}) {
  const { "content-slug": slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const content = await getContentBySlug(slug);
  if (!content) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/content/${slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay lại nội dung
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Chỉnh sửa</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">✏️ Chỉnh sửa nội dung</h1>
          <p className="text-muted-foreground text-sm">
            Cập nhật tiêu đề, nội dung và metadata
          </p>
        </div>

        <EditContentForm content={content} />
      </div>
    </div>
  );
}
