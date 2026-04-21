// APP/BLOG/[BLOG-SLUG]/LOADING.TSX
export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb skeleton */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="skeleton h-4 w-16 rounded" />
          <span className="text-muted-foreground">/</span>
          <div className="skeleton h-4 w-10 rounded" />
          <span className="text-muted-foreground">/</span>
          <div className="skeleton h-4 w-32 rounded" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">
        <div className="flex-1 min-w-0 space-y-6">
          {/* Category */}
          <div className="skeleton h-5 w-20 rounded-full" />
          {/* Title */}
          <div className="space-y-2">
            <div className="skeleton h-9 w-full rounded" />
            <div className="skeleton h-9 w-3/4 rounded" />
          </div>
          {/* Description */}
          <div className="skeleton h-5 w-full rounded" />
          {/* Meta */}
          <div className="flex gap-4 pb-5 border-b border-border">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
          {/* Content blocks */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              {i % 2 === 0 && <div className="skeleton h-6 w-2/5 rounded mt-6" />}
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
            </div>
          ))}
        </div>
        {/* Sidebar skeleton */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <div className="skeleton h-4 w-32 rounded mb-4" />
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-lg mb-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
