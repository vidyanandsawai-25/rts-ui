import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('classic report selector persistence', () => {
  const designerJsPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js');

  it('does not list a new working report until Save Layout persists it', () => {
    const js = readFileSync(designerJsPath, 'utf8');
    const selectorStart = js.indexOf('function isCurrentReportPersisted()');
    const selectorEnd = js.indexOf('function switchReport', selectorStart);
    const selectorSource = js.slice(selectorStart, selectorEnd);

    expect(selectorSource).toContain('Number(reportDef.layoutVersion) > 0');
    expect(selectorSource).toContain('isCurrentReportPersisted()');
    expect(selectorSource).toContain("unsaved.textContent = 'Save Layout to add this report';");
    expect(selectorSource).toContain('unsaved.hidden = true;');
    expect(selectorSource).toContain("unsaved.style.display = 'none';");
    expect(selectorSource).not.toContain("option.textContent = reportDef?.reportName || 'New unsaved report';");
  });

  it('hides the duplicate bottom status strip', () => {
    const cssPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.css');
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toMatch(/\.cr-statusbar\s*\{\s*display:\s*none !important;/);
  });

  it('coalesces repeated save clicks into one database request', () => {
    const js = readFileSync(designerJsPath, 'utf8');
    const saveStart = js.indexOf('let activeSavePromise = null;');
    const saveEnd = js.indexOf('function buildPlaceholderPreviewData', saveStart);
    const saveSource = js.slice(saveStart, saveEnd);

    expect(saveSource).toContain('if (activeSavePromise) return activeSavePromise;');
    expect(saveSource).toContain('activeSavePromise = performSaveDesign');
    expect(saveSource).toContain("['btnSave', 'btnSavePreview']");
    expect(saveSource).toContain('button.disabled = isBusy;');
  });

  it('opens the dynamic reports workspace after saving and previewing', () => {
    const js = readFileSync(designerJsPath, 'utf8');

    expect(js).toContain('`/${currentLocale}/property-tax/reports?_t=${Date.now()}`');
  });
});
