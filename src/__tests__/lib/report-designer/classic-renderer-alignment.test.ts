import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

function loadClassicRenderer() {
  const source = readFileSync(join(process.cwd(), 'public', 'engine', 'report_renderer.js'), 'utf8');
  const context = createContext({ module: { exports: {} }, exports: {} });
  runInContext(source, context);
  return (context.module as { exports: { renderElementHtml: (element: unknown, data: unknown, extra: unknown) => string } }).exports;
}

describe('classic preview text alignment', () => {
  it.each(['Notice119', 'Notice_119_final1_Main_Sagar_1'])('keeps the %s notice body readable inside its frame', (reportId) => {
    const definition = JSON.parse(readFileSync(join(process.cwd(), 'public', 'reports', reportId, 'definition.json'), 'utf8'));
    const body = definition.elements.find((element: { id: string }) => element.id === 'text64');
    const notes = definition.elements.find((element: { id: string }) => element.id === 'text170');

    expect(body.height).toBeGreaterThanOrEqual(250);
    expect(body.y + body.height).toBeLessThanOrEqual(notes.y);
    expect(body.styles.verticalAlign).toBe('top');
    expect(definition.elements.some((element: { text?: string }) => element.text?.includes('[]'))).toBe(false);
  });

  it('matches the designer middle default and respects an explicit bottom alignment', () => {
    const renderer = loadClassicRenderer();
    const base = { id: 'title', sectionId: 'header', type: 'text', text: 'Title', x: 0, y: 0, width: 200, height: 40 };

    const middle = renderer.renderElementHtml({ ...base, styles: {} }, {}, {});
    const bottom = renderer.renderElementHtml({ ...base, styles: { verticalAlign: 'bottom' } }, {}, {});

    expect(middle).toContain('display:flex; align-items:center;');
    expect(bottom).toContain('display:flex; align-items:flex-end;');
  });

  it('preserves leading spaces and uses white-space: pre-wrap for text and text_box elements', () => {
    const renderer = loadClassicRenderer();
    const textBox = { id: 'tb1', sectionId: 'details', type: 'text_box', text: '    Leading space text', x: 0, y: 0, width: 200, height: 40 };
    const html = renderer.renderElementHtml(textBox, {}, {});

    expect(html).toContain('white-space: pre-wrap;');
    expect(html).toContain('    Leading space text');
  });

  it('decodes imported whitespace entities without rendering entity text', () => {
    const renderer = loadClassicRenderer();
    const textBox = {
      id: 'tb-encoded-space',
      sectionId: 'details',
      type: 'text_box',
      text: '&amp;#x20;Notice &lt;119&gt;',
      x: 0,
      y: 0,
      width: 200,
      height: 40,
    };
    const html = renderer.renderElementHtml(textBox, {}, {});

    expect(html).not.toContain('&#x20;');
    expect(html).not.toContain('&amp;#x20;');
    expect(html).toContain('> Notice &lt;119&gt;</span>');
  });

  it('resolves saved Notice 119 bindings without case-sensitive data loss', () => {
    const renderer = loadClassicRenderer();
    const field = {
      id: 'mobile', sectionId: 'details', type: 'field', fieldName: 'MobileNo',
      x: 0, y: 0, width: 100, height: 20,
    };
    const logo = {
      id: 'logo', sectionId: 'details', type: 'image', fieldName: 'CouncilLogo',
      x: 0, y: 0, width: 40, height: 40,
    };

    expect(renderer.renderElementHtml(field, { mobileNo: '9876543210' }, {})).toContain('9876543210');
    expect(renderer.renderElementHtml(logo, { councilLogo: '/api/UlbImageMaster/logo/view' }, {}))
      .toContain('src="/api/UlbImageMaster/logo/view"');
  });
});
