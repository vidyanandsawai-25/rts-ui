'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PropertySearchBar } from '@/components/modules/property-tax/ptis/tabs/components/PropertySearchBar';
import { IndividualPropertyMasterCard } from './individual-tabSection/IndividualPropertyMasterCard';
import { PtisStatusMetricsHeader } from '@/components/modules/property-tax/ptis/apartment/WorkFlow/PtisStatusMetricsHeader';
import { IndividualFloorIntelligence } from './individual-floor/IndividualFloorIntelligence';
import { AppliedRulesDrawer } from '@/components/modules/property-tax/ptis/AppliedRulesDrawer';
import { fetchPropertyRuleLogsAction } from '@/app/[locale]/property-tax/ptis/individual/action';
import type { PropertyRuleLogItem } from '@/types/rule-engine';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import type { RateableValueResponse } from '@/types/rateableValue.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import type { DualMethodResponse } from '@/types/dualMethod.types';
import type {
  ApartmentQCTopSectionBelowFlexItemsDto,
  ApartmentQCTopSectionBelowFlexResponseDto,
  ApartmentTaxDetailsItem,
  PtisTaxMode,
} from '@/types/property-tax/apartment';
import type { PtisInitialData } from '@/types/ptis.types';
import type { PTISSearchSelectOption as SearchSelectOption } from '@/components/common/PTISSearchSelect';
import type { PropertyComparisonResponse } from '@/types/propertyComparison.types';
import { useIndividualPropertySearch } from '@/hooks/property-tax/individual';
import { IndividualTaxDetailsSection } from './individual-tax-details';

import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';

export interface IndividualContainerProps {
  initialData?: PtisInitialData;
  initialWardId?: number | null;
  initialPropertyMasterData?: IndividualPropertyMasterData;
  initialQcTopSectionBelowFlex?:
    | ApartmentQCTopSectionBelowFlexItemsDto
    | ApartmentQCTopSectionBelowFlexResponseDto
    | Record<string, unknown>
    | null;
  initialRateableData?: RateableValueResponse | null;
  initialCapitalData?: CapitalValueResponse | null;
  initialDualMethodData?: DualMethodResponse | null;
  initialComparisonData?: PropertyComparisonResponse | null;
  initialTaxDetails?: ApartmentTaxDetailsItem | null;
  initialRateableTaxDetails?: TaxDetailsData | null;
  initialCapitalTaxDetails?: TaxDetailsData | null;
  initialTaxMode?: PtisTaxMode;
  isLoading?: boolean;
  societyDetailId?: number | string | null;
  wingDetailId?: number | string | null;
  wingName?: string | null;
  hasAppliedRules?: boolean;
  appliedRules?: PropertyRuleLogItem[];
  locale?: string;
}

const EMPTY_INITIAL_DATA: PtisInitialData = {
  wardOptions: [],
  propertyOptions: [],
  rawPropertyData: [],
  tabHeaderInfo: undefined,
};

