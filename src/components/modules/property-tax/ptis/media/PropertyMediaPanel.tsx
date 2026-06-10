'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Images, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/common/ActionButton';
import { MediaImageCard, AdditionalImagesGrid } from './MediaImageCards';
import { PhotoPlanDrawer } from './PhotoPlanDrawer';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import type { PhotoCategory } from './PhotoPlanSidebar';
import { mapSlotsToCategories } from './mediaData';

export interface PropertyMediaPanelProps {
  sharedLanguage?: 'english' | 'marathi';
  onLanguageChange?: (language: 'english' | 'marathi') => void;
  propertyHolderName?: string; propertyHolderNameMarathi?: string;
  wardNo?: string; propertyNo?: string; partitionNo?: string;
  isQCApproved?: boolean; propertyId?: number;
  initialPhotoSlots?: PropertyPhotoTypeWithStatusDto[];
  initialPhotos?: PropertyPhotoDto[];
}

function findCategory(categories: PhotoCategory[], codeKeywords: string[], nameKeywords: string[]) {
  return categories.find(c => {
    const code = c.photoTypeCode?.toUpperCase() || '';
    const name = c.photoTypeName?.toLowerCase() || '';
    return codeKeywords.some(kw => code.includes(kw)) || nameKeywords.some(kw => name.includes(kw));
  });
}

