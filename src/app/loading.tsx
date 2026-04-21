// APP/LOADING.TSX - Homepage skeleton loader
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <section className="border-b py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="skeleton h-14 w-3/4 mx-auto rounded-xl" />
          <div className="skeleton h-14 w-1/2 mx-auto rounded-xl" />
          <div className="skeleton h-6 w-2/3 mx-auto rounded" />
          <div className="flex gap-4 justify-center pt-2">
            <div className="skeleton h-11 w-40 rounded-lg" />
            <div className="skeleton h-11 w-40 rounded-lg" />
            <div className="skeleton h-11 w-36 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <div className="border-b py-4 px-4">
        <div className="max-w-6xl mx-auto flex justify-center gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-5 w-28 rounded" />
          ))}
        </div>
      </div>

      {/* Roadmap grid skeleton */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-8 w-48 rounded mb-2" />
          <div className="skeleton h-5 w-72 rounded mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-xl p-6 bg-card space-y-3">
                <div className="flex justify-between">
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div className="skeleton h-6 w-full rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="pt-3 border-t border-border flex justify-between">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog preview skeleton */}
      <section className="py-16 px-4 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-8 w-44 rounded mb-2" />
          <div className="skeleton h-5 w-64 rounded mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="skeleton h-36 w-full" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="pt-2 border-t border-border flex justify-between">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
