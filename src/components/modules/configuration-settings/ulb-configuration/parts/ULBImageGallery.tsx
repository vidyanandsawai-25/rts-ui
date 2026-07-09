'use client';

import { useTranslations } from 'next-intl';
import { Image as ImageIcon, Star, Trash2, RefreshCw } from 'lucide-react';
import { AddButton, Button } from '@/components/common';
import { IMAGE_CONSTRAINTS } from '@/config/ulb-configuration.config';
import type { ULBImageGalleryProps } from '@/types/ulbconfig-master.types';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';

const { MAX_IMAGES } = IMAGE_CONSTRAINTS;

export function ULBImageGallery({
  images,
  unselectedLogos,
  unselectedBackgrounds,
  isUploading,
  isLoading,
  onTriggerUpload,
  onTriggerReplace,
  onSetAsBackground,
  onDeleteImage,
  onLogoChange,
  onDeleteLogoOrBackground,
}: ULBImageGalleryProps) {
  const t = useTranslations('ulb_configuration');

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <ImageIcon className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
          {t('sections.imageGallery') || 'ULB Image Gallery'}
        </span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-slate-400">
            {t('status.gallerySlots', { current: images.length, max: MAX_IMAGES })}
          </span>
          <AddButton
            label={isUploading ? t('messages.uploading') || 'Uploading...' : t('buttons.addImages')}
            onClick={onTriggerUpload}
            disabled={images.length >= MAX_IMAGES || isUploading}
            className="h-8 rounded-lg px-4 text-xs font-bold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Section 1: Logo Library */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('sections.logoLibrary', { count: unselectedLogos.length })}
          </span>
          {unselectedLogos.length === 0 ? (
            <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-[10px] font-medium text-slate-400">
              {t('messages.noOtherLogos')}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pr-1">
              {unselectedLogos.map((logo) => (
                <div key={logo.id} className="group relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-300">
                  <button
                    type="button"
                    onClick={() => onLogoChange(logo.url)}
                    className="h-full w-full p-1"
                    title="Select as active logo"
                  >
                    <ImageWithFallback
                      src={logo.url}
                      alt="Logo option"
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLogoOrBackground(logo.id, 'Logo')}
                    className="absolute right-0.5 top-0.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600 group-hover:flex"
                    title="Delete logo"
                  >
                    <span className="text-[10px] font-bold leading-none">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        {/* Section 2: Background Library */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('sections.backgroundLibrary', { count: unselectedBackgrounds.length })}
          </span>
          {unselectedBackgrounds.length === 0 ? (
            <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-[10px] font-medium text-slate-400">
              {t('messages.noOtherBackgrounds')}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pr-1">
              {unselectedBackgrounds.map((bg) => (
                <div key={bg.id} className="group relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-300">
                  <button
                    type="button"
                    onClick={() => onSetAsBackground(bg.id)}
                    className="h-full w-full"
                    title="Select as active background"
                  >
                    <ImageWithFallback
                      src={bg.url}
                      alt="Background option"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLogoOrBackground(bg.id, 'Background')}
                    className="absolute right-0.5 top-0.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600 group-hover:flex"
                    title="Delete background"
                  >
                    <span className="text-[10px] font-bold leading-none">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        {/* Section 3: Gallery Images */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('sections.galleryCarousel')}
          </span>
          {isLoading ? (
            <div className="flex h-32 flex-col items-center justify-center animate-pulse">
              <p className="text-xs font-semibold text-slate-400">{t('status.loading') || 'Loading images...'}</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center border-2 border-dashed border-slate-100 bg-slate-50/20 text-center rounded-2xl">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm border border-slate-50">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-400">
                {t('status.noImages') || 'No images uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-in fade-in duration-200"
                >
                  <ImageWithFallback
                    src={image.url}
                    alt={image.name}
                    width={240}
                    height={180}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {image.isBackgroundImage && (
                    <span className="absolute left-2.5 top-2.5 flex h-6 items-center gap-1 rounded-full bg-amber-500/90 px-2.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-[2px]">
                      <Star className="h-2.5 w-2.5 fill-white" />
                      BG
                    </span>
                  )}

                  {/* Hover overlay actions */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-2">
                      {!image.isBackgroundImage && (
                        <Button
                          size="sm"
                          onClick={() => onSetAsBackground(image.id)}
                          className="h-9 w-9 rounded-full bg-amber-500 p-0 text-white hover:bg-amber-600"
                          title={t('buttons.setAsBackground')}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => onTriggerReplace(image.id)}
                        className="h-9 w-9 rounded-full bg-blue-500 p-0 text-white hover:bg-blue-600"
                        title={t('buttons.edit') || 'Replace Image'}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onDeleteImage(image.id)}
                        className="h-9 w-9 rounded-full bg-rose-500 p-0 text-white hover:bg-rose-600"
                        title={t('buttons.delete') || 'Delete Image'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="max-w-full truncate px-2 text-[10px] font-bold text-white/90">
                      {image.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
