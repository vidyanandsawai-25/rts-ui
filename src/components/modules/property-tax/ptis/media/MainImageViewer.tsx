'use client';

import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { Plus, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common';
import { useImageViewerZoom } from '@/hooks/ptis/photoplan/useImageViewerZoom';
import { getDocumentAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/document.actions';
import { ImageLoadingSkeleton, ImageErrorFallback } from './ImageViewerFallbacks';
import { documentCache } from './ImageWithFallback';

export function isBlobUrl(src: string): boolean {
  return src.startsWith('blob:') || src.startsWith('data:');
}

interface MainImageViewerProps {
  src: string;
  alt: string;
  rotation: number;
}

export function MainImageViewer({ src, alt, rotation }: MainImageViewerProps): React.ReactElement {
  const t = useTranslations('ptis');
  const [hasError, setHasError] = useState(false);

  const getInitialState = useCallback((currentSrc: string) => {
    if (!currentSrc || !currentSrc.startsWith('/api/documents/')) {
      return { resolved: currentSrc, loading: false };
    }
    const parts = currentSrc.split('/');
    const guid = parts[3];
    if (guid && documentCache.has(guid)) {
      const cached = documentCache.get(guid)!;
      if (typeof cached === 'string') return { resolved: cached, loading: false };
    }
    return { resolved: '', loading: true };
  }, []);

  const initialState = getInitialState(src);
  const [resolvedSrc, setResolvedSrc] = useState(initialState.resolved);
  const [isLoading, setIsLoading] = useState(initialState.loading);

  useEffect(() => {
    if (!src || !src.startsWith('/api/documents/')) return;
    const guid = src.split('/')[3];
    if (!guid) return;
    let active = true;

    const handleResolve = (url: string) => {
      if (active) { setResolvedSrc(url); setHasError(false); setIsLoading(false); }
    };
    const handleReject = () => {
      documentCache.delete(guid);
      if (active) { setHasError(true); setIsLoading(false); }
    };

    if (documentCache.has(guid)) {
      const cached = documentCache.get(guid)!;
      if (typeof cached === 'string') return;
      cached.then(handleResolve).catch(handleReject);
      return () => { active = false; };
    }

    const promise = getDocumentAction(decodeURIComponent(guid), 'view').then((res) => {
      if (res.success && res.data?.base64) {
        const dataUrl = `data:${res.data.contentType};base64,${res.data.base64}`;
        documentCache.set(guid, dataUrl);
        return dataUrl;
      }
      throw new Error();
    });

    documentCache.set(guid, promise);
    promise.then(handleResolve).catch(handleReject);

    return () => { active = false; };
  }, [src, getInitialState]);

  const handleLoad = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const {
    scale, x, y, isDragging, isZooming, containerRef,
    handleMouseDown, handleMouseMove, handleMouseUpOrLeave, handleZoom, handleDoubleClick,
  } = useImageViewerZoom({ src: resolvedSrc, rotation });

  const rotateStyle: React.CSSProperties = {
    transform: scale === 1 && x === 0 && y === 0 ? `rotate(${rotation}deg)` : `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
    transition: (isDragging || isZooming) ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (!src || hasError) {
    return <ImageErrorFallback alt={alt} errorLabel={t('media.imageUnavailable') || 'Image Unavailable'} />;
  }

  const effectiveSrc = resolvedSrc;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      className="relative flex items-center justify-center w-full h-full overflow-hidden select-none"
    >
      <div style={rotateStyle} className="relative flex items-center justify-center w-full h-full pointer-events-none">
        {isLoading && <ImageLoadingSkeleton />}
        {!isLoading && effectiveSrc && (
          <NextImage
            src={effectiveSrc}
            alt={alt}
            fill
            sizes="(max-width: 1280px) 80vw, 70vw"
            className="object-contain"
            priority
            quality={75}
            onLoad={handleLoad}
            onError={handleError}
            unoptimized={isBlobUrl(effectiveSrc) || !effectiveSrc.startsWith('/') || effectiveSrc.startsWith('/api/documents/')}
          />
        )}
      </div>

      <div
        className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-semibold shadow-lg flex items-center gap-2 transition-all duration-300 z-20"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <Button
          size="xs"
          variant="ghost"
          onClick={() => handleZoom('out')}
          disabled={scale <= 0.5}
          className="!p-1 hover:!bg-slate-700/60 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed !h-7 !w-7 !text-white hover:!text-white"
          aria-label="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <span className="select-none min-w-[36px] text-center">{Math.round(scale * 100)}%</span>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => handleZoom('in')}
          disabled={scale >= 8}
          className="!p-1 hover:!bg-slate-700/60 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed !h-7 !w-7 !text-white hover:!text-white"
          aria-label="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
        {scale !== 1 && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleZoom('reset')}
            className="!p-1 hover:!bg-slate-700/60 rounded-full transition-colors !h-7 !w-7 !text-white hover:!text-white"
            aria-label="Reset Zoom"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
