'use client';

import React from 'react';
import { Button } from '@/components/common';
import { Images, X, Plus } from 'lucide-react';
import { ImageHoverPreview } from './ImageHoverPreview';
import { MediaImageCard, AdditionalImagesGrid, type AdditionalImage } from './MediaImageCards';
import { ChangeDetectionCard } from './ChangeDetectionCard';
import { GisMapCard } from './GisMapCard';
import type { PhotoCategory } from './PhotoPlanSidebar';
import type { HoverPreviewData } from '@/hooks/ptis/photoplan/useImageHoverPreview';
import type { WingWiseWingDetails } from '@/types/property-tax/apartment';

interface PropertyMediaPanelContentProps {
  categories: PhotoCategory[];
  t: (key: string) => string;
  wings?: WingWiseWingDetails[];
  openDrawer: (categoryIndex: number, imageIndex?: number, mode?: 'view' | 'create') => void;
  handleImageHover: (
    src: string,
    title: string,
    src2?: string,
    beforeLabel?: string,
    afterLabel?: string,
    fallbackSrc?: string,
    fallbackSrc2?: string
  ) => void;
  handleImageLeave: () => void;
  cancelImageLeave: () => void;
  hoverPreview: HoverPreviewData | null;
  propertyPhoto?: AdditionalImage;
  propertyPhotoCategory?: PhotoCategory;
  societyPhoto?: AdditionalImage;
  societyPhotoCategory?: PhotoCategory;
  wingPhoto?: AdditionalImage;
  wingPhotoCategory?: PhotoCategory;
  photoPlanPhoto?: AdditionalImage;
  photoPlanCategory?: PhotoCategory;
  amenityPhoto?: AdditionalImage;
  amenityPhotoCategory?: PhotoCategory;
  isAmenityProperty?: boolean;
  handleCreateClick: (e: React.MouseEvent) => void;
  gisPhoto?: AdditionalImage;
  hasCoords?: boolean;
  cdBeforeImg: string;
  cdAfterImg: string;
  cdBeforeLabel: string;
  cdAfterLabel: string;
  fallbackBeforeUrl: string;
  fallbackAfterUrl: string;
  cdCategory?: PhotoCategory;
  isMainProperty?: boolean;
}

