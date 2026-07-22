'use client';

import React from 'react';
import type { WaybackRelease } from '@/lib/api/wayback.service';

interface TimelineTrackProps {
  releases: WaybackRelease[];
  activeIdx: number;
  onSelectYear: (index: number) => void;
}

export function TimelineTrack({
  releases,
  activeIdx,
  onSelectYear,
}: TimelineTrackProps): React.ReactElement | null {
  if (releases.length === 0) {
    return (
      <div className="tl-bar relative bg-slate-950 border-b border-slate-900 px-6 py-2 flex items-center justify-center min-h-[56px]">
        <div className="h-4 w-48 bg-slate-800 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="tl-bar relative bg-slate-950 border-b border-slate-900 px-6 py-2 flex items-center justify-between overflow-x-auto overflow-y-hidden min-h-[56px] gap-2 scrollbar-none">
      {/* Connecting line track */}
      <div className="absolute left-10 right-10 top-[29px] h-[2px] bg-slate-800 pointer-events-none" />

      {releases.map((rel, i) => (
        <div key={rel.releaseId} className="relative z-10 flex flex-col items-center gap-1.5">
          <span
            className={`text-sm font-extrabold font-sans tracking-wider transition-colors duration-200 ${
              i === activeIdx ? 'text-blue-400' : i < activeIdx ? 'text-blue-500 hover:text-blue-300' : 'text-slate-200 hover:text-white'
            }`}
          >
            {rel.year}
          </span>
          <button
            type="button"
            onClick={() => onSelectYear(i)}
            className="relative flex items-center justify-center p-0 w-6 h-6 bg-transparent border-none outline-none focus:outline-none cursor-pointer hover:scale-110 transition-transform"
            title={rel.date}
            aria-label={`Jump to satellite imagery from ${rel.year}`}
          >
            {i === activeIdx ? (
              <>
                <span className="absolute w-5 h-5 rounded-full bg-blue-400/40 animate-ping" />
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-blue-500 shadow-sm" />
              </>
            ) : (
              <span
                className={`w-3 h-3 rounded-full border transition-all duration-200 ${
                  i < activeIdx
                    ? 'bg-blue-600 border-blue-500 hover:bg-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-600 hover:border-slate-500'
                }`}
              />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
