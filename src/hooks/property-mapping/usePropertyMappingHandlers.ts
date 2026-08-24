import { useMemo, useState } from "react";
import { mergeSinglePropertyAction, mergeMultiplePropertiesAction, getMappedPropertiesAction, unmergeSinglePropertyAction, unmergeMultiplePropertiesAction } from "@/app/[locale]/property-tax/property-mapping/action";
import { MappedPropertyApiResponse } from "@/types/property-mapping";
import { useTranslations } from "next-intl";
import { NewProperty, OldPropertyCandidate, FloorDetail, MappingLink, AuditHistory } from "@/types/property-mapping";
import { getFloorKey } from "@/components/modules/property-tax/property-mapping/mappingScoreCalculator";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { getUsernameFromCookie } from "@/lib/utils/cookie";

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
  refreshMappingState?: (freshData: MappedPropertyApiResponse) => void;
  candidates?: OldPropertyCandidate[];
  mappings: MappingLink[];
  setCandidates?: React.Dispatch<React.SetStateAction<OldPropertyCandidate[]>>;
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
  refreshMappingState,
  candidates = [],
  mappings,
  setCandidates,
}: UsePropertyMappingHandlersProps) {
  const t = useTranslations("propertyMapping");
  const { confirm } = useConfirm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUserName = useMemo(() => getUsernameFromCookie() || "Admin", []);

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
    if (!currentNewProperty || !validationStatus.isValid) {
      return;
    }

    const updatedRemark = (currentNewProperty.remark || "").trim();
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const newPropNo = currentNewProperty.propNo;
    const oldPropNos = selectedCandidates.map((c) => c.propNo);

    const displayNewPropNo = formatNewPropertyDisplayNo(currentNewProperty);
    const displayOldPropNos = selectedCandidates.map(formatCandidateDisplayNo).join(", ");

    const executeMerge = async () => {
      const defaultRemark = selectedCandidates.length === 0 ? t("auditDefaultRemarks.newSurvey") : t("auditDefaultRemarks.mappingConfirmed");
      const finalRemark = updatedRemark || defaultRemark;

      if (selectedCandidates.length === 0) {
        setMappings((prev) => prev.filter((m) => m.newPropNo !== newPropNo));
        setHistoryList((prev) => [
          ...prev,
          { id: `H-${Date.now()}`, time: timestamp, action: "Unmapped", newPropNo, oldPropNos: [], user: currentUserName, reason: finalRemark },
        ]);
        setNewProperties((prev) => prev.map((p, idx) => (idx === selectedNewIndex ? { ...p, remark: finalRemark, status: "Unmapped" } : p)));
        showToast(t("toasts.markedUnmapped", { propNo: displayNewPropNo }), "info");
      } else if (selectedCandidates.length === 1) {
        // 1-to-1 Property Merge
        setIsSubmitting(true);
        try {
          const propertyId = parseInt(currentNewProperty.id.replace("dyn-", ""));
          const propertyOldId = parseInt(selectedCandidates[0].id.split("-")[0]);
          const latitude = String(currentNewProperty.latitude || "0");
          const longitude = String(currentNewProperty.longitude || "0");
          const location = String(currentNewProperty.location || "Default");

          // If the selected candidate is already mapped, unmerge first so the backend doesn't reject
          if (selectedCandidates[0].isMapped) {
            const unmergeRes = await unmergeSinglePropertyAction({
              propertyId,
              propertyOldId,
            });
            // Only fail if the unmerge explicitly returned success: false (not just null/undefined)
            if (unmergeRes && unmergeRes.success === false) {
              throw new Error(unmergeRes.message || t("toasts.unmergeFailed"));
            }
          }

          const response = await mergeSinglePropertyAction({
            propertyId,
            propertyOldId,
            latitude,
            longitude,
            location,
          });

          if (response && (response.success || response.items?.success)) {
            showToast((response.items?.message || response.message) || t("toasts.mappingConfirmed", { propNo: displayNewPropNo }), "success");

            // Re-fetch mapping data from backend to properly update UI state
            const freshData = await getMappedPropertiesAction(propertyId);
            if (freshData && refreshMappingState) {
              refreshMappingState(freshData);
            }
            
            // Always ensure the merged candidates appear in "Linked Old Properties"
            // even if refreshMappingState didn't populate them (backend may not return old property details immediately)
            if (setCandidates) {
              const mergedCandidates = selectedCandidates.map(c => ({
                ...c,
                isMapped: true,
                status: "Mapped" as const,
                mappedNewPropertyNo: currentNewProperty.propNo,
              }));
              setCandidates(prev => {
                const newList = [...prev];
                mergedCandidates.forEach(mc => {
                  const existingIdx = newList.findIndex(c => c.propNo === mc.propNo && c.partitionNo === mc.partitionNo);
                  if (existingIdx >= 0) {
                    newList[existingIdx] = mc;
                  } else {
                    newList.push(mc);
                  }
                });
                return newList;
              });
            }

            // Preserve existing audit trail logic on success
            const newMapping: MappingLink = {
              id: `MAP-${Date.now().toString().slice(-4)}`, newPropNo, oldPropNos, mapType: inferredMappingType, confidence: 98, note: finalRemark, mappedBy: currentUserName, mappedAt: timestamp, status: "Mapped",
            };
            setMappings((prev) => [...prev.filter((m) => m.newPropNo !== newPropNo), newMapping]);
            setHistoryList((prev) => [
              ...prev,
              { id: `H-${Date.now()}`, time: timestamp, action: "Mapped", newPropNo, oldPropNos, user: currentUserName, reason: finalRemark },
            ]);
            setNewProperties((prev) => prev.map((p, idx) => (idx === selectedNewIndex ? { ...p, remark: finalRemark, status: "Mapped" } : p)));
            
            if (selectedNewIndex < newProperties.length - 1) {
              setTimeout(() => setSelectedNewIndex((prev) => prev + 1), 600);
            }
          } else {
            showToast(response?.message || t("toasts.mergeFailed"), "error");
          }
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : t("toasts.mergeFailed");
          showToast(errMsg, "error");
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // 1-to-many Property Merge
        setIsSubmitting(true);
        try {
          const propertyId = parseInt(currentNewProperty.id.replace("dyn-", ""));
          const propertyOldIds = selectedCandidates.map((c) => parseInt(c.id.split("-")[0]));
          
          const latitude = String(currentNewProperty.latitude || "0");
          const longitude = String(currentNewProperty.longitude || "0");
          const location = String(currentNewProperty.location || "Default");

          // ORCHESTRATION TO BYPASS BACKEND VALIDATION:
          // The C# backend POST /PropertyMerge explicitly throws if ANY of the properties are already mapped.
          // Since we are trying to append to an already mapped property, we MUST unmap the existing ones first!
          const alreadyMappedCandidates = selectedCandidates.filter(c => c.isMapped);
          if (alreadyMappedCandidates.length > 0) {
            // Unmap existing ones first
            for (const mapped of alreadyMappedCandidates) {
              const oldIdToUnmap = parseInt(mapped.id.split("-")[0]);
              const unmergeRes = await unmergeSinglePropertyAction({
                propertyId,
                propertyOldId: oldIdToUnmap
              });
              if (unmergeRes && unmergeRes.success === false) {
                throw new Error(unmergeRes.message || "The existing mapping data is inconsistent. Missing mapping details.");
              }
            }
          }

          const response = await mergeMultiplePropertiesAction({
            propertyId,
            propertyOldIds,
            latitude,
            longitude,
            location,
          });

          if (response && (response.success || response.items?.success)) {
            showToast((response.items?.message || response.message) || t("toasts.mappingConfirmed", { propNo: displayNewPropNo }), "success");
            
            // Re-fetch mapping data from backend
            const freshData = await getMappedPropertiesAction(propertyId);
            if (freshData && refreshMappingState) {
              refreshMappingState(freshData);
            }
            
            // Always ensure the merged candidates appear in "Linked Old Properties"
            if (setCandidates) {
              const mergedCandidates = selectedCandidates.map(c => ({
                ...c,
                isMapped: true,
                status: "Mapped" as const,
                mappedNewPropertyNo: currentNewProperty.propNo,
              }));
              setCandidates(prev => {
                const newList = [...prev];
                mergedCandidates.forEach(mc => {
                  const existingIdx = newList.findIndex(c => c.propNo === mc.propNo && c.partitionNo === mc.partitionNo);
                  if (existingIdx >= 0) {
                    newList[existingIdx] = mc;
                  } else {
                    newList.push(mc);
                  }
                });
                return newList;
              });
            }
            
            // Preserve existing audit trail logic locally
            const newMapping: MappingLink = {
              id: `MAP-${Date.now().toString().slice(-4)}`, newPropNo, oldPropNos, mapType: inferredMappingType, confidence: 98, note: finalRemark, mappedBy: currentUserName, mappedAt: timestamp, status: "Mapped",
            };
            setMappings((prev) => [...prev.filter((m) => m.newPropNo !== newPropNo), newMapping]);
            setHistoryList((prev) => [
              ...prev,
              { id: `H-${Date.now()}`, time: timestamp, action: "Mapped", newPropNo, oldPropNos, user: currentUserName, reason: finalRemark },
            ]);
            setNewProperties((prev) => prev.map((p, idx) => (idx === selectedNewIndex ? { ...p, remark: finalRemark, status: "Mapped" } : p)));

            if (selectedNewIndex < newProperties.length - 1) {
              setTimeout(() => setSelectedNewIndex((prev) => prev + 1), 600);
            }
          } else {
            // Failure case
            showToast(response?.message || t("toasts.mergeFailed"), "error");
          }
        } catch (error: unknown) {
          const errMsg = error instanceof Error && error.message.includes("inconsistent")
            ? error.message
            : (error instanceof Error ? error.message : t("toasts.mergeFailed"));
          showToast(errMsg, "error");
        } finally {
          setIsSubmitting(false);
        }
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

  const handleDisconnectMapping = (newPropNo: string, mId: string, selectedOldPropNos?: string[]) => {
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const targetProp = newProperties.find((p) => p.propNo === newPropNo);
    const displayPropNo = targetProp ? formatNewPropertyDisplayNo(targetProp) : newPropNo;

    const performUnmap = async (propsToUnmap: string[]) => {
      if (!targetProp) return;
      setIsSubmitting(true);
      try {
        const mapping = mappings.find((m) => m.id === mId);
        if (!mapping) return;

        const propertyId = parseInt(targetProp.id.replace("dyn-", ""));

        // Look up the actual Old Property IDs from the candidates array
        const oldPropIds = propsToUnmap
          .map((propNo) => {
            const c = candidates.find((cand) => cand.propNo === propNo);
            return c ? parseInt(c.id.split("-")[0]) : NaN;
          })
          .filter((id) => !isNaN(id));

        if (oldPropIds.length === 0) {
          throw new Error(t("toasts.invalidPropertyId"));
        }

        let response;
        if (oldPropIds.length === 1) {
          response = await unmergeSinglePropertyAction({
            propertyId,
            propertyOldId: oldPropIds[0],
          });
        } else {
          response = await unmergeMultiplePropertiesAction({
            propertyId,
            propertyOldIds: oldPropIds,
          });
        }

        if (response && (response.success || response.items?.success)) {
          showToast((response.items?.message || response.message) || t("toasts.unmapped", { propNo: displayPropNo }), "success");

          // Re-fetch mapping data from backend
          const freshData = await getMappedPropertiesAction(propertyId);
          if (freshData && refreshMappingState) {
            refreshMappingState(freshData);
          } else {
            // Fallback manual local state update
            const remainingOldProps = mapping.oldPropNos.filter((p) => !propsToUnmap.includes(p));
            if (remainingOldProps.length === 0) {
              setMappings((prev) => prev.filter((m) => m.id !== mId));
              setNewProperties((prev) => prev.map((p) => (p.propNo === newPropNo ? { ...p, status: "Needs verification" } : p)));
            } else {
              setMappings((prev) =>
                prev.map((m) =>
                  m.id === mId
                    ? {
                        ...m,
                        oldPropNos: remainingOldProps,
                        mapType:
                          remainingOldProps.length > 1
                            ? `Split (1 New → ${remainingOldProps.length} Old Records)`
                            : "1 → 1 (One-to-One)",
                      }
                    : m
                )
              );
            }
          }

          // Always ensure the unlinked candidates are updated in candidates state
          if (setCandidates) {
            setCandidates((prev) =>
              prev.map((c) =>
                propsToUnmap.includes(c.propNo)
                  ? { ...c, isMapped: false, status: "Unmapped" as const, mappedNewPropertyNo: "" }
                  : c
              )
            );
          }

          // Preserve existing audit trail logic
          setHistoryList((prev) => [
            ...prev,
            {
              id: `H-${Date.now()}`,
              time: timestamp,
              action: "Unmapped",
              newPropNo,
              oldPropNos: propsToUnmap,
              user: currentUserName,
              reason: t("auditDefaultRemarks.unmapManual"),
            },
          ]);
        } else {
          showToast(response?.message || t("toasts.unmergeFailed"), "error");
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : t("toasts.unmergeFailed");
        showToast(errMsg, "error");
      } finally {
        setIsSubmitting(false);
      }
    };

    // If specific properties were passed from modal, unmap them directly
    if (selectedOldPropNos && selectedOldPropNos.length > 0) {
      performUnmap(selectedOldPropNos);
      return;
    }

    // Default confirmation dialog for single property link
    const mapping = mappings.find((m) => m.id === mId);
    const propsToUnmap = mapping?.oldPropNos || [];

    confirm({
      variant: "delete",
      title: t("dialogs.unmapProperty.title"),
      description: t("dialogs.unmapProperty.description", { mId, newPropNo: displayPropNo }),
      confirmText: t("dialogs.unmapProperty.confirmText"),
      cancelText: t("dialogs.unmapProperty.cancelText"),
      onConfirm: () => performUnmap(propsToUnmap),
    });
  };

  const handleUnlinkCandidate = (candidate: OldPropertyCandidate) => {
    if (!currentNewProperty) return;

    const displayNewPropNo = formatNewPropertyDisplayNo(currentNewProperty);
    const displayOldPropNo = formatCandidateDisplayNo(candidate);
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

    confirm({
      variant: "delete",
      title: t("dialogs.unmapProperty.title"),
      description: t("dialogs.unmapProperty.description", { mId: displayOldPropNo, newPropNo: displayNewPropNo }),
      confirmText: t("dialogs.unmapProperty.confirmText"),
      cancelText: t("dialogs.unmapProperty.cancelText"),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const propertyId = parseInt(currentNewProperty.id.replace("dyn-", ""));
          const propertyOldId = parseInt(candidate.id.split("-")[0]);
          
          if (isNaN(propertyOldId)) {
            throw new Error(t("toasts.invalidPropertyId"));
          }

          const response = await unmergeSinglePropertyAction({
            propertyId,
            propertyOldId,
          });

          if (response && (response.success || response.items?.success)) {
            showToast((response.items?.message || response.message) || t("toasts.unmapped", { propNo: displayNewPropNo }), "success");
            
            // Re-fetch mapping data from backend
            const freshData = await getMappedPropertiesAction(propertyId);
            if (freshData && refreshMappingState) {
              refreshMappingState(freshData);
            }
            
            setHistoryList((prev) => [
              ...prev,
              { id: `H-${Date.now()}`, time: timestamp, action: "Unmapped", newPropNo: currentNewProperty.propNo, oldPropNos: [candidate.propNo], user: currentUserName, reason: t("auditDefaultRemarks.unmapManual") },
            ]);
          } else {
            showToast(response?.message || t("toasts.unlinkFailed"), "error");
          }
        } catch (error: unknown) {
          const errMsg = error instanceof Error && error.message.includes("inconsistent") 
            ? error.message 
            : t("toasts.unlinkFailed");
          showToast(errMsg, "error");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  return {
    metrics,
    validationStatus,
    isSubmitting,
    handleConfirmMapping,
    handleDisconnectMapping,
    handleUnlinkCandidate,
  };
}
