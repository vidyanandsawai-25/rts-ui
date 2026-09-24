'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
import { useParams } from 'next/navigation';

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
import {
  fetchIndividualRateableValueAction,
  fetchIndividualCapitalValueAction,
  fetchIndividualDualMethodAction,
  fetchIndividualPropertyComparisonAction,
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
  buildingPermissionData?: BuildingPermissionData | null;
  discountData?: DiscountData | null;
  oldDetailsData?: OldDetailsData | null;
  oldFloorTableData?: OldFloorDetailsData[] | null;
  oldTaxesData?: OldTaxesData | null;
  mappedPropertiesData?: MappedPropertyItem[] | null;
  taxMode?: PtisTaxMode;
  onTaxModeChange?: (mode: PtisTaxMode) => void;
  isLoading?: boolean;
}

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
  buildingPermissionData,
  discountData,
  oldDetailsData,
  oldFloorTableData,
  oldTaxesData,
  mappedPropertiesData,
  taxMode = 'rateable',
  onTaxModeChange,
  isLoading = false,
}) => {
  const t = useTranslations('ptis');
  const params = useParams();
  const currentLocale = typeof params?.locale === 'string' ? params.locale : 'en';
  const tInd = useTranslations('individual');
  const [activeSection, setActiveSection] = useState<IndividualFloorTopNavSection | null>('floor');
  const [isExpanded, setIsExpanded] = useState(true);

  // Synchronize taxMode: controlled if onTaxModeChange provided, otherwise local state
  const [uncontrolledTaxMode, setUncontrolledTaxMode] = useState<PtisTaxMode>(taxMode);
  const currentTaxMode = onTaxModeChange ? taxMode : uncontrolledTaxMode;

  const [fetchedValuation, setFetchedValuation] = useState<{
    propId: number | string | null;
    rateable: RateableValueResponse | null;
    capital: CapitalValueResponse | null;
    dual: DualMethodResponse | null;
    comparison: PropertyComparisonResponse | null;
  }>({
    propId: null,
    rateable: null,
    capital: null,
    dual: null,
    comparison: null,
  });
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

  const isCurrentProp = fetchedValuation.propId === propertyId;
  const rateableState = (isCurrentProp ? fetchedValuation.rateable : null) ?? rateableData ?? null;
  const capitalState = (isCurrentProp ? fetchedValuation.capital : null) ?? capitalData ?? null;
  const dualState = (isCurrentProp ? fetchedValuation.dual : null) ?? dualMethodData ?? null;
  const comparisonState = (isCurrentProp ? fetchedValuation.comparison : null) ?? comparisonData ?? null;

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
            setFetchedValuation((prev) => ({
              ...prev,
              propId: targetPropertyId,
              capital: res.data ?? null,
            }));
          }
        } else if (mode === 'dual') {
          const [dualRes, capRes, rvRes] = await Promise.all([
            fetchIndividualDualMethodAction(numericId),
            !capitalState ? fetchIndividualCapitalValueAction(numericId) : Promise.resolve(null),
            !rateableState ? fetchIndividualRateableValueAction(numericId) : Promise.resolve(null),
          ]);
          setFetchedValuation((prev) => ({
            ...prev,
            propId: targetPropertyId,
            dual: dualRes.success && dualRes.data ? dualRes.data : prev.propId === targetPropertyId ? prev.dual : null,
            capital: capRes?.success && capRes.data ? capRes.data : prev.propId === targetPropertyId ? prev.capital : null,
            rateable: rvRes?.success && rvRes.data ? rvRes.data : prev.propId === targetPropertyId ? prev.rateable : null,
          }));
        } else {
          const res = await fetchIndividualRateableValueAction(numericId);
          if (res.success && res.data) {
            setFetchedValuation((prev) => ({
              ...prev,
              propId: targetPropertyId,
              rateable: res.data ?? null,
            }));
          }
        }
      } catch {
        // Valuation fetch error handled gracefully
      } finally {
        setIsValuationLoading(false);
      }
    },
    [capitalState, rateableState]
  );

  // Dynamically fetch comparison and valuation data when propertyId changes
  useEffect(() => {
    if (!propertyId) return;
    const targetId = propertyId;
    let active = true;

    async function loadData() {
      // Only fetch comparison if not already provided by SSR or state
      if (!comparisonState) {
        try {
          const compRes = await fetchIndividualPropertyComparisonAction(targetId);
          if (active && compRes.success && compRes.data) {
            setFetchedValuation((prev) => ({
              ...prev,
              propId: targetId,
              comparison: compRes.data ?? null,
            }));
          }
        } catch {
          // Handled gracefully without polluting console
        }
      }

      if (currentTaxMode === 'capital' && !capitalState) {
        await fetchValuationForMode('capital', targetId);
      } else if (currentTaxMode === 'dual' && !dualState) {
        await fetchValuationForMode('dual', targetId);
      } else if (currentTaxMode === 'rateable' && !rateableState) {
        await fetchValuationForMode('rateable', targetId);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [propertyId, currentTaxMode, capitalState, dualState, rateableState, comparisonState, fetchValuationForMode]);

  // Tab mode switch handler
  const handleTaxModeChange = (mode: PtisTaxMode) => {
    if (!onTaxModeChange) {
      setUncontrolledTaxMode(mode);
    }
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

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-48 bg-slate-100 rounded" />
      </div>
    );
  }

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'building':
        return tInd.has?.('sections.buildingPermission')
          ? tInd('sections.buildingPermission')
          : 'BUILDING PERMISSION (Certificates & Clearances)';
      case 'discount':
        return tInd.has?.('sections.discount')
          ? tInd('sections.discount')
          : 'DISCOUNT & SOCIAL DATA (Discounts & Concessions)';
      case 'oldDetails':
        return tInd.has?.('sections.oldDetails')
          ? tInd('sections.oldDetails')
          : 'OLD DETAILS (Mapped Properties / Historical Data)';
      default:
        return '';
    }
  };

  const activeTitle = activeSection ? getSectionTitle(activeSection) : null;

  const searchParamsObj = {
    wardNo: wardNo || undefined,
    wardId: wardId ? String(wardId) : undefined,
    propertyNo: propertyNo || undefined,
    partitionNo: partitionNo || undefined,
  };

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
              locale={currentLocale}
              propertyId={propertyId ? Number(propertyId) : undefined}
            />
          )}

          {currentTaxMode === 'capital' && (
            <CapitalTaxTable
              capitalData={capitalState}
              searchParams={searchParamsObj}
              locale={currentLocale}
              propertyId={propertyId ? Number(propertyId) : undefined}
            />
          )}

          {currentTaxMode === 'dual' && (
            <>
              <div className="w-full flex flex-col gap-3 py-1">
                <DualMethodComparisonTable
                  dualMethodData={dualState}
                  locale={currentLocale}
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
                      <RateableTaxTable
                        rateableData={rateableState}
                        searchParams={searchParamsObj}
                        locale={currentLocale}
                        propertyId={propertyId ? Number(propertyId) : undefined}
                      />
                    }
                    capitalSection={
                      <CapitalTaxTable
                        capitalData={capitalState}
                        searchParams={searchParamsObj}
                        locale={currentLocale}
                        propertyId={propertyId ? Number(propertyId) : undefined}
                      />
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
                <BuildingPermissionTab data={buildingPermissionData ?? undefined} />
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
