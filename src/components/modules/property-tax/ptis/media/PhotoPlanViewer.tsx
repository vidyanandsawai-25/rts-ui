'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/common';
import { MainImageViewer } from './MainImageViewer';
import { PhotoPlanToolbar } from './PhotoPlanToolbar';
import type { AdditionalImage } from './MediaImageCards';

interface PhotoPlanViewerProps {
  categoryName: string;
  images: AdditionalImage[];
  selectedImageIndex: number;
  rotation: number;
  onBackToGrid: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onResetRotation: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onReplace: (index: number) => void;
}

export function PhotoPlanViewer({
  categoryName,
  images,
  selectedImageIndex,
  rotation,
  onBackToGrid,
  onNext,
  onPrev,
  onRotateLeft,
  onRotateRight,
  onResetRotation,
  onDownload,
  onUpload,
  onReplace,
}: PhotoPlanViewerProps): React.ReactElement {
  const t = useTranslations('ptis');
  const currentImage = images[selectedImageIndex];

  return (
    <>
      <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-slate-200 text-slate-800 z-10 flex-shrink-0 select-none">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToGrid}
          icon={ArrowLeft}
          className="!text-slate-700 hover:!text-slate-900 !p-1 cursor-pointer transition-colors !bg-slate-100 hover:!bg-slate-200 rounded"
        >
          {t('media.backToGrid') || 'Back to Grid'}
        </Button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-600">{categoryName}</span>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-2 sm:p-8 select-none">
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={onPrev}
              icon={ChevronLeft}
              aria-label="Previous image"
              className="absolute left-2 sm:left-4 z-10 !h-9 !w-9 sm:!h-11 sm:!w-11 !p-1 sm:!p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-lg hover:scale-105 transition-all opacity-100 sm:opacity-0 sm:group-hover/viewer:opacity-100 flex items-center justify-center"
            />
            <Button
              variant="ghost"
              size="lg"
              onClick={onNext}
              icon={ChevronRight}
              aria-label="Next image"
              className="absolute right-2 sm:right-4 z-10 !h-9 !w-9 sm:!h-11 sm:!w-11 !p-1 sm:!p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-lg hover:scale-105 transition-all opacity-100 sm:opacity-0 sm:group-hover/viewer:opacity-100 flex items-center justify-center"
            />
          </>
        )}
        <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden rounded-lg shadow-xl bg-slate-100 border border-slate-200 w-full h-full">
          <MainImageViewer
            src={currentImage?.src || ''}
            alt={currentImage?.title || ''}
            rotation={rotation}
          />
        </div>
      </div>

      <PhotoPlanToolbar
        title={currentImage?.title || ''}
        currentIndex={selectedImageIndex}
        totalCount={images.length}
        hasImage={!!currentImage?.src}
        rotation={rotation}
        onRotateLeft={onRotateLeft}
        onRotateRight={onRotateRight}
        onReset={onResetRotation}
        onDownload={onDownload}
        onUpload={onUpload}
        onReplace={() => onReplace(selectedImageIndex)}
      />
    </>
  );
}
