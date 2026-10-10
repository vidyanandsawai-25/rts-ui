export default function Loading() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full max-h-[calc(100vh-125px)] overflow-hidden p-2 gap-2 animate-pulse">
      {/* Top Navigation Tab Bar Skeleton */}
      <div className="flex items-center justify-between border-b border-blue-200/80 pb-2 shrink-0 bg-white px-2 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="h-8 w-44 bg-blue-100/70 rounded-lg"></div>
          <div className="h-8 w-44 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-6 w-32 bg-slate-100 rounded-md hidden sm:block"></div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden">
        {/* Left Sidebar Skeleton (List of Attributes) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-full bg-white rounded-xl border border-blue-100 p-2.5 gap-2.5 overflow-hidden">
          {/* Search bar placeholder */}
          <div className="h-8 w-full bg-slate-100 rounded-lg"></div>

          {/* Filter chips / counter */}
          <div className="flex items-center justify-between px-1">
            <div className="h-4 w-24 bg-slate-100 rounded"></div>
            <div className="h-4 w-12 bg-slate-100 rounded"></div>
          </div>

          {/* Attribute Cards List */}
          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2"
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="h-4 bg-slate-200/80 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="h-5 w-9 bg-slate-200 rounded-full shrink-0"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Pane Skeleton */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full bg-white rounded-xl border border-blue-100 p-4 gap-4 overflow-hidden">
          {/* Header Title & Status */}
          <div className="flex items-center justify-between pb-3 border-b border-blue-50">
            <div className="space-y-1.5">
              <div className="h-3 w-28 bg-blue-100 rounded"></div>
              <div className="h-6 w-64 bg-slate-200 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
          </div>

          {/* Form Fields Placeholders */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Input field */}
            <div className="space-y-1.5 max-w-md">
              <div className="h-3.5 w-32 bg-slate-200/80 rounded"></div>
              <div className="h-9 w-full bg-slate-100 rounded-lg border border-slate-200/60"></div>
            </div>

            {/* Document / Photo Upload Area */}
            <div className="space-y-1.5 max-w-lg">
              <div className="h-3.5 w-40 bg-slate-200/80 rounded"></div>
              <div className="h-28 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                  <div className="h-3 w-36 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Remark Area */}
            <div className="space-y-1.5 max-w-lg">
              <div className="h-3.5 w-24 bg-slate-200/80 rounded"></div>
              <div className="h-16 w-full bg-slate-100 rounded-lg border border-slate-200/60"></div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="pt-3 border-t border-blue-100 flex items-center justify-between shrink-0">
            <div className="h-3 w-48 bg-slate-100 rounded"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
              <div className="h-8 w-28 bg-blue-200/80 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}