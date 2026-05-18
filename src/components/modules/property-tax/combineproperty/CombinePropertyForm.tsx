'use client';

import { useMemo } from 'react';
import { Merge, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { SearchSelect, type SearchSelectOption } from '@/components/common/SearchSelect';
import { MultiSelectDropdown } from '@/components/common/Dropdown';
import { Tabs, TabList, Tab } from '@/components/common/Tabs';
import { CancelButton, AddButton } from '@/components/common/ActionButtons';
import { MasterTable } from '@/components/common/MasterTable';
import { CombinePropertyItem } from '@/types/combine-property.types';
import { useCombinePropertyForm, SelectionMethod } from '@/hooks/combineProperty/useCombineProperty';
import { getCombinePropertyColumns, PropertyRow } from './combinePropertyColumns';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface CombinePropertyFormProps {
  basePropertyList: CombinePropertyItem[];
  subPropertyList: CombinePropertyItem[];
  selectedBasePropertyId?: string;
  selectedWardId?: string;
  selectedPropertyNo?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toSelectOption(item: CombinePropertyItem): SearchSelectOption {
  const label = `${item.fromProperty}${item.toProperty && item.toProperty !== item.fromProperty ? ' – ' + item.toProperty : ''}`;
  return { label, value: String(item.id) };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function CombinePropertyForm({
  basePropertyList,
  subPropertyList,
  selectedBasePropertyId,
  selectedWardId,
  selectedPropertyNo,
}: CombinePropertyFormProps) {
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
    hasDifferentOwners,
    differentOwnerProps,
    handleBasePropertyChange,
    handleMethodChange,
    handleRangeFromChange,
    handleRangeToChange,
    handleIndividualChange,
    handleClear,
    handleProceed,
    handleCombine,
    router,
  } = useCombinePropertyForm({
    basePropertyList,
    subPropertyList,
    selectedBasePropertyId,
    selectedWardId,
    selectedPropertyNo,
    t,
  });

  /* ---- Table Columns (Memoized) ---- */
  const columns = useMemo(() => getCombinePropertyColumns(t, reviewData), [reviewData, t]);

  /* ---- Options ---- */
  const BASE_PROPERTY_OPTIONS = useMemo<SearchSelectOption[]>(() => {
    return (basePropertyList || []).map((item) => ({
      label: `${item.wardNo ||  ''} / ${item.propertyNo || ''}/ ${item.fromProperty || ''}`,
      value: String(item.id || ''),
      meta: { wardId: item.wardId, wardNo: item.wardNo, propertyNo: item.propertyNo },
    }));
  }, [basePropertyList]);

  const SUB_PROPERTY_OPTIONS = useMemo<SearchSelectOption[]>(() => {
    return (subPropertyList || []).map(toSelectOption);
  }, [subPropertyList]);

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
          {selectedPropertyNo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700">
              {selectedPropertyNo}
            </span>
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
        <CancelButton label={`← ${t('clear')}`} onClick={handleClear} size="sm" />
        {isReviewing && reviewData.length > 0 && (
          <AddButton
            label={isSubmitting ? t('combining') : t('combine')}
            size="sm"
            disabled={hasDifferentOwners || isSubmitting}
            onClick={handleCombine}
          />
        )}
      </div>
    </div>
  );

  /* ============================================================
     EMPTY STATE
  ============================================================ */
  const emptyStateContent = (
    <div className="flex flex-col items-center justify-center min-h-[380px] text-center gap-4 select-none">
      <div className="w-[72px] h-[72px] rounded-full bg-blue-50 flex items-center justify-center">
        <FileText className="w-9 h-9 text-blue-200" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-gray-700">{t('noPropertiesSelected')}</p>
        <p className="text-sm text-gray-400 mt-1.5 max-w-[320px] leading-relaxed">
          {t('emptyStateSubtitle')}
        </p>
      </div>
    </div>
  );

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <Drawer
      open={true}
      onClose={() => router.back()}
      title={DrawerTitle}
      width="lg"
      footer={DrawerFooter}
    >
      {/* ===================================================
          FILTER BAR
      =================================================== */}
      <div className="flex items-end gap-2 px-3 py-2 bg-[#EFF4FF] border-b border-blue-100">

        {/* ---- Base Property ---- */}
        <div className="flex flex-col gap-0.5 w-[160px] shrink-0">
          <label htmlFor="baseProperty" className="text-[10px] font-semibold text-gray-600 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-600 text-white text-[8px] font-bold rounded-[3px]">B</span>
            {t('baseProperty')} <span className="text-red-500">*</span>
          </label>
          <SearchSelect
            id="baseProperty"
            name="baseProperty"
            options={BASE_PROPERTY_OPTIONS}
            value={selectedBasePropertyId ?? ''}
            onChange={handleBasePropertyChange}
            placeholder={t('select')}
            required
            className="text-[11px] h-[28px]"
          />
        </div>

        {/* ---- Divider ---- */}
        <div className="h-5 w-px bg-blue-200 self-center shrink-0" />

        {/* ---- Selection Method pill toggle ---- */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <label className="text-[10px] font-semibold text-gray-600">{t('selectionMethod')}</label>
          <Tabs
            value={selectionMethod}
            onChange={(value) => handleMethodChange(value as SelectionMethod)}
            variant="pills"
            size="sm"
          >
            <TabList className="h-[28px] p-0.5 bg-gray-100 rounded-md" scrollable={false}>
              <Tab value="range" className="text-[11px] px-2.5 py-0">
                {t('range')}
              </Tab>
              <Tab value="individual" className="text-[11px] px-2.5 py-0">
                {t('individual')}
              </Tab>
            </TabList>
          </Tabs>
        </div>

        {/* ---- Conditional: Range fields ---- */}
        {selectionMethod === 'range' && (
          <>
            <div className="flex flex-col gap-0.5 w-[120px] shrink-0">
              <label htmlFor="rangeFrom" className="text-[10px] font-semibold text-gray-600">
                {t('from')} <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                id="rangeFrom"
                name="rangeFrom"
                options={SUB_PROPERTY_OPTIONS}
                value={rangeFrom}
                onChange={handleRangeFromChange}
                placeholder={t('selectStart')}
                required
                className="text-[11px] h-[28px]"
              />
            </div>
            <div className="flex flex-col gap-0.5 w-[120px] shrink-0">
              <label htmlFor="rangeTo" className="text-[10px] font-semibold text-gray-600">
                {t('to')} <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                id="rangeTo"
                name="rangeTo"
                options={SUB_PROPERTY_OPTIONS}
                value={rangeTo}
                onChange={handleRangeToChange}
                placeholder={t('selectEnd')}
                required
                className="text-[11px] h-[28px]"
              />
            </div>
          </>
        )}

        {/* ---- Conditional: Individual multi-select ---- */}
        {selectionMethod === 'individual' && (
          <div className="flex flex-col gap-0.5 w-[200px] shrink-0">
            <label
              id="selectedPropertiesLabel"
              htmlFor="selectedProperties"
              className="text-[10px] font-semibold text-gray-600"
            >
              {t('selectProperties')} <span className="text-red-500">*</span>
            </label>
            <MultiSelectDropdown
              id="selectedProperties"
              aria-labelledby="selectedPropertiesLabel"
              options={SUB_PROPERTY_OPTIONS}
              value={selectedProperties}
              onChange={handleIndividualChange}
              placeholder={t('selectPropertiesPlaceholder')}
              className="text-[11px] text-gray-500"
              styles={{ trigger: 'h-[28px] py-0 px-2 rounded-md border-blue-200 shadow-none' }}
            />
          </div>
        )}

        {/* ---- Action buttons ---- */}
        <div className="flex items-end gap-2 shrink-0 ml-auto">
          <CancelButton label={t('clear')} onClick={handleClear} size="sm" />
          <AddButton
            label={isPending ? t('loadingButton') : t('proceed', { count: selectedCount })}
            size="sm"
            disabled={!canProceed || isPending}
            onClick={handleProceed}
          />
        </div>
      </div>

      {/* ===================================================
          BODY
      =================================================== */}
      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Empty state */}
        {!isReviewing && !selectedBasePropertyId && emptyStateContent}

        {/* Review header + warning */}
        {isReviewing && reviewData.length > 0 && (
          <>
            {/* Review combination banner */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">{t('reviewCombination')}</p>
                <p className="text-[12px] text-blue-600 mt-0.5">
                  {t('primaryProperty')}{' '}
                  <span className="font-bold">{selectedPropertyNo}</span> {t('willBeCombinedWith')}{' '}
                  <span className="font-bold text-blue-700">{reviewData.length} {t('properties')}</span>
                </p>
              </div>
            </div>

            {/* Owner mismatch warning */}
            {hasDifferentOwners && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border-l-4 border-red-400">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-red-700">{t('warningDifferentOwners')}</p>
                  {differentOwnerProps && (
                    <p className="text-[11px] text-red-600 mt-0.5">• {differentOwnerProps}</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Review table */}
        {isReviewing && (
          <MasterTable<PropertyRow>
            columns={columns}
            data={reviewData as PropertyRow[]}
            loading={isPending}
            paginationConfig={{ enabled: false }}
            height="md"
            getRowKey={(row, i) => `row-${row.propertyId || 0}-${i}`}
            emptyText={t('emptyTableText')}
          />
        )}
      </div>
    </Drawer>
  );
}