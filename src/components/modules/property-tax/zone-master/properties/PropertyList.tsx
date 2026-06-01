"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Building2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MasterTable } from "@/components/common/MasterTable";
import { SearchInput, StatusBadge, AddButton, Select, Option, Label } from "@/components/common";
import { ZonePropertyItem } from "@/types/zone-master/properties/zoneProperty.types";
import { WardItem } from "@/types/wardMaster.types";
import { usePropertyListHandlers } from "@/hooks/zoneMaster/usePropertyListHandlers";
import { usePropertyDelete } from "@/hooks/zoneMaster/usePropertyDelete";
import { getPropertyColumns } from "./propertyColumns";
import { DeleteLabelButton } from "@/components/common/ActionButtons";
import type { Column } from "@/components/common/MasterTable";

interface PropertyCategoryMap {
    [key: number]: string;
}

interface PropertyTypeMap {
    [key: number]: string;
}

interface Props {
    properties: ZonePropertyItem[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchTerm?: string;
    selectedWardId: number | null;
    wards: WardItem[];
    currentWard?: WardItem | undefined;
    selectedZoneId: number | null;
    categoryMap?: PropertyCategoryMap;
    propertyTypeMap?: PropertyTypeMap;
}

export default function PropertyList({
    properties,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    searchTerm = "",
    selectedWardId,
    wards,
    selectedZoneId,
    categoryMap = {},
    propertyTypeMap = {},
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("zoneMaster");
    const tCommon = useTranslations("common");

    // ── Selection state ──────────────────────────────────────────────────────
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    // Reset selection when the property list changes (page/ward change)
    useEffect(() => {
        setSelectedRows(new Set());
    }, [properties, selectedWardId]);

    const allSelected =
        properties.length > 0 && selectedRows.size === properties.length;
    const someSelected = selectedRows.size > 0 && !allSelected;

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = someSelected;
        }
    }, [someSelected]);

    const toggleSelectAll = useCallback(() => {
        setSelectedRows(
            allSelected
                ? new Set()
                : new Set(properties.map((p) => String(p.id)))
        );
    }, [allSelected, properties]);

    const toggleRow = useCallback((id: string) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    // ── Delete operations (extracted to custom hook) ────────────────────────
    const { isDeleting, handleBulkDelete: performBulkDelete } = usePropertyDelete({
        onClearSelection: () => setSelectedRows(new Set()),
    });

    // Wrapper to pass selected IDs sorted by partitionNo descending so the
    // backend's "delete highest partition first" constraint is satisfied.
    // When partition numbers are equal, sort by flatOrShopNo ascending (A before S).
    const handleBulkDelete = useCallback(() => {
        const sorted = Array.from(selectedRows).sort((a, b) => {
            const propA = properties.find((p) => String(p.id) === a);
            const propB = properties.find((p) => String(p.id) === b);
            const partA = propA?.partitionNo ?? "";
            const partB = propB?.partitionNo ?? "";
            
            // Main properties (no partition) handled separately
            if (!partA && !partB) {
                // Both are main properties - sort by flatOrShopNo ascending
                const flatA = propA?.flatOrShopNo ?? "";
                const flatB = propB?.flatOrShopNo ?? "";
                return flatA.localeCompare(flatB, undefined, { numeric: true, sensitivity: "base" });
            }
            if (!partA) return 1;  // main property deleted last
            if (!partB) return -1;
            
            // Compare partition numbers first (descending - highest first)
            const partComparison = partB.localeCompare(partA, undefined, { numeric: true, sensitivity: "base" });
            
            // If partition numbers are equal, sort by flatOrShopNo ascending (A before S)
            if (partComparison === 0) {
                const flatA = propA?.flatOrShopNo ?? "";
                const flatB = propB?.flatOrShopNo ?? "";
                return flatA.localeCompare(flatB, undefined, { numeric: true, sensitivity: "base" });
            }
            
            return partComparison;
        });
        
        performBulkDelete(sorted);
    }, [selectedRows, properties, performBulkDelete]);

    const {
        localSearch,
        handleSearchChange,
        handlePageChange,
        handlePageSizeChange,
        handleWardChange,
    } = usePropertyListHandlers({
        selectedWardId,
        selectedZoneId,
        searchTerm,
        pageNumber,
        pageSize,
    });

    // Ward options for dropdown
    const wardOptions: Option[] = useMemo(() => {
        return wards.map((ward) => ({
            value: String(ward.id),
            label: `${ward.wardNo}${ward.description ? ` - ${ward.description}` : ""}`,
        }));
    }, [wards]);

    const currentWard = useMemo(() => {
        if (selectedWardId === null || selectedWardId === undefined) return null;
        return wards.find((w) => Number(w.id) === Number(selectedWardId)) ?? null;
    }, [selectedWardId, wards]);

    // ── Columns (checkbox + data columns) ───────────────────────────────────
    const checkboxColumn: Column<Record<string, unknown>> = useMemo(
        () => ({
            key: "select",
            label: (
                <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    disabled={properties.length === 0 || isDeleting}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    aria-label="Select all"
                />
            ),
            width: "48px",
            align: "center" as const,
            render: (_: unknown, row: Record<string, unknown>) => (
                <input
                    type="checkbox"
                    checked={selectedRows.has(String((row as ZonePropertyItem).id))}
                    onChange={() => toggleRow(String((row as ZonePropertyItem).id))}
                    disabled={isDeleting}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    aria-label={`Select property ${(row as ZonePropertyItem).propertyNo}`}
                />
            ),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [allSelected, toggleSelectAll, toggleRow, selectedRows, properties.length, isDeleting]
    );

    const dataColumns = useMemo(
        () =>
            getPropertyColumns({
                t,
                pageNumber,
                pageSize,
                wards,
                categoryMap,
                propertyTypeMap,
            }),
        [t, pageNumber, pageSize, wards, categoryMap, propertyTypeMap]
    );

    const columns = useMemo(
        () => [checkboxColumn, ...dataColumns],
        [checkboxColumn, dataColumns]
    );

    const handleCreateProperty = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedWardId !== null) params.set("propWardId", String(selectedWardId));
        params.set("createProperty", "");
        router.push(`${pathname}?${params.toString()}`);
    }, [router, pathname, searchParams, selectedWardId]);

    const handleCreatePartition = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedWardId !== null) params.set("propWardId", String(selectedWardId));
        params.set("createPartition", "");
        router.push(`${pathname}?${params.toString()}`);
    }, [router, pathname, searchParams, selectedWardId]);

    const handleOpenDeleteDrawer = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedWardId !== null) params.set("propWardId", String(selectedWardId));
        params.set("deleteProperty", "");
        router.push(`${pathname}?${params.toString()}`);
    }, [router, pathname, searchParams, selectedWardId]);


    return (
        <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="p-4 py-0">
                <div className="flex items-center justify-between px-4 py-2 mb-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                            <span className="text-sm font-semibold text-blue-900">
                                {t("propertyList.dependencyFlow")}
                            </span>
                            <p className="text-xs text-blue-600 mt-0.5">
                                {t("propertyList.dependencyPath")}
                            </p>
                        </div>
                    </div>
                    {selectedWardId && (
                        <StatusBadge
                            label={wardOptions.find(w => w.value === String(selectedWardId))?.label || `${t("propertyList.ward")} ${selectedWardId}`}
                            variant="info"
                        />
                    )}
                </div>

                {/* Ward Dropdown and Search Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Select
                            label={t("propertyList.selectWard")}
                            options={wardOptions}
                            value={selectedWardId ? String(selectedWardId) : ""}
                            onChange={(_, value) => handleWardChange(value)}
                            placeholder={t("propertyList.selectWardPlaceholder")}
                            disabled={wards.length === 0}
                            selectSize="md"
                        />
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("propertyList.search")}
                        </Label>
                        <SearchInput
                            className="w-full"
                            placeholder={t("propertyList.searchPlaceholder")}
                            value={localSearch}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Properties Header with Actions */}
                <div className="flex items-center justify-between mb-3 mt-4">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#1A86E8]" />
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-base font-semibold text-[#1A86E8]">
                                {t("propertyList.title")}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {t("propertyList.selectWardHint")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <AddButton
                            size="sm"
                            label={t("propertyList.createProperty")}
                            onClick={handleCreateProperty}
                            disabled={selectedWardId === null}
                        />
                        <AddButton
                            size="sm"
                            label={t("propertyList.createPartition")}
                            onClick={handleCreatePartition}
                            disabled={selectedWardId === null}
                        />
                        {/* Bulk delete — shown only when rows are selected */}
                        {selectedRows.size > 0 && (
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected ({selectedRows.size})
                            </button>
                        )}
                        <DeleteLabelButton
                            label={t("propertyList.deleteButton")}
                            onClick={handleOpenDeleteDrawer}
                            disabled={selectedWardId === null}
                        />
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 px-4 pb-4">
                {selectedWardId === null ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        {t("propertyList.selectWardPrompt")}
                    </div>
                ) : (
                    <MasterTable
                        columns={columns}
                        data={properties as unknown as Record<string, unknown>[]}
                        emptyText={t("propertyList.noPropertiesFound")}
                        height="xs"
                        paginationConfig={{ enabled: true, showPageSizeSelector: false }}
                        pageNumber={pageNumber}
                        pageSize={pageSize}
                        totalCount={totalCount}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        footerLeftContent={
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                {tCommon("table.showing")}{" "}
                                {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1}{" "}
                                {tCommon("table.to")}
                                <select
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    className="border border-blue-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    aria-label={tCommon("table.rowsPerPage")}
                                >
                                    {[5, 10, 20, 50].map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                {tCommon("table.of")}{" "}
                                <span>
                                    {totalCount} {tCommon("table.entries")}
                                </span>
                            </div>
                        }
                    />
                )}
            </div>

        </div>
    );
}

