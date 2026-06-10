'use client';

import React, { useState, useSyncExternalStore } from 'react';
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

const emptySubscribe = (): (() => void) => () => {};

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
  const [sharedLanguage, setSharedLanguage] = useState<'english' | 'marathi'>('english');
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <div className="relative flex gap-4 w-full">
      <div className="flex-1 min-w-0">
        {children}
      </div>

      <div className="sticky top-[92px] w-[208px] h-[calc(100vh-152px)] z-30 shrink-0">
        {mounted && (
          <PropertyMediaPanel
            sharedLanguage={sharedLanguage}
            onLanguageChange={setSharedLanguage}
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
        )}
      </div>
    </div>
  );
}
