'use client';

import { CanvasRuler } from './CanvasRuler';
import { CanvasPaper } from './CanvasPaper';

export function DesignerStage() {
  return (
    <div className="cr-center-area flex-1 flex flex-col h-full overflow-hidden bg-[#525659] relative">
      {/* Horizontal Millimeter Ruler */}
      <CanvasRuler />

      {/* Scrollable Canvas Workspace */}
      <div
        className="cr-canvas-scroll flex-1 overflow-auto relative p-8 focus:outline-none"
        id="canvasScrollArea"
        onScroll={(e) => (window as unknown as { handleCanvasScroll?: (ev: React.UIEvent) => void }).handleCanvasScroll?.(e)}
        onMouseMove={(e) => (window as unknown as { handleCanvasMouseMove?: (ev: React.MouseEvent) => void }).handleCanvasMouseMove?.(e)}
        onMouseDown={(e) => (window as unknown as { handleCanvasAreaMouseDown?: (ev: React.MouseEvent) => void }).handleCanvasAreaMouseDown?.(e)}
      >
        <div className="cr-stage-wrapper flex items-start justify-center min-w-fit min-h-fit" id="stageWrapper">
          <CanvasPaper />
        </div>

        {/* Smart Alignment Guides */}
        <div className="smart-guide-x absolute pointer-events-none hidden bg-red-400 z-40" id="smartGuideX" />
        <div className="smart-guide-y absolute pointer-events-none hidden bg-red-400 z-40" id="smartGuideY" />

        {/* Marquee Selection Rect */}
        <div className="selection-marquee absolute pointer-events-none hidden border border-dashed border-blue-500 bg-blue-500/10 z-40" id="selectionMarquee" />
      </div>
    </div>
  );
}
