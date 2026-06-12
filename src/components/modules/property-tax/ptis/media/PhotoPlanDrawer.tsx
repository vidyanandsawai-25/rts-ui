'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Images } from 'lucide-react';
import { Drawer } from '@/components/common';
import { PhotoPlanDrawerBody } from './PhotoPlanDrawerBody';
import type { PhotoCategory } from './PhotoPlanSidebar';

interface PhotoPlanDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  wardNo?: string;
  propertyNo?: string;
  initialCategoryIndex?: number;
  propertyId?: number;
  fullyLoadedIds: Set<number>;
  onFullyLoadedIdsChange: (ids: Set<number>) => void;
}

export function PhotoPlanDrawer({
  open,
  onClose,
  categories,
  onCategoriesChange,
  wardNo = '',
  propertyNo = '',
  initialCategoryIndex = 0,
  propertyId,
  fullyLoadedIds,
  onFullyLoadedIdsChange,
}: PhotoPlanDrawerProps): React.ReactNode {
  const t = useTranslations('ptis');

  React.useEffect(() => {
    if (open) {
      const el = document.querySelector('.photo-plan-drawer-content')?.closest('.drawer-instance');
      const backdrop = el?.previousElementSibling as HTMLElement;
      if (backdrop) {
        backdrop.style.backgroundColor = 'transparent';
        backdrop.style.backdropFilter = 'none';
      }
    }
  }, [open]);

  if (!open || typeof window === 'undefined' || typeof document === 'undefined') return null;

  const subtitleText = [
    wardNo && `${t('media.wardNo') || 'Ward'}: ${wardNo}`,
    propertyNo && `${t('media.propertyNo') || 'Prop'}: ${propertyNo}`,
  ]
    .filter(Boolean)
    .join(' | ');

  const titleNode = (
    <div className="flex items-center gap-2">
      <Images className="w-5 h-5 text-blue-600" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-blue-900 leading-tight">
          {t('media.additionalImages') || 'Additional Images'}
        </span>
        <span className="text-[10px] text-blue-500 font-medium">{subtitleText}</span>
      </div>
    </div>
  );

  return createPortal(
    <Drawer open={open} onClose={onClose} title={titleNode} width="xl">
      <PhotoPlanDrawerBody
        categories={categories}
        onCategoriesChange={onCategoriesChange}
        initialCategoryIndex={initialCategoryIndex}
        propertyId={propertyId}
        fullyLoadedIds={fullyLoadedIds}
        onFullyLoadedIdsChange={onFullyLoadedIdsChange}
      />
    </Drawer>,
    document.body
  );
}
