'use client';

export function PropertiesPanel() {
  return (
    <div className="cr-sidebar-right w-72 h-full flex flex-col bg-white border-l border-slate-200 select-none shrink-0 overflow-hidden" id="sidebarRight" style={{ display: 'none !important' }}>
      <div className="properties-header flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
        <span>Properties</span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-normal bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
            id="selectedElemIdBadge"
          >
            None
          </span>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-700 font-bold text-xs p-0.5"
            onClick={() => (window as unknown as { deselectAll?: () => void }).deselectAll?.()}
            title="Close Properties"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="properties-body flex-1 overflow-y-auto p-3 text-xs" id="propertiesContainer">
        <div className="text-center text-slate-400 mt-10 italic">
          Select an element or section on the canvas to inspect and edit its properties.
        </div>
      </div>
    </div>
  );
}
