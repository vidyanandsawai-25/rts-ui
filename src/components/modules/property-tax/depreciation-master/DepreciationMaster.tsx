"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import type { DepreciationConstructionType, DepreciationRow, RangeRow, DepreciationMasterProps } from "@/types/depreciation.types";
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
  const [dbRows, setDbRows] = useState<DepreciationRow[]>(data);
  const [ranges, setRanges] = useState<RangeRow[]>([]);
  const [selectedRangeId, setSelectedRangeId] = useState<string | null>(null);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);
  const [ratesByRange, setRatesByRange] = useState<Record<string, Record<number, number>>>({});

  /* ================= VALIDATION HOOK ================= */
  const { validateMinMax, sanitizeInput } = useDepreciationValidation(t, ranges);

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

  /* ================= BUILD UI LOGIC ================= */

  // Pure function to derive UI state from db
  const buildUiFromDb = useCallback(
    (ct: DepreciationConstructionType[], currentDbRows: DepreciationRow[]) => {
      const rangeMap = new Map<string, RangeRow>();
      const rateMap: Record<string, Record<number, number>> = {};

      currentDbRows.forEach((row) => {
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

      rangeMap.forEach((r) => {
        if (!rateMap[r.id]) rateMap[r.id] = {};
        ct.forEach((c) => {
          rateMap[r.id][c.constructionId] ??= 0;
        });
      });

      const sortedRanges = Array.from(rangeMap.values()).sort((a, b) => a.min - b.min);
      const initialSelectedRangeId = sortedRanges[0]?.id ?? null;

      return {
        sortedRanges,
        rateMap,
        currentDbRows,
        initialSelectedRangeId,
      };
    },
    []
  );

  // Build UI when construction types or data changes
  useEffect(() => {
    const { sortedRanges, rateMap, currentDbRows, initialSelectedRangeId } = buildUiFromDb(initialConstructionTypes, data);
    setRanges(sortedRanges);
    setRatesByRange(rateMap);
    setDbRows(currentDbRows);
    setSelectedRangeId((prev) =>
      prev && sortedRanges.some((r) => r.id === prev) ? prev : initialSelectedRangeId
    );
    setPendingChanges({});
  }, [initialConstructionTypes, data, buildUiFromDb]);

  /* ================= DATA RELOAD ================= */
  const reloadData = useCallback(async () => {
    setSaving(true);
    try {
      refreshPage();
      setPendingChanges({});
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("errors.load"));
    } finally {
      setSaving(false);
    }
  }, [t, refreshPage]);

  /* ================= HANDLERS ================= */
  const handleCellChange = (rowId: string, colId: string, value: string | number) => {
    const numValue = typeof value === "string" ? Number(value) : value;

    setRatesByRange((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [Number(colId)]: numValue },
    }));

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
      const res = await syncDepreciationRatesAction(locale, pendingChanges);
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
    if (!selectedRangeId) return;
    const range = ranges.find((r) => r.id === selectedRangeId);
    if (!range) return;

    confirm({
      variant: "delete",
      title: t("deleteRangeConfirmTitle"),
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

  const matrixColumns: MatrixColumn[] = useMemo(
    () =>
      initialConstructionTypes.map((c) => ({
        id: String(c.constructionId),
        label: c.constructionCode,
        headerClassName: "bg-blue-50 text-blue-900 font-semibold",
      })),
    [initialConstructionTypes]
  );

  const editableColumnIds = useMemo(
    () => initialConstructionTypes.map((c) => String(c.constructionId)),
    [initialConstructionTypes]
  );

  return (
    <PageContainer>
      <div className="space-y-4">
        <TableHeader title={t("title")} subtitle={t("subtitle")} icon={FileText} />

        <div className="grid grid-cols-12 gap-4">
          <LeftPanel
            minValue={minValue}
            maxValue={maxValue}
            minError={minError}
            maxError={maxError}
            ranges={ranges}
            selectedRangeId={selectedRangeId}
            saving={saving}
            onMinChange={handleMinChange}
            onMaxChange={handleMaxChange}
            onAddRange={handleAddRange}
            onSelectRange={setSelectedRangeId}
            onDeleteRange={handleDeleteRange}
            t={t}
          />

          <RightPanel
            matrixColumns={matrixColumns}
            matrixRows={matrixRows}
            ranges={ranges}
            selectedRangeId={selectedRangeId}
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
