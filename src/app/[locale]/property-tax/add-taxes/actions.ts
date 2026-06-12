'use server';

import { getTranslations } from 'next-intl/server';
import { ApiError } from '@/lib/utils/api';
import { createLogger } from '@/lib/utils/server-logger';
import {
  AddTaxesInit,
  AuditJobDetail,
  AuditJobRow,
  EligibleCountRequest,
  EligibleCountResult,
  ExecuteRequest,
  ExecuteResult,
  JobStatusResult,
  PropertySearchResult,
  RuntimePropertyRow,
  ScopeOption,
} from '@/types/add-taxes.types';
import { PagedResponse } from '@/types/common.types';
import {
  getAddTaxesInitServer,
  getAuditDetailServer,
  getAuditListServer,
  getEligibleCountServer,
  getJobPropertiesServer,
  getJobStatusServer,
  getPropertyNosByWardServer,
  searchPropertiesByTextServer,
} from '@/lib/api/add-taxes/add-taxes-queries.service';
import { executeOperationServer } from '@/lib/api/add-taxes/add-taxes-mutations.service';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

const logger = createLogger('AddTaxesActions');

export async function getAddTaxesInitAction(): Promise<ActionResult<AddTaxesInit>> {
  try {
    const data = await getAddTaxesInitServer();
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to fetch add-taxes init', {}, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.errorInit'), statusCode: 500 };
  }
}

export async function getEligibleCountAction(
  request: EligibleCountRequest,
): Promise<ActionResult<EligibleCountResult>> {
  try {
    const data = await getEligibleCountServer(request);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get eligible count', {}, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.fetchFailed'), statusCode: 500 };
  }
}

export async function executeOperationAction(
  request: ExecuteRequest,
): Promise<ActionResult<ExecuteResult>> {
  try {
    const data = await executeOperationServer(request);
    return { success: true, data };
  } catch (error) {
    logger.error('Execution failed', { operation: request.operation }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.executeFailed'), statusCode: 500 };
  }
}

export async function getJobStatusAction(
  jobId: string,
): Promise<ActionResult<JobStatusResult>> {
  try {
    const data = await getJobStatusServer(jobId);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get job status', { jobId }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.fetchFailed'), statusCode: 500 };
  }
}

export async function getJobPropertiesAction(
  jobId: string,
): Promise<ActionResult<RuntimePropertyRow[]>> {
  try {
    const data = await getJobPropertiesServer(jobId);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get job properties', { jobId }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.fetchFailed'), statusCode: 500 };
  }
}

export async function getAuditListAction(
  pageNumber: number,
  pageSize: number,
  operation?: string,
  status?: string,
): Promise<ActionResult<PagedResponse<AuditJobRow>>> {
  try {
    const data = await getAuditListServer(pageNumber, pageSize, operation, status);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get audit list', {}, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.fetchFailed'), statusCode: 500 };
  }
}

export async function getBuildingsByWardAction(
  wardId: number,
): Promise<ActionResult<ScopeOption[]>> {
  try {
    const data = await getPropertyNosByWardServer(wardId);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get buildings for ward', { wardId }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.fetchFailed'), statusCode: 500 };
  }
}

export async function searchPropertiesAction(
  searchTerm: string,
): Promise<ActionResult<PropertySearchResult[]>> {
  try {
    const data = await searchPropertiesByTextServer(searchTerm);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to search properties', { searchTerm }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.fetchFailed'), statusCode: 500 };
  }
}

export async function getAuditDetailAction(
  jobId: string,
): Promise<ActionResult<AuditJobDetail>> {
  try {
    const data = await getAuditDetailServer(jobId);
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to get audit detail', { jobId }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations('addTaxes');
    return { success: false, error: t('messages.fetchFailed'), statusCode: 500 };
  }
}
