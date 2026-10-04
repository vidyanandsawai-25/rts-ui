import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  classicToNativeTemplate,
  createBlankClassicReportDefinition,
  nativeTemplateToClassic,
  type ClassicReportDefinition,
} from '@/lib/report-designer/classic-adapter';
import { mergeFieldCatalogs } from '@/lib/report-designer/provider-schema';
import { ESSENTIAL_REPORT_FIELDS } from '../report-columns/route';
import { apiClient } from '@/services/api.service';
import type {
  DesignerTemplate,
  DesignerTemplateDetail,
  DesignerTemplateSummary,
} from '@/types/report-designer.types';

export const dynamic = 'force-dynamic';

function comparableCode(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

function hasPrarupYadiV10Layout(definition: ClassicReportDefinition): boolean {
  return comparableCode(definition.reportCode || definition.reportId || '')
    === comparableCode('Akola_Prarup_Yadi_main_RDG_15_9_2026_Copy')
    && definition.sections?.some((section) => section.id === 'prarup-property-detail-v10') === true
    && definition.elements?.some((elem) => elem.id === 'prarup-header-table') === true;
}

function hasKarakarniV17Layout(definition: ClassicReportDefinition): boolean {
  if (comparableCode(definition.reportCode || definition.reportId || '')
      !== comparableCode('KarakarniReport')
      || (definition.layoutVersion ?? 0) < 17) {
    return false;
  }

  const requiredSections = new Set([
    'assessment_top',
    'property_owner_details',
    'floor_table_rows',
    'assessment_totals',
    'tax_components',
    'property_media',
  ]);
  const sectionIds = new Set((definition.sections ?? []).map((section) => section.id));
  const fieldNames = new Set((definition.elements ?? [])
    .map((element) => element.fieldName)
    .filter((fieldName): fieldName is string => Boolean(fieldName)));

  return [...requiredSections].every((sectionId) => sectionIds.has(sectionId))
    && ['plotOrCsnNo', 'oldBuildingNo', 'oldGeneralTax']
      .every((fieldName) => fieldNames.has(fieldName));
}

async function getTenantTemplate(reportId: string): Promise<DesignerTemplateDetail | null> {
  const summaries = await apiClient.get<DesignerTemplateSummary[]>('/designer-report-templates');
  if (!summaries.success || !Array.isArray(summaries.data) || summaries.data.length === 0) {
    return null;
  }
  const targetCode = comparableCode(reportId);
  let summary = summaries.data.find((item) =>
    String(item.id) === reportId
    || comparableCode(item.reportCode) === targetCode
    || comparableCode(item.reportName) === targetCode
  );

  if (!summary) {
    summary = summaries.data.find((item) => {
      const codeClean = comparableCode(item.reportCode);
      const nameClean = comparableCode(item.reportName);
      if (targetCode.includes('119') && (codeClean.includes('119') || nameClean.includes('119'))) {
        return true;
      }
      return targetCode.length >= 4 && (
        codeClean.includes(targetCode)
        || targetCode.includes(codeClean)
        || nameClean.includes(targetCode)
        || targetCode.includes(nameClean)
      );
    });
  }

  if (!summary) return null;

  const detail = await apiClient.get<DesignerTemplateDetail>(
    `/designer-report-templates/${summary.id}/current`
  );
  return detail.success && detail.data ? detail.data : null;
}

function selectedVersion(detail: DesignerTemplateDetail) {
  const versions = [...(detail.versions || [])].sort((left, right) => right.versionNo - left.versionNo);
  return versions.find((item) => item.status.toLowerCase() === 'draft')
    ?? versions.find((item) => item.status.toLowerCase() === 'published')
    ?? versions[0];
}

async function getLocalReportDefinition(reportId: string): Promise<ClassicReportDefinition | null> {
  const clean = reportId.trim();
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
        } catch (e) {
          console.error(`Failed to read local definition at ${candidate}`, e);
        }
      }
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get('reportId') || '';
  if (!reportId)
    return NextResponse.json({ error: 'A report ID is required.' }, { status: 400 });

  const hasTenantSession = Boolean((await cookies()).get('auth_token')?.value);

  try {
    if (hasTenantSession) {
      const detail = await getTenantTemplate(reportId);
      if (detail) {
        const version = selectedVersion(detail);
        if (version?.templateJson) {
          const template = JSON.parse(version.templateJson) as DesignerTemplate;
          const classic = nativeTemplateToClassic(template, {
            reportId: detail.reportCode,
            reportName: detail.reportName,
            layoutVersion: version.versionNo,
            templateId: detail.id,
            reportDefinitionId: detail.reportDefinitionId,
            versionId: version.id,
            versionNo: version.versionNo,
            status: version.status,
            dataSourceCode: detail.dataSourceCode,
            moduleId: detail.moduleId,
            moduleName: detail.moduleCode,
            tenantId: detail.tenantId,
            tenantScope: detail.tenantId == null ? 'Global' : 'CurrentTenant',
            isActive: detail.isActive,
            dataProviderCode: detail.dataProviderCode,
            parameters: detail.parameters,
          });

          // The checked-in v10 Prarup Yadi layout repairs the imported Crystal
          // structure (five complete property rows per A3 page, nested floors,
          // logo and both photos). Serve it over an older database version until
          // the repaired design is saved/published and carries the v10 band marker.
          if (comparableCode(detail.reportCode)
              === comparableCode('Akola_Prarup_Yadi_main_RDG_15_9_2026_Copy')
              && !hasPrarupYadiV10Layout(classic)) {
            const localDef = await getLocalReportDefinition(reportId);
            if (localDef && hasPrarupYadiV10Layout(localDef)) {
              localDef.ntis = {
                ...localDef.ntis,
                ...classic.ntis,
                dataSourceCode: classic.ntis?.dataSourceCode
                  || localDef.ntis?.dataSourceCode
                  || 'PRARUP_YADI',
                dataProviderCode: classic.ntis?.dataProviderCode
                  || localDef.ntis?.dataProviderCode
                  || 'PrarupYadiDataProvider',
              };
              return NextResponse.json(localDef);
            }
          }

          // The complete checked-in Karakarni layout includes all assessment,
          // owner, floor, tax and property-media bands plus the repaired legacy
          // bindings. Offer it over the current v16 tenant template so the next
          // designer save creates the completed v17 draft without losing DB ids.
          if (comparableCode(detail.reportCode) === comparableCode('KarakarniReport')
              && !hasKarakarniV17Layout(classic)) {
            const localDef = await getLocalReportDefinition(reportId);
            if (localDef && hasKarakarniV17Layout(localDef)) {
              localDef.fieldCatalog = mergeFieldCatalogs(localDef.fieldCatalog, classic.fieldCatalog, ESSENTIAL_REPORT_FIELDS);
              localDef.ntis = {
                ...localDef.ntis,
                ...classic.ntis,
                dataSourceCode: classic.ntis?.dataSourceCode
                  || localDef.ntis?.dataSourceCode
                  || 'KARAKARNI',
                dataProviderCode: classic.ntis?.dataProviderCode
                  || localDef.ntis?.dataProviderCode
                  || 'KarakarniDataProvider',
              };
              return NextResponse.json(localDef);
            }
          }

          // Merge localDef fieldCatalog and ESSENTIAL_REPORT_FIELDS so new fields always appear in the designer
          const localDef = await getLocalReportDefinition(reportId);
          classic.fieldCatalog = mergeFieldCatalogs(classic.fieldCatalog, localDef?.fieldCatalog, ESSENTIAL_REPORT_FIELDS);

          // If DB version already has designed elements, use it
          if (Array.isArray(classic.elements) && classic.elements.length > 0) {
            return NextResponse.json(classic);
          }

          // If DB version is empty, check if a pre-designed local template exists
          if (localDef && Array.isArray(localDef.elements) && localDef.elements.length > 0) {
            localDef.fieldCatalog = mergeFieldCatalogs(localDef.fieldCatalog, classic.fieldCatalog, ESSENTIAL_REPORT_FIELDS);
            localDef.ntis = {
              ...localDef.ntis,
              ...classic.ntis,
              dataSourceCode: classic.ntis?.dataSourceCode
                ?? localDef.ntis?.dataSourceCode
                ?? 'UNASSIGNED',
            };
            return NextResponse.json(localDef);
          }

          return NextResponse.json(classic);
        }
      }
    }

    // Fallback 1: A local definition that exactly matches the requested report ID.
    const localDef = await getLocalReportDefinition(reportId);
    if (localDef) {
      localDef.fieldCatalog = mergeFieldCatalogs(localDef.fieldCatalog, ESSENTIAL_REPORT_FIELDS);
      return NextResponse.json(localDef);
    }

    // Fallback 2: Dynamic blank template for any report
    return NextResponse.json(createBlankClassicReportDefinition(reportId));
  } catch (error) {
    console.error('Error loading report design:', error);
    const localDef = await getLocalReportDefinition(reportId);
    if (localDef) return NextResponse.json(localDef);
    return NextResponse.json(createBlankClassicReportDefinition(reportId));
  }
}