function PropertyMediaPanel({
  wardNo = '', propertyNo = '', propertyId,
  initialPhotoSlots = [], initialPhotos = [],
}: PropertyMediaPanelProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('ptis');

  const [showMoreImages, setShowMoreImages] = useState(false);
  const [photos, setPhotos] = useState<PropertyPhotoDto[]>(initialPhotos);
  const [prevInitialPhotos, setPrevInitialPhotos] = useState<PropertyPhotoDto[]>(initialPhotos);
  const [fullyLoadedIds, setFullyLoadedIds] = useState<Set<number>>(new Set());
  const [prevInitialPhotoSlots, setPrevInitialPhotoSlots] = useState<PropertyPhotoTypeWithStatusDto[]>(initialPhotoSlots);

  if (initialPhotos !== prevInitialPhotos) {
    setPhotos(initialPhotos);
    setPrevInitialPhotos(initialPhotos);
  }

  if (initialPhotoSlots !== prevInitialPhotoSlots) {
    setFullyLoadedIds(new Set());
    setPrevInitialPhotoSlots(initialPhotoSlots);
  }

  const categories = useMemo(() => 
    mapSlotsToCategories(initialPhotoSlots, photos, fullyLoadedIds),
    [initialPhotoSlots, photos, fullyLoadedIds]
  );

  const isDrawerOpen = searchParams.get('drawer') === 'photo-plan';
  const categoryIndexParam = searchParams.get('photoCategoryIndex');
  const drawerInitialCategoryIndex = categoryIndexParam ? parseInt(categoryIndexParam, 10) : 0;

  const openDrawer = useCallback((idx: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('drawer', 'photo-plan'); p.set('photoCategoryIndex', idx.toString());
    router.push(`${pathname}?${p.toString()}`);
  }, [searchParams, pathname, router]);

  const closeDrawer = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('drawer'); p.delete('photoCategoryIndex');
    router.push(`${pathname}?${p.toString()}`);
  }, [searchParams, pathname, router]);

  const handleCategoriesChange = useCallback((newCats: PhotoCategory[]) => {
    const updated: PropertyPhotoDto[] = [];
    newCats.forEach(c => c.images.forEach(img => {
      if (img.propertyPhotoId) {
        updated.push({
          propertyPhotoId: img.propertyPhotoId, propertyId: propertyId || 0,
          photoTypeId: img.photoTypeId || 0, photoTypeCode: img.photoTypeCode || '',
          photoTypeName: c.photoTypeName, displayOrder: img.displayOrder,
          remarks: img.remarks ? `${img.title} | ${img.remarks}` : img.title, viewUrl: img.src,
        });
      }
    }));
    setPhotos(updated);
  }, [propertyId]);

  const photoPlanCategory = useMemo(() => 
    findCategory(categories, ['PHOTO_PLAN'], ['photo plan', 'plan']),
    [categories]
  );
  const photoPlanPhoto = photoPlanCategory?.images[0];

  const propertyPhotoCategory = useMemo(() => 
    findCategory(categories, ['PROPERTY_PHOTO', 'PROPERTY'], ['property']),
    [categories]
  );
  const propertyPhoto = propertyPhotoCategory?.images[0];

  const buildingPhotoCategory = useMemo(() => 
    findCategory(categories, ['BUILDING', 'FRONT'], ['building', 'front']),
    [categories]
  );
  const buildingPhoto = buildingPhotoCategory?.images[0];

  const remainingImages = useMemo(() => {
    const all = categories.flatMap(c => c.images);
    return all.filter(img => {
      const code = img.photoTypeCode?.toUpperCase() || '';
      if (code === 'FLOOR' || code === 'GIS') return false;
      if (propertyPhoto && img.propertyPhotoId === propertyPhoto.propertyPhotoId) return false;
      if (photoPlanPhoto && img.propertyPhotoId === photoPlanPhoto.propertyPhotoId) return false;
      if (buildingPhoto && img.propertyPhotoId === buildingPhoto.propertyPhotoId) return false;
      return true;
    });
  }, [categories, propertyPhoto, photoPlanPhoto, buildingPhoto]);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 scrollbar-thin">
        <MediaImageCard
          src={propertyPhoto?.src || ''}
          fullSrc={propertyPhoto?.fullSrc || ''}
          alt={propertyPhoto?.alt || t('media.propertyPhoto')}
          label={propertyPhoto?.title || t('media.propertyPhoto')}
          hoverBorderColor="hover:border-blue-500"
          badgeText={!showMoreImages && remainingImages.length > 0 ? `+${remainingImages.length} More` : undefined}
          onClick={() => {
            const idx = propertyPhotoCategory ? categories.indexOf(propertyPhotoCategory) : -1;
            openDrawer(idx >= 0 ? idx : 0);
          }}
        >
          {remainingImages.length > 0 && (
            <Button
              variant="secondary" size="xs" className="h-7 w-7 p-0 shadow-lg hover:bg-blue-500 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setShowMoreImages(p => !p); }}
              aria-label={showMoreImages ? 'Hide more images' : 'View more images'}
            >
              {showMoreImages ? <X className="w-3.5 h-3.5" /> : <Images className="w-3.5 h-3.5" />}
            </Button>
          )}
        </MediaImageCard>

        {showMoreImages && (
          <AdditionalImagesGrid
            images={remainingImages}
            onImageClick={(index) => {
              const clickedImg = remainingImages[index];
              const catIdx = categories.findIndex(c => c.photoTypeId === clickedImg.photoTypeId);
              openDrawer(catIdx >= 0 ? catIdx : 0);
            }}
          />
        )}

        <div className="border-t border-slate-300 flex-shrink-0" />
        <MediaImageCard
          src={photoPlanPhoto?.src || ''}
          fullSrc={photoPlanPhoto?.fullSrc || ''}
          alt={photoPlanPhoto?.alt || t('media.photoPlan')}
          label={photoPlanPhoto?.title || t('media.photoPlan')}
          hoverBorderColor="hover:border-purple-500"
          onClick={() => {
            const idx = photoPlanCategory ? categories.indexOf(photoPlanCategory) : -1;
            openDrawer(idx >= 0 ? idx : 0);
          }}
        />

        <div className="border-t border-slate-300 flex-shrink-0" />
        <MediaImageCard
          src={buildingPhoto?.src || ''}
          fullSrc={buildingPhoto?.fullSrc || ''}
          alt={buildingPhoto?.alt || t('media.buildingPhoto')}
          label={buildingPhoto?.title || t('media.buildingPhoto')}
          hoverBorderColor="hover:border-green-500"
          onClick={() => {
            const idx = buildingPhotoCategory ? categories.indexOf(buildingPhotoCategory) : -1;
            openDrawer(idx >= 0 ? idx : 0);
          }}
        />
      </div>

      {isDrawerOpen && (
        <PhotoPlanDrawer
          open={isDrawerOpen} onClose={closeDrawer} categories={categories}
          onCategoriesChange={handleCategoriesChange} wardNo={wardNo} propertyNo={propertyNo}
          initialCategoryIndex={drawerInitialCategoryIndex} propertyId={propertyId}
          fullyLoadedIds={fullyLoadedIds} onFullyLoadedIdsChange={setFullyLoadedIds}
        />
      )}
    </div>
  );
}

export default React.memo(PropertyMediaPanel);
