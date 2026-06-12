'use client';

import React from 'react';
import { RotateCcw, RotateCw, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PhotoPlanToolbarProps {
  title: string;
  currentIndex: number;
  totalCount: number;
  hasImage: boolean;
  rotation: number;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
  isAdding?: boolean;
  isReplacing?: boolean;
  isDeleting?: boolean;
}

export function PhotoPlanToolbar({
  title,
  currentIndex,
  totalCount,
  hasImage,
  rotation,
  onRotateLeft,
  onRotateRight,
  onReset,
  onDownload,
  onUpload,
  onReplace,
  onDelete,
  isAdding = false,
  isReplacing = false,
  isDeleting = false,
}: PhotoPlanToolbarProps): React.ReactElement {
  const t = useTranslations('ptis');
  const isMutating = isAdding || isReplacing || isDeleting;

  return (
    <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0 gap-4">
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block truncate">
          {title}
        </span>
        <span className="text-slate-500 text-xs font-medium mt-0.5">
          {t('media.imageOf', { current: currentIndex + 1, total: totalCount }) || `Image ${currentIndex + 1} of ${totalCount}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Group 1: Manipulation (Segmented Control) */}
        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white shrink-0 h-8">
          <button
            onClick={onRotateLeft}
            disabled={!hasImage || isMutating}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-r border-slate-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            aria-label={t('media.rotateLeft')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('media.rotateLeft')}</span>
          </button>
          <button
            onClick={onRotateRight}
            disabled={!hasImage || isMutating}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-r border-slate-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            aria-label={t('media.rotateRight')}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('media.rotateRight')}</span>
          </button>
          <button
            onClick={onReset}
            disabled={!hasImage || rotation === 0 || isMutating}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            aria-label={t('media.reset')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('media.reset')}</span>
          </button>
        </div>

        {/* Visual Divider Separator */}
        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        {/* Group 2: Actions */}
        <div className="flex items-center gap-2 h-8">
          {hasImage ? (
            <>
              <button
                onClick={onReplace ?? onUpload}
                disabled={isMutating}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm bg-white h-full shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                aria-label={t('media.replaceImage')}
              >
                {isReplacing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isReplacing ? (t('media.replacing') || 'Replacing...') : (t('media.replaceImage') || 'Replace Image')}
                </span>
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  disabled={isMutating}
                  className="w-8 h-8 text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                  title={t('actions.delete') || 'Delete'}
                  aria-label={t('actions.delete') || 'Delete'}
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={onDownload}
                disabled={isMutating}
                className="w-8 h-8 text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                title={t('media.download') || 'Download'}
                aria-label={t('media.download') || 'Download'}
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onUpload}
              disabled={isMutating}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm h-full shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
              aria-label={t('media.uploadImage')}
            >
              {isAdding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isAdding ? (t('media.uploading') || 'Uploading...') : (t('media.uploadImage') || 'Upload Image')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