export async function POST(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get('reportId') || '';
  const publishAfterSave = request.nextUrl.searchParams.get('publish') === 'true';
  const hasTenantSession = Boolean((await cookies()).get('auth_token')?.value);
  if (!hasTenantSession) {
    try {
      const body = await request.json() as ClassicReportDefinition;
      const reportCode = body.reportCode || reportId;
      if (!reportCode)
        return NextResponse.json({ error: 'A report ID is required.' }, { status: 400 });
      const reportName = body.reportName?.trim() || 'Untitled Report';
      const outDir = path.join(process.cwd(), 'public', 'reports', reportCode);
      const fs = await import('node:fs/promises');
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, 'definition.json'), JSON.stringify(body, null, 2), 'utf8');
      return NextResponse.json({
        success: true,
        message: `${reportName} saved successfully`,
        layoutVersion: (body.layoutVersion || 0) + 1,
        templateId: body.ntis?.templateId || 0,
        status: 'Draft',
        updatedAt: new Date().toISOString(),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save local layout';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  try {
    const body = await request.json() as ClassicReportDefinition;
    body.fieldCatalog = mergeFieldCatalogs(body.fieldCatalog, ESSENTIAL_REPORT_FIELDS);
    const reportCode = body.reportCode || reportId;
    if (!reportCode)
      return NextResponse.json({ error: 'A report ID is required.' }, { status: 400 });
    const reportName = body.reportName?.trim() || 'Untitled Report';
    const templateJson = JSON.stringify(classicToNativeTemplate(body));
    let detail = body.ntis?.templateId
      ? await getTenantTemplate(String(body.ntis.templateId))
      : null;
    if (!detail) {
      detail = await getTenantTemplate(reportCode) || await getTenantTemplate(reportId);
    }
    const templateId = detail?.id ?? body.ntis?.templateId;

    if (templateId) {
      const saved = await apiClient.post<{
        versionId: number;
        versionNo: number;
        status: string;
      }>(`/designer-report-templates/${templateId}/drafts`, { templateJson });
      if (!saved.success || !saved.data)
        return NextResponse.json(
          { error: saved.error || 'Tenant draft could not be saved.' },
          { status: saved.statusCode || 502 }
        );

      if (publishAfterSave) {
        const published = await apiClient.post<undefined>(
          `/designer-report-templates/${templateId}/versions/${saved.data.versionId}/publish`
        );
        if (!published.success)
          return NextResponse.json(
            { error: published.error || 'Tenant draft was saved but could not be published.' },
            { status: published.statusCode || 502 }
          );
      }

      // Also mirror the saved layout to local disk so disk files stay updated
      try {
        const fs = await import('node:fs/promises');
        const outDir = path.join(process.cwd(), 'public', 'reports', reportCode);
        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(path.join(outDir, 'definition.json'), JSON.stringify(body, null, 2), 'utf8');

        if (reportCode.includes('119') || reportId.includes('119')) {
          const altDir = path.join(process.cwd(), 'public', 'reports', 'Notice119');
          await fs.mkdir(altDir, { recursive: true });
          await fs.writeFile(path.join(altDir, 'definition.json'), JSON.stringify(body, null, 2), 'utf8');
        }
      } catch (e) {
        console.warn('Could not mirror saved layout to disk:', e);
      }

      return NextResponse.json({
        success: true,
        message: publishAfterSave
          ? `${reportName} saved and published successfully`
          : `${reportName} draft saved successfully`,
        layoutVersion: saved.data.versionNo,
        versionId: saved.data.versionId,
        templateId,
        status: publishAfterSave ? 'Published' : saved.data.status,
        updatedAt: new Date().toISOString(),
      });
    }

    const created = await apiClient.post<DesignerTemplateDetail>('/designer-report-templates', {
      reportCode,
      reportName,
      moduleCode: body.ntis?.moduleName || '',
      moduleId: body.ntis?.moduleId ?? null,
      tenantScope: body.ntis?.tenantScope || 'CurrentTenant',
      tenantId: body.ntis?.tenantId ?? null,
      isActive: body.ntis?.isActive ?? true,
      dataProviderCode: body.ntis?.dataProviderCode || 'UnassignedReportDataProvider',
      parameters: body.ntis?.parameters || [],
      dataSourceCode: body.ntis?.dataSourceCode || 'UNASSIGNED',
      templateJson,
    });
    if (!created.success || !created.data)
      return NextResponse.json(
        { error: created.error || 'Tenant template could not be created.' },
        { status: created.statusCode || 502 }
      );

    const version = selectedVersion(created.data);
    if (publishAfterSave && version) {
      const published = await apiClient.post<undefined>(
        `/designer-report-templates/${created.data.id}/versions/${version.id}/publish`
      );
      if (!published.success)
        return NextResponse.json(
          { error: published.error || 'Tenant template was created but could not be published.' },
          { status: published.statusCode || 502 }
        );
    }

    // Also mirror created layout to disk
    try {
      const fs = await import('node:fs/promises');
      const outDir = path.join(process.cwd(), 'public', 'reports', reportCode);
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, 'definition.json'), JSON.stringify(body, null, 2), 'utf8');

      if (reportCode.includes('119') || reportId.includes('119')) {
        const altDir = path.join(process.cwd(), 'public', 'reports', 'Notice119');
        await fs.mkdir(altDir, { recursive: true });
        await fs.writeFile(path.join(altDir, 'definition.json'), JSON.stringify(body, null, 2), 'utf8');
      }
    } catch (e) {
      console.warn('Could not mirror created layout to disk:', e);
    }

    return NextResponse.json({
      success: true,
      message: publishAfterSave
        ? `${reportName} created and published successfully`
        : `${reportName} created successfully`,
      layoutVersion: version?.versionNo ?? 1,
      versionId: version?.id,
      templateId: created.data.id,
      reportDefinitionId: created.data.reportDefinitionId,
      status: publishAfterSave ? 'Published' : (version?.status ?? 'Draft'),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving tenant report design:', error);
    return NextResponse.json({ error: 'Failed to save the report layout.' }, { status: 500 });
  }
}
