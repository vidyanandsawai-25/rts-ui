/* eslint-disable i18next/no-literal-string */
'use client';

import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import type { PropertyMasterData } from '@/types/property-tax/apartment';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { PropertyMasterHeader } from './components/PropertyMasterHeader';
import { PropertyMasterDetailsGrid } from './components/PropertyMasterDetailsGrid';
import { PropertyMasterRevenueCard } from './components/PropertyMasterRevenueCard';
import { PropertyMasterCardSkeleton } from './components/PropertyMasterCardSkeleton';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PropertyMasterCardProps {
  data?: PropertyMasterData;
  onEdit?: () => void;
  propertyId?: number;
  wardNo?: string;
  isLoading?: boolean;
}

export const PropertyMasterCard: React.FC<PropertyMasterCardProps> = ({
  data,
  onEdit,
  propertyId,
  wardNo,
  isLoading = false,
}) => {
  const [masterData, setMasterData] = useState<PropertyMasterData | undefined>(data);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [photoGuid, setPhotoGuid] = useState<string | undefined>(data?.societyBuildingPhotoGuid);
  const [imageUrl, setImageUrl] = useState<string | undefined>(data?.imageUrl);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activePropertyId = propertyId || data?.propertyId;


  const effectiveWardNo =
    (masterData?.wardNo && masterData.wardNo !== '-')
      ? masterData.wardNo
      : (wardNo && wardNo !== '-')
        ? wardNo
        : (data?.wardNo && data.wardNo !== '-')
          ? data.wardNo
          : '-';

  const currentData: PropertyMasterData = {
    ...(masterData || data || {}),
    wardNo: effectiveWardNo,
    division: masterData?.division || data?.division || '-',
    upic: masterData?.upic || data?.upic || '-',
    plotNo: masterData?.plotNo || data?.plotNo || '-',
    taxZone: masterData?.taxZone || data?.taxZone || '-',
  };
  const rawPropNo = currentData?.propertyNo || '-';
  const displayPropertyNo =
    effectiveWardNo && effectiveWardNo !== '-' && rawPropNo !== '-' && !rawPropNo.startsWith(effectiveWardNo)
      ? `${effectiveWardNo}-${rawPropNo}`
      : rawPropNo;
  const upicId = currentData?.upic || '-';
  const societyName =
    currentData?.societyName || currentData?.ownerName || currentData?.owner || currentData?.propertyHolder || '-';

  const photoUrl = imageUrl || (photoGuid ? getViewDocumentUrl(photoGuid) : '');

  const handleSocietyEdit = () => {
    if (!activePropertyId) return;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('propertyId', String(activePropertyId));
    if (effectiveWardNo && effectiveWardNo !== '-') params.set('wardNo', effectiveWardNo);
    const rawProp = searchParams?.get('propertyNo') || (currentData?.propertyNo !== '-' ? currentData?.propertyNo : null);
    const cleanProp = rawProp && effectiveWardNo !== '-' && rawProp.startsWith(`${effectiveWardNo}-`)
      ? rawProp.slice(effectiveWardNo.length + 1)
      : rawProp;
    if (cleanProp && cleanProp !== '-') params.set('propertyNo', cleanProp);
    params.set('returnTab', 'apartment');
    params.set('hideWing', 'true');
    params.set('fromSocietyEdit', 'true');
    const locale = pathname?.split('/')[1] || 'en';
    router.push(`/${locale}/property-tax/ptis/QuickDataEntry/${activePropertyId}/Society?${params.toString()}`);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMasterData(data);
    setPhotoGuid(data?.societyBuildingPhotoGuid);
    setImageUrl(data?.imageUrl);
  }, [data]);

  useEffect(() => {
    const handleTopSectionUpdated = (e: Event) => {
      const updatedValues = (e as CustomEvent).detail?.updatedValues;
      if (updatedValues) setMasterData((prev) => (prev ? { ...prev, ...updatedValues } : updatedValues));
    };
    window.addEventListener('ptis:apartment-top-section-updated', handleTopSectionUpdated);
    return () => window.removeEventListener('ptis:apartment-top-section-updated', handleTopSectionUpdated);
  }, []);

  useEffect(() => {
    const handleMediaUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      const docGuid = customEvent.detail?.documentGuid;
      const pUrl = customEvent.detail?.photoUrl || customEvent.detail?.viewUrl;
      if (docGuid) {
        setPhotoGuid(docGuid);
        setImageUrl(pUrl || getViewDocumentUrl(docGuid));
      } else if (pUrl) {
        setImageUrl(pUrl);
      }
    };
    window.addEventListener('ptis:sync-thumbnail', handleMediaUpdated);
    window.addEventListener('ptis:media-updated', handleMediaUpdated);
    return () => {
      window.removeEventListener('ptis:sync-thumbnail', handleMediaUpdated);
      window.removeEventListener('ptis:media-updated', handleMediaUpdated);
    };
  }, []);

  if (isLoading) {
    return <PropertyMasterCardSkeleton />;
  }

  return (
    <div className="flex flex-col xl:flex-row items-stretch gap-2 font-sans text-slate-800">
      {/* 1. LEFT / CENTER: MAIN PROPERTY MASTER CARD */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-1.5 pb-2 flex flex-col sm:flex-row items-stretch gap-2 min-w-0">
        {/* Building Photo Thumbnail */}
        <div
          className={`relative w-full sm:w-[120px] xl:w-[125px] h-[155px] sm:h-auto rounded-lg overflow-hidden border border-slate-200/80 bg-slate-100 shrink-0 flex items-center justify-center group ${
            photoUrl || photoGuid ? 'cursor-pointer hover:border-blue-400' : ''
          }`}
          onClick={() => {
            if (photoUrl || photoGuid) {
              setIsDocumentViewerOpen(true);
            }
          }}
          title={photoUrl || photoGuid ? 'Click to view document' : undefined}
        >
          {photoUrl || photoGuid ? (
            <ImageWithFallback
              src={photoUrl}
              documentGuid={photoGuid}
              alt={societyName !== '-' ? `${societyName} Photo` : 'Society Building Photo'}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 p-2 text-center bg-slate-50">
              <Building2 className="w-8 h-8 text-slate-300" />
              <span className="text-[10px] font-medium text-slate-400 leading-tight">No Photo</span>
            </div>
          )}
        </div>

        {/* Center: Main Metadata & 3 Sections */}
        <div className="flex-1 flex flex-col justify-start gap-1 min-w-0 pt-0 overflow-hidden">
          {/* Top Identifiers Row */}
          <PropertyMasterHeader
            propertyNo={displayPropertyNo}
            upicId={upicId}
            societyName={societyName}
            onEdit={() => {
              if (onEdit) {
                onEdit();
              } else {
                handleSocietyEdit();
              }
            }}
          />

          {/* 3-Section Tabular Grid */}
          <PropertyMasterDetailsGrid data={currentData} />
        </div>
      </div>

      {/* 2. RIGHT: REVENUE & TAX METRICS PANEL */}
      <PropertyMasterRevenueCard
        performance={currentData?.performance}
        descriptionRegional={currentData?.propertyDescriptionRegional}
      />

      {/* Document Viewer Modal for high-res photo inspection */}
      {photoUrl && (
        <DocumentViewerModal
          isOpen={isDocumentViewerOpen}
          onClose={() => setIsDocumentViewerOpen(false)}
          fileUrl={photoUrl}
          fileName={societyName !== '-' ? `${societyName} Document` : 'Society Document'}
          label="Society Photo"
        />
      )}
    </div>
  );
};
