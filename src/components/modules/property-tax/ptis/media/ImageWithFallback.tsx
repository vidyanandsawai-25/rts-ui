'use client';

import React, { useState, useCallback } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';

interface ImageWithFallbackProps {
  src: string;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

/** blob: and data: URLs are browser-generated — Next.js optimizer cannot handle them. */
function isBlobOrDataUrl(src: string): boolean {
  return src.startsWith('blob:') || src.startsWith('data:');
}

/** Shimmer skeleton shown while an image is loading. */
function ImageSkeleton({ className }: { className: string }): React.ReactElement {
  return (
    <div
      className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] ${className}`}
      aria-hidden="true"
    />
  );
}

/** Placeholder shown when src is empty or the image fails to load. */
function ImagePlaceholder({
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

/**
 * Image component with built-in loading skeleton, error fallback, and optimization.
 * All URLs are rendered through NextImage — blob/data/external URLs set `unoptimized`
 * to bypass the Next.js image optimizer.
 */
export function ImageWithFallback({
  src,
  alt = '',
  fallbackSrc,
  className = '',
  width,
  height,
  fill,
  sizes,
  priority = false,
}: ImageWithFallbackProps): React.ReactElement {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('ptis');

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => setIsLoading(false), []);

  const effectiveSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const isSmall = width !== undefined && width < 100;

  if ((hasError || !src) && !fallbackSrc) {
    return <ImagePlaceholder alt={alt} isSmall={isSmall} label={t('media.imageUnavailable')} />;
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && <ImageSkeleton className={className} />}
      <NextImage
        src={effectiveSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes ?? (fill ? '100vw' : undefined)}
        priority={priority}
        quality={80}
        loading={priority ? undefined : 'lazy'}
        unoptimized={
          isBlobOrDataUrl(effectiveSrc) ||
          !effectiveSrc.startsWith('/') ||
          effectiveSrc.startsWith('/api/documents/')
        }
      />
    </div>
  );
}
