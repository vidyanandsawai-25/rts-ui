"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Label, Badge, SearchInput, Select, MasterTable, Checkbox, DocumentViewerModal } from "@/components/common";
import type { Column } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { Info, Store, Pencil, Eye, CheckCircle2, ShieldCheck, Building2, Home, Trash2, Loader2 } from "lucide-react";
import type { useDiscountLevelState } from "@/hooks/useDiscountLevelState";
import type { PropertySocialDetailsDto, SocialAttributeHierarchyDto, DeletePropertySocialDetailsByHierarchyParams } from "@/types/property-social-details.types";
import { deletePropertySocialDetailsByHierarchyAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/discount-actions";
import { getDocumentBlobUrl } from "@/lib/utils/document-client-utils";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { getItemLevel, LEVEL_NAMES } from "@/lib/utils/ptis/social-details";

/* ---------- shared row type ---------- */
export interface UnitRow extends Record<string, unknown> {
    propertyDetailsId: number;
    propertyId?: number;
    unitNo: string;
    wingName: string;
    wingDetailId?: number;
    floorName: string;
    useName: string;
    coverageStatus?: CoverageStatus;
}

export const COVERAGE_STATUSES = ["direct", "wing", "apartment", "none"] as const;
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];

/* ---------- badge config ---------- */
const coverageBadgeConfig: Record<CoverageStatus, { label: string; tKey: string; icon: React.ReactNode; className: string }> = {
    direct: {
        label: "Applied (Direct)",
        tKey: "building.statusAppliedDirect",
        icon: <CheckCircle2 className="w-3 h-3 shrink-0" />,
        className: "bg-emerald-50 text-emerald-800 border-emerald-300",
    },
    wing: {
        label: "Wing Covered",
        tKey: "building.statusWingCovered",
        icon: <Home className="w-3 h-3 shrink-0" />,
        className: "bg-sky-50 text-sky-800 border-sky-300",
    },
    apartment: {
        label: "Apartment Covered",
        tKey: "building.statusApartmentCovered",
        icon: <Building2 className="w-3 h-3 shrink-0" />,
        className: "bg-violet-50 text-violet-800 border-violet-300",
    },
    none: {
        label: "Not Applied",
        tKey: "building.statusNotApplied",
        icon: <ShieldCheck className="w-3 h-3 shrink-0 opacity-40" />,
        className: "bg-slate-50 text-slate-500 border-slate-200",
    },
};

/* ---------- props ---------- */
interface UnitSelectionPanelProps {
    levelState: NonNullable<ReturnType<typeof useDiscountLevelState>>;
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
    savedPropertyDetails?: (PropertySocialDetailsDto | SocialAttributeHierarchyDto)[];
    activeSelectedId?: number | null;
    /** Called when user clicks the edit button on a unit row */
    onEditUnit?: (row: UnitRow) => void;
    /** Called when URL needs updating */
    onUrlUpdate?: (params: URLSearchParams) => void;
    /** Whether to show action column (edit + view) */
    showActions?: boolean;
    /** Society Detail ID */
    societyDetailId?: number | null;
    /** Wing Detail ID */
    wingDetailId?: number | null;
    /** Property ID */
    propertyId?: string | number;
    /** Custom onBulkDelete handler (optional) */
    onBulkDelete?: (selectedUnitPropertyIds: number[]) => Promise<boolean | void> | void;
    /** Notified when bulk delete selection changes */
    onDeleteSelectionChange?: (selectedIds: Set<number>) => void;
    /** Active attribute name for confirmation dialogs */
    activeAttributeName?: string;
}

