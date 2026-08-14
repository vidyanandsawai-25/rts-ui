'use server';

import { getReportDefinitions, getReportParameters, getZones, getWardsByZone, getPropertiesByWard } from '@/lib/api/report.service';
import { getFinancialYearsPaged } from '@/lib/api/financial-year.service';
import { getPropertyTypes } from '@/lib/api/property-type-crud.service';
import { apiClient } from '@/services/api.service';
import type { ReportDefinition, ReportParameterDefinition, ZoneSummary, WardSummary, PropertySummary, ReportJob } from '@/types/report.types';
import type { FinancialYear } from '@/types/financialYear.types';
import type { PropertyType } from '@/types/property-type.types';
import { cookies } from 'next/headers';

export async function getPropertyTypesAction(): Promise<PropertyType[]> {
  try {
    return await getPropertyTypes();
  } catch {
    return [];
  }
}

export async function getAssessmentTypesAction(): Promise<Array<{ id: number; name: string }>> {
  try {
    const res = await apiClient.get<import('@/types/common.types').PagedResponse<Record<string, unknown>>>('/PropertyAssessmentStatus?PageSize=-1&IsActive=true');
    if (res.success && res.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
      return res.data.items.map((item) => ({
        id: Number(item.id ?? 0),
        name: String(item.statusName ?? item.assessmentType ?? item.name ?? item.description ?? item.id),
      }));
    }
  } catch {
    // Fallback
  }

  try {
    const res2 = await apiClient.get<import('@/types/common.types').PagedResponse<Record<string, unknown>>>('/AssessmentTypeMaster?PageSize=-1&IsActive=true');
    if (res2.success && res2.data?.items && Array.isArray(res2.data.items) && res2.data.items.length > 0) {
      return res2.data.items.map((item) => ({
        id: Number(item.id ?? 0),
        name: String(item.assessmentType ?? item.name ?? item.statusName ?? item.description ?? item.id),
      }));
    }
  } catch {
    // Fallback
  }

  return [
    { id: 1, name: 'General Assessment (सर्वसाधारण आकारणी)' },
    { id: 2, name: 'Re-Assessment (पुनराकारणी)' },
    { id: 3, name: 'New Assessment (नवीन आकारणी)' },
    { id: 4, name: 'Revision Assessment (सुधारित आकारणी)' },
  ];
}


export async function getReportDefinitionsAction(): Promise<ReportDefinition[]> {
  try {
    return await getReportDefinitions();
  } catch {
    return [];
  }
}

export interface GetReportParametersResult {
  data: ReportParameterDefinition[];
  error: string | null;
}

export async function getReportParametersAction(
  reportDefinitionId: number,
): Promise<GetReportParametersResult> {
  try {
    const data = await getReportParameters(reportDefinitionId);
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { data: [], error: message };
  }
}

export async function getZonesAction(): Promise<ZoneSummary[]> {
  try {
    return await getZones();
  } catch {
    return [];
  }
}

export async function getWardsByZoneAction(zoneId: number): Promise<WardSummary[]> {
  try {
    return await getWardsByZone(zoneId);
  } catch {
    return [];
  }
}

export async function getPropertiesByWardAction(wardId: number): Promise<PropertySummary[]> {
  try {
    return await getPropertiesByWard(wardId);
  } catch {
    return [];
  }
}


/** Fetch all active financial years for the report parameters panel. */
export async function getFinancialYearsAction(): Promise<FinancialYear[]> {
  try {
    const result = await getFinancialYearsPaged(1, 200);
    return result.items.filter((y) => y.isActive);
  } catch {
    return [];
  }
}

/**
 * Resolve a property number string → numeric propertyId.
 * Calls /Property/search with the property number as both From and To,
 * filtered by wardId when provided.
 * Returns the first matching propertyId, or null if not found.
 */
export async function resolvePropertyIdAction(
  propertyNo: string,
  wardId?: number,
): Promise<number | null> {
  const trimmedPropertyNo = propertyNo.trim();
  if (!trimmedPropertyNo) return null;

  const readItems = (data: unknown): Array<Record<string, unknown>> => {
    if (!data || typeof data !== 'object') return [];
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as Array<Record<string, unknown>>;
    if (Array.isArray(record.Items)) return record.Items as Array<Record<string, unknown>>;
    if (Array.isArray(record.data)) return record.data as Array<Record<string, unknown>>;
    if (Array.isArray(record.Data)) return record.Data as Array<Record<string, unknown>>;
    return [];
  };

  const readText = (item: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
      const value = item[key];
      if (value !== undefined && value !== null) return String(value).trim();
    }
    return '';
  };

  const readPropertyId = (item: Record<string, unknown>): number | null => {
    const raw = item.propertyId ?? item.PropertyId ?? item.id ?? item.Id ?? null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  };

  const findMatchingPropertyId = (items: Array<Record<string, unknown>>): number | null => {
    const exactMatch = items.find((item) => {
      const itemPropertyNo = readText(item, 'propertyNo', 'PropertyNo');
      return itemPropertyNo === trimmedPropertyNo;
    });
    return readPropertyId(exactMatch ?? items[0] ?? {});
  };

  const attempts: string[] = [];

  const searchParams = new URLSearchParams();
  searchParams.set('PropertyNoFrom', trimmedPropertyNo);
  searchParams.set('PropertyNoTo', trimmedPropertyNo);
  searchParams.set('PropertyNo', trimmedPropertyNo);
  if (wardId && wardId > 0) searchParams.set('WardId', String(wardId));
  searchParams.set('PageSize', '5');
  attempts.push(`/Property/search?${searchParams.toString()}`);

  const propertyParams = new URLSearchParams();
  propertyParams.set('PropertyNo', trimmedPropertyNo);
  if (wardId && wardId > 0) propertyParams.set('WardId', String(wardId));
  propertyParams.set('PageSize', wardId && wardId > 0 ? '-1' : '5');
  propertyParams.set('PageNumber', '1');
  attempts.push(`/Property?${propertyParams.toString()}`);

  if (wardId && wardId > 0) {
    const wardParams = new URLSearchParams();
    wardParams.set('WardId', String(wardId));
    wardParams.set('PageSize', '-1');
    wardParams.set('PageNumber', '1');
    attempts.push(`/Property?${wardParams.toString()}`);
  }

  for (const endpoint of attempts) {
    try {
      const response = await apiClient.get<unknown>(endpoint);
      if (!response.success || !response.data) continue;
      const propertyId = findMatchingPropertyId(readItems(response.data));
      if (propertyId) return propertyId;
    } catch {
      // Try the next known property lookup shape.
    }
  }

  return null;
}

