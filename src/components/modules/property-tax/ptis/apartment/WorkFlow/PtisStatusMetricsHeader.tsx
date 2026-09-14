'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApartmentStatusMetrics } from '@/hooks/property-tax/apartment';
import { PtisStatusBadgeItem, DEFAULT_STATUS_BADGES } from '@/lib/utils/ptis/ptisStatusMetrics.utils';
import {
  ApartmentQCTopSectionBelowFlexResponseDto,
  ApartmentQCTopSectionBelowFlexItemsDto,
} from '@/types/property-tax/apartment';

export type { PtisStatusBadgeItem };
export { DEFAULT_STATUS_BADGES };

export interface PtisStatusMetricsHeaderProps {
  propertyId?: number | null;
  badges?: PtisStatusBadgeItem[];
  initialData?: ApartmentQCTopSectionBelowFlexResponseDto | ApartmentQCTopSectionBelowFlexItemsDto | Record<string, unknown> | null;
  isLoading?: boolean;
}

export const PtisStatusMetricsHeader: React.FC<PtisStatusMetricsHeaderProps> = ({
  propertyId,
  badges: initialBadges,
  initialData,
  isLoading = false,
}) => {
  const { badges, scrollContainerRef, handleScroll, isLoading: hookLoading } = useApartmentStatusMetrics({
    propertyId,
    badges: initialBadges,
    initialData,
  });

  const showSkeleton = (isLoading || hookLoading) && badges.length === 0;

  return (
    <div className="w-full bg-white rounded-xl border border-zinc-200 shadow-xs py-1 px-1.5 flex items-center gap-1.5 min-h-[34px] font-sans select-none overflow-hidden">
      {/* Highlighted Left Scroll Button */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="shrink-0 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={badges.length === 0}
        title="Scroll Left"
      >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Scrollable Badges Area with Zero Scrollbar */}
        <div
          ref={scrollContainerRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden flex items-center gap-1 min-w-0"
        >
          {showSkeleton ? (
            <div className="flex items-center gap-3 animate-pulse py-0.5 px-2 w-full overflow-hidden">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-1.5 shrink-0">
                  <div className="w-5.5 h-5.5 rounded-full bg-slate-200" />
                  <div className="flex flex-col gap-1">
                    <div className="h-2 w-14 bg-slate-200 rounded" />
                    <div className="h-2.5 w-10 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : badges.length > 0 ? (
            badges.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <div className="h-4.5 w-px bg-zinc-200 shrink-0" />}
                <div className="flex-1 flex items-center justify-center gap-1.5 px-2 py-0.5 text-left min-w-max">
                  {/* Circular icon badge container */}
                  <div
                    className={`w-5.5 h-5.5 rounded-full ${item.iconBgClass} ${item.iconColorClass} shrink-0 flex items-center justify-center`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex flex-col leading-none whitespace-nowrap">
                    {/* Title in bold dark blue */}
                    <span className="text-[10px] font-bold text-[#1e3a8a]">
                      {item.label}
                    </span>
                    {/* Value in bold status color (Green/Amber/Red) */}
                    <span className={`text-[10px] font-extrabold ${item.valueColorClass}`}>
                      {item.value}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : null}
        </div>

        {/* Highlighted Right Scroll Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="shrink-0 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={badges.length === 0}
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
  );
};
