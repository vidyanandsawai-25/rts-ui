import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import type { ClassicReportDefinition } from '@/lib/report-designer/classic-adapter';
import { mergeFieldCatalogs } from '@/lib/report-designer/provider-schema';
import { resolveProviderSchema } from '@/lib/report-designer/provider-schema.server';
import { apiClient } from '@/services/api.service';
import type { DesignerFieldCatalogEntry, DesignerReportSettings } from '@/types/report-designer.types';

export const dynamic = 'force-dynamic';

async function getLocalReportDefinition(reportId: string): Promise<ClassicReportDefinition | null> {
  const clean = reportId.trim();
  if (!/^[A-Za-z][A-Za-z0-9_]{2,99}$/.test(clean)) return null;
  const candidateNames = Array.from(new Set([
    clean,
    clean.replace(/Report$/i, ''),
    clean.endsWith('Report') ? clean : `${clean}Report`,
    clean.replace(/_/g, ''),
    clean.replace(/_/g, '') + 'Report',
    clean.replace(/([a-z])([A-Z])/g, '$1_$2'),
    ...(clean.includes('119') ? ['Notice_119_final1_Main_Sagar_1', 'Notice119', 'notice119'] : []),
  ]));

  for (const name of candidateNames) {
    const candidates = [
      path.join(process.cwd(), 'public', 'reports', name, 'definition.json'),
      path.join(process.cwd(), 'public', 'reports', name, 'default_definition.json'),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        try {
          const raw = await readFile(candidate, 'utf8');
          return JSON.parse(raw) as ClassicReportDefinition;
        } catch {}
      }
    }
  }
  return null;
}

export const ESSENTIAL_REPORT_FIELDS: DesignerFieldCatalogEntry[] = [
  { name: 'propertyTax', label: 'मालमत्ता कर रु. (Property Tax)', type: 'number', elementType: 'field', group: 'कर व मूल्यांकन सारांश' },
  { name: 'PropertyTax', label: 'मालमत्ता कर रु. (Property Tax)', type: 'number', elementType: 'field', group: 'कर व मूल्यांकन सारांश' },
  { name: 'newRent', label: 'नवीन भाडे / वार्षिक भाडे मूल्य (New Rent)', type: 'number', elementType: 'field', group: 'कर व मूल्यांकन सारांश' },
  { name: 'NewRent', label: 'नवीन भाडे / वार्षिक भाडे मूल्य (New Rent)', type: 'number', elementType: 'field', group: 'कर व मूल्यांकन सारांश' },
  { name: 'new_rent', label: 'नवीन भाडे / वार्षिक भाडे मूल्य (New Rent)', type: 'number', elementType: 'field', group: 'कर व मूल्यांकन सारांश' },
  { name: 'newToiletNo', label: 'नवीन संडास संख्या (New Toilet No)', type: 'number', elementType: 'field', group: 'मालमत्ता तपशील' },
  { name: 'NewToiletNo', label: 'नवीन संडास संख्या (New Toilet No)', type: 'number', elementType: 'field', group: 'मालमत्ता तपशील' },
  { name: 'new_toilet_no', label: 'नवीन संडास संख्या (New Toilet No)', type: 'number', elementType: 'field', group: 'मालमत्ता तपशील' },
  { name: 'commToiletNo', label: 'व्यावसायिक संडास संख्या (Comm. Toilet No)', type: 'number', elementType: 'field', group: 'मालमत्ता तपशील' },
  { name: 'CommToiletNo', label: 'व्यावसायिक संडास संख्या (Comm. Toilet No)', type: 'number', elementType: 'field', group: 'मालमत्ता तपशील' },
  { name: 'commtoiletNo', label: 'व्यावसायिक संडास संख्या (Comm. Toilet No)', type: 'number', elementType: 'field', group: 'मालमत्ता तपशील' },
  { name: 'commtoilet_no', label: 'व्यावसायिक संडास संख्या (Comm. Toilet No)', type: 'number', elementType: 'field', group: 'मालमत्ता तपशील' },
  { name: 'oldToiletNo', label: 'जुनी संडास संख्या (Old Toilet No)', type: 'number', elementType: 'field', group: 'जुनी मालमत्ता माहिती' },
  { name: 'oldRent', label: 'जुने भाडे (Old Rent)', type: 'number', elementType: 'field', group: 'जुनी मालमत्ता माहिती' },
  { name: 'oldALV', label: 'जुने वार्षिक भाडे मूल्य (Old ALV)', type: 'number', elementType: 'field', group: 'जुनी मालमत्ता माहिती' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('reportId') || '';
  const dataProviderParam = searchParams.get('dataProvider') || '';
  const dataSourceParam = searchParams.get('dataSource') || '';

  // 1. Resolve target provider code or query token
  let targetProvider = dataProviderParam || dataSourceParam;

  if (!targetProvider && reportId) {
    try {
      const settingsResult = await apiClient.get<DesignerReportSettings>(
        `/designer-report-templates/${encodeURIComponent(reportId)}/settings`
      );
      if (settingsResult.success && settingsResult.data?.dataProviderCode) {
        targetProvider = settingsResult.data.dataProviderCode;
      }
    } catch {}
  }

  let localCatalog: DesignerFieldCatalogEntry[] = [];
  if (reportId) {
    const localDef = await getLocalReportDefinition(reportId);
    if (localDef?.fieldCatalog?.length) {
      localCatalog = localDef.fieldCatalog;
    }
  }

  // 2. Query backend dynamic schema endpoint
  try {
    const resolved = await resolveProviderSchema(
      targetProvider || reportId,
      dataSourceParam,
    );
    const columns = mergeFieldCatalogs(resolved.fields, localCatalog, ESSENTIAL_REPORT_FIELDS);
    if (columns.length > 0) {
      return NextResponse.json({
        columns,
        dataProviderCode: resolved.dataProviderCode || 'KarakarniDataProvider',
        dataSourceCode: resolved.dataSourceCode || 'KarakarniDataProvider',
        matched: true,
      });
    }
  } catch (err) {
    console.warn('Failed to resolve dynamic report schema:', err);
  }

  if (localCatalog.length > 0) {
    const columns = mergeFieldCatalogs(localCatalog, ESSENTIAL_REPORT_FIELDS);
    return NextResponse.json({
      columns,
      dataProviderCode: targetProvider,
      dataSourceCode: dataSourceParam || targetProvider,
      matched: false,
    });
  }

  return NextResponse.json({
    columns: localCatalog,
    dataProviderCode: targetProvider,
    dataSourceCode: dataSourceParam || targetProvider,
    matched: false,
  });
}