export interface PropertySummaryItem {
  propertyId: number;
  propertyNo: string;
  partitionNo: string | null;
  ownerName: string;
}

/**
 * Find all properties matching a property number (to list multiple partitions).
 */
export async function resolvePropertiesAction(
  propertyNo: string,
  wardId?: number,
): Promise<PropertySummaryItem[]> {
  const trimmedPropertyNo = propertyNo.trim();
  if (!trimmedPropertyNo) return [];

  const readItems = (data: unknown): Array<Record<string, unknown>> => {
    if (!data || typeof data !== 'object') return [];
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as Array<Record<string, unknown>>;
    if (Array.isArray(record.Items)) return record.Items as Array<Record<string, unknown>>;
    if (Array.isArray(record.data)) return record.data as Array<Record<string, unknown>>;
    if (Array.isArray(record.Data)) return record.Data as Array<Record<string, unknown>>;
    return [];
  };

  const readText = (item: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
      const value = item[key];
      if (value !== undefined && value !== null) return String(value).trim();
    }
    return '';
  };

  const readPropertyId = (item: Record<string, unknown>): number | null => {
    const raw = item.propertyId ?? item.PropertyId ?? item.id ?? item.Id ?? null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  };

  const attempts: string[] = [];

  const searchParams = new URLSearchParams();
  searchParams.set('PropertyNoFrom', trimmedPropertyNo);
  searchParams.set('PropertyNoTo', trimmedPropertyNo);
  searchParams.set('PropertyNo', trimmedPropertyNo);
  if (wardId && wardId > 0) searchParams.set('WardId', String(wardId));
  searchParams.set('PageSize', '20'); // Get up to 20 partitions
  attempts.push(`/Property/search?${searchParams.toString()}`);

  const propertyParams = new URLSearchParams();
  propertyParams.set('PropertyNo', trimmedPropertyNo);
  if (wardId && wardId > 0) propertyParams.set('WardId', String(wardId));
  propertyParams.set('PageSize', '-1');
  propertyParams.set('PageNumber', '1');
  attempts.push(`/Property?${propertyParams.toString()}`);

  for (const endpoint of attempts) {
    try {
      const response = await apiClient.get<unknown>(endpoint);
      if (!response.success || !response.data) continue;
      const rawItems = readItems(response.data);
      
      const matchingRaw = rawItems.filter((item) => {
        const itemPropertyNo = readText(item, 'propertyNo', 'PropertyNo');
        return itemPropertyNo === trimmedPropertyNo;
      });

      if (matchingRaw.length > 0) {
        const mapped = matchingRaw.map((item) => {
          const propertyId = readPropertyId(item);
          const partitionNo = readText(item, 'partitionNo', 'PartitionNo') || null;
          const ownerName = readText(item, 'propertyHolderName', 'PropertyHolderName', 'ownerName', 'OwnerName') || 'N/A';
          return {
            propertyId: propertyId ?? 0,
            propertyNo: trimmedPropertyNo,
            partitionNo,
            ownerName,
          };
        }).filter(item => item.propertyId > 0);

        if (mapped.length > 0) {
          return mapped;
        }
      }
    } catch {
      // Try next shape
    }
  }

  return [];
}

export async function fetchReportJobs(take = 25): Promise<ReportJob[]> {
  try {
    const result = await apiClient.get<ReportJob[]>(`/Report/requests?take=${encodeURIComponent(String(take))}`);
    if (!result.success || !result.data || !Array.isArray(result.data)) return [];
    return result.data;
  } catch {
    return [];
  }
}

export async function createReportRequestAction(
  reportCode: string,
  parameters: Record<string, string>,
): Promise<{ success: boolean; data?: { reportRequestId: string; status: string }; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    const enrichedParameters: Record<string, string> = {
      ...parameters,
      ...(userId ? { userId: userId } : {}),
    };

    // Remove empty parameters so SSRS treats them as NULL and bypasses strict filters
    Object.keys(enrichedParameters).forEach(key => {
      if (enrichedParameters[key] === '') {
        delete enrichedParameters[key];
      }
    });



    const result = await apiClient.post<{ reportRequestId: string; status: string }>('/Report/request', {
      reportCode,
      parameters: enrichedParameters,
    });

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Failed to queue report' };
    }

    return { success: true, data: result.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}


