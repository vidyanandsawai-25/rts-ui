"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Drawer } from "@/components/common/Drawer";
import { useTranslations } from "next-intl";
import { Map } from "lucide-react";
import { PrevPageButton, NextPageButton } from "@/components/common/ActionButtons";
import { LinkWardProps } from "@/types/rateSectionMaster.types";
import RateSectionWards from "./RateSectionWards";
import LinkWardTabs from "./LinkWardTabs";
import { getRateSectionDisplayLabel, getSelectedZoneName, handleToggleAvailable, handleToggleSelected} from "./linkWardHelpers";
import { useLinkWardHandlers } from "@/hooks/rateSectionMaster/useLinkWardHandlers";
import { useLinkWardPagination } from "@/hooks/rateSectionMaster/useLinkWardPagination";
import { useLinkWardActions } from "@/hooks/rateSectionMaster/useLinkWardActions";

export default function AddWard({
  open,
  onClose,
  onSuccess: _onSuccess,
  rates,
  sections: _sections,
  selectedZoneNo,
  ssrAllWards,
  ssrAllWardsCount,
  ssrWardAssignments,
  ssrAllRateSections: _ssrAllRateSections,
  ssrSelectedWards,
  ssrSelectedWardsTotalCount = 0,
  ssrViewAllWards = [],
  ssrViewAllWardsTotalCount = 0,
  ssrViewAllWardsTotalPages = 0
}: LinkWardProps) {
  const t = useTranslations("rateSectionMaster");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [wardAssignments, setWardAssignments] = useState(ssrWardAssignments);
  const allAvailableWards = ssrAllWards;
  const totalViewAllCount = ssrViewAllWardsTotalCount || ssrAllWardsCount;

  const state = useLinkWardPagination({
    open,
    ssrSelectedWards,
    ssrSelectedWardsTotalCount,
    ssrAllWards,
    ssrAllWardsCount,
    ssrViewAllWards,
    ssrViewAllWardsTotalCount,
    ssrViewAllWardsTotalPages
  });

  const handlers = useLinkWardHandlers({ searchParams, router });

  const getRateSectionLabel = (rateSectionNo: string) =>
    getRateSectionDisplayLabel(rateSectionNo, rates);

  const { moveToSelected, moveToAvailable } = useLinkWardActions({
    rates,
    selectedZoneNo: selectedZoneNo ?? undefined,
    wardAssignments,
    checkedAvailable: state.checkedAvailable,
    selectedWards: state.selectedWards,
    setCheckedAvailable: state.setCheckedAvailable,
    checkedSelected: state.checkedSelected,
    setCheckedSelected: state.setCheckedSelected,
    setLoading: state.setLoading,
    setSelectedWards: state.setSelectedWards,
    setSelectedWardsTotalCount: state.setSelectedWardsTotalCount,
    setWardAssignments,
    getRateSectionDisplayLabel: getRateSectionLabel,
    router,
    t
  });

  const selectedZoneName = useMemo(
    () => getSelectedZoneName(selectedZoneNo ?? undefined, rates),
    [selectedZoneNo, rates]
  );

  const totalUnassignedForHeader = useMemo(() => {
    return allAvailableWards.filter(ward => 
      !wardAssignments[ward.wardNo] && !state.selectedWards.includes(ward.wardNo)
    ).length;
  }, [allAvailableWards, wardAssignments, state.selectedWards]);

  const toggleAvailable = (wardNo: string) =>
    handleToggleAvailable(
      wardNo,
      wardAssignments,
      selectedZoneNo ?? undefined,
      state.checkedAvailable,
      state.setCheckedAvailable,
      rates,
      t
    );

  const toggleSelected = (wardNo: string) =>
    handleToggleSelected(
      wardNo,
      state.checkedSelected,
      state.setCheckedSelected
    );

  return (
    <Drawer
      open={open}
      width="lg"
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center bg-blue-600 rounded-lg text-white">
            <Map size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {t("wards.linkTitle")}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex gap-3 p-6 h-[75vh]">
        <LinkWardTabs
          activeTab={state.activeTab}
          totalUnassignedForHeader={totalUnassignedForHeader}
          totalViewAllCount={totalViewAllCount}
          allAvailableWards={allAvailableWards}
          wardAssignments={wardAssignments}
          selectedWards={state.selectedWards}
          availableSearch={state.availableSearch}
          availablePage={state.availablePage}
          availablePageSize={state.availablePageSize}
          checkedAvailable={state.checkedAvailable}
          loading={state.loading}
          viewAllWards={state.viewAllWards}
          viewAllSearch={state.viewAllSearch}
          viewWardPage={state.viewWardPage}
          viewWardPageSize={state.viewWardPageSize}
          totalViewAllPages={state.totalViewAllPages}
          onTabChange={state.handleTabChange}
          onAvailableSearch={handlers.handleAvailableSearch}
          onToggleAvailable={toggleAvailable}
          onAvailablePageChange={handlers.updateAvailablePage}
          onAvailablePageSizeChange={handlers.updateAvailablePageSize}
          onViewAllSearch={handlers.handleViewAllSearch}
          onViewWardPageChange={handlers.updateViewWardPage}
          onViewWardPageSizeChange={handlers.updateViewWardPageSize}
          t={t}
        />

        <div className="flex flex-col gap-2 justify-center">
          <NextPageButton
            onClick={moveToSelected}
            disabled={state.checkedAvailable.size === 0 || state.loading}
            aria-label={t('wards.moveRight')}
          />
          <PrevPageButton
            onClick={moveToAvailable}
            disabled={state.checkedSelected.size === 0 || state.loading}
            aria-label={t('wards.moveLeft')}
          />
        </div>

        <RateSectionWards
          filteredSelected={state.filteredSelected}
          selectedSearch={state.selectedSearch}
          selectedPage={state.selectedPage}
          selectedPageSize={state.selectedPageSize}
          selectedWardsTotalCount={state.selectedWardsTotalCount}
          checkedSelected={state.checkedSelected}
          selectedZoneNo={selectedZoneNo}
          selectedZoneName={selectedZoneName}
          onSearch={handlers.handleSelectedSearch}
          onToggle={toggleSelected}
          onPageChange={handlers.updateSelectedPage}
          onPageSizeChange={handlers.updateSelectedPageSize}
        />
      </div>
    </Drawer>
  );
}