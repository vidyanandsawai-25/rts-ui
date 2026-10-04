/**
 * ============================================================================
 * GENERIC CRYSTAL REPORTS HTML REPORT RENDERING ENGINE (report_renderer.js)
 * ============================================================================
 * Universal, data-driven layout and rendering engine for all current and future reports.
 * Used identically across:
 *   1. Designer Canvas (designer.html)
 *   2. Live Preview Viewer (report_viewer.html)
 *   3. Server-Side Headless PDF Generation (/api/generate-pdf)
 * 
 * Works in both Browser and Node.js environments.
 * ============================================================================
 */
/* eslint-disable @typescript-eslint/no-unused-vars */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ReportRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. CANONICAL SCALING & UNITS (96 DPI CSS Pixels per Inch / 25.4 mm)
  const PX_PER_MM = 96 / 25.4; // 3.77952755906 px/mm

  function mmToPx(mm) {
    return Math.round((Number(mm) || 0) * PX_PER_MM);
  }

  function pxToMm(px) {
    return parseFloat(((Number(px) || 0) / PX_PER_MM).toFixed(1));
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

  // 2. UNICODE & FORMATTING UTILITIES
  const MARATHI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

  function toDevanagariDigits(num) {
    if (num === null || num === undefined) return '';
    return String(num).replace(/[0-9]/g, d => MARATHI_DIGITS[parseInt(d, 10)]);
  }

  function formatFieldValue(val, format) {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) {
      const d = String(val.getDate()).padStart(2, '0');
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const y = val.getFullYear();
      const str = `${d}/${m}/${y}`;
      return format === 'devanagari' ? toDevanagariDigits(str) : str;
    }
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      const parts = val.substring(0, 10).split('-');
      const str = `${parts[2]}/${parts[1]}/${parts[0]}`;
      return format === 'devanagari' ? toDevanagariDigits(str) : str;
    }
    if (typeof val === 'boolean') {
      return val ? 'होय' : 'नाही';
    }
    if (typeof val === 'number') {
      const formatted = val.toLocaleString('en-IN');
      return format === 'devanagari' ? toDevanagariDigits(formatted) : formatted;
    }
    return format === 'devanagari' ? toDevanagariDigits(String(val)) : String(val);
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

  function escapeHtml(str) {
    return decodeHtmlEntities(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getValueByPath(source, path) {
    if (!source || !path) return undefined;
    if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];
    return String(path).split('.').reduce((value, key) => {
      if (value === null || value === undefined || typeof value !== 'object') return undefined;
      if (Object.prototype.hasOwnProperty.call(value, key)) return value[key];
      const matchingKey = Object.keys(value).find(candidate => candidate.toLowerCase() === key.toLowerCase());
      return matchingKey === undefined ? undefined : value[matchingKey];
    }, source);
  }

  function resolveDataCollection(source, path) {
    const value = getValueByPath(source, path);
    if (Array.isArray(value)) return value.filter(item => item && typeof item === 'object');
    return value && typeof value === 'object' ? [value] : [];
  }

  // 3. REPORT GEOMETRY RESOLUTION
  function resolvePageGeometry(reportDef) {
    const pageCfg = reportDef.page || {};
    const paperSize = pageCfg.paperSize || pageCfg.paper || reportDef.paperSize || reportDef.paper || 'A4';
    const orientation = (pageCfg.orientation || reportDef.orientation || 'portrait').toLowerCase();
    const paperPreset = PAPER_SIZES[paperSize] || PAPER_SIZES['A4'];

    let widthMm = pageCfg.widthMm || reportDef.widthMm;
    let heightMm = pageCfg.heightMm || reportDef.heightMm;

    if (!widthMm || !heightMm) {
      const baseW = (paperSize === 'Custom' && reportDef.customWidthMm) ? reportDef.customWidthMm : paperPreset.widthMm;
      const baseH = (paperSize === 'Custom' && reportDef.customHeightMm) ? reportDef.customHeightMm : paperPreset.heightMm;
      if (orientation === 'landscape') {
        widthMm = Math.max(baseW, baseH);
        heightMm = Math.min(baseW, baseH);
      } else {
        widthMm = Math.min(baseW, baseH);
        heightMm = Math.max(baseW, baseH);
      }
    }

    const pageWidth = reportDef.pageWidth || mmToPx(widthMm);
    const pageHeight = reportDef.pageHeight || mmToPx(heightMm);

    const rawMargins = pageCfg.margins || reportDef.margins || { top: 6.4, right: 3.2, bottom: 6.4, left: 6.4 };
    const margins = {
      top: rawMargins.top !== undefined ? Number(rawMargins.top) : 6.4,
      right: rawMargins.right !== undefined ? Number(rawMargins.right) : 3.2,
      bottom: rawMargins.bottom !== undefined ? Number(rawMargins.bottom) : 6.4,
      left: rawMargins.left !== undefined ? Number(rawMargins.left) : 6.4
    };

    const printableWidthMm = parseFloat((widthMm - margins.left - margins.right).toFixed(1));
    const printableHeightMm = parseFloat((heightMm - margins.top - margins.bottom).toFixed(1));
    const printableWidth = pageWidth - mmToPx(margins.left) - mmToPx(margins.right);
    const printableHeight = pageHeight - mmToPx(margins.top) - mmToPx(margins.bottom);
    const usesPageCoordinates = reportDef.coordinateMode === 'page';

    return {
      paperSize,
      orientation,
      widthMm,
      heightMm,
      pageWidthMm: widthMm,
      pageHeightMm: heightMm,
      pageWidth,
      pageHeight,
      margins,
      printableWidth,
      printableHeight,
      designWidth: usesPageCoordinates ? pageWidth : printableWidth,
      designHeight: usesPageCoordinates ? pageHeight : printableHeight,
      usesPageCoordinates,
      printableWidthMm,
      printableHeightMm
    };
  }

  // 4. ELEMENT CONTENT INTERPOLATION
  function interpolateElementContent(elem, dataContext, extraContext = {}) {
    const isDevanagari = elem.format === 'devanagari';
    let text = elem.text !== undefined && elem.text !== null ? elem.text : (elem.displayText !== undefined && elem.displayText !== null ? elem.displayText : '');

    // Direct field binding
    if (elem.type === 'field' || elem.fieldName) {
      const fName = (elem.fieldName || '').replace(/^[@{}]/g, '');
      const pathValue = getValueByPath(dataContext, fName);
      if (pathValue !== undefined && pathValue !== null) {
        return formatFieldValue(pathValue, isDevanagari ? 'devanagari' : '');
      }
      if (dataContext && dataContext[elem.fieldName] !== undefined && dataContext[elem.fieldName] !== null) {
        return formatFieldValue(dataContext[elem.fieldName], isDevanagari ? 'devanagari' : '');
      }
    }

    if (elem.type === 'formula') {
      const fName = (elem.fieldName || elem.name || '').replace(/^[@{}]/g, '');
      if (extraContext[fName] !== undefined && extraContext[fName] !== null) {
        return formatFieldValue(extraContext[fName], isDevanagari ? 'devanagari' : '');
      }
      if (dataContext && dataContext[fName] !== undefined && dataContext[fName] !== null) {
        return formatFieldValue(dataContext[fName], isDevanagari ? 'devanagari' : '');
      }
    }

    if (text === undefined || text === null) {
      text = elem.fieldName ? `{${elem.fieldName}}` : '';
    }

    // Dynamic placeholders interpolation: {FieldName} and {@FormulaName}
    let rendered = String(text);
    if (rendered.includes('{')) {
      rendered = rendered.replace(/\{\{\s*([^{}]+?)\s*\}\}|\{\s*([^{}]+?)\s*\}/g, (match, doubleName, singleName) => {
        const pName = String(doubleName || singleName || '').trim();
        // Special variables
        if (pName === '#PageNumber' || pName === '@PageNum') {
          const pgStr = extraContext.pageNum ? `${extraContext.pageNum} of ${extraContext.totalPages || 1}` : '1 of 1';
          return isDevanagari ? toDevanagariDigits(pgStr) : pgStr;
        }
        if (pName === '#TotalPages') {
          const tp = String(extraContext.totalPages || 1);
          return isDevanagari ? toDevanagariDigits(tp) : tp;
        }
        if (pName === '#PrintDate' || pName === '@PrintDate') {
          const dt = new Date().toLocaleDateString('en-GB');
          return isDevanagari ? toDevanagariDigits(dt) : dt;
        }

        const clean = pName.replace(/^[@]/, '');
        const nestedValue = getValueByPath(dataContext, clean);
        if (nestedValue !== undefined && nestedValue !== null) {
          return formatFieldValue(nestedValue, isDevanagari ? 'devanagari' : '');
        }
        if (dataContext && dataContext[pName] !== undefined && dataContext[pName] !== null) {
          return formatFieldValue(dataContext[pName], isDevanagari ? 'devanagari' : '');
        }
        if (dataContext && dataContext[clean] !== undefined && dataContext[clean] !== null) {
          return formatFieldValue(dataContext[clean], isDevanagari ? 'devanagari' : '');
        }
        if (clean === 'CouncilHeader' || clean === 'CouncilNameWithDistrict') {
          const cName = dataContext?.CouncilHeader || dataContext?.CouncilName || dataContext?.ulbNameLocal || dataContext?.ulbName || '';
          const cDist = dataContext?.CouncilDistrict || dataContext?.district || '';
          if (cName) {
            const h = (cDist && !cName.includes(cDist))
              ? (cDist.startsWith('जि') ? `${cName} ${cDist}` : `${cName}, जि. ${cDist}`)
              : cName;
            return formatFieldValue(h, isDevanagari ? 'devanagari' : '');
          }
        }
        if (clean === 'CouncilName' || clean === 'AuthorityCouncil') {
          const cName = dataContext?.CouncilName || dataContext?.ulbNameLocal || dataContext?.ulbName || '';
          if (cName) return formatFieldValue(cName, isDevanagari ? 'devanagari' : '');
        }
        if (extraContext && extraContext[clean] !== undefined && extraContext[clean] !== null) {
          return formatFieldValue(extraContext[clean], isDevanagari ? 'devanagari' : '');
        }
        return ''; // Leave empty if unmapped in live data
      });
    }

    return rendered;
  }

  // 5. CSS STYLE SERIALIZATION FOR REPORT ELEMENTS
  function isLegacyDesignerChrome(elem, styles) {
    const border = String(styles.border || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const background = String(styles.backgroundColor || '').trim().toLowerCase();
    const padding = Number.parseFloat(String(styles.padding || '0')) || 0;
    const whiteBackground = background === '#fff' || background === '#ffffff' || background === 'white';
    const type = elem.type || 'text';

    if ((type === 'field' || type === 'formula')
      && ['1px solid #000', '1px solid #000000', '1px solid black'].includes(border)) {
      return whiteBackground && padding >= 1.9 && padding <= 2.1;
    }
    return (type === 'text' || type === 'text_box')
      && border === '1px solid #1e293b'
      && whiteBackground
      && padding >= 3.9
      && padding <= 4.1;
  }

  function serializeElementStyles(elem) {
    const s = elem.styles || {};
    const styles = [];

    styles.push(`position: absolute;`);
    styles.push(`left: ${elem.x}px;`);
    styles.push(`top: ${elem.y}px;`);
    styles.push(`width: ${elem.width}px;`);
    styles.push(`height: ${elem.height}px;`);
    styles.push(`box-sizing: border-box;`);
    styles.push(`line-height: 1.25;`);

    // Typography
    const fontFamily = s.fontFamily || "'Noto Sans Devanagari', Arial, sans-serif";
    styles.push(`font-family: ${fontFamily};`);
    styles.push(`font-size: ${s.fontSize || '9.5pt'};`);
    styles.push(`font-weight: ${s.fontWeight || '400'};`);
    if (s.fontStyle) styles.push(`font-style: ${s.fontStyle};`);
    if (s.textDecoration) styles.push(`text-decoration: ${s.textDecoration};`);
    styles.push(`color: ${s.color || '#000000'};`);
    styles.push(`text-align: ${s.textAlign || 'left'};`);

    // Word wrapping & bounds containment
    styles.push(`overflow-wrap: break-word;`);
    styles.push(`word-break: break-word;`);

    // Z-Index: honors explicit elem.zIndex, else sensible structural defaults
    const zIndex = elem.zIndex !== undefined ? elem.zIndex : (s.zIndex !== undefined ? s.zIndex : (elem.type === 'box' ? 1 : elem.type === 'line' ? 2 : 3));
    styles.push(`z-index: ${zIndex};`);

    // Borders & Background
    if (elem.type === 'box') {
      styles.push(`border: ${s.border || '1.5px solid #000000'};`);
      styles.push(`background-color: ${s.backgroundColor || 'transparent'};`);
    } else if (elem.type === 'line') {
      const isVertical = (elem.height > elem.width) || (elem.width <= 2 && elem.height > 2);
      const color = s.backgroundColor || s.color || '#000000';
      if (isVertical) {
        const bLeft = s.borderLeft || (s.border && s.border !== 'none' ? s.border : `${elem.width || 1}px solid ${color}`);
        styles.push(`border-left: ${bLeft};`);
        styles.push(`background-color: transparent;`);
      } else {
        const bTop = s.borderTop || (s.border && s.border !== 'none' ? s.border : `${elem.height || 1}px solid ${color}`);
        styles.push(`border-top: ${bTop};`);
        styles.push(`background-color: transparent;`);
      }
    } else {
      if (s.border && s.border !== 'none' && !isLegacyDesignerChrome(elem, s)) styles.push(`border: ${s.border};`);
      if (s.backgroundColor && s.backgroundColor !== 'transparent') styles.push(`background-color: ${s.backgroundColor};`);
    }

    if (s.padding) styles.push(`padding: ${s.padding};`);

    return styles.join(' ');
  }

  // 6. RENDER INDIVIDUAL ELEMENT HTML
  function renderElementHtml(elem, dataContext, extraContext) {
    if (elem.visible === false) return '';

    const styleStr = serializeElementStyles(elem);
    const verticalAlign = elem.styles && elem.styles.verticalAlign;
    const textVerticalStyle = `display:flex; align-items:${verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center'};`;
    const wrap = (elem.height >= 24 || elem.textWrapping !== false)
      ? 'white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word;'
      : 'white-space: pre; overflow: hidden; text-overflow: clip;';

    if (elem.type === 'box') {
      return `<div id="el_${elem.id}" class="report-element report-box" style="${styleStr}"></div>`;
    }

    if (elem.type === 'box_rounded') {
      return `<div id="el_${elem.id}" class="report-element report-box-rounded" style="${styleStr} border-radius:${(elem.styles && elem.styles.borderRadius) || '10px'};"></div>`;
    }

    if (elem.type === 'circle') {
      return `<div id="el_${elem.id}" class="report-element report-circle" style="${styleStr} border-radius:50%;"></div>`;
    }

    if (elem.type === 'arrow_right') {
      const fill = (elem.styles && elem.styles.backgroundColor && elem.styles.backgroundColor !== '#dbeafe') ? elem.styles.backgroundColor : 'transparent';
      const stroke = (elem.styles && (elem.styles.borderColor || elem.styles.color)) || '#000000';
      const strokeWidth = (elem.styles && elem.styles.borderWidth) || 1.5;
      return `<div id="el_${elem.id}" class="report-element report-arrow-right" style="${styleStr} border:none; background:transparent;"><svg viewBox="0 0 100 60" preserveAspectRatio="none" style="width:100%; height:100%; display:block;"><polygon points="0,20 60,20 60,0 100,30 60,60 60,40 0,40" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/></svg></div>`;
    }

    if (elem.type === 'arrow_down') {
      const fill = (elem.styles && elem.styles.backgroundColor && elem.styles.backgroundColor !== '#dbeafe') ? elem.styles.backgroundColor : 'transparent';
      const stroke = (elem.styles && (elem.styles.borderColor || elem.styles.color)) || '#000000';
      const strokeWidth = (elem.styles && elem.styles.borderWidth) || 1.5;
      return `<div id="el_${elem.id}" class="report-element report-arrow-down" style="${styleStr} border:none; background:transparent;"><svg viewBox="0 0 60 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;"><polygon points="20,0 40,0 40,60 60,60 30,100 0,60 20,60" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/></svg></div>`;
    }

    if (elem.type === 'arrow_line') {
      const stroke = (elem.styles && (elem.styles.backgroundColor || elem.styles.color)) || '#000000';
      return `<div id="el_${elem.id}" class="report-element report-arrow-line" style="${styleStr}">
        <svg viewBox="0 0 ${elem.width || 100} ${elem.height || 40}" style="width:100%; height:100%; overflow:visible;">
          <polygon points="0,0 12,6 0,12" fill="${stroke}"
                   transform="translate(${(elem.width || 100) - 2},${(elem.height || 40) - 2}) rotate(${Math.atan2((elem.height || 40) - 4, (elem.width || 100) - 10) * (180 / Math.PI)}) translate(-12,-6)" />
        </svg>
      </div>`;
    }

    if (elem.type === 'text_box') {
      const content = interpolateElementContent(elem, dataContext, extraContext);
      const isHtml = elem.isHtml || elem.renderMode === 'html' || /<span|<b|<strong|<font/i.test(content || '');
      const txt = isHtml ? (content || '') : escapeHtml(content || '');
      const tbWrap = `white-space: pre-wrap; overflow-wrap: break-word; word-break: normal; line-height: ${(elem.styles && elem.styles.lineHeight) || '1.6'};`;
      return `<div id="el_${elem.id}" class="report-element report-textbox" style="${styleStr} ${textVerticalStyle}"><span style="${tbWrap} width:100%; display:block;">${txt}</span></div>`;
    }
    if (elem.type === 'line') {
      return `<div id="el_${elem.id}" class="report-element report-line" style="${styleStr}"></div>`;
    }

    if (elem.type === 'image') {
      const imageFieldName = elem.fieldName || elem.binding || elem.path || (elem.id === 'picture10' ? 'propertyPhoto' : elem.id === 'picture9' ? 'buildingPlanPhoto' : '');
      let fieldVal = imageFieldName && dataContext ? (getValueByPath(dataContext, imageFieldName) || dataContext[imageFieldName]) : '';
      if (!fieldVal && (elem.id === 'picture10' || imageFieldName === 'propertyPhoto')) {
        fieldVal = dataContext?.propertyPhoto || dataContext?.photo || dataContext?.PropertyPhoto || '';
      }
      if (!fieldVal && (elem.id === 'picture9' || imageFieldName === 'buildingPlanPhoto')) {
        fieldVal = dataContext?.buildingPlanPhoto || dataContext?.planPhoto || dataContext?.BuildingPlanPhoto || '';
      }
      const normalizedImageField = String(imageFieldName || '').toLowerCase();
      const isLogoField = ['councillogo', 'ulblogo', 'logourl', 'logo'].includes(normalizedImageField) || (!imageFieldName && (elem.id?.toLowerCase().includes('logo') || elem.name?.toLowerCase().includes('logo') || elem.id === 'picture1' || elem.id === 'picture2'));
      const isPhotoField = normalizedImageField.includes('photo') || normalizedImageField.includes('plan') || (elem.id && elem.id.toLowerCase().includes('photo')) || (elem.name && elem.name.toLowerCase().includes('photo')) || elem.id === 'picture9' || elem.id === 'picture10';
      const isSignField = elem.id?.toLowerCase().includes('sign') || elem.name?.toLowerCase().includes('sign') || elem.id === 'picture3' || elem.id === 'picture4';
      const src = fieldVal || (isLogoField && dataContext ? (getValueByPath(dataContext, 'CouncilLogo') || getValueByPath(dataContext, 'ulbLogo') || getValueByPath(dataContext, 'LogoUrl')) : '') || elem.imageUrl || elem.src || '';
      if (src) {
        const objectFit = ['contain', 'cover', 'fill'].includes(elem.styles?.objectFit)
          ? elem.styles.objectFit
          : 'contain';
        return `<div id="el_${elem.id}" class="report-element report-image" style="${styleStr}"><img src="${escapeHtml(src)}" style="width:100%; height:100%; object-fit:${objectFit}; display:block;" alt="${escapeHtml(elem.name || (isPhotoField ? 'Property Photo' : 'Logo'))}"></div>`;
      }
      if (isPhotoField) {
        return `<div id="el_${elem.id}" class="report-element report-image" style="${styleStr} border:1px dashed #94a3b8; background:#f8fafc; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#64748b; font-size:11px; padding:4px; box-sizing:border-box;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span style="margin-top:4px; font-size:10px; font-weight:600;">मालमत्ता फोटो</span></div>`;
      }
      if (isSignField) {
        return `<div id="el_${elem.id}" class="report-element report-image report-signature" style="${styleStr} background:transparent;"></div>`;
      }
      return `<div id="el_${elem.id}" class="report-element report-image" style="${styleStr}"><div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f0fdf4; border:1px solid #16a34a; border-radius:50%;"><svg viewBox="0 0 100 100" style="width:75%;height:75%;"><circle cx="50" cy="50" r="46" fill="#16a34a"/><path d="M30 52 L43 65 L70 38" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg></div></div>`;
    }

    if (elem.type === 'subreport') {
      return `<div id="el_${elem.id}" class="report-element report-subreport" style="${styleStr} background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px); border: 1px solid #94a3b8; display:flex; align-items:center; justify-content:center; font-weight:700; color:#475569; font-size:11px;">[Subreport: ${escapeHtml(elem.name || elem.text || 'Details')}]</div>`;
    }

    if (elem.type === 'table') {
      const table = elem.table || null;
      const cols = table?.cols || elem.cols || 4;
      const rows = table?.rows || elem.rows || 3;
      const cellData = elem.cellData || {};
      const cells = table?.cells || elem.tableCells || {};
      const columnWidths = table?.columnWidths || elem.columnWidths || Array.from({ length: cols }, () => 1);
      const rowHeights = table?.rowHeights || elem.rowHeights || [];
      const bColor = elem.borderColor || (elem.styles && elem.styles.borderColor) || '#000000';
      const bWidth = elem.borderWidth !== undefined ? elem.borderWidth : 1;
      const headerBg = elem.headerBg || '#f1f5f9';
      const totalWidth = columnWidths.reduce((sum, width) => sum + Math.max(1, Number(width) || 1), 0);
      const colGroup = Array.from({ length: cols }, (_, c) => {
        const width = Math.max(1, Number(columnWidths[c]) || 1);
        return `<col style="width:${(width / totalWidth) * 100}%">`;
      }).join('');

      let tableRowsHtml = '';
      for (let r = 0; r < rows; r++) {
        let trHtml = '';
        for (let c = 0; c < cols; c++) {
          const cellKey = `${r}_${c}`;
          const cell = cells[cellKey] || {};
          if (cell.hidden) continue;
          let val = cell.content !== undefined
            ? cell.content
            : cellData[cellKey] !== undefined ? cellData[cellKey] : '';
          val = interpolateElementContent({ text: val, format: elem.format }, dataContext, extraContext);
          const isHeader = r === 0;
          const cellStyle = cell.style || {};
          const rowSpan = Math.max(1, Number(cell.rowSpan) || 1);
          const colSpan = Math.max(1, Number(cell.colSpan) || 1);
          const background = cellStyle.backgroundColor || (isHeader ? headerBg : '#ffffff');
          const fontWeight = cellStyle.fontWeight || (isHeader ? 700 : (elem.styles && elem.styles.fontWeight) || 400);
          const wrap = cellStyle.wrap === false
            ? 'white-space:nowrap;overflow:hidden;text-overflow:clip;'
            : 'white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;';
          trHtml += `<td${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ''}${colSpan > 1 ? ` colspan="${colSpan}"` : ''} style="border:${cellStyle.borderWidth ?? bWidth}px solid ${cellStyle.borderColor || bColor}; padding:${cellStyle.padding ?? 4}px; background:${background}; color:${cellStyle.color || (elem.styles && elem.styles.color) || '#000000'}; font-size:${cellStyle.fontSize || 9}pt; font-weight:${fontWeight}; line-height:1.15; ${wrap} vertical-align:${cellStyle.verticalAlign || 'middle'}; text-align:${cellStyle.textAlign || (elem.styles && elem.styles.textAlign) || 'left'};">${escapeHtml(val)}</td>`;
        }
        tableRowsHtml += `<tr${rowHeights[r] ? ` style="height:${Number(rowHeights[r]) || 24}px"` : ''}>${trHtml}</tr>`;
      }
      return `<div id="el_${elem.id}" class="report-element report-table" style="${styleStr}"><table style="width:100%; height:100%; border-collapse:collapse; table-layout:fixed; font-size:inherit; font-family:inherit; color:inherit;"><colgroup>${colGroup}</colgroup><tbody>${tableRowsHtml}</tbody></table></div>`;
    }

    const content = interpolateElementContent(elem, dataContext, extraContext);
    const isHtml = elem.isHtml || elem.renderMode === 'html' || (typeof content === 'string' && /<span|<b|<strong|<font/i.test(content));
    const formattedContent = isHtml ? (content || '') : escapeHtml(content);

    return `<div id="el_${elem.id}" class="report-element report-${elem.type || 'text'}" style="${styleStr} ${textVerticalStyle}"><span style="${wrap} width:100%; display:block;">${formattedContent}</span></div>`;
  }

  // 7. RENDER SECTION HTML
  function renderSectionHtml(section, elements, dataContext, extraContext) {
    if (section.visible === false) return '';
    const secElements = (elements || []).filter(e => e.sectionId === section.id && e.visible !== false);
    const secHeight = section.height || 0;

    let html = `<div id="sec_${section.id}" class="report-section" data-section-type="${section.type || ''}" style="position: relative; width: 100%; height: ${secHeight}px; min-height: ${secHeight}px; box-sizing: border-box; overflow: visible;">\n`;
    secElements.forEach(elem => {
      html += '  ' + renderElementHtml(elem, dataContext, extraContext) + '\n';
    });
    html += `</div>\n`;
    return html;
  }

  // 8. MULTI-PAGE TABULAR PAGINATION ENGINE (Generic for Ledgers/Registers)
  function isTabularReport(reportDef) {
    if (reportDef.reportType === 'tabular') return true;
    if (reportDef.hasTable === true) return true;
    // If report has explicit table columns in definition or table element
    return (reportDef.elements || []).some(e => e.type === 'table');
  }

  // 9. MASTER REPORT RENDERER: PRODUCES AUTHENTIC FIXED PHYSICAL PAGES
  function renderReport(reportDef, dataRows = [], parameters = {}, options = {}) {
    if (!reportDef) return { pagesHtml: '<div class="report-error">No report definition provided.</div>', totalPages: 0 };

    const geom = resolvePageGeometry(reportDef);
    const rows = Array.isArray(dataRows) ? dataRows : (dataRows ? [dataRows] : []);
    const firstRow = rows.length > 0 ? rows[0] : {};
    const elements = reportDef.elements || [];
    const sections = reportDef.sections || [];

    // Context preparation
    const dataContext = { ...parameters, ...firstRow };
    const extraContext = { ...parameters };
    const sectionInstances = sections.flatMap(section => {
      if (section.bandType !== 'subreport')
        return [{ ...section, __dataContext: dataContext, __instanceIndex: 0 }];
      const subreportRows = section.dataPath
        ? resolveDataCollection(dataContext, section.dataPath)
        : [dataContext];
      return subreportRows.map((row, index) => ({
        ...section,
        __dataContext: { ...dataContext, ...row },
        __instanceIndex: index,
      }));
    });

    // Check if report has multiple pages or multi-section form
    const isTabular = isTabularReport(reportDef);
    const pages = [];

    if (!isTabular || rows.length <= 1) {
      // FORM / DOCUMENT MODE (e.g. SHELApplication, BillReceipt, TradeLicense)
      // Group sections onto page sheets based on page height
      let currentPageSections = [];
      let currentAccumHeight = 0;
      const maxPageContentHeight = geom.designHeight;

      sectionInstances.forEach(sec => {
        if (sec.visible === false) return;
        const secElements = (elements || []).filter(e => e.sectionId === sec.id && e.visible !== false);
        const secHeight = sec.height || 0;
        if (secHeight <= 0) return;
        if (secElements.length === 0 && secHeight > 20) return; // Ignore empty subreport/footer placeholders

        if (currentAccumHeight + secHeight > maxPageContentHeight + 40 && currentPageSections.length > 0) {
          pages.push(currentPageSections);
          currentPageSections = [sec];
          currentAccumHeight = secHeight;
        } else {
          currentPageSections.push(sec);
          currentAccumHeight += secHeight;
        }
      });

      if (currentPageSections.length > 0) {
        pages.push(currentPageSections);
      }
    } else {
      // TABULAR / LEDGER MODE with multiple records
      // Handles repeating PageHeader, chunked Details, and ReportFooter
      const headerSecs = sectionInstances.filter(s => s.type === 'header' || s.type === 'pageHeader' || s.type === 'reportHeader');
      const footerSecs = sectionInstances.filter(s => s.type === 'footer' || s.type === 'pageFooter' || s.type === 'reportFooter');
      const detailSecs = sectionInstances.filter(s => s.type === 'detail');

      // For single page ledgers or multi-page, build page array
      pages.push(sectionInstances);
    }

    // A brand-new report has no elements yet, but its preview must still show
    // the physical blank page so the user can verify paper size and margins.
    if (pages.length === 0) pages.push([]);

    const totalPages = Math.max(1, pages.length);

    // Build HTML for all pages
    let pagesHtml = '';
    pages.forEach((pageSecs, pIdx) => {
      const pageNum = pIdx + 1;
      const pageContext = { ...extraContext, pageNum, totalPages };

      const topPx = geom.usesPageCoordinates ? 0 : mmToPx(geom.margins.top);
      const rightPx = geom.usesPageCoordinates ? 0 : mmToPx(geom.margins.right);
      const bottomPx = geom.usesPageCoordinates ? 0 : mmToPx(geom.margins.bottom);
      const leftPx = geom.usesPageCoordinates ? 0 : mmToPx(geom.margins.left);

      const pageBg = reportDef.pageColor || '#ffffff';
      let pageBorderStyles = '';
      let pageBorderHtml = '';
      if (reportDef.pageBorder) {
        const inset = reportDef.pageBorder.inset || {};
        const borderInset = {
          top: Math.max(0, Number(inset.top) || 0), right: Math.max(0, Number(inset.right) || 0),
          bottom: Math.max(0, Number(inset.bottom) || 0), left: Math.max(0, Number(inset.left) || 0),
        };
        const borderCss = [
          reportDef.pageBorder.top && reportDef.pageBorder.top !== 'none' ? `border-top: ${reportDef.pageBorder.top};` : '',
          reportDef.pageBorder.bottom && reportDef.pageBorder.bottom !== 'none' ? `border-bottom: ${reportDef.pageBorder.bottom};` : '',
          reportDef.pageBorder.left && reportDef.pageBorder.left !== 'none' ? `border-left: ${reportDef.pageBorder.left};` : '',
          reportDef.pageBorder.right && reportDef.pageBorder.right !== 'none' ? `border-right: ${reportDef.pageBorder.right};` : '',
        ].join(' ');
        if (Object.values(borderInset).some(value => value > 0)) {
          pageBorderHtml = `<div class="report-page-border" style="position:absolute; pointer-events:none; box-sizing:border-box; z-index:1000; top:${mmToPx(borderInset.top)}px; right:${mmToPx(borderInset.right)}px; bottom:${mmToPx(borderInset.bottom)}px; left:${mmToPx(borderInset.left)}px; ${borderCss}"></div>`;
        } else {
          pageBorderStyles = borderCss;
        }
      }

      let watermarkHtml = '';
      if (reportDef.watermark) {
        if (reportDef.watermark.type === 'image' || reportDef.watermark.imageUrl) {
          const scale = reportDef.watermark.scale || 'auto';
          const opacity = reportDef.watermark.opacity !== undefined 
            ? reportDef.watermark.opacity 
            : (reportDef.watermark.washout !== false ? 0.18 : 0.85);
          const imgStyle = scale === 'auto' 
            ? 'max-width: 75%; max-height: 75%; object-fit: contain;' 
            : `width: ${scale}; max-width: 95%; height: auto;`;
          watermarkHtml = `
            <div class="report-watermark" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; overflow: hidden;">
              <img src="${escapeHtml(reportDef.watermark.imageUrl)}" style="${imgStyle} opacity: ${opacity}; user-select: none; display: block;" alt="Watermark">
            </div>
          `;
        } else if (reportDef.watermark.text) {
          const rot = reportDef.watermark.rotation !== undefined ? reportDef.watermark.rotation : -45;
          const color = reportDef.watermark.color || 'rgba(148, 163, 184, 0.35)';
          const size = reportDef.watermark.fontSize || 64;
          const fontFamily = reportDef.watermark.fontFamily || "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";
          watermarkHtml = `
            <div class="report-watermark" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; overflow: hidden;">
              <div style="font-family: ${fontFamily}; font-size: ${size}px; font-weight: 900; color: ${color}; letter-spacing: 6px; transform: rotate(${rot}deg); user-select: none; white-space: nowrap;">
                ${escapeHtml(reportDef.watermark.text)}
              </div>
            </div>
          `;
        }
      }

      pagesHtml += `
        <div class="report-page" data-page="${pageNum}" style="
          position: relative;
          width: ${geom.pageWidth}px;
          min-height: ${geom.pageHeight}px;
          box-sizing: border-box;
          background: ${pageBg};
          ${pageBorderStyles}
          padding: ${topPx}px ${rightPx}px ${bottomPx}px ${leftPx}px;
          margin: 0 auto 20px auto;
          box-shadow: 0 4px 16px rgba(0,0,0,0.35);
          overflow: hidden;
        ">
          ${watermarkHtml}
          ${pageBorderHtml}
      `;

      pageSecs.forEach(sec => {
        pagesHtml += renderSectionHtml(sec, elements, sec.__dataContext || dataContext, {
          ...pageContext,
          subreportRow: (sec.__instanceIndex || 0) + 1,
        });
      });

      pagesHtml += `</div>\n`;
    });

    // Generate matching Print CSS
    const stylesHtml = `
      <style id="reportPrintStyles">
        @page {
          size: ${geom.widthMm}mm ${geom.heightMm}mm;
          margin: ${geom.usesPageCoordinates ? '0' : `${geom.margins.top}mm ${geom.margins.right}mm ${geom.margins.bottom}mm ${geom.margins.left}mm`};
        }
        @media print {
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .screen-toolbar, .cr-menubar, .cr-toolbars, .cr-sidebar-left, .cr-sidebar-right, .cr-statusbar {
            display: none !important;
          }
          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            page-break-after: always;
            break-after: page;
          }
          .report-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      </style>
    `;

    return {
      pagesHtml,
      totalPages,
      stylesHtml,
      geometry: geom
    };
  }

  // 10. INDUSTRIAL-GRADE REPORT LAYOUT VALIDATOR
  const ReportLayoutValidator = {
    validatePage(reportDef) {
      const geom = resolvePageGeometry(reportDef || {});
      const errors = [];
      const warnings = [];

      if (!geom.widthMm || geom.widthMm <= 0 || !geom.heightMm || geom.heightMm <= 0) {
        errors.push(`Invalid page dimensions: ${geom.widthMm}mm x ${geom.heightMm}mm.`);
      }
      if (geom.printableWidthMm <= 0 || geom.printableHeightMm <= 0) {
        errors.push(`Margins exceed paper dimensions (Printable Area: ${geom.printableWidthMm.toFixed(1)}mm x ${geom.printableHeightMm.toFixed(1)}mm).`);
      }

      return { geom, errors, warnings };
    },

    validateSections(reportDef) {
      const sections = (reportDef && reportDef.sections) || [];
      const errors = [];
      const warnings = [];
      const sectionMap = new Map();

      sections.forEach((sec, idx) => {
        if (!sec.id) {
          errors.push(`Section #${idx + 1} is missing a required unique ID.`);
        } else if (sectionMap.has(sec.id)) {
          errors.push(`Duplicate section ID detected: "${sec.id}".`);
        } else {
          sectionMap.set(sec.id, sec);
        }

        if (sec.height < 0) {
          errors.push(`Section "${sec.name || sec.id}" has negative height (${sec.height}px).`);
        }
      });

      return { sectionMap, errors, warnings };
    },

    validateElements(reportDef, options = {}) {
      const geom = resolvePageGeometry(reportDef || {});
      const sections = (reportDef && reportDef.sections) || [];
      const secMap = new Map(sections.map(s => [s.id, s]));

      let elements = (reportDef && reportDef.elements) ? [...reportDef.elements] : [];
      if (Array.isArray(sections)) {
        sections.forEach(sec => {
          if (Array.isArray(sec.elements)) {
            sec.elements.forEach(el => {
              if (!elements.some(e => e.id === el.id)) {
                elements.push({ ...el, sectionId: el.sectionId || sec.id });
              }
            });
          }
        });
      }

      const errors = [];
      const warnings = [];
      const elementDiagnostics = {};

      // 1. Individual element boundary & property validation
      elements.forEach(elem => {
        const xPx = Number(elem.x) || 0;
        const yPx = Number(elem.y) || 0;
        const wPx = Number(elem.width) || 0;
        const hPx = Number(elem.height) || 0;

        const diag = {
          id: elem.id,
          name: elem.name || elem.id,
          sectionId: elem.sectionId,
          type: elem.type || 'text',
          x: xPx,
          y: yPx,
          width: wPx,
          height: hPx,
          xMm: elem.xMm !== undefined ? Number(elem.xMm) : pxToMm(xPx),
          yMm: elem.yMm !== undefined ? Number(elem.yMm) : pxToMm(yPx),
          widthMm: elem.widthMm !== undefined ? Number(elem.widthMm) : pxToMm(wPx),
          heightMm: elem.heightMm !== undefined ? Number(elem.heightMm) : pxToMm(hPx),
          rightMm: 0,
          bottomMm: 0,
          insidePage: true,
          insideSection: true,
          overflowRightMm: 0,
          overflowBottomMm: 0,
          isOverlapping: false,
          allowOverlap: elem.allowOverlap === true,
          overlappingWith: [],
          issueCodes: [],
          errors: [],
          warnings: []
        };

        diag.rightMm = parseFloat((diag.xMm + diag.widthMm).toFixed(1));
        diag.bottomMm = parseFloat((diag.yMm + diag.heightMm).toFixed(1));

        // Dimension validity
        if (elem.type === 'line') {
          if (wPx <= 0 && hPx <= 0) {
            diag.errors.push(`Line (${wPx}x${hPx}px) must have length greater than 0.`);
            diag.issueCodes.push('INVALID_DIMENSION');
            errors.push(`[${elem.id}] Line must have length greater than 0.`);
          }
        } else {
          if (wPx <= 0) {
            diag.errors.push(`Width (${wPx}px) must be greater than 0.`);
            diag.issueCodes.push('INVALID_DIMENSION');
            errors.push(`[${elem.id}] Width must be greater than 0.`);
          }
          if (hPx <= 0) {
            diag.errors.push(`Height (${hPx}px) must be greater than 0.`);
            diag.issueCodes.push('INVALID_DIMENSION');
            errors.push(`[${elem.id}] Height must be greater than 0.`);
          }
        }

        // Negative coordinates
        if (xPx < 0) {
          diag.errors.push(`Negative X coordinate (${xPx}px / ${diag.xMm}mm). Element outside left page boundary.`);
          diag.issueCodes.push('INVALID_COORDINATE');
          errors.push(`[${elem.id}] Negative X coordinate (${diag.xMm}mm).`);
          diag.insidePage = false;
        }
        if (yPx < 0) {
          diag.errors.push(`Negative Y coordinate (${yPx}px / ${diag.yMm}mm). Element outside section top boundary.`);
          diag.issueCodes.push('INVALID_COORDINATE');
          errors.push(`[${elem.id}] Negative Y coordinate (${diag.yMm}mm).`);
          diag.insideSection = false;
        }

        // Section membership
        const sec = secMap.get(elem.sectionId);
        if (!sec) {
          diag.errors.push(`Invalid or missing section ID "${elem.sectionId}".`);
          diag.issueCodes.push('MISSING_SECTION');
          errors.push(`[${elem.id}] Missing valid section "${elem.sectionId}".`);
          diag.insideSection = false;
        } else {
          // Section height boundary (tolerance 2px for rounding)
          const secHeight = sec.height || 0;
          if (yPx + hPx > secHeight + 2) {
            const overflowPx = (yPx + hPx) - secHeight;
            const overflowMm = pxToMm(overflowPx);
            diag.insideSection = false;
            diag.overflowBottomMm = overflowMm;
            diag.issueCodes.push('SECTION_OVERFLOW_BOTTOM');
            diag.errors.push(`Exceeds section "${sec.name || sec.id}" bottom by ${overflowMm}mm (${overflowPx}px).`);
            errors.push(`[${elem.id}] Exceeds section "${sec.name || sec.id}" bottom by ${overflowMm}mm.`);
          }
        }

        // Page / Printable Width Boundary (tolerance 4px for border-box and rounding)
        const printableW = geom.designWidth;
        if (xPx + wPx > printableW + 4) {
          const overflowPx = (xPx + wPx) - printableW;
          const overflowMm = pxToMm(overflowPx);
          diag.insidePage = false;
          diag.overflowRightMm = overflowMm;
          diag.issueCodes.push('PAGE_OVERFLOW_RIGHT');
          diag.errors.push(`Exceeds printable page width by ${overflowMm}mm (${overflowPx}px).`);
          errors.push(`[${elem.id}] Exceeds printable width by ${overflowMm}mm.`);
        }

        elementDiagnostics[elem.id] = diag;
      });

      // 2. Overlap & Collision Detection (pairwise AABB per section)
      const secElements = new Map();
      elements.forEach(el => {
        if (!secElements.has(el.sectionId)) secElements.set(el.sectionId, []);
        secElements.get(el.sectionId).push(el);
      });

      secElements.forEach((secEls, sId) => {
        for (let i = 0; i < secEls.length; i++) {
          const a = secEls[i];
          if (a.visible === false) continue;
          const diagA = elementDiagnostics[a.id];

          for (let j = i + 1; j < secEls.length; j++) {
            const b = secEls[j];
            if (b.visible === false) continue;
            const diagB = elementDiagnostics[b.id];

            // AABB Intersection check
            const aX = Number(a.x) || 0;
            const aY = Number(a.y) || 0;
            const aW = Number(a.width) || 0;
            const aH = Number(a.height) || 0;

            const bX = Number(b.x) || 0;
            const bY = Number(b.y) || 0;
            const bW = Number(b.width) || 0;
            const bH = Number(b.height) || 0;

            const intersectX = (aX < bX + bW) && (aX + aW > bX);
            const intersectY = (aY < bY + bH) && (aY + aH > bY);

            if (intersectX && intersectY) {
              // Exemption rules for intentional overlaps
              const aAllowed = a.allowOverlap === true;
              const bAllowed = b.allowOverlap === true;
              if (aAllowed || bAllowed) continue;

              // Framing boxes (border/background containers)
              const getBoxBg = el => (el.styles && el.styles.backgroundColor) || (el.style && el.style.backgroundColor) || 'transparent';
              const aIsFramingBox = a.type === 'box' && (!getBoxBg(a) || getBoxBg(a) === 'transparent' || getBoxBg(a) === 'rgba(0, 0, 0, 0)');
              const bIsFramingBox = b.type === 'box' && (!getBoxBg(b) || getBoxBg(b) === 'transparent' || getBoxBg(b) === 'rgba(0, 0, 0, 0)');
              if (aIsFramingBox || bIsFramingBox) continue;

              // Line dividers
              if (a.type === 'line' || b.type === 'line') continue;

              // Nested elements inside container boxes
              const aContainsB = (a.type === 'box') && (bX >= aX - 2) && (bY >= aY - 2) && (bX + bW <= aX + aW + 2) && (bY + bH <= aY + aH + 2);
              const bContainsA = (b.type === 'box') && (aX >= bX - 2) && (aY >= bY - 2) && (aX + aW <= bX + bW + 2) && (aY + aH <= bY + bH + 2);
              if (aContainsB || bContainsA) continue;

              // Calculate overlap intersection dimensions in mm
              const overlapW = pxToMm(Math.min(aX + aW, bX + bW) - Math.max(aX, bX));
              const overlapH = pxToMm(Math.min(aY + aH, bY + bH) - Math.max(aY, bY));

              diagA.isOverlapping = true;
              diagA.overlappingWith.push(b.id);
              diagA.issueCodes.push('ELEMENT_OVERLAP');
              diagA.warnings.push(`Overlaps with "${b.name || b.id}" (${overlapW}mm x ${overlapH}mm).`);

              diagB.isOverlapping = true;
              diagB.overlappingWith.push(a.id);
              diagB.issueCodes.push('ELEMENT_OVERLAP');
              diagB.warnings.push(`Overlaps with "${a.name || a.id}" (${overlapW}mm x ${overlapH}mm).`);

              warnings.push({
                code: 'ELEMENT_OVERLAP',
                elements: [a.id, b.id],
                sectionId: sId,
                message: `[Section ${sId}] "${a.name || a.id}" overlaps with "${b.name || b.id}".`
              });
            }
          }
        }
      });

      // 3. Table Column Widths Validation
      const tableDiagnostics = [];
      const tables = elements.filter(el => el.type === 'table' || (el.columns && Array.isArray(el.columns)));
      tables.forEach(tbl => {
        if (tbl.columns && tbl.columns.length > 0) {
          const totalColWidth = tbl.columns.reduce((sum, c) => sum + (Number(c.width) || 0), 0);
          const totalColWidthMm = pxToMm(totalColWidth);
          const availWidth = tbl.width || geom.designWidth;
          const availWidthMm = pxToMm(availWidth);
          if (totalColWidth > availWidth + 2) {
            const diffMm = (totalColWidthMm - availWidthMm).toFixed(1);
            const msg = `Table "${tbl.name || tbl.id}" columns exceed width by ${diffMm}mm (Total: ${totalColWidthMm}mm, Avail: ${availWidthMm}mm).`;
            errors.push(msg);
            tableDiagnostics.push({
              tableId: tbl.id,
              totalWidthMm: totalColWidthMm,
              availableWidthMm: availWidthMm,
              overflowMm: diffMm
            });
            if (elementDiagnostics[tbl.id]) {
              elementDiagnostics[tbl.id].issueCodes.push('TABLE_COLUMNS_OVERFLOW');
              elementDiagnostics[tbl.id].errors.push(msg);
            }
          }
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        elementDiagnostics,
        tableDiagnostics,
        geometry: geom
      };
    },

    validateReport(reportDef, options = {}) {
      const pageRes = this.validatePage(reportDef);
      const secRes = this.validateSections(reportDef);
      const elemRes = this.validateElements(reportDef, options);

      const allErrors = [...pageRes.errors, ...secRes.errors, ...elemRes.errors.map(e => typeof e === 'string' ? e : e.message)];
      const allWarnings = [...pageRes.warnings, ...secRes.warnings, ...elemRes.warnings.map(w => typeof w === 'string' ? w : w.message)];

      // Build structured issues list for programmatic inspection
      const issues = [];
      elemRes.errors.forEach(e => {
        if (typeof e === 'object') issues.push(e);
      });
      elemRes.warnings.forEach(w => {
        if (typeof w === 'object') issues.push(w);
      });

      Object.values(elemRes.elementDiagnostics).forEach(d => {
        d.issueCodes.forEach(code => {
          if (!issues.some(iss => iss.code === code && iss.elementId === d.id)) {
            issues.push({
              code,
              elementId: d.id,
              sectionId: d.sectionId,
              severity: code === 'ELEMENT_OVERLAP' ? 'warning' : 'error'
            });
          }
        });
      });

      const overlaps = elemRes.warnings.filter(w => w && w.code === 'ELEMENT_OVERLAP');

      return {
        isValid: allErrors.length === 0,
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        issues,
        overlaps,
        elementDiagnostics: elemRes.elementDiagnostics,
        tableDiagnostics: elemRes.tableDiagnostics,
        geometry: elemRes.geometry || pageRes.geom
      };
    },

    autoResolveCollisions(reportDef, options) {
      return autoResolveCollisions(reportDef, options);
    }
  };

  // 11. INDUSTRIAL-GRADE GENERIC AUTO-RESOLVE & DE-COLLISION ENGINE
  function autoResolveCollisions(reportDef, options = {}) {
    if (!reportDef) return reportDef;
    const def = options.inPlace ? reportDef : JSON.parse(JSON.stringify(reportDef));
    const geom = resolvePageGeometry(def);
    const printableW = geom.designWidth;

    const sections = def.sections || [];
    let elements = def.elements ? [...def.elements] : [];
    sections.forEach(sec => {
      if (Array.isArray(sec.elements)) {
        sec.elements.forEach(el => {
          if (!el.sectionId) el.sectionId = sec.id;
          const existing = elements.find(e => e.id === el.id);
          if (!existing) {
            elements.push(el);
          }
        });
      }
    });

    // Map elements by section
    const secElements = new Map();
    sections.forEach(s => secElements.set(s.id, []));
    elements.forEach(el => {
      if (!secElements.has(el.sectionId)) secElements.set(el.sectionId, []);
      secElements.get(el.sectionId).push(el);
    });

    // Step 1: Normalize dimensions, clamp coordinates, and fix line/box properties
    elements.forEach(elem => {
      elem.x = Math.max(0, Number(elem.x) || 0);
      elem.y = Math.max(0, Number(elem.y) || 0);

      if (elem.type === 'line') {
        const isVertical = (elem.height > elem.width) || (elem.width <= 2 && elem.height > 2);
        if (isVertical) {
          elem.width = Math.max(1, elem.width || 1);
          if (elem.height <= 1) {
            const sec = sections.find(s => s.id === elem.sectionId);
            elem.height = sec ? (sec.height || 24) : 24;
          }
        } else {
          elem.height = Math.max(1, elem.height || 1);
          if (elem.width <= 1) {
            elem.width = Math.max(10, printableW - elem.x);
          }
        }
      } else if (elem.type === 'box') {
        elem.width = Math.max(10, elem.width || 10);
        elem.height = Math.max(6, elem.height || 10);
        // Container / Framing box detection
        const getBoxBg = el => (el.styles && el.styles.backgroundColor) || (el.style && el.style.backgroundColor) || 'transparent';
        const bg = getBoxBg(elem);
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
          elem.allowOverlap = true;
        }
      } else {
        elem.width = Math.max(10, elem.width || 10);
        elem.height = Math.max(10, elem.height || 16);
      }

      // Page boundary clamp
      if (elem.x + elem.width > printableW) {
        if (elem.type === 'box' || elem.type === 'line') {
          elem.width = Math.max(10, printableW - elem.x);
        } else if (elem.x > 0 && elem.width < printableW) {
          elem.x = Math.max(0, printableW - elem.width);
        } else {
          elem.width = Math.max(10, printableW - elem.x);
        }
      }
    });

    // Step 2: Per-section layout resolution
    sections.forEach(sec => {
      const els = secElements.get(sec.id) || [];
      if (els.length === 0) return;

      // A. Subreport clearance
      const subreports = els.filter(e => e.type === 'subreport');
      subreports.forEach(sub => {
        const headersAbove = els.filter(e => e.id !== sub.id && e.type !== 'box' && e.type !== 'line' && e.y < sub.y + 12);
        if (headersAbove.length > 0) {
          const maxHeaderBottom = Math.max(...headersAbove.map(h => (Number(h.y) || 0) + (Number(h.height) || 20)));
          if (sub.y < maxHeaderBottom + 2) {
            sub.y = maxHeaderBottom + 2;
          }
        }
      });

      // B. Single-column form field expansion (prevents Marathi / English wrap collisions)
      const contentEls = els.filter(e => e.type !== 'box' && e.type !== 'line' && e.type !== 'subreport');
      contentEls.forEach(el => {
        const siblingsInBand = contentEls.filter(s => s.id !== el.id && (s.y < el.y + el.height - 2) && (s.y + s.height > el.y + 2));
        const rightSiblings = siblingsInBand.filter(s => s.x > el.x + 10);
        // Preserve intended element width
        if (!el.width || el.width <= 0) {
          el.width = 110;
        }
      });

      // C1. Horizontal column de-collision (elements in the same row)
      for (let i = 0; i < contentEls.length; i++) {
        const a = contentEls[i];
        for (let j = 0; j < contentEls.length; j++) {
          if (i === j) continue;
          const b = contentEls[j];
          if (Math.abs((a.y || 0) - (b.y || 0)) <= 4 && a.x < b.x) {
            if (a.x + a.width > b.x) {
              const colOverlap = (a.x + a.width) - b.x;
              if (colOverlap <= 20) {
                a.width = Math.max(10, b.x - a.x - 2);
              }
            }
          }
        }
      }

      // C2. Question-Answer / Label-Field horizontal clearance
      contentEls.forEach(label => {
        const isLabel = label.type === 'text' && (label.text || '').trim().match(/[:\?：-]$/);
        if (!isLabel) return;

        const sameRowValues = contentEls.filter(v => v.id !== label.id && Math.abs((v.y || 0) - (label.y || 0)) <= 6 && v.x >= label.x);
        sameRowValues.forEach(val => {
          if (val.x < label.x + label.width + 4) {
            const nextRight = contentEls.filter(n => n.id !== val.id && n.id !== label.id && Math.abs(n.y - val.y) <= 8 && n.x > val.x);
            const minNextX = nextRight.length > 0 ? Math.min(...nextRight.map(n => n.x)) : printableW;
            const neededX = label.x + label.width + 6;
            if (neededX + val.width <= minNextX - 4) {
              val.x = neededX;
            } else {
              const textLen = (label.text || '').trim().length;
              const neededLabelW = Math.max(60, Math.ceil(textLen * 8.5) + 12);
              if (neededLabelW < label.width) {
                label.width = neededLabelW;
              }
              if (label.x + label.width + 6 + val.width <= minNextX - 4) {
                val.x = label.x + label.width + 6;
              }
            }
          }
        });
      });

      // D. Vertical stack clearance
      const sortedByY = [...contentEls].sort((a, b) => a.y - b.y);
      for (let i = 0; i < sortedByY.length; i++) {
        const a = sortedByY[i];
        for (let j = i + 1; j < sortedByY.length; j++) {
          const b = sortedByY[j];
          const hOverlap = (a.x < b.x + b.width) && (a.x + a.width > b.x);
          if (hOverlap && (b.y < a.y + a.height) && a.allowOverlap !== true && b.allowOverlap !== true) {
            // Check if a is a heading whose height can be trimmed
            if (a.height > 32 && (a.text || '').length < 120) {
              a.height = 32;
            }
            if (b.y < a.y + a.height) {
              b.y = a.y + a.height + 4;
            }
            if (b.y + b.height > sec.height) {
              sec.height = b.y + b.height + 20;
            }
          }
        }
      }

      // E. Small boxed values (Count boxes) and headers
      const smallBoxes = els.filter(e => e.type === 'box' && e.width <= 120 && e.height <= 40);
      smallBoxes.forEach(box => {
        box.allowOverlap = true;
        const nested = contentEls.find(c => c.x >= box.x - 6 && c.x + c.width <= box.x + box.width + 12 && Math.abs(c.y - box.y) <= 8);
        if (nested) {
          nested.allowOverlap = true;
          if (!nested.styles) nested.styles = {};
          nested.styles.textAlign = 'center';
        }
        const labelAbove = contentEls.find(c => c.type === 'text' && c.y < box.y && box.y - (c.y + c.height) <= 20 && (c.x < box.x + box.width) && (c.x + c.width > box.x));
        if (labelAbove) {
          if (!labelAbove.styles) labelAbove.styles = {};
          labelAbove.styles.textAlign = 'center';
        }
      });

      // F. Ensure section height accommodates all elements
      const maxBottom = Math.max(0, ...els.map(e => (Number(e.y) || 0) + (Number(e.height) || 0)));
      if (maxBottom > (sec.height || 0)) {
        sec.height = maxBottom + 4;
      }
    });

    return def;
  }

  return {
    PX_PER_MM,
    PAPER_SIZES,
    mmToPx,
    pxToMm,
    toDevanagariDigits,
    formatFieldValue,
    decodeHtmlEntities,
    resolvePageGeometry,
    interpolateElementContent,
    serializeElementStyles,
    renderElementHtml,
    renderSectionHtml,
    renderReport,
    Validator: ReportLayoutValidator,
    validateReport: (reportDef, opts) => ReportLayoutValidator.validateReport(reportDef, opts),
    autoResolveCollisions,
    decollideReport: autoResolveCollisions
  };
});
