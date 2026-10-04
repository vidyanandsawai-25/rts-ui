import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CLASSIC_DESIGNER_HTML } from '@/components/modules/property-tax/report-designer/classic-designer-html';

describe('classic create report dialog', () => {
  const designerJsPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js');

  it('uses the in-app dialog instead of the browser prompt', () => {
    const html = CLASSIC_DESIGNER_HTML;
    const js = readFileSync(designerJsPath, 'utf8');

    expect(js).not.toContain("window.prompt('Enter report name:')");
    expect(html).toContain('id="createReportModal"');
    expect(html).toContain('id="createReportName"');
    expect(html).toContain('onclick="submitCreateNewReport()"');
    expect(js).toContain('function handleCreateReportKeydown(event)');
    expect(js).toContain("initializeNewReport('New Report');");
  });

  it('uses one PDF import flow and supports direct canvas text editing', () => {
    const js = readFileSync(designerJsPath, 'utf8');

    expect(js).toContain("importFetch('/api/import-report'");
    expect(js).toContain('await applyPdfLayoutToDesign(layout, file);');
    expect(js).toContain('addEditableBoxAt(sec.id, clickX, clickY)');
    expect(js).not.toContain('/api/upload-reference-pdf');
    expect(js).not.toContain('loadUnifiedReportIntoDesigner');
  });
});