export const IndividualContainer: React.FC<IndividualContainerProps> = ({
  initialData = EMPTY_INITIAL_DATA,
  initialWardId = null,
  initialPropertyMasterData,
  initialQcTopSectionBelowFlex,
  initialRateableData = null,
  initialCapitalData = null,
  initialDualMethodData = null,
  initialComparisonData = null,
  initialTaxDetails = null,
  initialRateableTaxDetails = null,
  initialCapitalTaxDetails = null,
  initialTaxMode = 'rateable',
  isLoading = false,
  societyDetailId: propSocietyDetailId = null,
  wingDetailId: propWingDetailId = null,
  wingName: propWingName = null,
  hasAppliedRules = false,
  appliedRules = [],
  locale = 'en',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentTaxMode, setCurrentTaxMode] = useState<PtisTaxMode>(initialTaxMode || 'rateable');
  const [rateableDataState, setRateableDataState] = useState<RateableValueResponse | null>(initialRateableData);
  const [capitalDataState, setCapitalDataState] = useState<CapitalValueResponse | null>(initialCapitalData);
  const [dualMethodDataState, setDualMethodDataState] = useState<DualMethodResponse | null>(initialDualMethodData);

  const [prevInitialRateable, setPrevInitialRateable] = useState(initialRateableData);
  const [prevInitialCapital, setPrevInitialCapital] = useState(initialCapitalData);
  const [prevInitialDual, setPrevInitialDual] = useState(initialDualMethodData);

  if (initialRateableData !== prevInitialRateable) {
    setPrevInitialRateable(initialRateableData);
    setRateableDataState(initialRateableData);
  }
  if (initialCapitalData !== prevInitialCapital) {
    setPrevInitialCapital(initialCapitalData);
    setCapitalDataState(initialCapitalData);
  }
  if (initialDualMethodData !== prevInitialDual) {
    setPrevInitialDual(initialDualMethodData);
    setDualMethodDataState(initialDualMethodData);
  }

  const [isAppliedRulesDrawerOpen, setIsAppliedRulesDrawerOpen] = useState(false);
  const [fetchedRules, setFetchedRules] = useState<PropertyRuleLogItem[] | null>(null);

  const currentAppliedRules = fetchedRules ?? appliedRules;
  const hasRules = (hasAppliedRules !== undefined ? hasAppliedRules : false) || currentAppliedRules.length > 0;

  const handleTaxModeChange = (mode: PtisTaxMode) => {
    setCurrentTaxMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tab');
    params.set('valuationTab', mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const search = useIndividualPropertySearch(
    initialData,
    initialWardId,
    initialPropertyMasterData
  );
  const { draft, isSearching, propertyId } = search;

  const resolvedUpicId =
    (initialPropertyMasterData?.upic && initialPropertyMasterData.upic !== '-')
      ? initialPropertyMasterData.upic
      : initialData?.propertyDetails?.upicId || initialData?.tabHeaderInfo?.upicId || '';

  const resolvedOwnerName =
    (initialPropertyMasterData?.ownerName && initialPropertyMasterData.ownerName !== '-')
      ? initialPropertyMasterData.ownerName
      : initialData?.kycDetails?.propertyHolderName || initialData?.tabHeaderInfo?.ownerName || '';

  const resolvedDescription =
    (initialPropertyMasterData?.propertyDescription && initialPropertyMasterData.propertyDescription !== '-')
      ? initialPropertyMasterData.propertyDescription
      : initialData?.propertyDetails?.propertyDescription || initialData?.tabHeaderInfo?.description || '';

  const fallbackPropId = (initialData?.propertyDetails as { propertyId?: number | string })?.propertyId;
  const isDraftMatchingInitial = !draft.propertyNo || draft.propertyNo === initialPropertyMasterData?.propertyNo || draft.propertyNo === initialData?.propertyDetails?.propertyNo;

  const resolvedEffectivePropertyId = draft.propertyId
    ? Number(draft.propertyId)
    : Number(
        propertyId ||
        (isDraftMatchingInitial ? (initialPropertyMasterData?.propertyId || initialData?.tabHeaderInfo?.propertyId || fallbackPropId) : null)
      ) || null;

  const resolvedWardId = draft.wardId
    ? String(draft.wardId)
    : initialWardId
    ? String(initialWardId)
    : String(initialData?.wardOptions?.find((w: SearchSelectOption) => w.label === draft.wardNo)?.value || '') || null;

  const resolvedSocietyDetailId: string | number | null =
    propSocietyDetailId ??
    (searchParams?.get('societyDetailId') ? Number(searchParams.get('societyDetailId')) : null) ??
    (searchParams?.get('societyId') ? Number(searchParams.get('societyId')) : null) ??
    (initialData?.societyDetails?.societyDetailId ? Number(initialData.societyDetails.societyDetailId) : null);

  const resolvedWingDetailId: string | number | null =
    propWingDetailId ??
    (searchParams?.get('wingDetailId') ? Number(searchParams.get('wingDetailId')) : null) ??
    (searchParams?.get('wingId') ? Number(searchParams.get('wingId')) : null);

  const resolvedWingName: string | null =
    propWingName ??
    searchParams?.get('wingName') ??
    null;

  const handleOpenAppliedRules = useCallback(async () => {
    setIsAppliedRulesDrawerOpen(true);
    if (resolvedEffectivePropertyId && (!currentAppliedRules || currentAppliedRules.length === 0)) {
      try {
        const res = await fetchPropertyRuleLogsAction(Number(resolvedEffectivePropertyId));
        if (res.success && res.data?.items) {
          setFetchedRules(res.data.items);
        }
      } catch (err) {
        console.error('Failed to fetch applied rules for individual property:', err);
      }
    }
  }, [resolvedEffectivePropertyId, currentAppliedRules]);

  useEffect(() => {
    const handleCustomOpen = () => {
      handleOpenAppliedRules();
    };
    window.addEventListener('ptis:open-applied-rules', handleCustomOpen);
    return () => window.removeEventListener('ptis:open-applied-rules', handleCustomOpen);
  }, [handleOpenAppliedRules]);

  return (
    <div className="w-full flex flex-col bg-slate-100 min-h-screen text-zinc-900 select-none pb-16 font-sans">
      {/* 1. TOP SEARCH BAR */}
      <div className="px-3 pt-2">
        <div className="rounded-xl border border-blue-200/80 shadow-xs bg-white relative z-30">
          <PropertySearchBar
            wardNo={draft.wardNo}
            setWardNo={search.setWardNo}
            wardId={draft.wardId}
            setWardId={search.onWardChangeCommit}
            propertyNo={draft.propertyNo}
            setPropertyNo={search.setPropertyNo}
            partitionNo={draft.partitionNo}
            setPartitionNo={search.setPartitionNo}
            propertyId={draft.propertyId}
            setPropertyId={search.setPropertyId}
            category={draft.category}
            categoryLabel={draft.categoryLabel}
            setCategory={search.setCategory}
            wardOptions={search.wardOptions}
            isFetchingWardOptions={search.isFetchingWardOptions}
            onFetchWardList={search.handleFetchWardList}
            propertyOptions={search.propertyOptions}
            propertyOptionValueMap={search.propertyOptionValueMap}
            partitionOptions={search.partitionOptions}
            partitionValueMap={search.partitionValueMap}
            isSearching={isSearching || isLoading}
            onSearch={search.handleSearchProperty}
            upicId={resolvedUpicId}
            ownerName={resolvedOwnerName}
            propertyDescription={resolvedDescription}
            tabHeaderInfo={initialData?.tabHeaderInfo}
            onPropertySearchChange={search.setSearchText}
            onPartitionSearchChange={search.setPartitionSearchText}
            isSearchingProperties={search.isSearchingProperties}
            showSummaryInfo={false}
          />
        </div>
      </div>

      {/* 2. INDIVIDUAL TAB SECTION (PROPERTY MASTER CARD) */}
      <div className="px-3 pt-2">
        <IndividualPropertyMasterCard
          data={initialPropertyMasterData}
          propertyId={resolvedEffectivePropertyId ?? undefined}
          wardNo={draft.wardNo}
          isLoading={isSearching || isLoading}
        />
      </div>

      {/* 3. STATUS METRICS HEADER (DOWNSIDE THE TAB SECTION) */}
      <div className="px-3 pt-2">
        <PtisStatusMetricsHeader
          propertyId={searchParams.get('propertyId') ? Number(searchParams.get('propertyId')) : null}
          initialData={initialQcTopSectionBelowFlex}
          isLoading={isSearching || isLoading}
        />
      </div>

      {/* 4. FLOOR DETAILS INTELLIGENCE (TOP NAV & COMPARISON TABLE) */}
      <div className="px-3 pt-2">
        <IndividualFloorIntelligence
          propertyId={resolvedEffectivePropertyId}
          wardNo={draft.wardNo}
          wardId={draft.wardId ? Number(draft.wardId) : null}
          propertyNo={draft.propertyNo}
          partitionNo={draft.partitionNo}
          societyDetailId={resolvedSocietyDetailId}
          wingDetailsId={resolvedWingDetailId}
          wingName={resolvedWingName}
          isApartmentScreen={false}
          rateableData={rateableDataState}
          capitalData={capitalDataState}
          dualMethodData={dualMethodDataState}
          comparisonData={initialComparisonData}
          rateableTaxDetails={initialRateableTaxDetails}
          capitalTaxDetails={initialCapitalTaxDetails}
          taxMode={currentTaxMode}
          onTaxModeChange={handleTaxModeChange}
          onRateableDataLoaded={setRateableDataState}
          onCapitalDataLoaded={setCapitalDataState}
          onDualMethodDataLoaded={setDualMethodDataState}
          buildingPermissionData={initialData?.buildingPermission ?? undefined}
          discountData={initialData?.discountDetails ?? undefined}
          socialData={initialData?.socialDetails ?? undefined}
          oldDetailsData={initialData?.oldDetails ?? undefined}
          oldFloorTableData={initialData?.oldFloorTableData ?? []}
          oldTaxesData={initialData?.oldTaxesData ?? null}
          mappedPropertiesData={initialData?.mappedPropertiesData ?? []}
          isLoading={isSearching || isLoading}
          locale={locale}
          onOpenAppliedRules={handleOpenAppliedRules}
          hasAppliedRules={hasRules || (currentAppliedRules && currentAppliedRules.length > 0)}
        />
      </div>

      {/* 5. TAX DETAILS TABLE (FROM APARTMENT TO INDIVIDUAL) */}
      <div className="px-3 pt-2">
        <IndividualTaxDetailsSection
          propertyId={resolvedEffectivePropertyId}
          wardId={resolvedWardId}
          propertyNo={draft.propertyNo || null}
          taxMode={currentTaxMode}
          taxDetails={initialTaxDetails}
          rateableTaxDetails={initialRateableTaxDetails}
          capitalTaxDetails={initialCapitalTaxDetails}
          rateableData={rateableDataState}
          capitalData={capitalDataState}
          dualMethodData={dualMethodDataState}
          comparisonData={initialComparisonData}
          oldDetailsData={initialData?.oldDetails ?? undefined}
          isLoading={isSearching || isLoading}
        />
      </div>

      {/* 6. APPLIED RULES DRAWER */}
      <AppliedRulesDrawer
        open={isAppliedRulesDrawerOpen}
        onClose={() => setIsAppliedRulesDrawerOpen(false)}
        propertyId={resolvedEffectivePropertyId ? Number(resolvedEffectivePropertyId) : undefined}
        propertyNo={draft.propertyNo || initialPropertyMasterData?.propertyNo || ''}
        locale={locale}
        appliedRules={currentAppliedRules}
      />
    </div>
  );
};

export default IndividualContainer;
