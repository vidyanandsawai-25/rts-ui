'use client';

export function PageSetupToolbar() {
  return (
    <div className="cr-toolbar-row flex items-center justify-between relative px-2 py-1 bg-white border-b border-slate-200 gap-2">
      {/* Left Controls: Fluid & Responsive */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none pr-1.5">
        <button
          type="button"
          className="cr-btn primary flex items-center gap-1 shrink-0 px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          id="btnCreateNewReport"
          onClick={() => (window as unknown as { createNewReport?: () => void }).createNewReport?.()}
          title="Create a blank report"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Report</span>
        </button>

        <button
          type="button"
          className="cr-btn flex items-center gap-1 shrink-0 px-2.5 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          id="btnImportReportSource"
          onClick={() => (window as unknown as { openReportImporter?: () => void }).openReportImporter?.()}
          title="Import a Crystal RPT or PDF"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          <span>Import Report</span>
        </button>

        <span className="cr-toolbar-label text-xs font-semibold text-slate-500 pl-1">Report:</span>
        <select
          className="cr-select text-xs font-semibold border border-slate-300 rounded px-2 py-1 bg-white text-slate-800 shrink-0 min-w-[240px] max-w-[380px]"
          id="selReportId"
          onChange={(e) => {
            const w = window as unknown as { updateDeleteReportButton?: () => void; switchReport?: (id: string) => void };
            w.updateDeleteReportButton?.();
            w.switchReport?.(e.target.value);
          }}
          title="Open a saved report"
        >
          <option value="">-- Loading Reports... --</option>
        </select>

        <button
          type="button"
          className="cr-btn danger flex items-center gap-1 shrink-0 px-2 py-1 text-xs font-medium rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          id="btnDeleteReport"
          onClick={() => (window as unknown as { deleteSelectedReport?: () => void }).deleteSelectedReport?.()}
          title="Select a custom report to delete"
          disabled
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
          <span>Delete</span>
        </button>

        <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

        {/* Paper Size Selector */}
        <span className="cr-toolbar-label text-xs font-semibold text-slate-500">Paper:</span>
        <select
          className="cr-select text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-800 shrink-0 w-[84px]"
          id="selPaperSize"
          onChange={(e) => (window as unknown as { changePaperSize?: (val: string) => void }).changePaperSize?.(e.target.value)}
          title="Select Standard Paper Size"
          defaultValue="A4"
        >
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="A3 Extra">A3 Extra</option>
          <option value="A3 Plus">A3 Plus</option>
          <option value="A3 Rotated">A3 Rotated</option>
          <option value="A3 Transverse">A3 Transverse</option>
          <option value="A4 Extra">A4 Extra</option>
          <option value="A4 Plus">A4 Plus</option>
          <option value="A4 Rotated">A4 Rotated</option>
          <option value="A4 Small">A4 Small</option>
          <option value="A4 Transverse">A4 Transverse</option>
          <option value="A5">A5</option>
          <option value="A5 Extra">A5 Extra</option>
          <option value="A5 Rotated">A5 Rotated</option>
          <option value="A5 Transverse">A5 Transverse</option>
          <option value="A6">A6</option>
          <option value="Letter">Letter</option>
          <option value="Letter Extra">Letter Extra</option>
          <option value="Letter Plus">Letter Plus</option>
          <option value="Letter Rotated">Letter Rotated</option>
          <option value="Legal">Legal</option>
          <option value="Tabloid">Tabloid</option>
          <option value="Custom" className="font-bold text-blue-600">Custom...</option>
        </select>

        <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

        {/* Zoom Controls */}
        <span className="cr-toolbar-label text-xs font-semibold text-slate-500">Zoom:</span>
        <select
          className="cr-select text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-800 shrink-0 w-[72px]"
          id="selZoom"
          onChange={(e) => (window as unknown as { handleZoomChange?: (val: string) => void }).handleZoomChange?.(e.target.value)}
          defaultValue="1.0"
        >
          <option value="fit-page">Fit Page</option>
          <option value="fit-width">Fit Width</option>
          <option value="0.25">25%</option>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1.0">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2.0">200%</option>
        </select>

        <button
          type="button"
          className="cr-btn flex items-center gap-1 shrink-0 px-2 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          id="btnToggleGrid"
          onClick={() => (window as unknown as { toggleGrid?: () => void }).toggleGrid?.()}
          title="Toggle Canvas Grid"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
          <span>Grid</span>
        </button>

        <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

        {/* Insert Tools */}
        <div className="cr-word-group flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="cr-word-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            id="btnTableMenu"
            onClick={(e) => (window as unknown as { toggleTableDropdown?: (ev: React.MouseEvent) => void }).toggleTableDropdown?.(e)}
            title="Insert Table (MS Word Style)"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#2563eb" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#2563eb" />
              <line x1="3" y1="9" x2="21" y2="9" stroke="#2563eb" />
              <line x1="3" y1="15" x2="21" y2="15" stroke="#2563eb" />
              <line x1="9" y1="3" x2="9" y2="21" stroke="#2563eb" />
              <line x1="15" y1="3" x2="15" y2="21" stroke="#2563eb" />
            </svg>
            <span>Table</span>
            <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <button
            type="button"
            className="cr-word-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            id="btnShapesMenu"
            onClick={(e) => (window as unknown as { toggleShapesDropdown?: (ev: React.MouseEvent) => void }).toggleShapesDropdown?.(e)}
            title="Insert Shapes (आकार घाला: रेषा, बाण, आयत, वर्तुळ)"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#2563eb" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#2563eb" />
              <circle cx="16.5" cy="6.5" r="3.5" stroke="#2563eb" />
              <line x1="4" y1="20" x2="11" y2="13" stroke="#2563eb" strokeLinecap="round" />
              <path d="M14 17l6 0-3-3m3 3l-3 3" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Shapes</span>
            <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <button
            type="button"
            className="cr-word-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            id="btnWatermarkMenu"
            onClick={(e) => (window as unknown as { toggleWatermarkDropdown?: (ev: React.MouseEvent) => void }).toggleWatermarkDropdown?.(e)}
            title="Insert Ghosted Text Behind Content"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#94a3b8" />
              <polyline points="14 2 14 8 20 8" stroke="#94a3b8" />
              <text x="6" y="17" fontSize="11" fontWeight="bold" fill="#ea580c" stroke="none" transform="rotate(-15 12 12)">A</text>
            </svg>
            <span>Watermark</span>
            <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <button
            type="button"
            className="cr-word-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            id="btnPageColorMenu"
            onClick={(e) => (window as unknown as { togglePageColorDropdown?: (ev: React.MouseEvent) => void }).togglePageColorDropdown?.(e)}
            title="Choose a color for the background of the page"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#94a3b8" fill="#e0f2fe" />
              <polyline points="14 2 14 8 20 8" stroke="#94a3b8" />
              <path d="M4 14l5-5 5 5-5 5z" fill="#3b82f6" stroke="#1d4ed8" />
            </svg>
            <span>Page Color</span>
            <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right End Action Buttons: Always Pinned */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          type="button"
          className="cr-btn flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          id="btnBackToPrevious"
          onClick={() => (window as unknown as { goBackToPreviousScreen?: () => void }).goBackToPreviousScreen?.()}
          title="Back to previous screen (मागे जा)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back</span>
        </button>

        <button
          type="button"
          className="cr-btn flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          onClick={() => (window as unknown as { previewReport?: () => void }).previewReport?.()}
          title="Preview Live Database Report in new tab"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Preview</span>
        </button>

        <button
          type="button"
          className="cr-btn success flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          id="btnSave"
          onClick={() => (window as unknown as { saveDesign?: (publish?: boolean) => void }).saveDesign?.(false)}
          title="Save report layout as draft (Ctrl+S)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save Draft</span>
        </button>

        <button
          type="button"
          className="cr-btn flex items-center gap-1 px-3 py-1 text-xs font-bold rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
          id="btnPublish"
          onClick={() => (window as unknown as { saveDesign?: (publish?: boolean) => void }).saveDesign?.(true)}
          title="Publish layout to live reports"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Publish</span>
        </button>

        <button
          type="button"
          className="cr-btn primary flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          id="btnSavePreview"
          onClick={() => (window as unknown as { saveAndPreview?: () => void }).saveAndPreview?.()}
          title="Save and preview the design without database data"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Save &amp; Preview</span>
        </button>
      </div>
    </div>
  );
}
