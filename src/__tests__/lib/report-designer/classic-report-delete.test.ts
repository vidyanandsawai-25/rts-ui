import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CLASSIC_DESIGNER_HTML } from '@/components/modules/property-tax/report-designer/classic-designer-html';

describe('classic custom report deletion', () => {
  it('shows a delete control next to the report selector', () => {
    const html = CLASSIC_DESIGNER_HTML;

    expect(html).toContain('id="btnDeleteReport"');
    expect(html).toContain('onclick="deleteSelectedReport()"');
  });

  const designerJsPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js');

  it('only enables deletion for database reports marked as deletable', () => {
    const js = readFileSync(designerJsPath, 'utf8');
    const start = js.indexOf('function updateDeleteReportButton()');
    const end = js.indexOf('function switchReport', start);
    const source = js.slice(start, end);

    expect(source).toContain("selected?.dataset.canDelete === 'true'");
    expect(source).toContain("method: 'DELETE'");
    expect(source).toContain("sessionStorage.removeItem(reportDesignCacheKey(reportId))");
    expect(source).toContain("nextUrl.searchParams.delete('reportId')");
  });

  it('initializes report deletion before waiting for a large design to load', () => {
    const js = readFileSync(designerJsPath, 'utf8');
    const startupStart = js.indexOf("window.addEventListener('DOMContentLoaded'");
    const startupEnd = js.indexOf('// 1. Calculate Page Physical Dimensions', startupStart);
    const startup = js.slice(startupStart, startupEnd);

    expect(startup.indexOf('await initReportSelector(availableReports);'))
      .toBeLessThan(startup.indexOf('await loadDesign();'));
  });
});
