"use client";

import { useCallback, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import type { JSX } from "react";

import TableHeader from "@/components/common/TableHeader";
import { useConfirm } from "@/components/common";
import { PageContainer } from "@/components/common/PageContainer";
import type { MatrixColumn, MatrixRow } from "@/components/common/MatrixGrid";

import {
  addRangeAction,
  syncDepreciationRatesAction,
  deleteRangeAction,
} from "@/app/[locale]/property-tax/depreciation-master/actions";

import type { RangeRow, DepreciationMasterProps } from "@/types/depreciation.types";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { useDepreciationValidation } from "@/hooks/useDepreciationValidation";

function makeRangeId(min: number, max: number): string {
  return `${min}-${max}`;
}

export default function DepreciationMaster({
  data,
  constructionTypes: initialConstructionTypes,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  rangeCountInCurrentPage,
  locale: localeProp,
}: Readonly<DepreciationMasterProps>): JSX.Element {
  const t = useTranslations("depreciation.depreciationMaster");
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const locale = localeProp ?? "en";

  /* ----------------------------- State ----------------------------- */
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<number, number>>({});
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);
  const [selectedRangeId, setSelectedRangeId] = useState<string | null>(null);
  const [localRateOverrides, setLocalRateOverrides] = useState<Record<string, Record<number, number>>>({});

  /* ================= DERIVED STATE (useMemo) ================= */
  const derivedState = useMemo(() => {
    const rangeMap = new Map<string, RangeRow>();
    const rateMap: Record<string, Record<number, number>> = {};

    data.forEach((row) => {
      const id = makeRangeId(row.minYear, row.maxYear);

      if (!rangeMap.has(id)) {
        rangeMap.set(id, {
          id,
          min: row.minYear,
          max: row.maxYear,
          label: `${row.minYear}-${row.maxYear}`,
        });
      }

      if (!rateMap[id]) rateMap[id] = {};
      rateMap[id][row.constructionTypeId] = row.rate ?? 0;
    });

    // FIXED: Only show construction types that have actual records in current page
    // Don't create phantom cells with 0 values for missing construction types
    // This prevents editable cells that have no backing data and would cause update failures
    
    const sortedRanges = Array.from(rangeMap.values()).sort((a, b) => a.min - b.min);

    return {
      dbRows: data,
      ranges: sortedRanges,
      baseRatesByRange: rateMap,
      defaultSelectedRangeId: sortedRanges[0]?.id ?? null,
    };
  }, [initialConstructionTypes, data]);

  // Merge base rates with local overrides
  const ratesByRange = useMemo(() => {
    const merged: Record<string, Record<number, number>> = {};
    for (const rangeId of Object.keys(derivedState.baseRatesByRange)) {
      const base = derivedState.baseRatesByRange[rangeId];
      const overrides = localRateOverrides[rangeId];
      merged[rangeId] = overrides ? { ...base, ...overrides } : base;
    }
    return merged;
  }, [derivedState.baseRatesByRange, localRateOverrides]);

  // Destructure for easier access
  const { dbRows, ranges, defaultSelectedRangeId } = derivedState;

  // Use selected range or fallback to default
  const effectiveSelectedRangeId = useMemo(() => {
    if (selectedRangeId && ranges.some((r) => r.id === selectedRangeId)) {
      return selectedRangeId;
    }
    return defaultSelectedRangeId;
  }, [selectedRangeId, ranges, defaultSelectedRangeId]);

  /* ================= VALIDATION HOOK ================= */
  // Note: Overlap validation is now handled server-side only
  const { validateMinMax, sanitizeInput } = useDepreciationValidation(t);

  /* ================= URL NAVIGATION ================= */
  const buildUrl = useCallback(
    (page: number, size: number) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));
      return `${pathname}?${params.toString()}`;
    },
    [pathname]
  );

  const handlePageChange = useCallback(
    (page: number) => router.push(buildUrl(page, pageSize)),
    [router, buildUrl, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => router.push(buildUrl(1, size)),
    [router, buildUrl]
  );

  const refreshPage = useCallback(() => router.refresh(), [router]);

  /* ================= DATA RELOAD ================= */
  const reloadData = useCallback(async () => {
    setSaving(true);
    try {
      refreshPage();
      setPendingChanges({});
      setLocalRateOverrides({});
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("errors.load"));
    } finally {
      setSaving(false);
    }
  }, [t, refreshPage]);

  /* ================= HANDLERS ================= */
  const handleCellChange = (rowId: string, colId: string, value: string | number) => {
    const numValue = typeof value === "string" ? Number(value) : value;

    setLocalRateOverrides((prev) => {
      const existing = prev[rowId];
      return {
        ...prev,
        [rowId]: existing
          ? { ...existing, [Number(colId)]: numValue }
          : { [Number(colId)]: numValue },
      };
    });

    const range = ranges.find((r) => r.id === rowId);
    if (!range) return;

    const targetRecord = dbRows.find(
      (r) =>
        r.constructionTypeId === Number(colId) &&
        r.minYear === range.min &&
        r.maxYear === range.max
    );

    if (targetRecord?.id) {
      setPendingChanges((prev) => ({
        ...prev,
        [targetRecord.id]: numValue,
      }));
    }
  };

  const handleUpdateRates = async () => {
    const changeCount = Object.keys(pendingChanges).length;
    if (changeCount === 0) {
      toast.info(t("messages.noChanges"));
      return;
    }

    setSaving(true);
    const tid = toast.loading(t("messages.updating", { count: changeCount }));
    try {
      // Pass current page records for efficient server-side update
      const res = await syncDepreciationRatesAction(locale, dbRows, pendingChanges);
      if (!res.success) throw new Error(res.error);
      toast.success(t("success.updated"), { id: tid });
      await reloadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("errors.update"), { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const handleMinChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setMinValue(sanitized);
    setMinError(null);
  };

  const handleMaxChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setMaxValue(sanitized);
    setMaxError(null);
  };

  const handleAddRange = async () => {
    const result = validateMinMax(minValue, maxValue);
    setMinError(result.minError);
    setMaxError(result.maxError);

    if (!result.valid) return;

    setSaving(true);
    const tid = toast.loading(t("messages.creatingRange"));
    try {
      const res = await addRangeAction(locale, {
        minYear: Number(minValue),
        maxYear: Number(maxValue),
      });

      if (!res.success) throw new Error(res.error);

      toast.success(t("success.added"), { id: tid });
      setMinValue("");
      setMaxValue("");
      await reloadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("errors.add"), { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRange = async () => {
    if (!effectiveSelectedRangeId) return;
    const range = ranges.find((r) => r.id === effectiveSelectedRangeId);
    if (!range) return;

    confirm({
      variant: "delete",
      title: t("deleteRangeConfirmTitle"),
      description: t("deleteRangeConfirmDesc", {
        min: range.min,
        max: range.max,
        age: `${range.min}-${range.max}`,
      }),
      meta: { range: `${range.min}-${range.max}` },
      onConfirm: async () => {
        setSaving(true);
        try {
          const res = await deleteRangeAction(locale, {
            minYear: range.min,
            maxYear: range.max,
          });
          if (!res.success) throw new Error(res.error);
          toast.success(t("success.deleted"));
          await reloadData();
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : t("errors.delete"));
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleRangeSelection = (rangeId: string | null) => {
    setSelectedRangeId(rangeId);
  };

  /* ================= GRID MAPPING ================= */
  const matrixRows: MatrixRow[] = useMemo(
    () =>
      ranges.map((r) => ({
        id: r.id,
        cells: ratesByRange[r.id] ?? {},
        meta: { range: `${r.min}-${r.max}` },
      })),
    [ranges, ratesByRange]
  );

  const matrixColumns: MatrixColumn[] = useMemo(() => {
    // Only show construction types that have actual data in current page
    const constructionTypesWithData = new Set<number>();
    
    // Collect all construction type IDs that have data in current page
    Object.values(ratesByRange).forEach(rangeRates => {
      Object.keys(rangeRates).forEach(constructionIdStr => {
        constructionTypesWithData.add(Number(constructionIdStr));
      });
    });
    
    // Filter to only include construction types with actual data
    return initialConstructionTypes
      .filter(c => constructionTypesWithData.has(c.constructionId))
      .map((c) => ({
        id: String(c.constructionId),
        label: c.constructionCode,
        headerClassName: "bg-blue-50 text-blue-900 font-semibold",
      }));
  }, [initialConstructionTypes, ratesByRange]);

  const editableColumnIds = useMemo(() => {
    // Row-specific editable columns based on selected range
    if (!effectiveSelectedRangeId) return [];
    const selectedRangeRates = ratesByRange[effectiveSelectedRangeId];
    if (!selectedRangeRates) return [];
    return Object.keys(selectedRangeRates);
  }, [effectiveSelectedRangeId, ratesByRange]);

  return (
    <PageContainer>
      <div className="space-y-4">
        <TableHeader title={t("title")} subtitle={t("subtitle")} icon={FileText} />
        
        {/* Range-based Pagination Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <div className="flex items-center justify-between">
            <span>
              {t("pagination.showing", { 
                ranges: rangeCountInCurrentPage, 
                page: pageNumber, 
                totalPages 
              })}
            </span>
            <span className="text-blue-600">
              {t("pagination.total", { count: totalCount })}
            </span>
          </div>
        </div>

        {/* Construction Type Visibility Info */}
        {matrixColumns.length < initialConstructionTypes.length && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <span className="font-medium">📋 {t("pagination.constructionTypes")}:</span>
              <span>
                {t("pagination.showingTypes", { 
                  shown: matrixColumns.length, 
                  total: initialConstructionTypes.length 
                })}
              </span>
            </div>
            <div className="mt-1 text-xs">
              {t("pagination.typesMayBeOnOtherPages")}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <LeftPanel
            minValue={minValue}
            maxValue={maxValue}
            minError={minError}
            maxError={maxError}
            ranges={ranges}
            selectedRangeId={effectiveSelectedRangeId}
            saving={saving}
            onMinChange={handleMinChange}
            onMaxChange={handleMaxChange}
            onAddRange={handleAddRange}
            onSelectRange={handleRangeSelection}
            onDeleteRange={handleDeleteRange}
            t={t}
          />

          <RightPanel
            matrixColumns={matrixColumns}
            matrixRows={matrixRows}
            ranges={ranges}
            selectedRangeId={effectiveSelectedRangeId}
            saving={saving}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            editableColumnIds={editableColumnIds}
            onCellChange={handleCellChange}
            onUpdateRates={handleUpdateRates}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            t={t}
          />
        </div>
      </div>
    </PageContainer>
  );
}
