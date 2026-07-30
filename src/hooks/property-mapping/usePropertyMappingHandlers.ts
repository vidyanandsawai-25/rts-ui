import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { NewProperty, OldPropertyCandidate, FloorDetail, MappingLink, AuditHistory } from "@/types/property-mapping";
import { getFloorKey } from "@/components/modules/property-tax/property-mapping/mappingScoreCalculator";
import { useConfirm } from "@/components/common/ConfirmProvider";

interface UsePropertyMappingHandlersProps {
  currentNewProperty: NewProperty | undefined;
  selectedCandidates: OldPropertyCandidate[];
  activeFloorDataMap: Record<string, FloorDetail[]>;
  inferredMappingType: string;
  selectedNewIndex: number;
  newProperties: NewProperty[];
  setNewProperties: React.Dispatch<React.SetStateAction<NewProperty[]>>;
  setSelectedNewIndex: React.Dispatch<React.SetStateAction<number>>;
  setMappings: React.Dispatch<React.SetStateAction<MappingLink[]>>;
  setHistoryList: React.Dispatch<React.SetStateAction<AuditHistory[]>>;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const formatNewPropertyDisplayNo = (p: NewProperty) => {
  if (p.fullPropNo) return p.fullPropNo as string;
  const parts = [p.ward, p.propNo, p.partitionNo && p.partitionNo !== "0" ? p.partitionNo : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : p.propNo;
};

const formatCandidateDisplayNo = (c: OldPropertyCandidate) => {
  const wardStr = c.ward ? (c.ward.toLowerCase().startsWith("ward") ? c.ward : `Ward ${c.ward}`) : "";
  const propStr = c.propNo || "";
  const partitionStr = c.partitionNo && c.partitionNo !== "0" ? ` / ${c.partitionNo}` : "";
  const fullProp = `${propStr}${partitionStr}`;
  return wardStr ? `${wardStr} - ${fullProp}` : fullProp;
};

export function usePropertyMappingHandlers({
  currentNewProperty,
  selectedCandidates,
  activeFloorDataMap,
  inferredMappingType,
  selectedNewIndex,
  newProperties,
  setNewProperties,
  setSelectedNewIndex,
  setMappings,
  setHistoryList,
  showToast,
}: UsePropertyMappingHandlersProps) {
  const t = useTranslations("propertyMapping");
  const { confirm } = useConfirm();

  const metrics = useMemo(() => {
    const totalOldArea = selectedCandidates.reduce((acc, c) => acc + c.area, 0);
    const areaDiff = (currentNewProperty?.builtUpArea || 0) - totalOldArea;
    const areaPercentDiff = totalOldArea > 0 ? (areaDiff / totalOldArea) * 100 : 0;

    const totalOldCarpetArea = selectedCandidates.reduce((acc, c) => acc + (c.carpetArea || 0), 0);
    const carpetAreaDiff = (currentNewProperty?.carpetArea || 0) - totalOldCarpetArea;
    const carpetAreaPercentDiff = totalOldCarpetArea > 0 ? (carpetAreaDiff / totalOldCarpetArea) * 100 : 0;

    const totalOldTax = selectedCandidates.reduce((acc, c) => acc + c.tax, 0);
    const taxDiff = (currentNewProperty?.tax || 0) - totalOldTax;
    const taxPercentDiff = totalOldTax > 0 ? (taxDiff / totalOldTax) * 100 : 0;

    let floorStatus = t("comparisonCards.floorCard.floorStatus.noMatchingLayout");
    let floorStatusLevel = "bad";
    if (selectedCandidates.length > 0) {
      const newKey = getFloorKey(currentNewProperty?.propNo || "", currentNewProperty?.partitionNo);
      const newFloorsCount = activeFloorDataMap[newKey]
        ? activeFloorDataMap[newKey].filter((f) => f.floor !== "Open Plot" && f.floor !== "OP").length
        : currentNewProperty?.floors?.toLowerCase().includes("ground + 1") ? 2 : 1;

      const oldFloorsCount = selectedCandidates.reduce((acc, c) => {
        const candKey = getFloorKey(c.propNo, c.partitionNo);
        if (activeFloorDataMap[candKey]) return acc + activeFloorDataMap[candKey].length;
        return acc + (c.floors.toLowerCase().includes("g + 1") ? 2 : 1);
      }, 0);

      if (oldFloorsCount === newFloorsCount) {
        floorStatus = t("comparisonCards.floorCard.floorStatus.matched");
        floorStatusLevel = "good";
      } else if (oldFloorsCount < newFloorsCount) {
        floorStatus = t("comparisonCards.floorCard.floorStatus.oldIsLess");
        floorStatusLevel = "warn";
      } else {
        floorStatus = t("comparisonCards.floorCard.floorStatus.oldIsMore");
        floorStatusLevel = "bad";
      }
    }

    return {
      totalOldArea, areaDiff, areaPercentDiff,
      totalOldCarpetArea, carpetAreaDiff, carpetAreaPercentDiff,
      totalOldTax, taxDiff, taxPercentDiff,
      floorStatus, floorStatusLevel,
    };
  }, [currentNewProperty, selectedCandidates, activeFloorDataMap, t]);

  const validationStatus = useMemo(() => {
    const warnings: string[] = [];
    let isValid = true;
    let errorMsg: string | null = null;

    if (selectedCandidates.some((c) => c.isHardConflict)) {
      isValid = false;
      errorMsg = t("validation.hardConflict");
    }

    if (selectedCandidates.length === 0) {
      if (!currentNewProperty?.remark?.trim()) {
        isValid = false;
        errorMsg = t("validation.remarkRequired");
      }
    } else {
      if (Math.abs(metrics.areaPercentDiff) > 10) {
        warnings.push(t("validation.areaVariance", { value: metrics.areaPercentDiff.toFixed(1) }));
      }
      if (Math.abs(metrics.taxPercentDiff) > 10) {
        warnings.push(t("validation.taxVariance", { value: metrics.taxPercentDiff.toFixed(1) }));
      }
    }

    return { isValid, errorMsg, warnings };
  }, [selectedCandidates, metrics, currentNewProperty, t]);

  const handleConfirmMapping = () => {
    if (!currentNewProperty || !validationStatus.isValid) return;

    const updatedRemark = (currentNewProperty.remark || "").trim();
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const newPropNo = currentNewProperty.propNo;
    const oldPropNos = selectedCandidates.map((c) => c.propNo);

    const displayNewPropNo = formatNewPropertyDisplayNo(currentNewProperty);
    const displayOldPropNos = selectedCandidates.map(formatCandidateDisplayNo).join(", ");

    const executeMerge = () => {
      const defaultRemark = selectedCandidates.length === 0 ? t("auditDefaultRemarks.newSurvey") : t("auditDefaultRemarks.mappingConfirmed");
      const finalRemark = updatedRemark || defaultRemark;

      if (selectedCandidates.length === 0) {
        setMappings((prev) => prev.filter((m) => m.newPropNo !== newPropNo));
        setHistoryList((prev) => [
          ...prev,
          { id: `H-${Date.now()}`, time: timestamp, action: "Unmapped", newPropNo, oldPropNos: [], user: "Verification Officer", reason: finalRemark },
        ]);
        setNewProperties((prev) => prev.map((p, idx) => (idx === selectedNewIndex ? { ...p, remark: finalRemark, status: "Unmapped" } : p)));
        showToast(t("toasts.markedUnmapped", { propNo: displayNewPropNo }), "info");
      } else {
        const newMapping: MappingLink = {
          id: `MAP-${Date.now().toString().slice(-4)}`, newPropNo, oldPropNos, mapType: inferredMappingType, confidence: 98, note: finalRemark, mappedBy: "Verification Officer", mappedAt: timestamp, status: "Mapped",
        };
        setMappings((prev) => [...prev.filter((m) => m.newPropNo !== newPropNo), newMapping]);
        setHistoryList((prev) => [
          ...prev,
          { id: `H-${Date.now()}`, time: timestamp, action: "Mapped", newPropNo, oldPropNos, user: "Verification Officer", reason: finalRemark },
        ]);
        setNewProperties((prev) => prev.map((p, idx) => (idx === selectedNewIndex ? { ...p, remark: finalRemark, status: "Mapped" } : p)));
        showToast(t("toasts.mappingConfirmed", { propNo: displayNewPropNo }), "success");
      }

      if (selectedNewIndex < newProperties.length - 1) {
        setTimeout(() => setSelectedNewIndex((prev) => prev + 1), 600);
      }
    };

    if (selectedCandidates.length === 0) {
      confirm({
        variant: "warning",
        title: t("dialogs.markUnmapped.title"),
        description: t("dialogs.markUnmapped.description", { newPropNo: displayNewPropNo }),
        confirmText: t("dialogs.markUnmapped.confirmText"),
        cancelText: t("dialogs.markUnmapped.cancelText"),
        onConfirm: executeMerge,
      });
    } else {
      confirm({
        variant: "info",
        title: t("dialogs.confirmMerge.title"),
        description: t("dialogs.confirmMerge.description", { newPropNo: displayNewPropNo, oldPropNos: displayOldPropNos }),
        confirmText: t("dialogs.confirmMerge.confirmText"),
        cancelText: t("dialogs.confirmMerge.cancelText"),
        onConfirm: executeMerge,
      });
    }
  };

  const handleDisconnectMapping = (newPropNo: string, mId: string) => {
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const targetProp = newProperties.find((p) => p.propNo === newPropNo);
    const displayPropNo = targetProp ? formatNewPropertyDisplayNo(targetProp) : newPropNo;

    confirm({
      variant: "delete",
      title: t("dialogs.unmapProperty.title"),
      description: t("dialogs.unmapProperty.description", { mId, newPropNo: displayPropNo }),
      confirmText: t("dialogs.unmapProperty.confirmText"),
      cancelText: t("dialogs.unmapProperty.cancelText"),
      onConfirm: () => {
        setMappings((prev) => prev.filter((m) => m.id !== mId));
        setHistoryList((prev) => [
          ...prev,
          { id: `H-${Date.now()}`, time: timestamp, action: "Unmapped", newPropNo, oldPropNos: [], user: "Verification Officer", reason: t("auditDefaultRemarks.unmapManual") },
        ]);
        setNewProperties((prev) => prev.map((p) => (p.propNo === newPropNo ? { ...p, status: "Needs verification" } : p)));
        showToast(t("toasts.unmapped", { propNo: displayPropNo }), "info");
      },
    });
  };

  return {
    metrics,
    validationStatus,
    handleConfirmMapping,
    handleDisconnectMapping,
  };
}