export function PropertyMediaPanelContent({
  categories,
  t,
  openDrawer,
  handleImageHover,
  handleImageLeave,
  cancelImageLeave,
  hoverPreview,
  propertyPhoto,
  propertyPhotoCategory,
  societyPhoto,
  societyPhotoCategory,
  wingPhoto,
  wingPhotoCategory,
  photoPlanPhoto,
  photoPlanCategory,
  amenityPhoto,
  amenityPhotoCategory,
  isAmenityProperty = false,
  handleCreateClick,
  gisPhoto,
  hasCoords = true,
  cdBeforeImg,
  cdAfterImg,
  cdBeforeLabel,
  cdAfterLabel,
  fallbackBeforeUrl,
  fallbackAfterUrl,
  cdCategory,
  wings: _wings = [],
  isMainProperty = false,
}: PropertyMediaPanelContentProps): React.ReactElement {
  const isSociety = categories.some((c) => c.photoTypeCode?.startsWith('SOCIETY_') || c.photoTypeCode?.includes('SOCIETY'));
  const isWing = categories.some((c) => c.photoTypeCode?.startsWith('WING_') || c.photoTypeCode?.includes('WING'));

  const hasPropertySlot = categories.some((c) => !c.isCustom && (c.photoTypeCode?.startsWith('PROPERTY_') || c.photoTypeCode === 'FRONT'));

  const [expandedCategory, setExpandedCategory] = React.useState<'society' | 'wing' | 'property' | null>(null);

  const societyRemainingImages = React.useMemo(() => societyPhotoCategory?.images.slice(1) || [], [societyPhotoCategory]);
  const wingRemainingImages = React.useMemo(() => wingPhotoCategory?.images.slice(1) || [], [wingPhotoCategory]);
  const propertyRemainingImages = React.useMemo(() => propertyPhotoCategory?.images.slice(1) || [], [propertyPhotoCategory]);

  const mainCardLabel = isSociety
    ? (t('media.societyPhoto') || 'Society Photo')
    : isWing
      ? (t('media.wingPhoto') || 'Wing Photo')
      : (t('media.propertyPhoto') || 'Property Photo');

  return (
    <>
      <ImageHoverPreview
        key={hoverPreview?.src ?? 'empty'}
        src={hoverPreview?.src ?? ''}
        src2={hoverPreview?.src2}
        title={hoverPreview?.title ?? ''}
        beforeLabel={hoverPreview?.beforeLabel}
        afterLabel={hoverPreview?.afterLabel}
        fallbackSrc={hoverPreview?.fallbackSrc}
        fallbackSrc2={hoverPreview?.fallbackSrc2}
        visible={hoverPreview !== null}
        onMouseEnter={cancelImageLeave}
        onMouseLeave={handleImageLeave}
      />

      <div className="flex-1 min-h-0 h-full overflow-y-auto p-2 flex flex-col sm:grid sm:grid-cols-3 lg:flex lg:flex-col gap-2 scrollbar-thin">
        {isSociety && isWing ? (
          <>
            {/* Society Photo Card */}
            <MediaImageCard
              src={societyPhoto?.src || ''}
              documentGuid={societyPhoto?.documentGuid}
              fullSrc={societyPhoto?.fullSrc || ''}
              alt={societyPhoto?.alt || (t('media.societyPhoto') || 'Society Photo')}
              label={societyPhoto?.title || (t('media.societyPhoto') || 'Society Photo')}
              hoverBorderColor="hover:border-blue-500"
              badgeText={expandedCategory !== 'society' && societyRemainingImages.length > 0 ? `+${societyRemainingImages.length} More` : undefined}
              onClick={() => openDrawer(societyPhotoCategory ? categories.indexOf(societyPhotoCategory) : 0, 0)}
              onMouseEnter={() => handleImageHover(societyPhoto?.fullSrc || societyPhoto?.src || '', societyPhoto?.title || (t('media.societyPhoto') || 'Society Photo'))}
              onMouseLeave={handleImageLeave}
              hasPhoto={societyPhoto?.hasPhoto}
            >
              {societyRemainingImages.length > 0 && (
                <Button
                  variant="edit"
                  size="xs"
                  className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCategory((p) => (p === 'society' ? null : 'society'));
                  }}
                  aria-label={expandedCategory === 'society' ? 'Hide more images' : 'View more images'}
                >
                  {expandedCategory === 'society' ? <X className="w-3.5 h-3.5 cursor-pointer" /> : <Images className="w-3.5 h-3.5 cursor-pointer" />}
                </Button>
              )}
            </MediaImageCard>

            {expandedCategory === 'society' && (
              <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
                <AdditionalImagesGrid
                  images={societyRemainingImages}
                  onImageClick={(index: number) => {
                    const clickedImg = societyRemainingImages[index];
                    const catIdx = categories.findIndex((c) => c.photoTypeId === clickedImg.photoTypeId);
                    const targetCategory = categories[catIdx];
                    const imgIdx = targetCategory ? targetCategory.images.findIndex((img) => img.propertyPhotoId === clickedImg.propertyPhotoId) : 0;
                    openDrawer(catIdx >= 0 ? catIdx : 0, imgIdx >= 0 ? imgIdx : 0);
                  }}
                  onImageHover={handleImageHover}
                  onImageLeave={handleImageLeave}
                />
              </div>
            )}

            <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />

            {/* Wing Photo Card */}
            <MediaImageCard
              src={wingPhoto?.src || ''}
              documentGuid={wingPhoto?.documentGuid}
              fullSrc={wingPhoto?.fullSrc || ''}
              alt={wingPhoto?.alt || (t('media.wingPhoto') || 'Wing Photo')}
              label={wingPhoto?.title || (t('media.wingPhoto') || 'Wing Photo')}
              hoverBorderColor="hover:border-blue-500"
              badgeText={expandedCategory !== 'wing' && wingRemainingImages.length > 0 ? `+${wingRemainingImages.length} More` : undefined}
              onClick={() => openDrawer(wingPhotoCategory ? categories.indexOf(wingPhotoCategory) : 0, 0)}
              onMouseEnter={() => handleImageHover(wingPhoto?.fullSrc || wingPhoto?.src || '', wingPhoto?.title || (t('media.wingPhoto') || 'Wing Photo'))}
              onMouseLeave={handleImageLeave}
              hasPhoto={wingPhoto?.hasPhoto}
            >
              {wingRemainingImages.length > 0 && (
                <Button
                  variant="edit"
                  size="xs"
                  className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCategory((p) => (p === 'wing' ? null : 'wing'));
                  }}
                  aria-label={expandedCategory === 'wing' ? 'Hide more images' : 'View more images'}
                >
                  {expandedCategory === 'wing' ? <X className="w-3.5 h-3.5 cursor-pointer" /> : <Images className="w-3.5 h-3.5 cursor-pointer" />}
                </Button>
              )}
            </MediaImageCard>

            {expandedCategory === 'wing' && (
              <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
                <AdditionalImagesGrid
                  images={wingRemainingImages}
                  onImageClick={(index: number) => {
                    const clickedImg = wingRemainingImages[index];
                    const catIdx = categories.findIndex((c) => c.photoTypeId === clickedImg.photoTypeId);
                    const targetCategory = categories[catIdx];
                    const imgIdx = targetCategory ? targetCategory.images.findIndex((img) => img.propertyPhotoId === clickedImg.propertyPhotoId) : 0;
                    openDrawer(catIdx >= 0 ? catIdx : 0, imgIdx >= 0 ? imgIdx : 0);
                  }}
                  onImageHover={handleImageHover}
                  onImageLeave={handleImageLeave}
                />
              </div>
            )}

            {!isMainProperty && hasPropertySlot && (
              <>
                <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
                {/* Inner Property Photo Card */}
                <MediaImageCard
                  src={propertyPhoto?.src || ''}
                  documentGuid={propertyPhoto?.documentGuid}
                  fullSrc={propertyPhoto?.fullSrc || ''}
                  alt={propertyPhoto?.alt || (t('media.propertyPhoto') || 'Property Photo')}
                  label={propertyPhoto?.title || (t('media.propertyPhoto') || 'Property Photo')}
                  hoverBorderColor="hover:border-blue-500"
                  badgeText={expandedCategory !== 'property' && propertyRemainingImages.length > 0 ? `+${propertyRemainingImages.length} More` : undefined}
                  onClick={() => openDrawer(propertyPhotoCategory ? categories.indexOf(propertyPhotoCategory) : 0, 0)}
                  onMouseEnter={() => handleImageHover(propertyPhoto?.fullSrc || propertyPhoto?.src || '', propertyPhoto?.title || (t('media.propertyPhoto') || 'Property Photo'))}
                  onMouseLeave={handleImageLeave}
                  hasPhoto={propertyPhoto?.hasPhoto}
                >
                  {propertyRemainingImages.length > 0 && (
                    <Button
                      variant="edit"
                      size="xs"
                      className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCategory((p) => (p === 'property' ? null : 'property'));
                      }}
                      aria-label={expandedCategory === 'property' ? 'Hide more images' : 'View more images'}
                    >
                      {expandedCategory === 'property' ? <X className="w-3.5 h-3.5 cursor-pointer" /> : <Images className="w-3.5 h-3.5 cursor-pointer" />}
                    </Button>
                  )}
                </MediaImageCard>

                {expandedCategory === 'property' && (
                  <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
                    <AdditionalImagesGrid
                      images={propertyRemainingImages}
                      onImageClick={(index: number) => {
                        const clickedImg = propertyRemainingImages[index];
                        const catIdx = categories.findIndex((c) => c.photoTypeId === clickedImg.photoTypeId);
                        const targetCategory = categories[catIdx];
                        const imgIdx = targetCategory ? targetCategory.images.findIndex((img) => img.propertyPhotoId === clickedImg.propertyPhotoId) : 0;
                        openDrawer(catIdx >= 0 ? catIdx : 0, imgIdx >= 0 ? imgIdx : 0);
                      }}
                      onImageHover={handleImageHover}
                      onImageLeave={handleImageLeave}
                    />
                  </div>
                )}
              </>
            )}
          </>
        ) : isWing ? (
          <>
            {/* Society Photo Card */}
            <MediaImageCard
              src={societyPhoto?.src || ''}
              documentGuid={societyPhoto?.documentGuid}
              fullSrc={societyPhoto?.fullSrc || ''}
              alt={societyPhoto?.alt || (t('media.societyPhoto') || 'Society Photo')}
              label={societyPhoto?.title || (t('media.societyPhoto') || 'Society Photo')}
              hoverBorderColor="hover:border-blue-500"
              badgeText={expandedCategory !== 'society' && societyRemainingImages.length > 0 ? `+${societyRemainingImages.length} More` : undefined}
              onClick={() => openDrawer(societyPhotoCategory ? categories.indexOf(societyPhotoCategory) : 0, 0)}
              onMouseEnter={() => handleImageHover(societyPhoto?.fullSrc || societyPhoto?.src || '', societyPhoto?.title || (t('media.societyPhoto') || 'Society Photo'))}
              onMouseLeave={handleImageLeave}
              hasPhoto={societyPhoto?.hasPhoto}
            >
              {societyRemainingImages.length > 0 && (
                <Button
                  variant="edit"
                  size="xs"
                  className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCategory((p) => (p === 'society' ? null : 'society'));
                  }}
                  aria-label={expandedCategory === 'society' ? 'Hide more images' : 'View more images'}
                >
                  {expandedCategory === 'society' ? <X className="w-3.5 h-3.5 cursor-pointer" /> : <Images className="w-3.5 h-3.5 cursor-pointer" />}
                </Button>
              )}
            </MediaImageCard>

            {expandedCategory === 'society' && (
              <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
                <AdditionalImagesGrid
                  images={societyRemainingImages}
                  onImageClick={(index: number) => {
                    const clickedImg = societyRemainingImages[index];
                    const catIdx = categories.findIndex((c) => c.photoTypeId === clickedImg.photoTypeId);
                    const targetCategory = categories[catIdx];
                    const imgIdx = targetCategory ? targetCategory.images.findIndex((img) => img.propertyPhotoId === clickedImg.propertyPhotoId) : 0;
                    openDrawer(catIdx >= 0 ? catIdx : 0, imgIdx >= 0 ? imgIdx : 0);
                  }}
                  onImageHover={handleImageHover}
                  onImageLeave={handleImageLeave}
                />
              </div>
            )}

            <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />

            {/* Wing Photo Card */}
            <MediaImageCard
              src={wingPhoto?.src || ''}
              documentGuid={wingPhoto?.documentGuid}
              fullSrc={wingPhoto?.fullSrc || ''}
              alt={wingPhoto?.alt || (t('media.wingPhoto') || 'Wing Photo')}
              label={wingPhoto?.title || (t('media.wingPhoto') || 'Wing Photo')}
              hoverBorderColor="hover:border-blue-500"
              badgeText={expandedCategory !== 'wing' && wingRemainingImages.length > 0 ? `+${wingRemainingImages.length} More` : undefined}
              onClick={() => openDrawer(wingPhotoCategory ? categories.indexOf(wingPhotoCategory) : 0, 0)}
              onMouseEnter={() => handleImageHover(wingPhoto?.fullSrc || wingPhoto?.src || '', wingPhoto?.title || (t('media.wingPhoto') || 'Wing Photo'))}
              onMouseLeave={handleImageLeave}
              hasPhoto={wingPhoto?.hasPhoto}
            >
              {wingRemainingImages.length > 0 && (
                <Button
                  variant="edit"
                  size="xs"
                  className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCategory((p) => (p === 'wing' ? null : 'wing'));
                  }}
                  aria-label={expandedCategory === 'wing' ? 'Hide more images' : 'View more images'}
                >
                  {expandedCategory === 'wing' ? <X className="w-3.5 h-3.5 cursor-pointer" /> : <Images className="w-3.5 h-3.5 cursor-pointer" />}
                </Button>
              )}
            </MediaImageCard>

            {expandedCategory === 'wing' && (
              <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
                <AdditionalImagesGrid
                  images={wingRemainingImages}
                  onImageClick={(index: number) => {
                    const clickedImg = wingRemainingImages[index];
                    const catIdx = categories.findIndex((c) => c.photoTypeId === clickedImg.photoTypeId);
                    const targetCategory = categories[catIdx];
                    const imgIdx = targetCategory ? targetCategory.images.findIndex((img) => img.propertyPhotoId === clickedImg.propertyPhotoId) : 0;
                    openDrawer(catIdx >= 0 ? catIdx : 0, imgIdx >= 0 ? imgIdx : 0);
                  }}
                  onImageHover={handleImageHover}
                  onImageLeave={handleImageLeave}
                />
              </div>
            )}
          </>
        ) : !isAmenityProperty ? (
          <>
            {/* Standard Single Photo Card */}
            <MediaImageCard
              src={(isSociety ? societyPhoto : propertyPhoto)?.src || ''}
              documentGuid={(isSociety ? societyPhoto : propertyPhoto)?.documentGuid}
              fullSrc={(isSociety ? societyPhoto : propertyPhoto)?.fullSrc || ''}
              alt={(isSociety ? societyPhoto : propertyPhoto)?.alt || mainCardLabel}
              label={(isSociety ? societyPhoto : propertyPhoto)?.title || mainCardLabel}
              hoverBorderColor="hover:border-blue-500"
              badgeText={expandedCategory !== 'property' && propertyRemainingImages.length > 0 ? `+${propertyRemainingImages.length} More` : undefined}
              onClick={() => openDrawer((isSociety ? societyPhotoCategory : propertyPhotoCategory) ? categories.indexOf((isSociety ? societyPhotoCategory : propertyPhotoCategory)!) : 0, 0)}
              onMouseEnter={() => handleImageHover((isSociety ? societyPhoto : propertyPhoto)?.fullSrc || (isSociety ? societyPhoto : propertyPhoto)?.src || '', (isSociety ? societyPhoto : propertyPhoto)?.title || mainCardLabel)}
              onMouseLeave={handleImageLeave}
              hasPhoto={(isSociety ? societyPhoto : propertyPhoto)?.hasPhoto}
            >
              {propertyRemainingImages.length > 0 && (
                <Button
                  variant="edit"
                  size="xs"
                  className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCategory((p) => (p === 'property' ? null : 'property'));
                  }}
                  aria-label={expandedCategory === 'property' ? 'Hide more images' : 'View more images'}
                >
                  {expandedCategory === 'property' ? <X className="w-3.5 h-3.5 cursor-pointer" /> : <Images className="w-3.5 h-3.5 cursor-pointer" />}
                </Button>
              )}
            </MediaImageCard>

            {expandedCategory === 'property' && (
              <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
                <AdditionalImagesGrid
                  images={propertyRemainingImages}
                  onImageClick={(index: number) => {
                    const clickedImg = propertyRemainingImages[index];
                    const catIdx = categories.findIndex((c) => c.photoTypeId === clickedImg.photoTypeId);
                    const targetCategory = categories[catIdx];
                    const imgIdx = targetCategory ? targetCategory.images.findIndex((img) => img.propertyPhotoId === clickedImg.propertyPhotoId) : 0;
                    openDrawer(catIdx >= 0 ? catIdx : 0, imgIdx >= 0 ? imgIdx : 0);
                  }}
                  onImageHover={handleImageHover}
                  onImageLeave={handleImageLeave}
                />
              </div>
            )}
          </>
        ) : null}

        {!isMainProperty && (
          <>
            <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
            <MediaImageCard
              src={photoPlanPhoto?.src || ''}
              fullSrc={photoPlanPhoto?.fullSrc || ''}
              alt={photoPlanPhoto?.alt || t('media.photoPlan')}
              label={photoPlanPhoto?.title || t('media.photoPlan')}
              hoverBorderColor="hover:border-purple-500"
              onClick={() => openDrawer(photoPlanCategory ? categories.indexOf(photoPlanCategory) : 0, 0)}
              onMouseEnter={() => handleImageHover(photoPlanPhoto?.fullSrc || photoPlanPhoto?.src || '', photoPlanPhoto?.title || t('media.photoPlan'))}
              onMouseLeave={handleImageLeave}
              hasPhoto={photoPlanPhoto?.hasPhoto}
            >
              <Button
                variant="edit"
                size="xs"
                className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
                onClick={handleCreateClick}
                aria-label="Create new plan"
              >
                <Plus className="w-3.5 h-3.5 cursor-pointer" />
              </Button>
            </MediaImageCard>
          </>
        )}

        {isAmenityProperty && (
          <>
            <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
            <MediaImageCard
              src={amenityPhoto?.src || ''}
              fullSrc={amenityPhoto?.fullSrc || ''}
              alt={amenityPhoto?.alt || t('media.amenityPhoto') || 'Amenity Photo'}
              label={amenityPhoto?.title || t('media.amenityPhoto') || 'Amenity Photo'}
              hoverBorderColor="hover:border-emerald-500"
              onClick={() => openDrawer(amenityPhotoCategory ? categories.indexOf(amenityPhotoCategory) : 0, 0)}
              onMouseEnter={() => handleImageHover(amenityPhoto?.fullSrc || amenityPhoto?.src || '', amenityPhoto?.title || t('media.amenityPhoto') || 'Amenity Photo')}
              onMouseLeave={handleImageLeave}
              hasPhoto={amenityPhoto?.hasPhoto}
            />
          </>
        )}

        <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
        <GisMapCard
          image={gisPhoto}
          hasCoords={hasCoords}
          onClick={() => {
            const idx = cdCategory ? categories.indexOf(cdCategory) : -1;
            openDrawer(idx >= 0 ? idx : 0);
          }}
          onMouseEnter={() => handleImageHover(gisPhoto?.fullSrc || gisPhoto?.src || '', gisPhoto?.title || t('media.satelliteView') || 'Satellite View')}
          onMouseLeave={handleImageLeave}
        />

        <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
        <ChangeDetectionCard
          beforeImageSrc={cdBeforeImg}
          afterImageSrc={cdAfterImg}
          beforeLabel={cdBeforeLabel}
          afterLabel={cdAfterLabel}
          fallbackBeforeSrc={fallbackBeforeUrl}
          fallbackAfterSrc={fallbackAfterUrl}
          onMouseEnter={() => {
            handleImageHover(cdBeforeImg, t('media.changeDetection') || 'Change Detection', cdAfterImg, cdBeforeLabel, cdAfterLabel, fallbackBeforeUrl, fallbackAfterUrl);
          }}
          onMouseLeave={handleImageLeave}
          onClick={() => {
            const changeDetectionIndex = cdCategory ? categories.indexOf(cdCategory) : -1;
            openDrawer(changeDetectionIndex >= 0 ? changeDetectionIndex : 0);
          }}
        />
      </div>
    </>
  );
}
