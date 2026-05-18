'use server';

import type { BankMasterData, BankMasterDto } from '@/types/bank-master.types';
import type { ApiResponse, PagedResponse } from '@/types/common.types';
import { ApiError } from '@/lib/utils/api';
import {
  getBanksPaged,
  getBankById,
  getBanksSummary,
  createBank,
  updateBank,
  deleteBank,
} from '@/lib/api/configuration-settings/bank/bank-master.services';
import {
  handleActionError,
  validateAndNormalize,
 revalidateBankMaster,
  resolveUserId,
  parseApiError,
} from './actions.utils';
import { buildBankMasterMetadata, type BankMasterMetadata } from './actions.cache';

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Fetches paged bank data with optional search and filtering.
 */
export async function getBanksAction(
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm: string = '',
  state: string = 'all',
  sortBy?: string,
  sortOrder?: string
): Promise<ApiResponse<PagedResponse<BankMasterData>>> {
  try {
    const data = await getBanksPaged(pageNumber, pageSize, searchTerm, state, sortBy, sortOrder);
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError<PagedResponse<BankMasterData>>(error, 'messages.fetchFailed');
  }
}

/**
 * Creates a new bank record.
 */
export async function createBankAction(data: BankMasterDto): Promise<ApiResponse<void>> {
  try {
    const validationResult = validateAndNormalize(data);

    if (!validationResult.isValid) {
      return { success: false, error: `validation.${validationResult.validationCode}` };
    }

    const userId = await resolveUserId();

    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    await createBank(validationResult.normalizedData, userId);

    revalidateBankMaster();

    return { success: true, message: 'messages.createSuccess' };
  } catch (error: unknown) {
    return handleActionError(error, 'messages.createFailed');
  }
}

/**
 * Updates an existing bank record.
 */
export async function updateBankAction(
  id: string,
  data: BankMasterDto
): Promise<ApiResponse<void>> {
  try {
    const validationResult = validateAndNormalize(data);

    if (!validationResult.isValid) {
      return { success: false, error: `validation.${validationResult.validationCode}` };
    }

    const userId = await resolveUserId();

    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    await updateBank(id, validationResult.normalizedData, userId);

    revalidateBankMaster();

    return { success: true, message: 'messages.updateSuccess' };
  } catch (error: unknown) {
    return handleActionError(error, 'messages.updateFailed');
  }
}

/**
 * Deletes a bank record by ID.
 */
export async function deleteBankAction(id: string): Promise<ApiResponse<void>> {
  try {
    await deleteBank(id);

    revalidateBankMaster();

    return { success: true, message: 'messages.deleteSuccess' };
  } catch (error: unknown) {
    return handleActionError(error, 'messages.deleteFailed');
  }
}

/**
 * Fetches all banks (unpaged summary).
 */
export async function getBanksSummaryAction(): Promise<ApiResponse<BankMasterData[]>> {
  try {
    const data = await getBanksSummary();
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError<BankMasterData[]>(error, 'messages.fetchFailed');
  }
}

/**
 * Retrieves metadata (active count, unique states) for the Bank Master module.
 */
export async function getBankMasterMetadata(): Promise<ApiResponse<BankMasterMetadata>> {
  try {
    const summary = await getBanksSummary();
    const data = buildBankMasterMetadata(summary);
    return { success: true, data };
  } catch (error: unknown) {
    const fallback: BankMasterMetadata = { activeCount: 0, uniqueStates: [] };

    if (error instanceof ApiError) {
      return {
        success: false,
        error: parseApiError(error.responseText, 'messages.fetchFailed'),
        statusCode: error.statusCode,
        data: fallback,
      };
    }

    return { success: false, error: 'messages.fetchFailed', data: fallback };
  }
}

/**
 * Fetches a single bank by its ID.
 */
export async function getBankByIdAction(id: string): Promise<ApiResponse<BankMasterData>> {
  try {
    const data = await getBankById(id);
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError<BankMasterData>(error, 'messages.fetchFailed');
  }
}
