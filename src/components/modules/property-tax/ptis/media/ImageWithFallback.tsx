'use client';

import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { getDocumentAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/document.actions';
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
}

/** blob: and data: URLs are browser-generated — Next.js optimizer cannot handle them. */
function isBlobOrDataUrl(src: string): boolean {
  return src.startsWith('blob:') || src.startsWith('data:');
}

/**
 * Image component with built-in loading skeleton, error fallback, and optimization.
 * All URLs are rendered through NextImage — blob/data/external URLs set `unoptimized`
 * to bypass the Next.js image optimizer.
 */
// In-memory cache for document base64 data URLs to prevent re-fetching and flickering
export const documentCache = new Map<string, string | Promise<string>>();

/** Remove a single document from the in-memory cache so it will be re-fetched.
 *  Call this after replacing an image to ensure the new version loads. */
export function clearDocumentCacheEntry(src: string): void {
  if (!src || !src.startsWith('/api/documents/')) return;
  const guid = src.split('/')[3];
  if (guid) documentCache.delete(guid);
}

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
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const getInitialState = useCallback((currentSrc: string) => {
    if (!currentSrc || !currentSrc.startsWith('/api/documents/')) {
      return { resolved: currentSrc, loading: false };
    }
    const parts = currentSrc.split('/');
    const guid = parts[3];
    if (guid && documentCache.has(guid)) {
      const cached = documentCache.get(guid)!;
      if (typeof cached === 'string') {
        return { resolved: cached, loading: false };
      }
    }
    return { resolved: '', loading: true };
  }, []);

  const initialState = getInitialState(src);
  const [resolvedSrc, setResolvedSrc] = useState(initialState.resolved);
  const [isLoading, setIsLoading] = useState(initialState.loading);
  const t = useTranslations('ptis');

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    const nextState = getInitialState(src);
    setIsLoading(nextState.loading);
    setResolvedSrc(nextState.resolved);
  }

  useEffect(() => {
    if (!src || !src.startsWith('/api/documents/')) {
      return;
    }
    const parts = src.split('/');
    const guid = parts[3];
    if (!guid) return;

    let active = true;

    if (documentCache.has(guid)) {
      const cached = documentCache.get(guid)!;
      if (typeof cached === 'string') {
        return;
      }
      cached.then((dataUrl) => {
        if (active) {
          setResolvedSrc(dataUrl);
          setHasError(false);
          setIsLoading(false);
        }
      }).catch(() => {
        // Evict failed promise so a future render can retry.
        documentCache.delete(guid);
        if (active) {
          setHasError(true);
          setIsLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }

    const promise = getDocumentAction(decodeURIComponent(guid), 'view')
      .then((res) => {
        if (res.success && res.data?.base64) {
          const dataUrl = `data:${res.data.contentType};base64,${res.data.base64}`;
          documentCache.set(guid, dataUrl);
          return dataUrl;
        }
        throw new Error('Failed to load');
      });

    documentCache.set(guid, promise);

    promise.then((dataUrl) => {
      if (active) {
        setResolvedSrc(dataUrl);
        setHasError(false);
        setIsLoading(false);
      }
    }).catch(() => {
      // Evict failed promise so a future render can retry.
      documentCache.delete(guid);
      if (active) {
        setHasError(true);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => setIsLoading(false), []);

  const effectiveSrc = hasError && fallbackSrc ? fallbackSrc : resolvedSrc;
  const isSmall = width !== undefined && width < 100;

  if ((hasError || !src) && !fallbackSrc) {
    return <ImagePlaceholder alt={alt} isSmall={isSmall} label={t('media.imageUnavailable')} />;
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && <ImageSkeleton className={className} />}
      {!isLoading && effectiveSrc && (
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
          quality={75}
          loading={priority ? undefined : 'lazy'}
          unoptimized={
            isBlobOrDataUrl(effectiveSrc) ||
            !effectiveSrc.startsWith('/') ||
            effectiveSrc.startsWith('/api/documents/')
          }
        />
      )}
    </div>
  );
}
