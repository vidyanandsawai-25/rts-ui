'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import {
  addDepreciationRangeBulk,
  deleteDepreciationRange,
  getConstructionTypes,
  getDepreciationPaged,
  syncDepreciationRatesFromPage,
} from '@/lib/api/depreciation.services';
import type { ActionResult, DepreciationConstructionType, DepreciationRow } from '@/types/depreciation.types';
import { ApiError } from '@/lib/utils/api';

/**
 * Path helper to ensure consistency across revalidations
 */
const getPagePath = (locale: string) => `/${locale}/property-tax/depreciation-master`;

/**
 * Fetches paginated depreciation records with RANGE-BASED pagination.
 * Converts user's desired range count to record count for backend API.
 * pageSize parameter = number of RANGES to show (not records)
 */
export async function fetchRangesPagedServerAction(
  pageNumber: number,
  rangePageSize: number // User wants this many RANGES per page
): Promise<{
  success: boolean;
  data?: {
    rows: DepreciationRow[];
    constructionTypes: DepreciationConstructionType[];
    // Range-based pagination info
    pageNumber: number;
    pageSize: number; // Ranges per page (what user selected)
    totalRanges: number;
    totalPages: number;
    // For backwards compatibility
    totalRecords: number;
  };
  error?: string;
}> {
  try {
    // Validate pagination parameters
    if (pageNumber <= 0 || rangePageSize <= 0) {
      return { success: false, error: 'Invalid pagination parameters' };
    }

    // Get construction types first to calculate record multiplier
    const constructionTypes = await getConstructionTypes();
    const constructionTypeCount = constructionTypes.length || 10;
    
    // Convert range-based pagination to record-based for API
    // Each range has N construction types, so multiply
    const recordPageSize = rangePageSize * constructionTypeCount;
    
    // Fetch records using calculated record page size
    const paginatedResponse = await getDepreciationPaged(pageNumber, recordPageSize);

    const { items: rows, totalCount } = paginatedResponse;

    // Calculate total ranges (total records / construction types)
    const totalRanges = Math.ceil(totalCount / constructionTypeCount);
    const totalPages = Math.ceil(totalRanges / rangePageSize) || 1;

    // Clamp pageNumber to valid range (fix for delete-induced page overflow)
    const clampedPageNumber = Math.min(pageNumber, totalPages);
    
    // If we clamped the page number, refetch with correct page
    let finalRows = rows;
    let finalTotalCount = totalCount;
    
    if (clampedPageNumber !== pageNumber && clampedPageNumber > 0) {
      const clampedResponse = await getDepreciationPaged(clampedPageNumber, recordPageSize);
      finalRows = clampedResponse.items;
      finalTotalCount = clampedResponse.totalCount;
    }

    // Count unique ranges in current page
    const uniqueRanges = new Set<string>();
    (finalRows || []).forEach(row => {
      uniqueRanges.add(`${row.minYear}-${row.maxYear}`);
    });

    return {
      success: true,
      data: {
        rows: finalRows || [],
        constructionTypes,
        pageNumber: clampedPageNumber || 1,
        pageSize: rangePageSize, // Return range page size (what user selected)
        totalRanges,
        totalPages,
        totalRecords: finalTotalCount || 0,
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
 * @deprecated Use fetchRangesPagedServerAction for better performance
 * This function fetches all records which is inefficient for large datasets
 */
export async function getDepreciationScreenAction(): Promise<
  ActionResult<{
    constructionTypes: DepreciationConstructionType[];
    rows: DepreciationRow[];
  }>
> {
  console.warn('getDepreciationScreenAction is deprecated - use fetchRangesPagedServerAction instead');
  try {
    // This is inefficient - fetches all records
    const [constructionTypes, allRowsResponse] = await Promise.all([
      getConstructionTypes(),
      getDepreciationPaged(1, 1000), // Limit to first 1000 records as fallback
    ]);

    return {
      success: true,
      data: { constructionTypes, rows: allRowsResponse.items || [] },
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
 * Efficient Global Sync Action - uses only current page records
 * This handles the "Dirty Tracking" update with proper server-side pagination.
 * Only updates the records that were changed in the UI grid from current page.
 * @param locale - Current locale for revalidation 
 * @param currentPageRecords - Records currently loaded in the UI (from current page)
 * @param changes - Object mapping id to new rate value
 */
export async function syncDepreciationRatesAction(
  locale: string,
  currentPageRecords: DepreciationRow[],
  changes: Record<number, number>
): Promise<ActionResult> {
  try {
    if (!changes || Object.keys(changes).length === 0) return { success: true };

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    await syncDepreciationRatesFromPage(currentPageRecords, changes, userId.toString());

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
 * Server-side validation will reject overlapping ranges.
 */
export async function addRangeAction(
  locale: string,
  payload: { minYear: number; maxYear: number; defaultRate?: number }
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    await addDepreciationRangeBulk(payload, userId.toString());

    revalidatePath(getPagePath(locale));

    return { success: true };
  } catch (error: unknown) {
    console.error('[addRangeAction] Error:', error);
    
    // Extract meaningful error message for overlap or other validation errors
    let errorMessage = 'Add range failed';
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('overlap') || 
          error.message.toLowerCase().includes('duplicate') ||
          error.message.toLowerCase().includes('conflict')) {
        errorMessage = 'Range overlaps with existing range. Please choose different years.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
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
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    await deleteDepreciationRange(payload, userId.toString());

    revalidatePath(getPagePath(locale));

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}
