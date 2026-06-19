'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ViewportProps {
  image: string;
  label: string;
  pan: { x: number; y: number };
  zoom: number;
  isPanningMode: boolean;
  onStartDrag: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  isDraggingImage: boolean;
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
}: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageRatio, setImageRatio] = useState(1);
  const [containerRatio, setContainerRatio] = useState(1);

  // Measure container on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width && rect.height) {
          setContainerRatio(rect.width / rect.height);
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImageRatio(img.naturalWidth / img.naturalHeight);
    }
  };

  const isWider = imageRatio > containerRatio;

  const imageStyle: React.CSSProperties = isWider
    ? {
        position: 'absolute',
        height: '100%',
        width: 'auto',
        maxWidth: 'none',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: 'center center',
        transition: isDraggingImage ? 'none' : 'transform 0.15s ease-out',
      }
    : {
        position: 'absolute',
        width: '100%',
        height: 'auto',
        maxHeight: 'none',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: 'center center',
        transition: isDraggingImage ? 'none' : 'transform 0.15s ease-out',
      };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 ${
        isPanningMode ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      onMouseDown={onStartDrag}
      onTouchStart={onTouchStart}
    >
      <div className="w-full h-full relative pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={label}
          onLoad={handleImageLoad}
          style={imageStyle}
          className="pointer-events-none select-none"
        />
      </div>
      <div className="absolute top-4 left-4 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded shadow-md backdrop-blur-[2px]">
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
      />
    </div>
  );
}
