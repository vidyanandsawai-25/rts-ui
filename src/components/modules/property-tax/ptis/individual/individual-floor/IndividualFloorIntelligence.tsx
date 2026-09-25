'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { IndividualFloorTopNav, type IndividualFloorTopNavSection } from './IndividualFloorTopNav';
import { IndividualFloorSummaryCards } from './IndividualFloorSummaryCards';
import { RateableTaxTable } from './rateable/components/RateableTaxTable';
import { CapitalTaxTable } from './capital/components/CapitalTaxTable';
import { DualMethodComparisonTable } from './dualmethod/components/ComparisonTable';
import { DualMethodFloorDetails } from './dualmethod/components/DualMethodFloorDetails';
import { PTIS_UI_CLASSES } from '@/components/modules/property-tax/ptis/constants';

import BuildingPermissionTab from '@/components/modules/property-tax/ptis/tabs/BuildingPermissionTab';
import DiscountDataTab from '@/components/modules/property-tax/ptis/tabs/DiscountDataTab';
import IndividualOldDetailsTab from '../old-details/IndividualOldDetailsTab';

import type { RateableValueResponse } from '@/types/rateableValue.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import type { DualMethodResponse } from '@/types/dualMethod.types';
import type {
  BuildingPermissionData,
  DiscountData,
  OldDetailsData,
  OldFloorDetailsData,
  OldTaxesData,
  MappedPropertyItem,
} from '@/types/ptis.types';
import type { PtisTaxMode } from '@/types/property-tax/apartment';
import type { PropertyComparisonResponse } from '@/types/propertyComparison.types';
import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import TaxDetails from '../individual-tax-details/TaxDetails/TaxDetails';
import {
  fetchIndividualRateableValueAction,
  fetchIndividualCapitalValueAction,
  fetchIndividualDualMethodAction,
} from '@/app/[locale]/property-tax/ptis/individual/action';

export interface IndividualFloorIntelligenceProps {
  propertyId?: number | string | null;
  wardNo?: string | null;
  wardId?: number | string | null;
  propertyNo?: string | null;
  partitionNo?: string | null;
  rateableData?: RateableValueResponse | null;
  capitalData?: CapitalValueResponse | null;
  dualMethodData?: DualMethodResponse | null;
  comparisonData?: PropertyComparisonResponse | null;
  rateableTaxDetails?: TaxDetailsData | null;
  capitalTaxDetails?: TaxDetailsData | null;
  buildingPermissionData?: BuildingPermissionData | null;
  discountData?: DiscountData | null;
  oldDetailsData?: OldDetailsData | null;
  oldFloorTableData?: OldFloorDetailsData[] | null;
  oldTaxesData?: OldTaxesData | null;
  mappedPropertiesData?: MappedPropertyItem[] | null;
  taxMode?: PtisTaxMode;
  onTaxModeChange?: (mode: PtisTaxMode) => void;
  isLoading?: boolean;
  locale?: string;
}

const SECTION_TITLES: Record<string, string> = {
  building: 'BUILDING PERMISSION (Certificates & Clearances)',
  discount: 'DISCOUNT & SOCIAL DATA (Discounts & Concessions)',
  oldDetails: 'OLD DETAILS (Mapped Properties / Historical Data)',
};

