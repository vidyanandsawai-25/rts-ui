'use client';

import React from 'react';
import { PropertyMediaPanel } from './media';
import { MediaPanelToggle } from './MediaPanelToggle';
import { MediaPanelProvider, useMediaPanel } from '@/hooks/ptis/photoplan/useMediaPanelVisibility';
import { usePropertyPhotosQuery } from '@/hooks/ptis/photoplan/usePropertyPhotosQuery';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import type { WaybackRelease } from '@/lib/api/wayback.service';

interface PtisLayoutWrapperProps {
  children: React.ReactNode;
  wardNo?: string;
  propertyNo?: string;
  partitionNo?: string;
  propertyHolderName?: string;
  propertyHolderNameMarathi?: string;
  isQCApproved?: boolean;
  propertyId?: number;
  initialPhotoSlots?: PropertyPhotoTypeWithStatusDto[];
  initialPhotos?: PropertyPhotoDto[];
  initialMediaPanelVisible?: boolean;
  initialLatitude?: number;
  initialLongitude?: number;
  initialWaybackReleases?: WaybackRelease[];
}

function PtisLayoutWrapperContent({
  children,
  wardNo,
  propertyNo,
  partitionNo,
  propertyHolderName,
  propertyHolderNameMarathi,
  isQCApproved,
  propertyId,
  initialPhotoSlots = [],
  initialPhotos = [],
  initialLatitude,
  initialLongitude,
  initialWaybackReleases = [],
}: Omit<PtisLayoutWrapperProps, 'initialMediaPanelVisible'>) {
  const { isPanelVisible } = useMediaPanel();
  const { loading, photoSlots, photos, setPhotoSlots, setPhotos } = usePropertyPhotosQuery(
    propertyId,
    isPanelVisible,
    initialPhotoSlots,
    initialPhotos
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full items-start overflow-x-clip relative">
      <MediaPanelToggle />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 w-full transition-all duration-500 ease-in-out">
        {children}
      </div>

      {/* Sidebar Container with smooth width & opacity transition */}
      <div
        className={`transition-all duration-500 ease-in-out z-30 lg:sticky lg:top-[92px] lg:self-start lg:h-[calc(100vh-152px)] lg:shrink-0 ${
          isPanelVisible
            ? 'w-full lg:w-[208px] opacity-100 translate-x-0'
            : 'w-0 lg:w-0 opacity-0 lg:translate-x-full pointer-events-none overflow-hidden'
        }`}
      >
        {/* Inner wrapper to lock the width and prevent child content squeezing during transition */}
        <div className="w-full lg:w-[208px] lg:h-full">
          <PropertyMediaPanel
            wardNo={wardNo}
            propertyNo={propertyNo}
            partitionNo={partitionNo}
            propertyHolderName={propertyHolderName}
            propertyHolderNameMarathi={propertyHolderNameMarathi}
            isQCApproved={isQCApproved}
            propertyId={propertyId}
            initialPhotoSlots={photoSlots}
            initialPhotos={photos}
            loading={loading}
            initialLatitude={initialLatitude}
            initialLongitude={initialLongitude}
            initialWaybackReleases={initialWaybackReleases}
            onPhotosChange={setPhotos}
            onPhotoSlotsChange={setPhotoSlots}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps the PTIS screen with a sticky PropertyMediaPanel on the right.
 * Supports toggling side-panel visibility with smooth slide/fade transitions
 * and state persistence via SSR-friendly cookies.
 */
export function PtisLayoutWrapper(props: PtisLayoutWrapperProps): React.ReactElement {
  React.useEffect(() => {
    document.documentElement.classList.add('ptis-no-scroll');
    document.body.classList.add('ptis-no-scroll');
    return () => {
      document.documentElement.classList.remove('ptis-no-scroll');
      document.body.classList.remove('ptis-no-scroll');
    };
  }, []);

  React.useEffect(() => {
    // Avoid unregistering service workers in production unless explicitly intended.
    if (process.env.NODE_ENV !== 'development') return;
    if (!('serviceWorker' in navigator)) return;

    // Check opt-in flags (query param ?clearSW=true or localStorage)
    const urlParams = new URLSearchParams(window.location.search);
    const shouldClear = urlParams.get('clearSW') === 'true' || localStorage.getItem('clear-sw-dev') === 'true';
    if (!shouldClear) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.allSettled(registrations.map((r) => r.unregister())))
      .catch(() => {});
  }, []);

  return (
    <MediaPanelProvider initialVisible={props.initialMediaPanelVisible ?? false}>
      <PtisLayoutWrapperContent {...props} />
    </MediaPanelProvider>
  );
}
