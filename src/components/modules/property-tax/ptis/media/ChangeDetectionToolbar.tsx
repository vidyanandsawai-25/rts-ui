'use client';

import React from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChangeDetectionToolbarProps {
  photoTypeName: string;
  beforeInputRef: React.RefObject<HTMLInputElement | null>;
  afterInputRef: React.RefObject<HTMLInputElement | null>;
  hasCustomBefore: boolean;
  hasCustomAfter: boolean;
  handleDeleteImage: (type: 'before' | 'after') => Promise<void> | void;
}

export function ChangeDetectionToolbar({
  photoTypeName,
  beforeInputRef,
  afterInputRef,
  hasCustomBefore,
  hasCustomAfter,
  handleDeleteImage,
}: ChangeDetectionToolbarProps): React.ReactElement {
  const t = useTranslations('ptis');

  return (
    <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0 gap-4 select-none">
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block truncate">
          {photoTypeName}
        </span>
        <span className="text-slate-500 text-xs font-medium mt-0.5">
          {t('media.changeDetection') || 'Change Detection'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Before Actions */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-sm h-8 shrink-0">
          <button
            onClick={() => beforeInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md text-slate-700 hover:text-blue-700 transition-all cursor-pointer bg-white border border-slate-200/50 hover:shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{t('media.uploadBefore') || 'Upload Before (Old)'}</span>
          </button>
          {hasCustomBefore && (
            <button
              onClick={() => void handleDeleteImage('before')}
              className="flex items-center justify-center p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all cursor-pointer"
              title={t('media.resetToDefault')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* After Actions */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-sm h-8 shrink-0">
          <button
            onClick={() => afterInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md text-slate-700 hover:text-blue-700 transition-all cursor-pointer bg-white border border-slate-200/50 hover:shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{t('media.uploadAfter') || 'Upload After (New)'}</span>
          </button>
          {hasCustomAfter && (
            <button
              onClick={() => void handleDeleteImage('after')}
              className="flex items-center justify-center p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all cursor-pointer"
              title={t('media.resetToDefault')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