export const IndividualFloorIntelligence: React.FC<IndividualFloorIntelligenceProps> = ({
  propertyId,
  wardNo,
  wardId,
  propertyNo,
  partitionNo,
  rateableData,
  capitalData,
  dualMethodData,
  comparisonData,
  rateableTaxDetails,
  capitalTaxDetails,
  buildingPermissionData,
  discountData,
  oldDetailsData,
  oldFloorTableData,
  oldTaxesData,
  mappedPropertiesData,
  taxMode = 'rateable',
  onTaxModeChange,
  isLoading = false,
  locale: propLocale,
}) => {
  const t = useTranslations('ptis');
  const contextLocale = useLocale();
  const locale = propLocale || contextLocale || 'en';
  const [activeSection, setActiveSection] = useState<IndividualFloorTopNavSection | null>('floor');
  const [isExpanded, setIsExpanded] = useState(true);
  const [internalTaxMode, setInternalTaxMode] = useState<PtisTaxMode>(taxMode);
  const [prevTaxModeProp, setPrevTaxModeProp] = useState(taxMode);

  if (taxMode !== prevTaxModeProp) {
    setPrevTaxModeProp(taxMode);
    setInternalTaxMode(taxMode);
  }
  const currentTaxMode = internalTaxMode;

  // Track property ID changes to reset fetched overrides
  const [prevPropId, setPrevPropId] = useState(propertyId);
  const [fetchedRateable, setFetchedRateable] = useState<RateableValueResponse | null>(null);
  const [fetchedCapital, setFetchedCapital] = useState<CapitalValueResponse | null>(null);
  const [fetchedDual, setFetchedDual] = useState<DualMethodResponse | null>(null);
  const [fetchedComparison, setFetchedComparison] = useState<PropertyComparisonResponse | null>(null);
  const [isValuationLoading, setIsValuationLoading] = useState(false);

  // States for Old Details collapsible sections (mutually exclusive)
  const [showOldFloorInfo, setShowOldFloorInfo] = useState(false);
  const [showOldTaxInfo, setShowOldTaxInfo] = useState(false);
  const [showOldMapInfo, setShowOldMapInfo] = useState(false);

  const handleSetShowOldFloorInfo = useCallback((value: boolean) => {
    setShowOldFloorInfo(value);
    if (value) {
      setShowOldTaxInfo(false);
      setShowOldMapInfo(false);
    }
  }, []);

  const handleSetShowOldTaxInfo = useCallback((value: boolean) => {
    setShowOldTaxInfo(value);
    if (value) {
      setShowOldFloorInfo(false);
      setShowOldMapInfo(false);
    }
  }, []);

  const handleSetShowOldMapInfo = useCallback((value: boolean) => {
    setShowOldMapInfo(value);
    if (value) {
      setShowOldFloorInfo(false);
      setShowOldTaxInfo(false);
    }
  }, []);

  // State for Floor Details expandable section below valuation table
  const [showFloorDetails, setShowFloorDetails] = useState(false);

  if (propertyId !== prevPropId) {
    setPrevPropId(propertyId);
    setFetchedRateable(null);
    setFetchedCapital(null);
    setFetchedDual(null);
    setFetchedComparison(null);
  }

  const rateableState = fetchedRateable ?? rateableData ?? null;
  const capitalState = fetchedCapital ?? capitalData ?? null;
  const dualState = fetchedDual ?? dualMethodData ?? null;
  const comparisonState = fetchedComparison ?? comparisonData ?? null;
  const rateableTaxDetailsState = rateableTaxDetails ?? undefined;
  const capitalTaxDetailsState = capitalTaxDetails ?? undefined;

  // Fetch valuation data dynamically based on mode
  const fetchValuationForMode = useCallback(
    async (mode: PtisTaxMode, targetPropertyId: number | string) => {
      const numericId = Number(targetPropertyId);
      if (!numericId || isNaN(numericId) || numericId <= 0) return;

      await Promise.resolve();
      setIsValuationLoading(true);
      try {
        if (mode === 'capital') {
          const res = await fetchIndividualCapitalValueAction(numericId);
          if (res.success && res.data) {
            setFetchedCapital(res.data);
          }
        } else if (mode === 'dual') {
          const [dualRes, capRes, rvRes] = await Promise.all([
            fetchIndividualDualMethodAction(numericId),
            !capitalState ? fetchIndividualCapitalValueAction(numericId) : Promise.resolve(null),
            !rateableState ? fetchIndividualRateableValueAction(numericId) : Promise.resolve(null),
          ]);
          if (dualRes.success && dualRes.data) {
            setFetchedDual(dualRes.data);
          }
          if (capRes?.success && capRes.data) {
            setFetchedCapital(capRes.data);
          }
          if (rvRes?.success && rvRes.data) {
            setFetchedRateable(rvRes.data);
          }
        } else {
          const res = await fetchIndividualRateableValueAction(numericId);
          if (res.success && res.data) {
            setFetchedRateable(res.data);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch valuation for mode ${mode}:`, err);
      } finally {
        setIsValuationLoading(false);
      }
    },
    [capitalState, rateableState]
  );


  // Tab mode switch handler
  const handleTaxModeChange = (mode: PtisTaxMode) => {
    setInternalTaxMode(mode);
    onTaxModeChange?.(mode);

    if (propertyId) {
      if (mode === 'capital' && !capitalState) {
        fetchValuationForMode('capital', propertyId);
      } else if (mode === 'dual' && !dualState) {
        fetchValuationForMode('dual', propertyId);
      } else if (mode === 'rateable' && !rateableState) {
        fetchValuationForMode('rateable', propertyId);
      }
    }
  };

  const currentSearchParams = useSearchParams();

  const searchParamsObj = useMemo(() => {
    const obj: Record<string, string | string[] | undefined> = {};
    if (currentSearchParams) {
      currentSearchParams.forEach((value, key) => {
        obj[key] = value;
      });
    }
    if (wardNo) obj.wardNo = wardNo;
    if (wardId) obj.wardId = String(wardId);
    if (propertyNo) obj.propertyNo = propertyNo;
    if (partitionNo) obj.partitionNo = partitionNo;
    if (propertyId) obj.propertyId = String(propertyId);
    return obj;
  }, [currentSearchParams, wardNo, wardId, propertyNo, partitionNo, propertyId]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-48 bg-slate-100 rounded" />
      </div>
    );
  }

  const activeTitle = activeSection ? SECTION_TITLES[activeSection] : null;

  return (
    <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs relative font-sans">
      {/* 1. Top Navigation Bar */}
      <IndividualFloorTopNav
        activeSection={activeSection}
        onToggleSection={(section) => {
          if (activeSection === section) {
            setIsExpanded((prev) => !prev);
          } else {
            setActiveSection(section);
            setIsExpanded(true);
          }
        }}
        taxMode={currentTaxMode}
        onTaxModeChange={handleTaxModeChange}
        isLoadingValuation={isValuationLoading}
      />

      {/* 2. Floor Details Section by Valuation Mode (Rateable, Capital, Dual Method) */}
      {activeSection === 'floor' && isExpanded && (
        <>
          {currentTaxMode === 'rateable' && (
            <RateableTaxTable
              rateableData={rateableState}
              searchParams={searchParamsObj}
              locale={locale}
              propertyId={propertyId ? Number(propertyId) : undefined}
            />
          )}

          {currentTaxMode === 'capital' && (
            <CapitalTaxTable
              capitalData={capitalState}
              searchParams={searchParamsObj}
              locale={locale}
              propertyId={propertyId ? Number(propertyId) : undefined}
            />
          )}

          {currentTaxMode === 'dual' && (
            <>
              <div className="w-full flex flex-col gap-3 py-1">
                <DualMethodComparisonTable
                  dualMethodData={dualState}
                  locale={locale}
                />
              </div>

              {/* Centered Show/Hide Floor Details Button (Dual Method Only) */}
              <div className="my-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowFloorDetails((prev) => !prev)}
                  className={PTIS_UI_CLASSES.expandButton}
                >
                  {showFloorDetails ? (
                    <>
                      {t('actions.hideFloorDetails')} <ChevronUp className="h-4 w-4 text-indigo-600" />
                    </>
                  ) : (
                    <>
                      {t('actions.showFloorDetails')} <ChevronDown className="h-4 w-4 text-indigo-600" />
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Dual Method Floor Section */}
              {showFloorDetails && (
                <div className="py-2 space-y-3">
                  <DualMethodFloorDetails
                    rateableSection={
                      <div className="space-y-3">
                        <RateableTaxTable
                          rateableData={rateableState}
                          searchParams={searchParamsObj}
                          locale={locale}
                          propertyId={propertyId ? Number(propertyId) : undefined}
                        />
                        {rateableTaxDetailsState && (
                          <div className="p-3 bg-white rounded-b-md border-t border-slate-200">
                            <TaxDetails initialTaxDetails={rateableTaxDetailsState} activeTab="current" />
                          </div>
                        )}
                      </div>
                    }
                    capitalSection={
                      <div className="space-y-3">
                        <CapitalTaxTable
                          capitalData={capitalState}
                          searchParams={searchParamsObj}
                          locale={locale}
                          propertyId={propertyId ? Number(propertyId) : undefined}
                        />
                        {capitalTaxDetailsState && (
                          <div className="p-3 bg-white rounded-b-md border-t border-slate-200">
                            <TaxDetails initialTaxDetails={capitalTaxDetailsState} activeTab="current" />
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
              )}
            </>
          )}

          {/* 4 Summary Cards Downside the Table */}
          <IndividualFloorSummaryCards
            rateableData={rateableState}
            capitalData={capitalState}
            dualMethodData={dualState}
            comparisonData={comparisonState}
            oldDetailsData={oldDetailsData}
            taxMode={currentTaxMode}
          />
        </>
      )}

      {/* 3. Building Permission, Discount, or Old Details Tabs */}
      {activeSection && activeSection !== 'floor' && activeTitle && (
        <div className="pt-1">
          <div
            className="flex items-center gap-1.5 cursor-pointer select-none group pb-2"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              {activeTitle}
            </h2>
            {isExpanded ? (
              <ChevronDown size={16} strokeWidth={3} className="text-slate-400 group-hover:text-slate-600" />
            ) : (
              <ChevronRight size={16} strokeWidth={3} className="text-slate-400 group-hover:text-slate-600" />
            )}
          </div>

          {isExpanded && (
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
              {activeSection === 'building' && (
                <BuildingPermissionTab
                  data={buildingPermissionData ?? undefined}
                  propertyId={propertyId ? Number(propertyId) : undefined}
                  wardNo={wardNo ?? undefined}
                  wardId={wardId ? Number(wardId) : undefined}
                  propertyNo={propertyNo ?? undefined}
                  partitionNo={partitionNo ?? undefined}
                />
              )}

              {activeSection === 'discount' && (
                <DiscountDataTab
                  propertyId={propertyId ? Number(propertyId) : undefined}
                  initialData={discountData ?? undefined}
                />
              )}

              {activeSection === 'oldDetails' && (
                <IndividualOldDetailsTab
                  propertyId={propertyId}
                  showOldFloorInfo={showOldFloorInfo}
                  setShowOldFloorInfo={handleSetShowOldFloorInfo}
                  showOldTaxInfo={showOldTaxInfo}
                  setShowOldTaxInfo={handleSetShowOldTaxInfo}
                  showOldMapInfo={showOldMapInfo}
                  setShowOldMapInfo={handleSetShowOldMapInfo}
                  oldFloorTableData={oldFloorTableData ?? []}
                  oldDetailsData={oldDetailsData ?? undefined}
                  oldTaxesData={oldTaxesData ?? null}
                  mappedPropertiesData={mappedPropertiesData ?? []}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndividualFloorIntelligence;
