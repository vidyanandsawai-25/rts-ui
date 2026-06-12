import 'server-only';
import { apiClient } from '@/services/api.service';
import { getTranslations } from 'next-intl/server';
import { ApiError } from '@/lib/utils/api';
import {
  AddTaxesInit,
  AuditJobDetail,
  AuditJobRow,
  EligibleCountRequest,
  EligibleCountResult,
  JobStatusResult,
  PreviewResult,
  PropertySearchResult,
  RuntimePropertyRow,
  ScopeOption,
  WardScopeOption,
} from '@/types/add-taxes.types';
import { PagedResponse } from '@/types/common.types';
import {
  isAuditJobRowShape,
  isPropertyNoShape,
  isPropertySearchShape,
  isPropertyTypeGroupShape,
  isWardShape,
  isZoneShape,
  normalizeAuditJobRow,
  normalizePropertyNoToOption,
  normalizePropertySearchResult,
  normalizePropertyTypeGroupToOption,
  normalizeWardToOption,
  normalizeZoneToOption,
} from './add-taxes-types-guard';

async function getZoneScopeOptionsServer(): Promise<ScopeOption[]> {
  const response = await apiClient.get<{ items: unknown[] }>('/Zone?PageNumber=1&PageSize=500');
  if (!response.success || !response.data) return [];
  const data = response.data as unknown as Record<string, unknown>;
  const items = Array.isArray(data.items) ? (data.items as unknown[]) : [];
  return items.filter(isZoneShape).map(normalizeZoneToOption);
}

async function getWardScopeOptionsServer(): Promise<WardScopeOption[]> {
  const response = await apiClient.get<{ items: unknown[] }>('/Ward?PageNumber=1&PageSize=1000');
  if (!response.success || !response.data) return [];
  const data = response.data as unknown as Record<string, unknown>;
  const items = Array.isArray(data.items) ? (data.items as unknown[]) : [];
  return items.filter(isWardShape).map(normalizeWardToOption);
}

async function getPropertyTypeScopeOptionsServer(): Promise<ScopeOption[]> {
  const response = await apiClient.get<{ items: unknown[] }>('/TypeOfUseGroup?PageNumber=1&PageSize=500');
  if (!response.success || !response.data) return [];
  const data = response.data as unknown as Record<string, unknown>;
  const items = Array.isArray(data.items) ? (data.items as unknown[]) : [];
  return items.filter(isPropertyTypeGroupShape).map(normalizePropertyTypeGroupToOption);
}

export async function getAddTaxesInitServer(): Promise<AddTaxesInit> {
  const [initResponse, zones, propertyTypes, wards] = await Promise.all([
    apiClient.get<AddTaxesInit>('/property-tax/operations/init'),
    getZoneScopeOptionsServer(),
    getPropertyTypeScopeOptionsServer(),
    getWardScopeOptionsServer(),
  ]);
  if (!initResponse.success || !initResponse.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      initResponse.statusCode ?? 500,
      initResponse.error ?? t('messages.errorInit'),
      'getAddTaxesInitServer',
    );
  }
  return { ...initResponse.data, scopeMaster: { zones, propertyTypes, wards } };
}

export async function getPropertyNosByWardServer(wardId: number): Promise<ScopeOption[]> {
  const response = await apiClient.get<Record<string, unknown>>(
    `/Property/search?WardId=${wardId}&PageNumber=1&PageSize=1000`,
  );
  if (!response.success || !response.data) return [];
  const body = response.data as Record<string, unknown>;
  const pagedResult = body.items as Record<string, unknown> | null | undefined;
  if (!pagedResult || typeof pagedResult !== 'object') return [];
  const items = Array.isArray(pagedResult.items) ? (pagedResult.items as unknown[]) : [];
  return items.filter(isPropertyNoShape).map(normalizePropertyNoToOption);
}

export async function searchPropertiesByTextServer(searchTerm: string): Promise<PropertySearchResult[]> {
  const params = new URLSearchParams();
  params.append('SearchTerm', searchTerm.trim());
  params.append('PageNumber', '1');
  params.append('PageSize', '20');
  const response = await apiClient.get<Record<string, unknown>>(
    `/Property/search?${params.toString()}`,
  );
  if (!response.success || !response.data) return [];
  const body = response.data as Record<string, unknown>;
  const pagedResult = body.items as Record<string, unknown> | null | undefined;
  if (!pagedResult || typeof pagedResult !== 'object') return [];
  const items = Array.isArray(pagedResult.items) ? (pagedResult.items as unknown[]) : [];
  return items.filter(isPropertySearchShape).map(normalizePropertySearchResult);
}

export async function getEligibleCountServer(request: EligibleCountRequest): Promise<EligibleCountResult> {
  const response = await apiClient.post<EligibleCountResult>(
    '/property-tax/operations/eligible-count',
    request,
  );
  if (!response.success || !response.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? t('messages.fetchFailed'),
      'getEligibleCountServer',
    );
  }
  return response.data;
}

export async function getPreviewServer(request: EligibleCountRequest): Promise<PreviewResult> {
  const response = await apiClient.post<PreviewResult>(
    '/property-tax/operations/preview',
    request,
  );
  if (!response.success || !response.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? t('messages.fetchFailed'),
      'getPreviewServer',
    );
  }
  return response.data;
}

export async function getJobStatusServer(jobId: string): Promise<JobStatusResult> {
  const response = await apiClient.get<JobStatusResult>(
    `/property-tax/operations/jobs/${encodeURIComponent(jobId)}/status`,
  );
  if (!response.success || !response.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? t('messages.fetchFailed'),
      'getJobStatusServer',
    );
  }
  return response.data;
}

export async function getJobPropertiesServer(jobId: string): Promise<RuntimePropertyRow[]> {
  const response = await apiClient.get<RuntimePropertyRow[]>(
    `/property-tax/operations/jobs/${encodeURIComponent(jobId)}/properties`,
  );
  if (!response.success || !response.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? t('messages.fetchFailed'),
      'getJobPropertiesServer',
    );
  }
  return Array.isArray(response.data) ? response.data : [];
}

export async function getAuditListServer(
  pageNumber: number,
  pageSize: number,
  operation?: string,
  status?: string,
): Promise<PagedResponse<AuditJobRow>> {
  const params = new URLSearchParams();
  params.append('PageNumber', String(pageNumber));
  params.append('PageSize', String(pageSize));
  if (operation?.trim()) params.append('Operation', operation.trim());
  if (status?.trim()) params.append('Status', status.trim());

  const response = await apiClient.get<PagedResponse<AuditJobRow>>(
    `/property-tax/operations/audit?${params.toString()}`,
  );
  if (!response.success || !response.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? t('messages.fetchFailed'),
      'getAuditListServer',
    );
  }
  const data = response.data as unknown as Record<string, unknown>;
  const rawItems = Array.isArray(data.items) ? (data.items as unknown[]) : [];
  return {
    ...(response.data as PagedResponse<AuditJobRow>),
    items: rawItems.filter(isAuditJobRowShape).map(normalizeAuditJobRow),
  };
}

export async function getAuditDetailServer(jobId: string): Promise<AuditJobDetail> {
  const response = await apiClient.get<AuditJobDetail>(
    `/property-tax/operations/audit/${encodeURIComponent(jobId)}`,
  );
  if (!response.success || !response.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? t('messages.fetchFailed'),
      'getAuditDetailServer',
    );
  }
  return response.data;
}
