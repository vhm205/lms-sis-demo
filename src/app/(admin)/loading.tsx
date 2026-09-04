export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-muted/80" />
          <div className="h-4 w-32 rounded-full bg-muted/70" />
        </div>
        <div className="h-8 w-64 sm:w-80 rounded-2xl bg-muted/90" />
        <div className="h-4 w-72 sm:w-96 rounded-full bg-muted/60" />
      </div>

      {/* KPI Cards Skeleton Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border-2 border-border/60 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded-full bg-muted/70" />
              <div className="h-8 w-8 rounded-2xl bg-muted/80" />
            </div>
            <div className="h-7 w-20 rounded-xl bg-muted/90" />
            <div className="h-3 w-28 rounded-full bg-muted/50" />
          </div>
        ))}
      </div>

      {/* Main Content / Table / List Card Skeleton */}
      <div className="rounded-3xl border-2 border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-5">
        {/* Table Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="h-10 w-full sm:w-72 rounded-2xl bg-muted/70" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="h-10 w-28 rounded-2xl bg-muted/60" />
            <div className="h-10 w-28 rounded-2xl bg-muted/60" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-14 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted/70 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 sm:w-48 rounded-full bg-muted/70" />
                  <div className="h-2.5 w-24 sm:w-32 rounded-full bg-muted/50" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="h-3.5 w-20 rounded-full bg-muted/60" />
                <div className="h-6 w-16 rounded-full bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
