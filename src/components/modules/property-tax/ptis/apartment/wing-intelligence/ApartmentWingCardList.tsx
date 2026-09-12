'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ApartmentWingCard } from './ApartmentWingCard';
import { WingData } from '@/types/property-tax/apartment';

export interface WingCardListProps {
  mappedWings: WingData[];
  activeWingDetailId: number | null;
  activeWingMasterId: number | null;
  initScrollRef: (el: HTMLDivElement | null) => void;
  leftArrowRef: React.RefObject<HTMLDivElement | null>;
  rightArrowRef: React.RefObject<HTMLDivElement | null>;
  scrollPrev: () => void;
  scrollNext: () => void;
  checkScroll: () => void;
  onCardSelect: (wing: WingData) => void;
  onAmcClick: (wing: WingData) => void;
  onCardEdit: (wing: WingData) => void;
}

export const ApartmentWingCardList: React.FC<WingCardListProps> = ({
  mappedWings,
  activeWingDetailId,
  activeWingMasterId,
  initScrollRef,
  leftArrowRef,
  rightArrowRef,
  scrollPrev,
  scrollNext,
  checkScroll,
  onCardSelect,
  onAmcClick,
  onCardEdit,
}) => {
  return (
    <div className="relative w-full">
      <div
        ref={initScrollRef}
        onScroll={checkScroll}
        className={`flex gap-4 overflow-x-auto py-2 scroll-smooth ${
          mappedWings.length > 3
            ? 'pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full'
            : 'scrollbar-hide'
        }`}
      >
        {mappedWings?.map((wing, index) => {
          const isSelected = !!(
            (activeWingDetailId && wing.wingDetailId === activeWingDetailId) ||
            (activeWingMasterId && wing.wingMasterId === activeWingMasterId)
          );

          return (
            <div
              key={`${wing.id}-${index}`}
              className="shrink-0 w-full md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
            >
              <ApartmentWingCard
                data={wing}
                isSelected={isSelected}
                onClick={() => onCardSelect(wing)}
                onAmcClick={(e) => {
                  e.stopPropagation();
                  onAmcClick(wing);
                }}
                onEdit={(e) => {
                  e.stopPropagation();
                  onCardEdit(wing);
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        ref={leftArrowRef}
        role="button"
        tabIndex={0}
        aria-label="Scroll left"
        onClick={scrollPrev}
        onKeyDown={(e) => e.key === 'Enter' && scrollPrev()}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white p-1 rounded-full shadow-md border border-black cursor-pointer hover:bg-slate-50 z-10 hidden"
      >
        <ChevronLeft className="text-blue-600" size={20} />
      </div>
      <div
        ref={rightArrowRef}
        role="button"
        tabIndex={0}
        aria-label="Scroll right"
        onClick={scrollNext}
        onKeyDown={(e) => e.key === 'Enter' && scrollNext()}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white p-1 rounded-full shadow-md border border-black cursor-pointer hover:bg-slate-50 z-10 hidden"
      >
        <ChevronRight className="text-blue-600" size={20} />
      </div>
    </div>
  );
};

export default ApartmentWingCardList;
