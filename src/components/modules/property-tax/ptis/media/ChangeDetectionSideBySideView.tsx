'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ImageWithFallback } from './ImageWithFallback';

interface ViewportProps {
  image: string;
  label: string;
  pan: { x: number; y: number };
  zoom: number;
  isPanningMode: boolean;
  onStartDrag: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  isDraggingImage: boolean;
  onLoad: (width: number, height: number) => void;
  aspectRatio: number;
}

function SideBySideViewport({
  image,
  label,
  pan,
  zoom,
  isPanningMode,
  onStartDrag,
  onTouchStart,
  isDraggingImage,
  onLoad,
  aspectRatio,
}: ViewportProps) {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: isDraggingImage ? 'none' : 'transform 0.15s ease-out',
    minWidth: '100%',
    minHeight: '100%',
    aspectRatio: `${aspectRatio}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      className={`relative h-full w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 ${
        isPanningMode ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      onMouseDown={onStartDrag}
      onTouchStart={onTouchStart}
    >
      <div style={containerStyle} className="pointer-events-none">
        <ImageWithFallback
          src={image}
          alt={label}
          fill
          priority
          onLoad={(e) => {
            const img = e.currentTarget;
            onLoad(img.naturalWidth, img.naturalHeight);
          }}
          className="pointer-events-none select-none object-cover"
        />
      </div>
      <div className="absolute top-4 left-4 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded shadow-md backdrop-blur-[2px] z-10">
        {label}
      </div>
    </div>
  );
}

interface ChangeDetectionSideBySideViewProps {
  isPanningMode: boolean;
  handleStartDrag: (e: React.MouseEvent, type: 'before' | 'after') => void;
  handleTouchStart: (e: React.TouchEvent, type: 'before' | 'after') => void;
  beforeImage: string;
  afterImage: string;
  beforePan: { x: number; y: number };
  afterPan: { x: number; y: number };
  zoom: number;
  hasCustomBefore: boolean;
  hasCustomAfter: boolean;
  isDraggingImage: boolean;
  handleImageLoad: (type: 'before' | 'after', width: number, height: number) => void;
  beforeRatio: number;
  afterRatio: number;
}

export function ChangeDetectionSideBySideView({
  isPanningMode,
  handleStartDrag,
  handleTouchStart,
  beforeImage,
  afterImage,
  beforePan,
  afterPan,
  zoom,
  hasCustomBefore,
  hasCustomAfter,
  isDraggingImage,
  handleImageLoad,
  beforeRatio,
  afterRatio,
}: ChangeDetectionSideBySideViewProps): React.ReactElement {
  const t = useTranslations('ptis');

  const beforeLabel = hasCustomBefore
    ? (t('media.beforeCustomLabel') || 'Before (Old)')
    : (t('media.beforeSatelliteLabel') || '2018 Satellite');

  const afterLabel = hasCustomAfter
    ? (t('media.afterCustomLabel') || 'After (New)')
    : (t('media.afterSatelliteLabel') || '2026 Satellite');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-h-[70vh] select-none">
      <SideBySideViewport
        image={beforeImage}
        label={beforeLabel}
        pan={beforePan}
        zoom={zoom}
        isPanningMode={isPanningMode}
        onStartDrag={(e) => handleStartDrag(e, 'before')}
        onTouchStart={(e) => handleTouchStart(e, 'before')}
        isDraggingImage={isDraggingImage}
        onLoad={(w, h) => handleImageLoad('before', w, h)}
        aspectRatio={beforeRatio}
      />
      <SideBySideViewport
        image={afterImage}
        label={afterLabel}
        pan={afterPan}
        zoom={zoom}
        isPanningMode={isPanningMode}
        onStartDrag={(e) => handleStartDrag(e, 'after')}
        onTouchStart={(e) => handleTouchStart(e, 'after')}
        isDraggingImage={isDraggingImage}
        onLoad={(w, h) => handleImageLoad('after', w, h)}
        aspectRatio={afterRatio}
      />
    </div>
  );
}
