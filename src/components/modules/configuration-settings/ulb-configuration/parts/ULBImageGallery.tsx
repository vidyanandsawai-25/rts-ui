'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Image as ImageIcon, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/common/Badge';
import { AddButton } from '@/components/common/ActionButtons';
import { Button } from '@/components/common/ActionButton';
import { IMAGE_CONSTRAINTS } from '@/config/ulb-configuration.config';
import type { ULBImage } from '@/types/ulbconfig-master.types';

const { MAX_IMAGES, MAX_GALLERY_BYTES } = IMAGE_CONSTRAINTS;

export function ULBImageGallery() {
  const t = useTranslations('ulb_configuration');
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ULBImage[]>([]);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(t('messages.maxImagesAllowed', { max: MAX_IMAGES }));
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(t('messages.notValidImage', { name: file.name }));
        continue;
      }
      if (file.size > MAX_GALLERY_BYTES) {
        toast.error(t('messages.imageSizeExceeded', { name: file.name }));
        continue;
      }
      validFiles.push(file);
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ULBImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          url: e.target?.result as string,
          name: file.name,
          size: file.size,
          isBackgroundImage: false,
          uploadedDate: new Date().toISOString(),
        };
        setImages((prev) => (prev.length === 0 ? [{ ...newImage, isBackgroundImage: true }] : [...prev, newImage]));
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      toast.success(t('messages.imagesAdded', { count: validFiles.length }));
    }

    event.target.value = '';
  };

  const handleSetAsBackground = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isBackgroundImage: img.id === id })));
    toast.success(t('messages.backgroundUpdated'));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <ImageIcon className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
          {t('sections.imageGallery')}
        </span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-slate-400">
            {t('status.gallerySlots', { current: images.length, max: MAX_IMAGES })}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <AddButton
            label={t('buttons.addImages')}
            onClick={() => inputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
            className="h-8 rounded-lg px-4 text-xs font-bold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {images.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-16">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300">
              <ImageIcon className="h-10 w-10" />
            </div>
            <h4 className="text-base font-bold text-slate-600">{t('messages.galleryEmpty')}</h4>
            <p className="mt-2 max-w-[280px] text-center text-sm font-medium text-slate-400">
              {t('messages.galleryEmptyHint')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                  unoptimized
                  loading="lazy"
                  sizes="(max-width: 1024px) 33vw, 20vw"
                />

                {image.isBackgroundImage && (
                  <Badge className="absolute left-2 top-2 z-20 h-5 gap-1 border-none bg-amber-500/90 px-2 text-[9px] font-black text-white">
                    <Star className="h-3 w-3 fill-white" /> {t('status.backgroundBadge')}
                  </Badge>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {!image.isBackgroundImage && (
                    <Button
                      size="sm"
                      onClick={() => handleSetAsBackground(image.id)}
                      className="h-9 w-9 rounded-full bg-amber-500 p-0 text-white hover:bg-amber-600"
                      title={t('buttons.setAsBackground')}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
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
  );
}
