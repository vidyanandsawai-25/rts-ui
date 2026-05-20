"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { useConfirm } from "@/components/common";
import {
  addRangeAction,
  syncDepreciationRatesAction,
  deleteRangeAction,
} from "@/app/[locale]/property-tax/depreciation-master/actions";
import type { RangeRow, DepreciationRate } from "@/types/depreciation.types";
import { useDepreciationValidation } from "@/hooks/useDepreciationValidation";

interface UseDepreciationHandlersParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  locale: string;
  pageSize: number;
  dbRows: DepreciationRate[];
  ranges: RangeRow[];
  effectiveSelectedRangeId: string | null;
  pendingChanges: Record<number, number>;
  setPendingChanges: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setLocalRateOverrides: React.Dispatch<React.SetStateAction<Record<string, Record<number, number>>>>;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setMinValue: React.Dispatch<React.SetStateAction<string>>;
  setMaxValue: React.Dispatch<React.SetStateAction<string>>;
  setMinError: React.Dispatch<React.SetStateAction<string | null>>;
  setMaxError: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedRangeId: React.Dispatch<React.SetStateAction<string | null>>;
  minValue: string;
  maxValue: string;
}

export function useDepreciationHandlers({
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
}: UseDepreciationHandlersParams) {
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const { validateMinMax, sanitizeInput, checkOverlap } = useDepreciationValidation(t);

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
  }, [t, refreshPage, setSaving, setPendingChanges, setLocalRateOverrides]);

  const handleCellChange = useCallback(
    (rowId: string, colId: string, value: string | number) => {
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
    },
    [ranges, dbRows, setLocalRateOverrides, setPendingChanges]
  );

  const handleUpdateRates = useCallback(async () => {
    const changeCount = Object.keys(pendingChanges).length;
    if (changeCount === 0) {
      toast.info(t("messages.noChanges"));
      return;
    }

    setSaving(true);
    const tid = toast.loading(t("messages.updating", { count: changeCount }));
    try {
      const res = await syncDepreciationRatesAction(locale, dbRows, pendingChanges);
      if (!res.success) throw new Error(res.error);
      toast.success(t("success.updated"), { id: tid });
      await reloadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("errors.update"), { id: tid });
    } finally {
      setSaving(false);
    }
  }, [pendingChanges, locale, dbRows, t, setSaving, reloadData]);

  const handleMinChange = useCallback(
    (value: string) => {
      const sanitized = sanitizeInput(value);
      setMinValue(sanitized);
      setMinError(null);
    },
    [sanitizeInput, setMinValue, setMinError]
  );

  const handleMaxChange = useCallback(
    (value: string) => {
      const sanitized = sanitizeInput(value);
      setMaxValue(sanitized);
      setMaxError(null);
    },
    [sanitizeInput, setMaxValue, setMaxError]
  );

  const handleAddRange = useCallback(async () => {
    const result = validateMinMax(minValue, maxValue);
    setMinError(result.minError);
    setMaxError(result.maxError);

    if (!result.valid) return;

    const overlapping = checkOverlap(Number(minValue), Number(maxValue), ranges);
    if (overlapping) {
      setMinError(t("errors.overlap", { range: `${overlapping.min}-${overlapping.max}` }));
      return;
    }

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
  }, [minValue, maxValue, ranges, locale, t, validateMinMax, checkOverlap, setMinError, setMaxError, setSaving, setMinValue, setMaxValue, reloadData]);

  const handleDeleteRange = useCallback(async () => {
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
  }, [effectiveSelectedRangeId, ranges, locale, t, confirm, setSaving, reloadData]);

  const handleRangeSelection = useCallback(
    (rangeId: string | null) => {
      setSelectedRangeId(rangeId);
    },
    [setSelectedRangeId]
  );

  return {
    handlePageChange,
    handlePageSizeChange,
    handleCellChange,
    handleUpdateRates,
    handleMinChange,
    handleMaxChange,
    handleAddRange,
    handleDeleteRange,
    handleRangeSelection,
  };
}
