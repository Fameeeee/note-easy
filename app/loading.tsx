export default function RootLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-[30%_70%] gap-4 animate-pulse">
      {/* Left list skeleton */}
      <section className="space-y-3">
        <div className="h-16 rounded border border-slate-800 bg-slate-900" />
        <div className="rounded border border-slate-800 divide-y divide-slate-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3">
              <div className="h-3 w-2/3 bg-slate-800 rounded" />
              <div className="mt-2 h-2 w-1/3 bg-slate-800 rounded" />
              <div className="mt-2 h-5 w-1/4 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs opacity-60">
          <div className="h-3 w-24 bg-slate-800 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-12 bg-slate-800 rounded" />
            <div className="h-8 w-12 bg-slate-800 rounded" />
          </div>
        </div>
      </section>

      {/* Right editor skeleton */}
      <section>
        <div className="space-y-2">
          <div className="h-10 bg-slate-800 rounded" />
          <div className="h-64 bg-slate-900 rounded border border-slate-800" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-slate-800 rounded" />
            <div className="h-10 w-24 bg-slate-800 rounded" />
          </div>
        </div>
      </section>
    </div>
  );
}
