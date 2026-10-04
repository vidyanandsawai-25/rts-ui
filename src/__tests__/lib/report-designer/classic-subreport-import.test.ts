import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('classic RPT subreport import', () => {
  it('opens embedded Crystal subreports and serializes their actual bands', () => {
    const extractor = readFileSync(
      join(process.cwd(), 'src', 'lib', 'report-import', 'native_cr_extractor.vbs'),
      'utf8',
    );
    const bridge = readFileSync(
      join(process.cwd(), 'src', 'lib', 'report-import', 'native-cr-bridge.js'),
      'utf8',
    );

    expect(extractor).toContain('AppendEmbeddedSubreports rep');
    expect(extractor).toContain('Set subReport = parentReport.OpenSubreport(subName)');
    expect(extractor).toContain('AppendSubreportDefinition subReport');
    expect(extractor).toContain('""isSubreport"": true');
    expect(bridge).toContain("importRole: 'embeddedSubreportAnchor'");
    expect(bridge).toContain('parsed.embeddedSubreports =');
  });

  it('renders a layout-only subreport band once when no collection path exists', () => {
    const renderer = readFileSync(
      join(process.cwd(), 'public', 'engine', 'report_renderer.js'),
      'utf8',
    );

    expect(renderer).toContain("section.bandType !== 'subreport'");
    expect(renderer).toContain('section.dataPath');
    expect(renderer).toContain(': [dataContext];');
  });

  it('renders the subreport header and every row from its bound data collection', () => {
    const renderer = require(join(process.cwd(), 'public', 'engine', 'report_renderer.js')) as {
      renderReport: (
        definition: Record<string, unknown>,
        rows: Record<string, unknown>[],
      ) => { pagesHtml: string };
    };
    const result = renderer.renderReport({
      paperSize: 'A4',
      orientation: 'portrait',
      pageWidth: 794,
      pageHeight: 1123,
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      sections: [
        { id: 'sub-header', type: 'header', bandType: 'subreport', height: 24, visible: true },
        {
          id: 'sub-details',
          type: 'detail',
          bandType: 'subreport',
          dataPath: 'taxRows',
          height: 20,
          visible: true,
        },
      ],
      elements: [
        {
          id: 'sub-title',
          sectionId: 'sub-header',
          type: 'text',
          text: 'Imported Tax Subreport',
          x: 0,
          y: 0,
          width: 200,
          height: 20,
          styles: {},
          visible: true,
        },
        {
          id: 'tax-name',
          sectionId: 'sub-details',
          type: 'field',
          fieldName: 'taxName',
          text: '{taxName}',
          x: 0,
          y: 0,
          width: 200,
          height: 20,
          styles: {},
          visible: true,
        },
      ],
    }, [{ taxRows: [{ taxName: 'Property Tax' }, { taxName: 'Tree Cess' }] }]);

    expect(result.pagesHtml).toContain('Imported Tax Subreport');
    expect(result.pagesHtml).toContain('Property Tax');
    expect(result.pagesHtml).toContain('Tree Cess');
  });
});
