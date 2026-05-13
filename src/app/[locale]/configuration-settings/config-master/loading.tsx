export default function Loading() {
  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/20 animate-pulse">
      {/* Skeleton Header */}
      <div className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60 px-4 sm:px-8 py-4 sm:py-5">
        <div className="max-w-500 mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded-md" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-6 space-y-8">
        <div className="max-w-500 mx-auto space-y-8">
          {/* Skeleton Cards */}
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[200px] h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
            ))}
          </div>

          {/* Skeleton Search */}
          <div className="h-12 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />

          {/* Skeleton List */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
