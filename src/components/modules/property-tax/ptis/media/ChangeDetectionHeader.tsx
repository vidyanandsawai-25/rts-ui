'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Split, Columns, Hand, ZoomIn, ZoomOut, RotateCcw, Link, Link2 } from 'lucide-react';
import { Button } from '@/components/common';

interface ChangeDetectionHeaderProps {
  photoTypeName: string;
  onBackToGrid: () => void;
  mode: 'slider' | 'side-by-side';
  setMode: (mode: 'slider' | 'side-by-side') => void;
  isPanningMode: boolean;
  setIsPanningMode: (isPan: boolean) => void;
  isSyncPan: boolean;
  setIsSyncPan: (isSync: boolean) => void;
  zoom: number;
  beforePan: { x: number; y: number };
  afterPan: { x: number; y: number };
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoomAndPan: () => void;
}

export function ChangeDetectionHeader({
  photoTypeName,
  onBackToGrid,
  mode,
  setMode,
  isPanningMode,
  setIsPanningMode,
  isSyncPan,
  setIsSyncPan,
  zoom,
  beforePan,
  afterPan,
  zoomIn,
  zoomOut,
  resetZoomAndPan,
}: ChangeDetectionHeaderProps): React.ReactElement {
  const t = useTranslations('ptis');

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between px-6 py-3 bg-white border-b border-slate-200 text-slate-800 gap-3 z-10 flex-shrink-0 select-none">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost" size="sm" onClick={onBackToGrid} icon={ArrowLeft}
          className="!text-slate-700 hover:!text-slate-900 !p-1 cursor-pointer transition-colors !bg-slate-100 hover:!bg-slate-200 rounded"
        >
          {t('media.backToGrid')}
        </Button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-600">{photoTypeName}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Zoom and Pan Mode Toggles */}
        {mode === 'side-by-side' && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-sm">
            <Button
              size="xs"
              variant={isPanningMode ? 'primary' : 'secondary'}
              icon={Hand}
              onClick={() => setIsPanningMode(!isPanningMode)}
              className="!h-7 !w-7 !p-0 shadow-sm cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5"
              title={t('media.panMode') || 'Pan Mode'}
            />
            {isPanningMode && (
              <Button
                size="xs"
                variant={isSyncPan ? 'primary' : 'secondary'}
                icon={isSyncPan ? Link : Link2}
                onClick={() => setIsSyncPan(!isSyncPan)}
                className="!h-7 !w-7 !p-0 shadow-sm cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5"
                title={isSyncPan ? (t('media.syncPanActive') || 'Sync Panning (Active)') : (t('media.syncPanInactive') || 'Individual Panning')}
              />
            )}
            <Button
              size="xs"
              variant="secondary"
              icon={ZoomIn}
              onClick={zoomIn}
              className="!h-7 !w-7 !p-0 shadow-sm cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5"
              title={t('media.zoomIn') || 'Zoom In'}
            />
            <Button
              size="xs"
              variant="secondary"
              icon={ZoomOut}
              onClick={zoomOut}
              className="!h-7 !w-7 !p-0 shadow-sm cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5"
              title={t('media.zoomOut') || 'Zoom Out'}
            />
            {(zoom > 1 || beforePan.x !== 0 || beforePan.y !== 0 || afterPan.x !== 0 || afterPan.y !== 0) && (
              <Button
                size="xs"
                variant="secondary"
                icon={RotateCcw}
                onClick={resetZoomAndPan}
                className="!h-7 !w-7 !p-0 shadow-sm cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5"
                title={t('media.resetView') || 'Reset View'}
              />
            )}
          </div>
        )}

        {/* View Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
          <Button
            size="xs"
            variant={mode === 'slider' ? 'secondary' : 'ghost'}
            icon={Split}
            onClick={() => { setMode('slider'); resetZoomAndPan(); setIsPanningMode(false); }}
            className={`!h-7 !px-2.5 cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5 ${
              mode === 'slider' ? '!text-blue-700 shadow-sm border border-slate-200/50' : ''
            }`}
          >
            {t('media.compareModeSlider')}
          </Button>
          <Button
            size="xs"
            variant={mode === 'side-by-side' ? 'secondary' : 'ghost'}
            icon={Columns}
            onClick={() => { setMode('side-by-side'); resetZoomAndPan(); setIsPanningMode(true); }}
            className={`!h-7 !px-2.5 cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5 ${
              mode === 'side-by-side' ? '!text-blue-700 shadow-sm border border-slate-200/50' : ''
            }`}
          >
            {t('media.compareModeSideBySide')}
          </Button>
        </div>
      </div>
    </div>
  );
}
