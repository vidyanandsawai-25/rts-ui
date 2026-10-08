'use server';

import { revalidatePath } from 'next/cache';
import { revalidateModulePaths } from '@/lib/server/revalidation-helper';
import { getTranslations } from 'next-intl/server';
import {
  getTariffChargeDetailsPaged,
  getTariffChargeDetailById,
  createTariffChargeDetail,
  updateTariffChargeDetail,
  deleteTariffChargeDetail,
  type TariffChargePagedResponse,
} from '@/lib/api/water-bill/tariff-workbench/tariffChargeDetail.service';
import { getTariffWorkbenchesPaged } from '@/lib/api/water-bill/tariff-workbench/tariffWorkbench.service';
import { getChargeHeadsPaged } from '@/lib/api/water-bill/chargeHeads.service';
import { getGeographyUnitPaged } from '@/lib/api/water-bill/geographyunitmaster/geography-unit-crud.service';
import { logger } from '@/lib/utils/server-logger';
import { verifyServerActionAccess } from '@/lib/utils/server-access-guard';
import type { TariffChargeData } from '@/types/water-bill/tariff-workbench/tariffWorkbench.types';

const CHARGE_DETAILS_PATH = '/[locale]/water-bill/tariff-workbench/charge-details';
const PARENT_WORKBENCH_PATH = '/[locale]/water-bill/tariff-workbench';

export type { TariffChargeData, TariffChargePagedResponse };

export interface TariffChargeLookupOption {
  value: string;
  label: string;
}

type SearchParamsInput = Record<string, string | string[] | undefined> | undefined;

export async function parseChargeDetailsSearchParams(sParams: SearchParamsInput) {
  const pageNumber = Math.max(1, Number(sParams?.pageNumber) || 1);
  const pageSize = Math.max(1, Number(sParams?.pageSize) || 10);
  const searchTerm = typeof sParams?.searchTerm === 'string' ? sParams.searchTerm : undefined;
  const sortBy = typeof sParams?.sortBy === 'string' ? sParams.sortBy : undefined;
  const sortOrder: 'asc' | 'desc' | undefined =
    sParams?.sortOrder === 'desc' || sParams?.sortOrder === 'asc'
      ? sParams.sortOrder
      : undefined;

  return { pageNumber, pageSize, searchTerm, sortBy, sortOrder };
}

