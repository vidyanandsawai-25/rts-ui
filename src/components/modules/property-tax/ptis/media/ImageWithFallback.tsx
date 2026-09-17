/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { ImageSkeleton, ImagePlaceholder } from './ImageViewerFallbacks';
import { getDocumentAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/document.actions';

interface ImageWithFallbackProps {
  src: string;
  documentGuid?: string;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  style?: React.CSSProperties;
}

export const documentCache = new Map<string, string | Promise<string>>();

export async function resolveDocumentUrl(src: string, documentGuid?: string): Promise<string> {
  if (src && (src.startsWith('data:') || src.startsWith('blob:'))) {
    return src;
  }
  if (!src && !documentGuid) return '';
  
  let guid = documentGuid;
  if (!guid && src) {
    const match = src.match(/\/documents\/([^/]+)/);
    if (match) {
      guid = match[1];
    }
  }
  
  // Static non-document URL (e.g. GIS static map, satellite tiles, local SVGs)
  if (!guid) return src;
  const decodedGuid = decodeURIComponent(guid);
  
  try {
    const res = await getDocumentAction(decodedGuid, 'view');
    if (res.success && res.data?.base64) {
      return `data:${res.data.contentType};base64,${res.data.base64}`;
    }
    return '';
  } catch (_err) {
    return '';
  }
}

export function ImageWithFallback({
  src,
  documentGuid,
  alt = '',
  fallbackSrc,
  className = '',
  width: _width,
  height: _height,
  fill: _fill,
  sizes: _sizes,
  priority: _priority = false,
  unoptimized,
  onLoad,
  style,
}: ImageWithFallbackProps): React.ReactElement {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
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

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setHasError(false);
    setResolvedSrc('');

    const timer = setTimeout(() => {
      if (active) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 15000);

    if (!src && !documentGuid) {
      setHasError(true);
      setIsLoading(false);
      clearTimeout(timer);
      return;
    }

    resolveDocumentUrl(src, documentGuid)
      .then((url) => {
        if (active) {
          setResolvedSrc(url);
          setHasError(!url);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setHasError(true);
          setIsLoading(false);
        }
      })
      .finally(() => {
        clearTimeout(timer);
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [src, documentGuid]);

  const effectiveSrc = hasError && fallbackSrc ? fallbackSrc : resolvedSrc;
  const isSmall = _width !== undefined && _width < 100;

  if ((hasError || (!src && !documentGuid)) && !fallbackSrc) {
    return <ImagePlaceholder alt={alt} isSmall={isSmall} label={t('media.imageUnavailable')} />;
  }

  const objectFit = className.includes('object-cover')
    ? 'cover'
    : className.includes('object-contain')
    ? 'contain'
    : undefined;

  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const isDataOrBlob = effectiveSrc.startsWith('data:') || effectiveSrc.startsWith('blob:');
  const shouldUnoptimize = unoptimized ?? (isDataOrBlob || isTest);
  const normalizedSrc =
    !shouldUnoptimize && !effectiveSrc.startsWith('/') && !effectiveSrc.startsWith('http://') && !effectiveSrc.startsWith('https://')
      ? `/${effectiveSrc}`
      : effectiveSrc;

  return (
    <div className="relative w-full h-full overflow-hidden" style={style}>
      {isLoading && <ImageSkeleton className={`w-full h-full ${className}`} />}
      {effectiveSrc && (
        <NextImage
          src={normalizedSrc}
          alt={alt}
          fill
          sizes={_sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          priority={_priority}
          className={`w-full h-full ${className}`}
          style={{ objectFit: objectFit || 'cover' }}
          onError={handleError}
          onLoad={(e) => {
            handleLoad();
            onLoad?.(e as unknown as React.SyntheticEvent<HTMLImageElement>);
          }}
          unoptimized={shouldUnoptimize}
        />
      )}
    </div>
  );
}

/** Clears a cached document entry (or all entries if no key specified) */
export function clearDocumentCacheEntry(srcOrGuid?: string): void {
  if (!srcOrGuid) {
    documentCache.clear();
    return;
  }
  const match = srcOrGuid.match(/\/documents\/([^/]+)/);
  const guid = match ? match[1] : srcOrGuid;
  const decodedGuid = decodeURIComponent(guid);
  documentCache.delete(decodedGuid);
  documentCache.delete(srcOrGuid);
}
