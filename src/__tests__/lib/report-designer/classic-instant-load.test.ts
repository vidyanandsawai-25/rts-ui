import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('classic designer startup rendering', () => {
  const designerJsPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js');

  it('defines the canvas background helpers used during the first render', () => {
    const js = readFileSync(designerJsPath, 'utf8');

    expect(js).toContain('function isPdfTemplateBackground(elem)');
    expect(js).toContain('function hasPdfTemplateBackground(definition = reportDef)');
    expect(js).toContain('function removeInvalidSectionOverflowLines(definition = reportDef)');
  });

  it('paints cached or blank paper before waiting for server data', () => {
    const js = readFileSync(designerJsPath, 'utf8');
    const startupStart = js.indexOf("window.addEventListener('DOMContentLoaded'");
    const startupEnd = js.indexOf('// 1. Calculate Page Physical Dimensions', startupStart);
    const startup = js.slice(startupStart, startupEnd);

    expect(startup).toContain('const cachedDesign = currentReportId ? readCachedReportDesign() : null;');
    expect(startup).toContain("createBlankReportDefinition('New Report', 'CUSTOM_REPORT')");
    expect(startup.indexOf('renderCanvas();')).toBeLessThan(startup.indexOf("await fetch('/api/reports')"));
    expect(startup.indexOf('renderCanvas();')).toBeLessThan(startup.indexOf('await loadDesign();'));
  });

  it('renders the saved definition before loading secondary metadata', () => {
    const js = readFileSync(designerJsPath, 'utf8');
    const loadStart = js.indexOf('async function loadDesign()');
    const loadEnd = js.indexOf('function switchLeftTab', loadStart);
    const loadSource = js.slice(loadStart, loadEnd);

    expect(loadSource.indexOf('renderCanvas();')).toBeLessThan(loadSource.indexOf('loadReportMetadata(currentReportId)'));
    expect(loadSource).toContain('Promise.allSettled([');
    expect(loadSource).toContain('setTimeout(() => controller.abort(), 30000)');
    expect(loadSource).toContain("setDesignerCanvasState('error'");
    expect(js).toContain('sessionStorage.setItem(reportDesignCacheKey(currentReportId), serialized);');
  });

  it('discards the old bundled Karakarni layout from the browser cache', () => {
    const js = readFileSync(designerJsPath, 'utf8');
    const cacheStart = js.indexOf('function isLegacyKarakarniDefinition');
    const cacheEnd = js.indexOf('function cacheReportDesign', cacheStart);
    const cacheSource = js.slice(cacheStart, cacheEnd);

    expect(cacheSource).toContain("reportCode !== 'KARAKARNI'");
    expect(cacheSource).toContain("'summary-grid-band'");
    expect(cacheSource).toContain("'floor-detail'");
    expect(cacheSource).toContain('sessionStorage.removeItem(reportDesignCacheKey());');
  });
});
