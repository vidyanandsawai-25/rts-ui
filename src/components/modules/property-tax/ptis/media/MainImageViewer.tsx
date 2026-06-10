'use client';

import React, { useState, useCallback } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';

/** Checks if a URL is a browser-generated blob or data URL. */
export function isBlobUrl(src: string): boolean {
  return src.startsWith('blob:') || src.startsWith('data:');
}

interface MainImageViewerProps {
  src: string;
  alt: string;
  rotation: number;
}

/** Skeleton shown while the main image is loading. */
function ImageLoadingSkeleton(): React.ReactElement {
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
function ImageErrorFallback({ alt, errorLabel }: { alt: string; errorLabel: string }): React.ReactElement {
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

/**
 * Renders the main image inside the PhotoPlanDrawer with loading and error states.
 * Always uses NextImage — blob/data/external URLs set unoptimized to bypass the optimizer.
 */
export function MainImageViewer({ src, alt, rotation }: MainImageViewerProps): React.ReactElement {
  const t = useTranslations('ptis');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const rotateStyle: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (!src) {
    return <ImageErrorFallback alt={alt} errorLabel={t('media.imageUnavailable') || 'Image Unavailable'} />;
  }

  if (hasError) {
    return <ImageErrorFallback alt={alt} errorLabel={t('media.imageUnavailable') || 'Image Unavailable'} />;
  }

  return (
    <div style={rotateStyle} className="relative flex items-center justify-center w-full h-full">
      {isLoading && <ImageLoadingSkeleton />}
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1280px) 80vw, 70vw"
        className="object-contain select-none pointer-events-none"
        priority
        quality={85}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={isBlobUrl(src) || !src.startsWith('/') || src.startsWith('/api/documents/')}
      />
    </div>
  );
}
