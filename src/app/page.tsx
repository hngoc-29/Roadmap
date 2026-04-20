// ============================================================
// APP/PAGE.TSX - Trang chủ (Server Component)
// ============================================================
// ✅ ISR: Revalidate mỗi 60s (cân bằng freshness vs performance)

import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedRoadmaps } from "@/actions/roadmap";
import { formatViewCount } from "@/lib/utils";
import { RoadmapNodeData } from "@/types";

// ISR config - revalidate trang chủ mỗi 60 giây
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Khám phá Roadmap học tập",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  // ✅ Server-side data fetching (không cần useState/useEffect)
  const roadmaps = await getPublishedRoadmaps();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Section ── */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Xây dựng lộ trình học tập{" "}
            <span className="text-primary">trực quan</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tạo, chia sẻ và khám phá các roadmap học lập trình với công cụ
            kéo thả mạnh mẽ. Từng bước rõ ràng, từng bài học chi tiết.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/builder/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              🚀 Tạo Roadmap mới
            </Link>
            <Link
              href="#explore"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              🔍 Khám phá Roadmaps
            </Link>
            <Link
              href="/content"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              📚 Thư viện nội dung
            </Link>
          </div>
        </div>
      </section>

      {/* ── Roadmap Grid ── */}
      <section id="explore" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Roadmaps nổi bật</h2>
          <p className="text-muted-foreground mb-10">
            Chọn lộ trình phù hợp với mục tiêu của bạn
          </p>

          {roadmaps.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-6xl mb-4">🗺️</p>
              <p className="text-xl">Chưa có roadmap nào được xuất bản.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap: any) => (
                <Link
                  key={roadmap._id}
                  href={`/roadmap/${roadmap.slug}`}
                  className="group block border border-border rounded-xl p-6 hover:shadow-md 
                             hover:border-primary/50 transition-all duration-200 bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    {roadmap.category && (
                      <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                        {roadmap.category}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      👁 {formatViewCount(roadmap.viewCount ?? 0)} lượt xem
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {roadmap.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {roadmap.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                    <span>✍️ {roadmap.author.name}</span>
                    <span>{roadmap.nodes?.length ?? 0} bài học</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
