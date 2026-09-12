'use client';

import React from 'react';

export const ApartmentWingSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs overflow-hidden relative font-sans select-none animate-pulse">
      {/* Top Nav Tabs Skeleton */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 bg-blue-100/80 rounded-lg" />
          <div className="h-7 w-32 bg-slate-100 rounded-lg" />
          <div className="h-7 w-24 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-7 w-28 bg-slate-100 rounded-lg" />
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between py-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-5 w-8 bg-blue-100 rounded-full" />
        </div>
        <div className="h-5 w-16 bg-slate-100 rounded" />
      </div>

      {/* 3 Wing Cards Skeleton */}
      <div className="flex gap-4 overflow-hidden py-1">
        {[1, 2, 3].map((idx) => (
          <div
            key={`wing-card-skel-${idx}`}
            className="shrink-0 w-full md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] border border-slate-200/90 rounded-xl p-3 bg-white flex flex-col gap-2.5"
          >
            {/* Wing Title & Edit */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100/80" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
              <div className="w-5 h-5 rounded-full bg-slate-100" />
            </div>

            {/* Metrics Rows */}
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-3.5 w-10 bg-slate-200 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-3.5 w-12 bg-slate-200 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-14 bg-slate-100 rounded" />
                <div className="h-3.5 w-16 bg-slate-200 rounded" />
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
              <div className="h-6 w-16 bg-blue-100/70 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApartmentWingSkeleton;
