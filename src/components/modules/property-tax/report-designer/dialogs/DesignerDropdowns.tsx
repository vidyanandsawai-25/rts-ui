'use client';

export function DesignerDropdowns() {
  return (
    <>
      {/* 1. MS Word Style Table Dropdown (10x8 Grid & Actions) */}
      <div className="cr-word-dropdown w-52 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="tableDropdown">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-slate-800">Insert Table</span>
          <span id="tableGridLabel" className="text-[10px] font-bold text-blue-600">1x1 Table</span>
        </div>
        <div
          className="table-grid-matrix grid grid-cols-10 gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded"
          id="tableGridMatrix"
          onMouseLeave={() => (window as unknown as { resetTableGridHighlight?: () => void }).resetTableGridHighlight?.()}
        />
        <div className="table-menu-actions flex flex-col gap-1 mt-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            className="table-menu-item flex items-center gap-2 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded"
            onClick={() => (window as unknown as { promptInsertTable?: () => void }).promptInsertTable?.()}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563eb" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            <span><u>I</u>nsert Table...</span>
          </button>
        </div>
      </div>

      {/* 2. MS Word Style Shapes Gallery Dropdown */}
      <div className="cr-word-dropdown w-56 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="shapesDropdown">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lines &amp; Arrows (रेषा व बाण)</div>
        <div className="grid grid-cols-3 gap-1 mb-2">
          <button
            type="button"
            className="shape-picker-btn flex flex-col items-center p-1.5 border border-slate-200 rounded hover:bg-blue-50 text-xs"
            onClick={() => {
              const w = window as unknown as { addNewElement?: (t: string) => void; closeShapesDropdown?: () => void };
              w.addNewElement?.('line');
              w.closeShapesDropdown?.();
            }}
            title="Straight Line (रेषा)"
          >
            <span>Line</span>
          </button>
          <button
            type="button"
            className="shape-picker-btn flex flex-col items-center p-1.5 border border-slate-200 rounded hover:bg-blue-50 text-xs"
            onClick={() => {
              const w = window as unknown as { addNewElement?: (t: string) => void; closeShapesDropdown?: () => void };
              w.addNewElement?.('arrow_right');
              w.closeShapesDropdown?.();
            }}
            title="Right Arrow (उजवा बाण)"
          >
            <span>Right</span>
          </button>
          <button
            type="button"
            className="shape-picker-btn flex flex-col items-center p-1.5 border border-slate-200 rounded hover:bg-blue-50 text-xs"
            onClick={() => {
              const w = window as unknown as { addNewElement?: (t: string) => void; closeShapesDropdown?: () => void };
              w.addNewElement?.('arrow_down');
              w.closeShapesDropdown?.();
            }}
            title="Down Arrow (खालचा बाण)"
          >
            <span>Down</span>
          </button>
        </div>

        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rectangles &amp; Shapes (आकार)</div>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            className="shape-picker-btn flex flex-col items-center p-1.5 border border-slate-200 rounded hover:bg-blue-50 text-xs"
            onClick={() => {
              const w = window as unknown as { addNewElement?: (t: string) => void; closeShapesDropdown?: () => void };
              w.addNewElement?.('rectangle');
              w.closeShapesDropdown?.();
            }}
          >
            <span>Rectangle</span>
          </button>
          <button
            type="button"
            className="shape-picker-btn flex flex-col items-center p-1.5 border border-slate-200 rounded hover:bg-blue-50 text-xs"
            onClick={() => {
              const w = window as unknown as { addNewElement?: (t: string) => void; closeShapesDropdown?: () => void };
              w.addNewElement?.('circle');
              w.closeShapesDropdown?.();
            }}
          >
            <span>Circle</span>
          </button>
          <button
            type="button"
            className="shape-picker-btn flex flex-col items-center p-1.5 border border-slate-200 rounded hover:bg-blue-50 text-xs"
            onClick={() => {
              const w = window as unknown as { addNewElement?: (t: string) => void; closeShapesDropdown?: () => void };
              w.addNewElement?.('text_box');
              w.closeShapesDropdown?.();
            }}
          >
            <span>Text Box</span>
          </button>
        </div>
      </div>

      {/* 3. Watermark Dropdown */}
      <div className="cr-word-dropdown w-52 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="watermarkDropdown">
        <div className="text-xs font-bold text-slate-800 mb-1">Watermark (जलचिन्ह)</div>
        <div className="flex flex-col gap-1 text-xs">
          <button
            type="button"
            className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 text-slate-700"
            onClick={() => (window as unknown as { applyPresetWatermark?: (t: string) => void }).applyPresetWatermark?.('CONFIDENTIAL')}
          >
            <span>CONFIDENTIAL</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 text-slate-700"
            onClick={() => (window as unknown as { applyPresetWatermark?: (t: string) => void }).applyPresetWatermark?.('DRAFT')}
          >
            <span>DRAFT</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 text-slate-700 font-semibold text-blue-600"
            onClick={() => (window as unknown as { openCustomWatermarkModal?: () => void }).openCustomWatermarkModal?.()}
          >
            <span>Custom Watermark...</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 p-1.5 rounded hover:bg-red-50 text-red-600 border-t border-slate-100"
            onClick={() => (window as unknown as { removeWatermark?: () => void }).removeWatermark?.()}
          >
            <span>Remove Watermark</span>
          </button>
        </div>
      </div>

      {/* 4. Page Color Dropdown */}
      <div className="cr-word-dropdown w-48 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="pageColorDropdown">
        <div className="text-xs font-bold text-slate-800 mb-1">Page Color (कागद रंग)</div>
        <div className="grid grid-cols-6 gap-1" id="pageColorPalette" />
        <button
          type="button"
          className="w-full mt-2 p-1 text-xs text-center border border-slate-200 rounded hover:bg-slate-50 text-slate-700"
          onClick={() => (window as unknown as { resetPageColor?: () => void }).resetPageColor?.()}
        >
          No Color (White)
        </button>
      </div>

      {/* 5. Align Dropdown */}
      <div className="cr-word-dropdown w-48 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="alignDropdown">
        <div className="text-xs font-bold text-slate-800 mb-1">Align Elements</div>
        <div className="flex flex-col gap-1 text-xs">
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-left text-slate-700"
            onClick={() => (window as unknown as { alignSelected?: (d: string) => void }).alignSelected?.('left')}
          >
            Align Left
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-left text-slate-700"
            onClick={() => (window as unknown as { alignSelected?: (d: string) => void }).alignSelected?.('center')}
          >
            Align Center
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-left text-slate-700"
            onClick={() => (window as unknown as { alignSelected?: (d: string) => void }).alignSelected?.('right')}
          >
            Align Right
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-left text-slate-700"
            onClick={() => (window as unknown as { alignSelected?: (d: string) => void }).alignSelected?.('top')}
          >
            Align Top
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-left text-slate-700"
            onClick={() => (window as unknown as { alignSelected?: (d: string) => void }).alignSelected?.('bottom')}
          >
            Align Bottom
          </button>
        </div>
      </div>

      {/* 6. Bullets Dropdown */}
      <div className="cr-word-dropdown w-44 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="bulletDropdown" />

      {/* 7. Numbering Dropdown */}
      <div className="cr-word-dropdown w-44 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="numberingDropdown" />

      {/* 8. Multilevel Dropdown */}
      <div className="cr-word-dropdown w-44 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="multilevelDropdown" />

      {/* 9. Text Color Dropdown */}
      <div className="cr-word-dropdown w-52 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="textColorDropdown" />

      {/* 10. Background Color Dropdown */}
      <div className="cr-word-dropdown w-52 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="bgColorDropdown" />

      {/* 11. Margins Dropdown */}
      <div className="cr-word-dropdown w-52 p-2 bg-white rounded-lg shadow-xl border border-slate-200" id="marginDropdown" />

      {/* 12. Floating Tooltips & Guidelines */}
      <div id="dragCoordsTooltip" className="fixed pointer-events-none hidden z-50 text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 text-white rounded shadow" />

      {/* 13. Toast Notification */}
      <div className="cr-toast fixed bottom-8 right-8 z-50 flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg shadow-xl text-xs" id="crToast">
        <span className="cr-toast-icon text-emerald-400 font-bold" id="toastIcon">✓</span>
        <span id="toastMsg">Action executed</span>
      </div>
    </>
  );
}
