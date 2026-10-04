'use client';

export function CanvasRuler() {
  return (
    <div className="cr-ruler-header flex items-center h-6 bg-slate-100 border-b border-slate-300 select-none">
      <div
        className="cr-ruler-corner flex items-center justify-center w-10 h-full text-[10px] font-bold text-slate-500 bg-slate-200 border-r border-slate-300"
        title="Measurement Unit: Millimeters"
      >
        mm
      </div>
      <div className="cr-ruler-viewport relative flex-1 h-full overflow-hidden" id="rulerViewport">
        <div className="cr-ruler-ticks h-full relative" id="rulerTicks" />
        <div className="cr-ruler-tracker-x absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none hidden" id="rulerTrackerX" />
      </div>
    </div>
  );
}
