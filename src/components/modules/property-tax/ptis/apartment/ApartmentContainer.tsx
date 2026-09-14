/* eslint-disable i18next/no-literal-string */
'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useApartment, useContainerActions, useApartmentScrollSync } from '@/hooks/property-tax/apartment';
import { useApartmentPropertySearch } from '@/hooks/property-tax/apartment/useApartmentPropertySearch';
import {
  PtisRedesignCopy,
  ApartmentQCTopSectionBelowFlexItemsDto,
  ApartmentQCTopSectionBelowFlexResponseDto,
  SearchWingWiseFilters,
} from '@/types/property-tax/apartment';
import { PtisSearchHeader } from './header/PtisSearchHeader';
import { PtisRedesignWorkspace } from './workspace/PtisRedesignWorkspace';
import { TaxRulesDiscountsModal } from './modals/TaxRulesDiscountsModal';
import { ImageViewer } from '@/components/common/ImageViewer';
import { PtisStatusMetricsHeader } from './WorkFlow/PtisStatusMetricsHeader';
import { PtisInitialData } from '@/types/ptis.types';
import { PropertySearchBar } from '@/components/modules/property-tax/ptis/tabs/components/PropertySearchBar';
import { WingWiseDetailsItems } from '@/types/property-tax/apartment';
import { useParams } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';
import { ApartmentWingIntelligence } from './wing-intelligence/ApartmentWingIntelligence';
import { PropertyMasterCard } from './apartment-tabSection/PropertyMasterCard';
import { ApartmentTaxDetailsSection } from './workspace/ApartmentTaxDetailsSection';
import type { PropertyMasterData, ApartmentTaxDetailsItem } from '@/types/property-tax/apartment';
import { extractAvailableFloors } from '@/lib/utils/ptis-floor.utils';
import { useWingUrlParams } from '@/hooks/property-tax/apartment';

export interface ApartmentContainerProps {
  copy: PtisRedesignCopy;
  initialData: PtisInitialData;
  initialWardId: number | null;
  rawData?: WingWiseDetailsItems | null;
  initialPropertyMasterData?: PropertyMasterData;
  initialQcTopSectionBelowFlex?:
    | ApartmentQCTopSectionBelowFlexItemsDto
    | ApartmentQCTopSectionBelowFlexResponseDto
    | Record<string, unknown>
    | null;
  initialApartmentTaxDetails?: ApartmentTaxDetailsItem | null;
}

