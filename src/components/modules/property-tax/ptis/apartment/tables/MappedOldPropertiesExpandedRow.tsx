/* eslint-disable i18next/no-literal-string */
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchMappedOldPropertiesAction } from '@/app/[locale]/property-tax/ptis/apartment/action';
import { MappedOldPropertyItem } from '@/types/property-mapping';
import { Loader2, History, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SelectedPropertyTaxBreakdown, TaxAmountItem } from './SelectedPropertyTaxBreakdown';
import { EmptyMappedPropertiesState } from './EmptyMappedPropertiesState';

interface MappedOldPropertiesExpandedRowProps {
  propertyId?: number | null;
}

export const MappedOldPropertiesExpandedRow: React.FC<MappedOldPropertiesExpandedRowProps> = ({
  propertyId,
}) => {
  const [loading, setLoading] = useState(() => Boolean(propertyId && propertyId > 0));
  const [items, setItems] = useState<MappedOldPropertyItem[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (!propertyId || propertyId <= 0) return;
    let isMounted = true;

    fetchMappedOldPropertiesAction({ propertyId, pageNumber: 1, pageSize: 25 })
      .then((res) => {
        if (!isMounted) return;
        const data = res.success ? res.data : null;
        setItems(data?.items || []);
        setTotalCount(data?.totalCount || data?.items?.length || 0);
        setHasNext(Boolean(data?.totalCount && data.totalCount > 25));
        setPageNumber(1);
        setSelectedPropId(null);
      })
      .catch(() => { if (isMounted) setItems([]); })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [propertyId]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && hasNext && !loadingMoreRef.current && propertyId) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      const nextPage = pageNumber + 1;
      fetchMappedOldPropertiesAction({ propertyId, pageNumber: nextPage, pageSize: 25 })
        .then((res) => {
          if (res.success && res.data?.items?.length) {
            setItems((prev) => [...prev, ...(res.data?.items || [])]);
            setPageNumber(nextPage);
            setHasNext(Boolean(res.data.items.length === 25));
          } else { setHasNext(false); }
        })
        .catch(() => setHasNext(false))
        .finally(() => { loadingMoreRef.current = false; setLoadingMore(false); });
    }
  }, [hasNext, propertyId, pageNumber]);

  if (!propertyId || propertyId <= 0) {
    return (
      <EmptyMappedPropertiesState
        message="No New Property ID associated with this unit."
        theme="emerald"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-xs font-sans rounded-md border shadow-2xs sticky left-1 w-fit bg-emerald-50/80 border-emerald-200 text-emerald-900">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
        <span>Loading mapped properties for New Property #{propertyId}...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyMappedPropertiesState
        message={`No mapped properties found for New Property #${propertyId}`}
        theme="emerald"
      />
    );
  }

  return (
    <div className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/40 text-xs font-sans shadow-2xs space-y-1.5 select-none w-full max-w-[calc(100vw-100px)] sticky left-1">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-950">
          <History className="w-3.5 h-3.5 text-emerald-700" />
          <span>Mapped Old Properties ({items.length}{totalCount > items.length ? ` of ${totalCount}` : ''})</span>
          <span className="text-[10px] font-normal text-zinc-500 font-mono">(New Property #{propertyId})</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium">Click any row to show/hide tax breakdown</span>
      </div>

      <div
        onScroll={handleScroll}
        className="max-h-72 overflow-x-auto overflow-y-auto rounded-md border border-emerald-200/90 bg-white shadow-2xs ios-scrollbar"
      >
        <table className="w-max min-w-full text-left border-collapse text-[10.5px] leading-tight">
          <thead className="sticky top-0 bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200 z-20 text-[10px] uppercase tracking-wider shadow-2xs">
            <tr className="h-8">
              <th className="px-2 py-1 text-center w-8 sticky left-0 bg-emerald-50 z-30">#</th>
              <th className="px-2.5 py-1 whitespace-nowrap sticky left-8 bg-emerald-50 z-30 border-r border-emerald-200">Old Prop / Flat</th>
              <th className="px-2.5 py-1 whitespace-nowrap">Wing / Flr</th>
              <th className="px-2.5 py-1 whitespace-nowrap">Use</th>
              <th className="px-2.5 py-1 whitespace-nowrap">Const Type</th>
              <th className="px-2.5 py-1 text-center whitespace-nowrap">Year</th>
              <th className="px-2.5 py-1 text-right whitespace-nowrap">Area (sqft)</th>
              <th className="px-2.5 py-1 text-right whitespace-nowrap">Old RV (₹)</th>
              <th className="px-2.5 py-1 text-right whitespace-nowrap">Old Tax (₹)</th>
              <th className="px-2.5 py-1 whitespace-nowrap">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
            {items.map((m, idx) => {
              const isSelected = selectedPropId === m.id;
              const propertyLabel = m.flatOrShopNo || m.oldPropertyNo || m.propertyNo || String(m.id);
              const oldHeads: TaxAmountItem[] = (m.oldTaxDetails || []).map((h) => ({
                taxName: h.taxName || undefined,
                taxAmount: h.taxAmount ?? undefined,
              }));

              return (
                <React.Fragment key={`${m.id}-${idx}`}>
                  <tr
                    onClick={() => setSelectedPropId((prev) => (prev === m.id ? null : m.id))}
                    className={cn(
                      'cursor-pointer transition-colors h-8 hover:bg-emerald-50/80',
                      isSelected ? 'bg-emerald-100/90 font-bold text-emerald-950 border-l-4 border-l-emerald-600' : ''
                    )}
                  >
                    <td className={cn('px-2 py-1 text-center text-zinc-400 font-bold sticky left-0 z-10 align-middle', isSelected ? 'bg-emerald-100' : 'bg-white')}>
                      <div className="flex items-center justify-center gap-0.5">
                        {isSelected ? <ChevronDown className="w-3 h-3 text-emerald-700" /> : <ChevronRight className="w-3 h-3 text-zinc-400" />}
                        <span>{idx + 1}</span>
                      </div>
                    </td>
                    <td className={cn('px-2.5 py-1 font-bold text-zinc-900 whitespace-nowrap sticky left-8 z-10 border-r border-zinc-100 align-middle', isSelected ? 'bg-emerald-100' : 'bg-white')}>
                      {[m.oldPropertyNo || m.propertyNo, m.flatOrShopNo].filter(Boolean).join(' / ') || '-'}
                    </td>
                    <td className="px-2.5 py-1 text-emerald-700 font-semibold whitespace-nowrap align-middle">{[m.wing, m.floor].filter(Boolean).join(' / ') || '-'}</td>
                    <td className="px-2.5 py-1 whitespace-nowrap align-middle">{m.typeOfUse || '-'}</td>
                    <td className="px-2.5 py-1 whitespace-nowrap align-middle">{m.constructionType || '-'}</td>
                    <td className="px-2.5 py-1 text-center whitespace-nowrap align-middle">{m.constructionYear || m.oldAssessmentYear || '-'}</td>
                    <td className="px-2.5 py-1 text-right font-mono whitespace-nowrap align-middle">{m.builtupASqFt ?? m.constructionArea ?? m.carpetASqFt ?? '-'}</td>
                    <td className="px-2.5 py-1 text-right font-mono font-bold text-emerald-800 whitespace-nowrap align-middle">{m.rateableValue != null ? `₹${Number(m.rateableValue).toLocaleString()}` : '-'}</td>
                    <td className="px-2.5 py-1 text-right font-mono font-bold text-emerald-950 whitespace-nowrap align-middle">{m.totalTax != null ? `₹${Number(m.totalTax).toLocaleString()}` : '-'}</td>
                    <td className="px-2.5 py-1 truncate max-w-[120px] whitespace-nowrap align-middle" title={m.ownerName || m.ownerNameEnglish || '-'}>{m.ownerName || m.ownerNameEnglish || '-'}</td>
                  </tr>

                  {isSelected && (
                    <tr className="border-b transition-all bg-emerald-50/60 border-emerald-200">
                      <td colSpan={10} className="p-1.5 align-middle">
                        <div className="sticky left-1 max-w-[calc(100vw-120px)] w-fit">
                          <SelectedPropertyTaxBreakdown
                            selectedPropId={m.id}
                            loadingRv={false}
                            rvTaxes={oldHeads}
                            rvTotal={m.totalTax ?? null}
                            propertyLabel={propertyLabel}
                            variant="existing"
                            fallbackTax={m.totalTax}
                            onClose={() => setSelectedPropId(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {loadingMore && (
          <div className="py-1.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 bg-slate-50 border-t border-zinc-100">
            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
            <span>Loading more records...</span>
          </div>
        )}
      </div>
    </div>
  );
};
