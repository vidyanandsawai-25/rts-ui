'use client';

import React from 'react';
import { ChangeDetectionHeader } from './ChangeDetectionHeader';
import type { PhotoCategory } from './PhotoPlanSidebar';
import { ChangeTimelapse } from './ChangeTimelapse';

import type { AdditionalImage } from './MediaImageCards';

import type { WaybackRelease } from '@/lib/api/wayback.service';

interface ChangeDetectionCompareProps {
  activeCategory: PhotoCategory;
  onBackToGrid: () => void;
  onImagesChange?: (newImages: AdditionalImage[]) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialWaybackReleases?: WaybackRelease[];
  propertyId?: number;
}

export function ChangeDetectionCompare({
  activeCategory,
  onBackToGrid,
  onImagesChange: _onImagesChange,
  initialLatitude,
  initialLongitude,
  initialWaybackReleases,
  propertyId,
}: ChangeDetectionCompareProps): React.ReactElement {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 select-none relative">
      <ChangeDetectionHeader
        photoTypeName={activeCategory.photoTypeName}
        onBackToGrid={onBackToGrid}
      />

      {/* Main Image Compare Container - uses full height and width */}
      <div className="flex-1 w-full h-full overflow-hidden p-0 relative">
        <ChangeTimelapse
          initialLat={initialLatitude}
          initialLng={initialLongitude}
          initialWaybackReleases={initialWaybackReleases}
          propertyId={propertyId}
        />
      </div>
    </div>
  );
}
