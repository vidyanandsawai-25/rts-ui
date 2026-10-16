import * as XLSX from 'xlsx-js-style';
import { getUlbDataFromCookies } from '@/lib/utils/cookie';

function getDynamicUlbInfo(): { ulbName: string; ulbNameLocal: string } {
  try {
    const ulb = getUlbDataFromCookies();
    const ulbName = ulb.ulbName || 'MUNICIPAL CORPORATION';
    const ulbNameLocal = ulb.ulbNameLocal || ulbName;
    return { ulbName, ulbNameLocal };
  } catch {
    return { ulbName: 'MUNICIPAL CORPORATION', ulbNameLocal: 'महानगरपालिका' };
  }
}

export interface RtsReportColumn<T> {
  header: string;
  key: keyof T | string;
  width?: number; // Approximate width in characters
  align?: 'left' | 'center' | 'right';
  formatter?: (value: unknown, row: T, index: number) => string | number;
}

export interface RtsReportMetadata {
  title: string;
  subtitle?: string;
  department?: string;
  generatedAt?: string;
  generatedBy?: string;
  appliedFilters?: Record<string, string | number | boolean | null | undefined>;
  totalRecords?: number;
  totalAmount?: number;
}

export interface RtsReportConfig<T> {
  fileName: string;
  metadata: RtsReportMetadata;
  columns: RtsReportColumn<T>[];
  data: T[];
}

/**
 * Extracts raw cell value based on key or path
 */
function getCellValue<T>(row: T, key: keyof T | string): unknown {
  if (typeof key === 'string' && key.includes('.')) {
    const parts = key.split('.');
    let curr: unknown = row;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = (curr as Record<string, unknown>)[part];
      } else {
        return '';
      }
    }
    return curr ?? '';
  }
  return (row as Record<string, unknown>)[key as string] ?? '';
}

/**
 * Formats a cell value according to column rules
 */
function formatValue<T>(
  row: T,
  col: RtsReportColumn<T>,
  index: number
): string | number {
  if (col.formatter) {
    return col.formatter(getCellValue(row, col.key), row, index);
  }
  const val = getCellValue(row, col.key);
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.toLocaleDateString('en-IN');
  return String(val);
}

/**
 * Exports data to Excel (.xlsx) with corporate styling, metadata, and auto-sized columns
 */
