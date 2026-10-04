'use client';

export function FormattingToolbar() {
  return (
    <div className="cr-toolbar-row flex items-center px-2 py-1 bg-slate-50 border-b border-slate-200 gap-1.5 overflow-x-auto scrollbar-none">
      {/* Edit Actions: Undo, Redo, Copy, Delete */}
      <div className="cr-toolbar-pill-group flex items-center bg-white border border-slate-300 rounded px-1 py-0.5 shadow-sm">
        <button
          type="button"
          className="cr-btn p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
          id="btnUndo"
          onClick={() => (window as unknown as { undo?: () => void }).undo?.()}
          title="Undo (Ctrl+Z)"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>

        <div className="h-3.5 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          className="cr-btn p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
          id="btnRedo"
          onClick={() => (window as unknown as { redo?: () => void }).redo?.()}
          title="Redo (Ctrl+Y)"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </button>

        <div className="h-3.5 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          className="cr-btn p-1 text-blue-600 hover:bg-blue-50 rounded"
          id="btnCopy"
          onClick={() => (window as unknown as { duplicateSelected?: () => void }).duplicateSelected?.()}
          title="Copy Selected (Ctrl+C / Ctrl+D)"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>

        <div className="h-3.5 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          className="cr-btn p-1 text-red-600 hover:bg-red-50 rounded"
          id="btnDelete"
          onClick={() => (window as unknown as { deleteSelected?: () => void }).deleteSelected?.()}
          title="Delete Selected (Delete)"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

      {/* Typography: Font Family */}
      <select
        className="cr-select text-xs font-medium border border-slate-300 rounded px-2 py-1 bg-white text-slate-800 w-[145px]"
        id="fmtFontFamily"
        onChange={(e) => (window as unknown as { applyStyleToSelected?: (prop: string, val: string) => void }).applyStyleToSelected?.('fontFamily', e.target.value)}
        title="Font Family"
        defaultValue="'Noto Sans Devanagari', Mukta, sans-serif"
      >
        <optgroup label="DVOT / शासकीय देवनागरी (CDAC ISM)">
          <option value="'DVOT-Surekh', 'DV-OTSurekh', 'DVOT Surekh', 'Noto Sans Devanagari', sans-serif">DVOT-Surekh (देवनागरी)</option>
          <option value="'DVOT-SurekhMR', 'DV-OTSurekhMR', 'DVOT SurekhMR', 'Noto Sans Devanagari', sans-serif">DVOT-SurekhMR (देवनागरी)</option>
          <option value="'DVOT-Yogesh', 'DV-OTYogesh', 'DVOT Yogesh', 'Noto Sans Devanagari', sans-serif">DVOT-Yogesh (देवनागरी)</option>
          <option value="'DVOT-YogeshMR', 'DV-OTYogeshMR', 'DVOT YogeshMR', 'Noto Sans Devanagari', sans-serif">DVOT-YogeshMR (देवनागरी)</option>
        </optgroup>
        <optgroup label="मराठी / देवनागरी (Devanagari)">
          <option value="'Noto Sans Devanagari', Mukta, sans-serif">Noto Sans Devanagari</option>
          <option value="Mukta, 'Noto Sans Devanagari', sans-serif">Mukta (मुक्ता)</option>
          <option value="'Tiro Devanagari Marathi', 'Noto Sans Devanagari', serif">Tiro Devanagari (तिरो मराठी)</option>
          <option value="Poppins, 'Noto Sans Devanagari', sans-serif">Poppins (पॉपिन्स)</option>
          <option value="'Noto Serif Devanagari', Georgia, serif">Noto Serif Devanagari</option>
          <option value="'Rozha One', 'Noto Sans Devanagari', serif">Rozha One (ठळक)</option>
          <option value="'Yatra One', 'Noto Sans Devanagari', cursive">Yatra One (पारंपारिक)</option>
          <option value="Martel, 'Noto Serif Devanagari', serif">Martel (मार्टेल)</option>
        </optgroup>
        <optgroup label="Standard Sans-Serif">
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
          <option value="Calibri, sans-serif">Calibri</option>
          <option value="Tahoma, sans-serif">Tahoma</option>
        </optgroup>
        <optgroup label="Serif (Legal & Notices)">
          <option value="'Times New Roman', Times, serif">Times New Roman</option>
          <option value="Georgia, serif">Georgia</option>
        </optgroup>
      </select>

      {/* Font Size */}
      <select
        className="cr-select text-xs font-medium border border-slate-300 rounded px-1.5 py-1 bg-white text-slate-800 w-[58px]"
        id="fmtFontSize"
        onChange={(e) => (window as unknown as { applyStyleToSelected?: (prop: string, val: string) => void }).applyStyleToSelected?.('fontSize', e.target.value)}
        title="Font Size"
        defaultValue="10px"
      >
        <option value="7px">7 pt</option>
        <option value="8px">8 pt</option>
        <option value="8.5px">8.5 pt</option>
        <option value="9px">9 pt</option>
        <option value="9.5px">9.5 pt</option>
        <option value="10px">10 pt</option>
        <option value="11px">11 pt</option>
        <option value="12px">12 pt</option>
        <option value="13px">13 pt</option>
        <option value="14px">14 pt</option>
        <option value="16px">16 pt</option>
        <option value="19px">19 pt</option>
        <option value="22px">22 pt</option>
      </select>

      {/* Style Pill: Bold, Italic, Underline */}
      <div className="cr-toolbar-pill-group flex items-center bg-white border border-slate-300 rounded px-1 py-0.5 shadow-sm">
        <button
          type="button"
          className="cr-btn px-2 py-0.5 text-xs font-serif font-extrabold hover:bg-slate-100 rounded"
          id="fmtBold"
          onClick={() => (window as unknown as { toggleStyleSelected?: (prop: string, on: string, off: string) => void }).toggleStyleSelected?.('fontWeight', '700', '400')}
          title="Bold"
        >
          B
        </button>
        <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          className="cr-btn px-2 py-0.5 text-xs font-serif italic font-bold hover:bg-slate-100 rounded"
          id="fmtItalic"
          onClick={() => (window as unknown as { toggleStyleSelected?: (prop: string, on: string, off: string) => void }).toggleStyleSelected?.('fontStyle', 'italic', 'normal')}
          title="Italic"
        >
          I
        </button>
        <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          className="cr-btn px-2 py-0.5 text-xs font-serif underline font-bold hover:bg-slate-100 rounded"
          id="fmtUnderline"
          onClick={() => (window as unknown as { toggleStyleSelected?: (prop: string, on: string, off: string) => void }).toggleStyleSelected?.('textDecoration', 'underline', 'none')}
          title="Underline"
        >
          U
        </button>
      </div>

      <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

      {/* Text Alignment */}
      <div className="cr-toolbar-pill-group flex items-center bg-white border border-slate-300 rounded px-1 py-0.5 shadow-sm">
        <button
          type="button"
          className="cr-btn p-1 text-slate-700 hover:bg-slate-100 rounded"
          onClick={() => (window as unknown as { applyStyleToSelected?: (prop: string, val: string) => void }).applyStyleToSelected?.('textAlign', 'left')}
          title="Align Left"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="18" y2="18" />
          </svg>
        </button>
        <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          className="cr-btn p-1 text-slate-700 hover:bg-slate-100 rounded"
          onClick={() => (window as unknown as { applyStyleToSelected?: (prop: string, val: string) => void }).applyStyleToSelected?.('textAlign', 'center')}
          title="Align Center"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="6" y1="12" x2="18" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          className="cr-btn p-1 text-slate-700 hover:bg-slate-100 rounded"
          onClick={() => (window as unknown as { applyStyleToSelected?: (prop: string, val: string) => void }).applyStyleToSelected?.('textAlign', 'right')}
          title="Align Right"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="9" y1="12" x2="21" y2="12" />
            <line x1="6" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

      {/* Bullets & Numbering */}
      <div className="cr-toolbar-pill-group flex items-center bg-white border border-slate-300 rounded px-1 py-0.5 shadow-sm">
        <button
          type="button"
          className="cr-btn px-1.5 py-0.5 hover:bg-slate-100 rounded"
          id="btnBulletToggle"
          onClick={() => (window as unknown as { toggleBulletSelected?: () => void }).toggleBulletSelected?.()}
          title="Bullets (बुलेट यादी)"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="2.5" cy="3.5" r="1.5" fill="#2563eb" />
            <circle cx="2.5" cy="8" r="1.5" fill="#2563eb" />
            <circle cx="2.5" cy="12.5" r="1.5" fill="#2563eb" />
            <line x1="6" y1="3.5" x2="14.5" y2="3.5" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="6" y1="8" x2="14.5" y2="8" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="6" y1="12.5" x2="14.5" y2="12.5" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="cr-btn cr-word-btn px-0.5 py-0.5 hover:bg-slate-100 rounded"
          id="btnBulletMenu"
          onClick={(e) => (window as unknown as { toggleBulletDropdown?: (ev: React.MouseEvent) => void }).toggleBulletDropdown?.(e)}
          title="Bullet Library"
        >
          <svg width="7" height="7" viewBox="0 0 10 6" fill="none" stroke="#475569" strokeWidth="1.8">
            <polyline points="1 1 5 5 9 1" />
          </svg>
        </button>

        <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

        <button
          type="button"
          className="cr-btn px-1.5 py-0.5 hover:bg-slate-100 rounded"
          id="btnNumberToggle"
          onClick={() => (window as unknown as { toggleNumberingSelected?: () => void }).toggleNumberingSelected?.()}
          title="Numbering (क्रमांक यादी)"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <text x="0.5" y="5" fontSize="4.8" fontWeight="700" fill="#2563eb">1.</text>
            <line x1="6" y1="3.5" x2="14.5" y2="3.5" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
            <text x="0.5" y="9.5" fontSize="4.8" fontWeight="700" fill="#2563eb">2.</text>
            <line x1="6" y1="8" x2="14.5" y2="8" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="cr-btn cr-word-btn px-0.5 py-0.5 hover:bg-slate-100 rounded"
          id="btnNumberMenu"
          onClick={(e) => (window as unknown as { toggleNumberingDropdown?: (ev: React.MouseEvent) => void }).toggleNumberingDropdown?.(e)}
          title="Numbering Library"
        >
          <svg width="7" height="7" viewBox="0 0 10 6" fill="none" stroke="#475569" strokeWidth="1.8">
            <polyline points="1 1 5 5 9 1" />
          </svg>
        </button>
      </div>

      <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

      {/* Align Tools */}
      <button
        type="button"
        className="cr-word-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
        id="btnAlignMenu"
        onClick={(e) => (window as unknown as { toggleAlignDropdown?: (ev: React.MouseEvent) => void }).toggleAlignDropdown?.(e)}
        title="Align & Distribute Elements"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#2563eb" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="18" y2="18" />
        </svg>
        <span>Align</span>
        <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="cr-separator h-4 w-px bg-slate-300 mx-1" />

      {/* Text & Background Color */}
      <div className="cr-word-group flex items-center border border-slate-300 rounded bg-white px-1 py-0.5 shadow-sm">
        <button
          type="button"
          className="cr-word-btn flex items-center gap-1 px-1.5 py-0.5 text-xs hover:bg-slate-50 rounded"
          id="btnTextColorMenu"
          onClick={(e) => (window as unknown as { toggleTextColorDropdown?: (ev: React.MouseEvent) => void }).toggleTextColorDropdown?.(e)}
          title="Text Color (मजकूर रंग)"
        >
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="font-serif font-extrabold text-xs text-slate-900">A</span>
            <span id="textColorIndicator" className="block w-3 h-0.5 bg-black rounded-sm mt-0.5" />
          </div>
          <svg viewBox="0 0 24 24" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

        <button
          type="button"
          className="cr-word-btn flex items-center gap-1 px-1.5 py-0.5 text-xs hover:bg-slate-50 rounded"
          id="btnBgColorMenu"
          onClick={(e) => (window as unknown as { toggleBgColorDropdown?: (ev: React.MouseEvent) => void }).toggleBgColorDropdown?.(e)}
          title="Background Color (पार्श्वभूमी रंग)"
        >
          <div className="flex flex-col items-center justify-center leading-none">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M19 11L12 4 4.5 11.5a3.5 3.5 0 0 0 5 5L12 14" />
              <path d="M5 21h14" />
            </svg>
            <span id="bgColorIndicator" className="block w-3 h-0.5 bg-white border border-slate-400 rounded-sm mt-0.5" />
          </div>
          <span>Bg</span>
          <svg viewBox="0 0 24 24" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Border Dropdown */}
      <select
        className="cr-select text-xs font-medium border border-slate-300 rounded px-1.5 py-1 bg-white text-slate-800 w-[96px] cursor-pointer"
        id="selBorderType"
        onChange={(e) => {
          (window as unknown as { applyBorderSelected?: (v: string) => void }).applyBorderSelected?.(e.target.value);
          e.target.value = '';
        }}
        title="Apply Border (MS Word style)"
        defaultValue=""
      >
        <option value="" disabled>⊞ Border</option>
        <option value="all">⊞ All Borders</option>
        <option value="none">⬚ No Border</option>
        <option value="bottom"> Bottom Border</option>
        <option value="top">▔ Top Border</option>
        <option value="left">▏ Left Border</option>
        <option value="right">▕ Right Border</option>
        <option value="dialog">🎨 Borders &amp; Shading...</option>
      </select>

      {/* Margins */}
      <button
        type="button"
        className="cr-word-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm shrink-0"
        id="btnMarginMenu"
        onClick={(e) => (window as unknown as { toggleMarginDropdown?: (ev: React.MouseEvent) => void }).toggleMarginDropdown?.(e)}
        title="Page Margins (समास)"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="7" y1="3" x2="7" y2="21" strokeDasharray="2 2" />
          <line x1="17" y1="3" x2="17" y2="21" strokeDasharray="2 2" />
        </svg>
        <span>Margins</span>
        <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}
