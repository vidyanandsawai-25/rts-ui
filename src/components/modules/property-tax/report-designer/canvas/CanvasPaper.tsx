'use client';

export function CanvasPaper() {
  return (
    <div className="cr-designer-stage relative flex" id="designerStage">
      {/* Left Section Gutter (Docked to left of the paper) */}
      <div className="cr-section-gutter flex flex-col shrink-0 select-none" id="sectionGutter" />

      {/* The Real Printable Sheet of Paper */}
      <div className="cr-paper-sheet relative bg-white shadow-xl select-none" id="reportCanvas">
        {/* Printable Margin Guides */}
        <div className="cr-margin-guides pointer-events-none absolute inset-0" id="marginGuides" />
      </div>
    </div>
  );
}
