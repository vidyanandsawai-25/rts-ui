'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Building2, FileText } from 'lucide-react';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  PropertyMasterRevenueCard,
  PropertyMasterCardSkeleton,
} from '@/components/modules/property-tax/ptis/apartment/apartment-tabSection/components';
import {
  IndividualMasterHeader,
  IndividualMasterDetailsGrid,
} from './components';

export interface IndividualPropertyMasterCardProps {
  data?: IndividualPropertyMasterData;
  onEdit?: () => void;
  propertyId?: number;
  wardNo?: string;
  isLoading?: boolean;
}

export const IndividualPropertyMasterCard: React.FC<IndividualPropertyMasterCardProps> = ({
  data,
  onEdit,
  propertyId,
  wardNo,
  isLoading = false,
}) => {
  const t = useTranslations('individual');
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activePropertyId = propertyId || data?.propertyId;

  const effectiveWardNo = useMemo(() => {
    if (wardNo && wardNo !== '-') return wardNo;
    if (data?.wardNo && data.wardNo !== '-') return data.wardNo;
    return '-';
  }, [wardNo, data?.wardNo]);

  const currentData = useMemo<IndividualPropertyMasterData>(() => {
    const merged: IndividualPropertyMasterData = {
      ...(data || {}),
    };
    if (effectiveWardNo && effectiveWardNo !== '-' && merged.wardNo !== effectiveWardNo) {
      merged.wardNo = effectiveWardNo;
    }
    return merged;
  }, [data, effectiveWardNo]);

  const photoGuid = currentData?.societyBuildingPhotoGuid;
  const imageUrl = currentData?.imageUrl;
  const photoUrl = imageUrl || (photoGuid ? getViewDocumentUrl(photoGuid) : '');

  const rawPropNo = currentData?.propertyNo || '-';
  const displayPropertyNo =
    effectiveWardNo && effectiveWardNo !== '-' && rawPropNo !== '-' && !rawPropNo.startsWith(effectiveWardNo)
      ? `${effectiveWardNo}-${rawPropNo}`
      : rawPropNo;

  const upicId = currentData?.upic || '-';
  const ownerName = currentData?.ownerName || currentData?.owner || currentData?.propertyHolder || '-';

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit();
      return;
    }
    if (!activePropertyId) return;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('propertyId', String(activePropertyId));
    if (effectiveWardNo && effectiveWardNo !== '-') params.set('wardNo', effectiveWardNo);
    params.set('returnTab', 'individual');
    const locale = pathname?.split('/')[1] || 'en';
    router.push(`/${locale}/property-tax/ptis/QuickDataEntry/${activePropertyId}/Property?${params.toString()}`);
  }, [onEdit, activePropertyId, searchParams, effectiveWardNo, pathname, router]);

  if (isLoading) {
    return <PropertyMasterCardSkeleton />;
  }

  return (
    <div className="flex flex-col xl:flex-row items-stretch gap-2 font-sans text-slate-800">
      {/* 1. LEFT / CENTER: MAIN PROPERTY MASTER CARD */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-1.5 pb-2 flex flex-col sm:flex-row items-stretch gap-2 min-w-0">
        {/* Building/Property Photo Thumbnail with Document overlay icon */}
        <div
          className={`relative w-full sm:w-[120px] xl:w-[125px] h-[155px] sm:h-auto rounded-lg overflow-hidden border border-slate-200/80 bg-slate-100 shrink-0 flex items-center justify-center group ${
            photoUrl || photoGuid ? 'cursor-pointer hover:border-blue-400' : ''
          }`}
          onClick={() => {
            if (photoUrl || photoGuid) {
              setIsDocumentViewerOpen(true);
            }
          }}
          title={photoUrl || photoGuid ? (t('photo.viewPhoto') || 'Click to view property photo') : undefined}
        >
          {photoUrl || photoGuid ? (
            <div className="relative w-full h-full">
              <ImageWithFallback
                src={photoUrl}
                documentGuid={photoGuid}
                alt={ownerName !== '-' ? `${ownerName} ${t('photo.propertyPhoto') || 'Property Photo'}` : (t('photo.propertyPhoto') || 'Property Photo')}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {/* Document/Photo Overlay Icon */}
              <div className="absolute inset-0 bg-black/15 flex items-center justify-center pointer-events-none">
                <div className="p-1 rounded-md bg-white/70 backdrop-blur-xs text-slate-800 shadow-xs border border-white/60">
                  <FileText className="w-5 h-5 text-slate-700" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 p-2 text-center bg-slate-50">
              <Building2 className="w-8 h-8 text-slate-300" />
              <span className="text-[10px] font-medium text-slate-400 leading-tight">{t('photo.noPhoto') || 'No Photo'}</span>
            </div>
          )}
        </div>

        {/* Center: Main Metadata & 3 Sections Grid */}
        <div className="flex-1 flex flex-col justify-start gap-1 min-w-0 pt-0 overflow-hidden">
          {/* Top Identifiers Row */}
          <IndividualMasterHeader
            propertyNo={displayPropertyNo}
            upicId={upicId}
            ownerName={ownerName}
            onEdit={handleEdit}
          />

          {/* 3-Section Details Grid */}
          <IndividualMasterDetailsGrid data={currentData} />
        </div>
      </div>

      {/* 2. RIGHT: REVENUE & TAX METRICS PANEL */}
      <PropertyMasterRevenueCard
        performance={currentData?.performance}
        descriptionRegional={currentData?.propertyDescriptionRegional || '-'}
      />

      {/* High-res Document / Photo Viewer Modal */}
      {photoUrl && (
        <DocumentViewerModal
          isOpen={isDocumentViewerOpen}
          onClose={() => setIsDocumentViewerOpen(false)}
          fileUrl={photoUrl}
          fileName={ownerName !== '-' ? `${ownerName} ${t('photo.propertyDocument') || 'Property Document'}` : (t('photo.propertyDocument') || 'Property Document')}
          label={t('photo.propertyPhoto') || 'Property Photo'}
        />
      )}
    </div>
  );
};
