'use client';

import React from 'react';

export function PropertyMediaPanelSkeleton(): React.ReactElement {
  return (
    <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 p-2.5 gap-2.5 animate-pulse min-h-[500px]">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-1 min-h-[110px] flex items-center justify-center"
        >
          <div className="w-10 h-10 bg-slate-200 rounded-full" />
        </div>
      ))}
    </div>
  );
}
