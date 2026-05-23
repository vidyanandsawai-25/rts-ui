'use server';

import { ptisService } from '@/lib/api/ptis/tab/ptis.service';
import { createPtisSchemas, propertyIdActionSchema } from '@/lib/validations/ptis.schema';
import { retryWithBackoff } from '@/lib/utils/api';
import { getTranslations } from 'next-intl/server';

async function getPtisValidationSchemas() {
  const t = await getTranslations('ptis');
  return createPtisSchemas((key) => t(key));
}

async function createAction<T>(
  fn: () => Promise<{ success: boolean; data?: T; error?: string | { message?: string } }>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await fn();
    if (result.success) {
      return { success: true, data: result.data };
    }
    const errorMsg =
      typeof result.error === 'string' ? result.error : result.error?.message || 'Action failed';
    return { success: false, error: errorMsg };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getWardListAction() {
  return createAction(async () => {
    // Retry ward list fetch with shorter delays since this is critical data
    return retryWithBackoff(() => ptisService.getWardList(), {
      maxRetries: 2,
      initialDelay: 500,
      maxDelay: 2000,
      backoffMultiplier: 2,
    });
  });
}

export async function fetchWardIdAction(wardNo: string) {
  const { wardNoActionSchema } = await getPtisValidationSchemas();
  const validation = wardNoActionSchema.safeParse({ wardNo });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction<{ wardId: number }>(async () => {
    const result = await ptisService.getWardByNo(wardNo);
    if (result.success && result.data) {
      const rawData = result.data as Record<string, unknown>;
      const rawWardId = rawData.wardId ?? rawData.wardID ?? rawData.id;
      return { success: true, data: { wardId: Number(rawWardId) } };
    }
    return { success: false, error: result.error };
  });
}

export async function getPropertyListByWardAction(wardId: number) {
  const { wardIdActionSchema } = await getPtisValidationSchemas();
  const validation = wardIdActionSchema.safeParse({ wardId });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() => ptisService.getPropertyListByWard(wardId));
}

export async function getPropertySuggestionsAction(
  wardNo?: string,
  wardId?: number,
  searchText?: string
) {
  const { searchSuggestionsSchema } = await getPtisValidationSchemas();
  const validation = searchSuggestionsSchema.safeParse({ wardNo, wardId, searchText });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() => ptisService.getPropertySuggestions(wardNo, wardId, searchText));
}

export async function getWardSuggestionsAction(searchText?: string) {
  return createAction(() => ptisService.getWardSuggestions(searchText));
}

export async function getPartitionSuggestionsAction(
  wardNo?: string,
  wardId?: number,
  propertyNo?: string,
  searchText?: string
) {
  const { searchSuggestionsSchema } = await getPtisValidationSchemas();
  const validation = searchSuggestionsSchema.safeParse({ wardNo, wardId, propertyNo, searchText });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() =>
    ptisService.getPartitionSuggestions(wardNo, wardId, propertyNo, searchText)
  );
}

export async function fetchPropertyDetailsOnlyAction(
  wardNo: string,
  propertyNo: string,
  partitionNo: string,
  wardId?: number,
  propertyId?: number
) {
  const { propertyDetailsSchema } = await getPtisValidationSchemas();
  const validation = propertyDetailsSchema.safeParse({
    wardNo,
    propertyNo,
    partitionNo,
    wardId,
    propertyId,
  });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() =>
    ptisService.fetchPropertyDetailsOnly(wardNo, propertyNo, partitionNo, wardId, propertyId)
  );
}

export async function fetchKycDetailsOnlyAction(propertyId: number) {
  const { wardIdActionSchema } = await getPtisValidationSchemas();
  const validation = wardIdActionSchema.safeParse({ wardId: propertyId });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() => ptisService.getKycDetails(propertyId));
}

export async function fetchSocietyDetailsOnlyAction(propertyId: number) {
  const { wardIdActionSchema } = await getPtisValidationSchemas();
  const validation = wardIdActionSchema.safeParse({ wardId: propertyId });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() => ptisService.getSocietyDetails(String(propertyId)));
}

export async function fetchOldDetailsOnlyAction(propertyId: number) {
  const { wardIdActionSchema } = await getPtisValidationSchemas();
  const validation = wardIdActionSchema.safeParse({ wardId: propertyId });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() => ptisService.getOldDetails(propertyId));
}

export async function fetchOldFloorDetailsAction(propertyId: number) {
  const { wardIdActionSchema } = await getPtisValidationSchemas();
  const validation = wardIdActionSchema.safeParse({ wardId: propertyId });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() => ptisService.getOldFloorDetails(propertyId));
}

export async function fetchOldTaxesDetailsAction(propertyId: number) {
  const { wardIdActionSchema } = await getPtisValidationSchemas();
  const validation = wardIdActionSchema.safeParse({ wardId: propertyId });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  return createAction(() => ptisService.getOldTaxesDetails(propertyId));
}

export async function fetchApartmentQCDetailsAction(propertyId?: number) {
  if (propertyId === undefined) {
    return { success: false, error: 'Property ID is required' };
  }
  const validation = propertyIdActionSchema.safeParse({ propertyId });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }
  return { success: false, error: 'Apartment QC details action is not implemented' };
}