export const ApartmentContainer: React.FC<ApartmentContainerProps> = ({
  copy, initialData, initialWardId, rawData,
  initialPropertyMasterData, initialQcTopSectionBelowFlex, initialApartmentTaxDetails,
}) => {
  const routeParams = useParams();
  const locale = (routeParams?.locale as string) || defaultLocale;
  const search = useApartmentPropertySearch(initialData, initialWardId, initialPropertyMasterData);
  const { urlState, draft, propertyId, isSearching } = search;

  const apt = useApartment(
    propertyId,
    urlState.wingId ? Number(urlState.wingId) : (initialData?.propertyDetails?.wingId || null),
    urlState.wingDetailId ? Number(urlState.wingDetailId) : (initialData?.propertyDetails?.wingDetailId || null)
  );

  const lastPropertyIdRef = useRef<number | string | null>(propertyId);
  const hasInitializedDefaultWingRef = useRef(Boolean(urlState.wingDetailId || initialData?.propertyDetails?.wingDetailId));

  const wingsList = useMemo(() => rawData?.wings || [], [rawData?.wings]);
  const firstWing = useMemo(() => wingsList?.[0] || null, [wingsList]);
  const activeWingId = apt.filters.wingId ?? null;
  const activeWingDetailId = apt.filters.wingDetailId ?? null;
  const activeSocietyDetailId = apt.filters.societyId ?? initialData?.societyDetails?.societyDetailId ?? rawData?.societyId ?? null;
  const activeWingName = apt.filters.wingName ?? (activeWingDetailId ? wingsList.find((w) => w.wingDetailId === activeWingDetailId)?.wingName : null) ?? null;

  const availableFloors = useMemo(() => {
    return extractAvailableFloors(apt.allSurveyUnits || apt.surveyUnits, apt.allPreviousUnits || apt.previousUnits, rawData?.wings, activeWingId);
  }, [apt.allSurveyUnits, apt.surveyUnits, apt.allPreviousUnits, apt.previousUnits, rawData?.wings, activeWingId]);

  const { setWingParams } = useWingUrlParams();

  useEffect(() => {
    if (lastPropertyIdRef.current !== propertyId) {
      lastPropertyIdRef.current = propertyId;
      hasInitializedDefaultWingRef.current = Boolean(urlState.wingDetailId || initialData?.propertyDetails?.wingDetailId);
    }

    if (hasInitializedDefaultWingRef.current) {
      return;
    }

    if (apt.filters.wingDetailId) {
      hasInitializedDefaultWingRef.current = true;
      return;
    }

    if (firstWing?.wingDetailId) {
      hasInitializedDefaultWingRef.current = true;
      const finalSocietyId = firstWing.societyId ?? activeSocietyDetailId;
      const wName = firstWing.wingName ?? firstWing.wingNo ?? null;
      const updated = { ...apt.filters, wingId: firstWing.wingMasterId ?? null, wingDetailId: firstWing.wingDetailId, societyId: finalSocietyId, wingName: wName, pageNumber: 1, pageSize: 100 };
      apt.setFilters(updated);
      apt.fetchWingWiseData(updated);
      setWingParams({
        wardId: rawData?.wardId ? String(rawData.wardId) : null,
        wingId: firstWing.wingMasterId ? String(firstWing.wingMasterId) : null,
        wingDetailId: String(firstWing.wingDetailId),
        societyId: finalSocietyId ? String(finalSocietyId) : null,
        wingName: wName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, firstWing, apt.filters.wingDetailId, activeSocietyDetailId, apt.setFilters, apt.fetchWingWiseData, setWingParams, rawData?.wardId, urlState.wingDetailId, initialData?.propertyDetails?.wingDetailId]);

  const panelWidthPercent = apt.hiddenPanels.length === 2 ? 100 : apt.hiddenPanels.length === 1 ? 50 : 33;
  const { surveyScrollRef, differenceScrollRef, existingScrollRef, handleSyncScroll } = useApartmentScrollSync(apt.loadMoreUnits);

  const actions = useContainerActions({
    propertyId, locale, societyDetailId: activeSocietyDetailId, societyId: activeSocietyDetailId, wingDetailId: activeWingDetailId, wingId: activeWingId,
  });

  const wardId = rawData?.wardId ? String(rawData.wardId) : null;

  const handleWingSearch = useCallback((updatedFilters?: SearchWingWiseFilters) => {
    const active = updatedFilters || apt.filters;
    apt.setFilters(active);
    apt.fetchWingWiseData(active);
    setWingParams({
      wardId,
      wingId: active.wingId ? String(active.wingId) : null,
      wingDetailId: active.wingDetailId ? String(active.wingDetailId) : null,
      societyId: active.societyId ? String(active.societyId) : null,
      wingName: active.wingName ?? null,
    });
  }, [apt, setWingParams, wardId]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = useCallback(() => setIsFullscreen((prev) => !prev), []);

  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); e.stopPropagation(); setIsFullscreen(false); }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => { document.body.style.overflow = prevOverflow; window.removeEventListener('keydown', handleKeyDown, true); };
  }, [isFullscreen]);

  return (
    <div className="w-full flex flex-col bg-slate-100 min-h-screen text-zinc-900 select-none pb-16 font-sans">
      <div className="px-3 pt-2">
        <div className="rounded-xl border border-blue-200/80 shadow-xs bg-white relative z-30">
          <PropertySearchBar
            wardNo={draft.wardNo} setWardNo={search.setWardNo} wardId={draft.wardId} setWardId={search.onWardChangeCommit}
            propertyNo={draft.propertyNo} setPropertyNo={search.setPropertyNo} partitionNo={draft.partitionNo} setPartitionNo={search.setPartitionNo}
            propertyId={draft.propertyId} setPropertyId={search.setPropertyId} category={draft.category} categoryLabel={draft.categoryLabel} setCategory={search.setCategory}
            wardOptions={search.wardOptions} isFetchingWardOptions={search.isFetchingWardOptions} onFetchWardList={search.handleFetchWardList}
            propertyOptions={search.propertyOptions} propertyOptionValueMap={search.propertyOptionValueMap} partitionOptions={search.partitionOptions} partitionValueMap={search.partitionValueMap}
            isSearching={isSearching} onSearch={search.handleSearchProperty}
            upicId={initialData?.propertyDetails?.upicId || initialData?.tabHeaderInfo?.upicId || ''}
            ownerName={initialData?.kycDetails?.propertyHolderName || initialData?.tabHeaderInfo?.ownerName || ''}
            propertyDescription={initialData?.propertyDetails?.propertyDescription || initialData?.tabHeaderInfo?.description || ''}
            tabHeaderInfo={initialData?.tabHeaderInfo} onPropertySearchChange={search.setSearchText} onPartitionSearchChange={search.setPartitionSearchText} isSearchingProperties={search.isSearchingProperties} showSummaryInfo={false}
          />
        </div>
      </div>

      <div className="px-3 pt-2">
        <PropertyMasterCard
          data={initialPropertyMasterData} propertyId={propertyId ?? undefined}
          wardNo={draft.wardNo || urlState.wardNo || initialData?.propertyDetails?.wardNo || initialData?.tabHeaderInfo?.oldWardNo || search.propertiesList.find((p) => p.propertyId === Number(propertyId || draft.propertyId))?.wardNo || search.wardOptions.find((w) => String(w.value) === String(draft.wardId || urlState.wardId))?.label || ''}
          isLoading={isSearching}
        />
      </div>

      <div className="px-3 pt-2">
        <PtisStatusMetricsHeader
          propertyId={urlState.propertyId ? Number(urlState.propertyId) : (initialData?.tabHeaderInfo?.propertyId ? Number(initialData.tabHeaderInfo.propertyId) : null)}
          initialData={initialQcTopSectionBelowFlex} isLoading={isSearching}
        />
      </div>

      <div className="px-3 pt-2">
        <ApartmentWingIntelligence
          data={rawData} propertyId={propertyId} selectedWingId={activeWingId} selectedWingDetailId={activeWingDetailId} selectedSocietyDetailId={activeSocietyDetailId} selectedWingName={activeWingName} selectedFloor={apt.filters.floor}
          buildingPermissionData={initialData?.buildingPermission} discountData={initialData?.discountDetails} taxMode={actions.taxMode} onTaxModeChange={actions.setTaxMode} isLoading={isSearching}
          onWingSelect={(wMId, wDId, sId, wName) => {
            const updated = { ...apt.filters, wingId: wMId, wingDetailId: wDId, societyId: sId ?? rawData?.societyId ?? activeSocietyDetailId, wingName: wName ?? null, floor: null, pageNumber: 1, pageSize: 100 };
            handleWingSearch(updated);
          }}
        />
      </div>

      <PtisSearchHeader
        filters={apt.filters} paginationInfo={apt.paginationInfo} onFilterChange={apt.setFilters} onSearch={handleWingSearch} wings={rawData?.wings} availableFloors={availableFloors}
        onReset={() => { const r = { propertyId: null, wingId: null, wingDetailId: null, societyId: null, wingName: null, floor: null, searchTerm: '', pageNumber: 1, pageSize: 10 }; apt.setFilters(r); apt.fetchWingWiseData(r); }}
        onPageChange={apt.handlePageChange} onPageSizeChange={apt.handlePageSizeChange} isLoading={apt.isLoading} taxMode={actions.taxMode} onTaxModeChange={actions.setTaxMode} onRestoreAll={apt.restoreAllPanels}
        hiddenPanelsCount={apt.hiddenPanels.length + (actions.expandedPanel !== null ? 2 : 0)} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen}
      />

      {apt.apiError && <div className="mx-3 mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">⚠️ {apt.apiError}</div>}

      <PtisRedesignWorkspace
        copy={copy} surveyUnits={apt.surveyUnits} differences={apt.differences} previousUnits={apt.previousUnits} totalDeltas={apt.totalDeltas} hoveredUnitId={apt.hoveredUnitId} expandedUnitIds={apt.expandedUnitIds}
        hiddenPanels={apt.hiddenPanels} expandedPanel={actions.expandedPanel} panelWidthPercent={panelWidthPercent} onHoverUnit={apt.setHoveredUnitId} onToggleExpandRow={apt.toggleExpandRow}
        onEditUnit={actions.handleActionQuickDataEntry} onViewDocument={actions.handleViewDocument} onViewRules={actions.handleViewRules} onToggleHidePanel={apt.togglePanelVisibility} onToggleExpandPanel={actions.toggleExpandPanel}
        surveyScrollRef={surveyScrollRef} differenceScrollRef={differenceScrollRef} existingScrollRef={existingScrollRef} onSyncScroll={handleSyncScroll} taxMode={actions.taxMode} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen}
        onRestoreAll={apt.restoreAllPanels} hiddenPanelsCount={apt.hiddenPanels.length + (actions.expandedPanel !== null ? 2 : 0)} isLoading={apt.isLoading || isSearching} isLoadingMore={apt.isLoadingMore}
      />

      <ApartmentTaxDetailsSection taxDetails={initialApartmentTaxDetails} wardId={urlState.wardId || initialWardId} propertyNo={urlState.propertyNo} taxMode={actions.taxMode} isLoading={isSearching} />
      <TaxRulesDiscountsModal open={actions.isAppliedRulesDrawerOpen} onClose={actions.closeRulesModal} unit={actions.selectedRuleUnit} appliedRules={actions.appliedRulesForUnit} apartmentName={initialData?.societyDetails?.buildingSocietyName || ''} onViewDocument={actions.handleViewDocument} />
      <ImageViewer open={actions.isImageViewerOpen} onClose={actions.closeImageViewer} images={actions.imageViewerImages} showRotate showZoom showDownload className="z-[100000]" />
    </div>
  );
};

export { ApartmentContainer as PtisRedesignContainer };
