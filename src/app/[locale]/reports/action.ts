'use server';

import { getReportDefinitions, getReportParameters, getZones, getWardsByZone, getPropertiesByWard, getReportLookup } from '@/lib/api/report.service';
import type { ReportDefinition, ReportParameterDefinition, ZoneSummary, WardSummary, PropertySummary, LookupOption } from '@/types/report.types';

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
    console.error(`[getReportParametersAction] id=${reportDefinitionId}:`, message);
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

/** Generic option source for any 'select' parameter — dispatched by lookup key on the backend. */
export async function getReportLookupAction(key: string, parentValue?: string): Promise<LookupOption[]> {
  try {
    return await getReportLookup(key, parentValue);
  } catch {
    return [];
  }
}
