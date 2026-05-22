/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, memo } from 'react';
import { Button, ToastContainer } from '@/components/common';
import type { ToastProps } from '@/components/common';
import { X, CheckCircle, ArrowLeft } from 'lucide-react';
import { PropertyDetailsOnRenter } from './PropertyDetailsOnRenter';
import AgreementDetails from './AgreementDetails';
import { RentManagementCard } from './RentManagementCard';
import { SelectedFloorDetails } from './SelectedFloorDetails';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { ActionResult } from '@/types/common.types';
import { useRenterForm } from '@/hooks/ptis/floorSubmission/useRenterForm';
import { RentBreakdownDialog } from './RentBreakdownDialog';
import { calculateRentProgression } from '@/lib/utils/renter-calculations';

export interface RenterDetailsFormProps {
  initialData?: any;
  propertyInfo?: {
    propertyName?: string;
    floorNumber?: string;
    zone?: string;
  };
  wardNo?: string;
  propertyNo?: string;
  partitionNo?: string;
  propertyId?: string;
  floorId?: string;
  onSaveRenter?: (data: any) => void;
  saveAction?: (id: string | number, data: any, locale?: string, propertyId?: string | number) => Promise<ActionResult<any>>;
  floorLookup?: any[];
  constructionLookup?: any[];
  useLookup?: any[];
  subTypeLookup?: any[];
  subFloorLookup?: any[];
}

export const RenterDetailsForm = memo(
  ({
    initialData,
    propertyInfo,
    wardNo,
    propertyNo,
    partitionNo,
    propertyId,
    floorId,
    onSaveRenter,
    saveAction,
    floorLookup,
    constructionLookup,
    useLookup,
    subTypeLookup,
    subFloorLookup,
  }: RenterDetailsFormProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const t = useTranslations('quickDataEntry');

    const { formData, setFormData, isSaving, showSuccessPopup, setShowSuccessPopup, handleSave } =
      useRenterForm({
        initialData,
        floorId: floorId || 'new',
        propertyId,
        locale,
        saveAction,
        onSaveSuccess: (data) => {
          if (onSaveRenter) onSaveRenter(data);

          // Robustly resolve the saved floor ID with numeric validation
          const rawId = data?.propertyDetailsId ?? data?.id;
          const numericId = Number(rawId);
          const savedFloorId = (!isNaN(numericId) && numericId > 0) ? String(numericId) : (floorId || 'new');

          // Resolve params: use props first, then current URL searchParams as fallback
          const resolvedWardNo = wardNo || searchParams.get('wardNo') || '';
          const resolvedPropertyNo = propertyNo || searchParams.get('propertyNo') || '';
          const resolvedPartitionNo = partitionNo || searchParams.get('partitionNo') || '';

          setTimeout(() => {
            setShowSuccessPopup(false);
            const redirectParams = new URLSearchParams();
            if (resolvedWardNo) redirectParams.set('wardNo', resolvedWardNo);
            if (resolvedPropertyNo) redirectParams.set('propertyNo', resolvedPropertyNo);
            if (resolvedPartitionNo) redirectParams.set('partitionNo', resolvedPartitionNo);
            redirectParams.set('floorId', savedFloorId);
            redirectParams.set('drawer', savedFloorId === 'new' ? 'add' : 'edit');
            router.push(
              `/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/FloorSubmission?${redirectParams.toString()}`
            );
            router.refresh();
          }, 1500);
        },
      });

    const [popupFY, setPopupFY] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    // Staggered components
    const [sectionsVisible, setSectionsVisible] = useState(0);
    useEffect(() => {
      setSectionsVisible(1);
      const t1 = setTimeout(() => setSectionsVisible(2), 50);
      const t2 = setTimeout(() => setSectionsVisible(3), 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }, []);

    if (!formData)
      return (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      );

    return (
      <div className="w-full h-full flex flex-col bg-white relative animate-in fade-in duration-300">
        <ToastContainer
          toasts={toasts}
          onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        />

        <div className="relative z-10 flex flex-col px-4 py-3 md:px-5 md:py-4 h-full">
          {/* Combined Header Bar - Single Row */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm -mx-4 md:-mx-5 -mt-3 md:-mt-4 mb-4">
            {/* Left Side: Back Button + Title */}
            <div className="flex items-center gap-4 shrink-0">
              <Button
                variant="secondary"
                onClick={() => router.back()}
                className="w-10 h-10 p-0 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-500 border border-transparent hover:border-blue-100 transition-all font-bold flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Button>
              <div className="flex flex-col border-r border-gray-100 pr-6 mr-2">
                <h1 className="text-lg font-black text-gray-800 uppercase tracking-tighter leading-none">
                  {t('floor.renterSection.management')}
                </h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1.5">
                  {t('floor.renterSection.editFloorLeasingDetails')}
                </p>
              </div>
            </div>

            {/* Right Side: Property Context + Close Button */}
            <div className="flex-1 flex items-center justify-end gap-6 px-4">
              <PropertyDetailsOnRenter propertyInfo={propertyInfo} />

              <div className="h-8 w-px bg-gray-100 ml-2" />

              <Button
                variant="ghost"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (propertyId) params.set('propertyId', propertyId);
                  if (wardNo) params.set('wardNo', wardNo);
                  if (propertyNo) params.set('propertyNo', propertyNo);
                  if (partitionNo) params.set('partitionNo', partitionNo);
                  router.push(`/${locale}/property-tax/ptis?${params}`);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all group p-0"
                title={t('floor.renterSection.closeManagement')}
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>


          <SelectedFloorDetails
            formData={formData}
            floorLookup={floorLookup}
            constructionLookup={constructionLookup}
            useLookup={useLookup}
            subTypeLookup={subTypeLookup}
            subFloorLookup={subFloorLookup}
          />

          <div className="space-y-4 flex-1">
            {sectionsVisible >= 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <AgreementDetails formData={formData} setFormData={setFormData} />
              </div>
            )}
            {sectionsVisible >= 3 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <RentManagementCard formData={formData} setFormData={setFormData} />
              </div>
            ) : (
              <div className="h-32 w-full bg-white/50 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    {t('floor.renterSection.optimizingRentEngine')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="px-6 h-9 rounded-md border-red-200 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:border-red-300 transition-all"
            >
              {t('floor.renterSection.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-md shadow-md shadow-blue-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}{' '}
              {t('floor.renterSection.saveChanges')}
            </Button>
          </div>
        </div>

        {showSuccessPopup && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('floor.renterSection.successfullySaved')}</h2>
              <p className="text-sm text-gray-500">{t('floor.renterSection.renterDetailsUpdated')}</p>
            </div>
          </div>
        )}

        {popupFY && (
          <RentBreakdownDialog 
            isOpen={!!popupFY} 
            onClose={() => setPopupFY(null)} 
            fy={popupFY} 
            progression={calculateRentProgression(formData?.renterDetails)?.progression || []} 
          />
        )}
      </div>
    );
  }
);

RenterDetailsForm.displayName = 'RenterDetailsForm';

export default RenterDetailsForm;
