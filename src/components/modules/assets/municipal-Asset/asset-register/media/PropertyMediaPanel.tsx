'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/common';
import { MediaImageCard } from './MediaImageCards';
import { ImageHoverPreview } from './ImageHoverPreview';
import { usePropertyMedia } from '@/hooks/asset/asset-register/useAssetPropertyMedia';
import { AssetMediaPanelProps } from '@/types/asset/asset-register/media.types';

function PropertyMediaPanel({
  initialPhotos = [],
  loading = false,
  alwaysOpen = false,
  togglePanel,
}: AssetMediaPanelProps): React.ReactElement {

  const {
    hoverPreview,
    photoPlanPhoto,
    propertyPhoto,
    handleImageHover,
    handleImageLeave,
    cancelImageLeave,
    t,
  } = usePropertyMedia({ initialPhotos });

  if (loading) {
    return (
      <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 p-2.5 gap-2.5 animate-pulse min-h-[500px]">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 flex-1 min-h-[110px] flex items-center justify-center"
          >
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-auto lg:h-full w-full flex flex-col relative gap-3">
      <ImageHoverPreview
        key={hoverPreview?.src ?? 'empty'}
        src={hoverPreview?.src ?? ''}
        src2={hoverPreview?.src2}
        title={hoverPreview?.title ?? ''}
        visible={hoverPreview !== null}
        onMouseEnter={cancelImageLeave}
        onMouseLeave={handleImageLeave}
      />

      <div className="flex-1 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-3 scrollbar-thin">
        <MediaImageCard
          src={propertyPhoto?.src || ''}
          fullSrc={propertyPhoto?.fullSrc || ''}
          alt={propertyPhoto?.alt || t('media.propertyPhoto')}
          label={propertyPhoto?.title || t('media.propertyPhoto')}
          hoverBorderColor="hover:border-blue-500"
          onMouseEnter={() =>
            handleImageHover(
              propertyPhoto?.fullSrc || propertyPhoto?.src || '',
              propertyPhoto?.title || t('media.propertyPhoto')
            )
          }
          onMouseLeave={handleImageLeave}
        />

        <MediaImageCard
          src={photoPlanPhoto?.src || ''}
          fullSrc={photoPlanPhoto?.fullSrc || ''}
          alt={photoPlanPhoto?.alt || t('media.photoPlan')}
          label={photoPlanPhoto?.title || t('media.photoPlan')}
          hoverBorderColor="hover:border-purple-500"
          onMouseEnter={() =>
            handleImageHover(
              photoPlanPhoto?.fullSrc || photoPlanPhoto?.src || '',
              photoPlanPhoto?.title || t('media.photoPlan')
            )
          }
          onMouseLeave={handleImageLeave}
        />
      </div>

      {!alwaysOpen && (
        <div className="absolute top-1/2 -translate-y-1/2 -left-5 z-50 sm:hidden lg:block">
          <Button
            variant="ghost"
            type="button"
            onClick={togglePanel}
            className="w-10 h-24 flex items-center justify-center bg-transparent p-0 border-none outline-none focus:outline-none cursor-pointer hover:scale-110 active:scale-95 group transition-transform duration-200"
            aria-label="Close panel"
          >
            <ChevronRight className="w-6 h-6 text-[#64748B] group-hover:text-[#2563EB] scale-y-[3.5] scale-x-[1.5] opacity-75 group-hover:opacity-100 animate-pulse group-hover:animate-none transition-all" strokeWidth={2.5} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default React.memo(PropertyMediaPanel);
