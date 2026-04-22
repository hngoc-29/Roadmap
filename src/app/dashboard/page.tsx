// ============================================================
// APP/DASHBOARD/PAGE.TSX - Trang quản lý dữ liệu người dùng
// ============================================================

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getMyRoadmaps } from "@/actions/roadmap";
import { getMyPosts } from "@/actions/post";
import { getMyNotes } from "@/actions/note";
import { getMyContent } from "@/actions/content";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Quản lý dữ liệu",
  description: "Quản lý tất cả roadmaps, bài viết, ghi chú và nội dung của bạn.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const [roadmaps, posts, notes, contents] = await Promise.all([
    getMyRoadmaps().catch(() => []),
    getMyPosts().catch(() => []),
    getMyNotes().catch(() => []),
    getMyContent().catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  className="w-12 h-12 rounded-full border-2 border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Xin chào, <span className="font-medium text-foreground">{session.user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/builder/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                ➕ Tạo Roadmap
              </Link>
              <Link href="/blog/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                ✍️ Viết bài
              </Link>
              <Link href="/content/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                📄 Thêm nội dung
              </Link>
              <Link href="/notes/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                📝 Ghi chú mới
              </Link>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { icon: "🗺️", label: "Roadmaps", count: roadmaps.length, href: "#roadmaps" },
              { icon: "✍️", label: "Bài viết", count: posts.length, href: "#posts" },
              { icon: "📝", label: "Ghi chú", count: notes.length, href: "#notes" },
              { icon: "📚", label: "Nội dung", count: contents.length, href: "#contents" },
            ].map(({ icon, label, count, href }) => (
              <a key={label} href={href}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold group-hover:text-primary transition-colors">{count}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard content tabs */}
      <DashboardClient
        roadmaps={roadmaps}
        posts={posts}
        notes={notes}
        contents={contents}
        userEmail={session.user.email ?? ""}
      />
    </div>
  );
}
