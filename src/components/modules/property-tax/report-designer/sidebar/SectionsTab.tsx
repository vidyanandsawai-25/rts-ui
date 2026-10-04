'use client';

export function SectionsTab() {
  return (
    <div className="sidebar-content flex flex-col h-full overflow-y-auto p-2.5 gap-2" id="tabContentSections" style={{ display: 'none' }}>
      {/* 1. Search Sections */}
      <div className="relative">
        <input
          type="text"
          className="field-search w-full h-7 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          id="sectionSearchInput"
          placeholder="🔍 Search sections (विभाग शोधा)..."
          onInput={() => (window as unknown as { updateSectionsList?: () => void }).updateSectionsList?.()}
        />
      </div>

      {/* 2. Create Section Card */}
      <div className="cr-create-section-card p-2.5 bg-slate-50 border border-slate-200 rounded-lg" id="createSectionCard">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="cr-section-title-icon text-blue-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800">Create Section</span>
          <span className="text-[10px] text-slate-500 font-medium">(नवीन विभाग)</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="newSectionName" className="block text-[11px] font-semibold text-slate-700">
            Section Name <span className="text-[9.5px] text-slate-500 font-normal">(नाव टाका)</span>:
          </label>
          <div className="flex gap-1.5 items-center">
            <input
              className="cr-section-name-input flex-1 h-7 px-2 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-blue-500"
              id="newSectionName"
              type="text"
              placeholder="e.g. Owner Details"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (window as unknown as { handleNewSectionNameEnter?: () => void }).handleNewSectionNameEnter?.();
                }
              }}
            />
            <button
              type="button"
              className="cr-section-add-btn flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm"
              onClick={() => (window as unknown as { createReportSection?: () => void }).createReportSection?.()}
              title="Create this section"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create</span>
            </button>
          </div>
          <div id="createSectionError" className="hidden text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded p-1" />
        </div>
      </div>

      {/* 3. Sections List Header */}
      <div className="flex items-center justify-between mt-1 px-0.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECTIONS LIST (विभागांची यादी)</span>
        <span id="sectionsCountBadge" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200" />
      </div>

      {/* 4. Sections Tree List */}
      <div className="flex flex-col gap-1.5" id="sectionsTreeList" />
    </div>
  );
}
