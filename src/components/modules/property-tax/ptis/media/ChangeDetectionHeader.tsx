'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Split, Columns, Hand, ZoomIn, ZoomOut, RotateCcw, Link, Link2 } from 'lucide-react';
import { Button } from '@/components/common/ActionButton';

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
            <button
              onClick={() => setIsPanningMode(!isPanningMode)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                isPanningMode ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:text-slate-905 border border-slate-200/50'
              }`}
              title={t('media.panMode') || 'Pan Mode'}
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
            {isPanningMode && (
              <button
                onClick={() => setIsSyncPan(!isSyncPan)}
                className={`flex items-center justify-center p-1 rounded transition-all cursor-pointer shadow-sm ${
                  isSyncPan ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:text-slate-95 border border-slate-200/50'
                }`}
                title={isSyncPan ? (t('media.syncPanActive') || 'Sync Panning (Active)') : (t('media.syncPanInactive') || 'Individual Panning')}
              >
                {isSyncPan ? <Link className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={zoomIn}
              className="flex items-center justify-center p-1 bg-white text-slate-700 hover:text-slate-95 border border-slate-200/50 rounded transition-all cursor-pointer shadow-sm"
              title={t('media.zoomIn') || 'Zoom In'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={zoomOut}
              className="flex items-center justify-center p-1 bg-white text-slate-700 hover:text-slate-95 border border-slate-200/50 rounded transition-all cursor-pointer shadow-sm"
              title={t('media.zoomOut') || 'Zoom Out'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {(zoom > 1 || beforePan.x !== 0 || beforePan.y !== 0 || afterPan.x !== 0 || afterPan.y !== 0) && (
              <button
                onClick={resetZoomAndPan}
                className="flex items-center justify-center p-1 bg-white text-slate-700 hover:text-slate-95 border border-slate-200/50 rounded transition-all cursor-pointer shadow-sm"
                title={t('media.resetView') || 'Reset View'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* View Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
          <button
            onClick={() => { setMode('slider'); resetZoomAndPan(); setIsPanningMode(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'slider' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-905'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            {t('media.compareModeSlider')}
          </button>
          <button
            onClick={() => { setMode('side-by-side'); resetZoomAndPan(); setIsPanningMode(true); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'side-by-side' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-905'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            {t('media.compareModeSideBySide')}
          </button>
        </div>
      </div>
    </div>
  );
}
