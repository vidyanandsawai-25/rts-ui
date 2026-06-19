'use client';

import React from 'react';
import { Plus, Trash2, Upload, FileImage, AlertCircle, RefreshCw, Split } from 'lucide-react';
import { Button, useConfirm } from '@/components/common';
import { useTranslations } from 'next-intl';
import { ImageWithFallback } from './ImageWithFallback';
import type { AdditionalImage } from './MediaImageCards';
import { PhotoPlanCarousel } from './PhotoPlanCarousel';

interface PhotoPlanGridProps {
  categoryName: string;
  images: AdditionalImage[];
  onSelectImage: (index: number) => void;
  onAddPhoto: () => void;
  onDeletePhoto: (index: number) => void;
  onReplacePhoto: (index: number) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  photoCount?: number;
  hideHeader?: boolean;
  className?: string;
  isCarouselMode?: boolean;
  selectedImageIndex?: number | null;
  photoTypeCode?: string;
  onCompare?: () => void;
}

export function PhotoPlanGrid({
  categoryName,
  images,
  onSelectImage,
  onAddPhoto,
  onDeletePhoto,
  onReplacePhoto,
  isLoading = false,
  error = null,
  onRetry,
  photoCount,
  hideHeader = false,
  className = '',
  isCarouselMode = false,
  selectedImageIndex = null,
  photoTypeCode,
  onCompare,
}: PhotoPlanGridProps): React.ReactElement {
  const t = useTranslations('ptis');
  const { confirm } = useConfirm();

  const handleDeleteClick = (e: React.MouseEvent, index: number, title: string) => {
    e.stopPropagation();
    confirm({
      variant: 'delete',
      title: t('media.deleteSlotTitle') || 'Delete Photo',
      description: t('media.deleteSlotDescription', { name: title }) || `Are you sure you want to delete ${title}?`,
      meta: { name: title },
      onConfirm: () => onDeletePhoto(index),
    });
  };

  const totalPhotos = typeof photoCount === 'number' ? photoCount : images.length;

  if (isCarouselMode) {
    return (
      <PhotoPlanCarousel
        images={images}
        selectedImageIndex={selectedImageIndex}
        onSelectImage={onSelectImage}
        onAddPhoto={onAddPhoto}
        onDeletePhoto={onDeletePhoto}
        onReplacePhoto={onReplacePhoto}
        className={className}
      />
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto scrollbar-thin ${className || 'p-3 sm:p-6'}`}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">
              {categoryName}{' '}
              <span className="text-sm font-medium text-slate-500">
                ({totalPhotos} {totalPhotos === 1 ? t('media.photo') || 'photo' : t('media.photos') || 'photos'})
              </span>
            </h2>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:gap-4 pb-8">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 rounded-lg bg-white border border-slate-200 p-2 flex flex-col gap-2 shadow-sm animate-pulse"
            >
              <div className="flex-1 bg-slate-100 rounded" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm max-w-sm w-full mx-auto text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            {onRetry && (
              <Button variant="secondary" onClick={onRetry} icon={RefreshCw}>
                {t('media.retry') || 'Retry'}
              </Button>
            )}
          </div>
        </div>
      ) : images.length === 0 ? (
        <div
          onClick={onAddPhoto}
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-white p-12 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer transition-all duration-300 select-none group"
        >
          <div className="p-4 bg-slate-50 rounded-full border border-slate-200 group-hover:scale-110 transition-transform duration-300 shadow-sm mb-4">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1 group-hover:text-blue-900">
            {t('media.noImageUploaded') || 'No Photos Uploaded'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs text-center">
            {t('media.clickToUpload', { title: categoryName }) ||
              `Click here to upload a photo to the ${categoryName} folder.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:gap-4 pb-8">
          {images.map((img, index) => {
            const isSelected = selectedImageIndex === index;
            return (
              <div
                key={img.propertyPhotoId || index}
                onClick={() => onSelectImage(index)}
                className={`relative group bg-white rounded-lg overflow-hidden border transition-all cursor-pointer h-40 flex flex-col ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex-1 bg-slate-100 overflow-hidden relative">
                  <ImageWithFallback
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    width={200}
                    height={150}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplacePhoto(index);
                      }}
                      className="p-1.5 bg-white hover:bg-slate-50 rounded shadow border border-slate-200 text-slate-600 hover:text-green-600 cursor-pointer transition-colors"
                      title={t('media.replaceImage') || 'Replace Image'}
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, index, img.title)}
                      className="p-1.5 bg-white hover:bg-slate-50 rounded shadow border border-slate-200 text-slate-600 hover:text-red-600 cursor-pointer transition-colors"
                      title={t('media.deleteSlotTitle') || 'Delete Photo'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2 border-t border-slate-100 bg-white">
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[11px] font-semibold text-slate-700 truncate flex-1">
                      {img.title}
                    </span>
                    {img.displayOrder !== undefined && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                        {t('media.displayOrder')}: {img.displayOrder}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {photoTypeCode === 'CHANGE_DETECTION' ? (
            onCompare && (
              <div
                onClick={onCompare}
                className="border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/10 cursor-pointer transition-all duration-200 h-40 flex flex-col items-center justify-center select-none group rounded-lg shadow-sm"
              >
                <div className="p-2.5 bg-slate-50 rounded-full border border-slate-200 group-hover:scale-105 transition-transform duration-200 mb-2">
                  <Split className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-800">
                  {t('media.compareImages') || 'Compare Images'}
                </span>
              </div>
            )
          ) : (
            /* Inline Add Card */
            <div
              onClick={onAddPhoto}
              className="border border-dashed border-slate-300 rounded-lg hover:border-blue-400 bg-white hover:bg-blue-50/10 cursor-pointer transition-all duration-200 h-40 flex flex-col items-center justify-center select-none group"
            >
              <div className="p-2.5 bg-slate-50 rounded-full border border-slate-200 group-hover:scale-105 transition-transform duration-200 mb-2">
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
              </div>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-800">
                {t('media.uploadImage') || 'Add Photo'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
