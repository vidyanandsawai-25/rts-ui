import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { CLASSIC_DESIGNER_HTML } from '@/components/modules/property-tax/report-designer/classic-designer-html';

interface TableEditorSmokeResult {
  merged: { rowSpan: number; colSpan: number; hidden: number };
  unmergedHidden: number;
  split: { rows: number; visibleRows: boolean };
  columnsAfterInsertDelete: number;
  applied: {
    sectionId: string;
    selected: boolean;
    visible: boolean;
    width: number;
    sectionHeight: number;
  };
}

function runTableEditorSmokeTest(): TableEditorSmokeResult {
  const designerJsPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js');
  const designerScript = readFileSync(designerJsPath, 'utf8');
  if (!designerScript) throw new Error('Classic table editor script was not found.');

  const start = designerScript.indexOf('let editingTableElemId = null');
  const end = designerScript.indexOf('// LINE EDITING & DRAWING SUBSYSTEM', start);
  const tableEditorSource = designerScript.slice(start, end);
  const context = createContext({
    console,
    document: {
      getElementById: (id: string) => id === 'tableSplitCount' ? { value: '3' } : null,
      querySelectorAll: () => [],
      querySelector: () => null,
    },
    window: { addEventListener: () => undefined, removeEventListener: () => undefined },
    showToast: () => undefined,
    escapeHtml: (value: unknown) => String(value ?? ''),
    reportDef: {
      elements: [{ id: 'table-1', sectionId: 'missing-section', type: 'table', x: 30, y: 10 }],
      sections: [{ id: 'details', name: 'Details', height: 20 }],
    },
    activeSectionId: 'details',
    selectedElementIds: [],
    pxToMm: (value: number) => value,
    renderCanvas: () => undefined,
    updatePropertiesPanel: () => undefined,
    updateSectionsList: () => undefined,
    pushHistory: () => undefined,
    renderElementOnCanvas: () => undefined,
  });

  runInContext(`${tableEditorSource}
    tempTableModel = normalizeTableModel({
      version: 1,
      rows: 3,
      cols: 3,
      cells: {},
      columnWidths: [80, 90, 70],
      rowHeights: [25, 30, 35]
    });
    tempTableSelectedCells = new Set(['0_0', '0_1', '1_0', '1_1']);
    tempTableSelectionAnchor = '0_0';
    mergeTableCells('rectangle');
    const merged = {
      rowSpan: tempTableModel.cells['0_0'].rowSpan,
      colSpan: tempTableModel.cells['0_0'].colSpan,
      hidden: Object.values(tempTableModel.cells).filter(cell => cell.hidden).length
    };
    unmergeTableCell();
    const unmergedHidden = Object.values(tempTableModel.cells).filter(cell => cell.hidden).length;
    tempTableSelectedCells = new Set(['0_0']);
    tempTableSelectionAnchor = '0_0';
    splitTableCell('rows');
    const split = {
      rows: tempTableModel.rows,
      visibleRows: ['0_0', '1_0', '2_0'].every(key => !tempTableModel.cells[key].hidden)
    };
    insertTableColumnAt(1);
    deleteTableColumnAt(1);
    const columnsAfterInsertDelete = tempTableModel.cols;
    editingTableElemId = 'table-1';
    saveTableCellEditor();
    const appliedElement = reportDef.elements[0];
    globalThis.__tableEditorResult = {
      merged,
      unmergedHidden,
      split,
      columnsAfterInsertDelete,
      applied: {
        sectionId: appliedElement.sectionId,
        selected: selectedElementIds.includes(appliedElement.id),
        visible: appliedElement.visible,
        width: appliedElement.width,
        sectionHeight: reportDef.sections[0].height
      }
    };
  `, context);

  return (context as unknown as { __tableEditorResult: TableEditorSmokeResult }).__tableEditorResult;
}

describe('classic advanced table editor', () => {
  it('keeps merge, unmerge, multi-row split and column transforms structurally valid', () => {
    const result = runTableEditorSmokeTest();

    expect(result.merged).toEqual({ rowSpan: 2, colSpan: 2, hidden: 3 });
    expect(result.unmergedHidden).toBe(0);
    expect(result.split).toEqual({ rows: 5, visibleRows: true });
    expect(result.columnsAfterInsertDelete).toBe(3);
    expect(result.applied.sectionId).toBe('details');
    expect(result.applied.selected).toBe(true);
    expect(result.applied.visible).toBe(true);
    expect(result.applied.width).toBeGreaterThan(0);
    expect(result.applied.sectionHeight).toBeGreaterThan(20);
  });

  it('keeps Save Draft as a draft and publishes from Save & Preview', () => {
    const designerJsPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js');
    const html = CLASSIC_DESIGNER_HTML;
    const js = readFileSync(designerJsPath, 'utf8');

    expect(html).toContain('id="btnSave" onclick="saveDesign(false)"');
    expect(js).toContain("const saved = await saveDesign(true);");
    expect(js).toContain("publish=${publishAfterSave ? 'true' : 'false'}");
    expect(js).toContain('saveDesign(false);');
  });

  it('creates schema image fields as borderless image elements', () => {
    const designerJsPath = join(process.cwd(), 'src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js');
    const js = readFileSync(designerJsPath, 'utf8');

    expect(js).toContain("metadata?.elementType === 'image' || metadata?.type === 'image'");
    expect(js).toContain("type: isFormula ? 'formula' : (isImage ? 'image' : 'field')");
    expect(js).toContain("border: 'none'");
    expect(js).toContain('reconcileElementTypesWithFieldCatalog()');
  });
});
