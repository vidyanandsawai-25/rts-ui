import type { ClassicReportDefinition } from './classic-adapter';
import type {
  DesignerReportSettings,
  DesignerReportSettingsOptions,
} from '@/types/report-designer.types';

export interface DesignerReportListItem {
  id: string;
  reportCode: string;
  name: string;
  category: string;
  dataProviderCode: string;
  tenantScoped: boolean;
  paperSize: string;
  orientation: string;
  templateId: number | null;
  canDelete: boolean;
}

interface DesignerReportListResponse {
  reports?: DesignerReportListItem[];
  error?: string;
}

export interface SaveDesignerReportResponse {
  success: boolean;
  message?: string;
  layoutVersion?: number;
  versionId?: number;
  templateId?: number;
  reportDefinitionId?: number;
  status?: string;
  error?: string;
}

export interface DesignerReportSettingsResponse {
  settings: DesignerReportSettings | null;
  options: DesignerReportSettingsOptions;
}

interface SaveDesignerReportSettingsResponse {
  success: boolean;
  settings: DesignerReportSettings;
}

async function responseJson<T>(response: Response): Promise<T> {
  const value = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(value.error || `Report designer request failed (HTTP ${response.status}).`);
  }
  return value;
}

export async function listDesignerReports(signal?: AbortSignal): Promise<DesignerReportListItem[]> {
  const response = await fetch('/api/reports', { cache: 'no-store', signal });
  const value = await responseJson<DesignerReportListResponse>(response);
  return Array.isArray(value.reports) ? value.reports : [];
}

export async function loadDesignerReport(
  reportId: string,
  signal?: AbortSignal
): Promise<ClassicReportDefinition> {
  const response = await fetch(
    `/api/report-design?reportId=${encodeURIComponent(reportId)}&_t=${Date.now()}`,
    { cache: 'no-store', signal }
  );
  return responseJson<ClassicReportDefinition>(response);
}

export async function saveDesignerReport(
  reportId: string,
  definition: ClassicReportDefinition,
  publish: boolean
): Promise<SaveDesignerReportResponse> {
  const response = await fetch(
    `/api/report-design?reportId=${encodeURIComponent(reportId)}&publish=${publish ? 'true' : 'false'}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(definition),
    }
  );
  return responseJson<SaveDesignerReportResponse>(response);
}

export async function loadDesignerReportSettings(
  reportId: string,
  signal?: AbortSignal
): Promise<DesignerReportSettingsResponse> {
  const response = await fetch(
    `/api/report-settings?reportId=${encodeURIComponent(reportId)}&_t=${Date.now()}`,
    { cache: 'no-store', signal }
  );
  return responseJson<DesignerReportSettingsResponse>(response);
}

export async function updateDesignerReportSettings(
  templateId: number,
  settings: DesignerReportSettings
): Promise<DesignerReportSettings> {
  const response = await fetch('/api/report-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ templateId, settings }),
  });
  const value = await responseJson<SaveDesignerReportSettingsResponse>(response);
  return value.settings;
}