export function exportRtsReportToExcel<T>(config: RtsReportConfig<T>): void {
  const { fileName, metadata, columns, data } = config;
  const rows: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  const totalCols = Math.max(columns.length, 6);

  // 1. Organization Header Row
  const { ulbName, ulbNameLocal } = getDynamicUlbInfo();
  const orgTitle = `${ulbName.toUpperCase()} — RIGHT TO PUBLIC SERVICES (RTS)`;
  rows.push([orgTitle]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  // 2. Report Title Row
  rows.push([metadata.title]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });

  // 3. Subtitle / Department Row (if any)
  if (metadata.subtitle || metadata.department) {
    const sub = [metadata.department, metadata.subtitle].filter(Boolean).join(' • ');
    rows.push([sub]);
    merges.push({ s: { r: rows.length - 1, c: 0 }, e: { r: rows.length - 1, c: totalCols - 1 } });
  }

  // 4. Meta Information (Generated date, by user, record count)
  const genDate = metadata.generatedAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const metaText = `Generated: ${genDate} | Records: ${data.length}${metadata.generatedBy ? ` | Officer: ${metadata.generatedBy}` : ''}`;
  rows.push([metaText]);
  merges.push({ s: { r: rows.length - 1, c: 0 }, e: { r: rows.length - 1, c: totalCols - 1 } });

  // 5. Active Filters Row (if any)
  if (metadata.appliedFilters) {
    const filterStrings = Object.entries(metadata.appliedFilters)
      .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'All')
      .map(([k, v]) => `${k}: ${v}`);

    if (filterStrings.length > 0) {
      rows.push([`Filters Applied: ${filterStrings.join(' | ')}`]);
      merges.push({ s: { r: rows.length - 1, c: 0 }, e: { r: rows.length - 1, c: totalCols - 1 } });
    }
  }

  // Empty Spacing Row
  rows.push([]);

  const headerRowIndex = rows.length;

  // 6. Column Headers
  rows.push(columns.map((c) => c.header));

  // 7. Data Rows
  let totalAmountSum = 0;
  let hasAmountColumn = false;

  data.forEach((item, index) => {
    const rowVals = columns.map((col) => {
      const val = formatValue(item, col, index);
      if (typeof val === 'number' && (col.header.toLowerCase().includes('amount') || col.header.toLowerCase().includes('fee'))) {
        hasAmountColumn = true;
        totalAmountSum += val;
      }
      return val;
    });
    rows.push(rowVals);
  });

  // 8. Totals Row (if amount column exists or total count requested)
  let totalsRowIndex = -1;
  if (hasAmountColumn || data.length > 0) {
    totalsRowIndex = rows.length;
    const totalsRow: unknown[] = columns.map((col, idx) => {
      if (idx === 0) return 'TOTAL SUMMARY';
      if (idx === 1) return `${data.length} Records`;
      if (col.header.toLowerCase().includes('amount') || col.header.toLowerCase().includes('fee')) {
        return metadata.totalAmount !== undefined ? metadata.totalAmount : totalAmountSum;
      }
      return '';
    });
    rows.push(totalsRow);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = merges;

  // Column Widths
  ws['!cols'] = columns.map((col) => ({
    wch: col.width || Math.max(col.header.length + 4, 15),
  }));

  // Style Header and Title Cells
  const thinBorder = {
    top: { style: 'thin', color: { rgb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
    left: { style: 'thin', color: { rgb: 'CBD5E1' } },
    right: { style: 'thin', color: { rgb: 'CBD5E1' } },
  };

  // Row 0: Org Header (Navy Blue)
  const cell0 = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (ws[cell0]) {
    ws[cell0].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' }, name: 'Segoe UI' },
      fill: { fgColor: { rgb: '173B73' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Row 1: Report Title (Accent Blue)
  const cell1 = XLSX.utils.encode_cell({ r: 1, c: 0 });
  if (ws[cell1]) {
    ws[cell1].s = {
      font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' }, name: 'Segoe UI' },
      fill: { fgColor: { rgb: '1E40AF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Meta rows styling
  for (let r = 2; r < headerRowIndex; r++) {
    const cAddress = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[cAddress]) {
      ws[cAddress].s = {
        font: { sz: 9, italic: true, color: { rgb: '334155' }, name: 'Segoe UI' },
        fill: { fgColor: { rgb: 'F1F5F9' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };
    }
  }

  // Table Column Headers (Dark Slate Navy)
  columns.forEach((_, cIdx) => {
    const address = XLSX.utils.encode_cell({ r: headerRowIndex, c: cIdx });
    if (ws[address]) {
      ws[address].s = {
        font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' }, name: 'Segoe UI' },
        fill: { fgColor: { rgb: '0F172A' } },
        alignment: { horizontal: columns[cIdx].align || 'center', vertical: 'center', wrapText: true },
        border: thinBorder,
      };
    }
  });

  // Data rows styling
  for (let r = headerRowIndex + 1; r < (totalsRowIndex !== -1 ? totalsRowIndex : rows.length); r++) {
    const isEven = (r - headerRowIndex) % 2 === 0;
    columns.forEach((col, cIdx) => {
      const address = XLSX.utils.encode_cell({ r, c: cIdx });
      if (ws[address]) {
        ws[address].s = {
          font: { sz: 9, color: { rgb: '0F172A' }, name: 'Segoe UI' },
          fill: { fgColor: { rgb: isEven ? 'F8FAFC' : 'FFFFFF' } },
          alignment: { horizontal: col.align || 'left', vertical: 'center' },
          border: thinBorder,
        };
      }
    });
  }

  // Totals Row Styling
  if (totalsRowIndex !== -1) {
    columns.forEach((col, cIdx) => {
      const address = XLSX.utils.encode_cell({ r: totalsRowIndex, c: cIdx });
      if (ws[address]) {
        ws[address].s = {
          font: { bold: true, sz: 10, color: { rgb: '0F172A' }, name: 'Segoe UI' },
          fill: { fgColor: { rgb: 'E2E8F0' } },
          alignment: { horizontal: col.align || 'left', vertical: 'center' },
          border: thinBorder,
        };
      }
    });
  }

  // Create workbook and write
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RTS_Report');
  XLSX.writeFile(wb, `${fileName.replace(/\.xlsx$/i, '')}.xlsx`);
}

/**
 * Exports data to CSV (.csv) with UTF-8 BOM for full Unicode/Devanagari compatibility
 */
export function exportRtsReportToCsv<T>(config: RtsReportConfig<T>): void {
  const { fileName, metadata, columns, data } = config;

  const lines: string[] = [];

  // Metadata comments / header
  const { ulbName, ulbNameLocal } = getDynamicUlbInfo();
  lines.push(`"${ulbName.toUpperCase()} — RIGHT TO PUBLIC SERVICES (RTS)"`);
  lines.push(`"${metadata.title.replace(/"/g, '""')}"`);
  if (metadata.subtitle || metadata.department) {
    lines.push(`"${[metadata.department, metadata.subtitle].filter(Boolean).join(' - ').replace(/"/g, '""')}"`);
  }
  lines.push(`"Generated: ${metadata.generatedAt || new Date().toLocaleString('en-IN')}"`);

  if (metadata.appliedFilters) {
    const filterStrings = Object.entries(metadata.appliedFilters)
      .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'All')
      .map(([k, v]) => `${k}: ${v}`);
    if (filterStrings.length > 0) {
      lines.push(`"Filters: ${filterStrings.join(' | ').replace(/"/g, '""')}"`);
    }
  }

  lines.push(''); // Blank line

  // Column Headers
  const headerLine = columns
    .map((col) => `"${col.header.replace(/"/g, '""')}"`)
    .join(',');
  lines.push(headerLine);

  // Data Rows
  data.forEach((item, index) => {
    const rowLine = columns
      .map((col) => {
        const val = formatValue(item, col, index);
        const strVal = String(val ?? '').replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
    lines.push(rowLine);
  });

  // Add UTF-8 Byte Order Mark (\uFEFF) so Excel parses Marathi and Hindi characters properly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName.replace(/\.csv$/i, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print-ready formatted corporate PDF report window and triggers printing/saving as PDF
 */
export function exportRtsReportToPdf<T>(config: RtsReportConfig<T>): void {
  const { metadata, columns, data } = config;

  const genDate = metadata.generatedAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const filterBadges = metadata.appliedFilters
    ? Object.entries(metadata.appliedFilters)
        .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'All')
        .map(([k, v]) => `<span class="badge"><strong>${k}:</strong> ${v}</span>`)
        .join(' ')
    : '';

  let totalAmountSum = 0;
  let hasAmount = false;

  const tableHeaderHtml = columns
    .map((c) => `<th style="text-align: ${c.align || 'left'};">${c.header}</th>`)
    .join('');

  const tableRowsHtml = data
    .map((row, idx) => {
      const isEven = idx % 2 === 0;
      const cells = columns
        .map((col) => {
          const val = formatValue(row, col, idx);
          if (typeof val === 'number' && (col.header.toLowerCase().includes('amount') || col.header.toLowerCase().includes('fee'))) {
            hasAmount = true;
            totalAmountSum += val;
          }

          // Special status pill rendering
          let formattedCell = String(val ?? '');
          const lower = formattedCell.toLowerCase();
          if (col.header.toLowerCase().includes('status')) {
            if (lower === 'approved' || lower === 'cleared' || lower === 'success') {
              formattedCell = `<span class="status-pill status-approved">${formattedCell}</span>`;
            } else if (lower === 'pending') {
              formattedCell = `<span class="status-pill status-pending">${formattedCell}</span>`;
            } else if (lower === 'rejected' || lower === 'bounced' || lower === 'cancelled') {
              formattedCell = `<span class="status-pill status-rejected">${formattedCell}</span>`;
            } else if (lower === 'reverted') {
              formattedCell = `<span class="status-pill status-reverted">${formattedCell}</span>`;
            }
          }

          return `<td style="text-align: ${col.align || 'left'};">${formattedCell}</td>`;
        })
        .join('');
      return `<tr class="${isEven ? 'even-row' : 'odd-row'}">${cells}</tr>`;
    })
    .join('');

  const totalsRowHtml = (hasAmount || data.length > 0)
    ? `<tr class="total-row">
        <td>TOTAL</td>
        <td>${data.length} Records</td>
        ${columns.slice(2).map((c) => {
          if (c.header.toLowerCase().includes('amount') || c.header.toLowerCase().includes('fee')) {
            const amt = metadata.totalAmount !== undefined ? metadata.totalAmount : totalAmountSum;
            return `<td style="text-align: ${c.align || 'right'}; font-weight: bold;">₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
          }
          return '<td></td>';
        }).join('')}
       </tr>`
    : '';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and print the PDF report.');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${metadata.title} - ${ulbName}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 16px;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #173b73;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .corp-title {
      font-size: 18px;
      font-weight: 800;
      color: #173b73;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .corp-sub {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }
    .report-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 6px;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 14px;
      font-size: 11px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
    }
    .badge {
      display: inline-block;
      background: #e2e8f0;
      color: #1e293b;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10px;
      margin-right: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 16px;
    }
    th {
      background-color: #173b73;
      color: #ffffff;
      font-weight: 700;
      padding: 7px 8px;
      border: 1px solid #0f2b54;
      font-size: 10px;
      text-transform: uppercase;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
    }
    .even-row {
      background-color: #f8fafc;
    }
    .odd-row {
      background-color: #ffffff;
    }
    .total-row {
      background-color: #e2e8f0;
      font-weight: bold;
    }
    .status-pill {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 700;
      text-align: center;
    }
    .status-approved { background-color: #dcfce7; color: #15803d; }
    .status-pending { background-color: #fef3c7; color: #b45309; }
    .status-rejected { background-color: #fee2e2; color: #b91c1c; }
    .status-reverted { background-color: #f3e8ff; color: #7e22ce; }
    .footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      font-size: 9px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 12px; display: flex; gap: 8px;">
    <button onclick="window.print()" style="background: #173b73; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
    <button onclick="window.close()" style="background: #e2e8f0; color: #334155; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
      Close
    </button>
  </div>

  <div class="header-banner">
    <div>
      <div class="corp-title">${ulbName}</div>
      <div class="corp-sub">${ulbNameLocal} • Right to Public Services Act 2015 (RTS)</div>
      <div class="report-title">${metadata.title}</div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #475569;">
      <div><strong>Total Records:</strong> ${data.length}</div>
      <div><strong>Date:</strong> ${genDate}</div>
    </div>
  </div>

  ${filterBadges ? `<div class="meta-box"><div><strong>Applied Filters:</strong> ${filterBadges}</div></div>` : ''}

  <table>
    <thead>
      <tr>${tableHeaderHtml}</tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
      ${totalsRowHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>Generated by: ${metadata.generatedBy || 'RTS Portal Officer'} | Official RTS System Report</div>
    <div>Confidential • ${ulbName} © ${new Date().getFullYear()}</div>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