export async function getTariffChargeDetailsTableData(sParams?: SearchParamsInput): Promise<{
  pagedData: TariffChargePagedResponse;
  pageParams: {
    pageNumber: number;
    pageSize: number;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}> {
  const pageParams = await parseChargeDetailsSearchParams(sParams);

  try {
    const response = await getTariffChargeDetailsPaged({
      pageNumber: pageParams.pageNumber,
      pageSize: pageParams.pageSize,
      searchTerm: pageParams.searchTerm,
      sortBy: pageParams.sortBy,
      sortOrder: pageParams.sortOrder,
    });
    if (response.success && response.data) {
      return { pagedData: response.data, pageParams };
    }
  } catch (error) {
    logger.error('Failed to fetch tariff charge details', {}, error);
  }

  return {
    pagedData: {
      items: [],
      totalCount: 0,
      pageNumber: pageParams.pageNumber,
      pageSize: pageParams.pageSize,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    pageParams,
  };
}

export async function fetchTariffChargeDetailByIdAction(id: number): Promise<TariffChargeData | null> {
  try {
    const response = await getTariffChargeDetailById(id);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    logger.error('Failed to fetch tariff charge detail by id', { id }, error);
    return null;
  }
}

/** Fetches Tariff Name choices for the server-rendered charge-detail form page. */
export async function fetchTariffChargeTariffOptionsAction(): Promise<TariffChargeLookupOption[]> {
  try {
    const response = await getTariffWorkbenchesPaged({ pageNumber: 1, pageSize: 2000 });
    if (!response.success || !response.data) return [];
    return response.data.items.map((tariff) => ({
      value: String(tariff.id),
      label: tariff.tariffName || tariff.tariffCode || String(tariff.id),
    }));
  } catch (error) {
    logger.error('Failed to fetch charge-detail tariff options', {}, error);
    return [];
  }
}

/** Fetches Charge Head choices for the server-rendered charge-detail form page. */
export async function fetchTariffChargeHeadOptionsAction(): Promise<TariffChargeLookupOption[]> {
  try {
    const response = await getChargeHeadsPaged({ pageNumber: 1, pageSize: 2000 });
    if (!response.success || !response.data) return [];
    return response.data.items.map((chargeHead) => ({
      value: String(chargeHead.id),
      label: chargeHead.name || chargeHead.code || String(chargeHead.id),
    }));
  } catch (error) {
    logger.error('Failed to fetch charge-detail charge-head options', {}, error);
    return [];
  }
}

/** Fetches Geography Unit choices for the server-rendered charge-detail form page. */
export async function fetchTariffChargeGeographyUnitOptionsAction(): Promise<TariffChargeLookupOption[]> {
  try {
    const response = await getGeographyUnitPaged(1, 2000);
    return response.items.map((unit) => ({
      value: String(unit.id),
      label: unit.geographyUnitName || unit.geographyUnitCode || String(unit.id),
    }));
  } catch (error) {
    logger.error('Failed to fetch charge-detail geography-unit options', {}, error);
    return [];
  }
}

export async function createTariffChargeDetailAction(
  data: Partial<TariffChargeData>
): Promise<{ success: boolean; message?: string; data?: TariffChargeData }> {
  const t = await getTranslations('tariffWorkbench');
  const hasAccess = await verifyServerActionAccess('WATERBILL.TARIFFMASTER', 'edit');
  if (!hasAccess) return { success: false, message: t('errors.forbidden') };

  try {
    const response = await createTariffChargeDetail(data);
    if (response.success && response.data) {
      revalidateModulePaths(CHARGE_DETAILS_PATH);
      revalidatePath(PARENT_WORKBENCH_PATH, 'page');
      return { success: true, message: t('messages.createSuccess'), data: response.data };
    }
    return { success: false, message: response.error || t('errors.createFailed') };
  } catch (err: unknown) {
    logger.error('Error in createTariffChargeDetailAction', {}, err);
    return { success: false, message: t('errors.createFailed') };
  }
}

export async function updateTariffChargeDetailAction(
  id: number,
  data: Partial<TariffChargeData>
): Promise<{ success: boolean; message?: string; data?: TariffChargeData }> {
  const t = await getTranslations('tariffWorkbench');
  const hasAccess = await verifyServerActionAccess('WATERBILL.TARIFFMASTER', 'edit');
  if (!hasAccess) return { success: false, message: t('errors.forbidden') };

  try {
    const response = await updateTariffChargeDetail(id, data);
    if (response.success && response.data) {
      revalidateModulePaths(CHARGE_DETAILS_PATH);
      revalidatePath(PARENT_WORKBENCH_PATH, 'page');
      return { success: true, message: t('messages.updateSuccess'), data: response.data };
    }
    return { success: false, message: response.error || t('errors.updateFailed') };
  } catch (err: unknown) {
    logger.error('Error in updateTariffChargeDetailAction', { id }, err);
    return { success: false, message: t('errors.updateFailed') };
  }
}

export async function deleteTariffChargeDetailAction(
  id: number
): Promise<{ success: boolean; message?: string }> {
  const t = await getTranslations('tariffWorkbench');
  const hasAccess = await verifyServerActionAccess('WATERBILL.TARIFFMASTER', 'delete');
  if (!hasAccess) return { success: false, message: t('errors.noDeleteAction') };

  try {
    const response = await deleteTariffChargeDetail(id);
    if (response.success) {
      revalidateModulePaths(CHARGE_DETAILS_PATH);
      revalidatePath(PARENT_WORKBENCH_PATH, 'page');
      return { success: true, message: t('messages.deleteSuccess') };
    }
    return { success: false, message: response.error || t('errors.deleteFailed') };
  } catch (err: unknown) {
    logger.error('Error in deleteTariffChargeDetailAction', { id }, err);
    return { success: false, message: t('errors.deleteFailed') };
  }
}
