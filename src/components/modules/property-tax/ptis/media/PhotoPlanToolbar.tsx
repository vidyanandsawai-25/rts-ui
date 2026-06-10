'use client';

import React from 'react';
import { RotateCcw, RotateCw, RefreshCw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/common';
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
}: PhotoPlanToolbarProps): React.ReactElement {
  const t = useTranslations('ptis');

  const toolbarBtnClass =
    '!bg-slate-50 !text-slate-700 !border-slate-200 hover:!bg-slate-100 hover:!text-slate-900 hover:!border-slate-300 hover:scale-105 active:scale-95 transition-all duration-200 disabled:!opacity-50 disabled:!bg-slate-100/50 disabled:!text-slate-400 disabled:!border-slate-200/50 disabled:!scale-100 cursor-pointer';

  return (
    <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-6 z-10 flex-shrink-0">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-800 text-xs font-semibold">{title}</span>
        </div>
        <span className="text-slate-500 text-[10px]">
          {t('media.imageOf', { current: currentIndex + 1, total: totalCount })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="xs"
          onClick={onRotateLeft}
          disabled={!hasImage}
          icon={RotateCcw}
          className={toolbarBtnClass}
          aria-label={t('media.rotateLeft')}
        >
          {t('media.rotateLeft')}
        </Button>
        <Button
          variant="secondary"
          size="xs"
          onClick={onRotateRight}
          disabled={!hasImage}
          icon={RotateCw}
          className={toolbarBtnClass}
          aria-label={t('media.rotateRight')}
        >
          {t('media.rotateRight')}
        </Button>
        <Button
          variant="secondary"
          size="xs"
          onClick={onReset}
          disabled={!hasImage || rotation === 0}
          icon={RefreshCw}
          className={toolbarBtnClass}
          aria-label={t('media.reset')}
        >
          {t('media.reset')}
        </Button>
        <div className="w-px h-6 bg-slate-200 mx-2" />
        {hasImage ? (
          <>
            <Button
              variant="secondary"
              size="xs"
              onClick={onReplace ?? onUpload}
              icon={Upload}
              className="!bg-slate-50 !text-slate-700 !border-slate-200 hover:!bg-slate-100 hover:!text-slate-900 hover:!border-slate-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label={t('media.replaceImage')}
            >
              {t('media.replaceImage')}
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={onDownload}
              icon={Download}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label={t('media.download')}
            >
              {t('media.download')}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="xs"
            onClick={onUpload}
            icon={Upload}
            className="!bg-blue-600 hover:!bg-blue-700 !text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label={t('media.uploadImage')}
          >
            {t('media.uploadImage')}
          </Button>
        )}
      </div>
    </div>
  );
}
