'use client';

import React, { useState, useCallback } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { ImageSkeleton, ImagePlaceholder } from './ImageViewerFallbacks';

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
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  style?: React.CSSProperties;
}

export const documentCache = new Map<string, string | Promise<string>>();

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
  onLoad,
  style,
}: ImageWithFallbackProps): React.ReactElement {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('ptis');

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // When src changes, reset error & loading states
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoading(true);
  }

  const effectiveSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const isSmall = width !== undefined && width < 100;

  if ((hasError || !src) && !fallbackSrc) {
    return <ImagePlaceholder alt={alt} isSmall={isSmall} label={t('media.imageUnavailable')} />;
  }

  const objectFit = className.includes('object-cover')
    ? 'cover'
    : className.includes('object-contain')
    ? 'contain'
    : undefined;

  return (
    <div className="relative w-full h-full" style={style}>
      {isLoading && <ImageSkeleton className={className} />}
      {effectiveSrc && (
        <NextImage
          src={effectiveSrc}
          alt={alt}
          className={className}
          style={{ objectFit }}
          onError={handleError}
          onLoad={(e) => {
            handleLoad();
            onLoad?.(e);
          }}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill || undefined}
          sizes={sizes ?? (fill ? '100vw' : undefined)}
          priority={priority || undefined}
          quality={75}
          loading={priority ? undefined : 'lazy'}
          unoptimized
        />
      )}
    </div>
  );
}

// Stub function to avoid compile errors in other files that might import it
export function clearDocumentCacheEntry(_src: string): void {}
