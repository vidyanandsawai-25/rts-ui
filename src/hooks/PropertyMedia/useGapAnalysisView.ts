'use client';

import { useState, useTransition, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SearchSelectOption } from "@/components/common";
import { getMissingPropertyColumns } from "@/components/modules/property-tax/PropertyMedia/GapAnalysisView/GapAnalysisViewColumn";
import { MissingPropertyRow, MissingPropertyTableData } from "@/types/PropertyMedia/PropertyMedia.types";

import { useDebounce } from "@/hooks/useDebounce";

export interface UseGapAnalysisViewProps {
    missingPropertyTableData?: MissingPropertyTableData;
    workflowStageOptions?: SearchSelectOption[];
    divisionOptions?: SearchSelectOption[];
    wardOptions?: SearchSelectOption[];
    propertyTypeOptions?: SearchSelectOption[];
}

export interface GapAnalysisViewFilters {
    workflowStageId: string;
    divisionId: string;
    wardId: string;
    propertyTypeId: string;
}

export function useGapAnalysisView({
    missingPropertyTableData,
    divisionOptions = [],
    wardOptions = [],
    propertyTypeOptions = [],
}: UseGapAnalysisViewProps = {}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const t = useTranslations("propertyMedia");
    const tCommon = useTranslations("common");

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
    const [isFilterEnabled, setIsFilterEnabled] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();


    // URL Parameters

    const urlWorkflowStageId = searchParams.get("workflowStageId") || "";
    const urlDivisionId = searchParams.get("divisionId") || "";
    const urlWardId = searchParams.get("wardId") || "";
    const urlPropertyTypeId = searchParams.get("propertyTypeId") || "";
    const urlSearchQuery = searchParams.get("q") || searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));


    // Derived Filters from URL Parameters
    const filters: GapAnalysisViewFilters = useMemo(
        () => ({
            workflowStageId: urlWorkflowStageId,
            divisionId: urlDivisionId,
            wardId: urlWardId,
            propertyTypeId: urlPropertyTypeId,
        }),
        [urlWorkflowStageId, urlDivisionId, urlWardId, urlPropertyTypeId]
    );
    const [searchTerm, setSearchTerm] = useState<string>(urlSearchQuery);
    const lastPushedQueryRef = useRef(urlSearchQuery);

    // Only update local state if URL was changed externally (e.g., Back/Forward or Reset)
    useEffect(() => {
        if (urlSearchQuery !== lastPushedQueryRef.current) {
            lastPushedQueryRef.current = urlSearchQuery;
            setSearchTerm(urlSearchQuery);
        }
    }, [urlSearchQuery]);


    // URL Query Update Helper

    const updateQueries = useCallback(
        (
            updates: Record<string, string | number | null | undefined>,
            resetPage = true
        ) => {
            startTransition(() => {
                const params = new URLSearchParams(searchParams.toString());

                Object.entries(updates).forEach(([key, value]) => {
                    if (value === null || value === undefined || value === "") {
                        params.delete(key);
                    } else {
                        params.set(key, String(value));
                    }
                });

                if (resetPage) {
                    params.delete("page");
                }

                const queryString = params.toString();
                const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
                router.push(nextUrl, { scroll: false });
            });
        },
        [router, pathname, searchParams]
    );

    // Codebase useDebounce hook integration
    const debouncedSearch = useDebounce(searchTerm, 400);

    useEffect(() => {
        const trimmed = debouncedSearch.trim();
        if (trimmed !== urlSearchQuery.trim()) {
            lastPushedQueryRef.current = trimmed;
            updateQueries({ q: trimmed || null }, true);
        }
    }, [debouncedSearch, urlSearchQuery, updateQueries]);


    // Unified Filter Handler (URL Sync)

    const handleFilterChange = useCallback(
        (name: string, value: string) => {
            if (name === "divisionId") {
                // Changing division clears wardId automatically in URL
                updateQueries(
                    {
                        divisionId: value || null,
                        wardId: null,
                    },
                    true
                );
            } else {
                updateQueries({ [name]: value || null }, true);
            }
        },
        [updateQueries]
    );

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleClear = useCallback(() => {
        setSearchTerm("");
        startTransition(() => {
            router.push(pathname, { scroll: false });
        });
    }, [router, pathname]);


    // Pagination Handlers

    const handlePageChange = useCallback(
        (newPage: number) => {
            updateQueries({ page: newPage > 1 ? newPage : null }, false);
        },
        [updateQueries]
    );

    const handlePageSizeChange = useCallback(
        (newPageSize: number) => {
            updateQueries({ pageSize: newPageSize !== 10 ? newPageSize : null }, true);
        },
        [updateQueries]
    );


    // Drawer Navigation & Close
    const handleCancel = useCallback(() => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            startTransition(() => {
                router.push(`/${locale}/property-tax/property-media`);
            });
        }, 300);
    }, [router, locale]);

    // handle filter Enable/Disable
    const handleFilter = useCallback(() => {
        setIsFilterEnabled(!isFilterEnabled);
    }, [isFilterEnabled]);

    // Table Data
    const paginatedData = useMemo(
        () => (missingPropertyTableData?.items ?? []) as MissingPropertyRow[],
        [missingPropertyTableData]
    );

    const totalCount = missingPropertyTableData?.totalCount ?? paginatedData.length;
    const totalPages = missingPropertyTableData?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));
    const gapRecords = missingPropertyTableData?.gapRecords ?? totalCount;

    // Summary Cards (Derived from URL & Options)
    const allLabel = t("propertyMediaViewDrawer.summary.all") || "All";

    const summaryItems = useMemo(() => {
        const divisionLabel = divisionOptions.find((o) => String(o.value) === String(filters.divisionId))?.label || allLabel;
        const wardLabel = wardOptions.find((o) => String(o.value) === String(filters.wardId))?.label || allLabel;
        const propertyTypeLabel = propertyTypeOptions.find((o) => String(o.value) === String(filters.propertyTypeId))?.label || allLabel;

        return [
            {
                label: t("propertyMediaViewDrawer.summary.gapRecords") || "Gap Records",
                value: String(gapRecords),
            },
            {
                label: t("propertyMediaViewDrawer.summary.division") || "Division",
                value: divisionLabel,
            },
            {
                label: t("propertyMediaViewDrawer.summary.ward") || "Ward",
                value: wardLabel,
            },
            {
                label: t("propertyMediaViewDrawer.summary.propertyType") || "Property Type",
                value: propertyTypeLabel,
            },
        ];
    }, [t, gapRecords, divisionOptions, filters.divisionId, wardOptions, filters.wardId, propertyTypeOptions, filters.propertyTypeId, allLabel]);

    // Localized Columns
    const columns = useMemo(() => getMissingPropertyColumns(t), [t]);

    return {
        // Drawer State & Close
        isDrawerOpen,
        handleCancel,
        isPending,

        // Filter States
        filters,
        workflowStageId: filters.workflowStageId,
        divisionId: filters.divisionId,
        wardId: filters.wardId,
        propertyTypeId: filters.propertyTypeId,
        searchTerm,
        isWardDisabled: !filters.divisionId,

        // Filter Handlers
        handleFilterChange,
        handleSearchChange,
        handleClear,
        handleFilter,
        isFilterEnabled,

        // Table & Pagination
        columns,
        paginatedData,
        pageNumber: page,
        pageSize,
        totalCount,
        totalPages,
        handlePageChange,
        handlePageSizeChange,

        // Summary Cards
        summaryItems,

        // Translations
        t,
        tCommon,
    };
}