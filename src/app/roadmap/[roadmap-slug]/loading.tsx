// ============================================================
// APP/ROADMAP/[ROADMAP-SLUG]/LOADING.TSX
// ============================================================
// ✅ Next.js Suspense-based loading skeleton
// ✅ Ngăn chặn layout shift (CLS) bằng placeholder cùng kích thước

export default function RoadmapLoading() {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 64px)" }}>
      {/* Toolbar skeleton */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>

      {/* Title skeleton */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="skeleton h-9 w-48 rounded-xl" />
      </div>

      {/* Canvas skeleton với các node giả */}
      <div className="w-full h-full bg-muted/20 flex items-center justify-center">
        <div className="relative w-full max-w-3xl h-64">
          {/* Fake nodes */}
          {[
            { top: "10%", left: "35%", w: "w-40" },
            { top: "45%", left: "15%", w: "w-36" },
            { top: "45%", left: "55%", w: "w-44" },
            { top: "75%", left: "35%", w: "w-32" },
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute skeleton ${pos.w} h-16 rounded-xl`}
              style={{ top: pos.top, left: pos.left }}
            />
          ))}
        </div>
        <p className="absolute bottom-8 text-sm text-muted-foreground animate-pulse">
          Đang tải roadmap...
        </p>
      </div>
    </div>
  );
}
