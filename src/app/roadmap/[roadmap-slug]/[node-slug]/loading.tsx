// ============================================================
// APP/ROADMAP/[ROADMAP-SLUG]/[NODE-SLUG]/LOADING.TSX
// ============================================================
export default function NodeLessonLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb skeleton */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Icon skeleton */}
        <div className="skeleton h-14 w-14 rounded-xl mb-4" />

        {/* Title skeleton */}
        <div className="skeleton h-10 w-3/4 rounded-lg mb-3" />
        <div className="skeleton h-6 w-full rounded mb-2" />
        <div className="skeleton h-6 w-5/6 rounded mb-6" />

        {/* Meta badges */}
        <div className="flex gap-3 mb-8">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          {[100, 90, 85, 95, 70, 80, 88, 60].map((w, i) => (
            <div
              key={i}
              className={`skeleton h-4 rounded`}
              style={{ width: `${w}%` }}
            />
          ))}
          <div className="skeleton h-32 w-full rounded-lg mt-6" />
          {[92, 78, 85].map((w, i) => (
            <div key={i} className={`skeleton h-4 rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
