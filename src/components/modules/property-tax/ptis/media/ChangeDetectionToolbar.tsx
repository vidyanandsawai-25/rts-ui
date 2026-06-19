'use client';

import React from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/common';

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
          <Button
            size="xs"
            variant="secondary"
            icon={Upload}
            onClick={() => beforeInputRef.current?.click()}
            className="cursor-pointer !h-7 !px-2.5 hover:!text-blue-700 [&_svg]:text-blue-600 [&_svg]:w-3.5 [&_svg]:h-3.5"
          >
            <span className="hidden sm:inline">{t('media.uploadBefore') || 'Upload Before (Old)'}</span>
          </Button>
          {hasCustomBefore && (
            <Button
              size="xs"
              variant="ghost"
              icon={Trash2}
              onClick={() => void handleDeleteImage('before')}
              className="cursor-pointer !p-0 !text-red-500 hover:!text-red-700 hover:!bg-red-50 !h-7 !w-7 [&_svg]:w-3.5 [&_svg]:h-3.5"
              title={t('media.resetToDefault')}
            />
          )}
        </div>

        {/* After Actions */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-sm h-8 shrink-0">
          <Button
            size="xs"
            variant="secondary"
            icon={Upload}
            onClick={() => afterInputRef.current?.click()}
            className="cursor-pointer !h-7 !px-2.5 hover:!text-blue-700 [&_svg]:text-blue-600 [&_svg]:w-3.5 [&_svg]:h-3.5"
          >
            <span className="hidden sm:inline">{t('media.uploadAfter') || 'Upload After (New)'}</span>
          </Button>
          {hasCustomAfter && (
            <Button
              size="xs"
              variant="ghost"
              icon={Trash2}
              onClick={() => void handleDeleteImage('after')}
              className="cursor-pointer !p-0 !text-red-500 hover:!text-red-700 hover:!bg-red-50 !h-7 !w-7 [&_svg]:w-3.5 [&_svg]:h-3.5"
              title={t('media.resetToDefault')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
