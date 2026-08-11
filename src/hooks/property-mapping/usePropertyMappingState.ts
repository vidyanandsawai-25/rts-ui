import { useState, useMemo } from "react";
import { NewProperty, OldPropertyCandidate, FloorDetail, MappingLink, AuditHistory, MappedPropertyApiResponse } from "@/types/property-mapping";
import { getFloorKey, calculateMatchScore } from "@/components/modules/property-tax/property-mapping/mappingScoreCalculator";

export function usePropertyMappingState(
  initialMappingData: MappedPropertyApiResponse | null | undefined,
  queryPropertyId: string | null,
  customFloorDataMap: Record<string, FloorDetail[]>
) {
  const [selectedNewIndex, setSelectedNewIndex] = useState<number>(0);

  const [newProperties, setNewProperties] = useState<NewProperty[]>(() => {
    if (initialMappingData?.items?.length) {
      const first = initialMappingData.items[0];
      const newInfo = first.newPropertyInfo;
      const newDetails = first.newPropertyDetails || [];

      const openPlotFloor = newDetails.find(d => d.isOpenPlot);
      const plotAreaVal = openPlotFloor ? openPlotFloor.builtupAreaSqFeet : 0;
      const builtUpAreaVal = newDetails.filter(d => !d.isOpenPlot).reduce((sum, d) => sum + d.builtupAreaSqFeet, 0);
      const carpetAreaVal = newDetails.filter(d => !d.isOpenPlot).reduce((sum, d) => sum + d.carpetAreaSqFeet, 0);

      const nonOpenPlotFloors = newDetails.filter(d => !d.isOpenPlot);
      const floorLabels = nonOpenPlotFloors.map(d => d.floorDescription || d.floorCode).filter(Boolean);
      const floorsText = floorLabels.length > 0 ? floorLabels.join(", ") : "";

      const fullPropNo = [newInfo?.wardNo, newInfo?.propertyNo, newInfo?.partitionNo].filter(Boolean).join(" - ");
      const transRecord = first.transMastRecords?.[0] || null;

      const rvVal = transRecord?.calculationValue ?? 0;
      const taxVal = transRecord?.taxAmount ?? 0;

      return [{
        id: "dyn-" + (newInfo?.id || queryPropertyId || ""),
        propNo: newInfo?.propertyNo || "",
        partitionNo: newInfo?.partitionNo || "",
        fullPropNo: fullPropNo,
        owner: newInfo?.ownerName || newInfo?.ownerNameEnglish || first.oldOwnerName || first.oldOccupierName || "",
        address: newInfo?.address || newInfo?.addressEnglish || first.oldAddress || "",
        mobile: newInfo?.mobileNo || first.oldMobileNo || "",
        plotArea: plotAreaVal,
        builtUpArea: builtUpAreaVal,
        carpetArea: carpetAreaVal,
        floors: floorsText,
        use: newInfo?.propertyTypeDescription || first.oldUseType || "",
        rv: rvVal,
        tax: taxVal,
        cts: newInfo?.csn || first.oldCSN || "",
        status: initialMappingData?.items?.some(item => Boolean(item.oldPropertyNo)) ? "Mapped" : "Needs verification",
        verificationResult: initialMappingData?.items?.some(item => Boolean(item.oldPropertyNo)) ? "Verified & Mapped" : "Pending review",
        remark: "",
        mappingType: first.mappingCategory === "SPLIT" ? "Split" : "1 → 1",
        ward: newInfo?.wardNo || "",
        zone: newInfo?.taxZoneNo || "",
        plotNo: newInfo?.plotNo || "",
        constructionYear: newDetails[0]?.constructionYear || ""
      }];
    }
    return [{
      id: "dyn-empty", propNo: "", partitionNo: "", fullPropNo: "", owner: "", address: "", mobile: "",
      plotArea: 0, builtUpArea: 0, carpetArea: 0, floors: "", use: "", rv: 0, tax: 0, cts: "",
      status: "Needs verification", verificationResult: "Pending review", remark: "", mappingType: "1 → 1",
      ward: "", zone: "", plotNo: "", constructionYear: ""
    }];
  });

  const currentNewProperty = useMemo(() => {
    return newProperties[selectedNewIndex] || newProperties[0];
  }, [newProperties, selectedNewIndex]);

  const [candidates] = useState<OldPropertyCandidate[]>(() => {
    if (initialMappingData?.items?.length) {
      const first = initialMappingData.items[0];
      const newInfo = first.newPropertyInfo;
      const newDetails = first.newPropertyDetails || [];
      const ownerName = newInfo?.ownerName || newInfo?.ownerNameEnglish || first.oldOwnerName || first.oldOccupierName || "";
      const addressVal = newInfo?.address || newInfo?.addressEnglish || first.oldAddress || "";
      const ctsVal = newInfo?.csn || first.oldCSN || "";

      const builtUpAreaVal = newDetails.filter(d => !d.isOpenPlot).reduce((sum, d) => sum + d.builtupAreaSqFeet, 0);
      const nonOpenPlotFloors = newDetails.filter(d => !d.isOpenPlot);
      const floorLabels = nonOpenPlotFloors.map(d => d.floorDescription || d.floorCode).filter(Boolean);
      const floorsText = floorLabels.length > 0 ? floorLabels.join(", ") : "";
      const transRecord = first.transMastRecords?.[0] || null;
      const rvVal = transRecord?.calculationValue ?? 0;
      const taxVal = transRecord?.taxAmount ?? 0;

      const newPropRef = {
        propNo: newInfo?.propertyNo || "",
        owner: ownerName,
        address: addressVal,
        builtUpArea: builtUpAreaVal,
        floors: floorsText,
        tax: taxVal,
        cts: ctsVal,
        rv: rvVal,
        use: newInfo?.propertyTypeDescription || first.oldUseType || "",
        ward: newInfo?.wardNo || "",
        zone: newInfo?.taxZoneNo || "",
        plotNo: newInfo?.plotNo || "",
        constructionYear: newDetails[0]?.constructionYear || ""
      };

      return initialMappingData.items
        .filter(item => Boolean(item.oldPropertyNo))
        .map((item, idx) => {
          const itemTrans = item.transMastRecords?.[0] || null;
          const itemTax = itemTrans?.taxAmount ?? (item.oldTotalTax || 0);
          const itemRv = itemTrans?.calculationValue ?? (item.oldRV || 0);
          const candCarpetArea = (item.propertyDetailsOld || []).reduce((sum, d) => sum + (d.oldCarpetAreaSqFeet || 0), 0);

          const candScore = calculateMatchScore(newPropRef, {
            propNo: item.oldPropertyNo || "",
            owner: item.oldOwnerName || item.oldOccupierName || ownerName,
            address: item.oldAddress || addressVal,
            area: item.oldConstructionArea || 0,
            floors: item.oldFloor || "",
            tax: itemTax,
            cts: item.oldCSN || ctsVal,
            rv: itemRv,
            use: item.oldUseType || "",
            ward: item.oldWardNo || "",
            zone: item.oldZoneNo || "",
            plotNo: item.oldPlotNo || "",
            constructionYear: item.oldConstructionYear ? String(item.oldConstructionYear) : (item.oldAssessmentYear ? String(item.oldAssessmentYear) : "")
          });

          return {
            id: String(item.propertyId) + "-initial-" + idx,
            status: "Mapped" as const,
            isMapped: true,
            mappedNewPropertyNo: newInfo?.propertyNo || "",
            propNo: item.oldPropertyNo || "",
            partitionNo: item.oldPartitionNo || undefined,
            owner: item.oldOwnerName || item.oldOccupierName || ownerName,
            address: item.oldAddress || addressVal,
            area: item.oldConstructionArea || 0,
            carpetArea: candCarpetArea,
            tax: itemTax,
            floors: item.oldFloor || "",
            evidence: [
              { text: `Ward ${item.oldWardNo || ""}`, type: "good" as const },
              { text: `Zone ${item.oldZoneNo || ""}`, type: "good" as const },
              { text: `Category ${item.mappingCategory || "ONE_TO_ONE"}`, type: "good" as const }
            ],
            score: candScore,
            isHardConflict: false,
            belongsToNewId: newInfo?.propertyNo || "",
            cts: item.oldCSN || ctsVal,
            rv: itemRv,
            use: item.oldUseType || "",
            ward: item.oldWardNo || "",
            zone: item.oldZoneNo || "",
            plotNo: item.oldPlotNo || "",
            constructionYear: item.oldConstructionYear ? String(item.oldConstructionYear) : (item.oldAssessmentYear ? String(item.oldAssessmentYear) : "")
          };
        });
    }
    return [];
  });

  const [activeCheckedIds, setActiveCheckedIds] = useState<string[]>(() => {
    return candidates.filter(c => c.isMapped).map(c => c.id);
  });

  const [mappedOldPropNos, setMappedOldPropNos] = useState<string[]>(() => {
    return candidates.filter(c => c.isMapped).map(c => c.propNo);
  });

  const [mappings, setMappings] = useState<MappingLink[]>(() => {
    if (initialMappingData?.items?.length) {
      const first = initialMappingData.items[0];
      const newInfo = first.newPropertyInfo;
      const oldPropNos = initialMappingData.items.map(i => i.oldPropertyNo).filter(Boolean) as string[];

      if (oldPropNos.length > 0) {
        return [{
          id: "ML-" + (first.propertyId || "101"),
          newPropNo: newInfo?.propertyNo || "",
          oldPropNos: oldPropNos,
          status: "Mapped",
          mapType: first.mappingCategory === "SPLIT" ? "Split (1 New → Multiple Old)" : "1 → 1 (One-to-One)",
          confidence: 100,
          note: "Initial mapping record",
          mappedBy: "Officer User",
          mappedAt: new Date().toISOString().split('T')[0]
        }];
      }
    }
    return [];
  });

  const [historyList, setHistoryList] = useState<AuditHistory[]>(() => {
    if (initialMappingData?.items?.length) {
      const first = initialMappingData.items[0];
      const newInfo = first.newPropertyInfo;
      const oldPropNos = initialMappingData.items.map(i => i.oldPropertyNo).filter(Boolean) as string[];

      return [{
        id: "H-1",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: "Mapped",
        newPropNo: newInfo?.propertyNo || "",
        oldPropNos: oldPropNos,
        user: "Officer User",
        reason: "Initial property mapping loaded from legacy API records."
      }];
    }
    return [];
  });

  const [compareCandidate, setCompareCandidate] = useState<OldPropertyCandidate | null>(null);

  const initialFloorDataMap = useMemo(() => {
    const map: Record<string, FloorDetail[]> = {};
    if (initialMappingData?.items) {
      initialMappingData.items.forEach(item => {
        if (item.oldPropertyNo && item.propertyDetailsOld) {
          const key = getFloorKey(item.oldPropertyNo, item.oldPartitionNo);
          map[key] = item.propertyDetailsOld.map((floor: Record<string, unknown>) => ({
            floor: String(floor.floorDescription || floor.oldFloorId || ""),
            use: String(floor.typeOfUseDescription || ""),
            construction: String(floor.constructionTypeDescription || ""),
            carpetAreaSqFeet: Number(floor.oldCarpetAreaSqFeet || 0),
            builtupAreaSqFeet: Number(floor.oldBuiltupAreaSqFeet || 0),
            level: "good" as const,
            constructionYear: floor.oldConstructionYear ? String(floor.oldConstructionYear) : (floor.constructionYearValue ? String(floor.constructionYearValue) : undefined),
            assessmentYear: floor.oldAssessmentYear ? String(floor.oldAssessmentYear) : (floor.assessmentYearValue ? String(floor.assessmentYearValue) : undefined)
          }));
        }
      });
    }
    return map;
  }, [initialMappingData]);

  const activeFloorDataMap = useMemo(() => {
    return { ...initialFloorDataMap, ...customFloorDataMap };
  }, [initialFloorDataMap, customFloorDataMap]);

  return {
    selectedNewIndex,
    setSelectedNewIndex,
    newProperties,
    setNewProperties,
    currentNewProperty,
    candidates,
    activeCheckedIds,
    setActiveCheckedIds,
    mappedOldPropNos,
    setMappedOldPropNos,
    mappings,
    setMappings,
    historyList,
    setHistoryList,
    compareCandidate,
    setCompareCandidate,
    activeFloorDataMap,
  };
}
