'use client';

import React from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChangeDetectionSliderViewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPanningMode: boolean;
  handleStartDrag: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  beforeImage: string;
  afterImage: string;
  beforeTransformStyle: React.CSSProperties;
  afterTransformStyle: React.CSSProperties;
  hasCustomBefore: boolean;
  hasCustomAfter: boolean;
  sliderPosition: number;
  setIsDraggingHandle: (val: boolean) => void;
}

export function ChangeDetectionSliderView({
  containerRef,
  isPanningMode,
  handleStartDrag,
  handleTouchStart,
  beforeImage,
  afterImage,
  beforeTransformStyle,
  afterTransformStyle,
  hasCustomBefore,
  hasCustomAfter,
  sliderPosition,
  setIsDraggingHandle,
}: ChangeDetectionSliderViewProps): React.ReactElement {
  const t = useTranslations('ptis');

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full max-h-[70vh] rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 select-none ${
        isPanningMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-ew-resize'
      }`}
      onMouseDown={handleStartDrag}
      onTouchStart={handleTouchStart}
    >
      {/* Before Image (Base Layer - 2018) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="w-full h-full relative" style={beforeTransformStyle}>
          <Image src={beforeImage} alt="Before View" fill priority className="object-cover pointer-events-none" />
        </div>
        <div className="absolute top-4 left-4 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded shadow-md backdrop-blur-[2px]">
          {hasCustomBefore ? (t('media.beforeCustomLabel') || 'Before (Old)') : (t('media.beforeSatelliteLabel') || '2018 Satellite')}
        </div>
      </div>

      {/* After Image (Top Sliding Layer - 2026) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <div className="w-full h-full relative" style={afterTransformStyle}>
          <Image src={afterImage} alt="After View" fill priority className="object-cover pointer-events-none" />
        </div>
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-md">
          {hasCustomAfter ? (t('media.afterCustomLabel') || 'After (New)') : (t('media.afterSatelliteLabel') || '2026 Satellite')}
        </div>
      </div>

      {/* Vertical Split Line/Handler */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize select-none z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={(e) => { e.stopPropagation(); setIsDraggingHandle(true); }}
        onTouchStart={(e) => { e.stopPropagation(); setIsDraggingHandle(true); }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-2xl border-2 border-slate-200 select-none z-30 transition-transform active:scale-110">
          <Maximize2 className="w-4 h-4 rotate-45" />
        </div>
      </div>
    </div>
  );
}
