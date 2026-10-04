/* eslint-disable @typescript-eslint/no-unused-vars */
const PX_PER_MM = 96 / 25.4;
function mmToPx(mm) {
  return Math.round(mm * PX_PER_MM);
}
function pxToMm(px) {
  return parseFloat((px / PX_PER_MM).toFixed(1));
}
// Standard Crystal Reports Paper Sizes Catalog (Millimeters)
const PAPER_SIZES = {
  "A3": { widthMm: 297, heightMm: 420, label: "A3 (297 x 420 mm)" },
  "A3 Extra": { widthMm: 322, heightMm: 445, label: "A3 Extra (322 x 445 mm)" },
  "A3 Plus": { widthMm: 329, heightMm: 483, label: "A3 Plus (329 x 483 mm)" },
  "A3 Rotated": { widthMm: 420, heightMm: 297, label: "A3 Rotated (420 x 297 mm)" },
  "A3 Transverse": { widthMm: 297, heightMm: 420, label: "A3 Transverse (297 x 420 mm)" },
  "A4": { widthMm: 210, heightMm: 297, label: "A4 (210 x 297 mm)" },
  "A4 Extra": { widthMm: 235, heightMm: 322, label: "A4 Extra (235 x 322 mm)" },
  "A4 Plus": { widthMm: 210, heightMm: 330, label: "A4 Plus (210 x 330 mm)" },
  "A4 Rotated": { widthMm: 297, heightMm: 210, label: "A4 Rotated (297 x 210 mm)" },
  "A4 Small": { widthMm: 210, heightMm: 297, label: "A4 Small (210 x 297 mm)" },
  "A4 Transverse": { widthMm: 210, heightMm: 297, label: "A4 Transverse (210 x 297 mm)" },
  "A5": { widthMm: 148, heightMm: 210, label: "A5 (148 x 210 mm)" },
  "A5 Extra": { widthMm: 173, heightMm: 235, label: "A5 Extra (173 x 235 mm)" },
  "A5 Rotated": { widthMm: 210, heightMm: 148, label: "A5 Rotated (210 x 148 mm)" },
  "A5 Transverse": { widthMm: 148, heightMm: 210, label: "A5 Transverse (148 x 210 mm)" },
  "A6": { widthMm: 105, heightMm: 148, label: "A6 (105 x 148 mm)" },
  "Letter": { widthMm: 215.9, heightMm: 279.4, label: "Letter (8.5 x 11 in)" },
  "Letter Extra": { widthMm: 241.3, heightMm: 304.8, label: "Letter Extra (9.5 x 12 in)" },
  "Letter Plus": { widthMm: 215.9, heightMm: 322.3, label: "Letter Plus (8.5 x 12.69 in)" },
  "Letter Rotated": { widthMm: 279.4, heightMm: 215.9, label: "Letter Rotated (11 x 8.5 in)" },
  "Legal": { widthMm: 215.9, heightMm: 355.6, label: "Legal (8.5 x 14 in)" },
  "Tabloid": { widthMm: 279.4, heightMm: 431.8, label: "Tabloid (11 x 17 in)" },
  "Custom": { widthMm: 210, heightMm: 297, label: "Custom Size (सानुकूल आकार)" }
};
function getReportPrintableGeometry() {
  if (window.ReportRenderer && ReportRenderer.resolvePageGeometry && reportDef) {
    return ReportRenderer.resolvePageGeometry(reportDef);
  }
  const pW = reportDef ? (reportDef.pageWidth || 1123) : 1123;
  const pH = reportDef ? (reportDef.pageHeight || 794) : 794;
  const m = (reportDef && reportDef.margins) || { top: 6.4, right: 3.2, bottom: 6.4, left: 6.4 };
  const leftPx = mmToPx(m.left !== undefined ? m.left : 6.4);
  const rightPx = mmToPx(m.right !== undefined ? m.right : 3.2);
  const topPx = mmToPx(m.top !== undefined ? m.top : 6.4);
  const bottomPx = mmToPx(m.bottom !== undefined ? m.bottom : 6.4);
  const printableWidth = pW - leftPx - rightPx;
  const printableHeight = pH - topPx - bottomPx;
  return {
    printableWidth,
    printableHeight,
    printableWidthMm: pxToMm(printableWidth),
    printableHeightMm: pxToMm(printableHeight)
  };
}
function getHorizontalDesignWidth() {
  const geom = getReportPrintableGeometry();
  return reportDef && reportDef.coordinateMode === 'page'
    ? (reportDef.pageWidth || geom.printableWidth)
    : geom.printableWidth;
}
// Global Report State
let reportDef = null;
let selectedElementIds = [];
let activeSectionId = 'details';
let zoomLevel = 1.0;
let snapToGrid = true;
const SNAP_SIZE = 5;
let isGridVisible = true;

function isPdfTemplateBackground(elem) {
  return Boolean(elem && (String(elem.id || '').startsWith('pdf-template-bg')
    || elem.properties?.importRole === 'pdfBackground'));
}

function hasPdfTemplateBackground(definition = reportDef) {
  return Boolean(definition?.elements?.some(isPdfTemplateBackground));
}

function removeInvalidSectionOverflowLines(definition = reportDef) {
  if (!definition?.elements || !definition?.sections) return false;
  const sectionHeights = new Map(definition.sections.map(section => [section.id, Number(section.height || 0)]));
  const originalCount = definition.elements.length;
  definition.elements = definition.elements.filter(elem => {
    if (elem.type !== 'line' || elem.visible === false) return true;
    const width = Math.max(1, Number(elem.width || 0));
    const height = Math.max(1, Number(elem.height || 0));
    const sectionHeight = sectionHeights.get(elem.sectionId) || 0;
    const isVertical = height >= Math.max(24, width * 4);
    return !(isVertical && sectionHeight > 0 && height > sectionHeight + 4);
  });
  return definition.elements.length !== originalCount;
}

// Undo / Redo History
const historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 30;
// Drag / Resize State
let dragAction = null; // 'move' | 'resize' | 'section-resize' | 'marquee'
let dragStartPos = { x: 0, y: 0 };
let elementStartBounds = {};
let resizeHandleType = null;
let resizingSectionId = null;
let sectionStartHeight = 0;
// Dynamic Fields Catalogs (Populated dynamically per active report)
let DB_FIELDS = [];
let FORMULA_FIELDS = [];
let SUMMARY_FIELDS = [];
let PARAMETER_FIELDS = [];
let reportSettingsOptions = { currentTenantId: null, modules: [], dataProviderCodes: [] };
// Static Elements Catalog
const STATIC_FIELDS = [
  { name: "TextLabel", label: "Static Text Label", type: "text" },
  { name: "HeaderTitle", label: "Report Header Title", type: "text" },
  { name: "RectBox", label: "Rectangle / Box Border", type: "box" },
  { name: "HLine", label: "Horizontal Divider Line", type: "line" },
  { name: "LogoImage", label: "PMC Logo Image", type: "image" }
];
// Column Pairs (Column Header <-> Details Row Field <-> Grand Total Cell)
const COLUMN_PAIRS = {
  'col_sr': 'field_sr',
  'field_sr': 'col_sr',
  'col_window': 'field_billbook',
  'field_billbook': 'col_window',
  'col_rec': 'field_inv_box',
  'field_inv_box': 'col_rec',
  'col_conn': 'field_consumerno',
  'field_consumerno': 'col_conn',
  'col_cust': 'field_custname',
  'field_custname': 'col_cust',
  'col_type': 'field_paymentmode',
  'field_paymentmode': 'col_type',
  'col_bank': 'field_bank',
  'field_bank': 'col_bank',
  'col_chq': 'field_chq',
  'field_chq': 'col_chq',
  'col_yr': 'field_year',
  'field_year': 'col_yr',
  'col_billdt': 'field_billdate',
  'field_billdate': 'col_billdt',
  'col_tax': 'field_taxtotal',
  'field_taxtotal': 'col_tax',
  'col_int': 'field_interest',
  'field_interest': 'col_int',
  'col_other': 'field_otherfee',
  'field_otherfee': 'col_other',
  'col_disc': 'field_discount',
  'field_discount': 'col_disc',
  'col_net': 'field_nettotal',
  'field_nettotal': 'col_net',
  'col_bounce': 'field_bounce',
  'field_bounce': 'col_bounce',
  'col_clerk': 'field_clerkname',
  'field_clerkname': 'col_clerk'
};
const urlParams = new URLSearchParams(window.location.search);
let currentReportId = urlParams.get('reportId') || urlParams.get('report') || '';
function isCurrentReportPersisted() {
  return Boolean(reportDef && (
    Number(reportDef.layoutVersion) > 0
    || reportDef.ntis?.templateId
    || reportDef.ntis?.versionId
    || String(reportDef.ntis?.status || '').toLowerCase() === 'published'
  ));
}
async function initReportSelector(preloadedReports) {
  try {
    let reports = preloadedReports;
    if (!reports) {
      const resp = await fetch('/api/reports');
      const data = await resp.json();
      reports = data?.reports || [];
    }
    const sel = document.getElementById('selReportId');
    if (sel) {
      sel.replaceChildren();
      if (reports.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- No Reports in Database --';
        sel.appendChild(option);
      }
      reports.forEach(r => {
        const option = document.createElement('option');
        option.value = r.id;
        option.textContent = r.name;
        option.dataset.templateId = r.templateId ? String(r.templateId) : '';
        option.dataset.canDelete = r.canDelete === true ? 'true' : 'false';
        option.selected = r.id === currentReportId;
        sel.appendChild(option);
      });
      const hasCurrentReport = currentReportId
        && [...sel.options].some(option => option.value === currentReportId);
      if (!currentReportId) {
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '-- Select a Report --';
        defaultOpt.selected = true;
        sel.prepend(defaultOpt);
      } else if (currentReportId && !hasCurrentReport && isCurrentReportPersisted()) {
        const option = document.createElement('option');
        option.value = currentReportId;
        option.textContent = reportDef?.reportName || currentReportId;
        option.selected = true;
        sel.prepend(option);
      } else if (currentReportId && !hasCurrentReport) {
        const unsaved = document.createElement('option');
        unsaved.value = '';
        unsaved.textContent = 'Save Layout to add this report';
        unsaved.selected = true;
        unsaved.disabled = true;
        unsaved.hidden = true;
        unsaved.style.display = 'none';
        unsaved.dataset.unsavedPlaceholder = 'true';
        sel.prepend(unsaved);
      }
      updateDeleteReportButton();
    }
  } catch (e) { }
}
function updateDeleteReportButton() {
  const select = document.getElementById('selReportId');
  const button = document.getElementById('btnDeleteReport');
  if (!select || !button) return;
  const selected = select.selectedOptions?.[0];
  const canDelete = selected?.dataset.canDelete === 'true'
    && Number(selected?.dataset.templateId) > 0;
  button.disabled = !canDelete;
  button.title = canDelete
    ? `Delete custom report: ${selected.textContent || select.value}`
    : 'Built-in/global reports cannot be deleted. Select a custom report.';
}
async function deleteSelectedReport() {
  const select = document.getElementById('selReportId');
  const button = document.getElementById('btnDeleteReport');
  const selected = select?.selectedOptions?.[0];
  const templateId = Number(selected?.dataset.templateId);
  const reportId = selected?.value || '';
  const reportName = selected?.textContent?.trim() || reportId;
  if (selected?.dataset.canDelete !== 'true' || !Number.isSafeInteger(templateId) || templateId <= 0) {
    showToast('Built-in/global report delete करता येत नाही. Custom report निवडा.');
    return;
  }
  if (!window.confirm(`Delete "${reportName}"?\n\nहा custom report dropdown मधून हटवला जाईल. ही action undo करता येणार नाही.`)) return;

  button.disabled = true;
  const originalLabel = button.innerHTML;
  button.textContent = 'Deleting...';
  try {
    const response = await fetch(`/api/reports/${encodeURIComponent(String(templateId))}`, {
      method: 'DELETE',
      headers: { 'Cache-Control': 'no-store' }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Report could not be deleted.');
    }

    try {
      sessionStorage.removeItem(reportDesignCacheKey(reportId));
    } catch (e) { }
    showToast(`Deleted: ${reportName}`);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('reportId');
    nextUrl.searchParams.delete('report');
    nextUrl.searchParams.delete('import');
    nextUrl.searchParams.delete('newReport');
    window.location.assign(nextUrl.toString());
  } catch (error) {
    button.innerHTML = originalLabel;
    button.disabled = false;
    showToast(error.message || 'Report could not be deleted.');
  }
}
function switchReport(rId) {
  if (!rId) return;
  console.log('[Designer] switchReport:', rId, '| current:', currentReportId);
  if (rId === currentReportId) {
    console.log('[Designer] Same report re-selected, force reloading...');
    loadDesign();
    return;
  }
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set('reportId', rId);
  window.location.assign(nextUrl.toString());
}
function createBlankReportDefinition(reportName, reportCode) {
  const widthMm = 210;
  const heightMm = 297;
  return {
    reportId: reportCode,
    reportName,
    reportCode,
    layoutVersion: 0,
    schemaVersion: 3,
    paperSize: 'A4',
    orientation: 'portrait',
    widthMm,
    heightMm,
    pageWidth: mmToPx(widthMm),
    pageHeight: mmToPx(heightMm),
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    recordsPerPage: 1,
    coordinateMode: 'page',
    sections: [
      { id: 'report-header', name: 'Report Header', height: 100, heightMm: pxToMm(100), type: 'header', bandType: 'reportHeader', visible: true },
      { id: 'details', name: 'Details', height: 880, heightMm: pxToMm(880), type: 'detail', bandType: 'detail', visible: true },
      { id: 'page-footer', name: 'Page Footer', height: 80, heightMm: pxToMm(80), type: 'footer', bandType: 'pageFooter', visible: true }
    ],
    elements: [],
    ntis: {
      dataSourceCode: 'UNASSIGNED',
      dataProviderCode: 'UnassignedReportDataProvider',
      moduleId: null,
      tenantId: null,
      tenantScope: 'CurrentTenant',
      isActive: true,
      parameters: [],
      status: 'Draft'
    }
  };
}
function reportDesignCacheKey(reportId = currentReportId) {
  return `ntis:report-designer:${reportId}`;
}
function isLegacyKarakarniDefinition(definition) {
  const reportCode = String(currentReportId || definition?.reportCode || definition?.reportId || '')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();
  if (reportCode !== 'KARAKARNI' && reportCode !== 'KARAKARNIREPORT') return false;
  const sectionIds = new Set((definition?.sections || []).map(section => section.id));
  return [
    'header-band',
    'summary-grid-band',
    'floor-detail',
    'horizontal-tax-band',
    'photos-band'
  ].every(id => sectionIds.has(id));
}
function readCachedReportDesign() {
  try {
    const cached = sessionStorage.getItem(reportDesignCacheKey());
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (isLegacyKarakarniDefinition(parsed)) {
      sessionStorage.removeItem(reportDesignCacheKey());
      return null;
    }
    if (currentReportId && parsed && (parsed.reportId || parsed.reportCode)) {
      const pId = String(parsed.reportId || parsed.reportCode);
      if (pId !== currentReportId && (!pId.includes('119') && currentReportId.includes('119'))) {
        sessionStorage.removeItem(reportDesignCacheKey());
        return null;
      }
    }
    if (parsed && (parsed.reportId === 'Akola_Prarup_Yadi_main_RDG_15_9_2026_Copy' || parsed.reportCode === 'Akola_Prarup_Yadi_main_RDG_15_9_2026_Copy') && (parsed.layoutVersion || 0) < 10) {
      sessionStorage.removeItem(reportDesignCacheKey());
      return null;
    }
    if (parsed && Array.isArray(parsed.sections) && Array.isArray(parsed.elements)) {
      if (parsed.elements.length === 0) {
        sessionStorage.removeItem(reportDesignCacheKey());
        return null;
      }
      return normalizeReportTextEntities(parsed);
    }
    return null;
  } catch (error) {
    return null;
  }
}
function cacheReportDesign(definition = reportDef) {
  if (!definition) return;
  try {
    const serialized = JSON.stringify(definition);
    sessionStorage.setItem(reportDesignCacheKey(currentReportId), serialized);
    if (definition.reportId && definition.reportId !== currentReportId)
      sessionStorage.setItem(reportDesignCacheKey(definition.reportId), serialized);
  } catch (error) { }
}
function setDesignerCanvasState(mode = 'idle', message = '') {
  const canvas = document.getElementById('reportCanvas');
  if (!canvas) return;
  document.getElementById('designerCanvasState')?.remove();
  if (mode === 'idle') return;

  const overlay = document.createElement('div');
  overlay.id = 'designerCanvasState';
  overlay.className = 'designer-canvas-state';
  const card = document.createElement('div');
  card.className = 'designer-canvas-state-card';
  if (mode === 'loading') {
    const spinner = document.createElement('div');
    spinner.className = 'designer-canvas-spinner';
    card.appendChild(spinner);
  }
  const label = document.createElement('div');
  label.textContent = message || (mode === 'error' ? 'Report could not be loaded.' : 'Loading report design...');
  card.appendChild(label);
  if (mode === 'error') {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'cr-btn primary';
    retry.style.marginTop = '12px';
    retry.textContent = 'Retry';
    retry.onclick = () => loadDesign();
    card.appendChild(retry);
  }
  overlay.appendChild(card);
  canvas.appendChild(overlay);
}
const reportImportState = {
  rptFile: null,
  pdfFile: null,
  subreports: [],
  pdfLayout: null,
  optionsLoaded: false,
  options: { currentTenantId: null, modules: [], dataProviderCodes: [] },
  dataSources: []
};

async function importFetch(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Server responseला जास्त वेळ लागत आहे. कृपया पुन्हा प्रयत्न करा.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function setImportError(message, inputId) {
  const error = document.getElementById('createReportError');
  if (error) {
    error.textContent = message || '';
    error.style.display = message ? 'block' : 'none';
  }
  if (inputId) document.getElementById(inputId)?.classList.add('invalid');
}

function clearCreateReportError() {
  document.querySelectorAll('#createReportModal .invalid').forEach(el => el.classList.remove('invalid'));
  setImportError('');
}

function sourceBaseName(fileName) {
  return String(fileName || '').replace(/\.(rpt|pdf)$/i, '').trim();
}

function suggestedReportId(fileName) {
  const slug = sourceBaseName(fileName)
    .normalize('NFKD')
    .replace(/[^a-z0-9_]+/gi, '_')
    .replace(/^_+|_+$/g, '');
  return (/^[a-z]/i.test(slug) ? slug : `Report_${slug || 'Imported'}`).slice(0, 100);
}

function toggleAdvancedImportSettings() {
  const panel = document.getElementById('reportAdvancedPanel');
  const arrow = document.getElementById('advancedToggleArrow');
  if (!panel) return;
  const isHidden = panel.style.display === 'none' || !panel.style.display;
  panel.style.display = isHidden ? 'flex' : 'none';
  if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
}
window.toggleAdvancedImportSettings = toggleAdvancedImportSettings;

function updateImportDetectedCard(file, type, layout) {
  const card = document.getElementById('importDetectedCard');
  const nameEl = document.getElementById('detectedFileName');
  const paperEl = document.getElementById('detectedPaperBadge');
  if (!card || !nameEl || !paperEl || !file) return;

  nameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  const paperSelect = document.getElementById('importPaperSize');
  const orientSelect = document.getElementById('importOrientation');
  const paperVal = paperSelect?.value || 'A4';
  const orientVal = orientSelect?.value || 'portrait';
  const orientText = orientVal === 'landscape' ? 'Landscape (आडवे)' : 'Portrait (उभे)';

  paperEl.textContent = `${paperVal} • ${orientText}`;
  card.style.display = 'block';
}
window.updateImportDetectedCard = updateImportDetectedCard;

function updateDetectedCardFromSelects() {
  const paperEl = document.getElementById('detectedPaperBadge');
  const paperSelect = document.getElementById('importPaperSize');
  const orientSelect = document.getElementById('importOrientation');
  if (!paperEl) return;
  const paperVal = paperSelect?.value || 'A4';
  const orientVal = orientSelect?.value || 'portrait';
  const orientText = orientVal === 'landscape' ? 'Landscape (आडवे)' : 'Portrait (उभे)';
  paperEl.textContent = `${paperVal} • ${orientText}`;
}
window.updateDetectedCardFromSelects = updateDetectedCardFromSelects;

function autofillImportIdentity(file) {
  const idInput = document.getElementById('importReportId');
  const nameInput = document.getElementById('createReportName');
  if (idInput && !idInput.value.trim()) idInput.value = suggestedReportId(file.name);
  if (nameInput && !nameInput.value.trim()) {
    nameInput.value = sourceBaseName(file.name).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  // Auto-detect paper size & orientation from file name
  const paperSelect = document.getElementById('importPaperSize');
  const orientSelect = document.getElementById('importOrientation');
  const lower = file.name.toLowerCase();
  if (paperSelect && orientSelect) {
    if (lower.includes('a3') || lower.includes('landscape') || lower.includes('yadi') || lower.includes('prarup')) {
      paperSelect.value = 'A3';
      orientSelect.value = 'landscape';
    } else if (lower.includes('legal')) {
      paperSelect.value = 'Legal';
      orientSelect.value = 'portrait';
    } else {
      paperSelect.value = 'A4';
      orientSelect.value = 'portrait';
    }
  }

  // Auto-fill default provider & data source if empty
  const provInput = document.getElementById('importProvider');
  const dsInput = document.getElementById('importDataSourceCode');
  if (provInput && !provInput.value.trim()) {
    provInput.value = 'PropertyTaxReportDataProvider';
  }
  if (dsInput && !dsInput.value.trim()) {
    dsInput.value = 'PROPERTY_TAX';
  }

  // Auto-select first module if empty
  const modSelect = document.getElementById('importModuleId');
  if (modSelect && !modSelect.value && modSelect.options.length > 1) {
    modSelect.selectedIndex = 1;
  }

  updateImportDetectedCard(file, 'rpt');
}

function renderImportSubreports() {
  const container = document.getElementById('importSubreportList');
  if (!container) return;
  container.replaceChildren();
  if (reportImportState.subreports.length === 0) {
    container.textContent = 'कोणताही बाह्य subreport जोडलेला नाही';
    return;
  }
  reportImportState.subreports.forEach((file, index) => {
    const chip = document.createElement('span');
    chip.className = 'report-import-file-chip';
    const label = document.createElement('span');
    label.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.title = 'Remove';
    remove.textContent = '×';
    remove.onclick = () => {
      reportImportState.subreports.splice(index, 1);
      renderImportSubreports();
    };
    chip.append(label, remove);
    container.appendChild(chip);
  });
}

function showImportAnalysis(message, tone = 'success') {
  const analysis = document.getElementById('importAnalysis');
  if (!analysis) return;
  analysis.hidden = !message;
  analysis.textContent = message || '';
  analysis.style.borderColor = tone === 'error' ? '#fecaca' : '#a7f3d0';
  analysis.style.background = tone === 'error' ? '#fef2f2' : '#ecfdf5';
  analysis.style.color = tone === 'error' ? '#b91c1c' : '#065f46';
}

function resetReportImporter() {
  reportImportState.rptFile = null;
  reportImportState.pdfFile = null;
  reportImportState.subreports = [];
  reportImportState.pdfLayout = null;
  ['importRptFile', 'importSubreportFiles', 'importPdfFile'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  ['importReportId', 'createReportName', 'importProvider', 'importDataSourceCode'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  const moduleSelect = document.getElementById('importModuleId');
  if (moduleSelect) moduleSelect.value = '';
  const paper = document.getElementById('importPaperSize');
  const orientation = document.getElementById('importOrientation');
  if (paper) paper.value = 'A4';
  if (orientation) orientation.value = 'portrait';
  const rptLabel = document.getElementById('importRptLabel');
  const pdfLabel = document.getElementById('importPdfLabel');
  if (rptLabel) rptLabel.innerHTML = '<strong>.rpt फाइल निवडा</strong> किंवा येथे drag & drop करा';
  if (pdfLabel) pdfLabel.textContent = 'PDF source निवडलेला नाही';
  const detectedCard = document.getElementById('importDetectedCard');
  if (detectedCard) detectedCard.style.display = 'none';
  const advPanel = document.getElementById('reportAdvancedPanel');
  if (advPanel) advPanel.style.display = 'none';
  const advArrow = document.getElementById('advancedToggleArrow');
  if (advArrow) advArrow.textContent = '▼';
  renderImportSubreports();
  showImportAnalysis('');
  clearCreateReportError();
}

async function loadReportImportOptions() {
  if (reportImportState.optionsLoaded) return;
  try {
    const response = await fetch('/api/import-report', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Import options could not be loaded.');
    reportImportState.options = data.options || reportImportState.options;
    reportImportState.dataSources = Array.isArray(data.dataSources) ? data.dataSources : [];
    reportImportState.optionsLoaded = true;

    const moduleSelect = document.getElementById('importModuleId');
    if (moduleSelect) {
      moduleSelect.replaceChildren();
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '-- Module निवडा --';
      moduleSelect.appendChild(empty);
      (reportImportState.options.modules || []).forEach(module => {
        const option = document.createElement('option');
        option.value = String(module.id);
        option.textContent = module.name;
        moduleSelect.appendChild(option);
      });
    }

    const providers = new Set(reportImportState.options.dataProviderCodes || []);
    reportImportState.dataSources.forEach(source => {
      const providerCode = source.executionReportCode
        || (source.name ? `${source.name}DataProvider` : '');
      if (providerCode) providers.add(providerCode);
    });
    providers.delete('UnassignedReportDataProvider');
    const list = document.getElementById('importProviderList');
    if (list) {
      list.replaceChildren();
      [...providers].sort().forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        list.appendChild(option);
      });
    }
  } catch (error) {
    setImportError(error.message || 'Import options could not be loaded.');
  }
}

function setupReportImportDropzone() {
  const dropzone = document.getElementById('importRptDropzone');
  if (!dropzone || dropzone.dataset.ready === 'true') return;
  dropzone.dataset.ready = 'true';
  ['dragenter', 'dragover'].forEach(name => dropzone.addEventListener(name, event => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(name => dropzone.addEventListener(name, event => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
  }));
  dropzone.addEventListener('drop', event => {
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'rpt') {
      selectImportRptFile(file);
    } else {
      setImportError('कृपया वैध .rpt फाइल निवडा.');
    }
  });
}

function handleImportMainFileSelected(input) {
  const file = input.files?.[0];
  if (!file) return;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'rpt') {
    selectImportRptFile(file);
  } else {
    setImportError('कृपया वैध .rpt फाइल निवडा.');
  }
}
window.handleImportMainFileSelected = handleImportMainFileSelected;

function createNewReport() {
  initializeNewReport('New Report');
}

async function openReportImporter() {
  const modal = document.getElementById('createReportModal');
  if (!modal) return;
  resetReportImporter();
  modal.classList.add('show');
  setupReportImportDropzone();
  await loadReportImportOptions();
  setTimeout(() => document.getElementById('importRptDropzone')?.focus(), 0);
}

function closeCreateReportModal() {
  document.getElementById('createReportModal')?.classList.remove('show');
  document.getElementById('btnImportReportSource')?.focus();
}

function handleCreateReportOverlay(event) {
  if (event.target.id === 'createReportModal') closeCreateReportModal();
}

function handleCreateReportKeydown(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    submitCreateNewReport();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeCreateReportModal();
  }
}
window.openReportImporter = openReportImporter;
window.closeCreateReportModal = closeCreateReportModal;
window.handleCreateReportOverlay = handleCreateReportOverlay;
window.handleCreateReportKeydown = handleCreateReportKeydown;
window.createNewReport = createNewReport;

function selectImportRptFile(file) {
  if (!file?.name?.toLowerCase().endsWith('.rpt')) {
    setImportError('कृपया वैध .rpt फाइल निवडा.');
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    setImportError('.rpt फाइल 25 MB पेक्षा लहान असावी.');
    return;
  }
  reportImportState.rptFile = file;
  autofillImportIdentity(file);
  const label = document.getElementById('importRptLabel');
  if (label) label.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  showImportAnalysis('Crystal Report detected\nImporting sections and report objects...');
  clearCreateReportError();
}

function handleImportRptSelected(input) {
  const file = input.files?.[0];
  if (file) selectImportRptFile(file);
}

function handleImportSubreportsSelected(input) {
  const selected = [...(input.files || [])].filter(file => file.name.toLowerCase().endsWith('.rpt'));
  for (const file of selected) {
    if (!reportImportState.subreports.some(existing => existing.name === file.name && existing.size === file.size)) {
      reportImportState.subreports.push(file);
    }
  }
  reportImportState.subreports = reportImportState.subreports.slice(0, 12);
  input.value = '';
  renderImportSubreports();
}

function svgPaint(value, fallback) {
  const paint = String(value || '').trim();
  if (!paint || paint === 'none' || paint === 'transparent' || paint.startsWith('url(')) return fallback;
  return paint;
}

function svgElementBounds(element, rootBounds) {
  const bounds = element.getBoundingClientRect();
  return {
    x: Math.max(0, bounds.left - rootBounds.left),
    y: Math.max(0, bounds.top - rootBounds.top),
    width: Math.max(0, bounds.width),
    height: Math.max(0, bounds.height)
  };
}

function pdfRgb(args, fallback = '#111827') {
  const values = Array.from(args || []).slice(0, 3).map(value => Number(value));
  if (values.length < 3 || values.some(value => !Number.isFinite(value))) return fallback;
  const normalized = values.map(value => Math.max(0, Math.min(255, value <= 1 ? value * 255 : value)));
  return `rgb(${normalized.map(value => Math.round(value)).join(',')})`;
}

function transformedPdfBounds(bounds, transform) {
  const [minX, maxX, minY, maxY] = bounds;
  const points = [
    pdfjsLib.Util.applyTransform([minX, minY], transform),
    pdfjsLib.Util.applyTransform([maxX, minY], transform),
    pdfjsLib.Util.applyTransform([minX, maxY], transform),
    pdfjsLib.Util.applyTransform([maxX, maxY], transform)
  ];
  const xs = points.map(point => point[0]);
  const ys = points.map(point => point[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    width: Math.max(0, Math.max(...xs) - x),
    height: Math.max(0, Math.max(...ys) - y)
  };
}

function pdfImageObject(page, objectName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`PDF image ${objectName} timed out.`)), 5000);
    try {
      page.objs.get(objectName, value => {
        clearTimeout(timer);
        resolve(value);
      });
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

async function pdfImageDataUrl(page, objectName) {
  const image = await pdfImageObject(page, objectName);
  if (!image || !image.width || !image.height) return '';
  const source = document.createElement('canvas');
  source.width = image.width;
  source.height = image.height;
  const context = source.getContext('2d');
  if (image.bitmap) {
    context.drawImage(image.bitmap, 0, 0);
  } else if (image.data) {
    const rgba = new Uint8ClampedArray(image.width * image.height * 4);
    if (image.data.length === rgba.length) {
      rgba.set(image.data);
    } else if (image.data.length === image.width * image.height * 3) {
      for (let sourceIndex = 0, targetIndex = 0; sourceIndex < image.data.length; sourceIndex += 3, targetIndex += 4) {
        rgba[targetIndex] = image.data[sourceIndex];
        rgba[targetIndex + 1] = image.data[sourceIndex + 1];
        rgba[targetIndex + 2] = image.data[sourceIndex + 2];
        rgba[targetIndex + 3] = 255;
      }
    } else {
      return '';
    }
    context.putImageData(new ImageData(rgba, image.width, image.height), 0, 0);
  } else {
    return '';
  }

  return compactCanvasDataUrl(source);
}

function compactCanvasDataUrl(source) {
  let current = source;
  while (current.width >= 280 && current.height >= 280) {
    for (const quality of [0.9, 0.78, 0.66, 0.54, 0.42, 0.3]) {
      const dataUrl = current.toDataURL('image/webp', quality);
      if (dataUrl.length <= 96_000) return dataUrl;
    }

    const resized = document.createElement('canvas');
    resized.width = Math.max(1, Math.round(current.width * 0.82));
    resized.height = Math.max(1, Math.round(current.height * 0.82));
    const resizedContext = resized.getContext('2d', { alpha: false });
    if (!resizedContext) return '';
    resizedContext.fillStyle = '#ffffff';
    resizedContext.fillRect(0, 0, resized.width, resized.height);
    resizedContext.drawImage(current, 0, 0, resized.width, resized.height);
    current = resized;
  }
  return '';
}

async function renderPdfPageImage(page, viewport) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return '';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, background: '#ffffff' }).promise;
  return compactCanvasDataUrl(canvas);
}

async function renderPdfPageTiles(page, viewport, tileCount = 6) {
  const renderViewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(renderViewport.width);
  canvas.height = Math.ceil(renderViewport.height);
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return [];
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport: renderViewport, background: '#ffffff' }).promise;

  const tiles = [];
  for (let index = 0; index < tileCount; index += 1) {
    const sourceTop = Math.floor((canvas.height * index) / tileCount);
    const sourceBottom = Math.floor((canvas.height * (index + 1)) / tileCount);
    const sourceHeight = Math.max(1, sourceBottom - sourceTop);
    const tile = document.createElement('canvas');
    tile.width = canvas.width;
    tile.height = sourceHeight;
    const tileContext = tile.getContext('2d', { alpha: false });
    if (!tileContext) continue;
    tileContext.fillStyle = '#ffffff';
    tileContext.fillRect(0, 0, tile.width, tile.height);
    tileContext.drawImage(
      canvas,
      0,
      sourceTop,
      canvas.width,
      sourceHeight,
      0,
      0,
      tile.width,
      tile.height
    );
    const dataUrl = compactCanvasDataUrl(tile);
    if (!dataUrl) continue;
    const y = (sourceTop / canvas.height) * viewport.height;
    const height = (sourceHeight / canvas.height) * viewport.height;
    tiles.push({
      id: `pdf-template-bg-${index + 1}`,
      type: 'image',
      x: 0,
      y,
      width: viewport.width,
      height,
      dataUrl,
      locked: true,
      objectFit: 'fill'
    });
  }
  return tiles;
}

async function extractOperatorGraphics(page, viewport) {
  const operatorList = await page.getOperatorList();
  const OPS = pdfjsLib.OPS;
  const state = {
    transform: [...viewport.transform],
    fill: '#111827',
    stroke: '#111827',
    lineWidth: 1
  };
  const stack = [];
  const graphics = [];
  const imageJobs = [];
  let pendingPath = null;

  const paintPath = (fill, stroke) => {
    if (!pendingPath) return;
    const path = pendingPath;
    const bounds = transformedPdfBounds(path.bounds, state.transform);
    pendingPath = null;
    if (bounds.width <= 0 && bounds.height <= 0) return;
    const isPageBackground = bounds.width >= viewport.width * 0.98
      && bounds.height >= viewport.height * 0.98
      && fill === 'rgb(255,255,255)';
    if (isPageBackground) return;
    const lineScale = Math.max(
      Math.hypot(state.transform[0], state.transform[1]),
      Math.hypot(state.transform[2], state.transform[3])
    );
    const strokeWidth = Math.max(0.5, state.lineWidth * (Number.isFinite(lineScale) ? lineScale : 1));
    const isLine = bounds.width <= Math.max(2, strokeWidth * 2)
      || bounds.height <= Math.max(2, strokeWidth * 2);
    if (fill && !path.simple && !isLine) return;
    if (isLine && stroke) {
      graphics.push({ type: 'line', ...bounds, stroke: state.stroke, strokeWidth });
    } else {
      graphics.push({
        type: 'rectangle',
        ...bounds,
        fill: fill ? state.fill : 'none',
        stroke: stroke ? state.stroke : 'none',
        strokeWidth: stroke ? strokeWidth : 0
      });
    }
  };

  for (let index = 0; index < operatorList.fnArray.length; index += 1) {
    const operation = operatorList.fnArray[index];
    const args = operatorList.argsArray[index] || [];
    if (operation === OPS.save) {
      stack.push({ ...state, transform: [...state.transform] });
    } else if (operation === OPS.restore) {
      const restored = stack.pop();
      if (restored) Object.assign(state, restored);
      pendingPath = null;
    } else if (operation === OPS.transform) {
      state.transform = pdfjsLib.Util.transform(state.transform, args);
    } else if (operation === OPS.setFillRGBColor) {
      state.fill = pdfRgb(args);
    } else if (operation === OPS.setStrokeRGBColor) {
      state.stroke = pdfRgb(args);
    } else if (operation === OPS.setLineWidth) {
      state.lineWidth = Math.max(0, Number(args[0]) || 0);
    } else if (operation === OPS.constructPath) {
      const pathOperations = args[0] ? Array.from(args[0]) : [];
      const moveCount = pathOperations.filter(pathOperation => pathOperation === OPS.moveTo).length;
      pendingPath = args[2] && args[2].length >= 4
        ? {
          bounds: Array.from(args[2]),
          simple: pathOperations.length <= 6 && moveCount <= 1
        }
        : null;
    } else if (operation === OPS.stroke || operation === OPS.closeStroke) {
      paintPath(false, true);
    } else if (operation === OPS.fill || operation === OPS.eoFill) {
      paintPath(true, false);
    } else if (operation === OPS.fillStroke || operation === OPS.eoFillStroke
      || operation === OPS.closeFillStroke || operation === OPS.closeEOFillStroke) {
      paintPath(true, true);
    } else if (operation === OPS.endPath || operation === OPS.clip || operation === OPS.eoClip) {
      pendingPath = null;
    } else if (operation === OPS.paintImageXObject || operation === OPS.paintInlineImageXObject) {
      const bounds = transformedPdfBounds([0, 1, 0, 1], state.transform);
      const objectName = args[0];
      if (typeof objectName === 'string' && bounds.width > 1 && bounds.height > 1) {
        imageJobs.push(pdfImageDataUrl(page, objectName)
          .then(dataUrl => {
            if (dataUrl) graphics.push({ type: 'image', ...bounds, dataUrl });
          })
          .catch(error => console.warn('[PDF Import] Embedded image could not be extracted.', error)));
      }
    }
  }
  await Promise.all(imageJobs);
  return graphics.filter(graphic =>
    graphic.x + graphic.width >= 0
    && graphic.y + graphic.height >= 0
    && graphic.x <= viewport.width
    && graphic.y <= viewport.height);
}

async function extractEditableSvgLayout(page, viewport) {
  if (!window.pdfjsLib?.SVGGraphics) return null;
  const operatorList = await page.getOperatorList();
  const svgGraphics = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs, true);
  svgGraphics.embedFonts = true;
  const svg = await svgGraphics.getSVG(operatorList, viewport);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${viewport.width}px;height:${viewport.height}px;visibility:hidden;pointer-events:none;`;
  svg.style.width = `${viewport.width}px`;
  svg.style.height = `${viewport.height}px`;
  host.appendChild(svg);
  document.body.appendChild(host);

  try {
    const rootBounds = svg.getBoundingClientRect();
    const tspans = [...svg.querySelectorAll('tspan')];
    const textNodes = tspans.length > 0
      ? tspans
      : [...svg.querySelectorAll('text')];
    const items = textNodes.flatMap((node) => {
      const text = node.textContent?.trim() || '';
      if (!text) return [];
      const bounds = svgElementBounds(node, rootBounds);
      if (bounds.width <= 0 || bounds.height <= 0) return [];
      const style = getComputedStyle(node);
      const fontSize = Math.max(5, parseFloat(style.fontSize) || bounds.height * 0.8);
      const anchor = style.textAnchor || node.getAttribute('text-anchor') || 'start';
      return [{
        text,
        ...bounds,
        fontSize,
        fontFamily: `${style.fontFamily || "'Noto Sans Devanagari'"}, 'Noto Sans Devanagari', Arial, sans-serif`,
        fontWeight: Number.parseInt(style.fontWeight, 10) || (/bold/i.test(style.fontWeight) ? 700 : 400),
        color: svgPaint(style.fill || node.getAttribute('fill'), '#111827'),
        textAlign: anchor === 'middle' ? 'center' : (anchor === 'end' ? 'right' : 'left')
      }];
    });

    const graphics = [...svg.querySelectorAll('rect, line, path, image')].flatMap((node) => {
      const tag = node.tagName.toLowerCase();
      const bounds = svgElementBounds(node, rootBounds);
      if (bounds.width <= 0 && bounds.height <= 0) return [];
      const style = getComputedStyle(node);
      const fill = svgPaint(style.fill || node.getAttribute('fill'), 'none');
      const stroke = svgPaint(style.stroke || node.getAttribute('stroke'), 'none');
      const strokeWidth = Math.max(0, parseFloat(style.strokeWidth || node.getAttribute('stroke-width')) || 0);

      if (tag === 'image') {
        const dataUrl = node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
        return dataUrl.startsWith('data:image/') && dataUrl.length <= 96_000
          ? [{ type: 'image', ...bounds, dataUrl }]
          : [];
      }
      if (tag === 'line') return [{ type: 'line', ...bounds, stroke, strokeWidth }];
      if (tag === 'path') {
        const path = node.getAttribute('d') || '';
        if (/[CQA]/i.test(path)) return [];
        const closed = /z\s*$/i.test(path);
        if (!closed && stroke !== 'none') return [{ type: 'line', ...bounds, stroke, strokeWidth }];
        if (closed && bounds.width > 1 && bounds.height > 1) {
          return [{ type: 'rectangle', ...bounds, fill, stroke, strokeWidth }];
        }
        return [];
      }
      const isPageBackground = bounds.width >= viewport.width * 0.98
        && bounds.height >= viewport.height * 0.98
        && (fill === 'rgb(255, 255, 255)' || fill === '#ffffff' || fill === 'white');
      if (isPageBackground) return [];
      return [{ type: 'rectangle', ...bounds, fill, stroke, strokeWidth }];
    });
    return { items, graphics };
  } finally {
    host.remove();
  }
}

function enrichPdfTextStyles(items, svgItems) {
  if (!Array.isArray(svgItems) || svgItems.length === 0) return items;
  return items.map((item) => {
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    let nearest = null;
    let nearestScore = Number.POSITIVE_INFINITY;
    for (const candidate of svgItems) {
      const candidateCenterX = candidate.x + candidate.width / 2;
      const candidateCenterY = candidate.y + candidate.height / 2;
      const yDistance = Math.abs(candidateCenterY - centerY);
      if (yDistance > Math.max(12, item.height * 1.5)) continue;
      const overlapsX = candidate.x <= item.x + item.width && candidate.x + candidate.width >= item.x;
      const xDistance = Math.abs(candidateCenterX - centerX);
      const score = yDistance * 8 + xDistance + (overlapsX ? 0 : 200);
      if (score < nearestScore) {
        nearest = candidate;
        nearestScore = score;
      }
    }
    if (!nearest || nearestScore > 500) return item;
    return {
      ...item,
      color: nearest.color || item.color,
      fontWeight: Math.max(Number(item.fontWeight) || 400, Number(nearest.fontWeight) || 400)
    };
  });
}

function mergePdfTextRuns(items) {
  const lines = [];
  const sorted = [...items].sort((left, right) =>
    (left.y + left.height / 2) - (right.y + right.height / 2) || left.x - right.x);

  for (const item of sorted) {
    const centerY = item.y + item.height / 2;
    let line = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of lines) {
      const distance = Math.abs(candidate.centerY - centerY);
      const tolerance = Math.max(3, Math.min(candidate.fontSize, item.fontSize || item.height) * 0.42);
      if (distance <= tolerance && distance < bestDistance) {
        line = candidate;
        bestDistance = distance;
      }
    }
    if (!line) {
      line = {
        centerY,
        fontSize: item.fontSize || item.height,
        items: []
      };
      lines.push(line);
    }
    line.items.push(item);
    line.centerY = (line.centerY * (line.items.length - 1) + centerY) / line.items.length;
  }

  return lines
    .sort((left, right) => left.centerY - right.centerY)
    .flatMap((line) => {
      const lineItems = line.items.sort((left, right) => left.x - right.x);
      const merged = [];
      for (const item of lineItems) {
        const current = merged[merged.length - 1];
        if (!current) {
          merged.push({ ...item });
          continue;
        }
        const currentEnd = current.x + current.width;
        const gap = item.x - currentEnd;
        const fontSize = Math.max(5, current.fontSize || item.fontSize || 10);
        const similarSize = Math.abs((current.fontSize || fontSize) - (item.fontSize || fontSize)) <= Math.max(2, fontSize * 0.3);
        const similarColor = !current.color || !item.color || current.color === item.color;
        if (gap >= -fontSize * 0.35 && gap <= Math.max(12, fontSize * 1.5) && similarSize && similarColor) {
          const needsSpace = gap > Math.max(1, fontSize * 0.25)
            && !/\s$/.test(current.text)
            && !/^\s/.test(item.text);
          current.text += `${needsSpace ? ' ' : ''}${item.text}`;
          current.width = Math.max(currentEnd, item.x + item.width) - current.x;
          current.height = Math.max(current.height, item.height);
          current.y = Math.min(current.y, item.y);
        } else {
          merged.push({ ...item });
        }
      }
      return merged;
    });
}


async function fitPdfTextMetrics(items, pageWidth, preserveSourceWidth = false) {
  if (document.fonts?.ready) await document.fonts.ready.catch(() => { });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return items;
  return items.map(item => {
    let fontSize = Math.max(5, Number(item.fontSize) || Number(item.height) || 10);
    const fontFamily = item.fontFamily || "'Noto Sans Devanagari', Arial, sans-serif";
    const fontWeight = Number(item.fontWeight) || 400;
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    let measuredWidth = context.measureText(String(item.text || '')).width + Math.max(4, fontSize * 0.25);
    const availableWidth = Math.max(2, pageWidth - Number(item.x || 0));
    const sourceWidth = Math.min(availableWidth, Math.max(2, Number(item.width) || 2));
    if (preserveSourceWidth && measuredWidth > sourceWidth) {
      fontSize = Math.max(5, fontSize * (sourceWidth / measuredWidth));
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      measuredWidth = context.measureText(String(item.text || '')).width + Math.max(3, fontSize * 0.2);
    }
    return {
      ...item,
      fontSize,
      width: preserveSourceWidth
        ? Math.min(availableWidth, Math.max(sourceWidth, measuredWidth))
        : Math.min(availableWidth, Math.max(sourceWidth, measuredWidth)),
      height: Math.max(Number(item.height) || 0, fontSize * 1.35)
    };
  });
}


async function extractPdfLayout(file, onProgress) {
  if (!window.pdfjsLib) throw new Error('PDF renderer is not available.');
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjsLib.getDocument({ data, fontExtraProperties: true });
  const pdf = await task.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 96 / 72 });
  const content = await page.getTextContent();
  const styles = content.styles || {};
  const fallbackItems = content.items.flatMap(item => {
    if (!item.str?.trim() || !item.transform) return [];
    // NFC-normalize so Devanagari characters composed differently in the PDF
    // (precomposed vs decomposed matras) are stored as canonical Unicode.
    const text = item.str.normalize('NFC').trim();
    if (!text) return [];
    const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const fontHeight = Math.max(5, Math.hypot(transform[2], transform[3]));
    const style = styles[item.fontName] || {};
    // item.width is 0 for many Devanagari glyphs; fall back to estimated width
    // based on character count × ~60% of font height (rough CJK/Devanagari metric).
    const rawWidth = Number(item.width || 0) * viewport.scale;
    const estimatedWidth = text.length * fontHeight * 0.6;
    const width = Math.max(2, rawWidth > 2 ? rawWidth : estimatedWidth);
    return [{
      text,
      x: Math.max(0, transform[4]),
      y: Math.max(0, transform[5] - fontHeight),
      width,
      height: fontHeight * 1.18,
      fontSize: fontHeight,
      fontFamily: style.fontFamily || "'Noto Sans Devanagari', Arial, sans-serif",
      fontWeight: /bold/i.test(style.fontFamily || '') ? 700 : 400
    }];
  });
  let editableSvg = null;
  try {
    editableSvg = await extractEditableSvgLayout(page, viewport);
  } catch (error) {
    console.warn('[PDF Import] Editable SVG extraction unavailable; using text geometry fallback.', error);
  }
  let operatorGraphics = [];
  try {
    operatorGraphics = await extractOperatorGraphics(page, viewport);
  } catch (error) {
    console.warn('[PDF Import] PDF vector extraction unavailable.', error);
  }
  const styledItems = enrichPdfTextStyles(fallbackItems, editableSvg?.items || []);
  let extractedItems = mergePdfTextRuns(styledItems);
  let extractionMode = 'unicode';

  if (extractedItems.length === 0) {
    if (onProgress) onProgress('Scanned PDF चे visual fallback वापरत आहे...');
    extractedItems = [];
    extractionMode = 'image';
  }

  const items = await fitPdfTextMetrics(
    enrichPdfTextStyles(extractedItems, editableSvg?.items || []),
    viewport.width,
    false
  );

  const graphics = operatorGraphics.length > 0 ? operatorGraphics : (editableSvg?.graphics || []);
  if (items.length === 0 && !graphics.some(g => g.type === 'image')) {
    if (onProgress) onProgress('Scanned PDF चे preview तयार होत आहे...');
    const dataUrl = await renderPdfPageImage(page, viewport);
    if (dataUrl) {
      graphics.unshift({
        type: 'image',
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
        dataUrl,
        locked: false
      });
    }
  }

  return {
    pageWidth: viewport.width,
    pageHeight: viewport.height,
    widthMm: viewport.width / (96 / 25.4),
    heightMm: viewport.height / (96 / 25.4),
    pageCount: pdf.numPages,
    extractionMode,
    items,
    graphics
  };
}

async function handleImportPdfSelected(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.pdf') || file.size > 25 * 1024 * 1024) {
    setImportError('कृपया 25 MB पर्यंतची वैध PDF निवडा.');
    input.value = '';
    return;
  }
  reportImportState.pdfFile = file;
  reportImportState.pdfLayout = null;
  autofillImportIdentity(file);
  const rptLabel = document.getElementById('importRptLabel');
  const label = document.getElementById('importPdfLabel');
  if (rptLabel && !reportImportState.rptFile) rptLabel.innerHTML = `<strong>⏳ ${escapeHtml(file.name)}</strong> चे layout वाचत आहे...`;
  if (label) label.textContent = `⏳ ${file.name} चे layout वाचत आहे...`;
  showImportAnalysis('PDF detected\nAnalyzing pages and reconstructing layout...');
  try {
    reportImportState.pdfLayout = await extractPdfLayout(file, progress => {
      if (label) label.textContent = `⏳ ${file.name} — ${progress}`;
    });
    const layout = reportImportState.pdfLayout;
    if (label) {
      const mode = layout.extractionMode === 'image' ? 'Image fallback' : 'PDF Unicode';
      label.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB) — ${layout.items.length} editable text lines (${mode}), ${(layout.graphics || []).length} visual objects`;
    }
    const isLandscape = layout.pageWidth > layout.pageHeight;
    const orient = isLandscape ? 'landscape' : 'portrait';
    const orientEl = document.getElementById('importOrientation');
    if (orientEl) orientEl.value = orient;

    const w = layout.widthMm || (layout.pageWidth / 3.7795);
    const h = layout.heightMm || (layout.pageHeight / 3.7795);
    const maxDim = Math.max(w, h);
    let detectedPaper = 'Custom';
    if (Math.abs(maxDim - 420) < 30) {
      detectedPaper = 'A3';
    } else if (Math.abs(maxDim - 297) < 25) {
      detectedPaper = 'A4';
    } else if (Math.abs(maxDim - 356) < 25) {
      detectedPaper = 'Legal';
    } else if (Math.abs(maxDim - 279) < 25) {
      detectedPaper = 'Letter';
    }
    const paperEl = document.getElementById('importPaperSize');
    if (paperEl) paperEl.value = detectedPaper;

    updateImportDetectedCard(file, 'pdf', { paperSize: detectedPaper, orientation: orient });
    showImportAnalysis(reportImportState.rptFile
      ? 'RPT हा मुख्य source राहील; PDF reference म्हणून जोडली आहे.'
      : 'PDF detected — Layout वाचून पूर्ण झाले. अहवाल तयार करण्यास सज्ज.');
    clearCreateReportError();
  } catch (error) {
    reportImportState.pdfFile = null;
    if (label) label.textContent = 'PDF मधील editable layout तयार करता आला नाही.';
    if (rptLabel && !reportImportState.rptFile) rptLabel.innerHTML = '<strong>.rpt किंवा .pdf फाइल निवडा</strong> किंवा येथे drag & drop करा';
    setImportError(error.message || 'PDF layout could not be read.');
  }
}

// ---------------------------------------------------------------------------
// applyPdfLayoutToDesign  — called after extractPdfLayout() returns a layout.
// Maps the server-built ClassicReportDefinition directly into reportDef so
// there is ONE canonical PDF→elements conversion path (buildPdfReportDefinition
// on the server; this function makes the client reflect it after blueprint upload).
// ---------------------------------------------------------------------------
async function applyPdfLayoutToDesign(layout, file) {
  if (!layout || !file || !reportDef) throw new Error('PDF layout is not ready.');
  const previous = reportDef;
  const settings = readReportSettingsFromDefinition();
  const reportId = String(currentReportId || previous.reportCode || previous.reportId || '').trim();
  if (!/^[A-Za-z][A-Za-z0-9_]{2,99}$/.test(reportId)) {
    throw new Error('Save this report with a valid Report ID before attaching a PDF.');
  }

  const form = new FormData();
  form.append('reportId', reportId);
  form.append('reportName', previous.reportName || reportId);
  form.append('moduleId', String(settings.moduleId || ''));
  form.append('moduleName', settings.moduleName || '');
  form.append('dataProviderCode', settings.dataProviderCode || 'UnassignedReportDataProvider');
  form.append('dataSourceCode', settings.dataSourceCode || 'UNASSIGNED');
  form.append('paperSize', previous.paperSize || 'Custom');
  form.append('orientation', previous.orientation || 'portrait');
  form.append('currentTenantId', String(settings.currentTenantId || ''));
  form.append('pdfFile', file, file.name);
  form.append('pdfLayout', JSON.stringify(layout));

  const response = await importFetch('/api/import-report', { method: 'POST', body: form }, 45_000);
  const imported = await response.json();
  if (!response.ok || !imported.success || !imported.definition) {
    throw new Error(imported.error || 'PDF layout could not be imported.');
  }

  const definition = imported.definition;
  definition.reportId = reportId;
  definition.reportCode = previous.reportCode || reportId;
  definition.reportName = previous.reportName || definition.reportName;
  definition.layoutVersion = previous.layoutVersion || definition.layoutVersion || 0;
  definition.sourceAssets = {
    ...(previous.sourceAssets || {}),
    ...(definition.sourceAssets || {})
  };
  definition.ntis = {
    ...(definition.ntis || {}),
    ...(previous.ntis || {}),
    moduleId: settings.moduleId ?? definition.ntis?.moduleId ?? null,
    moduleName: settings.moduleName || definition.ntis?.moduleName || '',
    dataProviderCode: settings.dataProviderCode || definition.ntis?.dataProviderCode || 'UnassignedReportDataProvider',
    dataSourceCode: settings.dataSourceCode || definition.ntis?.dataSourceCode || 'UNASSIGNED',
    parameters: settings.parameters || definition.ntis?.parameters || []
  };

  reportDef = definition;
  activeSectionId = reportDef.sections?.[0]?.id || 'details';
  selectedElementIds = [];
  removeInvalidSectionOverflowLines(reportDef);
  cacheReportDesign(reportDef);
  updatePageDimensions();
  renderCanvas();
  updateSectionsList();
  clampAllElementsToPage();
  pushHistory();
  return imported.analysis;
}

function syncImportDataSource() {
  const provider = document.getElementById('importProvider')?.value.trim() || '';
  const dataSource = document.getElementById('importDataSourceCode');
  if (!provider || !dataSource) return;
  const cleanProvider = provider.replace(/DataProvider$/i, '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  const match = reportImportState.dataSources.find(source => {
    return [source.executionReportCode, source.code, source.name].some(value =>
      String(value || '').replace(/DataProvider$/i, '').replace(/[^a-z0-9]/gi, '').toUpperCase()
      === cleanProvider);
  });
  dataSource.value = match?.code || provider.replace(/DataProvider$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[^a-z0-9_]/gi, '_').toUpperCase();
}

async function submitCreateNewReport() {
  clearCreateReportError();
  const file = reportImportState.rptFile;
  if (!file) {
    setImportError('कृपया मुख्य .rpt फाइल निवडा.');
    return;
  }

  let reportName = document.getElementById('createReportName')?.value.trim() || '';
  if (!reportName) {
    reportName = sourceBaseName(file.name).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    const nameEl = document.getElementById('createReportName');
    if (nameEl) nameEl.value = reportName;
  }

  let reportId = document.getElementById('importReportId')?.value.trim() || '';
  if (!reportId) {
    reportId = suggestedReportId(file.name);
    const idEl = document.getElementById('importReportId');
    if (idEl) idEl.value = reportId;
  }

  const moduleSelect = document.getElementById('importModuleId');
  let moduleId = moduleSelect?.value || '';
  if (!moduleId && moduleSelect && moduleSelect.options.length > 1) {
    moduleId = moduleSelect.options[1].value;
    moduleSelect.value = moduleId;
  }

  let dataProviderCode = document.getElementById('importProvider')?.value.trim() || '';
  if (!dataProviderCode) {
    dataProviderCode = 'PropertyTaxReportDataProvider';
    const provEl = document.getElementById('importProvider');
    if (provEl) provEl.value = dataProviderCode;
  }

  let dataSourceCode = document.getElementById('importDataSourceCode')?.value.trim() || '';
  if (!dataSourceCode) {
    dataSourceCode = 'PROPERTY_TAX';
    const dsEl = document.getElementById('importDataSourceCode');
    if (dsEl) dsEl.value = dataSourceCode;
  }

  if (!/^[A-Za-z][A-Za-z0-9_]{2,99}$/.test(reportId)) {
    setImportError('Report ID letter ने सुरू होऊन फक्त letters, numbers आणि underscore असावा.', 'importReportId');
    return;
  }
  if (!reportName) {
    setImportError('अहवालाचे नाव आवश्यक आहे.', 'createReportName');
    return;
  }
  if (reportImportState.pdfFile && !reportImportState.pdfLayout) {
    setImportError('PDF layout अजून तयार झालेले नाही. PDF पुन्हा निवडा.');
    return;
  }

  const button = document.getElementById('btnImportReport');
  button.disabled = true;
  button.textContent = '⏳ अहवाल तयार होत आहे...';
  try {
    const form = new FormData();
    form.append('reportId', reportId);
    form.append('reportName', reportName);
    form.append('moduleId', moduleId);
    form.append('moduleName', moduleSelect?.selectedOptions?.[0]?.textContent || '');
    form.append('dataProviderCode', dataProviderCode);
    form.append('dataSourceCode', dataSourceCode);
    form.append('paperSize', document.getElementById('importPaperSize')?.value || 'A4');
    form.append('orientation', document.getElementById('importOrientation')?.value || 'portrait');
    form.append('currentTenantId', String(reportImportState.options.currentTenantId || ''));
    if (reportImportState.rptFile) form.append('rptFile', reportImportState.rptFile, reportImportState.rptFile.name);
    if (reportImportState.pdfFile) form.append('pdfFile', reportImportState.pdfFile, reportImportState.pdfFile.name);
    if (reportImportState.pdfLayout) form.append('pdfLayout', JSON.stringify(reportImportState.pdfLayout));
    reportImportState.subreports.forEach(file => form.append('subreports', file, file.name));

    showImportAnalysis(reportImportState.rptFile
      ? 'RPT/PDF sourceचे layout तयार करत आहे...'
      : 'PDFमधून editable dynamic layout तयार करत आहे...');
    const importResponse = await importFetch(
      '/api/import-report',
      { method: 'POST', body: form },
      45_000
    );
    const imported = await importResponse.json();
    if (!importResponse.ok || !imported.success || !imported.definition) {
      throw new Error(imported.error || 'Report source could not be imported.');
    }

    showImportAnalysis('Layout तयार झाले. Tenant report template publish करत आहे...');
    const saveResponse = await importFetch(
      `/api/report-design?reportId=${encodeURIComponent(reportId)}&publish=true`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(imported.definition)
      },
      45_000
    );
    const saved = await saveResponse.json();
    if (!saveResponse.ok || !saved.success) {
      throw new Error(saved.error || 'Imported layout could not be saved.');
    }

    closeCreateReportModal();
    showToast(`✓ ${reportName} तयार व publish झाला.`);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('reportId', reportId);
    if (imported.hasReferencePdf) nextUrl.searchParams.set('blueprint', '1');
    else nextUrl.searchParams.delete('blueprint');
    window.location.assign(nextUrl.toString());
  } catch (error) {
    setImportError(error.message || 'अहवाल तयार करता आला नाही.');
  } finally {
    button.disabled = false;
    button.innerHTML = '&#128640; अहवाल तयार करा (Generate)';
  }
}
function readReportSettingsFromDefinition() {
  const ntis = reportDef?.ntis || {};
  const parameters = Array.isArray(ntis.parameters)
    ? ntis.parameters
    : PARAMETER_FIELDS.map((parameter, index) => ({
      key: parameter.key || parameter.name || '',
      label: parameter.label || parameter.name || '',
      type: parameter.type || parameter.dataType || 'text',
      isRequired: Boolean(parameter.isRequired),
      sortOrder: Number.isFinite(Number(parameter.sortOrder)) ? Number(parameter.sortOrder) : index,
      cascadeFromKey: parameter.cascadeFromKey || null,
      isActive: parameter.isActive !== false
    }));
  return {
    templateId: ntis.templateId,
    reportDefinitionId: ntis.reportDefinitionId,
    reportCode: reportDef?.reportCode || currentReportId || '',
    reportName: reportDef?.reportName || 'Untitled Report',
    moduleId: ntis.moduleId ?? null,
    moduleName: ntis.moduleName || '',
    tenantId: ntis.tenantId ?? null,
    tenantScope: ntis.tenantScope || 'CurrentTenant',
    currentTenantId: ntis.currentTenantId || reportSettingsOptions.currentTenantId,
    isActive: ntis.isActive !== false,
    dataSourceCode: ntis.dataSourceCode || 'UNASSIGNED',
    dataProviderCode: ntis.dataProviderCode || 'UnassignedReportDataProvider',
    parameters
  };
}
function applyReportSettings(settings) {
  if (!reportDef || !settings) return;
  reportDef.reportName = settings.reportName || reportDef.reportName;
  const sel = document.getElementById('selReportId');
  if (sel && sel.selectedOptions?.[0]) {
    sel.selectedOptions[0].textContent = reportDef.reportName;
  }
  reportDef.ntis = {
    ...(reportDef.ntis || {}),
    ...(settings.templateId ? { templateId: settings.templateId } : {}),
    ...(settings.reportDefinitionId ? { reportDefinitionId: settings.reportDefinitionId } : {}),
    moduleId: settings.moduleId ?? null,
    moduleName: settings.moduleName || document.getElementById('settingsModuleId')?.selectedOptions?.[0]?.textContent || '',
    tenantId: settings.tenantId ?? null,
    tenantScope: settings.tenantScope || 'CurrentTenant',
    currentTenantId: settings.currentTenantId || reportSettingsOptions.currentTenantId,
    isActive: settings.isActive !== false,
    dataSourceCode: settings.dataSourceCode || 'UNASSIGNED',
    dataProviderCode: settings.dataProviderCode || 'UnassignedReportDataProvider',
    parameters: Array.isArray(settings.parameters) ? settings.parameters : []
  };
  PARAMETER_FIELDS = reportDef.ntis.parameters.map((parameter, index) => ({
    name: parameter.key,
    key: parameter.key,
    label: parameter.label ? `${parameter.label} (${parameter.key})` : parameter.key,
    dataType: parameter.type || 'text',
    type: parameter.type || 'text',
    isRequired: Boolean(parameter.isRequired),
    sortOrder: Number.isFinite(Number(parameter.sortOrder)) ? Number(parameter.sortOrder) : index,
    cascadeFromKey: parameter.cascadeFromKey || null,
    isActive: parameter.isActive !== false
  }));
  populateFieldExplorer();
  cacheReportDesign(reportDef);
}
function updateTenantScopeHint() {
  const scope = document.getElementById('settingsTenantScope')?.value || 'CurrentTenant';
  const hint = document.getElementById('settingsTenantHint');
  if (!hint) return;
  hint.textContent = scope === 'Global'
    ? 'This report will be available to all tenants.'
    : `This report is limited to tenant ${reportSettingsOptions.currentTenantId || ''}.`;
}
function addReportParameterRow(parameter = {}) {
  const body = document.getElementById('settingsParametersBody');
  if (!body) return;
  const row = document.createElement('tr');
  row.innerHTML = `
        <td><input class="report-settings-input" data-param="key" placeholder="zoneId"></td>
        <td><input class="report-settings-input" data-param="label" placeholder="Zone"></td>
        <td><select class="report-settings-input" data-param="type"><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="select">Select</option><option value="boolean">Boolean</option></select></td>
        <td><input class="report-settings-input" data-param="cascade" placeholder="Parent key"></td>
        <td style="text-align:center;"><input type="checkbox" data-param="required"></td>
        <td><input class="report-settings-input" data-param="order" type="number" min="0" step="1"></td>
        <td style="text-align:center;"><button type="button" class="cr-btn" title="Remove parameter" style="padding:1px 6px; color:#b91c1c;" onclick="this.closest('tr').remove()">&#10005;</button></td>`;
  row.querySelector('[data-param="key"]').value = parameter.key || parameter.name || '';
  row.querySelector('[data-param="label"]').value = parameter.label || '';
  row.querySelector('[data-param="type"]').value = parameter.type || parameter.dataType || 'text';
  row.querySelector('[data-param="cascade"]').value = parameter.cascadeFromKey || '';
  row.querySelector('[data-param="required"]').checked = Boolean(parameter.isRequired);
  row.querySelector('[data-param="order"]').value = Number.isFinite(Number(parameter.sortOrder))
    ? String(parameter.sortOrder)
    : String(body.children.length);
  body.appendChild(row);
}
function populateReportSettings(settings) {
  document.getElementById('settingsReportName').value = settings.reportName || '';
  document.getElementById('settingsReportCode').value = settings.reportCode || reportDef?.reportCode || '';
  document.getElementById('settingsTenantScope').value = settings.tenantScope || 'CurrentTenant';
  document.getElementById('settingsDataSourceCode').value = settings.dataSourceCode || 'UNASSIGNED';
  document.getElementById('settingsDataProviderCode').value = settings.dataProviderCode || 'UnassignedReportDataProvider';
  document.getElementById('settingsIsActive').checked = settings.isActive !== false;

  const moduleSelect = document.getElementById('settingsModuleId');
  moduleSelect.replaceChildren();
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '-- Select Module --';
  moduleSelect.appendChild(emptyOption);
  (reportSettingsOptions.modules || []).forEach(module => {
    const option = document.createElement('option');
    option.value = String(module.id);
    option.textContent = module.name;
    moduleSelect.appendChild(option);
  });
  moduleSelect.value = settings.moduleId == null ? '' : String(settings.moduleId);

  const providerList = document.getElementById('settingsProviderCodes');
  providerList.replaceChildren();
  (reportSettingsOptions.dataProviderCodes || []).forEach(code => {
    const option = document.createElement('option');
    option.value = code;
    providerList.appendChild(option);
  });

  document.getElementById('settingsParametersBody').replaceChildren();
  (settings.parameters || []).forEach(addReportParameterRow);
  updateTenantScopeHint();
}
async function openReportSettings() {
  const modal = document.getElementById('reportSettingsModal');
  const error = document.getElementById('reportSettingsError');
  const saveButton = document.getElementById('btnSaveReportSettings');
  if (!modal || !reportDef) return;
  modal.classList.add('show');
  error.textContent = 'Loading settings...';
  saveButton.disabled = true;
  try {
    const response = await fetch(`/api/report-settings?reportId=${encodeURIComponent(currentReportId || reportDef.reportCode || '')}&_t=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Report settings could not be loaded.');
    reportSettingsOptions = data.options || reportSettingsOptions;
    const settings = data.settings || readReportSettingsFromDefinition();
    if (!settings.currentTenantId) settings.currentTenantId = reportSettingsOptions.currentTenantId;
    populateReportSettings(settings);
    error.textContent = '';
  } catch (settingsError) {
    populateReportSettings(readReportSettingsFromDefinition());
    error.textContent = settingsError.message || 'Report settings could not be loaded.';
  } finally {
    saveButton.disabled = false;
  }
}
function closeReportSettings() {
  document.getElementById('reportSettingsModal')?.classList.remove('show');
  document.getElementById('btnReportSettings')?.focus();
}
function handleReportSettingsOverlay(event) {
  if (event.target.id === 'reportSettingsModal') closeReportSettings();
}
function collectReportParameters() {
  return [...document.querySelectorAll('#settingsParametersBody tr')].map((row, index) => ({
    key: row.querySelector('[data-param="key"]').value.trim(),
    label: row.querySelector('[data-param="label"]').value.trim(),
    type: row.querySelector('[data-param="type"]').value,
    cascadeFromKey: row.querySelector('[data-param="cascade"]').value.trim() || null,
    isRequired: row.querySelector('[data-param="required"]').checked,
    sortOrder: Number(row.querySelector('[data-param="order"]').value || index),
    isActive: true
  }));
}
async function saveReportSettings() {
  const error = document.getElementById('reportSettingsError');
  const saveButton = document.getElementById('btnSaveReportSettings');
  const reportName = document.getElementById('settingsReportName').value.trim();
  const moduleIdValue = document.getElementById('settingsModuleId').value;
  const dataSourceCode = document.getElementById('settingsDataSourceCode').value.trim();
  const dataProviderCode = document.getElementById('settingsDataProviderCode').value.trim();
  const parameters = collectReportParameters();
  const duplicateKey = parameters.find((parameter, index) =>
    parameters.findIndex(other => other.key.toLowerCase() === parameter.key.toLowerCase()) !== index);
  if (!reportName || (!moduleIdValue && reportSettingsOptions.modules.length > 0) || !dataSourceCode || !dataProviderCode) {
    error.textContent = 'Report name, module, data source and data provider are required.';
    return;
  }
  if (parameters.some(parameter => !parameter.key || !parameter.label)) {
    error.textContent = 'Every parameter requires both a key and a label.';
    return;
  }
  if (duplicateKey) {
    error.textContent = `Parameter '${duplicateKey.key}' is configured more than once.`;
    return;
  }
  const tenantScope = document.getElementById('settingsTenantScope').value;
  const settings = {
    ...readReportSettingsFromDefinition(),
    reportName,
    moduleId: moduleIdValue ? Number(moduleIdValue) : null,
    moduleName: document.getElementById('settingsModuleId').selectedOptions[0]?.textContent || '',
    tenantScope,
    tenantId: tenantScope === 'CurrentTenant' ? reportSettingsOptions.currentTenantId : null,
    currentTenantId: reportSettingsOptions.currentTenantId,
    isActive: document.getElementById('settingsIsActive').checked,
    dataSourceCode,
    dataProviderCode,
    parameters
  };
  saveButton.disabled = true;
  error.textContent = 'Saving settings...';
  try {
    if (reportDef.ntis?.templateId) {
      const response = await fetch('/api/report-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ templateId: reportDef.ntis.templateId, settings })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Report settings could not be saved.');
      applyReportSettings(result.settings);
    } else {
      applyReportSettings(settings);
    }
    closeReportSettings();
    saveDesign(false);
    showToast(`✓ अहवालाचे नाव सेव्ह झाले: ${reportName}`);
  } catch (settingsError) {
    error.textContent = settingsError.message || 'Report settings could not be saved.';
  } finally {
    saveButton.disabled = false;
  }
}
function initializeNewReport(reportName) {
  const slug = reportName
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 45)
    .toUpperCase() || 'REPORT';
  const reportCode = `CUSTOM_${slug}_${Date.now().toString(36).toUpperCase()}`;

  currentReportId = reportCode;
  reportDef = createBlankReportDefinition(reportName, reportCode);
  selectedElementIds = [];
  activeSectionId = 'details';
  DB_FIELDS = [];
  FORMULA_FIELDS = [];
  SUMMARY_FIELDS = [];
  PARAMETER_FIELDS = [];
  historyStack.splice(0, historyStack.length);
  historyIndex = -1;

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set('reportId', currentReportId);
  window.history.replaceState({}, '', nextUrl.toString());
  populateFieldExplorer();
  renderCanvas();
  updateSectionsList();
  pushHistory();
  initReportSelector();
  document.getElementById('statusLastSave').textContent = 'New report - not saved';
  showToast('Blank report created. Configure settings, design it, then click Save Layout.');
  setTimeout(() => openReportSettings(), 0);
}
window.addEventListener('DOMContentLoaded', async () => {
  await initDesignerApp();
});

let isInitializingDesigner = false;
async function initDesignerApp(options) {
  if (isInitializingDesigner) return;
  isInitializingDesigner = true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (options?.reportId) {
      currentReportId = options.reportId;
    } else if (!currentReportId) {
      currentReportId = params.get('reportId') || params.get('report') || '';
    }

    const cachedDesign = currentReportId ? readCachedReportDesign() : null;
    reportDef = cachedDesign || createBlankReportDefinition('New Report', 'CUSTOM_REPORT');
    activeSectionId = reportDef.sections.some(section => section.id === 'details')
      ? 'details'
      : reportDef.sections[0]?.id;
    selectedElementIds = [];
    populateFieldExplorer();
    buildPageColorPalette();
    buildTableGrid();
    renderCanvas();
    updateSectionsList();
    if (currentReportId && !cachedDesign) setDesignerCanvasState('loading', 'Loading saved report design...');
    else {
      setDesignerCanvasState('idle');
      const lastSaveEl = document.getElementById('statusLastSave');
      if (lastSaveEl) lastSaveEl.textContent = currentReportId ? 'Showing saved design' : 'New report - not saved';
    }
    setupKeyboardShortcuts();
    window.removeEventListener('resize', handleWindowResize);
    window.addEventListener('resize', handleWindowResize);

    let availableReports = [];
    let reportListLoaded = false;
    try {
      const resp = await fetch('/api/reports');
      const data = await resp.json();
      if (data && Array.isArray(data.reports)) availableReports = data.reports;
      reportListLoaded = true;
    } catch (e) { }

    function findMatchingReport(idOrCode) {
      if (!idOrCode) return null;
      const raw = String(idOrCode).trim();
      const clean = raw.replace(/[^a-z0-9]/gi, '').toUpperCase();
      return availableReports.find(r => {
        const rId = String(r.id || '');
        const rName = String(r.name || '');
        const rProvider = String(r.dataProviderCode || r.dataProvider || '');
        const rIdClean = rId.replace(/[^a-z0-9]/gi, '').toUpperCase();
        const rNameClean = rName.replace(/[^a-z0-9]/gi, '').toUpperCase();
        const rProviderClean = rProvider.replace(/[^a-z0-9]/gi, '').toUpperCase();
        return r.id === raw
          || rIdClean === clean
          || rNameClean === clean
          || (clean.includes('119') && (rIdClean.includes('119') || rNameClean.includes('119') || rProviderClean.includes('119')))
          || (clean.length >= 4 && (rIdClean.includes(clean) || clean.includes(rIdClean) || rNameClean.includes(clean) || clean.includes(rNameClean) || rProviderClean.includes(clean)));
      }) || null;
    }

    const matchedReport = currentReportId ? findMatchingReport(currentReportId) : null;
    if (matchedReport && matchedReport.id !== currentReportId) {
      currentReportId = matchedReport.id;
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('reportId', currentReportId);
      window.history.replaceState({}, '', nextUrl.toString());
    }

    const reportExists = Boolean(matchedReport || (currentReportId && availableReports.some(r => r.id === currentReportId)));
    if (reportListLoaded && currentReportId && !reportExists && availableReports.length > 0) {
      const fallback119 = (String(currentReportId).includes('119'))
        ? availableReports.find(r => {
            const rIdClean = String(r.id || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
            const rNameClean = String(r.name || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
            return rIdClean.includes('119') || rNameClean.includes('119');
          })
        : null;
      if (fallback119) {
        currentReportId = fallback119.id;
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('reportId', currentReportId);
        window.history.replaceState({}, '', nextUrl.toString());
      } else {
        try {
          Object.keys(sessionStorage).forEach(k => {
            if (k.startsWith('ntis:report-designer')) sessionStorage.removeItem(k);
          });
        } catch (e) { }
        currentReportId = '';
        if (window.location.search) {
          window.history.replaceState({}, '', window.location.pathname);
        }
        reportDef = createBlankReportDefinition('New Report', 'CUSTOM_REPORT');
        activeSectionId = 'details';
        selectedElementIds = [];
        renderCanvas();
        updateSectionsList();
        setDesignerCanvasState('idle');
        const lastSaveEl = document.getElementById('statusLastSave');
        if (lastSaveEl) lastSaveEl.textContent = 'New report - not saved';
      }
    }

    if (!currentReportId && availableReports.length > 0) {
      const defaultReport = availableReports.find(r => {
        const rIdClean = String(r.id || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
        const rNameClean = String(r.name || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
        const rProviderClean = String(r.dataProviderCode || r.dataProvider || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
        return rIdClean.includes('119') || rNameClean.includes('119') || rProviderClean.includes('119');
      }) || availableReports[0];
      if (defaultReport) {
        currentReportId = defaultReport.id;
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('reportId', currentReportId);
        window.history.replaceState({}, '', nextUrl.toString());
      }
    }
    await initReportSelector(availableReports);
    if (currentReportId) {
      await loadDesign();
    }
    const shouldOpenImport = options?.openImporter || params.get('import') === '1';
    const shouldCreateNew = options?.createNewReport || params.get('newReport') === '1';
    if (shouldOpenImport) setTimeout(() => openReportImporter(), 250);
    else if (shouldCreateNew) setTimeout(() => createNewReport(), 250);
  } finally {
    isInitializingDesigner = false;
  }
}
window.initDesignerApp = initDesignerApp;

if (typeof document !== 'undefined' && document.readyState !== 'loading' && document.getElementById('canvasScrollArea')) {
  setTimeout(() => initDesignerApp(), 0);
}
// 1. Calculate Page Physical Dimensions based on Paper Size & Orientation
function updatePageDimensions() {
  if (!reportDef) return;
  const paperKey = reportDef.paperSize || "A4";
  const isLandscape = (reportDef.orientation || "landscape").toLowerCase() === "landscape";

  let baseW = 210;
  let baseH = 297;

  if (paperKey === "Custom") {
    baseW = reportDef.customWidthMm || (reportDef.widthMm ? Math.min(reportDef.widthMm, reportDef.heightMm) : 210);
    baseH = reportDef.customHeightMm || (reportDef.heightMm ? Math.max(reportDef.widthMm, reportDef.heightMm) : 297);
  } else {
    const paper = PAPER_SIZES[paperKey] || PAPER_SIZES["A4"];
    baseW = paper.widthMm;
    baseH = paper.heightMm;
  }
  const wMm = isLandscape ? Math.max(baseW, baseH) : Math.min(baseW, baseH);
  const hMm = isLandscape ? Math.min(baseW, baseH) : Math.max(baseW, baseH);
  reportDef.paperSize = paperKey;
  reportDef.orientation = isLandscape ? "landscape" : "portrait";
  reportDef.widthMm = wMm;
  reportDef.heightMm = hMm;
  reportDef.pageWidth = mmToPx(wMm);
  reportDef.pageHeight = mmToPx(hMm);

  if (!reportDef.margins) {
    reportDef.margins = { top: 10, right: 10, bottom: 10, left: 10 };
  }
}
// 2. Change Paper Size
function changePaperSize(sizeKey) {
  if (!reportDef) return;
  if (sizeKey === 'Custom') {
    openCustomPaperModal();
    return;
  }
  if (!PAPER_SIZES[sizeKey]) return;
  reportDef.paperSize = sizeKey;
  updatePageDimensions();
  clampAllElementsToPage();
  renderCanvas();
  pushHistory();
  showToast(`Paper size: ${sizeKey} (${reportDef.widthMm} x ${reportDef.heightMm} mm)`);
}
// 3. Set Orientation (Portrait / Landscape)
function setOrientation(orient) {
  if (!reportDef) return;
  reportDef.orientation = orient.toLowerCase();
  updateOrientationButtons();
  updatePageDimensions();
  clampAllElementsToPage();
  renderCanvas();
  pushHistory();
  showToast(`Orientation: ${orient.toUpperCase()} (${reportDef.widthMm} x ${reportDef.heightMm} mm)`);
}
function updateOrientationButtons() {
  const isLandscape = (reportDef.orientation || "").toLowerCase() === "landscape";
  const btnL = document.getElementById('btnLandscape');
  const btnP = document.getElementById('btnPortrait');
  if (btnL && btnP) {
    if (isLandscape) {
      btnL.classList.add('active');
      btnP.classList.remove('active');
    } else {
      btnP.classList.add('active');
      btnL.classList.remove('active');
    }
  }
}
// 4. Update Margins
function updateMargin(side, value) {
  if (!reportDef) return;
  const mmVal = Math.max(0, parseFloat(value) || 0);
  reportDef.margins[side] = mmVal;
  updateMarginGuides();
  pushHistory();
  showToast(`Margin ${side}: ${mmVal} mm`);
}
// 5. Build Top Horizontal Ruler in Millimeters
function buildRuler() {
  const container = document.getElementById('rulerTicks');
  if (!container || !reportDef) return;
  container.innerHTML = '';

  const widthMm = reportDef.widthMm || 297;
  container.style.width = reportDef.pageWidth + 'px';

  for (let mm = 0; mm <= widthMm; mm++) {
    const tick = document.createElement('div');
    tick.className = 'ruler-tick';
    tick.style.left = Math.round(mm * PX_PER_MM) + 'px';

    if (mm % 10 === 0) {
      tick.classList.add('major');
      tick.setAttribute('data-val', mm);
    } else if (mm % 5 === 0) {
      tick.classList.add('medium');
    } else {
      tick.classList.add('minor');
    }
    container.appendChild(tick);
  }
}
// Synchronize horizontal scrolling between workspace and ruler
function handleCanvasScroll(e) {
  const viewport = document.getElementById('rulerViewport');
  if (viewport) {
    viewport.scrollLeft = e.target.scrollLeft;
  }
}
// 6. Clamp Elements inside Page Bounds
function clampAllElementsToPage() {
  if (!reportDef || !reportDef.elements) return;
  const pW = reportDef.pageWidth;
  reportDef.elements.forEach(elem => {
    const sec = reportDef.sections.find(s => s.id === elem.sectionId);
    const secH = sec ? sec.height : 100;
    elem.width = Math.max(10, Math.min(elem.width, pW));
    elem.x = Math.max(0, Math.min(elem.x, pW - elem.width));
    elem.height = Math.max(8, Math.min(elem.height, secH));
    elem.y = Math.max(0, Math.min(elem.y, secH - elem.height));
    // Sync mm coordinates
    elem.xMm = pxToMm(elem.x);
    elem.yMm = pxToMm(elem.y);
    elem.widthMm = pxToMm(elem.width);
    elem.heightMm = pxToMm(elem.height);
  });
}
// 7. Render Entire Canvas (Paper Sheet + Gutter + Sections + Elements)
function renderCanvas() {
  if (!reportDef) return;
  // Update paper dimensions
  updatePageDimensions();

  const canvas = document.getElementById('reportCanvas');
  const gutter = document.getElementById('sectionGutter');
  canvas.innerHTML = '';
  gutter.innerHTML = '';
  // Set exact paper sheet dimensions
  canvas.style.width = reportDef.pageWidth + 'px';
  canvas.style.minHeight = reportDef.pageHeight + 'px';
  // Apply Page Background Color
  canvas.style.backgroundColor = reportDef.pageColor || '#ffffff';
  // Apply Page Border (from Borders and Shading Dialog)
  const existingPageBorder = document.getElementById('canvasPageBorder');
  if (existingPageBorder) existingPageBorder.remove();
  canvas.style.border = '1px solid #94a3b8';
  canvas.style.boxShadow = reportDef.pageBorder?.boxShadow || '0 2px 12px rgba(0,0,0,0.18)';
  if (reportDef.pageBorder) {
    const inset = reportDef.pageBorder.inset || {};
    const topMm = Math.max(0, Number(inset.top) || 0);
    const rightMm = Math.max(0, Number(inset.right) || 0);
    const bottomMm = Math.max(0, Number(inset.bottom) || 0);
    const leftMm = Math.max(0, Number(inset.left) || 0);
    const hasInset = topMm > 0 || rightMm > 0 || bottomMm > 0 || leftMm > 0;
    if (hasInset) {
      const borderDiv = document.createElement('div');
      borderDiv.id = 'canvasPageBorder';
      borderDiv.className = 'report-page-border';
      borderDiv.style.position = 'absolute';
      borderDiv.style.pointerEvents = 'none';
      borderDiv.style.boxSizing = 'border-box';
      borderDiv.style.zIndex = '999';
      borderDiv.style.top = mmToPx(topMm) + 'px';
      borderDiv.style.right = mmToPx(rightMm) + 'px';
      borderDiv.style.bottom = mmToPx(bottomMm) + 'px';
      borderDiv.style.left = mmToPx(leftMm) + 'px';
      if (reportDef.pageBorder.top && reportDef.pageBorder.top !== 'none') borderDiv.style.borderTop = reportDef.pageBorder.top;
      if (reportDef.pageBorder.bottom && reportDef.pageBorder.bottom !== 'none') borderDiv.style.borderBottom = reportDef.pageBorder.bottom;
      if (reportDef.pageBorder.left && reportDef.pageBorder.left !== 'none') borderDiv.style.borderLeft = reportDef.pageBorder.left;
      if (reportDef.pageBorder.right && reportDef.pageBorder.right !== 'none') borderDiv.style.borderRight = reportDef.pageBorder.right;
      canvas.appendChild(borderDiv);
    } else {
      canvas.style.borderTop = reportDef.pageBorder.top || 'none';
      canvas.style.borderBottom = reportDef.pageBorder.bottom || 'none';
      canvas.style.borderLeft = reportDef.pageBorder.left || 'none';
      canvas.style.borderRight = reportDef.pageBorder.right || 'none';
    }
  }
  // Update Toolbar Controls
  const selPaper = document.getElementById('selPaperSize');
  if (selPaper) selPaper.value = reportDef.paperSize || "A4";
  updateOrientationButtons();
  if (reportDef.margins) {
    const inpL = document.getElementById('inpMarginLeft');
    const inpR = document.getElementById('inpMarginRight');
    const inpT = document.getElementById('inpMarginTop');
    const inpB = document.getElementById('inpMarginBottom');
    if (inpL) inpL.value = reportDef.margins.left;
    if (inpR) inpR.value = reportDef.margins.right;
    if (inpT) inpT.value = reportDef.margins.top;
    if (inpB) inpB.value = reportDef.margins.bottom;
  }
  // Add Margin Guides Overlay
  const guides = document.createElement('div');
  guides.className = 'cr-margin-guides';
  guides.id = 'marginGuides';
  canvas.appendChild(guides);
  updateMarginGuides();
  // Render Sections & Gutter Items
  reportDef.sections.forEach(sec => {
    // 1. Gutter Item
    const gutterItem = document.createElement('div');
    gutterItem.className = 'cr-gutter-item';
    gutterItem.id = `gutter_${sec.id}`;
    gutterItem.style.height = sec.height + 'px';
    const gutterTag = document.createElement('div');
    gutterTag.className = 'cr-gutter-tag' + (activeSectionId === sec.id ? ' active' : '');
    gutterTag.id = `tag_${sec.id}`;
    gutterTag.title = `${sec.name} - ${sec.height}px${sec.description ? ` (${sec.description})` : ''}`;
    gutterTag.onclick = () => selectSection(sec.id);
    gutterTag.innerHTML = `
          <span class="sec-name">${escapeHtml(sec.name)}</span>
          <button type="button" class="cr-gutter-del-btn" title="Delete section" aria-label="Delete section" onclick="event.stopPropagation(); deleteReportSection('${sec.id}')">✕</button>
        `;
    gutterItem.appendChild(gutterTag);
    // Gutter resize handle
    const gutterResizer = document.createElement('div');
    gutterResizer.className = 'cr-section-resize-bar';
    gutterResizer.onmousedown = (e) => handleSectionResizeStart(e, sec.id);
    gutterItem.appendChild(gutterResizer);
    gutter.appendChild(gutterItem);
    // 2. Section inside Paper Sheet
    const secDiv = document.createElement('div');
    secDiv.className = 'cr-section' + (isGridVisible ? '' : ' grid-disabled');
    secDiv.id = `sec_${sec.id}`;
    secDiv.style.height = sec.height + 'px';
    secDiv.onclick = (e) => {
      if (e.target === secDiv) selectSection(sec.id);
    };
    secDiv.ondblclick = (e) => {
      const under = document.elementFromPoint ? document.elementFromPoint(e.clientX, e.clientY) : null;
      const hitElement = under ? under.closest('.cr-element') : null;
      // If a normal (non-background) element was hit, let its own ondblclick handle it
      if (hitElement && !hitElement.id.startsWith('elem_pdf-template-bg')) {
        return;
      }
      const rect = secDiv.getBoundingClientRect();
      const clickX = Math.max(0, Math.round((e.clientX - rect.left) / zoomLevel));
      const clickY = Math.max(0, Math.round((e.clientY - rect.top) / zoomLevel));

      // Add a new editable textbox at the click position
      addEditableBoxAt(sec.id, clickX, clickY);
    };
    secDiv.ondragover = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    secDiv.ondrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCanvasDrop(e, sec.id);
    };
    // Section bottom resize handle
    const secBottomHandle = document.createElement('div');
    secBottomHandle.className = 'cr-section-bottom-handle';
    secBottomHandle.onmousedown = (e) => handleSectionResizeStart(e, sec.id);
    secDiv.appendChild(secBottomHandle);

    canvas.appendChild(secDiv);
  });
  // Render Elements
  if (reportDef.elements) {
    reportDef.elements.forEach(elem => {
      renderElementOnCanvas(elem);
    });
  }
  // Render Watermark Overlay on Canvas
  const existingWm = document.getElementById('canvasWatermark');
  if (existingWm) existingWm.remove();
  if (reportDef.watermark) {
    const wm = document.createElement('div');
    wm.id = 'canvasWatermark';
    wm.style.position = 'absolute';
    wm.style.top = '0';
    wm.style.left = '0';
    wm.style.width = '100%';
    wm.style.height = '100%';
    wm.style.display = 'flex';
    wm.style.alignItems = 'center';
    wm.style.justifyContent = 'center';
    wm.style.pointerEvents = 'none';
    wm.style.zIndex = '5';
    wm.style.overflow = 'hidden';

    if (reportDef.watermark.type === 'image' || reportDef.watermark.imageUrl) {
      const img = document.createElement('img');
      img.src = reportDef.watermark.imageUrl;
      const scale = reportDef.watermark.scale || 'auto';
      const opacity = reportDef.watermark.opacity !== undefined
        ? reportDef.watermark.opacity
        : (reportDef.watermark.washout !== false ? 0.18 : 0.85);
      img.style.opacity = opacity;
      if (scale === 'auto') {
        img.style.maxWidth = '75%';
        img.style.maxHeight = '75%';
        img.style.objectFit = 'contain';
      } else {
        img.style.width = scale;
        img.style.maxWidth = '95%';
        img.style.height = 'auto';
      }
      img.style.userSelect = 'none';
      img.style.pointerEvents = 'none';
      wm.appendChild(img);
    } else if (reportDef.watermark.text) {
      const wmText = document.createElement('div');
      wmText.innerText = reportDef.watermark.text;
      wmText.style.fontFamily = reportDef.watermark.fontFamily || "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";
      wmText.style.fontSize = (reportDef.watermark.fontSize || 64) + 'px';
      wmText.style.fontWeight = '900';
      wmText.style.color = reportDef.watermark.color || 'rgba(148, 163, 184, 0.35)';
      wmText.style.letterSpacing = '6px';
      wmText.style.userSelect = 'none';
      wmText.style.whiteSpace = 'nowrap';
      const rot = reportDef.watermark.rotation !== undefined ? reportDef.watermark.rotation : -45;
      wmText.style.transform = `rotate(${rot}deg)`;
      wm.appendChild(wmText);
    }
    canvas.appendChild(wm);
  }

  buildRuler();
  updatePropertiesPanel();
  updateStatusBar();
  validateElementsOverflow();
}
// 8. Update Margin Guides on Canvas
function updateMarginGuides() {
  const guides = document.getElementById('marginGuides');
  if (!guides || !reportDef || !reportDef.margins) return;

  const m = reportDef.margins;
  const leftPx = mmToPx(m.left || 0);
  const rightPx = mmToPx(m.right || 0);
  const topPx = mmToPx(m.top || 0);
  const bottomPx = mmToPx(m.bottom || 0);

  guides.style.left = leftPx + 'px';
  guides.style.top = topPx + 'px';
  guides.style.width = Math.max(10, reportDef.pageWidth - leftPx - rightPx) + 'px';
  guides.style.height = Math.max(10, reportDef.pageHeight - topPx - bottomPx) + 'px';
}
// 9. Render Individual Element
function isInlineEditableElement(elem) {
  return !!elem && ['text', 'field', 'formula', 'text_box'].includes(elem.type);
}

function renderElementOnCanvas(elem) {
  const secDiv = document.getElementById(`sec_${elem.sectionId}`);
  if (!secDiv) return;
  const existing = document.getElementById(`elem_${elem.id}`);
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'cr-element' + (selectedElementIds.includes(elem.id) ? ' selected' : '');
  el.id = `elem_${elem.id}`;
  el.setAttribute('data-type', elem.type);
  el.style.left = elem.x + 'px';
  el.style.top = elem.y + 'px';
  el.style.width = elem.width + 'px';
  el.style.height = elem.height + 'px';
  // Authentic Crystal Reports field formatting defaults
  el.style.fontFamily = (elem.styles && elem.styles.fontFamily) ? elem.styles.fontFamily : "'Noto Sans Devanagari', Arial, sans-serif";
  el.style.fontSize = (elem.styles && elem.styles.fontSize) ? elem.styles.fontSize : '12px'
  const isShape = (elem.type === 'box' || elem.type === 'box_rounded' || elem.type === 'circle');
  const isArrow = (elem.type === 'arrow_right' || elem.type === 'arrow_down');
  const isLineType = (elem.type === 'line' || elem.type === 'arrow_line');
  const defaultBorder = isShape ? '1.5px solid #000000' : (elem.type === 'text_box' ? '1px solid #1e293b' : ((isLineType || isArrow || elem.type === 'image' || elem.type === 'text') ? 'none' : (elem.type === 'unsupported' ? '1px dashed #d97706' : 'none')));
  el.style.border = (elem.styles && elem.styles.border) ? elem.styles.border : defaultBorder;
  const defaultBg = (isShape || isLineType || isArrow || elem.type === 'text') ? 'transparent' : (elem.type === 'text_box' ? '#ffffff' : (elem.type === 'unsupported' ? '#fffbeb' : 'transparent'));
  el.style.backgroundColor = (elem.styles && elem.styles.backgroundColor) ? elem.styles.backgroundColor : defaultBg;
  el.style.color = (elem.styles && elem.styles.color) ? elem.styles.color : '#000000';
  el.style.padding = (elem.styles && elem.styles.padding) ? elem.styles.padding : ((isShape || isLineType || isArrow) ? '0' : (elem.type === 'text_box' ? '4px 6px' : '1px 2px'));
  el.style.lineHeight = '1.2';
  el.style.boxSizing = 'border-box';
  el.style.zIndex = isShape ? '1' : ((isLineType || isArrow) ? '2' : '3');
  if (elem.type === 'circle') {
    el.style.borderRadius = '50%';
  } else if (elem.type === 'box_rounded') {
    el.style.borderRadius = (elem.styles && elem.styles.borderRadius) || '8px';
  }
  if (elem.styles) {
    Object.keys(elem.styles).forEach(k => {
      el.style[k] = elem.styles[k];
    });
    if (elem.styles.borderTop) el.style.borderTop = elem.styles.borderTop;
    if (elem.styles.borderBottom) el.style.borderBottom = elem.styles.borderBottom;
    if (elem.styles.borderLeft) el.style.borderLeft = elem.styles.borderLeft;
    if (elem.styles.borderRight) el.style.borderRight = elem.styles.borderRight;
    if (elem.type === 'circle') el.style.borderRadius = '50%';
  }
  if (isArrow) {
    el.style.backgroundColor = 'transparent';
    el.style.border = 'none';
    if (elem.styles && elem.styles.backgroundColor === '#dbeafe') {
      elem.styles.backgroundColor = 'transparent';
    }
  }
  if (elem.type === 'text' || elem.type === 'field' || elem.type === 'formula' || elem.type === 'text_box') {
    const verticalAlign = elem.styles?.verticalAlign || 'middle';
    el.style.alignItems = verticalAlign === 'top'
      ? 'flex-start'
      : verticalAlign === 'bottom' ? 'flex-end' : 'center';
  }
  if (elem.type === 'unsupported' && elem.visible === false) {
    el.style.display = 'none';
  }
  // Authentic Crystal Reports clipping: multi-line bullet lists wrap with pre-wrap
  const isWrapping = elem.textWrapping !== false;
  const wrapStyle = isWrapping
    ? 'white-space: pre-wrap; overflow-wrap: anywhere; word-break: normal; line-height: 1.3;'
    : 'white-space: pre; overflow: hidden; text-overflow: clip;';
  const imgSrc = elem.imageUrl || elem.src;
  let contentHtml = '';
  if (elem.type === 'image') {
    if (imgSrc) {
      contentHtml = `<img src="${imgSrc}" style="width:100%; height:100%; object-fit:contain; display:block; pointer-events:none;" alt="${elem.name || 'Logo'}">`;
    } else {
      contentHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f0fdf4; border:1px solid #16a34a; border-radius:50%; font-size:9.5px; color:#166534; font-weight:700;"><svg viewBox="0 0 100 100" style="width:34px;height:34px;"><circle cx="50" cy="50" r="46" fill="#16a34a" stroke="#15803d" stroke-width="2"/><path d="M30 52 L43 65 L70 38" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg></div>`;
    }
  } else if (elem.type === 'box' || elem.type === 'box_rounded' || elem.type === 'circle') {
    contentHtml = `<div style="width:100%; height:100%; pointer-events:none;"></div>`;
  } else if (elem.type === 'arrow_right') {
    const fill = (elem.styles && elem.styles.backgroundColor && elem.styles.backgroundColor !== '#dbeafe') ? elem.styles.backgroundColor : 'transparent';
    const stroke = (elem.styles && (elem.styles.borderColor || elem.styles.color)) || '#1e293b';
    const strokeWidth = (elem.styles && elem.styles.borderWidth) || 1.5;
    contentHtml = `<svg viewBox="0 0 100 60" preserveAspectRatio="none" style="width:100%; height:100%; display:block; pointer-events:none;"><polygon points="0,20 60,20 60,0 100,30 60,60 60,40 0,40" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/></svg>`;
  } else if (elem.type === 'arrow_down') {
    const fill = (elem.styles && elem.styles.backgroundColor && elem.styles.backgroundColor !== '#dbeafe') ? elem.styles.backgroundColor : 'transparent';
    const stroke = (elem.styles && (elem.styles.borderColor || elem.styles.color)) || '#1e293b';
    const strokeWidth = (elem.styles && elem.styles.borderWidth) || 1.5;
    contentHtml = `<svg viewBox="0 0 60 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block; pointer-events:none;"><polygon points="20,0 40,0 40,60 60,60 30,100 0,60 20,60" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/></svg>`;
  } else if (elem.type === 'arrow_line') {
    ensureLineCoordinates(elem);
    const color = (elem.styles && (elem.styles.backgroundColor || elem.styles.color)) || '#000000';
    const thickness = (elem.styles && elem.styles.lineThickness) || (elem.height && elem.height > 1 && elem.height <= 8 ? elem.height : 2);
    const localX1 = elem.x1 - elem.x;
    const localY1 = elem.y1 - elem.y;
    const localX2 = elem.x2 - elem.x;
    const localY2 = elem.y2 - elem.y;
    const markerId = `marker_arr_${elem.id}`;
    contentHtml = `
          <svg style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0; pointer-events:none;">
            <defs>
              <marker id="${markerId}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="${color}" />
              </marker>
            </defs>
            <line x1="${localX1}" y1="${localY1}" x2="${localX2}" y2="${localY2}"
                  stroke="${color}" stroke-width="${thickness}" stroke-linecap="round" marker-end="url(#${markerId})" />
          </svg>
        `;
  } else if (elem.type === 'text_box') {
    const txt = elem.text !== undefined ? elem.text : 'मजकूर पेटी';
    contentHtml = `<span style="${wrapStyle} width:100%; display:block; pointer-events:none;">${escapeHtml(txt)}</span>`;
  } else if (elem.type === 'line') {
    ensureLineCoordinates(elem);
    const color = (elem.styles && (elem.styles.backgroundColor || elem.styles.color)) || '#000000';
    const thickness = (elem.styles && elem.styles.lineThickness) || (elem.height && elem.height > 1 && elem.height <= 8 ? elem.height : 2);
    let strokeDash = '';
    if (elem.styles && elem.styles.borderTop && elem.styles.borderTop.includes('dashed')) {
      strokeDash = 'stroke-dasharray="6,4"';
    } else if (elem.styles && elem.styles.borderTop && elem.styles.borderTop.includes('dotted')) {
      strokeDash = 'stroke-dasharray="2,3"';
    }
    const localX1 = elem.x1 - elem.x;
    const localY1 = elem.y1 - elem.y;
    const localX2 = elem.x2 - elem.x;
    const localY2 = elem.y2 - elem.y;
    contentHtml = `
          <svg style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0; pointer-events:none;">
            <line x1="${localX1}" y1="${localY1}" x2="${localX2}" y2="${localY2}" 
                  stroke="${color}" stroke-width="${thickness}" stroke-linecap="round" ${strokeDash} />
          </svg>
        `;
  } else if (elem.type === 'table') {
    const tableModel = buildTableModelFromElement(elem);
    const cols = tableModel.cols;
    const rows = tableModel.rows;
    const bColor = elem.borderColor || (elem.styles && elem.styles.borderColor) || '#000000';
    const bWidth = elem.borderWidth !== undefined ? elem.borderWidth : 1;
    const headerBg = elem.headerBg || '#f1f5f9';
    const totalWidth = tableModel.columnWidths.reduce((sum, width) => sum + width, 0);
    const colGroup = tableModel.columnWidths.map(width => `<col style="width:${(width / totalWidth) * 100}%">`).join('');
    let tableRowsHtml = '';
    for (let r = 0; r < rows; r++) {
      let trHtml = '';
      for (let c = 0; c < cols; c++) {
        const cellKey = `${r}_${c}`;
        const cell = tableModel.cells[cellKey];
        if (cell.hidden) continue;
        const val = cell.content || '';
        const isHeader = r === 0;
        const style = cell.style || {};
        const rowSpan = Math.max(1, Number(cell.rowSpan) || 1);
        const colSpan = Math.max(1, Number(cell.colSpan) || 1);
        const wrap = style.wrap === false
          ? 'white-space:nowrap; overflow:hidden; text-overflow:clip;'
          : 'white-space:pre-wrap; overflow-wrap:anywhere; word-break:normal;';
        trHtml += `<td${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ''}${colSpan > 1 ? ` colspan="${colSpan}"` : ''} style="border:${style.borderWidth ?? bWidth}px solid ${style.borderColor || bColor}; padding:${style.padding ?? 4}px; background:${style.backgroundColor || (isHeader ? headerBg : '#ffffff')}; color:${style.color || '#000000'}; font-size:${style.fontSize || 9}pt; font-weight:${style.fontWeight || (isHeader ? 700 : 400)}; ${wrap} vertical-align:${style.verticalAlign || 'middle'}; text-align:${style.textAlign || (elem.styles && elem.styles.textAlign) || 'left'};">${escapeHtml(val)}</td>`;
      }
      tableRowsHtml += `<tr style="height:${tableModel.rowHeights[r]}px">${trHtml}</tr>`;
    }
    contentHtml = `<table style="width:100%; height:100%; border-collapse:collapse; table-layout:fixed; font-size:inherit; font-family:inherit; color:inherit; pointer-events:none;"><colgroup>${colGroup}</colgroup><tbody>${tableRowsHtml}</tbody></table>`;
  } else if (elem.type === 'unsupported') {
    contentHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#fffbeb; border:1px dashed #d97706; color:#b45309; font-size:9px; font-weight:bold; overflow:hidden;" title="Unsupported: ${elem.originalType || 'Object'} - ${elem.reason || ''}">[Unsupported: ${elem.name || elem.originalType || 'Object'}]</div>`;
  } else if (elem.type === 'field') {
    const txt = elem.text || `{${elem.fieldName || ''}}`;
    contentHtml = `<span style="${wrapStyle} width:100%; display:block;">${escapeHtml(txt)}</span>`;
  } else if (elem.type === 'formula') {
    const txt = elem.text || `{@${(elem.fieldName || '').replace(/^@/, '')}}`;
    contentHtml = `<span style="${wrapStyle} width:100%; display:block; color:#8b0000; font-weight:600;">${escapeHtml(txt)}</span>`;
  } else {
    contentHtml = `<span style="${wrapStyle} width:100%; display:block;">${escapeHtml(elem.text || '')}</span>`;
  }
  el.innerHTML = contentHtml;
  if (isInlineEditableElement(elem)) {
    el.setAttribute('data-inline-editable', 'true');
    el.title = 'Double-click to edit text (or select and press F2 / Enter)';
    const textContent = el.firstElementChild;
    if (textContent) textContent.style.pointerEvents = 'none';
  }
  const isLockedBackground = isPdfTemplateBackground(elem) || elem.locked === true;
  if (isLockedBackground) {
    el.style.pointerEvents = 'none';
    el.style.zIndex = '0';
  } else if (elem.type === 'line' || elem.type === 'arrow_line') {
    ensureLineCoordinates(elem);
    const localX1 = elem.x1 - elem.x;
    const localY1 = elem.y1 - elem.y;
    const localX2 = elem.x2 - elem.x;
    const localY2 = elem.y2 - elem.y;
    // Front / Start Endpoint Handle (Point 1)
    const hStart = document.createElement('div');
    hStart.className = 'cr-handle line-endpoint handle-line-start';
    hStart.style.left = localX1 + 'px';
    hStart.style.top = localY1 + 'px';
    hStart.title = 'सुरुवात बिंदू कुठेही फिरवा / Rotate & Move Start Point';
    hStart.onmousedown = (e) => handleLineEndpointDragStart(e, elem.id, 'start');
    el.appendChild(hStart);
    // End / Finish Endpoint Handle (Point 2)
    const hEnd = document.createElement('div');
    hEnd.className = 'cr-handle line-endpoint handle-line-end';
    hEnd.style.left = localX2 + 'px';
    hEnd.style.top = localY2 + 'px';
    hEnd.title = 'शेवटचा बिंदू कुठेही फिरवा / Rotate & Move End Point';
    hEnd.onmousedown = (e) => handleLineEndpointDragStart(e, elem.id, 'end');
    el.appendChild(hEnd);
  } else {
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handles.forEach(h => {
      const handle = document.createElement('div');
      handle.className = `cr-handle handle-${h}`;
      handle.onmousedown = (e) => handleResizeStart(e, elem.id, h);
      el.appendChild(handle);
    });
  }
  if (!isLockedBackground) {
    el.onmousedown = (e) => {
      // The second press of a double-click must not start a move operation.
      if (e.detail > 1 && isInlineEditableElement(elem)) {
        e.preventDefault();
        e.stopPropagation();
        dragAction = null;
        return;
      }
      handleElementMouseDown(e, elem.id);
    };
    el.ondblclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragAction = null;
      handleElementDoubleClick(e, elem.id);
    };
  }
  secDiv.appendChild(el);
}
// 10. Element Mouse Down (Selection & Drag)
function handleElementMouseDown(e, elemId) {
  e.stopPropagation();
  const isMulti = e.ctrlKey || e.shiftKey;
  if (!isMulti && !selectedElementIds.includes(elemId)) {
    selectedElementIds = [elemId];
  } else if (isMulti) {
    if (selectedElementIds.includes(elemId)) {
      selectedElementIds = selectedElementIds.filter(id => id !== elemId);
    } else {
      selectedElementIds.push(elemId);
    }
  }
  document.querySelectorAll('.cr-element').forEach(el => {
    const id = el.id.replace('elem_', '');
    if (selectedElementIds.includes(id)) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
  dragAction = 'move';
  dragStartPos = { x: e.clientX, y: e.clientY };
  elementStartBounds = {};
  selectedElementIds.forEach(id => {
    const item = reportDef.elements.find(el => el.id === id);
    if (item) {
      ensureLineCoordinates(item);
      elementStartBounds[id] = {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        x1: item.x1,
        y1: item.y1,
        x2: item.x2,
        y2: item.y2
      };
    }
  });
  updatePropertiesPanel();
  updateStatusBar();
}
// 11. Resize Handle Mouse Down
function handleResizeStart(e, elemId, handleType) {
  e.stopPropagation();
  dragAction = 'resize';
  resizeHandleType = handleType;
  dragStartPos = { x: e.clientX, y: e.clientY };
  const item = reportDef.elements.find(el => el.id === elemId);
  if (item) {
    elementStartBounds[elemId] = { x: item.x, y: item.y, width: item.width, height: item.height };
  }
}
// 11b. Flexible Line Endpoint Drag Start (MS Word 360-degree rotation & length)
let lineDragEndpointType = null;
let lineStartEndpoints = null;
function handleLineEndpointDragStart(e, elemId, endpointType) {
  e.stopPropagation();
  selectedElementIds = [elemId];
  document.querySelectorAll('.cr-element').forEach(el => {
    const id = el.id.replace('elem_', '');
    if (id === elemId) el.classList.add('selected');
    else el.classList.remove('selected');
  });
  dragAction = 'line-endpoint-drag';
  lineDragEndpointType = endpointType; // 'start' or 'end'
  dragStartPos = { x: e.clientX, y: e.clientY };
  const item = reportDef.elements.find(el => el.id === elemId);
  if (item) {
    ensureLineCoordinates(item);
    lineStartEndpoints = {
      x1: item.x1,
      y1: item.y1,
      x2: item.x2,
      y2: item.y2
    };
  }
  updatePropertiesPanel();
  updateStatusBar();
}
// 12. Section Height Resize Handle Mouse Down
function handleSectionResizeStart(e, secId) {
  e.stopPropagation();
  dragAction = 'section-resize';
  resizingSectionId = secId;
  dragStartPos = { x: e.clientX, y: e.clientY };
  const sec = reportDef.sections.find(s => s.id === secId);
  if (sec) {
    sectionStartHeight = sec.height;
  }
}
// 13. Canvas Area Mouse Down
function handleCanvasAreaMouseDown(e) {
  if (e.target.closest('.cr-element') || e.target.closest('.cr-gutter-item') || e.target.closest('.cr-section-bottom-handle')) return;
  if (isLineDrawMode) {
    e.stopPropagation();
    const secDiv = e.target.closest('.cr-section');
    const targetSec = secDiv || document.getElementById(`sec_${activeSectionId}`) || document.querySelector('.cr-section');
    if (!targetSec) return;
    lineDrawSectionId = targetSec.id.replace('sec_', '');
    const secRect = targetSec.getBoundingClientRect();
    const startX = Math.max(0, Math.round((e.clientX - secRect.left) / zoomLevel));
    const startY = Math.max(0, Math.round((e.clientY - secRect.top) / zoomLevel));
    lineDrawStartPos = { x: startX, y: startY };
    dragAction = 'drawing-line';

    lineDrawPreviewEl = document.createElement('div');
    lineDrawPreviewEl.style.position = 'absolute';
    lineDrawPreviewEl.style.left = startX + 'px';
    lineDrawPreviewEl.style.top = startY + 'px';
    lineDrawPreviewEl.style.width = '10px';
    lineDrawPreviewEl.style.height = '2px';
    lineDrawPreviewEl.style.backgroundColor = '#0055ea';
    lineDrawPreviewEl.style.boxShadow = '0 0 6px rgba(0, 85, 234, 0.6)';
    lineDrawPreviewEl.style.pointerEvents = 'none';
    lineDrawPreviewEl.style.zIndex = '999';
    targetSec.appendChild(lineDrawPreviewEl);
    return;
  }
  if (!e.ctrlKey && !e.shiftKey) {
    selectedElementIds = [];
    document.querySelectorAll('.cr-element.selected').forEach(el => el.classList.remove('selected'));
    updatePropertiesPanel();
    updateStatusBar();
  }
  dragAction = 'marquee';
  const canvasScroll = document.getElementById('canvasScrollArea');
  const rect = canvasScroll.getBoundingClientRect();
  dragStartPos = {
    x: e.clientX - rect.left + canvasScroll.scrollLeft,
    y: e.clientY - rect.top + canvasScroll.scrollTop
  };
  const marquee = document.getElementById('marqueeBox');
  marquee.style.left = dragStartPos.x + 'px';
  marquee.style.top = dragStartPos.y + 'px';
  marquee.style.width = '0px';
  marquee.style.height = '0px';
  marquee.style.display = 'block';
}
// 14. Global Mouse Move: Clamping & Real-Time Transformation
window.addEventListener('mousemove', (e) => {
  // Live Ruler tracker update
  const canvas = document.getElementById('reportCanvas');
  if (canvas) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / zoomLevel;
    const tracker = document.getElementById('rulerTrackerX');
    if (tracker && relativeX >= 0 && relativeX <= reportDef.pageWidth) {
      tracker.style.display = 'block';
      tracker.style.left = Math.round(relativeX) + 'px';
    }
  }

  if (!dragAction) return;

  if (dragAction === 'drawing-line' && lineDrawStartPos && lineDrawPreviewEl) {
    const targetSec = document.getElementById(`sec_${lineDrawSectionId}`);
    if (targetSec) {
      const secRect = targetSec.getBoundingClientRect();
      const currentX = Math.max(0, Math.round((e.clientX - secRect.left) / zoomLevel));
      const currentY = Math.max(0, Math.round((e.clientY - secRect.top) / zoomLevel));
      const printableW = getHorizontalDesignWidth();
      const secH = targetSec.offsetHeight;

      const endX = Math.max(0, Math.min(currentX, printableW));
      const endY = Math.max(0, Math.min(currentY, secH));

      const minX = Math.min(lineDrawStartPos.x, endX);
      const minY = Math.min(lineDrawStartPos.y, endY);
      const w = Math.max(1, Math.abs(endX - lineDrawStartPos.x));
      const h = Math.max(1, Math.abs(endY - lineDrawStartPos.y));

      lineDrawPreviewEl.style.left = minX + 'px';
      lineDrawPreviewEl.style.top = minY + 'px';
      lineDrawPreviewEl.style.width = w + 'px';
      lineDrawPreviewEl.style.height = h + 'px';

      const localX1 = lineDrawStartPos.x - minX;
      const localY1 = lineDrawStartPos.y - minY;
      const localX2 = endX - minX;
      const localY2 = endY - minY;

      lineDrawPreviewEl.innerHTML = `
            <svg style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0; pointer-events:none;">
              <line x1="${localX1}" y1="${localY1}" x2="${localX2}" y2="${localY2}" stroke="#0055ea" stroke-width="2" stroke-linecap="round" />
            </svg>
          `;
      const lineLen = Math.round(Math.hypot(endX - lineDrawStartPos.x, endY - lineDrawStartPos.y));
      const angleDeg = Math.round(Math.atan2(endY - lineDrawStartPos.y, endX - lineDrawStartPos.x) * (180 / Math.PI));

      const tooltip = document.getElementById('dragCoordsTooltip');
      if (tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
        tooltip.innerHTML = `📏 Draw Line: <strong>${lineLen}px</strong> (${pxToMm(lineLen)}mm) | कोन (Angle): <strong>${angleDeg}°</strong>`;
      }
    }
    return;
  }
  const deltaX = (e.clientX - dragStartPos.x) / zoomLevel;
  const deltaY = (e.clientY - dragStartPos.y) / zoomLevel;

  if (dragAction === 'line-endpoint-drag') {
    const id = selectedElementIds[0];
    const item = reportDef.elements.find(el => el.id === id);
    const sec = reportDef.sections.find(s => s.id === (item ? item.sectionId : ''));
    if (item && lineStartEndpoints && sec) {
      const printableW = getHorizontalDesignWidth();
      const secH = sec.height;

      let curX1 = lineStartEndpoints.x1;
      let curY1 = lineStartEndpoints.y1;
      let curX2 = lineStartEndpoints.x2;
      let curY2 = lineStartEndpoints.y2;

      if (lineDragEndpointType === 'start') {
        let targetX = lineStartEndpoints.x1 + deltaX;
        let targetY = lineStartEndpoints.y1 + deltaY;
        if (snapToGrid) {
          targetX = Math.round(targetX / SNAP_SIZE) * SNAP_SIZE;
          targetY = Math.round(targetY / SNAP_SIZE) * SNAP_SIZE;
        }
        if (Math.abs(targetY - curY2) <= 5) targetY = curY2;
        if (Math.abs(targetX - curX2) <= 5) targetX = curX2;

        curX1 = Math.max(0, Math.min(targetX, printableW));
        curY1 = Math.max(0, Math.min(targetY, secH));
      } else if (lineDragEndpointType === 'end') {
        let targetX = lineStartEndpoints.x2 + deltaX;
        let targetY = lineStartEndpoints.y2 + deltaY;
        if (snapToGrid) {
          targetX = Math.round(targetX / SNAP_SIZE) * SNAP_SIZE;
          targetY = Math.round(targetY / SNAP_SIZE) * SNAP_SIZE;
        }
        if (Math.abs(targetY - curY1) <= 5) targetY = curY1;
        if (Math.abs(targetX - curX1) <= 5) targetX = curX1;

        curX2 = Math.max(0, Math.min(targetX, printableW));
        curY2 = Math.max(0, Math.min(targetY, secH));
      }
      item.x1 = Math.round(curX1);
      item.y1 = Math.round(curY1);
      item.x2 = Math.round(curX2);
      item.y2 = Math.round(curY2);

      item.x = Math.round(Math.min(item.x1, item.x2));
      item.y = Math.round(Math.min(item.y1, item.y2));
      item.width = Math.round(Math.max(1, Math.abs(item.x2 - item.x1)));
      item.height = Math.round(Math.max(1, Math.abs(item.y2 - item.y1)));

      item.xMm = pxToMm(item.x);
      item.yMm = pxToMm(item.y);
      item.widthMm = pxToMm(item.width);
      item.heightMm = pxToMm(item.height);

      renderElementOnCanvas(item);

      const lineLen = Math.round(Math.hypot(item.x2 - item.x1, item.y2 - item.y1));
      const angleDeg = Math.round(Math.atan2(item.y2 - item.y1, item.x2 - item.x1) * (180 / Math.PI));

      const tooltip = document.getElementById('dragCoordsTooltip');
      if (tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
        tooltip.innerHTML = `📏 लांबी (Length): <strong>${lineLen}px</strong> (${pxToMm(lineLen)}mm) | कोन (Angle): <strong>${angleDeg}°</strong>`;
      }

      updatePropertiesPanel();
    }
    return;
  }
  if (dragAction === 'move') {
    let effectiveDeltaX = deltaX;
    let effectiveDeltaY = deltaY;
    if (snapToGrid) {
      effectiveDeltaX = Math.round(deltaX / SNAP_SIZE) * SNAP_SIZE;
      effectiveDeltaY = Math.round(deltaY / SNAP_SIZE) * SNAP_SIZE;
    }
    // Live Smart Alignment Guides & Edge/Center Snapping
    const guideX = document.getElementById('smartGuideX');
    const guideY = document.getElementById('smartGuideY');
    let snappedGuideX = false;
    let snappedGuideY = false;

    const geom = getReportPrintableGeometry();
    const printableW = getHorizontalDesignWidth();

    if (selectedElementIds.length === 1) {
      const singleEl = reportDef.elements.find(el => el.id === selectedElementIds[0]);
      const singleStart = elementStartBounds[selectedElementIds[0]];
      const secDiv = document.getElementById(`sec_${singleEl ? singleEl.sectionId : ''}`);
      if (singleEl && singleStart && secDiv) {
        const peers = reportDef.elements.filter(el => el.sectionId === singleEl.sectionId && el.id !== singleEl.id);
        const rawTargetX = singleStart.x + effectiveDeltaX;
        const rawTargetY = singleStart.y + effectiveDeltaY;
        const SNAP_THRESH = 5;
        // Page Center Horizontal Snap
        const pageCenterX = Math.round(printableW / 2);
        const targetCenterX = rawTargetX + singleEl.width / 2;
        if (Math.abs(targetCenterX - pageCenterX) <= SNAP_THRESH) {
          effectiveDeltaX = (pageCenterX - singleEl.width / 2) - singleStart.x;
          snappedGuideX = true;
          if (guideX) {
            guideX.style.display = 'block';
            guideX.style.left = pageCenterX + 'px';
            secDiv.appendChild(guideX);
          }
        }
        for (const peer of peers) {
          // Left to Left
          if (Math.abs(rawTargetX - peer.x) <= SNAP_THRESH) {
            effectiveDeltaX = peer.x - singleStart.x;
            snappedGuideX = true;
            if (guideX) {
              guideX.style.display = 'block';
              guideX.style.left = peer.x + 'px';
              secDiv.appendChild(guideX);
            }
          }
          // Right to Right
          else if (Math.abs((rawTargetX + singleEl.width) - (peer.x + peer.width)) <= SNAP_THRESH) {
            effectiveDeltaX = (peer.x + peer.width) - singleEl.width - singleStart.x;
            snappedGuideX = true;
            if (guideX) {
              guideX.style.display = 'block';
              guideX.style.left = (peer.x + peer.width) + 'px';
              secDiv.appendChild(guideX);
            }
          }
          // Left to Right (adjacent)
          else if (Math.abs(rawTargetX - (peer.x + peer.width)) <= SNAP_THRESH) {
            effectiveDeltaX = (peer.x + peer.width) - singleStart.x;
            snappedGuideX = true;
            if (guideX) {
              guideX.style.display = 'block';
              guideX.style.left = (peer.x + peer.width) + 'px';
              secDiv.appendChild(guideX);
            }
          }
          // Right to Left (adjacent)
          else if (Math.abs((rawTargetX + singleEl.width) - peer.x) <= SNAP_THRESH) {
            effectiveDeltaX = peer.x - singleEl.width - singleStart.x;
            snappedGuideX = true;
            if (guideX) {
              guideX.style.display = 'block';
              guideX.style.left = peer.x + 'px';
              secDiv.appendChild(guideX);
            }
          }
          // Horizontal Center to Center
          else if (Math.abs((rawTargetX + singleEl.width / 2) - (peer.x + peer.width / 2)) <= SNAP_THRESH) {
            effectiveDeltaX = (peer.x + peer.width / 2) - singleEl.width / 2 - singleStart.x;
            snappedGuideX = true;
            if (guideX) {
              guideX.style.display = 'block';
              guideX.style.left = Math.round(peer.x + peer.width / 2) + 'px';
              secDiv.appendChild(guideX);
            }
          }
          // Top to Top
          if (Math.abs(rawTargetY - peer.y) <= SNAP_THRESH) {
            effectiveDeltaY = peer.y - singleStart.y;
            snappedGuideY = true;
            if (guideY) {
              guideY.style.display = 'block';
              guideY.style.top = peer.y + 'px';
              secDiv.appendChild(guideY);
            }
          }
          // Bottom to Bottom
          else if (Math.abs((rawTargetY + singleEl.height) - (peer.y + peer.height)) <= SNAP_THRESH) {
            effectiveDeltaY = (peer.y + peer.height) - singleEl.height - singleStart.y;
            snappedGuideY = true;
            if (guideY) {
              guideY.style.display = 'block';
              guideY.style.top = (peer.y + peer.height) + 'px';
              secDiv.appendChild(guideY);
            }
          }
          // Top to Bottom (adjacent)
          else if (Math.abs(rawTargetY - (peer.y + peer.height)) <= SNAP_THRESH) {
            effectiveDeltaY = (peer.y + peer.height) - singleStart.y;
            snappedGuideY = true;
            if (guideY) {
              guideY.style.display = 'block';
              guideY.style.top = (peer.y + peer.height) + 'px';
              secDiv.appendChild(guideY);
            }
          }
          // Bottom to Top (adjacent)
          else if (Math.abs((rawTargetY + singleEl.height) - peer.y) <= SNAP_THRESH) {
            effectiveDeltaY = peer.y - singleEl.height - singleStart.y;
            snappedGuideY = true;
            if (guideY) {
              guideY.style.display = 'block';
              guideY.style.top = peer.y + 'px';
              secDiv.appendChild(guideY);
            }
          }
          // Vertical Center to Center
          else if (Math.abs((rawTargetY + singleEl.height / 2) - (peer.y + peer.height / 2)) <= SNAP_THRESH) {
            effectiveDeltaY = (peer.y + peer.height / 2) - singleEl.height / 2 - singleStart.y;
            snappedGuideY = true;
            if (guideY) {
              guideY.style.display = 'block';
              guideY.style.top = Math.round(peer.y + peer.height / 2) + 'px';
              secDiv.appendChild(guideY);
            }
          }
        }
      }
    }
    if (!snappedGuideX && guideX) guideX.style.display = 'none';
    if (!snappedGuideY && guideY) guideY.style.display = 'none';
    selectedElementIds.forEach(id => {
      const item = reportDef.elements.find(el => el.id === id);
      const start = elementStartBounds[id];
      const sec = reportDef.sections.find(s => s.id === (item ? item.sectionId : ''));

      if (item && start && sec) {
        let newX = start.x + effectiveDeltaX;
        let newY = start.y + effectiveDeltaY;
        // Strict Boundary Clamping to Printable Page Canvas & Section (Req 1, 2, 5)
        const maxAllowedX = Math.max(0, printableW - item.width);
        const maxAllowedY = Math.max(0, sec.height - item.height);

        newX = Math.max(0, Math.min(newX, maxAllowedX));
        newY = Math.max(0, Math.min(newY, maxAllowedY));

        item.x = newX;
        item.y = newY;
        item.xMm = pxToMm(newX);
        item.yMm = pxToMm(newY);
        if (item.type === 'line' && start.x1 !== undefined && start.x2 !== undefined) {
          const dx = newX - start.x;
          const dy = newY - start.y;
          item.x1 = start.x1 + dx;
          item.y1 = start.y1 + dy;
          item.x2 = start.x2 + dx;
          item.y2 = start.y2 + dy;
        }
        const domEl = document.getElementById(`elem_${id}`);
        if (domEl) {
          domEl.style.left = newX + 'px';
          domEl.style.top = newY + 'px';
        }
        // Sync paired column header / detail cell
        if (COLUMN_PAIRS[id]) {
          const partner = reportDef.elements.find(el => el.id === COLUMN_PAIRS[id]);
          if (partner) {
            partner.x = newX;
            partner.xMm = pxToMm(newX);
            const pDom = document.getElementById(`elem_${partner.id}`);
            if (pDom) pDom.style.left = newX + 'px';
          }
        }
      }
    });
    // Live Coordinate Drag Tooltip
    const tooltip = document.getElementById('dragCoordsTooltip');
    if (tooltip && selectedElementIds.length > 0) {
      const firstEl = reportDef.elements.find(el => el.id === selectedElementIds[0]);
      if (firstEl) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
        tooltip.innerHTML = `X: <strong>${firstEl.x}px</strong> (${pxToMm(firstEl.x)}mm) | Y: <strong>${firstEl.y}px</strong> (${pxToMm(firstEl.y)}mm) | W: ${firstEl.width}px | H: ${firstEl.height}px`;
      }
    }

    updatePropertiesPanel();
  } else if (dragAction === 'resize') {
    const id = selectedElementIds[0];
    const item = reportDef.elements.find(el => el.id === id);
    const start = elementStartBounds[id];
    const sec = reportDef.sections.find(s => s.id === (item ? item.sectionId : ''));

    if (item && start && sec) {
      const geom = getReportPrintableGeometry();
      const printableW = getHorizontalDesignWidth();
      const secH = sec.height;

      let newX = start.x;
      let newY = start.y;
      let newW = start.width;
      let newH = start.height;

      if (item.type === 'line') {
        const isVert = (start.height > start.width);
        if (isVert) {
          if (resizeHandleType.includes('s')) {
            const maxH = Math.max(10, secH - start.y);
            newH = Math.max(10, Math.min(start.height + deltaY, maxH));
          } else if (resizeHandleType.includes('n')) {
            const maxBottom = start.y + start.height;
            let targetY = Math.max(0, Math.min(start.y + deltaY, maxBottom - 10));
            newY = targetY;
            newH = maxBottom - targetY;
          }
          if (snapToGrid) {
            newY = Math.round(newY / SNAP_SIZE) * SNAP_SIZE;
            newH = Math.round(newH / SNAP_SIZE) * SNAP_SIZE;
          }
          newH = Math.max(10, Math.min(newH, secH - newY));
          item.x = start.x;
          item.y = newY;
          item.width = start.width;
          item.height = newH;
        } else {
          // Horizontal Line: height is strictly preserved! Length stretches seamlessly!
          if (resizeHandleType.includes('e')) {
            const maxW = Math.max(10, printableW - start.x);
            newW = Math.max(10, Math.min(start.width + deltaX, maxW));
          } else if (resizeHandleType.includes('w')) {
            const maxRight = start.x + start.width;
            let targetX = Math.max(0, Math.min(start.x + deltaX, maxRight - 10));
            newX = targetX;
            newW = maxRight - targetX;
          }
          if (snapToGrid) {
            newX = Math.round(newX / SNAP_SIZE) * SNAP_SIZE;
            newW = Math.round(newW / SNAP_SIZE) * SNAP_SIZE;
          }
          newX = Math.max(0, Math.min(newX, printableW - 10));
          newW = Math.max(10, Math.min(newW, printableW - newX));
          item.x = newX;
          item.y = start.y;
          item.width = newW;
          item.height = start.height; // Height strictly preserved!
        }
      } else {
        // Strict Resizing Clamping to Printable Page Canvas & Section (Req 6)
        if (resizeHandleType.includes('e')) {
          const maxW = Math.max(5, printableW - start.x);
          newW = Math.max(5, Math.min(start.width + deltaX, maxW));
        }
        if (resizeHandleType.includes('s')) {
          const maxH = Math.max(5, secH - start.y);
          newH = Math.max(5, Math.min(start.height + deltaY, maxH));
        }
        if (resizeHandleType.includes('w')) {
          const maxRight = start.x + start.width;
          let targetX = start.x + deltaX;
          targetX = Math.max(0, Math.min(targetX, maxRight - 5));
          newX = targetX;
          newW = maxRight - targetX;
        }
        if (resizeHandleType.includes('n')) {
          const maxBottom = start.y + start.height;
          let targetY = start.y + deltaY;
          targetY = Math.max(0, Math.min(targetY, maxBottom - 5));
          newY = targetY;
          newH = maxBottom - targetY;
        }

        if (snapToGrid) {
          newX = Math.round(newX / SNAP_SIZE) * SNAP_SIZE;
          newY = Math.round(newY / SNAP_SIZE) * SNAP_SIZE;
          newW = Math.round(newW / SNAP_SIZE) * SNAP_SIZE;
          newH = Math.round(newH / SNAP_SIZE) * SNAP_SIZE;
        }
        // Strict boundary clamp after grid rounding
        newX = Math.max(0, Math.min(newX, printableW - 5));
        newY = Math.max(0, Math.min(newY, secH - 5));
        newW = Math.max(5, Math.min(newW, printableW - newX));
        newH = Math.max(5, Math.min(newH, secH - newY));
        item.x = newX;
        item.y = newY;
        item.width = newW;
        item.height = newH;
      }
      item.xMm = pxToMm(item.x);
      item.yMm = pxToMm(item.y);
      item.widthMm = pxToMm(item.width);
      item.heightMm = pxToMm(item.height);
      const domEl = document.getElementById(`elem_${id}`);
      if (domEl) {
        domEl.style.left = item.x + 'px';
        domEl.style.top = item.y + 'px';
        domEl.style.width = item.width + 'px';
        domEl.style.height = item.height + 'px';
      }
      if (COLUMN_PAIRS[id]) {
        const partner = reportDef.elements.find(el => el.id === COLUMN_PAIRS[id]);
        if (partner) {
          partner.x = item.x;
          partner.width = item.width;
          partner.xMm = pxToMm(item.x);
          partner.widthMm = pxToMm(item.width);
          const pDom = document.getElementById(`elem_${partner.id}`);
          if (pDom) {
            pDom.style.left = item.x + 'px';
            pDom.style.width = item.width + 'px';
          }
        }
      }
      // Update live coordinate tooltip for resize
      const tooltip = document.getElementById('dragCoordsTooltip');
      if (tooltip && item) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
        if (item.type === 'line') {
          tooltip.innerHTML = `📏 Line Length (लांबी): <strong>${item.width}px</strong> (${pxToMm(item.width)}mm) | X: ${item.x}px`;
        } else {
          tooltip.innerHTML = `W: <strong>${item.width}px</strong> (${pxToMm(item.width)}mm) | H: <strong>${item.height}px</strong> (${pxToMm(item.height)}mm) | X: ${item.x}px | Y: ${item.y}px`;
        }
      }

      updatePropertiesPanel();
    }
  } else if (dragAction === 'section-resize') {
    const sec = reportDef.sections.find(s => s.id === resizingSectionId);
    if (sec) {
      let newH = Math.max(20, sectionStartHeight + deltaY);
      if (snapToGrid) newH = Math.round(newH / SNAP_SIZE) * SNAP_SIZE;

      sec.height = newH;
      const secDiv = document.getElementById(`sec_${sec.id}`);
      if (secDiv) secDiv.style.height = newH + 'px';

      const gutterItem = document.getElementById(`gutter_${sec.id}`);
      if (gutterItem) gutterItem.style.height = newH + 'px';

      const badge = document.getElementById(`badge_${sec.id}`);
      if (badge) badge.textContent = newH;
    }
  } else if (dragAction === 'marquee') {
    const canvasScroll = document.getElementById('canvasScrollArea');
    const rect = canvasScroll.getBoundingClientRect();
    const currentX = e.clientX - rect.left + canvasScroll.scrollLeft;
    const currentY = e.clientY - rect.top + canvasScroll.scrollTop;

    const left = Math.min(dragStartPos.x, currentX);
    const top = Math.min(dragStartPos.y, currentY);
    const width = Math.abs(currentX - dragStartPos.x);
    const height = Math.abs(currentY - dragStartPos.y);

    const marquee = document.getElementById('marqueeBox');
    marquee.style.left = left + 'px';
    marquee.style.top = top + 'px';
    marquee.style.width = width + 'px';
    marquee.style.height = height + 'px';
  }
});
// 15. Global Mouse Up Handler
window.addEventListener('mouseup', () => {
  if (dragAction === 'line-endpoint-drag') {
    pushHistory();
    dragAction = null;
    lineDragEndpointType = null;
    lineStartEndpoints = null;
    const tooltip = document.getElementById('dragCoordsTooltip');
    if (tooltip) tooltip.style.display = 'none';
    return;
  }
  if (dragAction === 'drawing-line') {
    const targetSec = document.getElementById(`sec_${lineDrawSectionId}`);
    let startX = lineDrawStartPos ? lineDrawStartPos.x : 50;
    let startY = lineDrawStartPos ? lineDrawStartPos.y : 10;
    let endX = startX + 250;
    let endY = startY;
    if (targetSec && lineDrawStartPos) {
      const secRect = targetSec.getBoundingClientRect();
      const currentX = Math.max(0, Math.round((window.event ? window.event.clientX : 0) - secRect.left) / zoomLevel);
      const currentY = Math.max(0, Math.round((window.event ? window.event.clientY : 0) - secRect.top) / zoomLevel);
      const dragDist = Math.hypot(currentX - startX, currentY - startY);
      if (dragDist >= 15) {
        endX = Math.round(currentX);
        endY = Math.round(currentY);
      }
    }
    if (lineDrawPreviewEl && lineDrawPreviewEl.parentNode) {
      lineDrawPreviewEl.parentNode.removeChild(lineDrawPreviewEl);
    }
    lineDrawPreviewEl = null;
    addNewElement('line', {
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      sectionId: lineDrawSectionId
    });
    cancelLineDrawMode();
    showToast('✅ रेषा ड्रॉ केली');
    dragAction = null;
    return;
  }
  if (dragAction === 'move' || dragAction === 'resize' || dragAction === 'section-resize') {
    pushHistory();
    validateElementsOverflow();
  } else if (dragAction === 'marquee') {
    const marquee = document.getElementById('marqueeBox');
    marquee.style.display = 'none';
  }
  const tooltip = document.getElementById('dragCoordsTooltip');
  if (tooltip) tooltip.style.display = 'none';
  const guideX = document.getElementById('smartGuideX');
  const guideY = document.getElementById('smartGuideY');
  if (guideX) guideX.style.display = 'none';
  if (guideY) guideY.style.display = 'none';

  dragAction = null;
  resizeHandleType = null;
  resizingSectionId = null;
});
// 16. Zoom and Fit To Window
function handleZoomChange(val) {
  if (val === 'fit-page') {
    fitToWindow('page');
  } else if (val === 'fit-width') {
    fitToWindow('width');
  } else {
    setZoom(parseFloat(val));
  }
}
function fitToWindow(mode) {
  const scrollArea = document.getElementById('canvasScrollArea');
  if (!scrollArea || !reportDef) return;

  const availW = scrollArea.clientWidth - 160; // Gutter and padding
  const availH = scrollArea.clientHeight - 80;

  const stageW = (reportDef.pageWidth || 1123) + 100;
  const stageH = Math.max(reportDef.pageHeight || 794, 600);

  let scale = 1.0;
  if (mode === 'page') {
    scale = Math.min(availW / stageW, availH / stageH);
  } else {
    scale = availW / stageW;
  }
  scale = Math.max(0.2, Math.min(scale, 2.5));
  setZoom(scale);
  const selZoom = document.getElementById('selZoom');
  if (selZoom) selZoom.value = mode === 'page' ? 'fit-page' : 'fit-width';
}
function setZoom(val) {
  zoomLevel = Math.max(0.2, Math.min(val, 3.0));
  const stage = document.getElementById('stageWrapper');
  if (stage) {
    stage.style.transform = `scale(${zoomLevel})`;
  }
  document.getElementById('statusZoom').textContent = `Zoom: ${Math.round(zoomLevel * 100)}%`;
  showToast(`Zoom: ${Math.round(zoomLevel * 100)}%`);
}
function handleWindowResize() {
  const selZoom = document.getElementById('selZoom');
  if (selZoom && (selZoom.value === 'fit-page' || selZoom.value === 'fit-width')) {
    fitToWindow(selZoom.value === 'fit-page' ? 'page' : 'width');
  }
}
function deselectAll() {
  selectedElementIds = [];
  document.querySelectorAll('.cr-element.selected').forEach(el => el.classList.remove('selected'));
  updatePropertiesPanel();
  updateStatusBar();
}
// 17. Update Properties Panel
function updatePropertiesPanel() {
  const container = document.getElementById('propertiesContainer');
  const badge = document.getElementById('selectedElemIdBadge');
  const sidebar = document.getElementById('sidebarRight') || document.querySelector('.cr-sidebar-right');
  if (selectedElementIds.length === 0) {
    if (sidebar) sidebar.style.display = 'none';
    badge.textContent = 'None';
    container.innerHTML = `
          <div style="text-align:center; color:#777777; margin-top:40px; font-style:italic;">
            Select an element or section on the canvas to inspect and edit its properties.
          </div>
        `;
    return;
  }
  if (sidebar) sidebar.style.display = 'flex';
  if (selectedElementIds.length > 1) {
    badge.textContent = `${selectedElementIds.length} Selected`;
    container.innerHTML = `
          <div style="padding:10px; background:#fff; border:1px solid #d0d7de; border-radius:3px; font-size:11px;">
            <strong>${selectedElementIds.length} elements selected.</strong>
            <p style="margin-top:6px; color:#555;">Use alignment toolbar buttons to align or resize multiple elements together.</p>
          </div>
        `;
    return;
  }
  const elemId = selectedElementIds[0];
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  badge.textContent = elem.id;
  // Synchronize toolbar color indicators
  const textInd = document.getElementById('textColorIndicator');
  if (textInd && elem.styles && elem.styles.color) {
    textInd.style.background = elem.styles.color;
  }
  const bgInd = document.getElementById('bgColorIndicator');
  if (bgInd && elem.styles && elem.styles.backgroundColor) {
    bgInd.style.background = elem.styles.backgroundColor !== 'transparent' ? elem.styles.backgroundColor : '#ffffff';
  }
  let html = `
        <div class="prop-group">
          <div class="prop-group-title">General</div>
          <div class="prop-row">
            <div class="prop-label">ID:</div>
            <div class="prop-val"><input type="text" value="${elem.id}" disabled style="background:#f5f5f5;"></div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Type:</div>
            <div class="prop-val">
              <select onchange="updateSelectedProp('type', this.value)">
                <option value="text" ${elem.type === 'text' ? 'selected' : ''}>Text Label</option>
                <option value="text_box" ${elem.type === 'text_box' ? 'selected' : ''}>Text Box (मजकूर पेटी)</option>
                <option value="field" ${elem.type === 'field' ? 'selected' : ''}>Database Field</option>
                <option value="formula" ${elem.type === 'formula' ? 'selected' : ''}>Formula Field</option>
                <option value="image" ${elem.type === 'image' ? 'selected' : ''}>Image / Logo</option>
                <option value="box" ${elem.type === 'box' ? 'selected' : ''}>Box / Rectangle (आयत)</option>
                <option value="box_rounded" ${elem.type === 'box_rounded' ? 'selected' : ''}>Rounded Rectangle (गोलाकार आयत)</option>
                <option value="circle" ${elem.type === 'circle' ? 'selected' : ''}>Circle / Oval (वर्तुळ)</option>
                <option value="arrow_right" ${elem.type === 'arrow_right' ? 'selected' : ''}>Right Arrow (उजवा बाण)</option>
                <option value="arrow_down" ${elem.type === 'arrow_down' ? 'selected' : ''}>Down Arrow (खालचा बाण)</option>
                <option value="line" ${elem.type === 'line' ? 'selected' : ''}>Line Divider (सरळ रेषा)</option>
                <option value="arrow_line" ${elem.type === 'arrow_line' ? 'selected' : ''}>Arrow Line (बाण रेषा)</option>
                <option value="unsupported" ${elem.type === 'unsupported' ? 'selected' : ''}>Unsupported Object</option>
                <option value="table" ${elem.type === 'table' ? 'selected' : ''}>Grid / Table</option>
              </select>
            </div>
          </div>
          ${elem.type === 'image' ? `
          <div class="prop-row">
            <div class="prop-label">Image URL:</div>
            <div class="prop-val">
              <input type="text" value="${escapeHtml(elem.src || '')}" onchange="updateSelectedProp('src', this.value); renderCanvas();">
            </div>
          </div>` : ''}
          ${elem.type === 'unsupported' ? `
          <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:3px; padding:6px; margin:4px 0;">
            <div style="font-weight:700; color:#b45309; font-size:10px;">⚠️ Unsupported Object Diagnostic</div>
            <div style="font-size:9.5px; color:#78350f; margin-top:2px;"><strong>Original Type:</strong> ${escapeHtml(elem.originalType || 'N/A')}</div>
            <div style="font-size:9.5px; color:#78350f;"><strong>Reason:</strong> ${escapeHtml(elem.reason || 'Native Crystal object preserved with twip coordinates.')}</div>
          </div>` : ''}
          <div class="prop-row">
            <div class="prop-label">Section:</div>
            <div class="prop-val">
              <select onchange="moveElementToSection('${elem.id}', this.value)">
                ${reportDef.sections.map(s => `<option value="${s.id}" ${elem.sectionId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Field Binding:</div>
            <div class="prop-val">
              <select onchange="updateSelectedProp('fieldName', this.value)">
                <option value="">-- None --</option>
                ${DB_FIELDS.map(f => {
    const binding = fieldBindingForSection(f.name, elem.sectionId);
    return `<option value="${binding}" ${elem.fieldName === binding ? 'selected' : ''}>${f.name} (${f.label})</option>`;
  }).join('')}
                ${FORMULA_FIELDS.map(f => `<option value="${f.name}" ${elem.fieldName === f.name ? 'selected' : ''}>${f.name}</option>`).join('')}
              </select>
            </div>
          </div>
          ${elem.type === 'text_box' ? `
          <div class="prop-row" style="align-items:flex-start; margin-top:6px;">
            <div class="prop-label" style="margin-top:4px;">Display Text:</div>
            <div class="prop-val">
              <textarea id="propDisplayTextMulti" rows="6" style="width:100%; font-size:12px; line-height:1.5; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-family:'Noto Sans Devanagari', Mukta, sans-serif; resize:vertical; white-space:pre-wrap;" onchange="updateSelectedProp('text', this.value)" oninput="updateSelectedProp('text', this.value)" onkeydown="handleTextareaKeyDown(event)" ondrop="handleTextareaFieldDrop(event)" ondragover="event.preventDefault(); event.dataTransfer.dropEffect = 'copy';">${escapeHtml(elem.text !== undefined ? elem.text : (elem.displayText || ''))}</textarea>
              <div style="font-size:9.5px; color:#475569; margin-top:4px; line-height:1.35;">💡 <b>ड्रॅग आणि ड्रॉप:</b> डाव्या पॅनेलमधून फील्ड ड्रॅग करून थेट मजकुरावर जिथे कर्सर आहे तिथे ड्रॉप करा. (Tab की दाबून ओळ अंतर / Indent देता येईल).</div>
            </div>
          </div>
          ` : `
          <div class="prop-row">
            <div class="prop-label">Display Text:</div>
            <div class="prop-val">
              <input type="text" value="${escapeHtml(elem.text !== undefined ? elem.text : (elem.displayText || ''))}" onchange="updateSelectedProp('text', this.value)">
            </div>
          </div>
          `}
        </div>
        ${elem.type === 'table' ? `
        <div class="prop-group">
          <div class="prop-group-title">Table Configuration (तक्ता रचना)</div>
          <div class="prop-row">
            <div class="prop-label">Columns (स्तंभ):</div>
            <div class="prop-val">
              <input type="number" min="1" max="100" value="${elem.cols || 4}" onchange="updateTableCols('${elem.id}', parseInt(this.value, 10))" style="width:65px;">
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Rows (ओळी):</div>
            <div class="prop-val">
              <input type="number" min="1" max="200" value="${elem.rows || 3}" onchange="updateTableRows('${elem.id}', parseInt(this.value, 10))" style="width:65px;">
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Header Fill:</div>
            <div class="prop-val" style="display:flex; align-items:center; gap:6px;">
              <input type="color" value="${elem.headerBg || '#f1f5f9'}" onchange="updateSelectedProp('headerBg', this.value); renderCanvas();">
              <span style="font-size:10px; font-family:monospace;">${elem.headerBg || '#f1f5f9'}</span>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Border Width:</div>
            <div class="prop-val">
              <input type="number" min="0" max="6" value="${elem.borderWidth !== undefined ? elem.borderWidth : 1}" onchange="updateSelectedProp('borderWidth', parseInt(this.value, 10)); renderCanvas();" style="width:65px;"> px
            </div>
          </div>
          <div style="margin-top:6px;">
            <button class="cr-btn primary" style="width:100%; justify-content:center; font-weight:600; padding:6px;" onclick="openTableCellEditor('${elem.id}')">
              ✏️ Edit Cell Data (तक्ता डेटा संपादन)
            </button>
          </div>
        </div>` : ''}
         ${(elem.type === 'box' || elem.type === 'box_rounded' || elem.type === 'circle' || elem.type === 'arrow_right' || elem.type === 'arrow_down' || elem.type === 'text_box') ? `
        <div class="prop-group" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div class="prop-group-title" style="color:#0f172a; font-weight:700; display:flex; align-items:center; gap:6px;">
            <span>🎨 Shape Appearance (आकार व रंग रूप)</span>
          </div>
          <div class="prop-row" style="margin-top:8px;">
            <div class="prop-label" style="font-weight:600;">भराव रंग (Fill):</div>
            <div class="prop-val" style="display:flex; gap:6px; align-items:center;">
              <input type="color" value="${(elem.styles && elem.styles.backgroundColor && elem.styles.backgroundColor !== 'transparent') ? elem.styles.backgroundColor : '#ffffff'}" onchange="setShapeFillColor('${elem.id}', this.value)" style="width:28px; height:24px; padding:0; border:1px solid #cbd5e1; border-radius:3px; cursor:pointer;">
              <button class="cr-btn" style="padding:2px 6px; font-size:9.5px;" onclick="setShapeFillColor('${elem.id}', 'transparent')">पारदर्शक (None)</button>
            </div>
          </div>
           <div class="prop-row" style="margin-top:6px;">
            <div class="prop-label" style="font-weight:600;">किनार रंग (Border):</div>
            <div class="prop-val" style="display:flex; gap:6px; align-items:center;">
              <input type="color" value="${(elem.styles && (elem.styles.borderColor || elem.styles.color)) || '#000000'}" onchange="setShapeBorderColor('${elem.id}', this.value)" style="width:28px; height:24px; padding:0; border:1px solid #cbd5e1; border-radius:3px; cursor:pointer;">
              <span style="font-size:10px; font-family:monospace; color:#475569;">${(elem.styles && (elem.styles.borderColor || elem.styles.color)) || '#000000'}</span>
            </div>
          </div>

          <div class="prop-row" style="margin-top:6px;">
            <div class="prop-label" style="font-weight:600;">किनार जाडी (Width):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <button class="cr-btn ${(parseInt(elem.styles?.borderWidth || 1) === 1) ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setShapeBorderWidth('${elem.id}', 1)">1px</button>
              <button class="cr-btn ${(parseInt(elem.styles?.borderWidth || 1) === 2) ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setShapeBorderWidth('${elem.id}', 2)">2px</button>
              <button class="cr-btn ${(parseInt(elem.styles?.borderWidth || 1) === 3) ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setShapeBorderWidth('${elem.id}', 3)">3px</button>
              <button class="cr-btn ${(parseInt(elem.styles?.borderWidth || 1) === 4) ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setShapeBorderWidth('${elem.id}', 4)">4px</button>
            </div>
          </div>
           ${(elem.type === 'box_rounded' || elem.type === 'box') ? `
          <div class="prop-row" style="margin-top:6px;">
            <div class="prop-label" style="font-weight:600;">कोन गोलाई (Radius):</div>
            <div class="prop-val" style="display:flex; gap:6px; align-items:center;">
              <input type="number" min="0" max="50" value="${parseInt((elem.styles && elem.styles.borderRadius) || 0, 10)}" onchange="setShapeBorderRadius('${elem.id}', parseInt(this.value, 10))" style="width:65px;">
              <span style="font-size:10px; color:#64748b;">px</span>
            </div>
          </div>` : ''}
        </div>` : ''}
         ${(elem.type === 'line' || elem.type === 'arrow_line') ? `
        <div class="prop-group" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div class="prop-group-title" style="color:#0f172a; font-weight:700; display:flex; align-items:center; gap:6px;">
            <span>📏 ${elem.type === 'arrow_line' ? 'Flexible Arrow Line Settings (लवचिक बाण रेषा)' : 'Flexible Line Settings (लवचिक रेषा संपादन)'}</span>
          </div>
          <div class="prop-row" style="margin-top:8px;">
            <div class="prop-label" style="font-weight:600;">लांबी (Length):</div>
            <div class="prop-val" style="display:flex; gap:6px; align-items:center;">
              <input type="number" min="5" max="2000" value="${Math.round(Math.hypot((elem.x2 !== undefined ? elem.x2 : elem.x + elem.width) - (elem.x1 !== undefined ? elem.x1 : elem.x), (elem.y2 !== undefined ? elem.y2 : elem.y) - (elem.y1 !== undefined ? elem.y1 : elem.y)))}" onchange="setLineLength('${elem.id}', parseInt(this.value, 10))" style="width:75px; font-weight:600;">
              <span style="font-size:10px; color:#64748b;">px</span>
              <span style="font-size:10px; color:#0284c7; font-weight:600;">(${pxToMm(Math.hypot((elem.x2 !== undefined ? elem.x2 : elem.x + elem.width) - (elem.x1 !== undefined ? elem.x1 : elem.x), (elem.y2 !== undefined ? elem.y2 : elem.y) - (elem.y1 !== undefined ? elem.y1 : elem.y)))}mm)</span>
            </div>
          </div>

          <div class="prop-row">
            <div class="prop-label" style="font-weight:600;">कोन (Angle):</div>
            <div class="prop-val" style="display:flex; gap:6px; align-items:center;">
              <span style="font-size:11px; font-weight:700; color:#1e293b;">${Math.round(Math.atan2((elem.y2 !== undefined ? elem.y2 : elem.y) - (elem.y1 !== undefined ? elem.y1 : elem.y), (elem.x2 !== undefined ? elem.x2 : elem.x + elem.width) - (elem.x1 !== undefined ? elem.x1 : elem.x)) * (180 / Math.PI))}°</span>
            </div>
          </div>

          <div style="margin:8px 0; display:flex; gap:4px; flex-wrap:wrap;">
            <button class="cr-btn" style="padding:3px 7px; font-size:10px;" onclick="setLineOrientation('${elem.id}', 'horizontal')" title="Make horizontal">― आडवी (0°)</button>
            <button class="cr-btn" style="padding:3px 7px; font-size:10px;" onclick="setLineOrientation('${elem.id}', 'vertical')" title="Make vertical">| उभी (90°)</button>
            <button class="cr-btn" style="padding:3px 7px; font-size:10px;" onclick="setLineOrientation('${elem.id}', 'diagonal')" title="Make 45 degree diagonal">╱ तिरकी (45°)</button>
            <button class="cr-btn primary" style="padding:3px 8px; font-size:10px; font-weight:700;" onclick="setLineFullWidth('${elem.id}')" title="Fit line to full printable page width">↔️ पूर्ण पान</button>
          </div>

          <div class="prop-row">
            <div class="prop-label">जाडी (Weight):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <button class="cr-btn ${((elem.styles && elem.styles.lineThickness) || elem.height) === 1 ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setLineThickness('${elem.id}', 1)">1px</button>
              <button class="cr-btn ${((elem.styles && elem.styles.lineThickness) || elem.height) === 2 ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setLineThickness('${elem.id}', 2)">2px</button>
              <button class="cr-btn ${((elem.styles && elem.styles.lineThickness) || elem.height) === 3 ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setLineThickness('${elem.id}', 3)">3px</button>
              <button class="cr-btn ${((elem.styles && elem.styles.lineThickness) || elem.height) === 4 ? 'active' : ''}" style="padding:2px 7px; font-size:10px;" onclick="setLineThickness('${elem.id}', 4)">4px</button>
            </div>
          </div>

          <div class="prop-row" style="margin-top:6px;">
            <div class="prop-label">शैली (Style):</div>
            <div class="prop-val">
              <select onchange="setLineStyle('${elem.id}', this.value)" style="width:100%;">
                <option value="solid" ${(!elem.styles || !elem.styles.borderTop || elem.styles.borderTop.includes('solid')) ? 'selected' : ''}>── सलग (Solid)</option>
                <option value="dashed" ${(elem.styles && elem.styles.borderTop && elem.styles.borderTop.includes('dashed')) ? 'selected' : ''}>╌╌ तूटक (Dashed)</option>
                <option value="dotted" ${(elem.styles && elem.styles.borderTop && elem.styles.borderTop.includes('dotted')) ? 'selected' : ''}>•••• ठिपके (Dotted)</option>
              </select>
            </div>
          </div>

          <div class="prop-row" style="margin-top:6px;">
            <div class="prop-label">रंग (Color):</div>
            <div class="prop-val" style="display:flex; gap:6px; align-items:center;">
              <input type="color" value="${(elem.styles && (elem.styles.backgroundColor || elem.styles.color)) || '#000000'}" onchange="setLineColor('${elem.id}', this.value)" style="width:28px; height:24px; padding:0; border:1px solid #cbd5e1; border-radius:3px; cursor:pointer;">
              <span style="font-size:10px; font-family:monospace; color:#475569;">${(elem.styles && (elem.styles.backgroundColor || elem.styles.color)) || '#000000'}</span>
            </div>
          </div>
        </div>` : ''}

        <div class="prop-group">
          <div class="prop-group-title">Position & Size (mm & px)</div>
          <div class="prop-row">
            <div class="prop-label">Left (X):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <input type="number" value="${elem.x}" onchange="updateSelectedProp('x', parseInt(this.value, 10))" title="Pixels">
              <span style="font-size:9.5px; color:#555;">px</span>
              <span style="font-size:9.5px; color:#0369a1; font-family:monospace;">(${pxToMm(elem.x)}mm)</span>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Top (Y):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <input type="number" value="${elem.y}" onchange="updateSelectedProp('y', parseInt(this.value, 10))" title="Pixels">
              <span style="font-size:9.5px; color:#555;">px</span>
              <span style="font-size:9.5px; color:#0369a1; font-family:monospace;">(${pxToMm(elem.y)}mm)</span>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Width (W):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <input type="number" value="${elem.width}" onchange="updateSelectedProp('width', parseInt(this.value, 10))" title="Pixels">
              <span style="font-size:9.5px; color:#555;">px</span>
              <span style="font-size:9.5px; color:#0369a1; font-family:monospace;">(${pxToMm(elem.width)}mm)</span>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Height (H):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <input type="number" value="${elem.height}" onchange="updateSelectedProp('height', parseInt(this.value, 10))" title="Pixels">
              <span style="font-size:9.5px; color:#555;">px</span>
              <span style="font-size:9.5px; color:#0369a1; font-family:monospace;">(${pxToMm(elem.height)}mm)</span>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Right (X+W):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <span style="font-size:11px; font-weight:600; color:#333;">${elem.x + elem.width}px</span>
              <span style="font-size:9.5px; color:#0369a1; font-family:monospace;">(${pxToMm(elem.x + elem.width)}mm)</span>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Bottom (Y+H):</div>
            <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
              <span style="font-size:11px; font-weight:600; color:#333;">${elem.y + elem.height}px</span>
              <span style="font-size:9.5px; color:#0369a1; font-family:monospace;">(${pxToMm(elem.y + elem.height)}mm)</span>
            </div>
          </div>
        </div>
        <div class="prop-group">
          <div class="prop-group-title">Layout & Diagnostics (Req 18)</div>
          ${(() => {
      const geom = getReportPrintableGeometry();
      const printableW = getHorizontalDesignWidth();
      const sec = reportDef.sections.find(s => s.id === elem.sectionId);
      const secH = sec ? sec.height : 0;
      const rPx = elem.x + elem.width;
      const bPx = elem.y + elem.height;
      const insidePage = rPx <= printableW + 4 && elem.x >= 0;
      const insideSec = bPx <= secH + 2 && elem.y >= 0;
      let isOverlap = false;
      let peerNames = [];
      if (elem.allowOverlap !== true && elem.type !== 'line' && !(elem.type === 'box' && (!elem.styles || !elem.styles.backgroundColor || elem.styles.backgroundColor === 'transparent'))) {
        const peers = reportDef.elements.filter(el => el.sectionId === elem.sectionId && el.id !== elem.id && el.visible !== false && el.allowOverlap !== true && el.type !== 'line');
        for (const peer of peers) {
          if (peer.type === 'box' && (!peer.styles || !peer.styles.backgroundColor || peer.styles.backgroundColor === 'transparent')) continue;
          const intersectX = (elem.x < peer.x + peer.width) && (elem.x + elem.width > peer.x);
          const intersectY = (elem.y < peer.y + peer.height) && (elem.y + elem.height > peer.y);
          if (intersectX && intersectY) {
            isOverlap = true;
            peerNames.push(peer.name || peer.id);
          }
        }
      }
      return `
              <div class="prop-row">
                <div class="prop-label">Page Bounds:</div>
                <div class="prop-val">
                  ${insidePage ? '<span class="diag-badge-ok">✓ Inside Page</span>' : `<span class="diag-badge-err">⚠️ Exceeds Page (+${pxToMm(rPx - printableW)}mm)</span>`}
                </div>
              </div>
              <div class="prop-row">
                <div class="prop-label">Section Bounds:</div>
                <div class="prop-val">
                  ${insideSec ? '<span class="diag-badge-ok">✓ Inside Section</span>' : `<span class="diag-badge-err">⚠️ Exceeds Section (+${pxToMm(bPx - secH)}mm)</span>`}
                </div>
              </div>
              <div class="prop-row">
                <div class="prop-label">Overlap:</div>
                <div class="prop-val">
                  ${elem.allowOverlap ? '<span class="diag-badge-warn">ℹ Allowed</span>' : (isOverlap ? `<span class="diag-badge-warn" title="${peerNames.join(', ')}">⚠️ Overlaps (${peerNames.length})</span>` : '<span class="diag-badge-ok">✓ No Overlap</span>')}
                </div>
              </div>
              <div class="prop-row">
                <div class="prop-label">Allow Overlap:</div>
                <div class="prop-val">
                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                    <input type="checkbox" ${elem.allowOverlap === true ? 'checked' : ''} onchange="updateSelectedProp('allowOverlap', this.checked); validateElementsOverflow(); updatePropertiesPanel();">
                    <span style="font-size:10px;">Allow Intentional Overlap</span>
                  </label>
                </div>
              </div>
              <div class="prop-row">
                <div class="prop-label">Z-Index:</div>
                <div class="prop-val" style="display:flex; gap:4px; align-items:center;">
                  <input type="number" min="0" max="999" value="${elem.zIndex !== undefined ? elem.zIndex : (elem.styles && elem.styles.zIndex ? elem.styles.zIndex : 1)}" 
                    onchange="updateSelectedZIndex(parseInt(this.value, 10))" style="width:65px;">
                  <span style="font-size:9.5px; color:#555;">(Layer depth)</span>
                </div>
              </div>
            `;
    })()}
        </div>
         <div class="prop-group">
          <div class="prop-group-title">Typography & Styles</div>
          <div class="prop-row">
            <div class="prop-label">Font Family:</div>
            <div class="prop-val">
              <select onchange="updateSelectedStyle('fontFamily', this.value); const tb = document.getElementById('fmtFontFamily'); if (tb) tb.value = this.value;" style="width:100%;">
                <optgroup label="DVOT / शासकीय देवनागरी (CDAC ISM)">
                  <option value="'DVOT-Surekh', 'DV-OTSurekh', 'DVOT Surekh', 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Surekh') && !(elem.styles?.fontFamily || '').includes('SurekhMR') ? 'selected' : ''}>DVOT-Surekh (देवनागरी)</option>
                  <option value="'DVOT-SurekhMR', 'DV-OTSurekhMR', 'DVOT SurekhMR', 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('SurekhMR') ? 'selected' : ''}>DVOT-SurekhMR (देवनागरी)</option>
                  <option value="'DVOT-Yogesh', 'DV-OTYogesh', 'DVOT Yogesh', 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Yogesh') && !(elem.styles?.fontFamily || '').includes('YogeshMR') ? 'selected' : ''}>DVOT-Yogesh (देवनागरी)</option>
                  <option value="'DVOT-YogeshMR', 'DV-OTYogeshMR', 'DVOT YogeshMR', 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('YogeshMR') ? 'selected' : ''}>DVOT-YogeshMR (देवनागरी)</option>
                </optgroup>
                <optgroup label="मराठी / देवनागरी (Devanagari)">
                  <option value="'Noto Sans Devanagari', Mukta, sans-serif" ${(elem.styles?.fontFamily || '').includes('Noto Sans Devanagari') ? 'selected' : ''}>Noto Sans Devanagari</option>
                  <option value="Mukta, 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Mukta') ? 'selected' : ''}>Mukta (मुक्ता)</option>
                  <option value="'Tiro Devanagari Marathi', 'Noto Sans Devanagari', serif" ${(elem.styles?.fontFamily || '').includes('Tiro Devanagari') ? 'selected' : ''}>Tiro Devanagari (तिरो मराठी)</option>
                  <option value="Poppins, 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Poppins') ? 'selected' : ''}>Poppins (पॉपिन्स)</option>
                  <option value="'Noto Serif Devanagari', Georgia, serif" ${(elem.styles?.fontFamily || '').includes('Noto Serif Devanagari') ? 'selected' : ''}>Noto Serif Devanagari</option>
                  <option value="'Rozha One', 'Noto Sans Devanagari', serif" ${(elem.styles?.fontFamily || '').includes('Rozha One') ? 'selected' : ''}>Rozha One (ठळक शीर्षक)</option>
                  <option value="'Yatra One', 'Noto Sans Devanagari', cursive" ${(elem.styles?.fontFamily || '').includes('Yatra One') ? 'selected' : ''}>Yatra One (पारंपारिक)</option>
                  <option value="Martel, 'Noto Serif Devanagari', serif" ${(elem.styles?.fontFamily || '').includes('Martel') ? 'selected' : ''}>Martel (मार्टेल)</option>
                  <option value="Mangal, 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Mangal') ? 'selected' : ''}>Mangal (मंगल)</option>
                  <option value="Aparajita, 'Noto Sans Devanagari', serif" ${(elem.styles?.fontFamily || '').includes('Aparajita') ? 'selected' : ''}>Aparajita (अपराजिता)</option>
                  <option value="Kokila, 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Kokila') ? 'selected' : ''}>Kokila (कोकिला)</option>
                  <option value="Utsaah, 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Utsaah') ? 'selected' : ''}>Utsaah (उत्साह)</option>
                  <option value="Shruti, 'Noto Sans Devanagari', sans-serif" ${(elem.styles?.fontFamily || '').includes('Shruti') ? 'selected' : ''}>Shruti (श्रुती)</option>
                </optgroup>
                <optgroup label="Standard Sans-Serif">
                  <option value="Arial, sans-serif" ${(elem.styles?.fontFamily || '') === 'Arial, sans-serif' ? 'selected' : ''}>Arial</option>
                  <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" ${(elem.styles?.fontFamily || '').includes('Segoe UI') ? 'selected' : ''}>Segoe UI</option>
                  <option value="Calibri, sans-serif" ${(elem.styles?.fontFamily || '').includes('Calibri') ? 'selected' : ''}>Calibri</option>
                  <option value="Tahoma, sans-serif" ${(elem.styles?.fontFamily || '').includes('Tahoma') ? 'selected' : ''}>Tahoma</option>
                  <option value="Verdana, sans-serif" ${(elem.styles?.fontFamily || '').includes('Verdana') ? 'selected' : ''}>Verdana</option>
                  <option value="'Trebuchet MS', sans-serif" ${(elem.styles?.fontFamily || '').includes('Trebuchet MS') ? 'selected' : ''}>Trebuchet MS</option>
                  <option value="'Century Gothic', sans-serif" ${(elem.styles?.fontFamily || '').includes('Century Gothic') ? 'selected' : ''}>Century Gothic</option>
                  <option value="'Helvetica Neue', Helvetica, Arial, sans-serif" ${(elem.styles?.fontFamily || '').includes('Helvetica') ? 'selected' : ''}>Helvetica</option>
                </optgroup>
                <optgroup label="Serif (Notices / Legal)">
                  <option value="'Times New Roman', Times, serif" ${(elem.styles?.fontFamily || '').includes('Times New Roman') ? 'selected' : ''}>Times New Roman</option>
                  <option value="Georgia, serif" ${(elem.styles?.fontFamily || '').includes('Georgia') ? 'selected' : ''}>Georgia</option>
                  <option value="Garamond, serif" ${(elem.styles?.fontFamily || '').includes('Garamond') ? 'selected' : ''}>Garamond</option>
                  <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif" ${(elem.styles?.fontFamily || '').includes('Palatino') ? 'selected' : ''}>Palatino Linotype</option>
                  <option value="'Bookman Old Style', serif" ${(elem.styles?.fontFamily || '').includes('Bookman') ? 'selected' : ''}>Bookman Old Style</option>
                </optgroup>
                <optgroup label="Monospace / Tabular">
                  <option value="'Courier New', Courier, monospace" ${(elem.styles?.fontFamily || '').includes('Courier New') ? 'selected' : ''}>Courier New</option>
                  <option value="Consolas, monospace" ${(elem.styles?.fontFamily || '').includes('Consolas') ? 'selected' : ''}>Consolas</option>
                  <option value="'Lucida Console', Monaco, monospace" ${(elem.styles?.fontFamily || '').includes('Lucida Console') ? 'selected' : ''}>Lucida Console</option>
                  <option value="monospace" ${(elem.styles?.fontFamily || '') === 'monospace' ? 'selected' : ''}>Monospace</option>
                </optgroup>
                <optgroup label="Display / Headlines">
                  <option value="Impact, Charcoal, sans-serif" ${(elem.styles?.fontFamily || '').includes('Impact') ? 'selected' : ''}>Impact</option>
                  <option value="'Arial Black', Gadget, sans-serif" ${(elem.styles?.fontFamily || '').includes('Arial Black') ? 'selected' : ''}>Arial Black</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Font Size:</div>
            <div class="prop-val">
              <input type="text" value="${elem.styles && elem.styles.fontSize ? elem.styles.fontSize : '8.5px'}" onchange="updateSelectedStyle('fontSize', this.value)">
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Font Weight:</div>
            <div class="prop-val">
              <select onchange="updateSelectedStyle('fontWeight', this.value)">
                <option value="400" ${elem.styles && elem.styles.fontWeight === '400' ? 'selected' : ''}>Regular (400)</option>
                <option value="600" ${elem.styles && elem.styles.fontWeight === '600' ? 'selected' : ''}>Semi-Bold (600)</option>
                <option value="700" ${elem.styles && elem.styles.fontWeight === '700' ? 'selected' : ''}>Bold (700)</option>
                <option value="800" ${elem.styles && elem.styles.fontWeight === '800' ? 'selected' : ''}>Extra-Bold (800)</option>
              </select>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Text Align:</div>
            <div class="prop-val">
              <select onchange="updateSelectedStyle('textAlign', this.value)">
                <option value="left" ${elem.styles && elem.styles.textAlign === 'left' ? 'selected' : ''}>Left</option>
                <option value="center" ${elem.styles && elem.styles.textAlign === 'center' ? 'selected' : ''}>Center</option>
                <option value="right" ${elem.styles && elem.styles.textAlign === 'right' ? 'selected' : ''}>Right</option>
              </select>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Color:</div>
            <div class="prop-val">
              <input type="text" value="${elem.styles && elem.styles.color ? elem.styles.color : '#000000'}" onchange="updateSelectedStyle('color', this.value)">
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Border:</div>
            <div class="prop-val">
              <input type="text" value="${elem.styles && elem.styles.border ? elem.styles.border : '1px solid #000'}" onchange="updateSelectedStyle('border', this.value)">
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Format:</div>
            <div class="prop-val">
              <select onchange="updateSelectedProp('format', this.value)">
                <option value="" ${!elem.format ? 'selected' : ''}>Standard (0-9)</option>
                <option value="devanagari" ${elem.format === 'devanagari' ? 'selected' : ''}>Devanagari (०-९)</option>
              </select>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Text Wrapping:</div>
            <div class="prop-val">
              <select onchange="updateSelectedProp('textWrapping', this.value === 'true')">
                <option value="true" ${elem.textWrapping !== false ? 'selected' : ''}>ON (Wrap text)</option>
                <option value="false" ${elem.textWrapping === false ? 'selected' : ''}>OFF (Nowrap)</option>
              </select>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-label">Auto Height:</div>
            <div class="prop-val">
              <select onchange="updateSelectedProp('autoHeight', this.value === 'true')">
                <option value="true" ${elem.autoHeight !== false ? 'selected' : ''}>ON (Grow vertically)</option>
                <option value="false" ${elem.autoHeight === false ? 'selected' : ''}>OFF (Fixed height)</option>
              </select>
            </div>
          </div>
        </div>
      `;

  container.innerHTML = html;
  // Synchronize top toolbar font dropdown with selected element's font
  const topFontSel = document.getElementById('fmtFontFamily');
  if (topFontSel && elem.styles && elem.styles.fontFamily) {
    for (let opt of topFontSel.options) {
      if (opt.value === elem.styles.fontFamily || opt.value.includes(elem.styles.fontFamily) || elem.styles.fontFamily.includes(opt.value)) {
        topFontSel.value = opt.value;
        break;
      }
    }
  }
  const topSizeSel = document.getElementById('fmtFontSize');
  if (topSizeSel && elem.styles && elem.styles.fontSize) {
    topSizeSel.value = elem.styles.fontSize;
  }
}
function updateSelectedProp(key, value) {
  if (selectedElementIds.length === 0) return;
  const geom = getReportPrintableGeometry();
  const printableW = getHorizontalDesignWidth();
  selectedElementIds.forEach(id => {
    const elem = reportDef.elements.find(el => el.id === id);
    if (elem) {
      const sec = reportDef.sections.find(s => s.id === elem.sectionId);
      const secH = sec ? sec.height : 2000;
      if (key === 'x') {
        const num = Math.max(0, Math.min(Number(value) || 0, printableW - elem.width));
        elem.x = num;
      } else if (key === 'y') {
        const num = Math.max(0, Math.min(Number(value) || 0, secH - elem.height));
        elem.y = num;
      } else if (key === 'width') {
        const num = Math.max(5, Math.min(Number(value) || 5, printableW - elem.x));
        elem.width = num;
      } else if (key === 'height') {
        const num = Math.max(5, Math.min(Number(value) || 5, secH - elem.y));
        elem.height = num;
      } else if (key === 'text') {
        elem.text = value;
        elem.displayText = value;
      } else {
        elem[key] = value;
      }
      elem.xMm = pxToMm(elem.x);
      elem.yMm = pxToMm(elem.y);
      elem.widthMm = pxToMm(elem.width);
      elem.heightMm = pxToMm(elem.height);
      renderElementOnCanvas(elem);
      if ((key === 'x' || key === 'width') && COLUMN_PAIRS[id]) {
        const partner = reportDef.elements.find(el => el.id === COLUMN_PAIRS[id]);
        if (partner) {
          partner[key] = elem[key];
          partner.xMm = pxToMm(partner.x);
          partner.widthMm = pxToMm(partner.width);
          renderElementOnCanvas(partner);
        }
      }
    }
  });
  pushHistory();
  validateElementsOverflow();
  updatePropertiesPanel();
}
function updateSelectedZIndex(val) {
  const z = Math.max(0, Math.min(999, parseInt(val, 10) || 1));
  selectedElementIds.forEach(id => {
    const elem = reportDef.elements.find(el => el.id === id);
    if (elem) {
      elem.zIndex = z;
      if (!elem.styles) elem.styles = {};
      elem.styles.zIndex = z;
      const domEl = document.getElementById(`elem_${id}`);
      if (domEl) domEl.style.zIndex = z;
    }
  });
  pushHistory();
}
function updateSelectedStyle(styleKey, styleValue) {
  if (selectedElementIds.length === 0) return;
  selectedElementIds.forEach(id => {
    const elem = reportDef.elements.find(el => el.id === id);
    if (elem) {
      if (!elem.styles) elem.styles = {};
      elem.styles[styleKey] = styleValue;
      renderElementOnCanvas(elem);
    }
  });
  pushHistory();
}

function handleTextareaKeyDown(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const ta = e.target;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value || '';
    const indent = '    ';
    ta.value = val.substring(0, start) + indent + val.substring(end);
    ta.selectionStart = ta.selectionEnd = start + indent.length;
    updateSelectedProp('text', ta.value);
  }
}

function handleTextareaFieldDrop(e) {
  const dataStr = e.dataTransfer.getData('text/plain');
  if (!dataStr) return;
  try {
    const data = JSON.parse(dataStr);
    if (!data.fieldName) return;
    e.preventDefault();
    e.stopPropagation();
    const ta = e.target;
    let insertPos = ta.selectionStart;
    const val = ta.value || '';
    if (insertPos === undefined || insertPos < 0 || insertPos > val.length) insertPos = val.length;
    const placeholder = `{${data.fieldName}}`;
    const before = val.substring(0, insertPos);
    const after = val.substring(insertPos);
    const padBefore = (before.length > 0 && !/\s$/.test(before)) ? ' ' : '';
    const padAfter = (after.length > 0 && !/^\s/.test(after)) ? ' ' : '';
    const newVal = before + padBefore + placeholder + padAfter + after;
    ta.value = newVal;
    updateSelectedProp('text', newVal);
    const newCursor = before.length + padBefore.length + placeholder.length;
    ta.focus();
    try { ta.setSelectionRange(newCursor, newCursor); } catch (err) { }
    pushHistory();
    showToast(`Inserted ${placeholder}`);
  } catch (err) { }
}

function applyStyleToSelected(key, value) {
  updateSelectedStyle(key, value);
}
function toggleStyleSelected(key, val1, val2) {
  if (selectedElementIds.length === 0) return;
  const elem = reportDef.elements.find(el => el.id === selectedElementIds[0]);
  if (elem) {
    const current = elem.styles ? elem.styles[key] : '';
    const newVal = current === val1 ? val2 : val1;
    applyStyleToSelected(key, newVal);
  }
}
// Unified Layout & Overflow Validation (Req 19, 24)
function validateElementsOverflow() {
  if (!reportDef || !reportDef.elements) return { overflowList: [], overlapList: [] };
  let validation = null;
  if (window.ReportRenderer && ReportRenderer.Validator && ReportRenderer.Validator.validateReport) {
    validation = ReportRenderer.Validator.validateReport(reportDef);
  }
  const geom = getReportPrintableGeometry();
  const printableW = getHorizontalDesignWidth();

  const overflowList = [];
  const overlapList = [];

  reportDef.elements.forEach(elem => {
    const domEl = document.getElementById(`elem_${elem.id}`);
    if (!domEl) return;

    let hasOverflow = false;
    let hasOverlap = false;
    let titleParts = [];
    if (validation && validation.elementDiagnostics && validation.elementDiagnostics[elem.id]) {
      const diag = validation.elementDiagnostics[elem.id];
      if (!diag.insidePage) {
        hasOverflow = true;
        titleParts.push(`Exceeds printable width (+${diag.overflowRightMm}mm)`);
      }
      if (!diag.insideSection) {
        hasOverflow = true;
        titleParts.push(`Exceeds section bottom (+${diag.overflowBottomMm}mm)`);
      }
      if (diag.isOverlapping && elem.allowOverlap !== true) {
        hasOverlap = true;
        titleParts.push(`Overlaps with: ${diag.overlappingWith.join(', ')}`);
      }
    } else {
      // Fallback direct boundary check
      const sec = reportDef.sections.find(s => s.id === elem.sectionId);
      if (elem.x + elem.width > printableW + 4 || elem.x < 0) {
        hasOverflow = true;
        titleParts.push('Exceeds printable width');
      }
      if (sec && (elem.y + elem.height > sec.height + 2 || elem.y < 0)) {
        hasOverflow = true;
        titleParts.push('Exceeds section bottom');
      }
    }
    if (hasOverflow) {
      domEl.classList.add('has-overflow-error');
      domEl.classList.add('cr-overflow-warning');
      overflowList.push({ id: elem.id, name: elem.text || elem.fieldName || elem.id, reason: titleParts.join('; ') });
    } else {
      domEl.classList.remove('has-overflow-error');
      domEl.classList.remove('cr-overflow-warning');
    }
    if (hasOverlap) {
      domEl.classList.add('has-overlap-warning');
      overlapList.push({ id: elem.id, name: elem.text || elem.fieldName || elem.id });
    } else {
      domEl.classList.remove('has-overlap-warning');
    }
    domEl.title = titleParts.length > 0 ? ('Layout Alert: ' + titleParts.join(' | ')) : '';
  });
  const banner = document.getElementById('designerWarningBanner');
  if (banner) {
    if (overflowList.length > 0 || overlapList.length > 0) {
      banner.style.display = 'flex';
      const msgs = [];
      if (overflowList.length > 0) {
        msgs.push(`⚠️ <strong>${overflowList.length} element(s) exceed page/section boundaries</strong>`);
      }
      if (overlapList.length > 0) {
        msgs.push(`ℹ️ <strong>${overlapList.length} element(s) overlap</strong> <button onclick="autoResolveLayout()" class="cr-btn" style="margin-left:8px; padding:1px 8px; font-size:10.5px; font-weight:700; background:#16a34a; color:#fff; border:none; border-radius:3px; cursor:pointer;" title="Separate overlapping elements automatically">⚡ Auto-Fix (ओव्हरलॅप काढा)</button>`);
      }
      banner.innerHTML = msgs.join(' &bull; ') + ` <span style="margin-left:auto; font-size:10.5px; opacity:0.85;">(Printable Width: ${printableW}px / ${pxToMm(printableW)}mm)</span>`;
    } else {
      banner.style.display = 'none';
    }
  }

  return { overflowList, overlapList, validation };
}
function toggleBorderSelected() {
  if (selectedElementIds.length === 0) return;
  const elem = reportDef.elements.find(el => el.id === selectedElementIds[0]);
  if (elem) {
    const hasBorder = elem.styles && elem.styles.border && elem.styles.border !== 'none';
    applyBorderSelected(hasBorder ? 'none' : 'all');
  }
}
function applyBorderSelected(type) {
  if (type === 'dialog') {
    openBordersShadingModal('borders');
    return;
  }
  if (selectedElementIds.length === 0) {
    showToast('कृपया प्रथम घटक निवडा (Select element first)');
    return;
  }
  selectedElementIds.forEach(id => {
    const elem = reportDef.elements.find(el => el.id === id);
    if (!elem) return;
    if (!elem.styles) elem.styles = {};
    // Clear existing side-specific borders
    delete elem.styles.borderTop;
    delete elem.styles.borderBottom;
    delete elem.styles.borderLeft;
    delete elem.styles.borderRight;
    const color = elem.styles.borderColor || '#000000';
    switch (type) {
      case 'all':
        elem.styles.border = `1px solid ${color}`;
        break;
      case 'none':
        elem.styles.border = 'none';
        break;
      case 'bottom':
        elem.styles.border = 'none';
        elem.styles.borderBottom = `1px solid ${color}`;
        break;
      case 'top':
        elem.styles.border = 'none';
        elem.styles.borderTop = `1px solid ${color}`;
        break;
      case 'left':
        elem.styles.border = 'none';
        elem.styles.borderLeft = `1px solid ${color}`;
        break;
      case 'right':
        elem.styles.border = 'none';
        elem.styles.borderRight = `1px solid ${color}`;
        break;
      case 'top-bottom':
        elem.styles.border = 'none';
        elem.styles.borderTop = `1px solid ${color}`;
        elem.styles.borderBottom = `1px solid ${color}`;
        break;
      case 'double-bottom':
        elem.styles.border = 'none';
        elem.styles.borderBottom = `3px double ${color}`;
        break;
      case 'thick':
        elem.styles.border = `2px solid ${color}`;
        break;
      case 'dashed':
        elem.styles.border = `1px dashed ${color}`;
        break;
      default:
        elem.styles.border = `1px solid ${color}`;
    }
    renderElementOnCanvas(elem);
  });
  pushHistory();

  const labels = {
    all: 'All Borders (Box)',
    none: 'No Border',
    bottom: 'Bottom Border',
    top: 'Top Border',
    left: 'Left Border',
    right: 'Right Border',
    'top-bottom': 'Top & Bottom Border',
    'double-bottom': 'Double Bottom (Total)',
    thick: 'Thick Border (2px)',
    dashed: 'Dashed Border'
  };
  showToast(`Border: ${labels[type] || type}`);
}

function toggleDevanagariSelected() {
  if (selectedElementIds.length === 0) return;
  const elem = reportDef.elements.find(el => el.id === selectedElementIds[0]);
  if (elem) {
    const isDev = elem.format === 'devanagari';
    updateSelectedProp('format', isDev ? '' : 'devanagari');
    showToast(isDev ? 'Standard Digits' : 'Marathi Devanagari Digits');
  }
}

function addEditableBoxAt(secId, x, y) {
  const newId = `elem_${Date.now()}`;
  const newElem = {
    id: newId,
    sectionId: secId,
    type: 'text_box',
    text: 'नवीन मजकूर',
    x: Math.max(0, x - 10),
    y: Math.max(0, y - 8),
    width: 160,
    height: 24,
    xMm: pxToMm(Math.max(0, x - 10)),
    yMm: pxToMm(Math.max(0, y - 8)),
    widthMm: pxToMm(160),
    heightMm: pxToMm(24),
    styles: {
      fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
      fontSize: '11px',
      fontWeight: '400',
      textAlign: 'left',
      color: '#000000',
      border: '1px dashed #2563eb',
      backgroundColor: '#ffffff',
      padding: '2px 4px'
    },
    allowOverlap: true,
    visible: true
  };
  reportDef.elements.push(newElem);
  renderElementOnCanvas(newElem);
  selectedElementIds = [newId];
  updatePropertiesPanel();
  pushHistory();
  setTimeout(() => {
    handleElementDoubleClick(null, newId);
  }, 60);
}

function handleElementDoubleClick(e, elemId) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  if (elem.type === 'table') {
    openTableCellEditor(elemId);
    return;
  }
  if (!isInlineEditableElement(elem)) return;

  dragAction = null;
  selectedElementIds = [elemId];
  document.querySelectorAll('.cr-element').forEach((node) => {
    node.classList.toggle('selected', node.id === `elem_${elemId}`);
  });
  updatePropertiesPanel();
  updateStatusBar();

  // Remove existing inline editor if open
  const existing = document.querySelector('.cr-inline-editor');
  if (existing) existing.remove();

  const domEl = document.getElementById(`elem_${elemId}`);
  if (!domEl) return;

  const initialVal = elem.text !== undefined ? elem.text : (elem.fieldName ? `{${elem.fieldName}}` : '');

  const editor = document.createElement('textarea');
  editor.className = 'cr-inline-editor';
  editor.setAttribute('data-element-id', elemId);
  editor.setAttribute('aria-label', 'Edit selected report text');
  editor.spellcheck = false;
  editor.value = initialVal;
  editor.style.left = elem.x + 'px';
  editor.style.top = elem.y + 'px';
  editor.style.width = Math.max(elem.width, 90) + 'px';
  editor.style.height = Math.max(elem.height, 28) + 'px';
  editor.style.fontFamily = elem.styles && elem.styles.fontFamily ? elem.styles.fontFamily : 'inherit';
  editor.style.fontSize = elem.styles && elem.styles.fontSize ? elem.styles.fontSize : '9.5pt';
  editor.style.fontWeight = elem.styles && elem.styles.fontWeight ? elem.styles.fontWeight : 'normal';
  editor.style.color = elem.styles && elem.styles.color ? elem.styles.color : '#000000';
  editor.style.textAlign = elem.styles && elem.styles.textAlign ? elem.styles.textAlign : 'left';
  editor.style.lineHeight = elem.styles && elem.styles.lineHeight ? elem.styles.lineHeight : '1.2';

  const secDiv = domEl.parentElement;
  if (!secDiv) return;
  secDiv.appendChild(editor);
  domEl.style.visibility = 'hidden';

  // Keep clicks inside the textarea from starting canvas marquee/drag actions.
  ['mousedown', 'click', 'dblclick'].forEach((eventName) => {
    editor.addEventListener(eventName, (event) => event.stopPropagation());
  });

  editor.focus();
  editor.select();

  let committed = false;
  function commit() {
    if (committed) return;
    committed = true;
    const newVal = editor.value;
    editor.remove();
    if (newVal !== initialVal) {
      elem.text = newVal;
      if (elem.displayText !== undefined) elem.displayText = newVal;
      renderElementOnCanvas(elem);
      updatePropertiesPanel();
      pushHistory();
      showToast('Text updated');
    } else {
      domEl.style.visibility = '';
    }
  }

  editor.addEventListener('blur', commit);
  editor.addEventListener('keydown', (ev) => {
    ev.stopPropagation();
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      commit();
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      committed = true;
      editor.remove();
      domEl.style.visibility = '';
      domEl.focus();
    }
  });
}

function moveElementToSection(elemId, newSectionId) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (elem && elem.sectionId !== newSectionId) {
    elem.sectionId = newSectionId;
    renderCanvas();
    pushHistory();
    showToast(`Moved to ${newSectionId}`);
  }
}

let editingSubreportSectionId = null;
let preferredSubreportFields = new Set();

function humanizeFieldName(path) {
  const leaf = String(path || '').split('.').pop() || '';
  return leaf
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function inferSubreportFieldType(value) {
  if (Array.isArray(value)) return 'collection';
  if (value !== null && typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

function inferFieldCatalogFromJson(input) {
  const catalog = [];
  const seen = new Set();
  const add = (field) => {
    const key = `${field.collectionPath || ''}|${field.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      catalog.push(field);
    }
  };
  const walk = (value, path, activeCollection) => {
    if (Array.isArray(value)) {
      if (!path) return walk({ records: value }, '', '');
      add({ name: path, label: humanizeFieldName(path), type: 'collection', elementType: 'table' });
      const sample = value.find(item => item !== null && item !== undefined);
      if (sample && typeof sample === 'object' && !Array.isArray(sample)) {
        Object.entries(sample).forEach(([key, child]) => walk(child, `${path}.${key}`, path));
      }
      return;
    }
    if (value !== null && typeof value === 'object') {
      Object.entries(value).forEach(([key, child]) => {
        const childPath = path ? `${path}.${key}` : key;
        walk(child, childPath, activeCollection);
      });
      return;
    }
    if (!path) return;
    add({
      name: path,
      label: humanizeFieldName(path),
      type: inferSubreportFieldType(value),
      elementType: 'field',
      ...(activeCollection ? { collectionPath: activeCollection } : {})
    });
  };
  walk(input, '', '');
  return catalog;
}

function mergeDesignerFieldCatalog(fields) {
  const merged = new Map(DB_FIELDS.map(field => [`${field.collectionPath || ''}|${field.name}`, field]));
  fields.forEach(field => merged.set(`${field.collectionPath || ''}|${field.name}`, field));
  DB_FIELDS = [...merged.values()];
  reportDef.fieldCatalog = DB_FIELDS.map(field => ({
    name: field.name,
    label: field.label || humanizeFieldName(field.name),
    type: field.type || 'string',
    elementType: field.elementType || (field.type === 'collection' ? 'table' : 'field'),
    ...(field.group ? { group: field.group } : {}),
    ...(field.collectionPath ? { collectionPath: field.collectionPath } : {})
  }));
  populateFieldExplorer();
}

function reconcileElementTypesWithFieldCatalog() {
  if (!reportDef || !Array.isArray(reportDef.elements) || DB_FIELDS.length === 0) return false;
  const catalog = new Map();
  DB_FIELDS.forEach(field => {
    catalog.set(field.name, field);
    const leaf = String(field.name || '').split('.').pop();
    if (leaf && !catalog.has(leaf)) catalog.set(leaf, field);
  });

  let changed = false;
  reportDef.elements.forEach(element => {
    if (!element.fieldName) return;
    const binding = String(element.fieldName).replace(/^[@{}]+|[{}]+$/g, '');
    const metadata = catalog.get(binding) || catalog.get(binding.split('.').pop());
    const shouldBeImage = metadata?.elementType === 'image' || metadata?.type === 'image';
    if (shouldBeImage && element.type !== 'image') {
      element.type = 'image';
      element.designerType = 'image';
      element.text = '';
      element.displayText = '';
      element.styles = {
        ...(element.styles || {}),
        border: 'none',
        backgroundColor: 'transparent',
        padding: '0px'
      };
      changed = true;
    }
  });
  return changed;
}

function populateSubreportCollectionOptions(selectedPath = '') {
  const select = document.getElementById('subreportCollectionSelect');
  if (!select) return;
  const paths = new Set(DB_FIELDS.filter(field => field.type === 'collection').map(field => field.name));
  DB_FIELDS.forEach(field => {
    if (field.collectionPath) paths.add(field.collectionPath);
  });
  select.innerHTML = '<option value="">-- Select dynamic collection --</option>';
  [...paths].sort().forEach(path => {
    const option = document.createElement('option');
    option.value = path;
    option.textContent = `${humanizeFieldName(path)} (${path}[])`;
    select.appendChild(option);
  });
  if (selectedPath && paths.has(selectedPath)) select.value = selectedPath;
  else if (paths.size === 1) select.value = [...paths][0];
}

function renderSubreportWizardFields() {
  const dataPath = document.getElementById('subreportCollectionSelect')?.value || '';
  const container = document.getElementById('subreportFieldChecklist');
  if (!container) return;
  container.innerHTML = '';
  const fields = DB_FIELDS.filter(field => field.collectionPath === dataPath && field.type !== 'collection');
  if (!dataPath || fields.length === 0) {
    container.innerHTML = `<div style="font-size:10px; color:#64748b; text-align:center; padding:30px 8px;">${dataPath ? 'No child fields found. Detect them from sample JSON.' : 'Select or detect a collection first.'}</div>`;
    return;
  }
  fields.forEach((field, index) => {
    const relativeName = field.name.startsWith(`${dataPath}.`)
      ? field.name.slice(dataPath.length + 1)
      : field.name;
    const row = document.createElement('label');
    row.style.cssText = 'display:flex; align-items:flex-start; gap:7px; padding:6px; border-bottom:1px solid #e2e8f0; cursor:pointer; font-size:10px;';
    const checked = preferredSubreportFields.size > 0
      ? preferredSubreportFields.has(relativeName) || preferredSubreportFields.has(field.name)
      : index < 8;
    row.innerHTML = `
          <input type="checkbox" class="subreport-field-choice" value="${escapeHtml(field.name)}" ${checked ? 'checked' : ''} onchange="enforceSubreportFieldLimit(this)">
          <span style="min-width:0; flex:1;">
            <strong style="display:block; color:#1e293b;">${escapeHtml(field.label || humanizeFieldName(relativeName))}</strong>
            <span style="display:block; color:#64748b; font-family:monospace; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(relativeName)}</span>
          </span>
          <span class="field-badge">${escapeHtml(field.type || 'string')}</span>`;
    container.appendChild(row);
  });
  const selectAll = document.getElementById('subreportSelectAll');
  if (selectAll) selectAll.checked = fields.length <= 8 && fields.length > 0;
}

function enforceSubreportFieldLimit(changed) {
  const checked = [...document.querySelectorAll('.subreport-field-choice:checked')];
  if (checked.length > 8) {
    changed.checked = false;
    showToast('A subreport row supports up to 8 visible columns.');
  }
}

function toggleAllSubreportFields(checked) {
  const choices = [...document.querySelectorAll('.subreport-field-choice')];
  choices.forEach((choice, index) => { choice.checked = checked && index < 8; });
  if (checked && choices.length > 8) showToast('First 8 fields selected.');
}

function detectSubreportSchemaFromJson() {
  const text = document.getElementById('subreportSampleJson')?.value?.trim();
  if (!text) {
    showToast('Paste a sample JSON response first.');
    return;
  }
  try {
    const fields = inferFieldCatalogFromJson(JSON.parse(text));
    const collections = fields.filter(field => field.type === 'collection');
    if (!collections.length) {
      showToast('JSON must contain at least one array collection.');
      return;
    }
    mergeDesignerFieldCatalog(fields);
    preferredSubreportFields = new Set();
    populateSubreportCollectionOptions(collections[0].name);
    renderSubreportWizardFields();
    showToast(`Detected ${collections.length} collection(s) and ${fields.length} fields.`);
  } catch (error) {
    showToast(`Invalid sample JSON: ${error.message}`);
  }
}

function openSubreportWizard(sectionId = null) {
  if (!reportDef) return;
  editingSubreportSectionId = sectionId;
  const section = sectionId
    ? reportDef.sections.find(item => item.id === sectionId && item.bandType === 'subreport')
    : null;
  preferredSubreportFields = new Set(
    section
      ? reportDef.elements.filter(element => element.sectionId === section.id && element.fieldName).map(element => element.fieldName)
      : []
  );
  document.getElementById('subreportWizardTitle').textContent = section
    ? 'Configure Dynamic Subreport'
    : 'Dynamic Subreport Wizard';
  document.getElementById('subreportWizardApplyButton').textContent = section
    ? 'Update Subreport'
    : 'Create Subreport';
  document.getElementById('subreportDataSourceCode').value = reportDef.ntis?.dataSourceCode || 'UNASSIGNED';
  document.getElementById('subreportDesignPath').value = section?.dataPath || 'items';
  const existingColumnCount = section
    ? reportDef.elements.filter(element => element.sectionId === section.id && element.fieldName).length
    : 3;
  document.getElementById('subreportColumnCount').value = String(Math.max(1, Math.min(8, existingColumnCount || 3)));
  document.getElementById('subreportPreserveLayoutRow').style.display = section ? 'flex' : 'none';
  document.getElementById('subreportPreserveLayout').checked = true;
  populateSubreportCollectionOptions(section?.dataPath || '');
  renderSubreportWizardFields();
  document.getElementById('subreportWizardModal').classList.add('show');
}

function closeSubreportWizard() {
  document.getElementById('subreportWizardModal')?.classList.remove('show');
  editingSubreportSectionId = null;
  preferredSubreportFields = new Set();
}

function handleSubreportWizardOverlay(event) {
  if (event.target.id === 'subreportWizardModal') closeSubreportWizard();
}

function buildInlineSubreport(dataPath, selectedFields) {
  const uid = Date.now().toString(36);
  let section = editingSubreportSectionId
    ? reportDef.sections.find(item => item.id === editingSubreportSectionId)
    : null;
  let headerSection = null;
  if (section) {
    const sectionIndex = reportDef.sections.findIndex(item => item.id === section.id);
    const previous = reportDef.sections[sectionIndex - 1];
    if (isSubreportHeaderSection(previous, section)) headerSection = previous;
  }
  if (!section) {
    section = {
      id: `subreport-${uid}`,
      name: `Subreport: ${dataPath}`,
      height: 34,
      heightMm: pxToMm(34),
      type: 'detail',
      bandType: 'subreport',
      dataPath,
      keepTogether: true,
      visible: true
    };
    headerSection = {
      id: `subreport-header-${uid}`,
      name: `Subreport Header: ${dataPath}`,
      height: 34,
      heightMm: pxToMm(34),
      type: 'header',
      bandType: 'groupHeader',
      keepTogether: true,
      visible: true
    };
    const footerIndex = reportDef.sections.findIndex(item => item.bandType === 'pageFooter');
    const insertAt = footerIndex >= 0 ? footerIndex : reportDef.sections.length;
    reportDef.sections.splice(insertAt, 0, headerSection, section);
  }
  if (!headerSection) {
    headerSection = {
      id: `subreport-header-${uid}`,
      name: `Subreport Header: ${dataPath}`,
      height: 34,
      heightMm: pxToMm(34),
      type: 'header',
      bandType: 'groupHeader',
      keepTogether: true,
      visible: true
    };
    const sectionIndex = reportDef.sections.findIndex(item => item.id === section.id);
    reportDef.sections.splice(sectionIndex, 0, headerSection);
  }
  section.dataPath = dataPath;
  section.name = `Subreport: ${dataPath}`;
  headerSection.name = `Subreport Header: ${dataPath}`;
  const preserveLayout = Boolean(editingSubreportSectionId)
    && document.getElementById('subreportPreserveLayout')?.checked;
  const existingFields = reportDef.elements
    .filter(element => element.sectionId === section.id && element.fieldName)
    .sort((leftElement, rightElement) => leftElement.x - rightElement.x);
  const existingHeaders = reportDef.elements
    .filter(element => element.sectionId === headerSection.id)
    .sort((leftElement, rightElement) => leftElement.x - rightElement.x);
  if (preserveLayout && existingFields.length === selectedFields.length) {
    selectedFields.forEach((field, index) => {
      existingFields[index].fieldName = field.relativeName;
      existingFields[index].text = `{${field.relativeName}}`;
      if (existingHeaders[index] && (!existingHeaders[index].text || /^Column \d+$/i.test(existingHeaders[index].text)))
        existingHeaders[index].text = field.label;
    });
    activeSectionId = section.id;
    selectedElementIds = [];
    return;
  }
  reportDef.elements = reportDef.elements.filter(element =>
    element.sectionId !== section.id && element.sectionId !== headerSection.id
  );

  const left = mmToPx(reportDef.margins?.left ?? 10);
  const right = mmToPx(reportDef.margins?.right ?? 10);
  const usableWidth = Math.max(160, (reportDef.pageWidth || 794) - left - right);
  const columnWidth = Math.max(45, Math.floor(usableWidth / selectedFields.length));
  selectedFields.forEach((field, index) => {
    const x = left + (index * columnWidth);
    const width = index === selectedFields.length - 1
      ? usableWidth - (index * columnWidth)
      : columnWidth;
    reportDef.elements.push({
      id: `subreport-label-${uid}-${index}`,
      sectionId: headerSection.id,
      type: 'text',
      text: field.label,
      x, y: 1, width, height: headerSection.height - 2,
      xMm: pxToMm(x), yMm: pxToMm(1), widthMm: pxToMm(width), heightMm: pxToMm(headerSection.height - 2),
      styles: { fontSize: '9px', fontWeight: '700', border: '1px solid #475569', backgroundColor: '#e2e8f0', padding: '4px' },
      visible: true
    });
    reportDef.elements.push({
      id: `subreport-field-${uid}-${index}`,
      sectionId: section.id,
      type: 'field',
      text: `{${field.relativeName}}`,
      fieldName: field.relativeName,
      x, y: 0, width, height: section.height,
      xMm: pxToMm(x), yMm: 0, widthMm: pxToMm(width), heightMm: pxToMm(section.height),
      styles: { fontSize: '9px', border: '1px solid #64748b', backgroundColor: '#ffffff', padding: '4px' },
      visible: true
    });
  });
  activeSectionId = section.id;
  selectedElementIds = [];
}

function createDesignFirstSubreport() {
  const dataPath = document.getElementById('subreportDesignPath')?.value?.trim() || '';
  if (!dataPath) {
    showToast('Enter a temporary collection path, for example items.');
    return;
  }
  const requestedCount = Number(document.getElementById('subreportColumnCount')?.value || 3);
  const columnCount = Math.max(1, Math.min(8, Number.isFinite(requestedCount) ? Math.round(requestedCount) : 3));
  const detectedFields = [
    { name: dataPath, label: humanizeFieldName(dataPath), type: 'collection', elementType: 'table' },
    ...Array.from({ length: columnCount }, (_, index) => ({
      name: `${dataPath}.column${index + 1}`,
      label: `Column ${index + 1}`,
      type: 'string',
      elementType: 'field',
      collectionPath: dataPath
    }))
  ];
  mergeDesignerFieldCatalog(detectedFields);
  const selectedFields = detectedFields.slice(1).map(field => ({
    relativeName: field.name.slice(dataPath.length + 1),
    label: field.label
  }));
  const dataSourceCode = document.getElementById('subreportDataSourceCode')?.value?.trim() || 'UNASSIGNED';
  reportDef.ntis = { ...(reportDef.ntis || {}), dataSourceCode };
  const wasEditing = Boolean(editingSubreportSectionId);
  buildInlineSubreport(dataPath, selectedFields);
  closeSubreportWizard();
  renderCanvas();
  updateSectionsList();
  pushHistory();
  showToast(`${wasEditing ? 'Column layout updated' : 'Blank subreport created'}: ${columnCount} columns`);
}

function applySubreportWizard() {
  const dataPath = document.getElementById('subreportCollectionSelect')?.value || '';
  if (!dataPath) {
    showToast('Select a dynamic collection.');
    return;
  }
  const choices = [...document.querySelectorAll('.subreport-field-choice:checked')];
  if (!choices.length) {
    showToast('Select at least one child field.');
    return;
  }
  const selectedFields = choices.slice(0, 8).map(choice => {
    const fullName = choice.value;
    const metadata = DB_FIELDS.find(field => field.name === fullName && field.collectionPath === dataPath) || {};
    const relativeName = fullName.startsWith(`${dataPath}.`)
      ? fullName.slice(dataPath.length + 1)
      : fullName;
    return { relativeName, label: metadata.label || humanizeFieldName(relativeName) };
  });
  const dataSourceCode = document.getElementById('subreportDataSourceCode')?.value?.trim() || 'UNASSIGNED';
  reportDef.ntis = { ...(reportDef.ntis || {}), dataSourceCode };
  if (!reportDef.fieldCatalog?.length) mergeDesignerFieldCatalog(DB_FIELDS);
  const wasEditing = Boolean(editingSubreportSectionId);
  buildInlineSubreport(dataPath, selectedFields);
  closeSubreportWizard();
  renderCanvas();
  updateSectionsList();
  pushHistory();
  showToast(`${wasEditing ? 'Subreport updated' : 'Subreport connected'}: ${dataPath}[]`);
}

function addSubreportSection() {
  openSubreportWizard();
}

function createReportSection() {
  if (!reportDef?.sections) return;
  const typeElement = document.getElementById('newSectionType');
  const nameElement = document.getElementById('newSectionName');
  const bandType = typeElement?.value || 'detail';
  const defaultNames = {
    detail: 'Detail Section',
    groupHeader: 'Group Header',
    groupFooter: 'Group Footer',
    reportHeader: 'Report Header',
    reportFooter: 'Report Footer',
    pageHeader: 'Page Header',
    pageFooter: 'Page Footer'
  };
  const name = nameElement?.value?.trim() || defaultNames[bandType] || 'New Section';

  // Check for duplicate section name (case-insensitive)
  const existing = reportDef.sections.find(s => (s.name || '').trim().toLowerCase() === name.toLowerCase());
  if (existing) {
    const errorMsg = `This section is already exist: "${name}"`;
    showToast(errorMsg);

    const errEl = document.getElementById('createSectionError');
    if (errEl) {
      errEl.textContent = `⚠️ This section is already exist: "${name}" (हा विभाग आधीपासून अस्तित्वात आहे)`;
      errEl.style.display = 'block';
    }
    if (nameElement) {
      nameElement.style.borderColor = '#dc2626';
      nameElement.focus();
      nameElement.select();
    }

    // Highlight and scroll to the existing section
    selectSection(existing.id);
    const secEl = document.getElementById(`sec_${existing.id}`);
    if (secEl) secEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const sectionType = bandType === 'detail'
    ? 'detail'
    : ['groupFooter', 'reportFooter', 'pageFooter'].includes(bandType)
      ? 'footer'
      : 'header';
  const height = bandType === 'detail' ? 60 : 42;
  const section = {
    id: `${bandType}-${Date.now().toString(36)}`,
    name,
    height,
    heightMm: pxToMm(height),
    type: sectionType,
    bandType,
    keepTogether: true,
    visible: true
  };

  let insertAt = reportDef.sections.length;
  const groups = getMovableSectionGroups();
  const activeGroup = groups.find(group => group.some(item => item.id === activeSectionId));
  if (activeGroup) {
    const lastSection = activeGroup[activeGroup.length - 1];
    const activeIndex = reportDef.sections.findIndex(item => item.id === lastSection.id);
    if (activeIndex >= 0) insertAt = activeIndex + 1;
  }
  reportDef.sections.splice(insertAt, 0, section);
  activeSectionId = section.id;
  selectedElementIds = [];
  if (nameElement) {
    nameElement.value = '';
    nameElement.style.borderColor = '';
  }
  const errEl = document.getElementById('createSectionError');
  if (errEl) errEl.style.display = 'none';
  renderCanvas();
  updateSectionsList();
  pushHistory();
  showToast(`Section created: ${name}`);
}

function openCreateSectionBox() {
  const card = document.getElementById('createSectionCard');
  if (card) {
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  const errEl = document.getElementById('createSectionError');
  if (errEl) errEl.style.display = 'none';
  const input = document.getElementById('newSectionName');
  if (input) {
    input.style.borderColor = '';
    input.focus();
    input.select();
  }
  showToast('Type section name and press Enter to create');
}

function closeCreateSectionBox() {
  const card = document.getElementById('createSectionCard');
  if (card) card.style.display = 'none';
}

function handleNewSectionNameEnter() {
  createReportSection();
}

function editSubreportSection(sectionId) {
  openSubreportWizard(sectionId);
}

function isSubreportHeaderSection(section, nextSection) {
  if (!section || nextSection?.bandType !== 'subreport') return false;
  const nextId = String(nextSection.id || '');
  const expectedHeaderId = nextId.startsWith('subreport-')
    ? `subreport-header-${nextId.slice('subreport-'.length)}`
    : '';
  return section.id === expectedHeaderId
    || String(section.id || '').startsWith('subreport-header-')
    || /^subreport header\b/i.test(String(section.name || ''));
}

function getMovableSectionGroups() {
  const groups = [];
  for (let index = 0; index < reportDef.sections.length; index += 1) {
    const section = reportDef.sections[index];
    const next = reportDef.sections[index + 1];
    if (isSubreportHeaderSection(section, next)) {
      groups.push([section, next]);
      index += 1;
    } else {
      groups.push([section]);
    }
  }
  return groups;
}

function moveReportSection(sectionId, direction) {
  if (!reportDef?.sections?.length) return;
  const groups = getMovableSectionGroups();
  const currentIndex = groups.findIndex(group => group.some(section => section.id === sectionId));
  const targetIndex = currentIndex + direction;
  if (currentIndex < 0) return;
  if (targetIndex < 0 || targetIndex >= groups.length) {
    showToast(direction < 0
      ? 'This section is already at the top.'
      : 'This section is already at the bottom.');
    return;
  }
  [groups[currentIndex], groups[targetIndex]] = [groups[targetIndex], groups[currentIndex]];
  reportDef.sections = groups.flat();
  activeSectionId = sectionId;
  renderCanvas();
  updateSectionsList();
  pushHistory();
  showToast(direction < 0 ? 'Section moved one position up.' : 'Section moved one position down.');
}

function moveSubreportSection(sectionId, direction) {
  moveReportSection(sectionId, direction);
}

function deleteReportSection(sectionId) {
  if (!reportDef?.sections?.length) return;
  if (reportDef.sections.length <= 1) {
    showToast('कमीत कमी एक विभाग (section) असणे आवश्यक आहे.');
    return;
  }
  const sectionIndex = reportDef.sections.findIndex(s => s.id === sectionId);
  if (sectionIndex < 0) return;
  const sectionToDelete = reportDef.sections[sectionIndex];

  const elementsInSection = (reportDef.elements || []).filter(el => el.sectionId === sectionId);
  const confirmMsg = elementsInSection.length > 0
    ? `Are you sure you want to delete section "${sectionToDelete.name}"? It contains ${elementsInSection.length} element(s) which will also be deleted.`
    : `Are you sure you want to delete section "${sectionToDelete.name}"?`;

  if (!window.confirm(confirmMsg)) return;

  // Check if paired subreport section exists
  let pairedSection = null;
  if (sectionToDelete.bandType === 'subreport') {
    const uid = String(sectionToDelete.id).replace('subreport-', '');
    pairedSection = reportDef.sections.find(s => s.id === `subreport-header-${uid}`);
  } else if (String(sectionToDelete.id).startsWith('subreport-header-')) {
    const uid = String(sectionToDelete.id).replace('subreport-header-', '');
    pairedSection = reportDef.sections.find(s => s.id === `subreport-${uid}`);
  }

  let deletePaired = false;
  if (pairedSection) {
    deletePaired = window.confirm(`This section is linked with "${pairedSection.name}". Do you want to delete both?`);
  }

  // Remove elements in primary section
  if (reportDef.elements) {
    const deletedIds = new Set(elementsInSection.map(el => el.id));
    reportDef.elements = reportDef.elements.filter(el => el.sectionId !== sectionId);
    selectedElementIds = selectedElementIds.filter(id => !deletedIds.has(id));
  }

  // Remove section
  reportDef.sections.splice(sectionIndex, 1);

  // Remove paired subreport section and elements if requested
  if (deletePaired && pairedSection) {
    const pIndex = reportDef.sections.findIndex(s => s.id === pairedSection.id);
    if (pIndex >= 0) {
      reportDef.sections.splice(pIndex, 1);
      if (reportDef.elements) {
        const pairedElemIds = new Set((reportDef.elements || []).filter(el => el.sectionId === pairedSection.id).map(el => el.id));
        reportDef.elements = reportDef.elements.filter(el => el.sectionId !== pairedSection.id);
        selectedElementIds = selectedElementIds.filter(id => !pairedElemIds.has(id));
      }
    }
  }

  // If the deleted section was active, fallback to adjacent section or first available
  if (activeSectionId === sectionId || (deletePaired && pairedSection && activeSectionId === pairedSection.id)) {
    const fallbackIndex = Math.min(sectionIndex, reportDef.sections.length - 1);
    activeSectionId = reportDef.sections[fallbackIndex]?.id || reportDef.sections[0]?.id || null;
  }

  renderCanvas();
  updateSectionsList();
  updatePropertiesPanel();
  updateStatusBar();
  pushHistory();
  showToast(`Section "${sectionToDelete.name}" deleted.`);
}

// 18. Add New Element from Toolbox
function addNewElement(type, customProps = {}) {
  const newId = `elem_${Date.now()}`;
  let text = 'New Text';
  let width = 120;
  let height = 24;
  let fieldName = null;
  let elemType = 'text';
  let styles = {
    fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
    fontSize: '10px',
    fontWeight: '400',
    textAlign: 'left',
    color: '#000000',
    border: 'none',
    backgroundColor: 'transparent'
  };

  if (type === 'heading') {
    text = 'अहवाल शीर्षक / Report Title';
    width = 280;
    height = 32;
    styles.fontSize = '16px';
    styles.fontWeight = '700';
    styles.textAlign = 'center';
  } else if (type === 'subheading') {
    text = 'उपशीर्षक / Section Header';
    width = 220;
    height = 24;
    styles.fontSize = '12px';
    styles.fontWeight = '600';
  } else if (type === 'text') {
    text = 'मजकूर लेबल';
    width = 110;
    height = 22;
    styles.fontSize = '10px';
  } else if (type === 'field_label') {
    text = 'मालमत्ता क्रमांक :';
    width = 120;
    height = 22;
    styles.fontSize = '10px';
    styles.fontWeight = '600';
  } else if (type === 'field') {
    elemType = 'field';
    text = '{ConsumerNo}';
    fieldName = 'ConsumerNo';
    width = 120;
    height = 22;
    styles.border = '1px solid #7f9db9';
    styles.backgroundColor = '#f0f9ff';
  } else if (type === 'formula') {
    elemType = 'formula';
    text = '{@SumTaxTotal}';
    fieldName = '@SumTaxTotal';
    width = 120;
    height = 22;
    styles.border = '1px solid #cbd5e1';
    styles.backgroundColor = '#fffbeb';
    styles.fontWeight = '700';
  } else if (type === 'image') {
    elemType = 'image';
    text = 'Logo';
    width = 48;
    height = 48;
    styles.border = '1px dashed #94a3b8';
  } else if (type === 'qr') {
    text = 'QR Code';
    width = 65;
    height = 65;
    styles.border = '1px solid #334155';
    styles.backgroundColor = '#f8fafc';
    styles.textAlign = 'center';
    styles.fontSize = '9px';
  } else if (type === 'box') {
    elemType = 'box';
    text = '';
    width = 140;
    height = 50;
    styles.border = '1.5px solid #000000';
    styles.backgroundColor = 'transparent';
  } else if (type === 'box_rounded') {
    elemType = 'box_rounded';
    text = '';
    width = 140;
    height = 50;
    styles.border = '1.5px solid #000000';
    styles.borderRadius = '8px';
    styles.backgroundColor = 'transparent';
  } else if (type === 'circle') {
    elemType = 'circle';
    text = '';
    width = 70;
    height = 70;
    styles.border = '1.5px solid #000000';
    styles.borderRadius = '50%';
    styles.backgroundColor = 'transparent';
  } else if (type === 'arrow_right') {
    elemType = 'arrow_right';
    text = '';
    width = 90;
    height = 50;
    styles.borderColor = '#000000';
    styles.backgroundColor = 'transparent';
    styles.borderWidth = 1.5;
    styles.border = 'none';
  } else if (type === 'arrow_down') {
    elemType = 'arrow_down';
    text = '';
    width = 50;
    height = 90;
    styles.borderColor = '#000000';
    styles.backgroundColor = 'transparent';
    styles.borderWidth = 1.5;
    styles.border = 'none';
  } else if (type === 'arrow_line') {
    elemType = 'arrow_line';
    text = '';
    width = 160;
    height = 40;
    styles.backgroundColor = '#000000';
    styles.color = '#000000';
    styles.lineThickness = 2;
    styles.border = 'none';
  } else if (type === 'text_box') {
    elemType = 'text_box';
    text = 'मजकूर पेटी / Text Box';
    width = 160;
    height = 45;
    styles.border = '1px solid #1e293b';
    styles.backgroundColor = '#ffffff';
    styles.padding = '4px 6px';
    styles.fontSize = '10px';
  } else if (type === 'badge') {
    text = 'भरणा झाला / PAID';
    width = 110;
    height = 24;
    styles.border = '1px solid #16a34a';
    styles.borderRadius = '12px';
    styles.backgroundColor = '#f0fdf4';
    styles.color = '#15803d';
    styles.fontWeight = '700';
    styles.textAlign = 'center';
    styles.fontSize = '9.5px';
  } else if (type === 'line') {
    elemType = 'line';
    text = '';
    width = 250;
    height = 2;
    styles.backgroundColor = '#000000';
    styles.border = 'none';
  } else if (type === 'line_vert') {
    elemType = 'line';
    text = '';
    width = 2;
    height = 60;
    styles.backgroundColor = '#000000';
    styles.border = 'none';
  } else if (type === 'line_dashed') {
    elemType = 'line';
    text = '';
    width = 250;
    height = 1;
    styles.border = 'none';
    styles.borderTop = '1px dashed #000000';
  } else if (type === 'signature') {
    text = 'प्राधिकृत स्वाक्षरी\n(Authorized Signatory)';
    width = 150;
    height = 50;
    styles.border = 'none';
    styles.borderTop = '1px solid #000000';
    styles.textAlign = 'center';
    styles.fontSize = '9.5px';
  }

  const finalSecId = customProps.sectionId || activeSectionId;
  let finalX = customProps.x !== undefined ? customProps.x : 50;
  let finalY = customProps.y !== undefined ? customProps.y : 10;
  let finalW = customProps.width !== undefined ? customProps.width : width;
  let finalH = customProps.height !== undefined ? customProps.height : height;

  // Collision avoidance for new toolbox elements when placed at default position
  if (elemType !== 'line' && elemType !== 'arrow_line' && customProps.x === undefined && customProps.y === undefined) {
    const sec = reportDef.sections.find(s => s.id === finalSecId);
    if (sec) {
      const secEls = reportDef.elements.filter(el => el.sectionId === finalSecId && el.visible !== false && el.allowOverlap !== true && el.type !== 'line');
      let collided = true;
      let pCount = 0;
      while (collided && pCount < 30) {
        collided = false;
        pCount++;
        for (const other of secEls) {
          const ox = (finalX < other.x + other.width) && (finalX + finalW > other.x);
          const oy = (finalY < other.y + other.height) && (finalY + finalH > other.y);
          if (ox && oy) {
            collided = true;
            finalY = other.y + other.height + 4;
            break;
          }
        }
      }
      if (finalY + finalH > sec.height) {
        sec.height = finalY + finalH + 20;
        const secDiv = document.getElementById(`sec_${sec.id}`);
        if (secDiv) secDiv.style.height = sec.height + 'px';
      }
    }
  }

  let finalX1 = customProps.x1 !== undefined ? customProps.x1 : finalX;
  let finalY1 = customProps.y1 !== undefined ? customProps.y1 : finalY;
  let finalX2 = customProps.x2 !== undefined ? customProps.x2 : (finalX + finalW);
  let finalY2 = customProps.y2 !== undefined ? customProps.y2 : (customProps.y2 !== undefined ? customProps.y2 : finalY);

  if (elemType === 'line' || elemType === 'arrow_line') {
    finalX = Math.round(Math.min(finalX1, finalX2));
    finalY = Math.round(Math.min(finalY1, finalY2));
    finalW = Math.round(Math.max(1, Math.abs(finalX2 - finalX1)));
    finalH = Math.round(Math.max(1, Math.abs(finalY2 - finalY1)));
  }

  const newElem = {
    id: newId,
    sectionId: finalSecId,
    type: elemType,
    text: text,
    fieldName: fieldName,
    x: finalX,
    y: finalY,
    width: finalW,
    height: finalH,
    x1: finalX1,
    y1: finalY1,
    x2: finalX2,
    y2: finalY2,
    xMm: pxToMm(finalX),
    yMm: pxToMm(finalY),
    widthMm: pxToMm(finalW),
    heightMm: pxToMm(finalH),
    styles: customProps.styles || styles,
    visible: true
  };

  reportDef.elements.push(newElem);
  renderElementOnCanvas(newElem);
  selectedElementIds = [newId];
  updatePropertiesPanel();
  pushHistory();
  showToast(`Added: ${type}`);
}

// 19. Insert Field from Tree
function fieldBindingForSection(fieldName, sectionId) {
  const section = reportDef?.sections?.find(item => item.id === sectionId);
  const dataPath = section?.bandType === 'subreport' ? section.dataPath : '';
  return dataPath && fieldName.startsWith(`${dataPath}.`)
    ? fieldName.slice(dataPath.length + 1)
    : fieldName;
}


function insertFieldIntoActiveSection(fieldName, category = 'data') {
  const binding = fieldBindingForSection(fieldName, activeSectionId);
  const newId = `field_${fieldName.toLowerCase().replace(/[@{}]/g, '')}_${Date.now()}`;
  const isFormula = category === 'formula' || fieldName.startsWith('@');
  const metadata = DB_FIELDS.find(field => field.name === fieldName);
  const isImage = !isFormula && (metadata?.elementType === 'image' || metadata?.type === 'image');
  const newElem = {
    id: newId,
    sectionId: activeSectionId,
    type: isFormula ? 'formula' : (isImage ? 'image' : 'field'),
    text: isImage ? '' : `{${binding}}`,
    fieldName: binding,
    x: 50,
    y: 10,
    width: 100,
    height: 28,
    xMm: pxToMm(50),
    yMm: pxToMm(10),
    widthMm: pxToMm(100),
    heightMm: pxToMm(28),
    styles: {
      fontSize: '8.5px',
      textAlign: 'left',
      border: 'none',
      backgroundColor: hasPdfTemplateBackground() && !isImage ? '#ffffff' : 'transparent',
      padding: hasPdfTemplateBackground() && !isImage ? '1px 3px' : '0px'
    },
    visible: true
  };
  reportDef.elements.push(newElem);
  renderElementOnCanvas(newElem);
  selectedElementIds = [newId];
  updatePropertiesPanel();
  pushHistory();
  showToast(`Inserted {${binding}}`);
}

function handleDragFieldStart(e, category, fieldName, elementType, valueType) {
  e.dataTransfer.setData('text/plain', JSON.stringify({ category, fieldName, elementType, valueType }));
}


function getDropCaretCharIndex(containerEl, clientX, clientY) {
  let range = null;
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(clientX, clientY);
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(clientX, clientY);
    if (pos && pos.offsetNode) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
    }
  }

  if (!range || !range.startContainer) return -1;

  const contentSpan = containerEl.querySelector('.cr-textbox-content') || containerEl;
  const targetNode = contentSpan.contains(range.startContainer) ? contentSpan : (containerEl.contains(range.startContainer) ? containerEl : null);
  if (!targetNode) return -1;

  try {
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(targetNode);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  } catch (err) {
    return -1;
  }
}

function handleCanvasDrop(e, targetSecId) {
  if (!e) return;
  if (e._designerDropHandled) return;
  e._designerDropHandled = true;
  if (e.preventDefault) e.preventDefault();
  if (e.stopPropagation) e.stopPropagation();
  const dataStr = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
  if (!dataStr) return;
  try {
    const data = JSON.parse(dataStr);
    if (data.fieldName) {
      // If dropped onto an existing text_box or text element, insert the placeholder at caret/cursor position
      let targetElemDiv = (e.target && e.target.closest) ? e.target.closest('.cr-element') : null;
      if (!targetElemDiv && document.elementFromPoint) {
        const underPoint = document.elementFromPoint(e.clientX, e.clientY);
        if (underPoint) targetElemDiv = underPoint.closest('.cr-element');
      }

      if (!targetElemDiv && targetSecId) {
        const sec = reportDef.sections.find(s => s.id === targetSecId);
        if (sec) {
          const secDiv = document.getElementById(`sec_${sec.id}`);
          if (secDiv) {
            const rect = secDiv.getBoundingClientRect();
            const dropCanvasX = (e.clientX - rect.left) / zoomLevel;
            const dropCanvasY = (e.clientY - rect.top) / zoomLevel;
            const hitElem = reportDef.elements.find(el =>
              el.sectionId === targetSecId &&
              (el.type === 'text_box' || el.type === 'text') &&
              dropCanvasX >= el.x && dropCanvasX <= el.x + el.width &&
              dropCanvasY >= el.y && dropCanvasY <= el.y + el.height
            );
            if (hitElem) {
              targetElemDiv = document.getElementById(`elem_${hitElem.id}`);
            }
          }
        }
      }

      if (targetElemDiv) {
        const targetId = targetElemDiv.id.replace('elem_', '');
        const existingElem = reportDef.elements.find(el => el.id === targetId);

        if (existingElem && (existingElem.type === 'text_box' || existingElem.type === 'text')) {
          const oldText = existingElem.text !== undefined ? existingElem.text : (existingElem.displayText || '');
          const placeholder = `{${data.fieldName}}`;

          // Calculate exact character offset from cursor drop position
          const charIdx = getDropCaretCharIndex(targetElemDiv, e.clientX, e.clientY);
          let insertIdx = (charIdx >= 0 && charIdx <= oldText.length) ? charIdx : oldText.length;

          const before = oldText.substring(0, insertIdx);
          const after = oldText.substring(insertIdx);
          const padBefore = (before.length > 0 && !/\s$/.test(before)) ? ' ' : '';
          const padAfter = (after.length > 0 && !/^\s/.test(after)) ? ' ' : '';

          const newText = before + padBefore + placeholder + padAfter + after;
          existingElem.text = newText;
          existingElem.displayText = newText;
          renderElementOnCanvas(existingElem);
          selectedElementIds = [existingElem.id];
          updatePropertiesPanel();

          // Update textarea in properties panel if present and place cursor
          const ta = document.getElementById('propDisplayTextMulti');
          if (ta) {
            ta.value = newText;
            const newPos = before.length + padBefore.length + placeholder.length;
            ta.focus();
            try { ta.setSelectionRange(newPos, newPos); } catch (e) { }
          }

          pushHistory();
          showToast(`Inserted ${placeholder} at cursor position`);
          return;
        }
      }

      const sec = reportDef.sections.find(s => s.id === targetSecId) || reportDef.sections[0];
      const secDiv = document.getElementById(`sec_${sec.id}`);
      const rect = secDiv ? secDiv.getBoundingClientRect() : document.getElementById('reportCanvas').getBoundingClientRect();

      let dropX = Math.round((e.clientX - rect.left) / zoomLevel);
      let dropY = Math.round((e.clientY - rect.top) / zoomLevel);

      if (snapToGrid) {
        dropX = Math.round(dropX / SNAP_SIZE) * SNAP_SIZE;
        dropY = Math.round(dropY / SNAP_SIZE) * SNAP_SIZE;
      }

      const newId = `elem_${data.fieldName.toLowerCase().replace(/[@{}()]/g, '_')}_${Date.now()}`;
      const isFormula = data.category === 'formula' || data.fieldName.startsWith('@');
      const isParam = data.category === 'parameter';
      const isStatic = data.category === 'static';
      const binding = fieldBindingForSection(data.fieldName, sec.id);
      const metadata = DB_FIELDS.find(field => field.name === data.fieldName);
      const resolvedElementType = data.elementType || metadata?.elementType;
      const resolvedValueType = data.valueType || metadata?.type;
      const isImage = !isFormula && !isStatic
        && (resolvedElementType === 'image' || resolvedValueType === 'image');

      let elemType = isFormula ? 'formula' : (isStatic ? (data.fieldName === 'RectBox' ? 'box' : (data.fieldName === 'HLine' ? 'line' : (data.fieldName === 'LogoImage' ? 'image' : 'text'))) : (isImage ? 'image' : 'field'));
      let textVal = isImage ? '' : (isFormula ? `{@${data.fieldName.replace(/^@/, '')}}` : (isParam ? `{?${data.fieldName.replace(/^@/, '')}}` : (isStatic ? (data.fieldName === 'TextLabel' ? 'New Label' : (data.fieldName === 'HeaderTitle' ? 'Report Title' : '')) : `{${binding}}`)));

      let elemW = 110;
      let elemH = 28;
      let elemX = Math.max(0, Math.min(dropX, (reportDef.pageWidth || 1123) - elemW));
      let elemY = Math.max(0, dropY);

      // Collision avoidance: ensure new element doesn't overlap any existing element in this section
      if (elemType !== 'line') {
        const secEls = reportDef.elements.filter(el => el.sectionId === sec.id && el.id !== newId && el.visible !== false && el.allowOverlap !== true && el.type !== 'line' && !(el.type === 'box' && (!el.styles || !el.styles.backgroundColor || el.styles.backgroundColor === 'transparent')));
        let collided = true;
        let pCount = 0;
        while (collided && pCount < 30) {
          collided = false;
          pCount++;
          for (const other of secEls) {
            const ox = (elemX < other.x + other.width) && (elemX + elemW > other.x);
            const oy = (elemY < other.y + other.height) && (elemY + elemH > other.y);
            if (ox && oy) {
              collided = true;
              elemY = other.y + other.height + 4;
              break;
            }
          }
        }
        if (elemY + elemH > sec.height) {
          sec.height = elemY + elemH + 20;
          if (secDiv) secDiv.style.height = sec.height + 'px';
        }
      }

      const newElem = {
        id: newId,
        sectionId: sec.id,
        type: elemType,
        text: textVal,
        fieldName: isStatic ? null : binding,
        x: elemX,
        y: elemY,
        width: elemW,
        height: elemH,
        xMm: pxToMm(elemX),
        yMm: pxToMm(elemY),
        widthMm: pxToMm(elemW),
        heightMm: pxToMm(elemH),
        styles: {
          fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
          fontSize: '8.5px',
          textAlign: 'left',
          border: 'none',
          backgroundColor: elemType === 'line' ? '#000000' : (elemType === 'field' || elemType === 'text_box' ? '#ffffff' : 'transparent'),
          padding: elemType === 'field' ? '1px 3px' : '0px',
          color: '#000000'
        },
        visible: true
      };

      reportDef.elements.push(newElem);
      renderElementOnCanvas(newElem);
      selectedElementIds = [newId];
      updatePropertiesPanel();
      pushHistory();
      showToast(`Added ${data.fieldName} to ${sec.name}`);
    }
  } catch (err) {
    console.error('Error handling drop:', err);
  }
}

window.addEventListener('dragover', (e) => e.preventDefault());

window.addEventListener('drop', (e) => {
  if (e._designerDropHandled) return;
  e._designerDropHandled = true;
  const secTarget = e.target.closest('.cr-section');
  const targetSecId = secTarget ? secTarget.id.replace('sec_', '') : activeSectionId;
  handleCanvasDrop(e, targetSecId);
});

// 20. Delete / Duplicate Elements
function deleteSelected() {
  if (selectedElementIds.length === 0) return;
  reportDef.elements = reportDef.elements.filter(el => !selectedElementIds.includes(el.id));
  selectedElementIds.forEach(id => {
    const domEl = document.getElementById(`elem_${id}`);
    if (domEl) domEl.remove();
  });
  selectedElementIds = [];
  updatePropertiesPanel();
  pushHistory();
  showToast('Deleted selected elements');
}

function duplicateSelected() {
  if (selectedElementIds.length === 0) return;
  const newSelected = [];
  selectedElementIds.forEach(id => {
    const item = reportDef.elements.find(el => el.id === id);
    if (item) {
      const clone = JSON.parse(JSON.stringify(item));
      clone.id = `${item.id}_copy_${Date.now()}`;
      clone.x = Math.min((reportDef.pageWidth || 1123) - clone.width, item.x + 15);
      clone.y += 15;
      clone.xMm = pxToMm(clone.x);
      clone.yMm = pxToMm(clone.y);
      reportDef.elements.push(clone);
      renderElementOnCanvas(clone);
      newSelected.push(clone.id);
    }
  });
  selectedElementIds = newSelected;
  updatePropertiesPanel();
  pushHistory();
  showToast('Copied element');
}

function selectAll() {
  if (!reportDef || !reportDef.elements || reportDef.elements.length === 0) return;
  const secElems = (activeSectionId && reportDef.elements.some(el => el.sectionId === activeSectionId))
    ? reportDef.elements.filter(el => el.sectionId === activeSectionId)
    : reportDef.elements;
  selectedElementIds = secElems.map(el => el.id);
  document.querySelectorAll('.cr-element').forEach(el => {
    const id = el.id.replace('elem_', '');
    if (selectedElementIds.includes(id)) el.classList.add('selected');
    else el.classList.remove('selected');
  });
  updatePropertiesPanel();
  updateStatusBar();
  showToast(`Selected ${selectedElementIds.length} elements`);
}

// 20b. Layering (Bring to Front / Send to Back)
function bringToFront() {
  if (selectedElementIds.length === 0) return;
  selectedElementIds.forEach(id => {
    const idx = reportDef.elements.findIndex(el => el.id === id);
    if (idx >= 0) {
      const elem = reportDef.elements.splice(idx, 1)[0];
      reportDef.elements.push(elem);
      const domEl = document.getElementById(`elem_${id}`);
      if (domEl && domEl.parentElement) {
        domEl.parentElement.appendChild(domEl);
      }
    }
  });
  pushHistory();
  showToast('Brought to Front');
}

function sendToBack() {
  if (selectedElementIds.length === 0) return;
  selectedElementIds.slice().reverse().forEach(id => {
    const idx = reportDef.elements.findIndex(el => el.id === id);
    if (idx >= 0) {
      const elem = reportDef.elements.splice(idx, 1)[0];
      reportDef.elements.unshift(elem);
      const domEl = document.getElementById(`elem_${id}`);
      if (domEl && domEl.parentElement) {
        domEl.parentElement.insertBefore(domEl, domEl.parentElement.firstChild);
      }
    }
  });
  pushHistory();
  showToast('Sent to Back');
}

// 21. Align Tools
function alignElements(action) {
  if (selectedElementIds.length < 1) {
    showToast('कृपया प्रथम घटक निवडा (Select elements to align)');
    return;
  }
  const elems = selectedElementIds.map(id => reportDef.elements.find(el => el.id === id)).filter(Boolean);
  if (elems.length === 0) return;

  const first = elems[0];
  const geom = getReportPrintableGeometry();
  const printableW = getHorizontalDesignWidth();

  // 1. SINGLE ELEMENT: Align to Page / Section boundaries
  if (elems.length === 1) {
    const el = elems[0];
    const sec = reportDef.sections.find(s => s.id === el.sectionId);
    const secH = sec ? sec.height : 2000;

    if (action === 'left') {
      el.x = 0;
    } else if (action === 'center') {
      el.x = Math.max(0, Math.round((printableW - el.width) / 2));
    } else if (action === 'right') {
      el.x = Math.max(0, printableW - el.width);
    } else if (action === 'top') {
      el.y = 0;
    } else if (action === 'middle') {
      el.y = Math.max(0, Math.round((secH - el.height) / 2));
    } else if (action === 'bottom') {
      el.y = Math.max(0, secH - el.height);
    } else if (action === 'centerPage') {
      el.x = Math.max(0, Math.round((printableW - el.width) / 2));
    } else if (action === 'distributeH' || action === 'distributeV') {
      showToast('समान अंतरासाठी किमान ३ घटक निवडा (Ctrl धरून घटक निवडा)');
      return;
    } else if (action === 'sameWidth' || action === 'sameHeight') {
      showToast('समान आकारासाठी किमान २ घटक निवडा (Ctrl धरून घटक निवडा)');
      return;
    }
  } else {
    // 2. MULTI-ELEMENT: Align relative to each other (selection bounding box)
    if (action === 'left') {
      const minX = Math.min(...elems.map(el => el.x));
      elems.forEach(el => el.x = Math.max(0, Math.min(minX, printableW - el.width)));
    } else if (action === 'center') {
      const avgCenter = Math.round(elems.reduce((acc, el) => acc + (el.x + el.width / 2), 0) / elems.length);
      elems.forEach(el => el.x = Math.max(0, Math.min(Math.round(avgCenter - el.width / 2), printableW - el.width)));
    } else if (action === 'right') {
      const maxRight = Math.min(printableW, Math.max(...elems.map(el => el.x + el.width)));
      elems.forEach(el => el.x = Math.max(0, maxRight - el.width));
    } else if (action === 'top') {
      const minY = Math.min(...elems.map(el => el.y));
      elems.forEach(el => el.y = Math.max(0, minY));
    } else if (action === 'middle') {
      const avgMiddle = Math.round(elems.reduce((acc, el) => acc + (el.y + el.height / 2), 0) / elems.length);
      elems.forEach(el => {
        const sec = reportDef.sections.find(s => s.id === el.sectionId);
        const secH = sec ? sec.height : 2000;
        el.y = Math.max(0, Math.min(Math.round(avgMiddle - el.height / 2), secH - el.height));
      });
    } else if (action === 'bottom') {
      const maxBottom = Math.max(...elems.map(el => el.y + el.height));
      elems.forEach(el => {
        const sec = reportDef.sections.find(s => s.id === el.sectionId);
        const secH = sec ? sec.height : 2000;
        el.y = Math.max(0, Math.min(maxBottom - el.height, secH - el.height));
      });
    } else if (action === 'distributeH') {
      if (elems.length < 3) {
        showToast('समान अंतरासाठी किमान ३ घटक निवडा (Select at least 3 elements)');
        return;
      }
      const sorted = [...elems].sort((a, b) => a.x - b.x);
      const minX = Math.max(0, sorted[0].x);
      const maxX = Math.min(printableW, sorted[sorted.length - 1].x + sorted[sorted.length - 1].width);
      const totalElemWidth = sorted.reduce((sum, el) => sum + el.width, 0);
      const totalGap = (maxX - minX) - totalElemWidth;
      if (totalGap > 0) {
        const gap = totalGap / (sorted.length - 1);
        let curX = minX;
        sorted.forEach((el, idx) => {
          if (idx > 0 && idx < sorted.length - 1) el.x = Math.round(curX);
          curX += el.width + gap;
          el.x = Math.max(0, Math.min(el.x, printableW - el.width));
        });
      } else {
        const minCenter = sorted[0].x + sorted[0].width / 2;
        const maxCenter = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width / 2;
        const step = (maxCenter - minCenter) / (sorted.length - 1);
        sorted.forEach((el, idx) => {
          if (idx > 0 && idx < sorted.length - 1) {
            el.x = Math.round((minCenter + idx * step) - el.width / 2);
          }
          el.x = Math.max(0, Math.min(el.x, printableW - el.width));
        });
      }
    } else if (action === 'distributeV') {
      if (elems.length < 3) {
        showToast('समान अंतरासाठी किमान ३ घटक निवडा (Select at least 3 elements)');
        return;
      }
      const sorted = [...elems].sort((a, b) => a.y - b.y);
      const minY = Math.max(0, sorted[0].y);
      const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
      const totalElemHeight = sorted.reduce((sum, el) => sum + el.height, 0);
      const totalGap = (maxY - minY) - totalElemHeight;
      if (totalGap > 0) {
        const gap = totalGap / (sorted.length - 1);
        let curY = minY;
        sorted.forEach((el, idx) => {
          if (idx > 0 && idx < sorted.length - 1) el.y = Math.round(curY);
          curY += el.height + gap;
          const sec = reportDef.sections.find(s => s.id === el.sectionId);
          const secH = sec ? sec.height : 2000;
          el.y = Math.max(0, Math.min(el.y, secH - el.height));
        });
      } else {
        const minCenter = sorted[0].y + sorted[0].height / 2;
        const maxCenter = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height / 2;
        const step = (maxCenter - minCenter) / (sorted.length - 1);
        sorted.forEach((el, idx) => {
          if (idx > 0 && idx < sorted.length - 1) {
            el.y = Math.round((minCenter + idx * step) - el.height / 2);
          }
          const sec = reportDef.sections.find(s => s.id === el.sectionId);
          const secH = sec ? sec.height : 2000;
          el.y = Math.max(0, Math.min(el.y, secH - el.height));
        });
      }
    } else if (action === 'sameWidth') {
      elems.forEach(el => {
        el.width = Math.max(5, Math.min(first.width, printableW - el.x));
      });
    } else if (action === 'sameHeight') {
      elems.forEach(el => {
        const sec = reportDef.sections.find(s => s.id === el.sectionId);
        const secH = sec ? sec.height : 2000;
        el.height = Math.max(5, Math.min(first.height, secH - el.y));
      });
    } else if (action === 'centerPage') {
      elems.forEach(el => {
        el.x = Math.max(0, Math.round((printableW - el.width) / 2));
      });
    }
  }

  // Sync and render all modified elements
  elems.forEach(el => {
    el.xMm = pxToMm(el.x);
    el.yMm = pxToMm(el.y);
    el.widthMm = pxToMm(el.width);
    el.heightMm = pxToMm(el.height);
    renderElementOnCanvas(el);
  });
  updatePropertiesPanel();
  validateElementsOverflow();
  pushHistory();
  showToast(`Aligned elements: ${action}`);
}

function selectSection(secId) {
  activeSectionId = secId;
  document.querySelectorAll('.cr-gutter-tag').forEach(t => t.classList.remove('active'));
  const tag = document.getElementById(`tag_${secId}`);
  if (tag) tag.classList.add('active');
  document.querySelectorAll('.cr-section-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`secCard_${secId}`);
  if (card) card.classList.add('active');
  showToast(`Active section: ${secId}`);
}

function setSectionHeight(secId) {
  const sec = reportDef.sections.find(s => s.id === secId);
  if (!sec) return;
  const currentMm = pxToMm(sec.height);
  const input = prompt(`Section "${sec.name}" ची उंची mm मध्ये टाका:\nEnter height in mm for section "${sec.name}":`, currentMm);
  if (input === null || input.trim() === '') return;
  const newMm = parseFloat(input);
  if (isNaN(newMm) || newMm < 1) {
    showToast('Invalid height. Please enter a positive number. / चुकीची उंची, कृपया योग्य संख्या टाका.');
    return;
  }
  pushHistory();
  const newPx = mmToPx(newMm);
  sec.height = newPx;
  sec.heightMm = newMm;
  const secDiv = document.getElementById(`sec_${sec.id}`);
  if (secDiv) secDiv.style.height = newPx + 'px';
  const gutterItem = document.getElementById(`gutter_${sec.id}`);
  if (gutterItem) gutterItem.style.height = newPx + 'px';
  const badge = document.getElementById(`badge_${sec.id}`);
  if (badge) badge.textContent = newPx;
  updateSectionsList();
  showToast(`Section "${sec.name}" height set to ${newMm}mm (${newPx}px)`);
}

function toggleGrid() {
  isGridVisible = !isGridVisible;
  document.querySelectorAll('.cr-section').forEach(sec => {
    if (isGridVisible) sec.classList.remove('grid-disabled');
    else sec.classList.add('grid-disabled');
  });
  const btn = document.getElementById('btnToggleGrid');
  btn.style.background = isGridVisible ? '#c8ddf2' : '';
  showToast(isGridVisible ? 'Grid: Visible' : 'Grid: Hidden');
}

function autoResolveLayout() {
  if (!window.ReportRenderer || !ReportRenderer.autoResolveCollisions) {
    showToast('Auto-resolve layout engine not available.');
    return;
  }
  pushHistory();
  reportDef = ReportRenderer.autoResolveCollisions(reportDef);

  // Secondary exhaustive de-collision pass: ensure 0 overlaps remain
  const printableW = getHorizontalDesignWidth();
  (reportDef.sections || []).forEach(sec => {
    const secEls = (reportDef.elements || []).filter(el => el.sectionId === sec.id && el.visible !== false && el.allowOverlap !== true && el.type !== 'line');
    const activeEls = secEls.filter(el => !(el.type === 'box' && (!el.styles || !el.styles.backgroundColor || el.styles.backgroundColor === 'transparent')));
    activeEls.sort((a, b) => (a.y - b.y) || (a.x - b.x));
    let changed = true;
    let passes = 0;
    while (changed && passes < 30) {
      changed = false;
      passes++;
      for (let i = 0; i < activeEls.length; i++) {
        const a = activeEls[i];
        for (let j = i + 1; j < activeEls.length; j++) {
          const b = activeEls[j];
          const hOverlap = (a.x < b.x + b.width) && (a.x + a.width > b.x);
          const vOverlap = (a.y < b.y + b.height) && (a.y + a.height > b.y);
          if (hOverlap && vOverlap) {
            if (Math.abs(a.y - b.y) <= 8 && (a.x + a.width + 6 + b.width <= printableW)) {
              b.x = a.x + a.width + 6;
            } else {
              b.y = a.y + a.height + 4;
            }
            if (b.x + b.width > printableW) {
              b.x = Math.max(0, printableW - b.width);
              b.y = a.y + a.height + 4;
            }
            if (b.y + b.height > sec.height) {
              sec.height = b.y + b.height + 20;
              const secDiv = document.getElementById(`sec_${sec.id}`);
              if (secDiv) secDiv.style.height = sec.height + 'px';
            }
            changed = true;
          }
        }
      }
    }
  });

  // Sync mm coordinates for all elements
  if (reportDef.elements) {
    reportDef.elements.forEach(el => {
      el.xMm = pxToMm(el.x);
      el.yMm = pxToMm(el.y);
      el.widthMm = pxToMm(el.width);
      el.heightMm = pxToMm(el.height);
    });
  }
  renderCanvas();
  validateElementsOverflow();
  if (selectedElementIds && selectedElementIds.length > 0) {
    updatePropertiesPanel();
  }
  showToast('⚡ Auto-Fix complete: Overlaps, zero lines & column widths resolved!');
}

// 22. Save & Preview
let activeSavePromise = null;

function setSaveBusy(isBusy) {
  ['btnSave', 'btnSavePreview'].forEach(id => {
    const button = document.getElementById(id);
    if (!button) return;
    button.disabled = isBusy;
    button.setAttribute('aria-busy', String(isBusy));
  });
}

async function saveDesign(publishAfterSave = true, openLiveReport = false) {
  if (activeSavePromise) return activeSavePromise;
  setSaveBusy(true);
  activeSavePromise = performSaveDesign(publishAfterSave, openLiveReport);
  try {
    return await activeSavePromise;
  } finally {
    activeSavePromise = null;
    setSaveBusy(false);
  }
}

async function performSaveDesign(publishAfterSave = true, openLiveReport = false) {
  try {
    if (!reportDef?.ntis?.moduleId) {
      showToast('Select a module in Report Settings before saving the layout.');
      await openReportSettings();
      return false;
    }
    updatePageDimensions();
    normalizeReportTextEntities(reportDef);
    // Sync all element mm coordinates before saving
    reportDef.elements.forEach(el => {
      el.xMm = pxToMm(el.x);
      el.yMm = pxToMm(el.y);
      el.widthMm = pxToMm(el.width);
      el.heightMm = pxToMm(el.height);
      if (el.text !== undefined) el.displayText = el.text;
      else if (el.displayText !== undefined) el.text = el.displayText;
      if (el.type === 'text_box') el.textWrapping = true;
    });

    // Pre-Save Validation Check (Non-blocking warning)
    if (window.ReportRenderer && ReportRenderer.Validator && ReportRenderer.Validator.validateReport) {
      try {
        const valRes = ReportRenderer.Validator.validateReport(reportDef);
        if (!valRes.isValid && valRes.errors.length > 0) {
          console.warn('[Designer Validation]', valRes.errors);
          validateElementsOverflow();
        }
      } catch (vErr) { }
    }

    // Debug Logging (Section 22)
    const bankElem = reportDef.elements.find(e => e.id === 'col_bank' || e.fieldName === 'BankName');
    const deno2000 = reportDef.elements.find(e => e.id === 'deno_lbl_2000');
    const totalCol = reportDef.elements.find(e => e.id === 'deno_val_total');
    console.log('=== [DESIGNER LAYOUT - PRE-SAVE] ===');
    if (bankElem) console.log(`BankName: X=${bankElem.x}, Y=${bankElem.y}, Width=${bankElem.width}, Height=${bankElem.height}`);
    if (deno2000) console.log(`deno_lbl_2000: X=${deno2000.x}, Y=${deno2000.y}, Width=${deno2000.width}, Height=${deno2000.height}`);
    if (totalCol) console.log(`TotalCollection: X=${totalCol.x}, Y=${totalCol.y}, Width=${totalCol.width}, Height=${totalCol.height}`);

    reportDef.reportId = currentReportId;
    const resp = await fetch(`/api/report-design?reportId=${encodeURIComponent(currentReportId)}&publish=${publishAfterSave ? 'true' : 'false'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify(reportDef)
    });
    const res = await resp.json();
    if (res.success) {
      if (res.layoutVersion) reportDef.layoutVersion = res.layoutVersion;
      if (res.updatedAt) reportDef.updatedAt = res.updatedAt;
      if (!reportDef.ntis) reportDef.ntis = { dataSourceCode: 'UNASSIGNED' };
      if (res.templateId) reportDef.ntis.templateId = res.templateId;
      if (res.reportDefinitionId) reportDef.ntis.reportDefinitionId = res.reportDefinitionId;
      if (res.versionId) reportDef.ntis.versionId = res.versionId;
      if (res.layoutVersion) reportDef.ntis.versionNo = res.layoutVersion;
      if (res.status) reportDef.ntis.status = res.status;
      cacheReportDesign(reportDef);
      const nowStr = new Date().toLocaleTimeString();
      document.getElementById('statusLastSave').textContent = `${publishAfterSave ? 'Published' : 'Saved'} v${res.layoutVersion || ''} at ${nowStr}`;
      initReportSelector();
      showToast(publishAfterSave
        ? '💾 Report layout saved and published successfully!'
        : '💾 Report layout draft saved successfully!');

      console.log(`=== [SAVED LAYOUT - CONFIRMED v${res.layoutVersion || ''}] ===`);
      if (bankElem) console.log(`BankName: X=${bankElem.x}, Y=${bankElem.y}, Width=${bankElem.width}, Height=${bankElem.height}`);
      if (deno2000) console.log(`deno_lbl_2000: X=${deno2000.x}, Y=${deno2000.y}, Width=${deno2000.width}, Height=${deno2000.height}`);
      if (totalCol) console.log(`TotalCollection: X=${totalCol.x}, Y=${totalCol.y}, Width=${totalCol.width}, Height=${totalCol.height}`);

      // Broadcast layout change to any open preview tabs
      try {
        const bc = new BroadcastChannel('report_layout_sync');
        bc.postMessage({ type: 'LAYOUT_SAVED', reportId: currentReportId, action: 'layout_updated', version: res.layoutVersion, timestamp: Date.now() });
      } catch (e) { }

      if (openLiveReport) {
        let currentLocale = 'en';
        try {
          const m = (window.top.location.pathname || window.location.pathname).match(/^\/([a-z]{2})\//i);
          if (m) currentLocale = m[1].toLowerCase();
        } catch (e) { }

        const previewUrl = currentReportId === 'KarakarniReport'
          ? `/${currentLocale}/property-tax/reports/karaakarni?_t=${Date.now()}`
          : `/${currentLocale}/property-tax/reports?_t=${Date.now()}`;

        try {
          (window.top || window).location.href = previewUrl;
        } catch (e) {
          // Fallback for an embedded/cross-origin context: navigate the current frame.
          window.location.href = previewUrl;
        }
      }
      return true;
    } else {
      showToast('Save failed: ' + (res.error || 'Server error'));
      return false;
    }
  } catch (err) {
    showToast('Save error: ' + err.message);
    return false;
  }
}

function buildPlaceholderPreviewData() {
  const data = {
    CouncilName: 'श्रीरामपूर नगरपरिषद, श्रीरामपूर',
    CouncilHeader: 'श्रीरामपूर नगरपरिषद, श्रीरामपूर जि. अहिल्यानगर',
    CouncilDistrict: 'जि. अहिल्यानगर',
    CouncilAddress: 'मुख्यालय प्रशासकीय भवन, श्रीरामपूर',
    CouncilLogo: '',
    ulbLogo: '',
    propertyPhoto: '',
    PropertyPhoto: '',
    PropertyPhotoA11: '',
    ulbNameLocal: 'श्रीरामपूर नगरपरिषद, श्रीरामपूर',
    ulbName: 'Municipal Corporation',
    ulbCode: 'MC',
    financeYear: '२०२६-२७',
    userName: 'प्रशासक (Admin)',
    ulbMobileNo: '०२२-१२३४५६७',
    ulbEmailId: 'contact@ulb.gov.in',
    ulbWebsiteUrl: 'www.ulb.gov.in',
    ulbAddress: 'मुख्यालय प्रशासकीय भवन',
    ownerTitle: 'श्री.',
    ownerName: 'रमेश पांडुरंग पाटील',
    occupierTitle: 'श्रीमती',
    occupierName: 'अनिता सचिन कदम',
    propertyNo: '१०१/अ',
    wardNo: '०४',
    partitionNo: '००१',
    flatOrShopNo: 'सदनिका क्र. ३०२',
    flatOrShopName: 'गोकुळ धाम',
    address: 'स्टेशन रोड, प्रभाग क्र. ०४',
    mobileNo: '९८७६५४३२१०',
    upicId: 'UPIC4030101'
  };
  (reportDef?.elements || []).forEach(element => {
    if (!element.fieldName) return;
    const fieldName = String(element.fieldName).replace(/^[@{}]+|[{}]+$/g, '');
    if (!fieldName || fieldName.startsWith('#')) return;
    data[fieldName] = `{{${fieldName}}}`;
    data[element.fieldName] = `{{${fieldName}}}`;
  });
  (reportDef?.sections || [])
    .filter(section => section.bandType === 'subreport' && section.dataPath)
    .forEach(section => {
      const childElements = (reportDef.elements || [])
        .filter(element => element.sectionId === section.id && element.fieldName);
      data[section.dataPath] = [1, 2, 3].map(rowNumber => {
        const row = {};
        childElements.forEach(element => {
          const fieldName = String(element.fieldName).replace(/^[@{}]+|[{}]+$/g, '');
          row[fieldName] = `{{${fieldName} #${rowNumber}}}`;
        });
        return row;
      });
    });
  return data;
}

function renderDesignPreview(previewWindow) {
  if (!previewWindow) {
    showToast('Preview window was blocked by the browser.');
    return false;
  }
  if (!reportDef || !window.ReportRenderer?.renderReport) {
    previewWindow.close();
    showToast('Preview renderer is unavailable.');
    return false;
  }

  updatePageDimensions();
  const preview = ReportRenderer.renderReport(reportDef, [buildPlaceholderPreviewData()], {}, {});
  const safeTitle = escapeHtml(reportDef.reportName || 'Report Preview');
  previewWindow.document.open();
  previewWindow.document.write(`<!doctype html>
        <html><head><meta charset="utf-8"><title>${safeTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Martel:wght@400;600;700;800&family=Mukta:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Serif+Devanagari:wght@400;600;700&family=Poppins:wght@400;500;600;700;800&family=Rozha+One&family=Tiro+Devanagari+Marathi:ital@0;1&family=Yatra+One&display=swap" rel="stylesheet">
        ${preview.stylesHtml}
        <style>
          body{margin:0;padding:54px 20px 24px;background:#525659;font-family:Arial,sans-serif;}
          .preview-toolbar{position:fixed;z-index:1000;left:0;right:0;top:0;height:38px;padding:8px 16px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;}
          .preview-toolbar button{border:0;border-radius:4px;background:#2563eb;color:#fff;padding:6px 14px;cursor:pointer;font-weight:600;}
        </style></head><body>
        <div class="preview-toolbar"><strong>${safeTitle} - Design Preview</strong><button onclick="window.print()">Print</button></div>
        ${preview.pagesHtml}</body></html>`);
  previewWindow.document.close();
  return true;
}

function previewReport() {
  renderDesignPreview(window.open('about:blank', '_blank'));
}

async function saveAndPreview() {
  const previewWindow = window.open('about:blank', '_blank');
  if (previewWindow) {
    previewWindow.document.write('<!doctype html><title>Saving report...</title><p style="font-family:Arial;padding:24px">Saving report design...</p>');
  }
  const saved = await saveDesign(true);
  if (saved) renderDesignPreview(previewWindow);
  else if (previewWindow) previewWindow.close();
}

async function resetToDefault() {
  if (!confirm('Are you sure you want to reset the report layout to default template?')) return;
  try {
    const resp = await fetch(`/api/reset-design?reportId=${encodeURIComponent(currentReportId)}`, { method: 'POST' });
    const res = await resp.json();
    if (res.success) {
      reportDef = res.data;
      renderCanvas();
      pushHistory();
      showToast('↺ Layout reset to default factory template');
    } else {
      showToast('Reset failed: ' + res.error);
    }
  } catch (err) {
    showToast('Reset error: ' + err.message);
  }
}

// 22.0 Navigation Back
function goBackToPreviousScreen() {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'REPORT_DESIGNER_BACK' }, '*');
      return;
    }
  } catch (err) {
    console.warn('postMessage to parent failed:', err);
  }

  if (window.history && window.history.length > 1) {
    window.history.back();
  } else {
    const params = new URLSearchParams(window.location.search);
    const locale = params.get('locale') || 'mr';
    window.location.href = '/' + locale + '/property-tax/reports';
  }
}
window.goBackToPreviousScreen = goBackToPreviousScreen;

// 22.1 Export / Import Report Layout JSON
function exportReportJson() {
  if (!reportDef) {
    showToast('Export failed: No active report definition.');
    return;
  }
  try {
    updatePageDimensions();
    if (reportDef.elements) {
      reportDef.elements.forEach(el => {
        el.xMm = pxToMm(el.x);
        el.yMm = pxToMm(el.y);
        el.widthMm = pxToMm(el.width);
        el.heightMm = pxToMm(el.height);
      });
    }
    const jsonStr = JSON.stringify(reportDef, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const reportCode = reportDef.reportCode || reportDef.reportId || currentReportId || 'Report';
    link.href = url;
    link.download = `${reportCode}_Layout_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('📥 Report JSON exported successfully!');
  } catch (err) {
    showToast('Export failed: ' + err.message);
  }
}

function triggerImportJson() {
  const input = document.getElementById('inputImportJson');
  if (input) {
    input.value = '';
    input.click();
  }
}

function handleImportJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);

      if (!parsed || (!parsed.sections && !parsed.elements && !parsed.bands)) {
        showToast('Invalid Report JSON file format.');
        return;
      }

      reportDef = parsed;
      if (!reportDef.sections) reportDef.sections = [];
      if (!reportDef.elements) reportDef.elements = [];

      // Ensure mm coordinates are synchronized
      reportDef.elements.forEach(el => {
        if (el.x !== undefined && el.xMm === undefined) el.xMm = pxToMm(el.x);
        if (el.y !== undefined && el.yMm === undefined) el.yMm = pxToMm(el.y);
        if (el.width !== undefined && el.widthMm === undefined) el.widthMm = pxToMm(el.width);
        if (el.height !== undefined && el.heightMm === undefined) el.heightMm = pxToMm(el.height);
      });

      updatePageDimensions();
      renderCanvas();
      updateSectionsList();
      validateElementsOverflow();
      pushHistory();
      showToast(`📤 "${file.name}" imported successfully! You can now edit and save.`);
    } catch (err) {
      showToast('Failed to parse JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}
window.exportReportJson = exportReportJson;
window.triggerImportJson = triggerImportJson;
window.handleImportJsonFile = handleImportJsonFile;

// 23. History (Undo / Redo)
function pushHistory() {
  if (!reportDef) return;
  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1);
  }
  historyStack.push(JSON.stringify(reportDef));
  if (historyStack.length > MAX_HISTORY) historyStack.shift();
  historyIndex = historyStack.length - 1;
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    reportDef = JSON.parse(historyStack[historyIndex]);
    renderCanvas();
    updateSectionsList();
    showToast('Undo');
  }
}

function redo() {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    reportDef = JSON.parse(historyStack[historyIndex]);
    renderCanvas();
    updateSectionsList();
    showToast('Redo');
  }
}

// 24. Keyboard Shortcuts
function setupKeyboardShortcuts() {
  if (window.__designerKeyboardShortcutsInstalled) return;
  window.__designerKeyboardShortcutsInstalled = true;
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveDesign(false);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
    } else if (e.ctrlKey && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'd')) {
      e.preventDefault();
      duplicateSelected();
    } else if (e.ctrlKey && (e.key === ']' || e.key === '}')) {
      e.preventDefault();
      bringToFront();
    } else if (e.ctrlKey && (e.key === '[' || e.key === '{')) {
      e.preventDefault();
      sendToBack();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const secElems = reportDef.elements.filter(el => el.sectionId === activeSectionId);
      if (secElems.length > 0) {
        selectedElementIds = secElems.map(el => el.id);
        document.querySelectorAll('.cr-element').forEach(el => {
          const id = el.id.replace('elem_', '');
          if (selectedElementIds.includes(id)) el.classList.add('selected');
          else el.classList.remove('selected');
        });
        updatePropertiesPanel();
        updateStatusBar();
        showToast(`Selected all ${selectedElementIds.length} elements in section`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      selectedElementIds = [];
      document.querySelectorAll('.cr-element.selected').forEach(el => el.classList.remove('selected'));
      updatePropertiesPanel();
      updateStatusBar();
    } else if ((e.key === 'F2' || e.key === 'Enter') && selectedElementIds.length === 1) {
      const selected = reportDef.elements.find(el => el.id === selectedElementIds[0]);
      if (isInlineEditableElement(selected)) {
        e.preventDefault();
        handleElementDoubleClick(null, selected.id);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelected();
    } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      if (selectedElementIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const pW = reportDef.pageWidth || 794;

        if (e.altKey) {
          // Alt + Arrow: Resize element(s)
          selectedElementIds.forEach(id => {
            const el = reportDef.elements.find(item => item.id === id);
            if (el) {
              if (e.key === 'ArrowRight') el.width = Math.min(pW - el.x, el.width + step);
              if (e.key === 'ArrowLeft') el.width = Math.max(10, el.width - step);
              if (e.key === 'ArrowDown') el.height = Math.max(6, el.height + step);
              if (e.key === 'ArrowUp') el.height = Math.max(6, el.height - step);
              el.widthMm = pxToMm(el.width);
              el.heightMm = pxToMm(el.height);
              renderElementOnCanvas(el);
            }
          });
        } else {
          // Arrow: Move element(s)
          selectedElementIds.forEach(id => {
            const el = reportDef.elements.find(item => item.id === id);
            const sec = reportDef.sections.find(s => s.id === (el ? el.sectionId : ''));
            if (el && sec) {
              if (e.key === 'ArrowLeft') el.x = Math.max(0, el.x - step);
              if (e.key === 'ArrowRight') el.x = Math.min(pW - el.width, el.x + step);
              if (e.key === 'ArrowUp') el.y = Math.max(0, el.y - step);
              if (e.key === 'ArrowDown') el.y = Math.min(sec.height - el.height, el.y + step);
              el.xMm = pxToMm(el.x);
              el.yMm = pxToMm(el.y);
              renderElementOnCanvas(el);
            }
          });
        }
        updatePropertiesPanel();
        pushHistory();
      }
    }
  });
}

// 25. Populate Field Explorer Tree with All 5 Categories
const ESSENTIAL_REPORT_FIELDS_CLIENT = [
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

function populateFieldExplorer() {
  if (!Array.isArray(DB_FIELDS)) DB_FIELDS = [];
  const existingNames = new Set(DB_FIELDS.map(f => f.name));
  ESSENTIAL_REPORT_FIELDS_CLIENT.forEach(f => {
    if (!existingNames.has(f.name)) {
      DB_FIELDS.push({ ...f });
      existingNames.add(f.name);
    }
  });
  if (reportDef && Array.isArray(reportDef.fieldCatalog)) {
    const defNames = new Set(reportDef.fieldCatalog.map(f => f.name));
    ESSENTIAL_REPORT_FIELDS_CLIENT.forEach(f => {
      if (!defNames.has(f.name)) {
        reportDef.fieldCatalog.push({ ...f });
        defNames.add(f.name);
      }
    });
  }

  // 1. DATA FIELDS
  const dataContainer = document.getElementById('treeDataFields');
  if (dataContainer) {
    dataContainer.innerHTML = '';
    if (DB_FIELDS.length === 0) {
      dataContainer.innerHTML = `
            <div style="padding: 10px 8px; color: #64748b; font-size: 11px; text-align: center;">
              कोणतेही डेटाबेस फील्ड नाही<br>(No DB Fields)
            </div>
          `;
    } else {
      DB_FIELDS.forEach(f => {
        const div = document.createElement('div');
        div.className = 'field-item';
        div.draggable = true;
        div.setAttribute('data-name', f.name);
        div.title = `${f.name}: ${f.label} (${f.type || 'string'})`;
        div.ondragstart = (e) => handleDragFieldStart(e, 'data', f.name, f.elementType, f.type);
        div.ondblclick = () => insertFieldIntoActiveSection(f.name, 'data');
        div.innerHTML = `
              <span>🗄️</span>
              <span style="font-weight:600; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{${f.name}}</span>
              <span class="field-badge">${f.type || 'string'}</span>
            `;
        dataContainer.appendChild(div);
      });
    }
  }

  // 2. FORMULA FIELDS
  const formulaContainer = document.getElementById('treeFormulaFields');
  if (formulaContainer) {
    formulaContainer.innerHTML = '';
    FORMULA_FIELDS.forEach(f => {
      const div = document.createElement('div');
      div.className = 'field-item';
      div.draggable = true;
      div.setAttribute('data-name', f.name);
      div.title = `${f.name}: ${f.label}`;
      div.ondragstart = (e) => handleDragFieldStart(e, 'formula', f.name);
      div.ondblclick = () => insertFieldIntoActiveSection(f.name, 'formula');
      div.innerHTML = `
            <span style="color:#8b0000; font-weight:bold;">{@}</span>
            <span style="font-weight:600; color:#8b0000; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</span>
          `;
      formulaContainer.appendChild(div);
    });
  }

  // 3. SUMMARY FIELDS
  const summaryContainer = document.getElementById('treeSummaryFields');
  if (summaryContainer) {
    summaryContainer.innerHTML = '';
    SUMMARY_FIELDS.forEach(f => {
      const div = document.createElement('div');
      div.className = 'field-item';
      div.draggable = true;
      div.setAttribute('data-name', f.name);
      div.title = f.label;
      div.ondragstart = (e) => handleDragFieldStart(e, 'formula', f.fieldName || f.name);
      div.ondblclick = () => insertFieldIntoActiveSection(f.fieldName || f.name, 'formula');
      div.innerHTML = `
            <span style="color:#0284c7; font-weight:bold;">∑</span>
            <span style="font-weight:600; color:#0284c7; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</span>
          `;
      summaryContainer.appendChild(div);
    });
  }

  // 4. REPORT PARAMETERS
  const paramContainer = document.getElementById('treeParameterFields');
  if (paramContainer) {
    paramContainer.innerHTML = '';
    if (PARAMETER_FIELDS.length === 0) {
      paramContainer.innerHTML = `
            <div style="padding: 10px 8px; color: #64748b; font-size: 11px; text-align: center;">
              कोणतेही पॅरामीटर्स उपलब्ध नाहीत<br>(No Parameters)
            </div>
          `;
    } else {
      PARAMETER_FIELDS.forEach(f => {
        const div = document.createElement('div');
        div.className = 'field-item';
        div.draggable = true;
        div.setAttribute('data-name', f.name);
        div.title = f.label;
        div.ondragstart = (e) => handleDragFieldStart(e, 'parameter', f.name);
        div.ondblclick = () => insertFieldIntoActiveSection(f.name, 'parameter');
        div.innerHTML = `
              <span style="color:#0d9488; font-weight:bold;">{?}</span>
              <span style="font-weight:600; color:#0d9488; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</span>
            `;
        paramContainer.appendChild(div);
      });
    }
  }

  // 5. STATIC TEXT & SHAPES
  const staticContainer = document.getElementById('treeStaticFields');
  if (staticContainer) {
    staticContainer.innerHTML = '';
    STATIC_FIELDS.forEach(f => {
      const div = document.createElement('div');
      div.className = 'field-item';
      div.draggable = true;
      div.setAttribute('data-name', f.name);
      div.title = f.label;
      div.ondragstart = (e) => handleDragFieldStart(e, 'static', f.name);
      div.ondblclick = () => addNewElement(f.type || 'text');
      div.innerHTML = `
            <span>🔤</span>
            <span style="font-weight:600; color:#374151; flex:1;">${f.label}</span>
          `;
      staticContainer.appendChild(div);
    });
  }
}

// 25.4 Extract Formulas & Summary Aggregates Dynamically from Report Definition
function extractFormulasFromDefinition() {
  FORMULA_FIELDS = [
    { name: "@PageNum", label: "{@PageNum} - पान क्रमांक (Page N of M)", formula: "PageNumber" },
    { name: "@TotalPages", label: "{@TotalPages} - एकूण पाने (Total Pages)", formula: "TotalPageCount" },
    { name: "@PrintDate", label: "{@PrintDate} - मुद्रण दिनांक (Print Date)", formula: "CurrentDate" }
  ];

  SUMMARY_FIELDS = [];

  if (reportDef && Array.isArray(reportDef.elements)) {
    const seenFormulas = new Set(['@PageNum', '@TotalPages', '@PrintDate']);
    reportDef.elements.forEach(elem => {
      if (elem.type === 'formula' || (elem.fieldName && elem.fieldName.startsWith('@'))) {
        const rawName = elem.fieldName || elem.name || '';
        const clean = rawName.startsWith('@') ? rawName : `@${rawName}`;
        if (!seenFormulas.has(clean)) {
          seenFormulas.add(clean);
          FORMULA_FIELDS.push({
            name: clean,
            label: `{${clean}} ${elem.text ? '- ' + elem.text : ''}`,
            formula: elem.formula || ''
          });
        }
      }
      if (elem.name && /sum/i.test(elem.name)) {
        SUMMARY_FIELDS.push({
          name: elem.name,
          label: elem.text || elem.name,
          fieldName: elem.fieldName || elem.name
        });
      }
    });
  }
}

// 25.5 Dynamically Load Metadata (Columns & Parameters) for Active Report
async function loadReportMetadata(reportId) {
  const targetReport = reportDef?.reportCode || reportDef?.reportId || reportId || currentReportId;
  // Custom reports can persist a designer field catalog inferred from sample
  // JSON. This restores the wizard schema even when no static API catalog exists.
  DB_FIELDS = Array.isArray(reportDef?.fieldCatalog)
    ? reportDef.fieldCatalog.map(field => ({ ...field }))
    : [];

  const initialMerged = new Map(DB_FIELDS.map(field => [`${field.collectionPath || ''}|${field.name}`, field]));
  ESSENTIAL_REPORT_FIELDS_CLIENT.forEach(field => {
    if (!initialMerged.has(`|${field.name}`)) initialMerged.set(`|${field.name}`, { ...field });
  });
  DB_FIELDS = [...initialMerged.values()];
  if (reportDef) {
    reportDef.fieldCatalog = DB_FIELDS.map(field => ({ ...field }));
  }

  PARAMETER_FIELDS = Array.isArray(reportDef?.ntis?.parameters)
    ? reportDef.ntis.parameters.map((parameter, index) => ({
      name: parameter.key,
      key: parameter.key,
      label: parameter.label ? `${parameter.label} (${parameter.key})` : parameter.key,
      dataType: parameter.type || 'text',
      type: parameter.type || 'text',
      isRequired: Boolean(parameter.isRequired),
      sortOrder: Number.isFinite(Number(parameter.sortOrder)) ? Number(parameter.sortOrder) : index,
      cascadeFromKey: parameter.cascadeFromKey || null
    }))
    : [];
  // 1. Fetch DB Columns
  try {
    const resp = await fetch(`/api/report-columns?reportId=${encodeURIComponent(targetReport)}&_t=${Date.now()}`);
    if (resp.ok) {
      const json = await resp.json();
      if (json && Array.isArray(json.columns)) {
        const merged = new Map(DB_FIELDS.map(field => [`${field.collectionPath || ''}|${field.name}`, field]));
        json.columns.forEach(field => merged.set(`${field.collectionPath || ''}|${field.name}`, field));
        ESSENTIAL_REPORT_FIELDS_CLIENT.forEach(field => {
          if (!merged.has(`|${field.name}`)) merged.set(`|${field.name}`, { ...field });
        });
        DB_FIELDS = [...merged.values()];
        if (reportDef) {
          reportDef.fieldCatalog = DB_FIELDS.map(field => ({ ...field }));
        }
        console.log(`[Designer] Loaded ${DB_FIELDS.length} DB fields for ${targetReport}`);
      }
    }
  } catch (e) {
    console.warn('[Designer] Error fetching dynamic columns:', e);
  }

  // 2. Fetch Parameters
  try {
    const pResp = await fetch(`/api/report-parameters?reportId=${encodeURIComponent(reportId)}&_t=${Date.now()}`);
    if (pResp.ok) {
      const pJson = await pResp.json();
      if (pJson && Array.isArray(pJson.parameters)) {
        PARAMETER_FIELDS = pJson.parameters.map(p => ({
          name: p.name || `@${p.id}`,
          label: p.label ? `${p.label} (${p.name || p.id})` : (p.name || p.id),
          dataType: p.dataType || 'string'
        }));
        console.log(`[Designer] Loaded ${PARAMETER_FIELDS.length} parameters for ${reportId}`);
      }
    }
  } catch (e) {
    console.warn('[Designer] Error fetching dynamic parameters:', e);
  }

  // 3. Extract Formulas from Active Definition
  extractFormulasFromDefinition();

  // 4. Reconcile persisted field elements with the live schema. This also
  // upgrades older URL-looking logo fields to real image elements.
  if (reconcileElementTypesWithFieldCatalog()) {
    renderCanvas();
    cacheReportDesign(reportDef);
  }

  // 5. Update Field Explorer Tree
  populateFieldExplorer();
}

async function loadKarakarniPreviewImages(reportId) {
  // Disabled: browser prompt removed as requested
  return;
}

// 26. Load Design Definition from Server
async function loadDesign() {
  if (!currentReportId) {
    reportDef = createBlankReportDefinition('New Report', 'CUSTOM_REPORT');
    renderCanvas();
    updateSectionsList();
    pushHistory();
    setDesignerCanvasState('idle');
    document.getElementById('statusLastSave').textContent = 'New report - not saved';
    return true;
  }
  let loadTimeoutId;
  try {
    if (!readCachedReportDesign()) setDesignerCanvasState('loading', 'Loading saved report design...');
    const controller = new AbortController();
    loadTimeoutId = setTimeout(() => controller.abort(), 30000);
    const resp = await fetch(`/api/report-design?reportId=${encodeURIComponent(currentReportId)}&_t=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(loadTimeoutId);
    if (!resp.ok) throw new Error('Failed to fetch design definition');
    const loadedDefinition = normalizeReportTextEntities(await resp.json());
    if (!loadedDefinition || !Array.isArray(loadedDefinition.sections) || !Array.isArray(loadedDefinition.elements))
      throw new Error('The saved report definition is invalid.');
    loadedDefinition.elements.forEach(el => {
      if (el.text === undefined && el.displayText !== undefined) {
        el.text = el.displayText;
      } else if (el.displayText === undefined && el.text !== undefined) {
        el.displayText = el.text;
      }
      if (el.type === 'text_box' && el.textWrapping === undefined) {
        el.textWrapping = true;
      }
    });
    reportDef = loadedDefinition;
    selectedElementIds = [];
    activeSectionId = reportDef.sections.some(section => section.id === activeSectionId)
      ? activeSectionId
      : (reportDef.sections.find(section => section.id === 'details')?.id || reportDef.sections[0]?.id);
    console.log('[Designer] Loaded design definition:', reportDef);

    renderCanvas();
    updateSectionsList();
    pushHistory();
    cacheReportDesign(reportDef);
    setDesignerCanvasState('idle');
    document.getElementById('statusLastSave').textContent = `Loaded v${reportDef.layoutVersion || reportDef.ntis?.versionNo || ''}`;
    showToast('Report layout loaded successfully');


    // Load provider fields after the paper is visible so a slow schema
    // endpoint never leaves a gray blank canvas.
    Promise.allSettled([
      loadReportMetadata(currentReportId),
      loadKarakarniPreviewImages(currentReportId)
    ]).catch(() => { });
    return true;
  } catch (err) {
    if (loadTimeoutId) clearTimeout(loadTimeoutId);
    console.error('Error loading design:', err);
    try {
      sessionStorage.removeItem(reportDesignCacheKey(currentReportId));
    } catch (e) { }
    const failedReportId = currentReportId;
    reportDef = createBlankReportDefinition(failedReportId || 'Report', failedReportId || 'CUSTOM_REPORT');
    renderCanvas();
    updateSectionsList();
    pushHistory();
    const timedOut = err?.name === 'AbortError';
    setDesignerCanvasState('error', timedOut
      ? 'Report loading timed out. You can delete it from the toolbar or refresh to retry.'
      : 'Report design could not be loaded. You can still delete it from the toolbar.');
    document.getElementById('statusLastSave').textContent = timedOut
      ? 'Load timed out'
      : 'Load failed';
    updateDeleteReportButton();
    showToast(timedOut ? 'Report loading timed out after 30 seconds.' : 'Report design could not be loaded.');
    return false;
  }
}

function switchLeftTab(tabId, el) {
  document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.getElementById('tabContentFields').style.display = tabId === 'fields' ? 'block' : 'none';
  document.getElementById('tabContentToolbox').style.display = tabId === 'toolbox' ? 'block' : 'none';
  document.getElementById('tabContentSections').style.display = tabId === 'sections' ? 'block' : 'none';
}

function filterFieldTree(q) {
  q = (q || '').toLowerCase();
  if (q) {
    const dataContainer = document.getElementById('treeDataFields');
    if (dataContainer) dataContainer.style.display = 'flex';
  }
  document.querySelectorAll('#tabContentFields .field-item').forEach(item => {
    const text = (item.textContent + ' ' + (item.getAttribute('title') || '')).toLowerCase();
    item.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

function toggleTreeNode(hdr) {
  const children = hdr.nextElementSibling;
  if (children) {
    const isHidden = children.style.display === 'none' || window.getComputedStyle(children).display === 'none';
    children.style.display = isHidden ? 'flex' : 'none';
  }
}

function selectFirstMatchingSection(q) {
  q = (q || '').trim().toLowerCase();
  if (!q || !reportDef?.sections) return;
  const matched = reportDef.sections.find(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.bandType || '').toLowerCase().includes(q) ||
    (s.dataPath || '').toLowerCase().includes(q)
  );
  if (matched) {
    selectSection(matched.id);
    const el = document.getElementById(`sec_${matched.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast(`Selected section: "${matched.name}"`);
  } else {
    showToast(`No section found matching "${q}"`);
  }
}

function updateSectionsList() {
  const container = document.getElementById('sectionsTreeList');
  if (!container || !reportDef) return;
  const searchInput = document.getElementById('sectionSearchInput');
  const q = (searchInput?.value || '').trim().toLowerCase();

  const countBadge = document.getElementById('sectionsCountBadge');
  if (countBadge) {
    countBadge.textContent = reportDef.sections?.length || 0;
  }

  const filtered = q
    ? reportDef.sections.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.bandType || '').toLowerCase().includes(q) ||
      (s.dataPath || '').toLowerCase().includes(q)
    )
    : reportDef.sections;

  if (filtered.length === 0) {
    container.innerHTML = `
          <div style="padding:14px 10px; text-align:center; color:#64748b; font-size:11px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:7px;">
            <span>विभाग आढळला नाही / No sections found matching "<strong>${escapeHtml(q)}</strong>"</span>
          </div>
        `;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const isActive = s.id === activeSectionId;
    return `
        <div class="cr-section-card ${isActive ? 'active' : ''}" id="secCard_${s.id}" onclick="selectSection('${s.id}')">
          <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
            <div style="width:7px; height:7px; border-radius:50%; background:${isActive ? '#2563eb' : '#94a3b8'}; flex-shrink:0;"></div>
            <div style="min-width:0;">
              <span style="display:block; font-weight:${isActive ? '700' : '600'}; font-size:11.5px; color:${isActive ? '#1d4ed8' : '#1e293b'}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(s.name)}</span>
              ${s.bandType === 'subreport' ? `<span style="display:block; font-size:9.5px; color:#15803d; font-weight:600;">Dynamic: ${escapeHtml(s.dataPath || '(not set)')}</span>` : ''}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:4px; margin-left:6px; flex-shrink:0;">
            <button type="button" class="cr-section-action-btn" title="Move section up" aria-label="Move section up" onclick="event.stopPropagation(); moveReportSection('${s.id}', -1)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button type="button" class="cr-section-action-btn" title="Move section down" aria-label="Move section down" onclick="event.stopPropagation(); moveReportSection('${s.id}', 1)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button type="button" class="cr-section-action-btn delete" title="Delete section" aria-label="Delete section" onclick="event.stopPropagation(); deleteReportSection('${s.id}')">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
            ${s.bandType === 'subreport' ? `<button type="button" class="cr-btn" style="height:22px; padding:0 6px; font-size:10px; font-weight:700; color:#15803d; background:#dcfce7; border-color:#bbf7d0; border-radius:5px;" onclick="event.stopPropagation(); editSubreportSection('${s.id}')">Edit</button>` : ''}
            <span class="cr-section-card-badge" title="Click to set height / उंची बदलण्यासाठी click करा" onclick="event.stopPropagation(); setSectionHeight('${s.id}')" style="cursor:pointer; text-decoration:underline dotted;">${s.height}px</span>
          </div>
        </div>
      `;
  }).join('');
}

function updateStatusBar() {
  const statusSel = document.getElementById('statusSelection');
  if (selectedElementIds.length === 0) {
    statusSel.textContent = 'Ready. No selection.';
  } else if (selectedElementIds.length === 1) {
    const elem = reportDef.elements.find(el => el.id === selectedElementIds[0]);
    if (elem) {
      const editHint = isInlineEditableElement(elem) ? ' | Double-click / F2: Edit text' : '';
      statusSel.textContent = `Selected: ${elem.id} | X:${elem.x}px (${pxToMm(elem.x)}mm), Y:${elem.y}px (${pxToMm(elem.y)}mm), W:${elem.width}px (${pxToMm(elem.width)}mm), H:${elem.height}px (${pxToMm(elem.height)}mm)${editHint}`;
    }
  } else {
    statusSel.textContent = `Selected: ${selectedElementIds.length} elements`;
  }

  const paperDim = document.getElementById('statusPaperDimensions');
  if (paperDim && reportDef) {
    paperDim.textContent = `Paper: ${reportDef.paperSize || 'A4'} ${reportDef.orientation || 'landscape'} (${reportDef.widthMm} x ${reportDef.heightMm} mm / ${reportDef.pageWidth} x ${reportDef.pageHeight} px)`;
  }
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('crToast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function escapeHtml(str) {
  return decodeHtmlEntities(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeHtmlEntities(value) {
  if (value === null || value === undefined) return '';
  const namedEntities = {
    nbsp: '\u00a0',
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'"
  };
  let decoded = String(value);

  // Imported PDF/HTML layouts can contain entities that were encoded more
  // than once (for example &amp;#x20;). Decode them to plain text before the
  // value is safely escaped at the HTML boundary.
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decoded
      .replace(/&#x([0-9a-f]+);?/gi, (match, hex) => {
        const codePoint = Number.parseInt(hex, 16);
        return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : match;
      })
      .replace(/&#([0-9]+);?/g, (match, decimal) => {
        const codePoint = Number.parseInt(decimal, 10);
        return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : match;
      })
      .replace(/&(nbsp|amp|lt|gt|quot|apos);/gi, (match, name) => namedEntities[name.toLowerCase()] ?? match);
    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

function normalizeReportTextEntities(definition) {
  if (!definition || !Array.isArray(definition.elements)) return definition;

  definition.elements.forEach(element => {
    if (typeof element.text === 'string') element.text = decodeHtmlEntities(element.text);
    if (typeof element.displayText === 'string') element.displayText = decodeHtmlEntities(element.displayText);

    if (element.cellData && typeof element.cellData === 'object') {
      Object.keys(element.cellData).forEach(key => {
        if (typeof element.cellData[key] === 'string') {
          element.cellData[key] = decodeHtmlEntities(element.cellData[key]);
        }
      });
    }

    [element.table?.cells, element.tableCells].forEach(cells => {
      if (!cells || typeof cells !== 'object') return;
      Object.values(cells).forEach(cell => {
        if (cell && typeof cell.content === 'string') {
          cell.content = decodeHtmlEntities(cell.content);
        }
      });
    });
  });

  return definition;
}

// =========================================================================
// BLUEPRINT PDF OVERLAY SUBSYSTEM (Reference PDF Alignment & Comparison)
// =========================================================================
let blueprintVisible = false;
let blueprintOpacity = 1.0;
let blueprintPdfDoc = null;
let hasServerPdf = false;
let blueprintRendering = false;

function createBlueprintContainer(canvas) {
  const bpDiv = document.createElement('div');
  bpDiv.id = 'blueprintContainer';
  bpDiv.style.cssText = `position:absolute; top:0; left:0; width:${reportDef ? reportDef.pageWidth : 794}px; height:${reportDef ? reportDef.pageHeight : 1123}px; pointer-events:none; z-index:0; overflow:hidden; display:${blueprintVisible ? 'block' : 'none'}; opacity:${blueprintOpacity};`;
  const bpCanvas = document.createElement('canvas');
  bpCanvas.id = 'blueprintCanvas';
  bpCanvas.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%;`;
  bpDiv.appendChild(bpCanvas);
  canvas.appendChild(bpDiv);
}

async function checkReferencePdf() {
  const localAssetExists = Boolean(reportDef?.sourceAssets?.referencePdf?.documentGuid);
  hasServerPdf = localAssetExists;
  try {
    const resp = await fetch(`/api/check-reference-pdf?reportId=${encodeURIComponent(currentReportId)}`);
    const data = await resp.json();
    hasServerPdf = Boolean(data.exists || localAssetExists);
    const btn = document.getElementById('btnToggleBlueprint');
    const btnUpload = document.getElementById('btnUploadBlueprint');
    if (btn) {
      if (hasServerPdf) {
        btn.title = `संदर्भ PDF ब्लूप्रिंट उपलब्ध (${(data.size / 1024).toFixed(1)} KB) - दाखवा / लपवा`;
        btn.innerHTML = `👁️ Blueprint (PDF) <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; margin-left:3px;" title="PDF Attached"></span>`;
      } else {
        btn.title = 'संदर्भ PDF उपलब्ध नाही. क्लिक करून PDF जोडा.';
        btn.innerHTML = `👁️ Blueprint (PDF)`;
      }
    }
    if (btnUpload) btnUpload.style.display = 'inline-block';
    return hasServerPdf;
  } catch (e) {
    console.warn('[Blueprint] Check PDF error:', e);
    return hasServerPdf;
  }
}

function setBlueprintOpacity(val) {
  blueprintOpacity = parseFloat(val);
  const container = document.getElementById('blueprintContainer');
  if (container) {
    container.style.opacity = blueprintOpacity;
  }
}

async function toggleBlueprint(forceState) {
  if (forceState !== undefined) {
    blueprintVisible = forceState;
  } else {
    blueprintVisible = !blueprintVisible;
  }

  const btn = document.getElementById('btnToggleBlueprint');
  const selOp = document.getElementById('selBlueprintOpacity');
  const container = document.getElementById('blueprintContainer');

  if (btn) {
    if (blueprintVisible) btn.classList.add('active');
    else btn.classList.remove('active');
  }
  if (selOp) selOp.style.display = blueprintVisible ? 'inline-block' : 'none';
  if (container) {
    container.style.display = blueprintVisible ? 'block' : 'none';
    container.style.opacity = blueprintOpacity;
  }

  if (blueprintVisible) {
    if (!hasServerPdf) await checkReferencePdf();
    if (!hasServerPdf) {
      const uploadNow = confirm('या अहवालासाठी संदर्भ PDF जोडलेली नाही. आपण आता संदर्भ PDF अपलोड करू इच्छिता का?\\n(No reference PDF found for this report. Would you like to upload one now?)');
      if (uploadNow) {
        document.getElementById('fileUploadBlueprint').click();
      }
      return;
    }
    await loadAndRenderBlueprint();
  }
}

async function loadAndRenderBlueprint() {
  if (blueprintRendering) return;
  const canvas = document.getElementById('blueprintCanvas');
  if (!canvas) return;

  try {
    blueprintRendering = true;
    if (!window.pdfjsLib) {
      showToast('Loading PDF renderer engine...');
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = '/api/classic-report-designer?asset=pdf';
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
      if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/api/classic-report-designer?asset=pdf-worker';
      }
    }

    const pdfUrl = `/api/reference-pdf?reportId=${encodeURIComponent(currentReportId)}&_t=${Date.now()}`;
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    blueprintPdfDoc = await loadingTask.promise;
    const page = await blueprintPdfDoc.getPage(1);

    const targetWidth = reportDef ? reportDef.pageWidth : 794;
    const targetHeight = reportDef ? reportDef.pageHeight : 1123;

    // Viewport at scale 1.0 (72 DPI points)
    const baseViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / baseViewport.width;

    // High DPI crispness (2x)
    const renderScale = scale * (window.devicePixelRatio > 1 ? window.devicePixelRatio : 2);
    const viewport = page.getViewport({ scale: renderScale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = targetWidth + 'px';
    canvas.style.height = (viewport.height / (window.devicePixelRatio > 1 ? window.devicePixelRatio : 2)) + 'px';

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    const container = document.getElementById('blueprintContainer');
    if (container) {
      container.style.display = 'block';
      container.style.opacity = blueprintOpacity;
    }

    showToast('🎯 संदर्भ ब्लूप्रिंट PDF यशस्वीरीत्या लोड झाली!');
  } catch (err) {
    console.error('[Blueprint] Error rendering PDF:', err);
    showToast('ब्लूप्रिंट लोड करताना त्रुटी: ' + err.message);
  } finally {
    blueprintRendering = false;
  }
}

async function handleBlueprintFileUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  if (!file.name.toLowerCase().endsWith('.pdf') || file.size > 25 * 1024 * 1024) {
    alert('Please select a valid PDF file up to 25 MB.');
    input.value = '';
    return;
  }

  showToast('PDF layout आणि editable text तयार होत आहे...');
  try {
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/api/classic-report-designer?asset=pdf';
        script.onload = resolve;
        script.onerror = () => reject(new Error('PDF renderer could not be loaded.'));
        document.head.appendChild(script);
      });
      if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/api/classic-report-designer?asset=pdf-worker';
      }
    }

    const layout = await extractPdfLayout(file, progress => showToast(`PDF: ${progress}`));
    await applyPdfLayoutToDesign(layout, file);
    if (!await saveDesign(false)) throw new Error('Imported PDF layout could not be saved.');

    hasServerPdf = Boolean(reportDef?.sourceAssets?.referencePdf?.documentGuid);
    blueprintVisible = false;
    await checkReferencePdf();
    const mode = layout.extractionMode === 'image' ? 'Image fallback' : 'PDF Unicode';
    showToast(`✅ ${layout.items.length} editable text elements ready (${mode})`);
  } catch (error) {
    console.error('[PDF Import] Upload or extraction failed:', error);
    alert('PDF import error: ' + (error.message || 'Unknown error'));
  } finally {
    input.value = '';
  }
}

// =========================================================================
// MS WORD "PAGE BACKGROUND" SUBSYSTEM (WATERMARK, PAGE COLOR, BORDERS/SHADING)
// =========================================================================

// 1. PAGE COLOR PALETTE GENERATION (Exact MS Word 10x6 Theme Colors + 10 Standard Colors)
const THEME_COLORS_MATRIX = [
  // Col 1: White to Grays
  ['#ffffff', '#f2f2f2', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#7f7f7f'],
  // Col 2: Black to Dark Grays
  ['#000000', '#7f7f7f', '#595959', '#3f3f3f', '#262626', '#0d0d0d'],
  // Col 3: Tan / Warm Gray
  ['#eeece1', '#ddd9c3', '#c4bd97', '#948a54', '#494429', '#1d1b10'],
  // Col 4: Dark Navy Blue
  ['#1f497d', '#dce6f1', '#b8cce4', '#95b3d7', '#366092', '#244062'],
  // Col 5: Blue Accent
  ['#4f81bd', '#dbe5f1', '#b8cce4', '#8eb4e3', '#376092', '#254061'],
  // Col 6: Crimson Red
  ['#c0504d', '#f2dcdb', '#e6b8b7', '#da9694', '#963634', '#632423'],
  // Col 7: Olive Green
  ['#9bbb59', '#ebf1dd', '#d7e3bc', '#c3d69b', '#76933c', '#4f6228'],
  // Col 8: Purple / Violet
  ['#8064a2', '#e5e0ec', '#ccc1da', '#b2a2c7', '#60497a', '#403151'],
  // Col 9: Aqua / Cyan
  ['#4bacc6', '#dbeef3', '#b7dde8', '#92cddc', '#31859b', '#215967'],
  // Col 10: Orange
  ['#f79646', '#fdeada', '#fbd5b5', '#fac08f', '#e36c09', '#974806']
];

const STANDARD_COLORS = [
  '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050',
  '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0'
];

function populateColorPaletteGrid(themeGridId, stdGridId, applyFn) {
  const themeGrid = document.getElementById(themeGridId);
  const stdGrid = document.getElementById(stdGridId);
  if (!themeGrid || !stdGrid) return;

  themeGrid.innerHTML = '';
  stdGrid.innerHTML = '';

  // Build Theme Matrix row-by-row (6 rows of 10 columns)
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 10; c++) {
      const hex = THEME_COLORS_MATRIX[c][r];
      const swatch = document.createElement('div');
      swatch.className = 'palette-swatch';
      swatch.style.background = hex;
      swatch.title = hex;
      swatch.onclick = () => applyFn(hex);
      themeGrid.appendChild(swatch);
    }
  }

  // Build Standard Colors row (1 row of 10 columns)
  STANDARD_COLORS.forEach(hex => {
    const swatch = document.createElement('div');
    swatch.className = 'palette-swatch';
    swatch.style.background = hex;
    swatch.title = hex;
    swatch.onclick = () => applyFn(hex);
    stdGrid.appendChild(swatch);
  });
}

function buildPageColorPalette() {
  // 1. Page Background Color
  populateColorPaletteGrid('themeColorsGrid', 'standardColorsGrid', applyPageColor);
  // 2. Element Text / Font Color
  populateColorPaletteGrid('textThemeColorsGrid', 'textStandardColorsGrid', applyTextColor);
  // 3. Element Background / Fill Color
  populateColorPaletteGrid('bgThemeColorsGrid', 'bgStandardColorsGrid', applyBgColor);
}

// -------------------------------------------------------------------------
// FLOATING POPUP ENGINE (Position-aware with getBoundingClientRect)
// -------------------------------------------------------------------------
function openFloatingDropdown(btnId, dropdownId) {
  const btn = document.getElementById(btnId);
  const dropdown = document.getElementById(dropdownId);
  if (!btn || !dropdown) return;

  const isAlreadyShown = dropdown.classList.contains('show');
  closeAllWordDropdowns();
  if (isAlreadyShown) return;

  const rect = btn.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + 4) + 'px';

  const dropdownWidth = dropdown.offsetWidth || parseInt(dropdown.style.width) || 220;
  let left = rect.left;
  if (left + dropdownWidth > window.innerWidth - 10) {
    left = window.innerWidth - dropdownWidth - 10;
  }
  dropdown.style.left = Math.max(10, left) + 'px';
  dropdown.classList.add('show');
}

function closeAllWordDropdowns() {
  document.querySelectorAll('.cr-word-dropdown').forEach(el => el.classList.remove('show'));
}

// Close Dropdowns on Click Outside
window.addEventListener('click', (e) => {
  if (!e.target.closest('.cr-word-dropdown') && !e.target.closest('.cr-word-btn') && !e.target.closest('#btnTableMenu')) {
    closeAllWordDropdowns();
  }
});

// -------------------------------------------------------------------------
// 0. MS WORD SHAPES GALLERY SUBSYSTEM
// -------------------------------------------------------------------------
function toggleShapesDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnShapesMenu', 'shapesDropdown');
}

function closeShapesDropdown() {
  closeAllWordDropdowns();
}

// -------------------------------------------------------------------------
// 1. MS WORD TABLE GRID SUBSYSTEM
// -------------------------------------------------------------------------
function toggleTableDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnTableMenu', 'tableDropdown');
}

function buildTableGrid() {
  const matrix = document.getElementById('tableGridMatrix');
  if (!matrix) return;
  matrix.innerHTML = '';
  for (let r = 1; r <= 8; r++) {
    for (let c = 1; c <= 10; c++) {
      const cell = document.createElement('div');
      cell.className = 'table-grid-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.onmouseenter = () => highlightTableGrid(c, r);
      cell.onclick = (e) => {
        e.stopPropagation();
        insertTable(c, r);
        closeAllWordDropdowns();
      };
      matrix.appendChild(cell);
    }
  }
}

function highlightTableGrid(cols, rows) {
  const matrix = document.getElementById('tableGridMatrix');
  if (!matrix) return;
  const label = document.getElementById('tableGridLabel');
  if (label) label.textContent = `${cols}x${rows} Table`;
  const cells = matrix.querySelectorAll('.table-grid-cell');
  cells.forEach(cell => {
    const c = parseInt(cell.dataset.col, 10);
    const r = parseInt(cell.dataset.row, 10);
    if (c <= cols && r <= rows) {
      cell.classList.add('highlighted');
    } else {
      cell.classList.remove('highlighted');
    }
  });
}

function resetTableGridHighlight() {
  const label = document.getElementById('tableGridLabel');
  if (label) label.textContent = '1x1 Table';
  const matrix = document.getElementById('tableGridMatrix');
  if (!matrix) return;
  matrix.querySelectorAll('.table-grid-cell').forEach(c => c.classList.remove('highlighted'));
}

function promptInsertTable() {
  closeAllWordDropdowns();
  const colsStr = prompt('Number of columns (स्तंभ):', '5');
  if (!colsStr) return;
  const rowsStr = prompt('Number of rows (ओळी):', '3');
  if (!rowsStr) return;
  const cols = Math.max(1, Math.min(20, parseInt(colsStr, 10) || 5));
  const rows = Math.max(1, Math.min(50, parseInt(rowsStr, 10) || 3));
  insertTable(cols, rows);
}

function insertTable(cols = 5, rows = 3) {
  closeAllWordDropdowns();
  const printableW = getHorizontalDesignWidth ? getHorizontalDesignWidth() : 700;
  const tableWidth = Math.min(Math.max(cols * 75, 220), printableW - 20);
  const rowHeight = 24;
  const tableHeight = rows * rowHeight;
  const newId = `elem_tbl_${Date.now()}`;

  const cellData = {};
  const tableCells = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0) {
        cellData[`${r}_${c}`] = `स्तंभ ${c + 1}`;
      } else {
        cellData[`${r}_${c}`] = `डेटा ${r},${c + 1}`;
      }
      tableCells[`${r}_${c}`] = defaultTableCell(r, c, cellData[`${r}_${c}`]);
    }
  }

  const newElem = {
    id: newId,
    sectionId: activeSectionId || (reportDef.sections && reportDef.sections[0] ? reportDef.sections[0].id : 'details'),
    type: 'table',
    name: `Table_${cols}x${rows}`,
    text: '',
    cols: cols,
    rows: rows,
    cellData: cellData,
    tableCells,
    columnWidths: Array.from({ length: cols }, () => tableWidth / cols),
    rowHeights: Array.from({ length: rows }, () => rowHeight),
    table: {
      version: 1,
      rows,
      cols,
      cells: tableCells,
      columnWidths: Array.from({ length: cols }, () => tableWidth / cols),
      rowHeights: Array.from({ length: rows }, () => rowHeight)
    },
    borderWidth: 1,
    borderColor: '#000000',
    headerBg: '#f1f5f9',
    x: 30,
    y: 10,
    width: tableWidth,
    height: tableHeight,
    xMm: pxToMm(30),
    yMm: pxToMm(10),
    widthMm: pxToMm(tableWidth),
    heightMm: pxToMm(tableHeight),
    styles: {
      fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
      fontSize: '9.5px',
      color: '#000000',
      border: '1px solid #000000',
      backgroundColor: '#ffffff'
    },
    visible: true
  };

  reportDef.elements.push(newElem);
  selectedElementIds = [newId];
  renderCanvas();
  updatePropertiesPanel();
  pushHistory();
  showToast(`तक्ता जोडला (${cols} स्तंभ x ${rows} ओळी)`);
}

let editingTableElemId = null;
let tempTableModel = null;
let tempTableSelectedCells = new Set();
let tempTableSelectionAnchor = null;
let tableEditorHistory = [];
let tableEditorHistoryIndex = -1;
let tableResizeState = null;

function tableCellKey(row, column) {
  return `${row}_${column}`;
}

function parseTableCellKey(key) {
  const [row, column] = String(key).split('_').map(Number);
  return { row, column };
}

function cloneTableValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultTableCell(row, column, content = '') {
  return {
    content,
    rowSpan: 1,
    colSpan: 1,
    hidden: false,
    style: {
      textAlign: 'left',
      verticalAlign: 'middle',
      fontSize: 9,
      fontWeight: row === 0 ? 700 : 400,
      color: '#000000',
      backgroundColor: row === 0 ? '#f1f5f9' : '#ffffff',
      borderColor: '#000000',
      borderWidth: 1,
      padding: 4,
      wrap: true
    }
  };
}

function buildTableModelFromElement(elem) {
  const source = elem.table || {};
  const rows = Math.max(1, Math.min(200, Number(source.rows || elem.rows || 3)));
  const cols = Math.max(1, Math.min(100, Number(source.cols || elem.cols || 4)));
  const sourceCells = source.cells || elem.tableCells || {};
  const legacyData = elem.cellData || {};
  const cells = {};
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < cols; column++) {
      const key = tableCellKey(row, column);
      const saved = sourceCells[key] || {};
      const fallbackContent = legacyData[key] !== undefined ? legacyData[key] : '';
      const defaults = defaultTableCell(row, column, fallbackContent);
      cells[key] = {
        ...defaults,
        ...cloneTableValue(saved),
        content: saved.content !== undefined ? String(saved.content) : String(fallbackContent),
        style: { ...defaults.style, ...(saved.style || {}) }
      };
    }
  }
  return normalizeTableModel({
    version: 1,
    rows,
    cols,
    cells,
    columnWidths: Array.from({ length: cols }, (_, index) => Math.max(30, Number((source.columnWidths || elem.columnWidths || [])[index]) || 90)),
    rowHeights: Array.from({ length: rows }, (_, index) => Math.max(20, Number((source.rowHeights || elem.rowHeights || [])[index]) || 30))
  });
}

function normalizeTableModel(model) {
  model.rows = Math.max(1, Math.min(200, Number(model.rows) || 1));
  model.cols = Math.max(1, Math.min(100, Number(model.cols) || 1));
  model.columnWidths = Array.from({ length: model.cols }, (_, index) => Math.max(30, Number(model.columnWidths?.[index]) || 90));
  model.rowHeights = Array.from({ length: model.rows }, (_, index) => Math.max(20, Number(model.rowHeights?.[index]) || 30));
  model.cells = model.cells || {};
  const mergeAnchors = [];
  for (let row = 0; row < model.rows; row++) {
    for (let column = 0; column < model.cols; column++) {
      const key = tableCellKey(row, column);
      const defaults = defaultTableCell(row, column);
      const cell = model.cells[key] || {};
      model.cells[key] = {
        ...defaults,
        ...cell,
        content: cell.content === undefined ? '' : String(cell.content),
        style: { ...defaults.style, ...(cell.style || {}) }
      };
      if (!cell.hidden && (Number(cell.rowSpan) > 1 || Number(cell.colSpan) > 1)) {
        mergeAnchors.push({ key, row, column, rowSpan: Number(cell.rowSpan) || 1, colSpan: Number(cell.colSpan) || 1 });
      }
    }
  }
  Object.values(model.cells).forEach(cell => {
    cell.hidden = false;
    delete cell.mergedInto;
    cell.rowSpan = 1;
    cell.colSpan = 1;
  });
  const occupied = new Set();
  mergeAnchors.sort((left, right) => left.row - right.row || left.column - right.column).forEach(anchor => {
    const rowSpan = Math.max(1, Math.min(anchor.rowSpan, model.rows - anchor.row));
    const colSpan = Math.max(1, Math.min(anchor.colSpan, model.cols - anchor.column));
    const coverage = [];
    for (let row = anchor.row; row < anchor.row + rowSpan; row++) {
      for (let column = anchor.column; column < anchor.column + colSpan; column++) coverage.push(tableCellKey(row, column));
    }
    if (coverage.some(key => occupied.has(key))) return;
    const anchorCell = model.cells[anchor.key];
    anchorCell.rowSpan = rowSpan;
    anchorCell.colSpan = colSpan;
    coverage.forEach(key => {
      occupied.add(key);
      if (key === anchor.key) return;
      model.cells[key].hidden = true;
      model.cells[key].mergedInto = anchor.key;
    });
  });
  return model;
}

function tableAnchorKey(model, key) {
  const cell = model.cells[key];
  return cell?.hidden && cell.mergedInto ? cell.mergedInto : key;
}

function tableAnchorCoverage(model, anchorKey) {
  const resolvedKey = tableAnchorKey(model, anchorKey);
  const anchor = model.cells[resolvedKey];
  if (!anchor) return [];
  const { row, column } = parseTableCellKey(resolvedKey);
  const result = [];
  for (let currentRow = row; currentRow < Math.min(model.rows, row + Math.max(1, Number(anchor.rowSpan) || 1)); currentRow++) {
    for (let currentColumn = column; currentColumn < Math.min(model.cols, column + Math.max(1, Number(anchor.colSpan) || 1)); currentColumn++) {
      result.push(tableCellKey(currentRow, currentColumn));
    }
  }
  return result;
}

function visibleTableAnchors(model) {
  return Object.entries(model.cells)
    .filter(([, cell]) => !cell.hidden)
    .map(([key, cell]) => ({ key, cell, ...parseTableCellKey(key) }));
}

function tableEditorSnapshot() {
  return JSON.stringify({
    model: tempTableModel,
    selection: [...tempTableSelectedCells],
    anchor: tempTableSelectionAnchor
  });
}

function pushTableEditorHistory() {
  if (!tempTableModel) return;
  const snapshot = tableEditorSnapshot();
  if (tableEditorHistory[tableEditorHistoryIndex] === snapshot) return;
  if (tableEditorHistoryIndex < tableEditorHistory.length - 1) tableEditorHistory.splice(tableEditorHistoryIndex + 1);
  tableEditorHistory.push(snapshot);
  if (tableEditorHistory.length > 60) tableEditorHistory.shift();
  tableEditorHistoryIndex = tableEditorHistory.length - 1;
}

function restoreTableEditorSnapshot(snapshot) {
  const parsed = JSON.parse(snapshot);
  tempTableModel = normalizeTableModel(parsed.model);
  tempTableSelectedCells = new Set(parsed.selection || []);
  tempTableSelectionAnchor = parsed.anchor || null;
  renderTableCellEditorGrid();
}

function undoTableEdit() {
  if (tableEditorHistoryIndex <= 0) return;
  tableEditorHistoryIndex--;
  restoreTableEditorSnapshot(tableEditorHistory[tableEditorHistoryIndex]);
}

function redoTableEdit() {
  if (tableEditorHistoryIndex >= tableEditorHistory.length - 1) return;
  tableEditorHistoryIndex++;
  restoreTableEditorSnapshot(tableEditorHistory[tableEditorHistoryIndex]);
}

function openTableCellEditor(elemId) {
  editingTableElemId = elemId;
  const elem = reportDef.elements.find(element => element.id === elemId);
  if (!elem) return;
  tempTableModel = buildTableModelFromElement(elem);
  tempTableSelectedCells = new Set([tableCellKey(0, 0)]);
  tempTableSelectionAnchor = tableCellKey(0, 0);
  tableEditorHistory = [];
  tableEditorHistoryIndex = -1;
  pushTableEditorHistory();
  renderTableCellEditorGrid();
  document.getElementById('tableCellEditorModal')?.classList.add('show');
}

function selectedTableRectangle() {
  if (!tempTableSelectedCells.size) return null;
  const points = [...tempTableSelectedCells].map(parseTableCellKey)
    .filter(point => Number.isFinite(point.row) && Number.isFinite(point.column));
  if (!points.length) return null;
  return {
    top: Math.min(...points.map(point => point.row)),
    bottom: Math.max(...points.map(point => point.row)),
    left: Math.min(...points.map(point => point.column)),
    right: Math.max(...points.map(point => point.column))
  };
}

function rectangleCellKeys(rectangle) {
  const keys = [];
  for (let row = rectangle.top; row <= rectangle.bottom; row++) {
    for (let column = rectangle.left; column <= rectangle.right; column++) keys.push(tableCellKey(row, column));
  }
  return keys;
}

function selectTableEditorCell(event, row, column) {
  if (!tempTableModel) return;
  const clickedKey = tableAnchorKey(tempTableModel, tableCellKey(row, column));
  const coverage = tableAnchorCoverage(tempTableModel, clickedKey);
  if (event.shiftKey && tempTableSelectionAnchor) {
    const start = parseTableCellKey(tempTableSelectionAnchor);
    const clicked = parseTableCellKey(clickedKey);
    const rectangle = {
      top: Math.min(start.row, clicked.row), bottom: Math.max(start.row, clicked.row),
      left: Math.min(start.column, clicked.column), right: Math.max(start.column, clicked.column)
    };
    tempTableSelectedCells = new Set(rectangleCellKeys(rectangle));
  } else if (event.ctrlKey || event.metaKey) {
    const removing = coverage.every(key => tempTableSelectedCells.has(key));
    coverage.forEach(key => removing ? tempTableSelectedCells.delete(key) : tempTableSelectedCells.add(key));
    tempTableSelectionAnchor = clickedKey;
  } else {
    tempTableSelectedCells = new Set(coverage);
    tempTableSelectionAnchor = clickedKey;
  }
  updateTableEditorSelectionHighlight();
}

function selectTableEditorRow(event, row) {
  const keys = Array.from({ length: tempTableModel.cols }, (_, column) => tableCellKey(row, column));
  if (!(event.ctrlKey || event.metaKey)) tempTableSelectedCells.clear();
  keys.forEach(key => tempTableSelectedCells.add(key));
  tempTableSelectionAnchor = tableCellKey(row, 0);
  updateTableEditorSelectionHighlight();
}

function selectTableEditorColumn(event, column) {
  const keys = Array.from({ length: tempTableModel.rows }, (_, row) => tableCellKey(row, column));
  if (!(event.ctrlKey || event.metaKey)) tempTableSelectedCells.clear();
  keys.forEach(key => tempTableSelectedCells.add(key));
  tempTableSelectionAnchor = tableCellKey(0, column);
  updateTableEditorSelectionHighlight();
}

function updateTableEditorSelectionHighlight() {
  document.querySelectorAll('#tableEditorGrid td[data-anchor-key]').forEach(cellElement => {
    const coverage = String(cellElement.dataset.coverage || '').split(',').filter(Boolean);
    cellElement.classList.toggle('table-cell-selected', coverage.some(key => tempTableSelectedCells.has(key)));
  });
  const label = document.getElementById('tableEditorDimensions');
  if (label && tempTableModel) label.textContent = `${tempTableModel.cols} cols x ${tempTableModel.rows} rows | ${tempTableSelectedCells.size} selected`;
}

function renderTableCellEditorGrid() {
  const grid = document.getElementById('tableEditorGrid');
  if (!grid || !tempTableModel) return;
  const totalWidth = tempTableModel.columnWidths.reduce((sum, width) => sum + width, 34);
  let html = `<colgroup><col style="width:34px">${tempTableModel.columnWidths.map((width, column) => `<col data-table-column="${column}" style="width:${width}px">`).join('')}</colgroup>`;
  html += '<thead><tr><th class="table-editor-axis-cell" style="width:34px;">#</th>';
  for (let column = 0; column < tempTableModel.cols; column++) {
    html += `<th class="table-editor-axis-cell" onclick="selectTableEditorColumn(event, ${column})">C${column + 1}<div class="table-column-resizer" onmousedown="startTableColumnResize(event, ${column})"></div></th>`;
  }
  html += '</tr></thead><tbody>';
  for (let row = 0; row < tempTableModel.rows; row++) {
    html += `<tr data-table-row="${row}" style="height:${tempTableModel.rowHeights[row]}px"><th class="table-editor-axis-cell" onclick="selectTableEditorRow(event, ${row})">R${row + 1}<div class="table-row-resizer" onmousedown="startTableRowResize(event, ${row})"></div></th>`;
    for (let column = 0; column < tempTableModel.cols; column++) {
      const key = tableCellKey(row, column);
      const cell = tempTableModel.cells[key];
      if (cell.hidden) continue;
      const coverage = tableAnchorCoverage(tempTableModel, key);
      const selected = coverage.some(coveredKey => tempTableSelectedCells.has(coveredKey));
      const style = cell.style || {};
      const rowSpan = Math.max(1, Number(cell.rowSpan) || 1);
      const colSpan = Math.max(1, Number(cell.colSpan) || 1);
      const wrap = style.wrap !== false;
      html += `<td data-anchor-key="${key}" data-coverage="${coverage.join(',')}" class="${selected ? 'table-cell-selected' : ''}"${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ''}${colSpan > 1 ? ` colspan="${colSpan}"` : ''} onclick="selectTableEditorCell(event, ${row}, ${column})" style="border:${Number(style.borderWidth) || 0}px solid ${style.borderColor || '#000000'}; background:${style.backgroundColor || '#ffffff'}; color:${style.color || '#000000'}; padding:${Number(style.padding) || 0}px; text-align:${style.textAlign || 'left'}; vertical-align:${style.verticalAlign || 'middle'}; font-size:${Number(style.fontSize) || 9}pt; font-weight:${Number(style.fontWeight) || 400};">
            <textarea spellcheck="false" wrap="${wrap ? 'soft' : 'off'}" oninput="updateTempTableCellContent('${key}', this.value)" onchange="pushTableEditorHistory()" style="width:100%; height:100%; min-height:20px; resize:none; border:none; outline:none; padding:0; margin:0; background:transparent; color:inherit; font:inherit; text-align:inherit; white-space:${wrap ? 'pre-wrap' : 'nowrap'}; overflow-wrap:${wrap ? 'anywhere' : 'normal'};">${escapeHtml(cell.content || '')}</textarea>
          </td>`;
    }
    html += '</tr>';
  }
  html += '</tbody>';
  grid.style.width = `${totalWidth}px`;
  grid.innerHTML = html;
  updateTableEditorSelectionHighlight();
}

function updateTempTableCellContent(key, value) {
  if (tempTableModel?.cells[key]) tempTableModel.cells[key].content = value;
}

function selectedTableAnchorKeys() {
  if (!tempTableModel) return [];
  return [...new Set([...tempTableSelectedCells].map(key => tableAnchorKey(tempTableModel, key)))]
    .filter(key => tempTableModel.cells[key] && !tempTableModel.cells[key].hidden);
}

function applyTableCellStyle(property, value) {
  const anchors = selectedTableAnchorKeys();
  if (!anchors.length) return showToast('Select at least one table cell.');
  anchors.forEach(key => {
    const cell = tempTableModel.cells[key];
    cell.style = { ...(cell.style || {}), [property]: value };
  });
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function toggleTableCellBold() {
  const anchors = selectedTableAnchorKeys();
  if (!anchors.length) return showToast('Select at least one table cell.');
  const makeBold = Number(tempTableModel.cells[anchors[0]].style?.fontWeight || 400) < 600;
  applyTableCellStyle('fontWeight', makeBold ? 700 : 400);
}

function mergeTableCells(mode) {
  if (!tempTableModel || tempTableSelectedCells.size < 2) return showToast('Select two or more cells to merge.');
  const rectangle = selectedTableRectangle();
  const expectedKeys = rectangleCellKeys(rectangle);
  if (expectedKeys.some(key => !tempTableSelectedCells.has(key))) return showToast('Merge requires one complete rectangular selection.');
  if (mode === 'horizontal' && rectangle.top !== rectangle.bottom) return showToast('Horizontal merge requires cells from one row.');
  if (mode === 'vertical' && rectangle.left !== rectangle.right) return showToast('Vertical merge requires cells from one column.');

  for (const anchor of visibleTableAnchors(tempTableModel)) {
    const coverage = tableAnchorCoverage(tempTableModel, anchor.key);
    const inside = coverage.filter(key => expectedKeys.includes(key)).length;
    if (inside > 0 && inside !== coverage.length) return showToast('Selection cuts through an existing merged cell. Unmerge it first.');
  }
  visibleTableAnchors(tempTableModel).forEach(anchor => {
    const coverage = tableAnchorCoverage(tempTableModel, anchor.key);
    if (coverage.every(key => expectedKeys.includes(key))) {
      anchor.cell.rowSpan = 1;
      anchor.cell.colSpan = 1;
    }
  });
  normalizeTableModel(tempTableModel);
  const anchorKey = tableCellKey(rectangle.top, rectangle.left);
  tempTableModel.cells[anchorKey].rowSpan = rectangle.bottom - rectangle.top + 1;
  tempTableModel.cells[anchorKey].colSpan = rectangle.right - rectangle.left + 1;
  normalizeTableModel(tempTableModel);
  tempTableSelectedCells = new Set(expectedKeys);
  tempTableSelectionAnchor = anchorKey;
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function unmergeTableCell() {
  const anchors = selectedTableAnchorKeys();
  const merged = anchors.filter(key => (tempTableModel.cells[key].rowSpan || 1) > 1 || (tempTableModel.cells[key].colSpan || 1) > 1);
  if (!merged.length) return showToast('Select a merged cell first.');
  merged.forEach(key => {
    tempTableModel.cells[key].rowSpan = 1;
    tempTableModel.cells[key].colSpan = 1;
  });
  normalizeTableModel(tempTableModel);
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function partitionTableSpan(total, parts) {
  const base = Math.floor(total / parts);
  const remainder = total % parts;
  return Array.from({ length: parts }, (_, index) => base + (index < remainder ? 1 : 0));
}

function splitTableCell(axis) {
  const anchors = selectedTableAnchorKeys();
  if (anchors.length !== 1) return showToast('Select exactly one cell to split.');
  const requested = Math.max(2, Math.min(20, Number(document.getElementById('tableSplitCount')?.value) || 2));
  let anchorKey = anchors[0];
  let anchorPosition = parseTableCellKey(anchorKey);
  let anchorCell = tempTableModel.cells[anchorKey];
  const originalStyle = cloneTableValue(anchorCell.style || {});
  const originalRowSpan = Math.max(1, Number(anchorCell.rowSpan) || 1);
  const originalColSpan = Math.max(1, Number(anchorCell.colSpan) || 1);

  if (axis === 'rows') {
    for (let count = originalRowSpan; count < requested; count++) insertTableRowAt(anchorPosition.row + originalRowSpan + (count - originalRowSpan), tempTableModel);
  } else {
    for (let count = originalColSpan; count < requested; count++) insertTableColumnAt(anchorPosition.column + originalColSpan + (count - originalColSpan), tempTableModel);
  }
  anchorKey = tableCellKey(anchorPosition.row, anchorPosition.column);
  anchorCell = tempTableModel.cells[anchorKey];
  anchorCell.rowSpan = 1;
  anchorCell.colSpan = 1;
  normalizeTableModel(tempTableModel);

  const totalSpan = axis === 'rows' ? Math.max(originalRowSpan, requested) : Math.max(originalColSpan, requested);
  const sizes = partitionTableSpan(totalSpan, requested);
  let offset = 0;
  sizes.forEach(size => {
    const row = anchorPosition.row + (axis === 'rows' ? offset : 0);
    const column = anchorPosition.column + (axis === 'columns' ? offset : 0);
    const key = tableCellKey(row, column);
    const cell = tempTableModel.cells[key];
    cell.style = cloneTableValue(originalStyle);
    cell.rowSpan = axis === 'rows' ? size : originalRowSpan;
    cell.colSpan = axis === 'columns' ? size : originalColSpan;
    offset += size;
  });
  normalizeTableModel(tempTableModel);
  const rectangle = {
    top: anchorPosition.row,
    bottom: anchorPosition.row + (axis === 'rows' ? totalSpan : originalRowSpan) - 1,
    left: anchorPosition.column,
    right: anchorPosition.column + (axis === 'columns' ? totalSpan : originalColSpan) - 1
  };
  tempTableSelectedCells = new Set(rectangleCellKeys(rectangle));
  tempTableSelectionAnchor = anchorKey;
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function insertTableRowAt(index, model = tempTableModel) {
  index = Math.max(0, Math.min(model.rows, index));
  const oldModel = cloneTableValue(model);
  const anchors = visibleTableAnchors(oldModel);
  const newCells = {};
  for (let row = 0; row < oldModel.rows; row++) {
    for (let column = 0; column < oldModel.cols; column++) {
      const newRow = row >= index ? row + 1 : row;
      const cell = cloneTableValue(oldModel.cells[tableCellKey(row, column)]);
      cell.hidden = false; delete cell.mergedInto; cell.rowSpan = 1; cell.colSpan = 1;
      newCells[tableCellKey(newRow, column)] = cell;
    }
  }
  model.rows = oldModel.rows + 1;
  model.cells = newCells;
  model.rowHeights = [...oldModel.rowHeights];
  model.rowHeights.splice(index, 0, 30);
  for (let column = 0; column < model.cols; column++) {
    const key = tableCellKey(index, column);
    if (!model.cells[key]) model.cells[key] = defaultTableCell(index, column);
  }
  anchors.forEach(anchor => {
    const newRow = anchor.row >= index ? anchor.row + 1 : anchor.row;
    const rowSpan = Math.max(1, Number(anchor.cell.rowSpan) || 1) + (anchor.row < index && index < anchor.row + (anchor.cell.rowSpan || 1) ? 1 : 0);
    const key = tableCellKey(newRow, anchor.column);
    model.cells[key] = { ...model.cells[key], ...cloneTableValue(anchor.cell), hidden: false, rowSpan, colSpan: anchor.cell.colSpan || 1 };
    delete model.cells[key].mergedInto;
  });
  normalizeTableModel(model);
}

function insertTableColumnAt(index, model = tempTableModel) {
  index = Math.max(0, Math.min(model.cols, index));
  const oldModel = cloneTableValue(model);
  const anchors = visibleTableAnchors(oldModel);
  const newCells = {};
  for (let row = 0; row < oldModel.rows; row++) {
    for (let column = 0; column < oldModel.cols; column++) {
      const newColumn = column >= index ? column + 1 : column;
      const cell = cloneTableValue(oldModel.cells[tableCellKey(row, column)]);
      cell.hidden = false; delete cell.mergedInto; cell.rowSpan = 1; cell.colSpan = 1;
      newCells[tableCellKey(row, newColumn)] = cell;
    }
  }
  model.cols = oldModel.cols + 1;
  model.cells = newCells;
  model.columnWidths = [...oldModel.columnWidths];
  model.columnWidths.splice(index, 0, 90);
  for (let row = 0; row < model.rows; row++) {
    const key = tableCellKey(row, index);
    if (!model.cells[key]) model.cells[key] = defaultTableCell(row, index);
  }
  anchors.forEach(anchor => {
    const newColumn = anchor.column >= index ? anchor.column + 1 : anchor.column;
    const colSpan = Math.max(1, Number(anchor.cell.colSpan) || 1) + (anchor.column < index && index < anchor.column + (anchor.cell.colSpan || 1) ? 1 : 0);
    const key = tableCellKey(anchor.row, newColumn);
    model.cells[key] = { ...model.cells[key], ...cloneTableValue(anchor.cell), hidden: false, rowSpan: anchor.cell.rowSpan || 1, colSpan };
    delete model.cells[key].mergedInto;
  });
  normalizeTableModel(model);
}

function deleteTableRowAt(index, model = tempTableModel) {
  if (model.rows <= 1 || index < 0 || index >= model.rows) return;
  const oldModel = cloneTableValue(model);
  const anchors = visibleTableAnchors(oldModel);
  const newCells = {};
  for (let row = 0; row < oldModel.rows; row++) {
    if (row === index) continue;
    for (let column = 0; column < oldModel.cols; column++) {
      const newRow = row > index ? row - 1 : row;
      const cell = cloneTableValue(oldModel.cells[tableCellKey(row, column)]);
      cell.hidden = false; delete cell.mergedInto; cell.rowSpan = 1; cell.colSpan = 1;
      newCells[tableCellKey(newRow, column)] = cell;
    }
  }
  model.rows = oldModel.rows - 1;
  model.cells = newCells;
  model.rowHeights = oldModel.rowHeights.filter((_, row) => row !== index);
  anchors.forEach(anchor => {
    const oldSpan = Math.max(1, Number(anchor.cell.rowSpan) || 1);
    const inside = index >= anchor.row && index < anchor.row + oldSpan;
    if (inside && oldSpan === 1) return;
    const newRow = anchor.row > index ? anchor.row - 1 : anchor.row === index ? index : anchor.row;
    const newSpan = inside ? oldSpan - 1 : oldSpan;
    if (newRow >= model.rows || newSpan < 1) return;
    const key = tableCellKey(newRow, anchor.column);
    model.cells[key] = { ...model.cells[key], ...cloneTableValue(anchor.cell), hidden: false, rowSpan: newSpan, colSpan: anchor.cell.colSpan || 1 };
    delete model.cells[key].mergedInto;
  });
  normalizeTableModel(model);
}

function deleteTableColumnAt(index, model = tempTableModel) {
  if (model.cols <= 1 || index < 0 || index >= model.cols) return;
  const oldModel = cloneTableValue(model);
  const anchors = visibleTableAnchors(oldModel);
  const newCells = {};
  for (let row = 0; row < oldModel.rows; row++) {
    for (let column = 0; column < oldModel.cols; column++) {
      if (column === index) continue;
      const newColumn = column > index ? column - 1 : column;
      const cell = cloneTableValue(oldModel.cells[tableCellKey(row, column)]);
      cell.hidden = false; delete cell.mergedInto; cell.rowSpan = 1; cell.colSpan = 1;
      newCells[tableCellKey(row, newColumn)] = cell;
    }
  }
  model.cols = oldModel.cols - 1;
  model.cells = newCells;
  model.columnWidths = oldModel.columnWidths.filter((_, column) => column !== index);
  anchors.forEach(anchor => {
    const oldSpan = Math.max(1, Number(anchor.cell.colSpan) || 1);
    const inside = index >= anchor.column && index < anchor.column + oldSpan;
    if (inside && oldSpan === 1) return;
    const newColumn = anchor.column > index ? anchor.column - 1 : anchor.column === index ? index : anchor.column;
    const newSpan = inside ? oldSpan - 1 : oldSpan;
    if (newColumn >= model.cols || newSpan < 1) return;
    const key = tableCellKey(anchor.row, newColumn);
    model.cells[key] = { ...model.cells[key], ...cloneTableValue(anchor.cell), hidden: false, rowSpan: anchor.cell.rowSpan || 1, colSpan: newSpan };
    delete model.cells[key].mergedInto;
  });
  normalizeTableModel(model);
}

function addTableRow() {
  const rectangle = selectedTableRectangle();
  const insertAt = rectangle ? rectangle.bottom + 1 : tempTableModel.rows;
  insertTableRowAt(insertAt);
  tempTableSelectedCells = new Set(Array.from({ length: tempTableModel.cols }, (_, column) => tableCellKey(insertAt, column)));
  tempTableSelectionAnchor = tableCellKey(insertAt, 0);
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function deleteTableRow() {
  if (tempTableModel.rows <= 1) return showToast('A table must keep at least one row.');
  const rows = [...new Set([...tempTableSelectedCells].map(key => parseTableCellKey(key).row))]
    .filter(row => row >= 0 && row < tempTableModel.rows).sort((left, right) => right - left);
  const targets = rows.length ? rows : [tempTableModel.rows - 1];
  targets.slice(0, tempTableModel.rows - 1).forEach(row => deleteTableRowAt(row));
  tempTableSelectedCells = new Set([tableCellKey(0, 0)]);
  tempTableSelectionAnchor = tableCellKey(0, 0);
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function getTableCol() {
  const rectangle = selectedTableRectangle();
  const insertAt = rectangle ? rectangle.right + 1 : tempTableModel.cols;
  insertTableColumnAt(insertAt);
  tempTableSelectedCells = new Set(Array.from({ length: tempTableModel.rows }, (_, row) => tableCellKey(row, insertAt)));
  tempTableSelectionAnchor = tableCellKey(0, insertAt);
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function deleteTableCol() {
  if (tempTableModel.cols <= 1) return showToast('A table must keep at least one column.');
  const columns = [...new Set([...tempTableSelectedCells].map(key => parseTableCellKey(key).column))]
    .filter(column => column >= 0 && column < tempTableModel.cols).sort((left, right) => right - left);
  const targets = columns.length ? columns : [tempTableModel.cols - 1];
  targets.slice(0, tempTableModel.cols - 1).forEach(column => deleteTableColumnAt(column));
  tempTableSelectedCells = new Set([tableCellKey(0, 0)]);
  tempTableSelectionAnchor = tableCellKey(0, 0);
  renderTableCellEditorGrid();
  pushTableEditorHistory();
}

function startTableColumnResize(event, column) {
  event.preventDefault();
  event.stopPropagation();
  tableResizeState = { axis: 'column', index: column, start: event.clientX, size: tempTableModel.columnWidths[column] };
  window.addEventListener('mousemove', handleTableResizeMove);
  window.addEventListener('mouseup', finishTableResize, { once: true });
}

function startTableRowResize(event, row) {
  event.preventDefault();
  event.stopPropagation();
  tableResizeState = { axis: 'row', index: row, start: event.clientY, size: tempTableModel.rowHeights[row] };
  window.addEventListener('mousemove', handleTableResizeMove);
  window.addEventListener('mouseup', finishTableResize, { once: true });
}

function handleTableResizeMove(event) {
  if (!tableResizeState || !tempTableModel) return;
  if (tableResizeState.axis === 'column') {
    tempTableModel.columnWidths[tableResizeState.index] = Math.max(30, tableResizeState.size + event.clientX - tableResizeState.start);
    const columnElement = document.querySelector(`#tableEditorGrid col[data-table-column="${tableResizeState.index}"]`);
    if (columnElement) columnElement.style.width = `${tempTableModel.columnWidths[tableResizeState.index]}px`;
    document.getElementById('tableEditorGrid').style.width = `${tempTableModel.columnWidths.reduce((sum, width) => sum + width, 34)}px`;
  } else {
    tempTableModel.rowHeights[tableResizeState.index] = Math.max(20, tableResizeState.size + event.clientY - tableResizeState.start);
    const rowElement = document.querySelector(`#tableEditorGrid tr[data-table-row="${tableResizeState.index}"]`);
    if (rowElement) rowElement.style.height = `${tempTableModel.rowHeights[tableResizeState.index]}px`;
  }
}

function finishTableResize() {
  window.removeEventListener('mousemove', handleTableResizeMove);
  if (tableResizeState) pushTableEditorHistory();
  tableResizeState = null;
}

function syncTableModelToElement(elem, model) {
  const normalized = normalizeTableModel(cloneTableValue(model));
  elem.table = normalized;
  elem.cols = normalized.cols;
  elem.rows = normalized.rows;
  elem.tableCells = cloneTableValue(normalized.cells);
  elem.cellData = Object.fromEntries(Object.entries(normalized.cells).map(([key, cell]) => [key, cell.content || '']));
  elem.columnWidths = [...normalized.columnWidths];
  elem.rowHeights = [...normalized.rowHeights];
  elem.width = normalized.columnWidths.reduce((sum, width) => sum + width, 0);
  elem.height = normalized.rowHeights.reduce((sum, height) => sum + height, 0);
  elem.widthMm = pxToMm(elem.width);
  elem.heightMm = pxToMm(elem.height);
}

function saveTableCellEditor() {
  if (!editingTableElemId || !tempTableModel) return;
  const elem = reportDef.elements.find(element => element.id === editingTableElemId);
  if (!elem) {
    showToast('Table could not be applied because its report element was not found.');
    return;
  }

  let section = reportDef.sections.find(item => item.id === elem.sectionId);
  if (!section) {
    section = reportDef.sections.find(item => item.id === activeSectionId)
      || reportDef.sections.find(item => item.id === 'details')
      || reportDef.sections[0];
    if (!section) {
      showToast('Create or select a report section before applying the table.');
      return;
    }
    elem.sectionId = section.id;
  }

  syncTableModelToElement(elem, tempTableModel);
  elem.visible = true;
  elem.x = Math.max(0, Number(elem.x) || 0);
  elem.y = Math.max(0, Number(elem.y) || 0);
  elem.xMm = pxToMm(elem.x);
  elem.yMm = pxToMm(elem.y);
  if (elem.y + elem.height > section.height) {
    section.height = elem.y + elem.height + 5;
    section.heightMm = pxToMm(section.height);
  }

  const appliedElementId = elem.id;
  const appliedSectionName = section.name || section.id;
  activeSectionId = section.id;
  selectedElementIds = [appliedElementId];
  closeTableCellEditor();
  renderCanvas();
  updateSectionsList();
  pushHistory();

  const revealAppliedTable = () => {
    const appliedElement = document.getElementById(`elem_${appliedElementId}`);
    if (!appliedElement) return;
    appliedElement.classList.add('selected');
    appliedElement.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'center' });
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(revealAppliedTable);
  else revealAppliedTable();
  showToast(`Table applied to ${appliedSectionName}.`);
}

function closeTableCellEditor() {
  editingTableElemId = null;
  tempTableModel = null;
  tempTableSelectedCells = new Set();
  tableEditorHistory = [];
  tableEditorHistoryIndex = -1;
  finishTableResize();
  document.getElementById('tableCellEditorModal')?.classList.remove('show');
}

function handleTableCellModalOverlay(event) {
  if (event.target.id === 'tableCellEditorModal') closeTableCellEditor();
}

function updateTableCols(elemId, newCols) {
  const elem = reportDef.elements.find(element => element.id === elemId);
  if (!elem) return;
  const model = buildTableModelFromElement(elem);
  const target = Math.max(1, Math.min(100, newCols));
  while (model.cols < target) insertTableColumnAt(model.cols, model);
  while (model.cols > target) deleteTableColumnAt(model.cols - 1, model);
  syncTableModelToElement(elem, model);
  renderElementOnCanvas(elem);
  pushHistory();
}

function updateTableRows(elemId, newRows) {
  const elem = reportDef.elements.find(element => element.id === elemId);
  if (!elem) return;
  const model = buildTableModelFromElement(elem);
  const target = Math.max(1, Math.min(200, newRows));
  while (model.rows < target) insertTableRowAt(model.rows, model);
  while (model.rows > target) deleteTableRowAt(model.rows - 1, model);
  syncTableModelToElement(elem, model);
  renderElementOnCanvas(elem);
  pushHistory();
}

// -------------------------------------------------------------------------
// LINE EDITING & DRAWING SUBSYSTEM (MS WORD STYLE)
// -------------------------------------------------------------------------
let isLineDrawMode = false;
let lineDrawStartPos = null;
let lineDrawSectionId = null;
let lineDrawPreviewEl = null;

function toggleLineDrawMode() {
  if (isLineDrawMode) {
    cancelLineDrawMode();
  } else {
    startLineDrawMode();
  }
}

function startLineDrawMode(type = 'line') {
  isLineDrawMode = true;
  const banner = document.getElementById('lineDrawModeBanner');
  if (banner) banner.style.display = 'flex';
  const btn = document.getElementById('btnDrawLineMode');
  if (btn) {
    btn.style.background = '#1d4ed8';
    btn.style.color = '#ffffff';
  }
  const scrollArea = document.getElementById('canvasScrollArea');
  if (scrollArea) scrollArea.style.cursor = 'crosshair';
  showToast('✏️ Word मोड: कॅनव्हासवर माऊस दाबून ओढा आणि रेषा काढा');
}

function cancelLineDrawMode() {
  isLineDrawMode = false;
  lineDrawStartPos = null;
  if (lineDrawPreviewEl && lineDrawPreviewEl.parentNode) {
    lineDrawPreviewEl.parentNode.removeChild(lineDrawPreviewEl);
  }
  lineDrawPreviewEl = null;
  const banner = document.getElementById('lineDrawModeBanner');
  if (banner) banner.style.display = 'none';
  const btn = document.getElementById('btnDrawLineMode');
  if (btn) {
    btn.style.background = '#eff6ff';
    btn.style.color = '#1d4ed8';
  }
  const scrollArea = document.getElementById('canvasScrollArea');
  if (scrollArea) scrollArea.style.cursor = '';
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isLineDrawMode) {
    cancelLineDrawMode();
  }
});

function ensureLineCoordinates(elem) {
  if (!elem || (elem.type !== 'line' && elem.type !== 'arrow_line')) return;
  if (elem.x1 === undefined || elem.x2 === undefined) {
    elem.x1 = elem.x;
    elem.y1 = elem.y;
    elem.x2 = elem.x + elem.width;
    elem.y2 = elem.y + (elem.height > 4 ? elem.height : 0);
  }
}

function setLineLength(elemId, lengthPx) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  ensureLineCoordinates(elem);
  const curLen = Math.hypot(elem.x2 - elem.x1, elem.y2 - elem.y1);
  const angle = curLen > 0 ? Math.atan2(elem.y2 - elem.y1, elem.x2 - elem.x1) : 0;
  const newLen = Math.max(5, lengthPx);
  elem.x2 = Math.round(elem.x1 + newLen * Math.cos(angle));
  elem.y2 = Math.round(elem.y1 + newLen * Math.sin(angle));
  elem.x = Math.round(Math.min(elem.x1, elem.x2));
  elem.y = Math.round(Math.min(elem.y1, elem.y2));
  elem.width = Math.round(Math.max(1, Math.abs(elem.x2 - elem.x1)));
  elem.height = Math.round(Math.max(1, Math.abs(elem.y2 - elem.y1)));
  elem.xMm = pxToMm(elem.x);
  elem.yMm = pxToMm(elem.y);
  elem.widthMm = pxToMm(elem.width);
  elem.heightMm = pxToMm(elem.height);
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

function setLineOrientation(elemId, mode) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  ensureLineCoordinates(elem);
  const len = Math.max(20, Math.round(Math.hypot(elem.x2 - elem.x1, elem.y2 - elem.y1)));
  if (mode === 'horizontal') {
    elem.x2 = elem.x1 + len;
    elem.y2 = elem.y1;
  } else if (mode === 'vertical') {
    elem.x2 = elem.x1;
    elem.y2 = elem.y1 + len;
  } else if (mode === 'diagonal') {
    const d = Math.round(len / Math.SQRT2);
    elem.x2 = elem.x1 + d;
    elem.y2 = elem.y1 + d;
  }
  elem.x = Math.round(Math.min(elem.x1, elem.x2));
  elem.y = Math.round(Math.min(elem.y1, elem.y2));
  elem.width = Math.round(Math.max(1, Math.abs(elem.x2 - elem.x1)));
  elem.height = Math.round(Math.max(1, Math.abs(elem.y2 - elem.y1)));
  elem.xMm = pxToMm(elem.x);
  elem.yMm = pxToMm(elem.y);
  elem.widthMm = pxToMm(elem.width);
  elem.heightMm = pxToMm(elem.height);
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
  showToast(`Line oriented: ${mode}`);
}

function setLineFullWidth(elemId) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  const printableW = getHorizontalDesignWidth();
  elem.x = 0;
  elem.x1 = 0;
  elem.x2 = printableW;
  elem.y2 = elem.y1;
  elem.width = printableW;
  elem.height = 2;
  elem.xMm = 0;
  elem.widthMm = pxToMm(printableW);
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
  showToast(`Line set to full page width: ${printableW}px`);
}

function setLineThickness(elemId, thicknessPx) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  elem.height = thicknessPx;
  elem.heightMm = pxToMm(thicknessPx);
  if (!elem.styles) elem.styles = {};
  elem.styles.height = thicknessPx + 'px';
  if (elem.styles.borderTop && elem.styles.borderTop !== 'none') {
    elem.styles.borderTop = elem.styles.borderTop.replace(/^\d+px/, `${thicknessPx}px`);
  }
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

function setLineStyle(elemId, styleType) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  if (!elem.styles) elem.styles = {};
  const color = elem.styles.backgroundColor || elem.styles.color || '#000000';
  const thickness = elem.height || 1;
  if (styleType === 'dashed') {
    elem.styles.backgroundColor = 'transparent';
    elem.styles.borderTop = `${thickness}px dashed ${color}`;
  } else if (styleType === 'dotted') {
    elem.styles.backgroundColor = 'transparent';
    elem.styles.borderTop = `${thickness}px dotted ${color}`;
  } else {
    elem.styles.borderTop = 'none';
    elem.styles.backgroundColor = color;
  }
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

function setLineColor(elemId, colorHex) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  if (!elem.styles) elem.styles = {};
  if (elem.styles.borderTop && elem.styles.borderTop !== 'none') {
    elem.styles.borderTop = elem.styles.borderTop.replace(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|[a-z]+$/, colorHex);
  } else {
    elem.styles.backgroundColor = colorHex;
  }
  elem.styles.color = colorHex;
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

function setShapeBorderColor(elemId, color) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  if (!elem.styles) elem.styles = {};
  elem.styles.borderColor = color;
  elem.styles.color = color;
  if (elem.type === 'box' || elem.type === 'box_rounded' || elem.type === 'circle' || elem.type === 'text_box') {
    const curW = parseInt(elem.styles.borderWidth || (elem.styles.border && elem.styles.border.match(/\d+/)?.[0]) || 1, 10);
    elem.styles.border = `${curW}px solid ${color}`;
  }
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

function setShapeBorderWidth(elemId, widthPx) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  if (!elem.styles) elem.styles = {};
  elem.styles.borderWidth = widthPx;
  const color = elem.styles.borderColor || elem.styles.color || '#000000';
  if (elem.type === 'box' || elem.type === 'box_rounded' || elem.type === 'circle' || elem.type === 'text_box') {
    elem.styles.border = `${widthPx}px solid ${color}`;
  }
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

function setShapeFillColor(elemId, color) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  if (!elem.styles) elem.styles = {};
  elem.styles.backgroundColor = color;
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

function setShapeBorderRadius(elemId, radiusPx) {
  const elem = reportDef.elements.find(el => el.id === elemId);
  if (!elem) return;
  if (!elem.styles) elem.styles = {};
  elem.styles.borderRadius = radiusPx + 'px';
  renderElementOnCanvas(elem);
  updatePropertiesPanel();
  pushHistory();
}

// -------------------------------------------------------------------------
// 2. ALIGN, TEXT COLOR, BG COLOR, PAGE COLOR & WATERMARK SUBSYSTEM
// -------------------------------------------------------------------------
function toggleMarginDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnMarginMenu', 'marginDropdown');
}

function applyMarginPreset(top, right, bottom, left) {
  if (!reportDef) return;
  if (!reportDef.margins) reportDef.margins = {};
  reportDef.margins.top = top;
  reportDef.margins.right = right;
  reportDef.margins.bottom = bottom;
  reportDef.margins.left = left;
  const inpL = document.getElementById('inpMarginLeft');
  const inpR = document.getElementById('inpMarginRight');
  const inpT = document.getElementById('inpMarginTop');
  const inpB = document.getElementById('inpMarginBottom');
  if (inpL) inpL.value = left;
  if (inpR) inpR.value = right;
  if (inpT) inpT.value = top;
  if (inpB) inpB.value = bottom;
  updateMarginGuides();
  pushHistory();
  showToast(`Margins: ${top}mm (T/B), ${left}mm (L/R)`);
}

function toggleAlignDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnAlignMenu', 'alignDropdown');
}

function toggleTextColorDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnTextColorMenu', 'textColorDropdown');
}

function applyTextColor(colorHex) {
  const ind = document.getElementById('textColorIndicator');
  if (ind) ind.style.background = colorHex;
  applyStyleToSelected('color', colorHex);
  closeAllWordDropdowns();
  showToast(`Font Color: ${colorHex}`);
}

function toggleBgColorDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnBgColorMenu', 'bgColorDropdown');
}

function applyBgColor(colorHex) {
  const ind = document.getElementById('bgColorIndicator');
  if (ind) ind.style.background = colorHex === 'transparent' ? '#ffffff' : colorHex;
  applyStyleToSelected('backgroundColor', colorHex);
  closeAllWordDropdowns();
  showToast(`Background Color: ${colorHex === 'transparent' ? 'No Color' : colorHex}`);
}

function togglePageColorDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnPageColorMenu', 'pageColorDropdown');
}

function applyPageColor(colorHex) {
  if (!reportDef) return;
  reportDef.pageColor = colorHex === 'transparent' ? '#ffffff' : colorHex;
  renderCanvas();
  pushHistory();
  showToast(`पृष्ठ रंग (Page Color): ${colorHex}`);
  closeAllWordDropdowns();
}

function toggleWatermarkDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnWatermarkMenu', 'watermarkDropdown');
}

function applyWatermark(text, rotation = -45, color = 'rgba(148, 163, 184, 0.35)', fontSize = 68) {
  if (!reportDef) return;
  reportDef.watermark = {
    text: text,
    rotation: rotation,
    color: color,
    fontSize: fontSize
  };
  renderCanvas();
  pushHistory();
  showToast(`वाटरमार्क लागू केला: ${text}`);
  closeAllWordDropdowns();
}

function removeWatermark() {
  if (!reportDef) return;
  reportDef.watermark = null;
  renderCanvas();
  pushHistory();
  showToast('वाटरमार्क काढला (Watermark Removed)');
  closeAllWordDropdowns();
}

// -------------------------------------------------------------------------
// MS WORD BULLET LIBRARY & PARAGRAPH LIST SUBSYSTEM
// -------------------------------------------------------------------------
function toggleBulletDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnBulletMenu', 'bulletDropdown');
}

function toggleNumberingDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnNumberMenu', 'numberingDropdown');
}

function toggleBulletSelected() {
  // Toggle solid circle bullet on selected element, or create bulleted list
  applyBulletStyle('●');
}

function toggleNumberingSelected() {
  // Toggle 1. 2. 3. numbering on selected element
  applyNumberingStyle('1.');
}

function toggleMultilevelSelected() {
  // Multilevel 1. a. i. style
  applyMultilevelStyle('1ai');
}

function toggleMultilevelDropdown(event) {
  if (event) event.stopPropagation();
  openFloatingDropdown('btnMultilevelMenu', 'multilevelDropdown');
}

function applyMultilevelStyle(styleType) {
  const targets = getSelectedTextElements();

  if (targets.length === 0) {
    const secId = activeSectionId || (reportDef.sections && reportDef.sections[0] ? reportDef.sections[0].id : 'sec_details');
    let sampleText = '1. First topic\n   a. Sub-topic one\n      i. Detailed item';
    if (styleType === 'decimal') {
      sampleText = '1. First topic\n   1.1. Sub-topic one\n      1.1.1. Detailed item';
    } else if (styleType === 'bullets') {
      sampleText = '❖ First topic\n   ➢ Sub-topic one\n      ■ Detailed item';
    } else if (styleType === 'article') {
      sampleText = 'Article I. General Provisions\nSection 1.01 Definitions\n   (a) Scope and Terms';
    } else if (styleType === 'heading') {
      sampleText = '1 Heading 1\n1.1 Heading 2\n1.1.1 Heading 3';
    } else if (styleType === 'roman') {
      sampleText = 'I. Main Section\n   A. Subsection\n      1. Clause';
    } else if (styleType === 'chapter') {
      sampleText = 'Chapter 1 Overview\n   Heading 2\n      Heading 3';
    }

    const newElem = {
      id: 'el_' + Date.now(),
      name: 'MultilevelList_' + Math.floor(Math.random() * 1000),
      type: 'text_box',
      sectionId: secId,
      x: 40,
      y: 20,
      width: 240,
      height: 80,
      text: sampleText,
      textWrapping: true,
      styles: {
        fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
        fontSize: '10.5px',
        color: '#000000',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        padding: '4px 6px',
        textAlign: 'left'
      }
    };
    reportDef.elements.push(newElem);
    renderElementOnCanvas(newElem);
    selectedElementIds = [newElem.id];
    document.querySelectorAll('.cr-element').forEach(el => el.classList.remove('selected'));
    const domEl = document.getElementById(`elem_${newElem.id}`);
    if (domEl) domEl.classList.add('selected');
    updatePropertiesPanel();
    pushHistory();
    closeAllWordDropdowns();
    showToast('नवीन बहुस्तरीय यादी जोडली (Multilevel List Added)');
    return;
  }

  targets.forEach(elem => {
    let rawText = elem.text !== undefined ? elem.text : (elem.fieldName ? `{${elem.fieldName}}` : 'Sample Text');
    let lines = rawText.split('\n');

    if (styleType === 'none') {
      lines = lines.map(line => {
        return line.replace(/^(\s*)([•●○■◆❖➤✓✔★✦*–—\-→►▪]|\d+[\.\)]|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)]|Article\s+[IVXLCDM]+[\.\:]?|Section\s+[\d\.]+[\.\:]?|\([\w\d]+\))\s*/, '$1');
      });
    } else {
      lines = lines.map((line, idx) => {
        const stripped = line.replace(/^(\s*)([•●○■◆❖➤✓✔★✦*–—\-→►▪]|\d+[\.\)]|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)]|Article\s+[IVXLCDM]+[\.\:]?|Section\s+[\d\.]+[\.\:]?|\([\w\d]+\))\s*/, '$1').trimStart();
        const level = idx % 3;
        const group = Math.floor(idx / 3) + 1;
        let prefix = '';

        if (styleType === '1ai' || styleType === 'default') {
          if (level === 0) prefix = `${group}. `;
          else if (level === 1) prefix = `   ${String.fromCharCode(97 + (group - 1))}. `;
          else prefix = `      i. `;
        } else if (styleType === '1ai_bracket') {
          if (level === 0) prefix = `${group}) `;
          else if (level === 1) prefix = `   ${String.fromCharCode(97 + (group - 1))}) `;
          else prefix = `      i) `;
        } else if (styleType === 'decimal') {
          if (level === 0) prefix = `${group}. `;
          else if (level === 1) prefix = `   ${group}.1. `;
          else prefix = `      ${group}.1.1. `;
        } else if (styleType === 'bullets') {
          if (level === 0) prefix = `❖ `;
          else if (level === 1) prefix = `   ➢ `;
          else prefix = `      ■ `;
        } else if (styleType === 'article') {
          if (level === 0) prefix = `Article I. `;
          else if (level === 1) prefix = `Section 1.01 `;
          else prefix = `   (a) `;
        } else if (styleType === 'heading') {
          if (level === 0) prefix = `${group} Heading 1 `;
          else if (level === 1) prefix = `${group}.1 Heading 2 `;
          else prefix = `${group}.1.1 Heading 3 `;
        } else if (styleType === 'roman') {
          const romans = ['I', 'II', 'III', 'IV', 'V'];
          if (level === 0) prefix = `${romans[group - 1] || group}. `;
          else if (level === 1) prefix = `   ${String.fromCharCode(65 + (group - 1))}. `;
          else prefix = `      1. `;
        } else if (styleType === 'chapter') {
          if (level === 0) prefix = `Chapter ${group} `;
          else if (level === 1) prefix = `   Heading 2 `;
          else prefix = `      Heading 3 `;
        }

        return prefix + stripped;
      });
    }

    elem.text = lines.join('\n');
    elem.textWrapping = true;
    if (lines.length > 1 && elem.height < lines.length * 20) {
      elem.height = Math.max(elem.height, lines.length * 22);
    }
    renderElementOnCanvas(elem);
  });

  pushHistory();
  updatePropertiesPanel();
  closeAllWordDropdowns();
  showToast(styleType === 'none' ? 'यादी फॉरमॅट काढला' : `Multilevel List लागू केले: ${styleType}`);
}

function openDefineMultilevelModal() {
  closeAllWordDropdowns();
  showToast('नवीन बहुस्तरीय यादी परिभाषित करा (Define New Multilevel List)');
}

function openDefineListStyleModal() {
  closeAllWordDropdowns();
  showToast('नवीन यादी शैली परिभाषित करा (Define New List Style)');
}

function getSelectedTextElements() {
  if (!reportDef || !Array.isArray(reportDef.elements)) return [];
  return selectedElementIds
    .map(id => reportDef.elements.find(el => el.id === id))
    .filter(el => el && (el.type === 'text' || el.type === 'text_box' || el.type === 'field'));
}

function applyBulletStyle(bulletType) {
  const targets = getSelectedTextElements();

  if (targets.length === 0) {
    // Create new bulleted list text element in active section
    const secId = activeSectionId || (reportDef.sections && reportDef.sections[0] ? reportDef.sections[0].id : 'sec_details');
    const bChar = (bulletType === 'none') ? '●' : bulletType;
    const newElem = {
      id: 'el_' + Date.now(),
      name: 'BulletList_' + Math.floor(Math.random() * 1000),
      type: 'text_box',
      sectionId: secId,
      x: 40,
      y: 20,
      width: 220,
      height: 75,
      text: `${bChar} प्रथम घटक (First item)\n${bChar} द्वितीय घटक (Second item)\n${bChar} तृतीय घटक (Third item)`,
      textWrapping: true,
      styles: {
        fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
        fontSize: '10.5px',
        color: '#000000',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        padding: '4px 6px',
        textAlign: 'left'
      }
    };
    reportDef.elements.push(newElem);
    renderElementOnCanvas(newElem);
    selectedElementIds = [newElem.id];
    document.querySelectorAll('.cr-element').forEach(el => el.classList.remove('selected'));
    const domEl = document.getElementById(`elem_${newElem.id}`);
    if (domEl) domEl.classList.add('selected');
    updatePropertiesPanel();
    pushHistory();
    closeAllWordDropdowns();
    showToast(`नवीन बुलेट यादी जोडली (${bChar})`);
    return;
  }

  targets.forEach(elem => {
    let rawText = elem.text !== undefined ? elem.text : (elem.fieldName ? `{${elem.fieldName}}` : 'Sample Text');
    let lines = rawText.split('\n');

    if (bulletType === 'none') {
      lines = lines.map(line => {
        return line.replace(/^(\s*)([•●○■◆❖➤✓✔★✦*–—\-→►▪]|\d+[\.\)]|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)])\s*/, '$1');
      });
    } else {
      // Check if lines already have this exact bullet
      const allHaveThisBullet = lines.every(l => l.trim().startsWith(bulletType));
      if (allHaveThisBullet) {
        // Toggle off
        lines = lines.map(line => line.replace(/^(\s*)[•●○■◆❖➤✓✔★✦*–—\-→►▪]\s*/, '$1'));
      } else {
        lines = lines.map(line => {
          const stripped = line.replace(/^(\s*)([•●○■◆❖➤✓✔★✦*–—\-→►▪]|\d+[\.\)]|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)])\s*/, '$1');
          return `${bulletType} ${stripped.trimStart()}`;
        });
      }
    }

    elem.text = lines.join('\n');
    elem.textWrapping = true;
    if (lines.length > 1 && elem.height < lines.length * 20) {
      elem.height = Math.max(elem.height, lines.length * 22);
    }
    renderElementOnCanvas(elem);
  });

  pushHistory();
  updatePropertiesPanel();
  closeAllWordDropdowns();
  showToast(bulletType === 'none' ? 'बुलेट काढले (Bullets Removed)' : `बुलेट लागू केले: ${bulletType}`);
}

function applyNumberingStyle(numType) {
  const targets = getSelectedTextElements();
  const devDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  function toDev(n) {
    return String(n).split('').map(d => devDigits[parseInt(d, 10)] || d).join('');
  }
  function toRoman(n) {
    const romans = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romans[n] || String(n);
  }

  if (targets.length === 0) {
    const secId = activeSectionId || (reportDef.sections && reportDef.sections[0] ? reportDef.sections[0].id : 'sec_details');
    const newElem = {
      id: 'el_' + Date.now(),
      name: 'NumList_' + Math.floor(Math.random() * 1000),
      type: 'text_box',
      sectionId: secId,
      x: 40,
      y: 20,
      width: 220,
      height: 75,
      text: numType === 'dev'
        ? '१. प्रथम नोंद (First entry)\n२. द्वितीय नोंद (Second entry)\n३. तृतीय नोंद (Third entry)'
        : (numType === '1)' ? '1) First item\n2) Second item\n3) Third item'
          : (numType === 'I.' ? 'I. First item\nII. Second item\nIII. Third item'
            : (numType === 'i.' ? 'i. First item\nii. Second item\niii. Third item'
              : (numType === 'A.' ? 'A. First item\nB. Second item\nC. Third item'
                : (numType === 'a.' ? 'a. First item\nb. Second item\nc. Third item'
                  : (numType === 'a)' ? 'a) First item\nb) Second item\nc) Third item'
                    : '1. First item\n2. Second item\n3. Third item')))))),
      textWrapping: true,
      styles: {
        fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
        fontSize: '10.5px',
        color: '#000000',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        padding: '4px 6px',
        textAlign: 'left'
      }
    };
    reportDef.elements.push(newElem);
    renderElementOnCanvas(newElem);
    selectedElementIds = [newElem.id];
    document.querySelectorAll('.cr-element').forEach(el => el.classList.remove('selected'));
    const domEl = document.getElementById(`elem_${newElem.id}`);
    if (domEl) domEl.classList.add('selected');
    updatePropertiesPanel();
    pushHistory();
    closeAllWordDropdowns();
    showToast('नवीन क्रमांक यादी जोडली (Numbered List Added)');
    return;
  }

  targets.forEach(elem => {
    let rawText = elem.text !== undefined ? elem.text : (elem.fieldName ? `{${elem.fieldName}}` : 'Sample Text');
    let lines = rawText.split('\n');

    if (numType === 'none') {
      lines = lines.map(line => {
        return line.replace(/^(\s*)([•●○■◆❖➤✓✔★✦*–—\-→►▪]|\d+[\.\)]|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)]|[०-९]+[\.\)])\s*/, '$1');
      });
    } else {
      lines = lines.map((line, idx) => {
        const stripped = line.replace(/^(\s*)([•●○■◆❖➤✓✔★✦*–—\-→►▪]|\d+[\.\)]|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)]|[०-९]+[\.\)])\s*/, '$1').trimStart();
        const n = idx + 1;
        let prefix = `${n}. `;
        if (numType === '1)') prefix = `${n}) `;
        else if (numType === 'I.') prefix = `${toRoman(n)}. `;
        else if (numType === 'i.') prefix = `${toRoman(n).toLowerCase()}. `;
        else if (numType === 'A.') prefix = `${String.fromCharCode(64 + n)}. `;
        else if (numType === 'a.') prefix = `${String.fromCharCode(96 + n)}. `;
        else if (numType === 'a)') prefix = `${String.fromCharCode(96 + n)}) `;
        else if (numType === 'dev') prefix = `${toDev(n)}. `;
        else if (numType === 'multi') {
          if (idx % 3 === 0) prefix = `${Math.floor(idx / 3) + 1}. `;
          else if (idx % 3 === 1) prefix = `   ${String.fromCharCode(97 + (idx % 3) - 1)}. `;
          else prefix = `      i. `;
        }
        return prefix + stripped;
      });
    }

    elem.text = lines.join('\n');
    elem.textWrapping = true;
    if (lines.length > 1 && elem.height < lines.length * 20) {
      elem.height = Math.max(elem.height, lines.length * 22);
    }
    renderElementOnCanvas(elem);
  });

  pushHistory();
  updatePropertiesPanel();
  closeAllWordDropdowns();
  showToast(numType === 'none' ? 'क्रमांक काढले (Numbers Removed)' : `क्रमांक लागू केले: ${numType}`);
}

function openDefineNumberFormatModal() {
  closeAllWordDropdowns();
  showToast('नवीन क्रमांक फॉरमॅट परिभाषित करा (Define New Number Format)');
}

function openSetNumberingValueModal() {
  closeAllWordDropdowns();
  const val = prompt('क्रमांक सुरू मूल्य सेट करा (उदा. 1 किंवा 5):', '1');
  if (val) {
    showToast(`क्रमांक सुरू मूल्य: ${val}`);
  }
}

function applyListLevel(level) {
  const targets = getSelectedTextElements();
  if (targets.length === 0) {
    showToast('घटक निवडा (Select a text element first)');
    closeAllWordDropdowns();
    return;
  }
  const indentSpaces = '    '.repeat(Math.max(0, level - 1));
  targets.forEach(elem => {
    let rawText = elem.text !== undefined ? elem.text : '';
    let lines = rawText.split('\n');
    lines = lines.map(line => {
      const stripped = line.trimStart();
      return indentSpaces + stripped;
    });
    elem.text = lines.join('\n');
    renderElementOnCanvas(elem);
  });
  pushHistory();
  closeAllWordDropdowns();
  showToast(`List Level: ${level}`);
}

function changeIndentSelected(delta) {
  if (selectedElementIds.length === 0) return;
  const targets = getSelectedTextElements();
  if (targets.length > 0) {
    targets.forEach(elem => {
      let rawText = elem.text !== undefined ? elem.text : '';
      let lines = rawText.split('\n');
      if (delta > 0) {
        lines = lines.map(line => '    ' + line);
      } else {
        lines = lines.map(line => line.replace(/^ {1,4}/, ''));
      }
      elem.text = lines.join('\n');
      renderElementOnCanvas(elem);
    });
    pushHistory();
    updatePropertiesPanel();
    showToast(delta > 0 ? 'समास वाढवला (Increased Indent)' : 'समास कमी केला (Decreased Indent)');
  } else {
    // Adjust position x
    const printableW = getHorizontalDesignWidth ? getHorizontalDesignWidth() : 800;
    selectedElementIds.forEach(id => {
      const elem = reportDef.elements.find(el => el.id === id);
      if (elem) {
        elem.x = Math.max(0, Math.min(elem.x + (delta * 15), printableW - elem.width));
        elem.xMm = pxToMm(elem.x);
        renderElementOnCanvas(elem);
      }
    });
    pushHistory();
    updatePropertiesPanel();
    showToast(delta > 0 ? 'Indent Right (+15px)' : 'Indent Left (-15px)');
  }
}

function sortSelectedLines() {
  const targets = getSelectedTextElements();
  if (targets.length === 0) {
    showToast('मजकूर घटक निवडा (Select a text element to sort lines)');
    return;
  }
  targets.forEach(elem => {
    let rawText = elem.text !== undefined ? elem.text : '';
    let lines = rawText.split('\n');
    lines.sort((a, b) => a.localeCompare(b, 'mr'));
    elem.text = lines.join('\n');
    renderElementOnCanvas(elem);
  });
  pushHistory();
  updatePropertiesPanel();
  showToast('A-Z ओळी क्रमवारी लावली (Lines Sorted)');
}

let isPilcrowVisible = false;
function toggleParagraphMarks() {
  isPilcrowVisible = !isPilcrowVisible;
  const btn = document.getElementById('btnPilcrowToggle');
  if (btn) {
    btn.classList.toggle('active', isPilcrowVisible);
  }
  document.querySelectorAll('.cr-element').forEach(el => {
    el.classList.toggle('show-pilcrow', isPilcrowVisible);
  });
  showToast(isPilcrowVisible ? 'परिच्छेद चिन्ह दृश्यमान (Paragraph Marks Shown)' : 'परिच्छेद चिन्ह लपवले (Paragraph Marks Hidden)');
}

// -------------------------------------------------------------------------
// DEFINE NEW BULLET MODAL SUBSYSTEM
// -------------------------------------------------------------------------
const POPULAR_BULLET_SYMBOLS = ['★', '✪', '✦', '❖', '◆', '➔', '⮞', '⦿', '✔', '►', '▪', '✿', '🗹', '◈', '➢', '•'];

function buildCustomBulletPicker() {
  const grid = document.getElementById('customBulletPickerGrid');
  if (!grid || grid.children.length > 0) return;
  POPULAR_BULLET_SYMBOLS.forEach(sym => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cr-btn';
    btn.style.cssText = 'height: 32px; font-size: 16px; padding: 0; justify-content: center;';
    btn.textContent = sym;
    btn.onclick = () => selectCustomBullet(sym);
    grid.appendChild(btn);
  });
}

function openDefineBulletModal() {
  closeAllWordDropdowns();
  buildCustomBulletPicker();
  const modal = document.getElementById('defineBulletModal');
  if (modal) {
    modal.classList.add('show');
    const inp = document.getElementById('customBulletCharInput');
    if (inp) {
      inp.focus();
      inp.select();
    }
    updateBulletPreview();
  }
}

function closeDefineBulletModal() {
  const modal = document.getElementById('defineBulletModal');
  if (modal) modal.classList.remove('show');
}

function handleDefineBulletOverlay(event) {
  if (event.target.id === 'defineBulletModal') closeDefineBulletModal();
}

function selectCustomBullet(char) {
  const inp = document.getElementById('customBulletCharInput');
  if (inp) {
    inp.value = char;
    updateBulletPreview();
  }
}

function updateBulletPreview() {
  const inp = document.getElementById('customBulletCharInput');
  const char = (inp && inp.value) ? inp.value : '★';
  const c1 = document.getElementById('bulletPreviewChar');
  const c2 = document.getElementById('bulletPreviewChar2');
  if (c1) c1.textContent = char;
  if (c2) c2.textContent = char;
}

function applyDefinedCustomBullet() {
  const inp = document.getElementById('customBulletCharInput');
  const char = (inp && inp.value.trim()) ? inp.value.trim() : '★';
  applyBulletStyle(char);
  closeDefineBulletModal();
}

function openWatermarkModal(initialType = null) {
  closeAllWordDropdowns();
  const modal = document.getElementById('watermarkModal');
  if (!modal) return;

  const wm = reportDef && reportDef.watermark;
  let activeType = initialType || (wm ? (wm.type || (wm.imageUrl ? 'image' : 'text')) : 'text');

  if (wm && (wm.type === 'image' || wm.imageUrl)) {
    const urlInput = document.getElementById('wmImageUrlInput');
    if (urlInput) urlInput.value = wm.imageUrl || '';
    const scaleSel = document.getElementById('wmImageScale');
    if (scaleSel) scaleSel.value = wm.scale || 'auto';
    const washoutChk = document.getElementById('wmImageWashout');
    if (washoutChk) washoutChk.checked = wm.washout !== false;
    const fileNameSpan = document.getElementById('wmImageFileName');
    if (fileNameSpan) fileNameSpan.textContent = wm.imageUrl ? wm.imageUrl.split('/').pop().slice(0, 25) : 'चित्र निवडलेले नाही';
  } else if (wm && wm.text) {
    const txtInput = document.getElementById('wmTextInput');
    if (txtInput) txtInput.value = wm.text || 'गोपनीय / CONFIDENTIAL';
    const fontSel = document.getElementById('wmFontFamily');
    if (fontSel && wm.fontFamily) fontSel.value = wm.fontFamily;
    const sizeSel = document.getElementById('wmFontSize');
    if (sizeSel && wm.fontSize) sizeSel.value = wm.fontSize;
    const colorInp = document.getElementById('wmColorInput');
    if (colorInp && wm.color) colorInp.value = wm.color.startsWith('#') ? wm.color : '#94a3b8';
    const semiChk = document.getElementById('wmSemitransparent');
    if (semiChk) semiChk.checked = wm.semitransparent !== false;
    if (wm.rotation === 0) {
      const horiz = document.getElementById('wmLayoutHorizontal');
      if (horiz) horiz.checked = true;
    } else {
      const diag = document.getElementById('wmLayoutDiagonal');
      if (diag) diag.checked = true;
    }
  }

  switchWatermarkOption(activeType);
  modal.classList.add('show');
}

function closeWatermarkModal() {
  const modal = document.getElementById('watermarkModal');
  if (modal) modal.classList.remove('show');
}

function handleWatermarkOverlayClick(event) {
  if (event.target.id === 'watermarkModal') {
    closeWatermarkModal();
  }
}

function switchWatermarkOption(type) {
  const optNone = document.getElementById('optWmNone');
  const optImage = document.getElementById('optWmImage');
  const optText = document.getElementById('optWmText');

  if (type === 'none' && optNone) optNone.checked = true;
  if (type === 'image' && optImage) optImage.checked = true;
  if (type === 'text' && optText) optText.checked = true;

  const secNone = document.getElementById('secWmNone');
  const secImage = document.getElementById('secWmImage');
  const secText = document.getElementById('secWmText');

  if (secNone) secNone.classList.toggle('active', type === 'none');
  if (secImage) secImage.classList.toggle('active', type === 'image');
  if (secText) secText.classList.toggle('active', type === 'text');

  updateWatermarkLivePreview();
}

function handleWatermarkImageFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    const urlInput = document.getElementById('wmImageUrlInput');
    if (urlInput) urlInput.value = dataUrl;
    const fileNameSpan = document.getElementById('wmImageFileName');
    if (fileNameSpan) fileNameSpan.textContent = file.name.slice(0, 25);
    switchWatermarkOption('image');
  };
  reader.readAsDataURL(file);
}

function handleWatermarkImageUrlChange(url) {
  const fileNameSpan = document.getElementById('wmImageFileName');
  if (fileNameSpan) fileNameSpan.textContent = url ? url.split('/').pop().slice(0, 25) : 'चित्र निवडलेले नाही';
  switchWatermarkOption('image');
}

function updateWatermarkLivePreview() {
  const container = document.getElementById('wmModalPreviewContent');
  if (!container) return;

  const selectedOpt = document.querySelector('input[name="wmTypeOption"]:checked')?.value || 'text';

  if (selectedOpt === 'none') {
    container.innerHTML = '<span style="font-size:10px; color:#94a3b8; font-style:italic;">वॉटरमार्क नाही<br>(No Watermark)</span>';
    return;
  }

  if (selectedOpt === 'image') {
    const url = document.getElementById('wmImageUrlInput')?.value || '/logo_1.png';
    const washout = document.getElementById('wmImageWashout')?.checked !== false;
    const scale = document.getElementById('wmImageScale')?.value || 'auto';
    const opacity = washout ? 0.22 : 0.85;
    const style = scale === 'auto'
      ? 'max-width:80%; max-height:80%; object-fit:contain;'
      : `width:${scale}; max-width:95%; height:auto;`;
    container.innerHTML = `<img src="${url}" style="${style} opacity:${opacity}; display:block;" onerror="this.src='/logo_1.png'">`;
    return;
  }

  // Text Watermark
  const text = document.getElementById('wmTextInput')?.value || 'गोपनीय / CONFIDENTIAL';
  const font = document.getElementById('wmFontFamily')?.value || 'Noto Sans Devanagari';
  const color = document.getElementById('wmColorInput')?.value || '#94a3b8';
  const semi = document.getElementById('wmSemitransparent')?.checked !== false;
  const isDiag = document.getElementById('wmLayoutDiagonal')?.checked !== false;
  const rot = isDiag ? -45 : 0;
  const opacity = semi ? 0.45 : 0.85;

  container.innerHTML = `
        <div style="font-family:${font}; font-size:12px; font-weight:800; color:${color}; opacity:${opacity}; transform:rotate(${rot}deg); white-space:nowrap; text-align:center; max-width:125px; overflow:hidden; text-overflow:ellipsis;">
          ${escapeHtml(text)}
        </div>
      `;
}

function applyWatermarkFromModal(closeAfter = true) {
  if (!reportDef) return;

  const selectedOpt = document.querySelector('input[name="wmTypeOption"]:checked')?.value || 'none';

  if (selectedOpt === 'none') {
    reportDef.watermark = null;
    renderCanvas();
    pushHistory();
    showToast('वॉटरमार्क काढला (Watermark Removed)');
    if (closeAfter) closeWatermarkModal();
    return;
  }

  if (selectedOpt === 'image') {
    const url = document.getElementById('wmImageUrlInput')?.value?.trim();
    if (!url) {
      showToast('⚠️ कृपया चित्र निवडा किंवा इमेज URL प्रविष्ट करा!');
      document.getElementById('wmImageUrlInput')?.focus();
      return;
    }
    const scale = document.getElementById('wmImageScale')?.value || 'auto';
    const washout = document.getElementById('wmImageWashout')?.checked !== false;
    const opacity = washout ? 0.18 : 0.85;

    reportDef.watermark = {
      type: 'image',
      imageUrl: url,
      scale: scale,
      washout: washout,
      opacity: opacity
    };
    renderCanvas();
    pushHistory();
    showToast('चित्र वॉटरमार्क लागू केला (Picture Watermark Applied)');
    if (closeAfter) closeWatermarkModal();
    return;
  }

  // Text Watermark
  const text = document.getElementById('wmTextInput')?.value?.trim() || 'गोपनीय / CONFIDENTIAL';
  const font = document.getElementById('wmFontFamily')?.value || "'Noto Sans Devanagari', Arial, sans-serif";
  const sizeVal = document.getElementById('wmFontSize')?.value || 'auto';
  const fontSize = sizeVal === 'auto' ? 64 : parseInt(sizeVal, 10);
  const colorHex = document.getElementById('wmColorInput')?.value || '#94a3b8';
  const semi = document.getElementById('wmSemitransparent')?.checked !== false;
  const isDiag = document.getElementById('wmLayoutDiagonal')?.checked !== false;
  const rot = isDiag ? -45 : 0;
  const finalColor = semi ? (colorHex.startsWith('#') ? hexToRgba(colorHex, 0.35) : colorHex) : colorHex;

  reportDef.watermark = {
    type: 'text',
    text: text,
    fontFamily: font,
    fontSize: fontSize,
    color: finalColor,
    rotation: rot,
    semitransparent: semi
  };
  renderCanvas();
  pushHistory();
  showToast(`मजकूर वॉटरमार्क लागू केला: ${text}`);
  if (closeAfter) closeWatermarkModal();
}

function hexToRgba(hex, alpha = 0.35) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) || 148;
  const g = parseInt(c.substring(2, 4), 16) || 163;
  const b = parseInt(c.substring(4, 6), 16) || 184;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function promptCustomWatermark() {
  closeAllWordDropdowns();
  openWatermarkModal();
}

// 2.1 CUSTOM PAPER SIZE SUBSYSTEM
function openCustomPaperModal() {
  const modal = document.getElementById('customPaperModal');
  if (!modal || !reportDef) return;

  const curW = reportDef.customWidthMm || (reportDef.widthMm ? Math.min(reportDef.widthMm, reportDef.heightMm) : 210);
  const curH = reportDef.customHeightMm || (reportDef.heightMm ? Math.max(reportDef.widthMm, reportDef.heightMm) : 297);
  const isLandscape = (reportDef.orientation || '').toLowerCase() === 'landscape';

  const inpW = document.getElementById('customPaperWidth');
  const inpH = document.getElementById('customPaperHeight');
  if (inpW) inpW.value = curW;
  if (inpH) inpH.value = curH;

  const pRadio = document.getElementById('customOrientPortrait');
  const lRadio = document.getElementById('customOrientLandscape');
  if (isLandscape && lRadio) lRadio.checked = true;
  else if (pRadio) pRadio.checked = true;

  updateCustomPaperPreview();
  modal.classList.add('show');
}

function closeCustomPaperModal() {
  const modal = document.getElementById('customPaperModal');
  if (modal) modal.classList.remove('show');
  const sel = document.getElementById('selPaperSize');
  if (sel && reportDef) {
    sel.value = reportDef.paperSize || 'A4';
  }
}

function handleCustomPaperOverlayClick(event) {
  if (event.target.id === 'customPaperModal') {
    closeCustomPaperModal();
  }
}

function applyCustomPaperPreset(val) {
  if (!val) return;
  const parts = val.split(',');
  const w = parseFloat(parts[0]);
  const h = parseFloat(parts[1]);
  const inpW = document.getElementById('customPaperWidth');
  const inpH = document.getElementById('customPaperHeight');
  if (inpW) inpW.value = w;
  if (inpH) inpH.value = h;
  updateCustomPaperPreview();
}

function updateCustomPaperPreview() {
  const w = parseFloat(document.getElementById('customPaperWidth')?.value) || 210;
  const h = parseFloat(document.getElementById('customPaperHeight')?.value) || 297;
  const isLandscape = document.getElementById('customOrientLandscape')?.checked;

  const finalW = isLandscape ? Math.max(w, h) : Math.min(w, h);
  const finalH = isLandscape ? Math.min(w, h) : Math.max(w, h);

  const ratio = finalW / Math.max(1, finalH);
  const previewBox = document.getElementById('customPaperRatioBox');
  const textSpan = document.getElementById('customPaperDimensionsText');

  if (previewBox) {
    const maxDim = 54;
    if (ratio >= 1) {
      previewBox.style.width = maxDim + 'px';
      previewBox.style.height = Math.max(16, Math.round(maxDim / ratio)) + 'px';
    } else {
      previewBox.style.height = maxDim + 'px';
      previewBox.style.width = Math.max(16, Math.round(maxDim * ratio)) + 'px';
    }
  }

  if (textSpan) {
    textSpan.textContent = `${finalW} x ${finalH} mm`;
  }
}

function submitCustomPaperSize() {
  if (!reportDef) return;
  const w = parseFloat(document.getElementById('customPaperWidth')?.value);
  const h = parseFloat(document.getElementById('customPaperHeight')?.value);

  if (!w || w < 20 || w > 3000) {
    showToast('⚠️ कृपया वैध रुंदी (20 mm ते 3000 mm) प्रविष्ट करा.');
    document.getElementById('customPaperWidth')?.focus();
    return;
  }
  if (!h || h < 20 || h > 3000) {
    showToast('⚠️ कृपया वैध उंची (20 mm ते 3000 mm) प्रविष्ट करा.');
    document.getElementById('customPaperHeight')?.focus();
    return;
  }

  const isLandscape = document.getElementById('customOrientLandscape')?.checked;
  const finalOrient = isLandscape ? 'landscape' : 'portrait';

  const baseW = Math.min(w, h);
  const baseH = Math.max(w, h);

  reportDef.customWidthMm = baseW;
  reportDef.customHeightMm = baseH;
  reportDef.paperSize = 'Custom';
  reportDef.orientation = finalOrient;

  // Update PAPER_SIZES["Custom"]
  PAPER_SIZES["Custom"] = {
    widthMm: baseW,
    heightMm: baseH,
    label: `Custom (${baseW} x ${baseH} mm)`
  };

  updatePageDimensions();
  clampAllElementsToPage();
  renderCanvas();
  pushHistory();

  const selPaper = document.getElementById('selPaperSize');
  if (selPaper) selPaper.value = 'Custom';

  closeCustomPaperModal();
  showToast(`सानुकूल कागद लागू केला: ${reportDef.widthMm} x ${reportDef.heightMm} mm (${finalOrient})`);
}

// 3. BORDERS AND SHADING MODAL DIALOG SUBSYSTEM
let dialogActiveTab = 'pageBorder'; // 'borders' | 'pageBorder' | 'shading'
let dialogBorderState = {
  top: true,
  bottom: true,
  left: true,
  right: true
};
let dialogCurrentPreset = 'box';
let dialogCurrentStyle = 'solid';

function syncAllBorderMargins() {
  const topVal = document.getElementById('dialogBorderMarginTop')?.value || '5';
  const inpB = document.getElementById('dialogBorderMarginBottom');
  const inpL = document.getElementById('dialogBorderMarginLeft');
  const inpR = document.getElementById('dialogBorderMarginRight');
  if (inpB) inpB.value = topVal;
  if (inpL) inpL.value = topVal;
  if (inpR) inpR.value = topVal;
}

function openBordersShadingModal(tab = 'pageBorder') {
  dialogActiveTab = tab;
  switchDialogTab(tab);
  const modal = document.getElementById('bordersShadingModal');
  if (modal) modal.classList.add('show');

  // Populate existing page border values if available
  if (reportDef && reportDef.pageBorder) {
    const pb = reportDef.pageBorder;
    if (tab === 'pageBorder' || pb.inset) {
      dialogBorderState = {
        top: pb.top && pb.top !== 'none',
        bottom: pb.bottom && pb.bottom !== 'none',
        left: pb.left && pb.left !== 'none',
        right: pb.right && pb.right !== 'none',
      };
      const borderStr = [pb.top, pb.bottom, pb.left, pb.right].find(s => s && s !== 'none') || '';
      if (borderStr) {
        const parts = borderStr.trim().split(/\s+/);
        if (parts.length >= 3) {
          const w = parts[0];
          const s = parts[1];
          const c = parts.slice(2).join(' ');
          const widthSelect = document.getElementById('dialogBorderWidth');
          if (widthSelect && [...widthSelect.options].some(o => o.value === w)) {
            widthSelect.value = w;
          }
          if (s) {
            dialogCurrentStyle = s;
            updateStyleListSelection(s);
          }
          const colorInput = document.getElementById('dialogBorderColor');
          const colorSelect = document.getElementById('dialogColorSelect');
          if (colorInput && c) colorInput.value = c.startsWith('#') ? c : colorInput.value;
          if (colorSelect && c) colorSelect.value = c;
        }
      }
      const ins = pb.inset;
      const inpT = document.getElementById('dialogBorderMarginTop');
      const inpB = document.getElementById('dialogBorderMarginBottom');
      const inpL = document.getElementById('dialogBorderMarginLeft');
      const inpR = document.getElementById('dialogBorderMarginRight');
      if (inpT) inpT.value = (ins && ins.top !== undefined) ? ins.top : 5;
      if (inpB) inpB.value = (ins && ins.bottom !== undefined) ? ins.bottom : 5;
      if (inpL) inpL.value = (ins && ins.left !== undefined) ? ins.left : 5;
      if (inpR) inpR.value = (ins && ins.right !== undefined) ? ins.right : 5;
    }
  }

  updateDialogPreview();
  updateShadingPreview();
}

function closeBordersShadingModal() {
  const modal = document.getElementById('bordersShadingModal');
  if (modal) modal.classList.remove('show');
}

function handleModalOverlayClick(e) {
  if (e.target.id === 'bordersShadingModal') {
    closeBordersShadingModal();
  }
}

function switchDialogTab(tab) {
  dialogActiveTab = tab;
  const tabBorders = document.getElementById('tabDialogBorders');
  const tabPB = document.getElementById('tabDialogPageBorder');
  const tabShading = document.getElementById('tabDialogShading');

  const contentBorders = document.getElementById('dialogTabContentBorders');
  const contentShading = document.getElementById('dialogTabContentShading');
  const artGroup = document.getElementById('dialogArtGroup');
  const applyTo = document.getElementById('dialogApplyTo');

  if (tabBorders) tabBorders.classList.toggle('active', tab === 'borders');
  if (tabPB) tabPB.classList.toggle('active', tab === 'pageBorder');
  if (tabShading) tabShading.classList.toggle('active', tab === 'shading');

  if (tab === 'shading') {
    if (contentBorders) contentBorders.style.display = 'none';
    if (contentShading) contentShading.style.display = 'flex';
  } else {
    if (contentBorders) contentBorders.style.display = 'flex';
    if (contentShading) contentShading.style.display = 'none';

    if (tab === 'pageBorder') {
      if (artGroup) artGroup.style.display = 'block';
      if (applyTo) applyTo.value = 'page';
    } else {
      if (artGroup) artGroup.style.display = 'none';
      if (applyTo) applyTo.value = selectedElementIds.length > 0 ? 'selected' : 'section';
    }
  }
}

function setDialogBorderPreset(preset) {
  dialogCurrentPreset = preset;
  document.querySelectorAll('.cr-setting-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btnSetting${preset.charAt(0).toUpperCase() + preset.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  if (preset === 'none') {
    dialogBorderState = { top: false, bottom: false, left: false, right: false };
  } else if (preset === 'box') {
    dialogBorderState = { top: true, bottom: true, left: true, right: true };
  } else if (preset === 'shadow') {
    dialogBorderState = { top: true, bottom: true, left: true, right: true };
  } else if (preset === '3d') {
    dialogBorderState = { top: true, bottom: true, left: true, right: true };
    dialogCurrentStyle = 'groove';
    updateStyleListSelection('groove');
  } else if (preset === 'custom') {
    // Keeps current toggle state
  }

  updateDialogPreview();
}

function selectDialogStyle(style, el) {
  dialogCurrentStyle = style;
  updateStyleListSelection(style);
  updateDialogPreview();
}

function updateStyleListSelection(style) {
  document.querySelectorAll('#dialogStyleList .cr-style-opt').forEach(opt => {
    opt.classList.toggle('active', opt.getAttribute('data-style') === style);
  });
}

function toggleDialogEdge(edge) {
  if (edge === 'box') {
    // Clicking center preview toggles all on/off
    const allOn = dialogBorderState.top && dialogBorderState.bottom && dialogBorderState.left && dialogBorderState.right;
    dialogBorderState = { top: !allOn, bottom: !allOn, left: !allOn, right: !allOn };
  } else {
    dialogBorderState[edge] = !dialogBorderState[edge];
  }
  dialogCurrentPreset = 'custom';
  document.querySelectorAll('.cr-setting-btn').forEach(btn => btn.classList.remove('active'));
  const customBtn = document.getElementById('btnSettingCustom');
  if (customBtn) customBtn.classList.add('active');
  updateDialogPreview();
}

function updateDialogPreview() {
  const color = document.getElementById('dialogBorderColor').value || '#000000';
  const width = document.getElementById('dialogBorderWidth').value || '1pt';
  const box = document.getElementById('dialogPreviewBox');
  if (!box) return;

  const btnTop = document.getElementById('btnPreviewTop');
  const btnBottom = document.getElementById('btnPreviewBottom');
  const btnLeft = document.getElementById('btnPreviewLeft');
  const btnRight = document.getElementById('btnPreviewRight');

  if (btnTop) btnTop.classList.toggle('active', !!dialogBorderState.top);
  if (btnBottom) btnBottom.classList.toggle('active', !!dialogBorderState.bottom);
  if (btnLeft) btnLeft.classList.toggle('active', !!dialogBorderState.left);
  if (btnRight) btnRight.classList.toggle('active', !!dialogBorderState.right);

  const borderCss = `${width} ${dialogCurrentStyle} ${color}`;
  box.style.borderTop = dialogBorderState.top ? borderCss : '1px dashed #cbd5e1';
  box.style.borderBottom = dialogBorderState.bottom ? borderCss : '1px dashed #cbd5e1';
  box.style.borderLeft = dialogBorderState.left ? borderCss : '1px dashed #cbd5e1';
  box.style.borderRight = dialogBorderState.right ? borderCss : '1px dashed #cbd5e1';

  if (dialogCurrentPreset === 'shadow') {
    box.style.boxShadow = '3px 3px 0px rgba(0,0,0,0.35)';
  } else {
    box.style.boxShadow = 'none';
  }
}

function updateShadingPreview() {
  const fill = document.getElementById('dialogShadingFill').value || '#ffffff';
  const patternStyle = document.getElementById('dialogPatternStyle').value || 'clear';
  const patternColor = document.getElementById('dialogPatternColor').value || '#000000';
  const box = document.getElementById('dialogShadingPreviewBox');
  if (!box) return;

  box.style.backgroundColor = fill;
  if (patternStyle === 'diag-cross') {
    box.style.backgroundImage = `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} 2px, transparent 2px, transparent 6px)`;
  } else if (patternStyle === 'solid') {
    box.style.backgroundColor = patternColor;
    box.style.backgroundImage = 'none';
  } else if (patternStyle.endsWith('%')) {
    const pct = parseInt(patternStyle) / 100;
    box.style.backgroundColor = fill;
    box.style.backgroundImage = `radial-gradient(${patternColor} 1px, transparent 0)`;
    box.style.backgroundSize = '4px 4px';
    box.style.opacity = Math.max(0.3, pct * 2);
  } else {
    box.style.backgroundImage = 'none';
    box.style.opacity = '1';
  }
}

function applyDialogBorders() {
  if (!reportDef) return;

  if (dialogActiveTab === 'shading') {
    const fill = document.getElementById('dialogShadingFill').value || '#ffffff';
    const applyTo = document.getElementById('dialogShadingApplyTo').value;

    if (applyTo === 'page') {
      reportDef.pageColor = fill;
      renderCanvas();
      showToast(`Page shading applied: ${fill}`);
    } else if (applyTo === 'selected') {
      if (selectedElementIds.length === 0) {
        showToast('कृपया घटक निवडा (Select an element to shade)');
        return;
      }
      selectedElementIds.forEach(id => {
        const el = reportDef.elements.find(e => e.id === id);
        if (el) {
          if (!el.styles) el.styles = {};
          el.styles.backgroundColor = fill;
          renderElementOnCanvas(el);
        }
      });
      showToast(`Shading applied to ${selectedElementIds.length} element(s)`);
    } else if (applyTo === 'section') {
      const sec = reportDef.sections.find(s => s.id === activeSectionId);
      if (sec) {
        if (!sec.styles) sec.styles = {};
        sec.styles.backgroundColor = fill;
        const secDiv = document.getElementById(`sec_${sec.id}`);
        if (secDiv) secDiv.style.backgroundColor = fill;
        showToast(`Section ${sec.name} shaded`);
      }
    }
  } else {
    // Tab is 'borders' or 'pageBorder'
    const color = document.getElementById('dialogBorderColor').value || '#000000';
    const width = document.getElementById('dialogBorderWidth').value || '1pt';
    const borderCss = `${width} ${dialogCurrentStyle} ${color}`;
    const applyTo = document.getElementById('dialogApplyTo').value;

    if (applyTo === 'page' || dialogActiveTab === 'pageBorder') {
      const isNone = dialogCurrentPreset === 'none' || (!dialogBorderState.top && !dialogBorderState.bottom && !dialogBorderState.left && !dialogBorderState.right);
      if (isNone) {
        reportDef.pageBorder = null;
      } else {
        const topMargin = Math.max(0, parseFloat(document.getElementById('dialogBorderMarginTop')?.value) || 0);
        const bottomMargin = Math.max(0, parseFloat(document.getElementById('dialogBorderMarginBottom')?.value) || 0);
        const leftMargin = Math.max(0, parseFloat(document.getElementById('dialogBorderMarginLeft')?.value) || 0);
        const rightMargin = Math.max(0, parseFloat(document.getElementById('dialogBorderMarginRight')?.value) || 0);

        reportDef.pageBorder = {
          top: dialogBorderState.top ? borderCss : 'none',
          bottom: dialogBorderState.bottom ? borderCss : 'none',
          left: dialogBorderState.left ? borderCss : 'none',
          right: dialogBorderState.right ? borderCss : 'none',
          inset: {
            top: topMargin,
            bottom: bottomMargin,
            left: leftMargin,
            right: rightMargin
          },
          boxShadow: dialogCurrentPreset === 'shadow' ? '4px 4px 14px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.18)'
        };
      }
      renderCanvas();
      showToast('Page borders applied');
    } else if (applyTo === 'selected') {
      if (selectedElementIds.length === 0) {
        showToast('कृपया घटक निवडा (Select an element to apply borders)');
        return;
      }
      selectedElementIds.forEach(id => {
        const el = reportDef.elements.find(e => e.id === id);
        if (el) {
          if (!el.styles) el.styles = {};
          delete el.styles.border;
          el.styles.borderTop = dialogBorderState.top ? borderCss : 'none';
          el.styles.borderBottom = dialogBorderState.bottom ? borderCss : 'none';
          el.styles.borderLeft = dialogBorderState.left ? borderCss : 'none';
          el.styles.borderRight = dialogBorderState.right ? borderCss : 'none';
          if (dialogBorderState.top && dialogBorderState.bottom && dialogBorderState.left && dialogBorderState.right) {
            el.styles.border = borderCss;
          }
          renderElementOnCanvas(el);
        }
      });
      showToast(`Borders applied to ${selectedElementIds.length} element(s)`);
    } else if (applyTo === 'section') {
      const sec = reportDef.sections.find(s => s.id === activeSectionId);
      if (sec) {
        const secDiv = document.getElementById(`sec_${sec.id}`);
        if (secDiv) {
          secDiv.style.borderTop = dialogBorderState.top ? borderCss : 'none';
          secDiv.style.borderBottom = dialogBorderState.bottom ? borderCss : 'none';
          secDiv.style.borderLeft = dialogBorderState.left ? borderCss : 'none';
          secDiv.style.borderRight = dialogBorderState.right ? borderCss : 'none';
        }
        showToast(`Section ${sec.name} border updated`);
      }
    }
  }

  pushHistory();
  closeBordersShadingModal();
}