/* ================================================================ */
export const UnitSelectionPanel: React.FC<UnitSelectionPanelProps> = ({
    levelState,
    t,
    savedPropertyDetails = [],
    activeSelectedId,
    activeAttributeName,
    onEditUnit,
    onUrlUpdate,
    showActions = true,
    societyDetailId,
    wingDetailId,
    propertyId,
    onBulkDelete,
    onDeleteSelectionChange,
}) => {
    const locale = useLocale();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const { confirm } = useConfirm();
    const [viewerModalData, setViewerModalData] = useState<{ isOpen: boolean; fileUrl: string; fileName: string } | null>(null);
    const [selectedDeleteUnitIds, setSelectedDeleteUnitIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

    // Reset delete selection when active attribute or wing changes
    const [prevSelectionKey, setPrevSelectionKey] = useState<string>(() => `${activeSelectedId ?? ""}-${levelState.selectedWingDetailId ?? ""}`);
    const currentSelectionKey = `${activeSelectedId ?? ""}-${levelState.selectedWingDetailId ?? ""}`;

    if (currentSelectionKey !== prevSelectionKey) {
        setPrevSelectionKey(currentSelectionKey);
        setSelectedDeleteUnitIds(new Set());
    }

    useEffect(() => {
        onDeleteSelectionChange?.(selectedDeleteUnitIds);
    }, [selectedDeleteUnitIds, onDeleteSelectionChange]);

    const translate = useCallback(
        (key: string, fallback: string, values?: Record<string, string | number | Date>) => {
            try {
                const val = t(key, values);
                if (!val || val.includes("quickDataEntry.") || val === key) return fallback;
                return val;
            } catch {
                return fallback;
            }
        },
        [t],
    );

    /* ---- uploaded-doc map (for checkbox + view action) ---- */
    const uploadedUnitsMap = useMemo(() => {
        const map = new Map<number, PropertySocialDetailsDto | SocialAttributeHierarchyDto>();
        if (savedPropertyDetails && activeSelectedId) {
            savedPropertyDetails.forEach((item) => {
                const attrId = 'socialAttributeId' in item && item.socialAttributeId != null
                    ? Number(item.socialAttributeId)
                    : Number(item.id);
                const rawPropId = 'propertyId' in item ? item.propertyId : undefined;
                const propId = rawPropId != null ? Number(rawPropId) : undefined;
                if (
                    attrId === activeSelectedId &&
                    propId &&
                    !isNaN(propId) &&
                    (item.documentGuid || item.documentBindingId)
                ) {
                    map.set(propId, item);
                }
            });
        }
        return map;
    }, [savedPropertyDetails, activeSelectedId]);

    /* ---- wing-level document map (wingDetailId → document item) ---- */
    const wingDocumentMap = useMemo(() => {
        const map = new Map<number, PropertySocialDetailsDto | SocialAttributeHierarchyDto>();
        if (!savedPropertyDetails || !activeSelectedId) return map;
        savedPropertyDetails.forEach((item) => {
            const attrId = 'socialAttributeId' in item && item.socialAttributeId != null
                ? Number(item.socialAttributeId)
                : Number(item.id);
            if (attrId !== activeSelectedId) return;
            const level = getItemLevel(item);
            const wId = 'wingDetailId' in item && item.wingDetailId != null ? Number(item.wingDetailId) : undefined;
            if (level === LEVEL_NAMES.WING && wId && wId > 0 && (item.documentGuid || item.documentBindingId)) {
                map.set(wId, item);
            }
        });
        return map;
    }, [savedPropertyDetails, activeSelectedId]);

    /* ---- apartment-level document item ---- */
    const apartmentDocumentItem = useMemo<PropertySocialDetailsDto | SocialAttributeHierarchyDto | null>(() => {
        if (!savedPropertyDetails || !activeSelectedId) return null;
        return savedPropertyDetails.find((item) => {
            const attrId = 'socialAttributeId' in item && item.socialAttributeId != null
                ? Number(item.socialAttributeId)
                : Number(item.id);
            if (attrId !== activeSelectedId) return false;
            const level = getItemLevel(item);
            return level === LEVEL_NAMES.APARTMENT && !!(item.documentGuid || item.documentBindingId);
        }) || null;
    }, [savedPropertyDetails, activeSelectedId]);

    /* ---- coverage-status resolution ---- */
    const unitCoverageMap = useMemo(() => {
        const map = new Map<number, CoverageStatus>();
        if (!activeSelectedId) return map;

        // Unit-level direct coverage set (propertyId → covered)
        const unitDirectSet = new Set<number>();
        savedPropertyDetails.forEach((d) => {
            const attrId = 'socialAttributeId' in d && d.socialAttributeId != null ? Number(d.socialAttributeId) : Number(d.id);
            if (attrId !== activeSelectedId) return;
            const level = getItemLevel(d);
            const pId = 'propertyId' in d && d.propertyId != null ? Number(d.propertyId) : undefined;
            const bitValue = 'bitValue' in d ? d.bitValue : true;
            if (pId != null && pId > 0 && (level === LEVEL_NAMES.UNIT || String(d.entityType).toUpperCase() === 'P') && bitValue !== false) {
                unitDirectSet.add(pId);
            }
        });

        // Wing-level coverage set (wingDetailId → covered). Strictly excludes records with propertyId > 0
        const wingCoverageSet = new Set<number>();
        savedPropertyDetails.forEach((d) => {
            const attrId = 'socialAttributeId' in d && d.socialAttributeId != null ? Number(d.socialAttributeId) : Number(d.id);
            if (attrId !== activeSelectedId) return;
            const level = getItemLevel(d);
            const wId = 'wingDetailId' in d && d.wingDetailId != null ? Number(d.wingDetailId) : undefined;
            const pId = 'propertyId' in d && d.propertyId != null ? Number(d.propertyId) : undefined;
            const bitValue = 'bitValue' in d ? d.bitValue : true;
            if (level === LEVEL_NAMES.WING && (!pId || pId === 0) && wId && bitValue !== false) {
                wingCoverageSet.add(wId);
            }
        });

        // Apartment-level coverage check. Strictly excludes records with wingDetailId > 0 or propertyId > 0
        const hasApartmentCoverage = savedPropertyDetails.some((d) => {
            const attrId = 'socialAttributeId' in d && d.socialAttributeId != null ? Number(d.socialAttributeId) : Number(d.id);
            if (attrId !== activeSelectedId) return false;
            const level = getItemLevel(d);
            const wId = 'wingDetailId' in d && d.wingDetailId != null ? Number(d.wingDetailId) : undefined;
            const pId = 'propertyId' in d && d.propertyId != null ? Number(d.propertyId) : undefined;
            const bitValue = 'bitValue' in d ? d.bitValue : true;
            return level === LEVEL_NAMES.APARTMENT && (!wId || wId === 0) && (!pId || pId === 0) && bitValue !== false;
        });

        // Resolve each unit (map both propertyId and propertyDetailsId to guarantee matches)
        levelState.filteredUnits.forEach((u) => {
            const pId = u.propertyId != null ? Number(u.propertyId) : undefined;
            const pdId = u.propertyDetailsId != null ? Number(u.propertyDetailsId) : undefined;
            const isDirect = (pId != null && (unitDirectSet.has(pId) || uploadedUnitsMap.has(pId))) ||
                             (pdId != null && (unitDirectSet.has(pdId) || uploadedUnitsMap.has(pdId)));
            const wId = u.wingDetailId != null ? Number(u.wingDetailId) : undefined;

            const primaryId = (pId ?? pdId) as number;
            if (isDirect) {
                map.set(primaryId, "direct");
                if (pId != null) map.set(pId, "direct");
                if (pdId != null) map.set(pdId, "direct");
            } else if (wId && wingCoverageSet.has(wId)) {
                map.set(primaryId, "wing");
                if (pId != null) map.set(pId, "wing");
                if (pdId != null) map.set(pdId, "wing");
            } else if (hasApartmentCoverage) {
                map.set(primaryId, "apartment");
                if (pId != null) map.set(pId, "apartment");
                if (pdId != null) map.set(pdId, "apartment");
            } else {
                map.set(primaryId, "none");
                if (pId != null) map.set(pId, "none");
                if (pdId != null) map.set(pdId, "none");
            }
        });

        return map;
    }, [savedPropertyDetails, activeSelectedId, levelState.filteredUnits, uploadedUnitsMap]);

    /* ---- status filter ---- */
    const [statusFilter, setStatusFilter] = useState<"all" | CoverageStatus>("all");

    /* ---- helper: check if unit is already applied ---- */
    const isUnitApplied = useCallback(
        (unitPropId: number): boolean => {
            const num = Number(unitPropId);
            return unitCoverageMap.get(num) === "direct" || uploadedUnitsMap.has(num);
        },
        [unitCoverageMap, uploadedUnitsMap]
    );

    /* ---- counts ---- */
    const appliedUnitsCount = useMemo(() => {
        let count = 0;
        levelState.filteredUnits.forEach((u) => {
            const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
            if (isUnitApplied(unitPropId)) count++;
        });
        return count;
    }, [levelState.filteredUnits, isUnitApplied]);

    /* ---- selected unit names for summary ---- */
    const selectedUnitNamesSummary = useMemo(() => {
        if (levelState.selectedUnitIds.size === 0) return "";
        const names = levelState.filteredUnits
            .filter((u) => levelState.selectedUnitIds.has((u.propertyId ?? u.propertyDetailsId) as number))
            .map((u) => u.unitNo)
            .filter(Boolean);
        if (names.length <= 3) return names.join(", ");
        return `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;
    }, [levelState.selectedUnitIds, levelState.filteredUnits]);

    /* ---- selectable units (only unapplied units can be batch selected) ---- */
    const selectableUnits = useMemo(() => {
        return levelState.filteredUnits.filter((u) => {
            const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
            return !isUnitApplied(unitPropId);
        });
    }, [levelState.filteredUnits, isUnitApplied]);

    /* ---- applied units list (units that have applied data) ---- */
    const appliedUnits = useMemo(() => {
        return levelState.filteredUnits.filter((u) => {
            const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
            return isUnitApplied(unitPropId);
        });
    }, [levelState.filteredUnits, isUnitApplied]);

    /* ---- are all selectable units selected ---- */
    const isAllSelectableUnitsSelected = useMemo(() => {
        if (selectableUnits.length === 0) return false;
        return selectableUnits.every((u) => {
            const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
            return levelState.selectedUnitIds.has(unitPropId);
        });
    }, [selectableUnits, levelState.selectedUnitIds]);

    /* ---- are all applied units selected for delete ---- */
    const isAllAppliedUnitsSelectedForDelete = useMemo(() => {
        if (appliedUnits.length === 0) return false;
        return appliedUnits.every((u) => {
            const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
            return selectedDeleteUnitIds.has(unitPropId);
        });
    }, [appliedUnits, selectedDeleteUnitIds]);

    /* ---- toggle all selectable units ---- */
    const handleToggleAllSelectableUnits = useCallback(() => {
        levelState.setSelectedUnitIds((prev) => {
            const next = new Set(prev);
            if (isAllSelectableUnitsSelected) {
                selectableUnits.forEach((u) => {
                    const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
                    next.delete(unitPropId);
                });
            } else {
                selectableUnits.forEach((u) => {
                    const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
                    next.add(unitPropId);
                });
            }
            return next;
        });
    }, [isAllSelectableUnitsSelected, selectableUnits, levelState]);

    /* ---- actively editing single applied unit (derived from URL) ---- */
    const editingUnitId = useMemo(() => {
        const p = searchParams.get("unitPropertyId");
        return p ? Number(p) : null;
    }, [searchParams]);

    /* ---- check if single applied unit is currently being edited ---- */
    const isEditingAppliedUnit = useMemo(() => {
        if (!editingUnitId) return false;
        return isUnitApplied(editingUnitId);
    }, [editingUnitId, isUnitApplied]);

    /* ---- handlers ---- */
    const updateUrl = useCallback(
        (params: URLSearchParams) => {
            if (onUrlUpdate) {
                onUrlUpdate(params);
            } else {
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }
        },
        [onUrlUpdate, router, pathname],
    );

    const handleClearSelection = useCallback(() => {
        levelState.setSelectedUnitIds(new Set());
        if (searchParams.get("unitPropertyId")) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("unitPropertyId");
            updateUrl(params);
        }
    }, [levelState, searchParams, updateUrl]);

    const handleCancelEdit = useCallback(() => {
        levelState.setSelectedUnitIds(new Set());
        const params = new URLSearchParams(searchParams.toString());
        params.delete("unitPropertyId");
        updateUrl(params);
    }, [levelState, searchParams, updateUrl]);

    const handleViewUnitDocument = useCallback(
        async (_row: UnitRow, uploadedItem?: PropertySocialDetailsDto | SocialAttributeHierarchyDto) => {
            if (!uploadedItem?.documentGuid) {
                toast.info(t("building.noDocumentAttached") || "No document file attached for this unit.");
                return;
            }
            try {
                const { url } = await getDocumentBlobUrl(uploadedItem.documentGuid, locale);
                const attrName = 'socialAttributeName' in uploadedItem ? uploadedItem.socialAttributeName : undefined;
                setViewerModalData({
                    isOpen: true,
                    fileUrl: url,
                    fileName: attrName || `Unit_${_row.unitNo}_Document`,
                });
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : "Failed to view document");
            }
        },
        [locale, t],
    );

    const handleEditUnit = useCallback(
        (row: UnitRow) => {
            const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
            levelState.setSelectedUnitIds(new Set([unitPropId]));
            const params = new URLSearchParams(searchParams.toString());
            params.set("unitPropertyId", String(unitPropId));
            updateUrl(params);
            onEditUnit?.(row);
        },
        [levelState, onEditUnit, searchParams, updateUrl],
    );

    /* ---- toggle all applied units for delete ---- */
    const handleToggleAllAppliedUnitsForDelete = useCallback(() => {
        setSelectedDeleteUnitIds((prev) => {
            const next = new Set(prev);
            if (isAllAppliedUnitsSelectedForDelete) {
                appliedUnits.forEach((u) => {
                    const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
                    next.delete(unitPropId);
                });
            } else {
                appliedUnits.forEach((u) => {
                    const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
                    next.add(unitPropId);
                });
            }
            return next;
        });
    }, [isAllAppliedUnitsSelectedForDelete, appliedUnits]);

    /* ---- toggle individual delete unit selection ---- */
    const handleToggleDeleteUnit = useCallback((unitPropId: number) => {
        setSelectedDeleteUnitIds((prev) => {
            const next = new Set(prev);
            if (next.has(unitPropId)) {
                next.delete(unitPropId);
            } else {
                next.add(unitPropId);
            }
            return next;
        });
    }, []);

    /* ---- clear delete selection ---- */
    const handleClearDeleteSelection = useCallback(() => {
        setSelectedDeleteUnitIds(new Set());
    }, []);

    /* ---- execute bulk delete ---- */
    const handleExecuteBulkDelete = useCallback(async () => {
        if (selectedDeleteUnitIds.size === 0 || !activeSelectedId) return;

        const selectedIdsArray = Array.from(selectedDeleteUnitIds);
        setIsBulkDeleting(true);

        try {
            if (onBulkDelete) {
                await onBulkDelete(selectedIdsArray);
            } else {
                const socId = societyDetailId ?? (searchParams.get("societyDetailId") ? Number(searchParams.get("societyDetailId")) : undefined);
                const wingId = wingDetailId ?? (levelState.selectedWingDetailId ? Number(levelState.selectedWingDetailId) : (searchParams.get("wingDetailId") ? Number(searchParams.get("wingDetailId")) : undefined));
                const rawPropId = propertyId ? String(propertyId) : (pathname.split("/QuickDataEntry/")[1]?.split("/")[0] || searchParams.get("propertyId") || "");

                const hierarchyParams: DeletePropertySocialDetailsByHierarchyParams = {
                    entityType: 'P',
                    socialAttributeId: Number(activeSelectedId),
                    societyDetailsId: socId,
                    wingDetailId: wingId,
                    propertyIds: selectedIdsArray,
                };

                const res = await deletePropertySocialDetailsByHierarchyAction(
                    hierarchyParams,
                    rawPropId,
                    locale
                );

                if (!res.success) {
                    toast.error(res.error || translate("building.bulkDeleteError", "Failed to delete applied data for selected units."));
                    return;
                }
            }

            toast.success(translate("building.bulkDeleteSuccess", "Applied data deleted successfully for selected units."));
            setSelectedDeleteUnitIds(new Set());

            if (editingUnitId && selectedDeleteUnitIds.has(editingUnitId)) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("unitPropertyId");
                updateUrl(params);
            }

            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : translate("building.bulkDeleteError", "Failed to delete applied data for selected units."));
        } finally {
            setIsBulkDeleting(false);
        }
    }, [
        selectedDeleteUnitIds,
        activeSelectedId,
        onBulkDelete,
        societyDetailId,
        searchParams,
        wingDetailId,
        levelState.selectedWingDetailId,
        propertyId,
        pathname,
        locale,
        translate,
        editingUnitId,
        updateUrl,
        router
    ]);

    const resolvedAttributeName = useMemo(() => {
        if (activeAttributeName) return activeAttributeName;
        if (!savedPropertyDetails || !activeSelectedId) return "";
        const item = savedPropertyDetails.find((d) => {
            const attrId = 'socialAttributeId' in d && d.socialAttributeId != null ? Number(d.socialAttributeId) : Number(d.id);
            return attrId === activeSelectedId;
        });
        if (item) {
            const name = 'socialAttributeName' in item ? item.socialAttributeName : undefined;
            const code = 'socialAttributeCode' in item ? item.socialAttributeCode : undefined;
            return name || code || "";
        }
        return "";
    }, [activeAttributeName, savedPropertyDetails, activeSelectedId]);

    const selectedDeleteUnitNames = useMemo(() => {
        if (selectedDeleteUnitIds.size === 0) return [];
        return levelState.filteredUnits
            .filter((u) => selectedDeleteUnitIds.has((u.propertyId ?? u.propertyDetailsId) as number))
            .map((u) => u.unitNo)
            .filter(Boolean);
    }, [selectedDeleteUnitIds, levelState.filteredUnits]);

    /* ---- confirm bulk delete ---- */
    const handleConfirmBulkDelete = useCallback(() => {
        if (selectedDeleteUnitIds.size === 0 || !activeSelectedId) return;

        const attrName = resolvedAttributeName?.trim();
        const descKey = attrName ? "building.confirmBulkDeleteDesc" : "building.confirmBulkDeleteDescWithoutAttr";
        const defaultDesc = attrName
            ? `Are you sure you want to delete applied "${attrName}" data for ${selectedDeleteUnitIds.size} selected unit(s)? This action cannot be undone.`
            : `Are you sure you want to delete applied data for ${selectedDeleteUnitIds.size} selected unit(s)? This action cannot be undone.`;

        const descText = translate(
            descKey,
            defaultDesc,
            { count: selectedDeleteUnitIds.size, attributeName: attrName || "" }
        );

        const renderedDescription = (
            <div className="w-full flex flex-col items-center gap-2.5">
                <p className="text-sm text-gray-600 leading-relaxed text-center max-w-[460px]">
                    {descText}
                </p>
                {selectedDeleteUnitNames.length > 0 && (
                    <div className="w-full max-w-[460px] bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-left">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 px-0.5">
                            <span>{translate("building.selectedUnits", "Selected Units")}</span>
                            <span className="text-[11px] font-semibold text-slate-600">({selectedDeleteUnitNames.length})</span>
                        </div>
                        <div className="max-h-[64px] overflow-y-auto scrollbar-thin px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 break-words leading-relaxed text-left">
                            {selectedDeleteUnitNames.join(", ")}
                        </div>
                    </div>
                )}
            </div>
        );

        confirm({
            title: translate("building.confirmBulkDeleteTitle", "Delete Applied Unit Data"),
            description: renderedDescription,
            confirmText: translate("building.deleteConfirmOk", "Yes, Delete"),
            cancelText: translate("building.deleteConfirmCancel", "Cancel"),
            variant: "delete",
            onConfirm: async () => {
                await handleExecuteBulkDelete();
            },
        });
    }, [selectedDeleteUnitIds, activeSelectedId, resolvedAttributeName, selectedDeleteUnitNames, confirm, translate, handleExecuteBulkDelete]);

    /* ================================================================ */
    /*  Table columns — Checkbox | Unit | Wing | Coverage Status | Action | Delete
    /* ================================================================ */
    const unitTableColumns = useMemo<Column<UnitRow>[]>(() => {
        const cols: Column<UnitRow>[] = [
            /* ---- checkbox ---- */
            {
                key: "propertyDetailsId",
                label: (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={isAllSelectableUnitsSelected}
                            onCheckedChange={handleToggleAllSelectableUnits}
                            disabled={selectableUnits.length === 0}
                            className={cn(selectableUnits.length === 0 && "opacity-50 cursor-not-allowed")}
                        />
                    </div>
                ),
                width: "40px",
                align: "center",
                render: (_, row) => {
                    const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                    const isApplied = isUnitApplied(unitPropId);
                    const isChecked = isApplied || levelState.selectedUnitIds.has(unitPropId);
                    const isEditingThisUnit = editingUnitId === unitPropId;

                    return (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "inline-flex items-center justify-center p-1 rounded",
                                isApplied ? "cursor-not-allowed" : "cursor-pointer"
                            )}
                            title={
                                isEditingThisUnit
                                    ? translate("building.currentlyEditingUnit", "Currently editing this applied unit")
                                    : isApplied
                                    ? translate("building.unitAlreadyAppliedTooltip", "Unit is already applied. Click Edit icon to modify.")
                                    : undefined
                            }
                        >
                            <Checkbox
                                checked={isChecked}
                                disabled={isApplied}
                                onCheckedChange={() => {
                                    if (!isApplied) {
                                        levelState.toggleUnitSelection(unitPropId);
                                    }
                                }}
                                className={cn(isApplied && "cursor-not-allowed opacity-80")}
                            />
                        </div>
                    );
                },
            },

            /* ---- Unit ---- */
            {
                key: "unitNo",
                label: t("building.unit") || "Unit",
                render: (val, row) => {
                    const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                    const isApplied = isUnitApplied(unitPropId);
                    const isEditingThisUnit = editingUnitId === unitPropId;

                    return (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                                className={cn(
                                    isEditingThisUnit
                                        ? "font-bold text-blue-900"
                                        : isApplied
                                        ? "font-medium text-slate-700 select-none"
                                        : "font-bold text-slate-800"
                                )}
                            >
                                {String(val || "")}
                            </span>
                            {isEditingThisUnit ? (
                                <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200 text-[10px] font-bold flex-shrink-0 animate-pulse">
                                    <Pencil className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                    <span>{translate("building.editing", "Editing")}</span>
                                </span>
                            ) : isApplied ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 text-[10px] font-semibold flex-shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{translate("building.uploaded", "Applied")}</span>
                                </span>
                            ) : null}
                        </div>
                    );
                },
            },

            /* ---- Wing ---- */
            {
                key: "wingName",
                label: t("building.wing") || "Wing",
                render: (val, row) => {
                    const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                    const isApplied = isUnitApplied(unitPropId);
                    const isEditingThisUnit = editingUnitId === unitPropId;
                    return (
                        <span
                            className={cn(
                                "font-semibold",
                                isEditingThisUnit ? "text-blue-900" : isApplied ? "text-slate-400 select-none" : "text-slate-700"
                            )}
                        >
                            {String(val || "")}
                        </span>
                    );
                },
            },

            /* ---- Coverage Status ---- */
            {
                key: "coverageStatus",
                label: translate("building.coverageStatus", "Coverage Status"),
                render: (_, row) => {
                    const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                    const status: CoverageStatus = unitCoverageMap.get(unitPropId) ?? "none";
                    const cfg = coverageBadgeConfig[status];
                    const label = translate(cfg.tKey, cfg.label);

                    return (
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold whitespace-nowrap",
                                cfg.className,
                            )}
                        >
                            {cfg.icon}
                            <span>{label}</span>
                        </span>
                    );
                },
            },
        ];

        /* ---- Action (optional) ---- */
        if (showActions) {
            cols.push({
                key: "actions",
                label: t("common.actions") || "Action",
                align: "center",
                width: "100px",
                render: (_, row) => {
                    const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                    const status: CoverageStatus = unitCoverageMap.get(unitPropId) ?? "none";
                    const isApplied = isUnitApplied(unitPropId);
                    const isEditingThisUnit = editingUnitId === unitPropId;

                    // Resolve document: direct unit → wing-level → apartment-level
                    let resolvedDocItem: PropertySocialDetailsDto | SocialAttributeHierarchyDto | undefined = uploadedUnitsMap.get(unitPropId);
                    if (!resolvedDocItem && row.wingDetailId) {
                        resolvedDocItem = wingDocumentMap.get(row.wingDetailId);
                    }
                    if (!resolvedDocItem && apartmentDocumentItem) {
                        resolvedDocItem = apartmentDocumentItem;
                    }
                    const hasDoc = !!resolvedDocItem;

                    const viewTooltip = hasDoc
                        ? status === "wing"
                            ? translate("building.viewWingDocument", "View Wing Document")
                            : status === "apartment"
                            ? translate("building.viewApartmentDocument", "View Apartment Document")
                            : translate("common.view", "View Document")
                        : translate("building.noDocumentAttached", "No document attached");

                    return (
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className={cn(
                                    "inline-flex items-center justify-center w-8 h-8 rounded-lg shadow-2xs cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95",
                                    isEditingThisUnit
                                        ? "text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 ring-2 ring-blue-400/50"
                                        : "text-blue-600 bg-blue-50/90 hover:bg-blue-100 hover:text-blue-800 border border-blue-200"
                                )}
                                title={
                                    isEditingThisUnit
                                        ? translate("building.currentlyEditingUnit", "Currently editing this applied unit")
                                        : isApplied
                                        ? translate("building.editAppliedData", "Edit Applied Data")
                                        : translate("common.edit", "Edit")
                                }
                                aria-label={translate("common.edit", "Edit")}
                                onClick={() => handleEditUnit(row)}
                            >
                                <Pencil className={cn("w-4 h-4", isEditingThisUnit ? "text-white" : "text-blue-600")} />
                            </button>
                            <button
                                type="button"
                                disabled={!hasDoc}
                                className={cn(
                                    "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
                                    hasDoc
                                        ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-300 shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                                        : "text-slate-300 bg-slate-50 border border-slate-200 cursor-not-allowed opacity-50",
                                )}
                                title={viewTooltip}
                                aria-label={viewTooltip}
                                onClick={() => handleViewUnitDocument(row, resolvedDocItem)}
                            >
                                <Eye className={cn("w-4 h-4", hasDoc ? "text-emerald-600" : "text-slate-300")} />
                            </button>
                        </div>
                    );
                },
            });
        }

        /* ---- Bulk Delete Checkbox (right of Action column) ---- */
        cols.push({
            key: "deleteSelection",
            label: (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center p-1"
                    title={translate("building.selectAllAppliedForDeleteTooltip", "Select all applied units for deletion")}
                >
                    <Checkbox
                        checked={isAllAppliedUnitsSelectedForDelete}
                        onCheckedChange={handleToggleAllAppliedUnitsForDelete}
                        disabled={appliedUnits.length === 0}
                        className={cn(
                            "data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600",
                            appliedUnits.length === 0 && "opacity-40 cursor-not-allowed"
                        )}
                    />
                </div>
            ),
            width: "44px",
            align: "center",
            render: (_, row) => {
                const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                const isApplied = isUnitApplied(unitPropId);
                const isDeleteChecked = isApplied && selectedDeleteUnitIds.has(unitPropId);

                return (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "inline-flex items-center justify-center p-1 rounded",
                            isApplied ? "cursor-pointer" : "cursor-not-allowed"
                        )}
                        title={
                            isApplied
                                ? translate("building.selectUnitToDeleteTooltip", `Select unit ${row.unitNo} to delete applied data`, { unit: row.unitNo })
                                : translate("building.unitNotAppliedDeleteTooltip", "Unit is not applied (cannot delete)")
                        }
                    >
                        <Checkbox
                            checked={isDeleteChecked}
                            disabled={!isApplied}
                            onCheckedChange={() => {
                                if (isApplied) {
                                    handleToggleDeleteUnit(unitPropId);
                                }
                            }}
                            className={cn(
                                "data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600",
                                !isApplied && "cursor-not-allowed opacity-30"
                            )}
                        />
                    </div>
                );
            },
        });

        return cols;
    }, [
        levelState,
        uploadedUnitsMap,
        wingDocumentMap,
        apartmentDocumentItem,
        unitCoverageMap,
        isUnitApplied,
        editingUnitId,
        isAllSelectableUnitsSelected,
        handleToggleAllSelectableUnits,
        selectableUnits,
        appliedUnits,
        isAllAppliedUnitsSelectedForDelete,
        handleToggleAllAppliedUnitsForDelete,
        selectedDeleteUnitIds,
        handleToggleDeleteUnit,
        showActions,
        t,
        translate,
        handleEditUnit,
        handleViewUnitDocument,
    ]);

    /* ---- table data (with status filter) ---- */
    const unitTableData = useMemo<UnitRow[]>(() => {
        return levelState.filteredUnits
            .map((u) => {
                const unitPropId = (u.propertyId ?? u.propertyDetailsId) as number;
                const status = unitCoverageMap.get(unitPropId) ?? "none";
                return {
                    propertyDetailsId: u.propertyDetailsId,
                    propertyId: u.propertyId,
                    unitNo: u.unitNo,
                    wingName: u.wingName,
                    wingDetailId: u.wingDetailId,
                    floorName: u.floorName,
                    useName: u.useName || "Residential",
                    coverageStatus: status,
                };
            })
            .filter((row) => {
                if (statusFilter === "all") return true;
                return row.coverageStatus === statusFilter;
            });
    }, [levelState.filteredUnits, unitCoverageMap, statusFilter]);

    /* ================================================================ */
    /*  Render
    /* ================================================================ */
    return (
        <>
            <div
                className={cn(
                    "space-y-2 p-2.5 rounded-xl border transition-all",
                    "bg-slate-50/70 border-slate-200",
                )}
            >
                {/* ---- Header Row: Label + Quick Actions ---- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            {t("building.selectUnits") || "SELECT UNITS"}
                        </Label>
                        <span className="text-[11px] text-slate-500">
                            {t("building.unitsInWing", { count: levelState.filteredUnits.length })}
                        </span>
                        <span className="text-[11px] text-blue-600 font-medium italic">
                            {t("building.clickRowToSelect") || "• Click any row to select"}
                        </span>
                    </div>

                    {/* Quick actions toolbar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {appliedUnitsCount > 0 && (
                            <button
                                type="button"
                                onClick={() => setStatusFilter(statusFilter === "direct" ? "all" : "direct")}
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer border transition-all",
                                    statusFilter === "direct"
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                        : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
                                )}
                                title={t("building.filterAppliedTooltip") || "Filter applied units"}
                            >
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                <span>{t("building.appliedSeparately", { count: appliedUnitsCount })}</span>
                            </button>
                        )}

                        {levelState.selectedUnitIds.size > 0 && (
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer border border-slate-300 transition-all"
                            >
                                {t("building.clearSelectedCount", { count: levelState.selectedUnitIds.size })}
                            </button>
                        )}

                        {selectedDeleteUnitIds.size > 0 && (
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={isBulkDeleting}
                                    onClick={handleConfirmBulkDelete}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-2xs transition-all cursor-pointer border border-rose-600",
                                        isBulkDeleting && "opacity-50 cursor-not-allowed"
                                    )}
                                    title={translate("building.bulkDeleteTooltip", "Delete applied data for selected units")}
                                >
                                    {isBulkDeleting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3 h-3 shrink-0" />
                                    )}
                                    <span>
                                        {translate(
                                            "building.bulkDeleteSelected",
                                            `Delete Selected (${selectedDeleteUnitIds.size})`,
                                            { count: selectedDeleteUnitIds.size }
                                        )}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearDeleteSelection}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer border border-rose-200 transition-all"
                                >
                                    {translate("building.clear", "Clear")}
                                </button>
                            </div>
                        )}

                        <Badge variant="secondary" size="sm" className="bg-white text-slate-700 font-bold border border-slate-200">
                            {t("building.selectedRatio", {
                                selected: levelState.selectedUnitIds.size,
                                total: levelState.filteredUnits.length,
                            })}
                        </Badge>
                    </div>
                </div>

                {/* ---- Filters Row: Search + Wing + Status ---- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative">
                        <SearchInput
                            placeholder={t("building.searchUnitPlaceholder") || "Search unit..."}
                            value={levelState.unitSearchQuery}
                            onChange={levelState.setUnitSearchQuery}
                            className="w-full mb-0 text-xs"
                        />
                    </div>
                    <Select
                        options={levelState.wings.map((w) => ({ label: w.wingName, value: String(w.wingDetailId) }))}
                        value={levelState.selectedWingDetailId ? String(levelState.selectedWingDetailId) : ""}
                        onChange={(_, val) => {
                            const params = new URLSearchParams(searchParams.toString());
                            if (val === "all") {
                                levelState.setSelectedWingDetailId(null);
                                params.delete("wingDetailId");
                            } else {
                                const nextWingDetailId = Number(val);
                                levelState.setSelectedWingDetailId(nextWingDetailId);
                                params.set("wingDetailId", String(nextWingDetailId));
                            }
                            updateUrl(params);
                        }}
                        selectSize="sm"
                        className="text-xs"
                    />
                    <Select
                        options={[
                            { label: translate("building.allStatus", "All Status"), value: "all" },
                            { label: translate("building.appliedOnly", "Applied (Direct)"), value: "direct" },
                            { label: translate("building.wingCoveredOnly", "Wing Covered"), value: "wing" },
                            { label: translate("building.apartmentCoveredOnly", "Apartment Covered"), value: "apartment" },
                            { label: translate("building.notAppliedOnly", "Not Applied"), value: "none" },
                        ]}
                        value={statusFilter}
                        onChange={(_, val) => setStatusFilter(val as CoverageStatus | "all")}
                        selectSize="sm"
                        className="text-xs"
                    />
                </div>

                {/* ---- Unit Table ---- */}
                <MasterTable<UnitRow>
                    columns={unitTableColumns}
                    data={unitTableData}
                    isPagination={false}
                    emptyText={t("building.noUnitsMatch") || "No units match the selected filters"}
                    maxBodyHeightClassName="max-h-36 sm:max-h-40"
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 30) {
                            levelState.loadNextUnitsPage();
                        }
                    }}
                    getRowKey={(row, i) => `${row.propertyDetailsId ?? ""}-${i}`}
                    onRowClick={(row) => {
                        const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                        if (isUnitApplied(unitPropId)) {
                            toast.info(
                                translate(
                                    "building.unitAlreadyAppliedHint",
                                    "This unit is already applied. Click the edit icon to modify its details."
                                )
                            );
                            return;
                        }
                        if (searchParams.get("unitPropertyId")) {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete("unitPropertyId");
                            updateUrl(params);
                        }
                        levelState.toggleUnitSelection(unitPropId);
                    }}
                    rowClassName={(row) => {
                        const unitPropId = (row.propertyId ?? row.propertyDetailsId) as number;
                        const isApplied = isUnitApplied(unitPropId);
                        const isEditingThisUnit = editingUnitId === unitPropId;
                        const isSelected = !isApplied && levelState.selectedUnitIds.has(unitPropId);

                        if (isEditingThisUnit) {
                            return "select-none bg-blue-50/90 font-semibold ring-1 ring-blue-500/60 border-l-4 border-l-blue-600 shadow-sm cursor-pointer";
                        }
                        if (isApplied) {
                            // Changed: removed opacity-60 and text-slate-400
                            return "select-none bg-slate-50/50 border-l-4 border-l-slate-300 cursor-not-allowed";
                        }
                        return cn(
                            "select-none cursor-pointer hover:bg-slate-50/80 transition-colors border-l-4 border-l-transparent",
                            isSelected &&
                                "bg-blue-50/90 font-semibold ring-1 ring-blue-500/60 border-l-4 border-l-blue-600 shadow-sm",
                        );
                    }}
                />

                {/* Loading More Units */}
                {levelState.isLoadingMoreUnits && (
                    <div className="py-1.5 text-center text-xs text-blue-600 font-medium flex items-center justify-center gap-2 bg-blue-50/40 rounded-lg">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>{t("building.loadingNextUnits") || "Loading next 10 units..."}</span>
                    </div>
                )}
            </div>

            {/* ---- Unit Scope Target Banner ---- */}
            {levelState.selectedUnitIds.size === 0 ? (
                <div className="flex items-center gap-2 p-2 bg-amber-50/90 border border-amber-300/80 rounded-lg text-xs text-amber-900 shadow-2xs">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                        <strong>{t("building.noUnitsSelectedTitle") || "No units selected"}:</strong>{" "}
                        {t("building.noUnitsSelectedHint") ||
                            "Please click on one or more units in the table above to configure or attach their data."}
                    </span>
                </div>
            ) : isEditingAppliedUnit ? (
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-300 rounded-lg text-xs shadow-2xs">
                    <div className="flex items-center gap-2 text-blue-900 font-semibold">
                        <Pencil className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                            {translate("building.editingAppliedUnit", `Editing applied details for unit (${selectedUnitNamesSummary})`)}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-xs text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                    >
                        {translate("building.cancelEdit", "Cancel Edit")}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-xs shadow-2xs">
                    <div className="flex items-center gap-2 text-blue-900 font-semibold">
                        <Store className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                            {t("building.configuringForUnits", {
                                count: levelState.selectedUnitIds.size,
                                units: selectedUnitNamesSummary,
                            })}
                        </span>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {viewerModalData?.isOpen && (
                <DocumentViewerModal
                    isOpen={viewerModalData.isOpen}
                    onClose={() => setViewerModalData(null)}
                    fileUrl={viewerModalData.fileUrl}
                    fileName={viewerModalData.fileName}
                />
            )}
        </>
    );
};
