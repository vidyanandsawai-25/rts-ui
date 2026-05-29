'use client';

import { useMemo } from 'react';
import { Merge } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { type SearchSelectOption } from '@/components/common/SearchSelect';
import { CancelButton, AddButton } from '@/components/common/ActionButtons';
import { CombinePropertyItem } from '@/types/combine-property.types';
import { useCombinePropertyForm } from '@/hooks/combineProperty/useCombineProperty';
import { getCombinePropertyColumns, PropertyRow } from './combinePropertyColumns';
import { useRouter } from 'next/navigation';
import { PropertyType } from '@/types/property-type.types';
import { CombinePropertyFilterBar } from './CombinePropertyFilterBar';
import { CombinePropertyReviewSection } from './CombinePropertyReviewSection';
import { StatusBadge } from '@/components/common/StatusBadge';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface CombinePropertyFormProps {
  basePropertyList: CombinePropertyItem[];
  subPropertyList: CombinePropertyItem[];
  propertyTypeList: PropertyType[];
  selectedBasePropertyId?: string;
  selectedWardId?: string;
  selectedWardNo?: string;
  selectedPropertyNo?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toSelectOption(item: CombinePropertyItem): SearchSelectOption {
  let label = item.propertyNo;
  if (item.fromProperty) {
    label += `-${item.fromProperty}`;
    if (item.toProperty && item.toProperty !== item.fromProperty) {
      label += ` – ${item.toProperty}`;
    }
  } else if (item.toProperty) {
    label += `-${item.toProperty}`;
  }
  return { label, value: String(item.id) };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function CombinePropertyForm(props: CombinePropertyFormProps) {
  const {
    basePropertyList,
    subPropertyList,
    propertyTypeList,
    selectedBasePropertyId,
    selectedWardId,
    selectedWardNo,
    selectedPropertyNo,
  } = props;
  const router = useRouter();
  const t = useTranslations('combineProperty');

  const {
    reviewData,
    isReviewing,
    isPending,
    isSubmitting,
    rangeFrom,
    rangeTo,
    selectedProperties,
    selectionMethod,
    selectedCount,
    canProceed,
    checkedPropertyIds,
    checkedCount,
    hasDifferentOwners,
    differentOwnerProps,
    remark,
    remarkError,
    selectedPropertyType,
    showPropertyTypeDropdown,
    setSelectedPropertyType,
    setRemark,
    togglePropertyCheck,
    toggleAllProperties,
    handleBasePropertyChange,
    handleMethodChange,
    handleRangeFromChange,
    handleRangeToChange,
    handleIndividualChange,
    handleClear,
    handleProceed,
    handleCombine,
  } = useCombinePropertyForm({
    basePropertyList,
    subPropertyList,
    selectedBasePropertyId,
    selectedWardId,
    selectedPropertyNo,
    t,
  });

  /* ---- Table Columns (Memoized) ---- */
  const columns = useMemo(
    () => getCombinePropertyColumns(t, reviewData, checkedPropertyIds, togglePropertyCheck, toggleAllProperties),
    [reviewData, t, checkedPropertyIds, togglePropertyCheck, toggleAllProperties]
  );

  /* ---- Options ---- */
  const BASE_PROPERTY_OPTIONS = useMemo<SearchSelectOption[]>(() => {
    return (basePropertyList || []).map((item) => ({
      // label: `${item.wardNo || ''}`,
      label: `${item.wardNo || ''} - ${item.propertyNo || ''}${item.fromProperty ? ' - ' + item.fromProperty : ''}`,
      value: String(item.id || ''),
      meta: { wardId: item.wardId, wardNo: item.wardNo, propertyNo: item.propertyNo },
    }));
  }, [basePropertyList]);

  const SUB_PROPERTY_OPTIONS = useMemo<SearchSelectOption[]>(() => {
    return (subPropertyList || []).map(toSelectOption);
  }, [subPropertyList]);

  const PROPERTY_TYPE_OPTIONS = useMemo<SearchSelectOption[]>(() => {
    return (propertyTypeList || []).map((item) => ({
      label: item.propertyDescription,
      value: String(item.id),
    }));
  }, [propertyTypeList]);

  /* ============================================================
     DRAWER HEADER
  ============================================================ */
  const DrawerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0 shadow-sm">
        <Merge className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h2 id="drawer-title" className="text-sm font-bold text-gray-900 leading-tight">
            {t('title')}
          </h2>
          {selectedWardNo && (
            // eslint-disable-next-line i18next/no-literal-string
            <StatusBadge variant="info" label={`Ward: ${selectedWardNo}`} className="px-2 py-0.5 text-[10px] rounded-full shadow-none" />
          )}
          {selectedPropertyNo && (
            // eslint-disable-next-line i18next/no-literal-string
            <StatusBadge variant="info" label={`Property: ${selectedPropertyNo}`} className="px-2 py-0.5 text-[10px] rounded-full shadow-none" />
          )}
        </div>
        <p className="text-[11px] text-gray-500 leading-tight">
          {t('subtitle')}
        </p>
      </div>
    </div>
  );

  /* ============================================================
     DRAWER FOOTER
  ============================================================ */
  const DrawerFooter = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {/* Status messages handled by toast */}
      </div>
      <div className="flex items-center gap-2">
        <CancelButton label={`${t('clear')}`} onClick={handleClear} size="sm" />
        {isReviewing && reviewData.length > 0 && (
          <AddButton
            label={isSubmitting ? t('combining') : t('combine')}
            size="sm"
            disabled={isSubmitting || checkedCount === 0}
            onClick={handleCombine}
          />
        )}
      </div>
    </div>
  );

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <Drawer
      open={true}
      onClose={() => router.push('/property-tax/ptis')}
      title={DrawerTitle}
      width="xl"
      footer={DrawerFooter}
    >
      <CombinePropertyFilterBar
        t={t as unknown as (key: string, values?: Record<string, string | number>) => string}
        basePropertyOptions={BASE_PROPERTY_OPTIONS}
        subPropertyOptions={SUB_PROPERTY_OPTIONS}
        propertyTypeOptions={PROPERTY_TYPE_OPTIONS}
        selectedBasePropertyId={selectedBasePropertyId}
        selectionMethod={selectionMethod}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
        selectedProperties={selectedProperties}
        selectedPropertyType={selectedPropertyType}
        showPropertyTypeDropdown={showPropertyTypeDropdown}
        selectedCount={selectedCount}
        canProceed={canProceed}
        isPending={isPending}
        handleBasePropertyChange={handleBasePropertyChange}
        handleMethodChange={handleMethodChange}
        handleRangeFromChange={handleRangeFromChange}
        handleRangeToChange={handleRangeToChange}
        handleIndividualChange={handleIndividualChange}
        setSelectedPropertyType={setSelectedPropertyType}
        handleClear={handleClear}
        handleProceed={handleProceed}
      />

      <CombinePropertyReviewSection
        t={t as unknown as (key: string, values?: Record<string, string | number>) => string}
        isReviewing={isReviewing}
        isPending={isPending}
        isSubmitting={isSubmitting}
        selectedBasePropertyId={selectedBasePropertyId}
        selectedPropertyNo={selectedPropertyNo}
        reviewDataLength={reviewData.length}
        checkedCount={checkedCount}
        hasDifferentOwners={hasDifferentOwners}
        differentOwnerProps={differentOwnerProps}
        columns={columns}
        reviewData={reviewData as PropertyRow[]}
        remark={remark}
        remarkError={remarkError}
        setRemark={setRemark}
      />
    </Drawer>
  );
}