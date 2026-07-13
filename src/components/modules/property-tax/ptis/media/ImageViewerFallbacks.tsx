import React from 'react';

/** Skeleton shown while the main image is loading. */
export function ImageLoadingSkeleton(): React.ReactElement {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/60 animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-slate-200/80" />
        <div className="w-32 h-3 rounded bg-slate-200/80" />
      </div>
    </div>
  );
}

/** Fallback shown when the main image fails to load. */
export function ImageErrorFallback({
  alt,
  errorLabel,
}: {
  alt: string;
  errorLabel: string;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-slate-500">
      <svg className="w-16 h-16 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-sm font-medium opacity-60 text-center">
        {errorLabel}: {alt}
      </span>
    </div>
  );
}

/** Shimmer skeleton shown while an image is loading. */
export function ImageSkeleton({ className }: { className: string }): React.ReactElement {
  return (
    <div
      className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] ${className}`}
      aria-hidden="true"
    />
  );
}

/** Placeholder shown when src is empty or the image fails to load. */
export function ImagePlaceholder({
  alt,
  isSmall,
  label,
}: {
  alt: string;
  isSmall: boolean;
  label: string;
}): React.ReactElement {
  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500 w-full h-full"
      aria-label={alt}
    >
      <div className="flex flex-col items-center justify-center gap-1 p-1">
        <svg
          className={`${isSmall ? 'w-5 h-5' : 'w-8 h-8'} opacity-40`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {!isSmall && <span className="text-xs font-medium opacity-60 text-center">{label}</span>}
      </div>
    </div>
  );
}
