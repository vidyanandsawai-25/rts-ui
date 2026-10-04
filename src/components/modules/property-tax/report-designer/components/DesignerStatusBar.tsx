'use client';

export function DesignerStatusBar() {
  return (
    <div className="cr-statusbar h-6 flex items-center justify-between px-3 bg-slate-100 border-t border-slate-300 text-[11px] text-slate-600 select-none shrink-0">
      <div className="status-left flex items-center gap-3">
        <span id="statusSelection">Ready. No selection.</span>
        <span className="text-slate-300">|</span>
        <span id="statusPaperDimensions">Paper: A4 Landscape (297 x 210 mm)</span>
      </div>
      <div className="status-right flex items-center gap-3">
        <span id="statusZoom">Zoom: 100%</span>
        <span className="text-slate-300">|</span>
        <span id="statusSnap">Snap: 5px</span>
        <span className="text-slate-300">|</span>
        <span id="statusLastSave" className="font-semibold text-slate-700">Not saved</span>
      </div>
    </div>
  );
}
