/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useCallback } from "react";
import { NewProperty, OldPropertyCandidate, FloorDetail, SearchOldPropertiesParams, SearchOldPropertySuggestion } from "@/types/property-mapping";
import { searchOldPropertiesAction } from "@/app/[locale]/property-tax/property-mapping/action";
import { getFloorKey, calculateMatchScore } from "@/components/modules/property-tax/property-mapping/mappingScoreCalculator";

interface UsePropertySearchLogicProps {
  currentNewProperty: NewProperty | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCustomFloorDataMap: React.Dispatch<React.SetStateAction<Record<string, FloorDetail[]>>>;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

function mapSuggestionToCandidate(
  item: SearchOldPropertySuggestion,
  idx: number,
  currentNewProperty: NewProperty | undefined,
  prefix: string
): OldPropertyCandidate {
  const oldPropertyNo = String(item.oldPropertyNo || "");
  const oldPartitionNo = item.oldPartitionNo ? String(item.oldPartitionNo) : undefined;
  const oldOwnerName = item.oldOwnerName ? String(item.oldOwnerName) : "";
  const oldOccupierName = item.oldOccupierName ? String(item.oldOccupierName) : "";
  const oldAddress = item.oldAddress ? String(item.oldAddress) : "";
  const oldConstructionArea = typeof item.oldConstructionArea === "number" ? item.oldConstructionArea : 0;
  const oldFloor = item.oldFloor ? String(item.oldFloor) : "";
  const oldTotalTax = typeof item.oldTotalTax === "number" ? item.oldTotalTax : 0;
  const oldCSN = item.oldCSN ? String(item.oldCSN) : undefined;
  const oldRV = typeof item.oldRV === "number" ? item.oldRV : 0;
  const oldUseType = item.oldUseType ? String(item.oldUseType) : "";
  const oldWardNo = item.oldWardNo ? String(item.oldWardNo) : "";
  const oldZoneNo = item.oldZoneNo ? String(item.oldZoneNo) : "";
  const oldPlotNo = item.oldPlotNo ? String(item.oldPlotNo) : "";
  const isMapped = Boolean(item.isMapped);
  const mappedNewPropertyNo = item.mappedNewPropertyNo ? String(item.mappedNewPropertyNo) : null;

  const newPropertyRef = {
    propNo: currentNewProperty?.propNo || "",
    owner: currentNewProperty?.owner || "",
    address: currentNewProperty?.address || "",
    builtUpArea: currentNewProperty?.builtUpArea || 0,
    floors: currentNewProperty?.floors || "",
    tax: currentNewProperty?.tax || 0,
    cts: currentNewProperty?.cts || "",
    rv: currentNewProperty?.rv || 0,
    use: currentNewProperty?.use || "",
    ward: currentNewProperty?.ward || "",
    zone: currentNewProperty?.zone || "",
    plotNo: currentNewProperty?.plotNo || "",
    constructionYear: currentNewProperty?.constructionYear || ""
  };

  const score = calculateMatchScore(newPropertyRef, {
    propNo: oldPropertyNo,
    owner: oldOwnerName || oldOccupierName,
    address: oldAddress,
    area: oldConstructionArea,
    floors: oldFloor,
    tax: oldTotalTax,
    cts: oldCSN,
    rv: oldRV,
    use: oldUseType,
    ward: oldWardNo,
    zone: oldZoneNo,
    plotNo: oldPlotNo,
    constructionYear: item.oldConstructionYear ? String(item.oldConstructionYear) : (item.oldAssessmentYear ? String(item.oldAssessmentYear) : "")
  });

  const detailsOld = Array.isArray(item.propertyDetailsOld) ? item.propertyDetailsOld : [];
  const candCarpetArea = detailsOld.reduce((sum: number, d: Record<string, unknown>) => sum + (typeof d.oldCarpetAreaSqFeet === "number" ? d.oldCarpetAreaSqFeet : 0), 0);

  return {
    id: String(item.id || idx) + "-" + prefix + "-" + idx,
    status: isMapped
      ? (mappedNewPropertyNo === currentNewProperty?.propNo ? "Mapped" as const : "Blocked" as const)
      : "Unmapped" as const,
    isMapped: isMapped,
    mappedNewPropertyNo: mappedNewPropertyNo,
    isSearchResult: true,
    propNo: oldPropertyNo,
    partitionNo: oldPartitionNo,
    owner: oldOwnerName || oldOccupierName,
    address: oldAddress,
    area: oldConstructionArea,
    carpetArea: candCarpetArea,
    tax: oldTotalTax,
    floors: oldFloor,
    evidence: [
      { text: `Ward ${oldWardNo}`, type: "good" as const },
      { text: `Zone ${oldZoneNo}`, type: "good" as const },
      { text: `Search Result`, type: "good" as const }
    ],
    score: score,
    isHardConflict: false,
    belongsToNewId: currentNewProperty?.propNo || "",
    cts: oldCSN,
    rv: oldRV,
    use: oldUseType,
    ward: oldWardNo,
    zone: oldZoneNo,
    plotNo: oldPlotNo,
    constructionYear: item.oldConstructionYear ? String(item.oldConstructionYear) : (item.oldAssessmentYear ? String(item.oldAssessmentYear) : "")
  };
}

export function usePropertySearchLogic({
  currentNewProperty,
  searchQuery,
  setSearchQuery,
  setCustomFloorDataMap,
  showToast,
}: UsePropertySearchLogicProps) {
  const [isManualSearching, setIsManualSearching] = useState(false);
  const [isAutoSearching, setIsAutoSearching] = useState(false);
  const isSearchingServer = isManualSearching || isAutoSearching;

  const autoSearchedPropNos = useRef<Set<string>>(new Set());

  const [serverSearchedCandidates, setServerSearchedCandidates] = useState<OldPropertyCandidate[]>([]);
  const [autoSearchedCandidates, setAutoSearchedCandidates] = useState<OldPropertyCandidate[]>([]);

  const updateFloorMapFromSuggestions = useCallback((suggestions: SearchOldPropertySuggestion[]) => {
    setCustomFloorDataMap(prev => {
      const updated = { ...prev };
      suggestions.forEach(item => {
        if (item.oldPropertyNo && Array.isArray(item.propertyDetailsOld)) {
          const key = getFloorKey(String(item.oldPropertyNo), item.oldPartitionNo ? String(item.oldPartitionNo) : null);
          updated[key] = item.propertyDetailsOld.map((floor) => ({
            floor: String(floor.floorDescription || floor.oldFloorId || ""),
            use: String(floor.typeOfUseDescription || ""),
            construction: String(floor.constructionTypeDescription || ""),
            carpetAreaSqFeet: typeof floor.oldCarpetAreaSqFeet === "number" ? floor.oldCarpetAreaSqFeet : 0,
            builtupAreaSqFeet: typeof floor.oldBuiltupAreaSqFeet === "number" ? floor.oldBuiltupAreaSqFeet : 0,
            level: "good" as const,
            constructionYear: floor.oldConstructionYear ? String(floor.oldConstructionYear) : (floor.constructionYearValue ? String(floor.constructionYearValue) : undefined),
            assessmentYear: floor.oldAssessmentYear ? String(floor.oldAssessmentYear) : (floor.assessmentYearValue ? String(floor.assessmentYearValue) : undefined)
          }));
        }
      });
      return updated;
    });
  }, [setCustomFloorDataMap]);

  const performServerSearch = async (term: string) => {
    if (!term || term.trim().length < 3) return;
    const cleanTerm = term.trim();
    setIsManualSearching(true);
    try {
      const res = await searchOldPropertiesAction({ searchTerm: cleanTerm, pageSize: -1 });
      if (res && res.oldPropertySuggestions) {
        setServerSearchedCandidates(
          res.oldPropertySuggestions.map((item, idx) => mapSuggestionToCandidate(item, idx, currentNewProperty, "search"))
        );
        updateFloorMapFromSuggestions(res.oldPropertySuggestions);
      } else {
        setServerSearchedCandidates([]);
      }
    } catch (err) {
      console.error("performServerSearch failed:", err);
      showToast("Server search failed", "error");
    } finally {
      setIsManualSearching(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setServerSearchedCandidates([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!currentNewProperty || !currentNewProperty.propNo || autoSearchedPropNos.current.has(currentNewProperty.propNo)) {
      if (!currentNewProperty?.propNo) setAutoSearchedCandidates([]);
      return;
    }

    const triggerAutoSearch = async () => {
      autoSearchedPropNos.current.add(currentNewProperty.propNo);
      setIsAutoSearching(true);
      try {
        const params: SearchOldPropertiesParams = { pageSize: -1 };
        if (currentNewProperty.owner) params.oldOwnerName = currentNewProperty.owner;
        if (currentNewProperty.mobile) params.oldMobileNo = currentNewProperty.mobile;
        if (currentNewProperty.address) params.oldAddress = currentNewProperty.address;
        if (currentNewProperty.constructionYear) params.oldConstructionYear = currentNewProperty.constructionYear;

        if (Object.keys(params).length <= 1) {
          setAutoSearchedCandidates([]);
          return;
        }

        const res = await searchOldPropertiesAction(params);
        if (res && res.oldPropertySuggestions) {
          setAutoSearchedCandidates(
            res.oldPropertySuggestions.map((item, idx) => mapSuggestionToCandidate(item, idx, currentNewProperty, "auto"))
          );
          updateFloorMapFromSuggestions(res.oldPropertySuggestions);
        } else {
          setAutoSearchedCandidates([]);
        }
      } catch (err) {
        console.error("Auto background search failed:", err);
      } finally {
        setIsAutoSearching(false);
      }
    };

    triggerAutoSearch();
  }, [currentNewProperty?.propNo, currentNewProperty, updateFloorMapFromSuggestions]);

  const resetSearch = () => {
    setSearchQuery("");
    setServerSearchedCandidates([]);
  };

  return {
    isManualSearching,
    isAutoSearching,
    isSearchingServer,
    serverSearchedCandidates,
    autoSearchedCandidates,
    performServerSearch,
    resetSearch,
  };
}
