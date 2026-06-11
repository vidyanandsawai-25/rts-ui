'use client';

import React, { memo } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/common';
import { useTranslations } from 'next-intl';
import { ImageWithFallback } from './ImageWithFallback';
import type { AdditionalImage } from './MediaImageCards';

export interface PhotoCategory {
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  images: AdditionalImage[];
  isCustom?: boolean;
  photoCount?: number;
  hasPhoto?: boolean;
}

interface PhotoPlanSidebarProps {
  categories: PhotoCategory[];
  selectedCategoryIndex: number;
  onSelectCategory: (index: number) => void;
  title: string;
  onAddSlot?: () => void;
  isLoading?: boolean;
}

export const PhotoPlanSidebar = memo(function PhotoPlanSidebar({
  categories,
  selectedCategoryIndex,
  onSelectCategory,
  title,
  onAddSlot,
  isLoading = false,
}: PhotoPlanSidebarProps): React.ReactElement {
  const t = useTranslations('ptis');

  return (
    <div className="w-full xl:w-[280px] border-b xl:border-b-0 xl:border-r border-slate-200 bg-white flex flex-col shrink-0 select-none">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex-shrink-0 hidden xl:block">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {title} ({categories.length})
        </h4>
      </div>

      <div className="flex-1 overflow-x-auto xl:overflow-y-auto p-2 flex flex-row xl:flex-col gap-2 scrollbar-thin">
        {categories.map((cat, index) => {
          const isActive = selectedCategoryIndex === index;
          const photoCount =
            typeof cat.photoCount === 'number' ? cat.photoCount : cat.images.length;
          const firstImage = cat.images.find((img: AdditionalImage) => img.src);

          return (
            <div
              key={`${cat.photoTypeName}-${index}`}
              className="relative flex-shrink-0 w-44 xl:w-full"
            >
              <Button
                variant="ghost"
                onClick={() => onSelectCategory(index)}
                className={`!flex !h-auto !justify-start !p-1.5 xl:!p-2 rounded-lg text-left transition-all border-2 w-full !font-normal !text-slate-700 hover:!text-slate-900 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isActive
                    ? '!border-blue-500 bg-blue-50/50 shadow-sm'
                    : '!border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="w-12 h-10 xl:w-16 xl:h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200 relative flex items-center justify-center">
                  {firstImage?.src ? (
                    <ImageWithFallback
                      src={firstImage.src}
                      alt={cat.photoTypeName}
                      className="w-full h-full object-cover"
                      width={80}
                      height={60}
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-slate-400 opacity-60" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0 pr-1 pl-1 xl:pr-2 xl:pl-2 flex-1">
                  <span
                    className={`text-[11px] xl:text-xs font-medium truncate ${isActive ? 'text-blue-900' : 'text-slate-700'}`}
                  >
                    {cat.photoTypeName}
                  </span>
                  <span className="text-[9px] xl:text-[10px] text-slate-400 font-normal mt-0.5">
                    {isLoading && photoCount === 0
                      ? 'Loading...'
                      : `${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`}
                  </span>
                </div>
              </Button>
            </div>
          );
        })}

        {onAddSlot && (
          <div className="flex-shrink-0 flex items-center xl:hidden pl-2">
            <Button
              variant="secondary"
              onClick={onAddSlot}
              icon={Plus}
              className="h-10 px-3 flex items-center justify-center gap-1.5 !text-blue-700 !bg-blue-50 !border-blue-200 hover:!bg-blue-100 transition-all cursor-pointer font-medium text-xs whitespace-nowrap"
            >
              {t('media.slot') || 'Slot'}
            </Button>
          </div>
        )}
      </div>

      {onAddSlot && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0 hidden xl:block">
          <Button
            variant="secondary"
            onClick={onAddSlot}
            icon={Plus}
            className="w-full flex items-center justify-center gap-2 !text-blue-700 !bg-blue-50 !border-blue-200 hover:!bg-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-medium"
          >
            {t('media.addPhotoPlanSlot') || 'Add Photo Slot'}
          </Button>
        </div>
      )}
    </div>
  );
});
