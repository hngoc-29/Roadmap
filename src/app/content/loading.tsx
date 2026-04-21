// APP/CONTENT/LOADING.TSX
export default function ContentLoading() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-10 w-48 rounded mb-3" />
          <div className="skeleton h-5 w-80 rounded" />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border rounded-xl p-5 bg-card space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-8 w-8 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
              <div className="skeleton h-5 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="pt-3 border-t border-border flex justify-between">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
