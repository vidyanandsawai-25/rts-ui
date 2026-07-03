import 'server-only';
import { apiClient } from '@/services/api.service';
import type { ReportDefinition, ReportParameterDefinition, ZoneSummary, WardSummary, PropertySummary, LookupOption } from '@/types/report.types';
import type { PagedResponse } from '@/types/common.types';

/**
 * Generic option source for a 'select' report parameter. `key` is the parameter's OptionsSource;
 * `parentValue` is the selected value of its CascadeFromKey parameter (for cascading dropdowns).
 * The backend dispatches to the matching IReportLookupProvider — no per-dropdown code here.
 */
export async function getReportLookup(key: string, parentValue?: string): Promise<LookupOption[]> {
  const qs = parentValue ? `?parentValue=${encodeURIComponent(parentValue)}` : '';
  const result = await apiClient.get<LookupOption[]>(`/ReportLookup/${encodeURIComponent(key)}${qs}`);
  if (!result.success || !result.data) return [];
  return result.data;
}

function normalizeReportDefinition(raw: Record<string, unknown>): ReportDefinition {
  return {
    id: Number(raw.id ?? raw.Id ?? raw.reportDefinitionId ?? raw.ReportDefinitionId ?? 0),
    reportCode: String(raw.reportCode ?? raw.ReportCode ?? raw.code ?? raw.Code ?? ''),
    reportName: String(raw.reportName ?? raw.ReportName ?? raw.name ?? raw.Name ?? ''),
    category: String(raw.category ?? raw.Category ?? ''),
    description: String(raw.description ?? raw.Description ?? ''),
    templateFile: String(raw.templateFile ?? raw.TemplateFile ?? ''),
    dataProviderCode: String(raw.dataProviderCode ?? raw.DataProviderCode ?? ''),
    isActive: Boolean(raw.isActive ?? raw.IsActive ?? true),
    sortOrder: Number(raw.sortOrder ?? raw.SortOrder ?? 0),
  };
}

export async function getReportDefinitions(): Promise<ReportDefinition[]> {
  const result = await apiClient.get<PagedResponse<Record<string, unknown>>>(
    '/Report?PageSize=-1&IsActive=true'
  );
  if (!result.success || !result.data) return [];
  return (result.data.items ?? []).map(normalizeReportDefinition);
}

export async function getReportParameters(reportDefinitionId: number): Promise<ReportParameterDefinition[]> {
  const result = await apiClient.get<PagedResponse<ReportParameterDefinition>>(
    `/ReportParameterDefinition?ReportDefinitionId=${encodeURIComponent(String(reportDefinitionId))}&IsActive=true&PageSize=-1`
  );
  if (!result.success || !result.data) {
    throw new Error(
      `[${result.statusCode ?? 0}] ${result.error ?? 'Failed to fetch report parameters'}`
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
