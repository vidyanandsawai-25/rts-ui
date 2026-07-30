"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageContainer, WaitingWindow } from "@/components/common";
import { FloorDetail, MappedPropertyApiResponse } from "@/types/property-mapping";

import { usePropertyMappingState } from "@/hooks/property-mapping/usePropertyMappingState";
import { usePropertySearchLogic } from "@/hooks/property-mapping/usePropertySearchLogic";
import { usePropertyCandidates } from "@/hooks/property-mapping/usePropertyCandidates";
import { usePropertyMappingHandlers } from "@/hooks/property-mapping/usePropertyMappingHandlers";

import { MappingHeader } from "./MappingHeader";
import { PropertyMappingWorkspace } from "./PropertyMappingWorkspace";
import { DiffModal } from "./PropertyDetailsDiffModal";
import { ActiveMappingsRegister } from "./ConfirmedMappingsTab";
import { AuditTrail } from "./MappingHistoryTab";

interface PropertyMappingProps {
  initialMappingData?: MappedPropertyApiResponse | null;
  initialSearchParams?: Record<string, string | string[] | undefined>;
}

export default function PropertyMapping({ initialMappingData, initialSearchParams }: PropertyMappingProps) {
  const t = useTranslations("propertyMapping");
  const router = useRouter();
  const pathname = usePathname();
  const fallbackSearchParams = useSearchParams();

  const searchParams = useMemo(() => {
    if (initialSearchParams) {
      return { get: (key: string) => { const val = initialSearchParams[key]; return Array.isArray(val) ? val[0] : (val ?? null); } };
    }
    return fallbackSearchParams;
  }, [initialSearchParams, fallbackSearchParams]);

  const queryCv = searchParams.get("cv");
  const queryPropertyId = searchParams.get("propertyId");

  const isCapitalValue = useMemo(() => {
    if (initialMappingData?.items?.length) {
      const first = initialMappingData.items[0];
      if (first.transMastRecords?.length) return first.transMastRecords[0].calculationType === "CV";
    }
    return Boolean(queryCv);
  }, [initialMappingData, queryCv]);

  const rvLabel = isCapitalValue ? t("sidebar.fields.capitalValue") : t("sidebar.fields.rateableValue");
  const locale = useMemo(() => pathname.split("/").filter(Boolean)[0] || "en", [pathname]);

  const handleBack = () => {
    if (queryPropertyId) {
      router.push(`/${locale}/property-tax/ptis?propertyId=${queryPropertyId}&tab=olddetails`);
    } else {
      router.back();
    }
  };

  const [customFloorDataMap, setCustomFloorDataMap] = useState<Record<string, FloorDetail[]>>({});
  const [activeTab, setActiveTab] = useState<"workspace" | "mapped" | "history">("workspace");
  const [searchQuery, setSearchQuery] = useState("");
  const [mappingStateFilter, setMappingStateFilter] = useState("All");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const {
    selectedNewIndex, setSelectedNewIndex, newProperties, setNewProperties, currentNewProperty,
    candidates, setMappings, mappings, setHistoryList, historyList, compareCandidate, setCompareCandidate, activeFloorDataMap
  } = usePropertyMappingState(initialMappingData, queryPropertyId, customFloorDataMap);

  const {
    isManualSearching, isSearchingServer, serverSearchedCandidates, autoSearchedCandidates, performServerSearch, resetSearch
  } = usePropertySearchLogic({ currentNewProperty, searchQuery, setSearchQuery, setCustomFloorDataMap, showToast });

  const {
    autoCandidates, manualCandidates, activeCheckedIds, selectedCandidates, inferredMappingType,
    floorPropertyTabs, selectedFloorProperty, setSelectedFloorProperty, hoveredFloorIndex, setHoveredFloorIndex,
    mappedOldPropNos, handleToggleCandidate
  } = usePropertyCandidates({ currentNewProperty, candidates, autoSearchedCandidates, serverSearchedCandidates, searchQuery, activeFloorDataMap, mappings });

  const { metrics, validationStatus, handleConfirmMapping, handleDisconnectMapping } = usePropertyMappingHandlers({
    currentNewProperty, selectedCandidates, activeFloorDataMap, inferredMappingType, selectedNewIndex,
    newProperties, setNewProperties, setSelectedNewIndex, setMappings, setHistoryList, showToast
  });

  return (
    <PageContainer>
      <div className="flex flex-col w-full bg-[#f8fafc] text-slate-900 font-sans p-3 gap-4 relative">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-lg animate-fade-in ${
            toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            {toast.msg}
          </div>
        )}

        <MappingHeader activeTab={activeTab} setActiveTab={setActiveTab} mappings={mappings} newProperties={newProperties} handleBack={handleBack} />

        {activeTab === "workspace" && (
          <PropertyMappingWorkspace
            currentNewProperty={currentNewProperty}
            inferredMappingType={inferredMappingType}
            selectedNewIndex={selectedNewIndex}
            newPropertiesCount={newProperties.length}
            onPrevRecord={() => setSelectedNewIndex((prev) => Math.max(0, prev - 1))}
            onNextRecord={() => setSelectedNewIndex((prev) => Math.min(newProperties.length - 1, prev + 1))}
            rvLabel={rvLabel}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchingServer={isSearchingServer}
            onPerformSearch={performServerSearch}
            onResetFilters={() => { resetSearch(); setMappingStateFilter("All"); showToast(t("toasts.filtersReset"), "info"); }}
            mappingStateFilter={mappingStateFilter}
            setMappingStateFilter={setMappingStateFilter}
            filteredAutoCandidates={autoCandidates}
            filteredManualCandidates={manualCandidates}
            activeCheckedIds={activeCheckedIds}
            mappedOldPropNos={mappedOldPropNos}
            onToggleCandidate={handleToggleCandidate}
            onCompareClick={setCompareCandidate}
            hasSearchActive={Boolean(searchQuery.trim() || autoSearchedCandidates.length > 0)}
            selectedCandidates={selectedCandidates}
            metrics={metrics}
            floorPropertyTabs={floorPropertyTabs}
            selectedFloorProperty={selectedFloorProperty}
            setSelectedFloorProperty={setSelectedFloorProperty}
            activeFloorDataMap={activeFloorDataMap}
            hoveredFloorIndex={hoveredFloorIndex}
            setHoveredFloorIndex={setHoveredFloorIndex}
            validationStatus={validationStatus}
            onConfirmClick={handleConfirmMapping}
            stepNumbers={{ comparisonStep: 2, floorStep: 3 }}
          />
        )}

        {activeTab === "mapped" && <ActiveMappingsRegister mappings={mappings} onDisconnectMapping={handleDisconnectMapping} />}
        {activeTab === "history" && <AuditTrail historyList={historyList} />}

        <DiffModal candidate={compareCandidate} currentNewProperty={currentNewProperty} onClose={() => setCompareCandidate(null)} money={(val) => "₹" + val.toLocaleString("en-IN")} rvLabel={rvLabel} />
        <WaitingWindow isOpen={isManualSearching} title={t("waitingWindow.title")} message={t("waitingWindow.message")} />
      </div>
    </PageContainer>
  );
}
