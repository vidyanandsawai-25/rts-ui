import 'server-only';
import { apiClient } from '@/services/api.service';
import type {
  ReportDefinition,
  ReportParameterDefinition,
  ZoneSummary,
  WardSummary,
  PropertySummary,
  LookupOption,
  ReportModule,
} from '@/types/report.types';
import type { PagedResponse } from '@/types/common.types';
import { ApiError } from '@/lib/utils/api';
/**
 * Generic option source for a 'select' report parameter. `key` is the parameter's OptionsSource;
 * `parentValue` is the selected value of its CascadeFromKey parameter (for cascading dropdowns).
 * The backend dispatches to the matching IReportLookupProvider — no per-dropdown code here.
 */
export async function getReportLookup(key: string, parentValue?: string): Promise<LookupOption[]> {
  const qs = parentValue ? `?parentValue=${encodeURIComponent(parentValue)}` : '';
  const result = await apiClient.get<LookupOption[]>(
    `/ReportLookup/${encodeURIComponent(key)}${qs}`
  );
  if (!result.success || !result.data) return [];
  return result.data;
}

function normalizeReportDefinition(raw: Record<string, unknown>): ReportDefinition {
  return {
    id: Number(raw.id ?? 0),
    reportCode: String(raw.reportCode),
    reportName: String(raw.reportName),
    category: String(raw.category),
    description: String(raw.description),
    templateFile: String(raw.templateFile),
    dataProviderCode: String(raw.dataProviderCode),
    isActive: Boolean(raw.isActive),
    sortOrder: Number(raw.sortOrder),
    moduleId: raw.moduleId != null ? Number(raw.moduleId) : null,
  };
}

export async function getReportDefinitions(): Promise<ReportDefinition[]> {
  const result = await apiClient.get<PagedResponse<Record<string, unknown>>>(
    '/Report?PageSize=-1&IsActive=true'
  );
  if (!result.success || !result.data) return [];
  return (result.data.items ?? []).map(normalizeReportDefinition);
}

export async function getReportModules(): Promise<ReportModule[]> {
  const result = await apiClient.get<PagedResponse<Record<string, unknown>>>('/ReportModules');
  if (!result.success || !result.data) return [];
  return (result.data.items ?? []).map((m) => ({
    id: Number(m.id),
    name: String(m.name),
    logoContentType: m.logoContentType != null ? String(m.logoContentType) : null,
    logoBase64: m.logoBase64 != null ? String(m.logoBase64) : null,
  }));
}

export async function getReportParameters(
  reportDefinitionId: number
): Promise<ReportParameterDefinition[]> {
  const result = await apiClient.get<PagedResponse<ReportParameterDefinition>>(
    `/ReportParameterDefinition?ReportDefinitionId=${encodeURIComponent(String(reportDefinitionId))}&IsActive=true&PageSize=-1`
  );
  if (!result.success || !result.data) {
    throw new ApiError(
      result.statusCode ?? 500,
      result.error ?? 'Failed to fetch report parameters',
      'getReportParameters'
    );
  }
  const items = result.data.items ?? [];
  return items.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getZones(): Promise<ZoneSummary[]> {
  const result = await apiClient.get<PagedResponse<ZoneSummary>>('/Zone?PageSize=-1');
  if (!result.success || !result.data) return [];
  return result.data.items ?? [];
}

export async function getPropertiesByWard(wardId: number): Promise<PropertySummary[]> {
  const result = await apiClient.get<{ items: Record<string, unknown>[] }>(
    `/Property?WardId=${encodeURIComponent(String(wardId))}&PageSize=-1&PageNumber=1`
  );
  if (!result.success || !result.data) return [];
  return (result.data.items ?? [])
    .filter((p) => p.isActive !== false)
    .map((p) => ({
      propertyId: Number(p.propertyId ?? p.id ?? 0),
      propertyNo: String(p.propertyNo ?? ''),
      partitionNo: String(p.partitionNo ?? ''),
      ownerName: String(p.ownerName ?? p.ownerNameEnglish ?? ''),
    }));
}

export async function getWardsByZone(zoneId: number): Promise<WardSummary[]> {
  const result = await apiClient.get<PagedResponse<WardSummary>>(
    `/Ward?ZoneId=${encodeURIComponent(String(zoneId))}&PageSize=-1`
  );
  if (!result.success || !result.data) return [];
  return result.data.items ?? [];
}
