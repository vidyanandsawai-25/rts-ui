export default function Loading() {
  return (
    <div className="mt-0 p-4 space-y-3">
      {/* Container mimic */}
      <div className="bg-white rounded-xl shadow-md border-2 border-purple-100 p-4">
        {/* Title skeleton */}
        <div className="h-6 w-48 bg-purple-100/50 animate-pulse rounded mb-3 border-b-2 border-purple-200 pb-2" />
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {/* Row 1: Land Owner | Builder Name | Building/Society Name */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`r1-${i}`} className="space-y-1.5">
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-purple-50" />
            </div>
          ))}

          {/* Row 2: Society Email & Address (span 3, grid 2) */}
          <div className="col-span-3 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-purple-50" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-purple-50" />
            </div>
          </div>

          {/* Row 3: Manager Name | Manager Email | Manager Mobile No */}
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-purple-50" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-purple-50" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
            {/* Mobile number multi-input skeleton */}
            <div className="h-10 w-full bg-white animate-pulse rounded border border-purple-100 p-1 flex gap-1 items-center">
              <div className="w-10 h-7 bg-gray-50 border border-purple-50 rounded" />
              <div className="flex-1 flex gap-1">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="h-7 flex-1 bg-white border border-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Secretary Name | Secretary Email | Secretary Mobile */}
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-purple-50" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-purple-50" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
            {/* Mobile number multi-input skeleton */}
            <div className="h-10 w-full bg-white animate-pulse rounded border border-purple-100 p-1 flex gap-1 items-center">
              <div className="w-10 h-7 bg-gray-50 border border-purple-50 rounded" />
              <div className="flex-1 flex gap-1">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="h-7 flex-1 bg-white border border-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Button footer skeleton */}
        <div className="flex justify-end mt-4">
          <div className="h-10 w-32 bg-purple-100 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
