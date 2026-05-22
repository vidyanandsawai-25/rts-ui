"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { JSX } from "react";
import type { RangeRow, DepreciationMasterProps } from "@/types/depreciation.types";
import { DepreciationMasterGrid } from "./DepreciationMasterGrid";
import { useDepreciationHandlers } from "./useDepreciationHandlers";

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
  locale: localeProp,
}: Readonly<DepreciationMasterProps>): JSX.Element {
  const t = useTranslations("depreciation.depreciationMaster");
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

    const sortedRanges = Array.from(rangeMap.values()).sort((a, b) => a.min - b.min);

    return {
      dbRows: data,
      ranges: sortedRanges,
      baseRatesByRange: rateMap,
      defaultSelectedRangeId: sortedRanges[0]?.id ?? null,
    };
  }, [data]);

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

  /* ================= HANDLERS HOOK ================= */
  const {
    handlePageChange,
    handlePageSizeChange,
    handleCellChange,
    handleUpdateRates,
    handleMinChange,
    handleMaxChange,
    handleAddRange,
    handleDeleteRange,
    handleRangeSelection,
  } = useDepreciationHandlers({
    t,
    locale,
    pageSize,
    dbRows,
    ranges,
    effectiveSelectedRangeId,
    pendingChanges,
    setPendingChanges,
    setLocalRateOverrides,
    setSaving,
    setMinValue,
    setMaxValue,
    setMinError,
    setMaxError,
    setSelectedRangeId,
    minValue,
    maxValue,
  });

  // GRID MAPPING & RENDERING
  const matrixRows = useMemo(
    () =>
      ranges.map((r) => ({
        id: r.id,
        cells: ratesByRange[r.id] ?? {},
        meta: { range: `${r.min}-${r.max}` },
      })),
    [ranges, ratesByRange]
  );

  const matrixColumns = useMemo(() => {
    return initialConstructionTypes.map((c) => ({
      id: String(c.constructionId),
      label: c.constructionCode,
      headerClassName: "bg-blue-50 text-blue-900 font-semibold",
    }));
  }, [initialConstructionTypes]);

  const editableColumnIds = useMemo(() => {
    return initialConstructionTypes.map((c) => String(c.constructionId));
  }, [initialConstructionTypes]);

  return (
    <DepreciationMasterGrid
      t={t}
      minValue={minValue}
      maxValue={maxValue}
      minError={minError}
      maxError={maxError}
      ranges={ranges}
      effectiveSelectedRangeId={effectiveSelectedRangeId}
      saving={saving}
      handleMinChange={handleMinChange}
      handleMaxChange={handleMaxChange}
      handleAddRange={handleAddRange}
      handleRangeSelection={handleRangeSelection}
      handleDeleteRange={handleDeleteRange}
      matrixColumns={matrixColumns}
      matrixRows={matrixRows}
      pageNumber={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      editableColumnIds={editableColumnIds}
      handleCellChange={handleCellChange}
      handleUpdateRates={handleUpdateRates}
      handlePageChange={handlePageChange}
      handlePageSizeChange={handlePageSizeChange}
    />
  );
}
