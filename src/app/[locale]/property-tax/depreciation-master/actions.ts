'use server';

import { revalidatePath } from 'next/cache';
import {
  addDepreciationRangeBulk,
  deleteDepreciationRange,
  getConstructionTypes,
  getDepreciationsAll,
  syncDepreciationRates,
} from '@/lib/api/depreciation.services';
import type { ActionResult, DepreciationConstructionType, DepreciationRow } from '@/types/depreciation.types';

/**
 * Path helper to ensure consistency across revalidations
 */
const getPagePath = (locale: string) => `/${locale}/property-tax/depreciation-master`;

/**
 * Unique Range type for pagination
 */
interface UniqueRange {
  minYear: number;
  maxYear: number;
}

/**
 * Fetches paginated unique ranges with their depreciation data.
 * Server-side pagination for ranges (not individual records).
 */
export async function fetchRangesPagedServerAction(
  pageNumber: number,
  pageSize: number
): Promise<{
  success: boolean;
  data?: {
    rows: DepreciationRow[];
    constructionTypes: DepreciationConstructionType[];
    // Pagination info for ranges
    rangePageNumber: number;
    rangePageSize: number;
    rangeTotalCount: number;
    rangeTotalPages: number;
  };
  error?: string;
}> {
  try {
    // Validate pagination parameters
    if (pageNumber <= 0 || pageSize <= 0) {
      return { success: false, error: 'Invalid pagination parameters' };
    }

    const [allRows, constructionTypes] = await Promise.all([
      getDepreciationsAll(),
      getConstructionTypes(),
    ]);

    // Extract unique ranges from all rows
    const rangeMap = new Map<string, UniqueRange>();
    allRows.forEach((row) => {
      const key = `${row.minYear}-${row.maxYear}`;
      if (!rangeMap.has(key)) {
        rangeMap.set(key, { minYear: row.minYear, maxYear: row.maxYear });
      }
    });

    // Sort ranges by minYear
    const allRanges = Array.from(rangeMap.values()).sort((a, b) => a.minYear - b.minYear);
    const rangeTotalCount = allRanges.length;
    const rangeTotalPages = Math.ceil(rangeTotalCount / pageSize) || 1;

    // Apply pagination to ranges
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRanges = allRanges.slice(startIndex, endIndex);

    // Filter rows that belong to paginated ranges only
    const paginatedRangeKeys = new Set(paginatedRanges.map((r) => `${r.minYear}-${r.maxYear}`));
    const filteredRows = allRows.filter((row) =>
      paginatedRangeKeys.has(`${row.minYear}-${row.maxYear}`)
    );

    return {
      success: true,
      data: {
        rows: filteredRows,
        constructionTypes,
        rangePageNumber: pageNumber,
        rangePageSize: pageSize,
        rangeTotalCount,
        rangeTotalPages,
      },
    };
  } catch (error: unknown) {
    console.error('[fetchRangesPagedServerAction] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load depreciation data',
    };
  }
}

/**
 * Fetches all necessary data for the Depreciation Screen.
 * Gets both columns (ConstructionTypes) and data (Rows).
 */
export async function getDepreciationScreenAction(): Promise<
  ActionResult<{
    constructionTypes: DepreciationConstructionType[];
    rows: DepreciationRow[];
  }>
> {
  try {
    // Parallel fetch for better performance
    const [constructionTypes, rows] = await Promise.all([
      getConstructionTypes(),
      getDepreciationsAll(),
    ]);

    return {
      success: true,
      data: { constructionTypes, rows },
    };
  } catch (error: unknown) {
    console.error('[getDepreciationScreenAction] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load screen data',
    };
  }
}

/**
 * NEW: Professional Global Sync Action
 * This handles the "Dirty Tracking" update. It only updates the records
 * that were actually changed in the UI grid.
 * @param changes - Object mapping id to new rate value
 */
export async function syncDepreciationRatesAction(
  locale: string,
  changes: Record<number, number>
): Promise<ActionResult> {
  try {
    if (!changes || Object.keys(changes).length === 0) return { success: true };

    await syncDepreciationRates(changes);

    revalidatePath(getPagePath(locale));

    return { success: true };
  } catch (error: unknown) {
    console.error('[syncDepreciationRatesAction] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
  }
}

/**
 * Action to add a new range across all construction types.
 * This creates a default row (rate 0) for every construction type in the new range.
 */
export async function addRangeAction(
  locale: string,
  payload: { minYear: number; maxYear: number; defaultRate?: number }
): Promise<ActionResult> {
  try {
    await addDepreciationRangeBulk(payload);

    revalidatePath(getPagePath(locale));

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Add range failed' };
  }
}

/**
 * Action to delete an entire range.
 * Deletes all construction type records associated with this min/max year.
 */
export async function deleteRangeAction(
  locale: string,
  payload: { minYear: number; maxYear: number }
): Promise<ActionResult> {
  try {
    await deleteDepreciationRange(payload);

    revalidatePath(getPagePath(locale));

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}
