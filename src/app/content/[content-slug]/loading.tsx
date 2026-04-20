export default function ContentLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="border-b bg-muted/30 h-12" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="h-12 w-12 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded-lg w-2/3" />
        <div className="h-5 bg-muted rounded w-full" />
        <div className="h-5 bg-muted rounded w-4/5" />
        <div className="space-y-3 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${85 - i * 5}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
