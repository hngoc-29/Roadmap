// APP/BLOG/LOADING.TSX
export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-10 w-24 rounded mb-3" />
          <div className="skeleton h-6 w-96 rounded" />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="skeleton h-40 w-full" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-3 w-16 rounded-full" />
                <div className="skeleton h-5 w-full rounded" />
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="pt-3 border-t border-border flex justify-between">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
