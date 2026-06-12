import React from 'react';
import { PropertyMediaPanel } from './media';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';

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
}

/**
 * Wraps the PTIS screen with a sticky PropertyMediaPanel on the right.
 */
export function PtisLayoutWrapper({
  children,
  wardNo,
  propertyNo,
  partitionNo,
  propertyHolderName,
  propertyHolderNameMarathi,
  isQCApproved,
  propertyId,
  initialPhotoSlots,
  initialPhotos,
}: PtisLayoutWrapperProps): React.ReactElement {
  return (
    <div className="relative flex flex-col lg:flex-row gap-4 w-full">
      <div className="flex-1 min-w-0 w-full">{children}</div>

      <div className="w-full lg:sticky lg:top-[92px] lg:w-[208px] lg:h-[calc(100vh-152px)] z-30 lg:shrink-0">
        <PropertyMediaPanel
          wardNo={wardNo}
          propertyNo={propertyNo}
          partitionNo={partitionNo}
          propertyHolderName={propertyHolderName}
          propertyHolderNameMarathi={propertyHolderNameMarathi}
          isQCApproved={isQCApproved}
          propertyId={propertyId}
          initialPhotoSlots={initialPhotoSlots}
          initialPhotos={initialPhotos}
        />
      </div>
    </div>
  );
}
