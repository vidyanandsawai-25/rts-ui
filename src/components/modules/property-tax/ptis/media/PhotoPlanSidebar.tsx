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
    <div className="w-[280px] border-r border-slate-200 bg-white flex flex-col h-full select-none">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {title} ({categories.length})
        </h4>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 scrollbar-thin">
        {categories.map((cat, index) => {
          const isActive = selectedCategoryIndex === index;
          const photoCount = typeof cat.photoCount === 'number' ? cat.photoCount : cat.images.length;
          const firstImage = cat.images.find((img: AdditionalImage) => img.src);

          return (
            <div key={`${cat.photoTypeName}-${index}`} className="relative w-full">
              <Button
                variant="ghost"
                onClick={() => onSelectCategory(index)}
                className={`!flex !h-auto !justify-start !p-2 rounded-lg text-left transition-all border-2 w-full !font-normal !text-slate-700 hover:!text-slate-900 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isActive
                    ? '!border-blue-500 bg-blue-50/50 shadow-sm'
                    : '!border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="w-16 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200 relative flex items-center justify-center">
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
                <div className="flex flex-col justify-center min-w-0 pr-2 pl-2 flex-1">
                  <span className={`text-xs font-medium truncate ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                    {cat.photoTypeName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                    {isLoading && photoCount === 0 ? 'Loading...' : `${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`}
                  </span>
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      {onAddSlot && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
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
