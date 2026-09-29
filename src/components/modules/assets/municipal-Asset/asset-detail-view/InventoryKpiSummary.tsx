'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/common';
import { IndianRupee, Boxes, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { InventoryItem } from '@/types/asset/municipal-Asset/asset-detail.types';
import { getInventoryCategoryStyling, getInventoryCategoryIcon } from './inventory.config';

export function InventoryKpiSummary({
  totalValue,
  totalQuantity,
  kpiData,
}: {
  totalValue: number;
  totalQuantity: number;
  kpiData: InventoryItem[];
}): React.ReactElement {
  const t = useTranslations('asset-detail');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <Button variant="outline" onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-slate-200 rounded-full !p-1 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 !w-7 !h-7 flex items-center justify-center !min-w-0">
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </Button>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-2 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[240px] snap-start flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{t('totalCapitalValue')}</p>
            <p className="text-xl font-black text-slate-800 leading-none">{`₹ ${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[240px] snap-start flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{t('totalItems')}</p>
            <p className="text-xl font-black text-slate-800 leading-none">{totalQuantity}</p>
          </div>
        </div>

        <div className="w-px bg-slate-200 my-2 mx-1 flex-shrink-0" />

        {kpiData.filter(k => k.label !== 'Total Inventory').map((cat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 min-w-[180px] snap-start flex-shrink-0">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getInventoryCategoryStyling(cat.label).bgColor, getInventoryCategoryStyling(cat.label).color)}>
              {/* Category icon placeholder */}
              {React.createElement(getInventoryCategoryIcon(cat.label), { className: "w-5 h-5" })}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 line-clamp-1" title={cat.label}>{cat.label}</p>
              <p className="text-lg font-black text-slate-800 leading-none">{cat.count}</p>
            </div>
          </div>
        ))}

      </div>

      <Button variant="outline" onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-slate-200 rounded-full !p-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-3 !w-7 !h-7 flex items-center justify-center !min-w-0">
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </Button>
    </div>
  );
}
