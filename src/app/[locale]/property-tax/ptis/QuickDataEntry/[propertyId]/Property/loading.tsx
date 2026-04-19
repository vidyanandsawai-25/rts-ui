export default function Loading() {
  return (
    <div className="mt-0 p-4 space-y-3">
      {/* Container mimic */}
      <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-4">
        {/* Title skeleton */}
        <div className="h-6 w-48 bg-blue-100/50 animate-pulse rounded mb-3 border-b-2 border-blue-200 pb-2" />
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              {/* Label skeleton */}
              <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
              {/* Input skeleton */}
              <div className="h-9 w-full bg-gray-100 animate-pulse rounded border border-blue-50" />
            </div>
          ))}
        </div>

        {/* Button footer skeleton */}
        <div className="flex justify-end mt-4">
          <div className="h-10 w-32 bg-blue-100 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}