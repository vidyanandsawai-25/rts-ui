/* eslint-disable i18next/no-literal-string */
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchMappedNewPropertiesAction,
  fetchApartmentPropertyTaxDetailsRvAction,
  fetchApartmentPropertyTaxDetailsCvAction,
} from '@/app/[locale]/property-tax/ptis/apartment/action';
import { MappedNewPropertyItem } from '@/types/property-mapping';
import { Loader2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MappedPropertiesSubTable } from './MappedPropertiesSubTable';
import { TaxAmountItem } from './SelectedPropertyTaxBreakdown';
import { EmptyMappedPropertiesState } from './EmptyMappedPropertiesState';

const extractTaxList = (raw: unknown) => {
  if (!raw || typeof raw !== 'object') return { list: [] as TaxAmountItem[], total: null as number | null };
  const r = raw as Record<string, unknown>;
  const it = (r.items || r) as Record<string, unknown>;
  const list: TaxAmountItem[] = Array.isArray(it?.taxAmounts) ? it.taxAmounts as TaxAmountItem[]
    : Array.isArray(r.taxAmounts) ? r.taxAmounts as TaxAmountItem[]
    : Array.isArray(r) ? r as TaxAmountItem[] : [];

  const isTotal = (t: TaxAmountItem) => {
    const n = (t.taxName || t.taxHeadName || t.taxHeadCode || '').toLowerCase().replace(/\s+/g, '');
    return n === 'taxtotal' || n === 'total';
  };
  const regular = list.filter((t) => !isTotal(t));
  const totals = list.filter((t) => isTotal(t));
  const totalVal = typeof r.totalTax === 'number' ? r.totalTax
    : typeof it.totalTax === 'number' ? (it.totalTax as number)
    : totals[0] ? Number(totals[0].taxAmount ?? totals[0].amount ?? 0)
    : regular.length > 0 ? regular.reduce((acc, h) => acc + Number(h.taxAmount ?? h.amount ?? 0), 0) : null;

  return { list: [...regular, ...totals], total: totalVal };
};

interface MappedPropertiesExpandedRowProps {
  oldPropertyId?: number | null;
  propertyId?: number | null;
  variant?: 'survey' | 'existing';
  onViewDocument?: (guid: string, title?: string) => void;
}

export const MappedPropertiesExpandedRow: React.FC<MappedPropertiesExpandedRowProps> = ({
  oldPropertyId,
  propertyId,
  variant = 'survey',
  onViewDocument,
}) => {
  const isExisting = variant === 'existing';
  const [loading, setLoading] = useState(() => Boolean(oldPropertyId && oldPropertyId > 0));
  const [items, setItems] = useState<MappedNewPropertyItem[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number | null>(null);
  const [loadingTax, setLoadingTax] = useState(false);
  const [rvTaxes, setRvTaxes] = useState<TaxAmountItem[]>([]);
  const [rvTotal, setRvTotal] = useState<number | null>(null);
  const [cvTaxes, setCvTaxes] = useState<TaxAmountItem[]>([]);
  const [cvTotal, setCvTotal] = useState<number | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const requestGenRef = useRef(0);

  useEffect(() => {
    return () => {
      requestGenRef.current += 1;
    };
  }, []);

  const handleSelectProperty = useCallback((id: number) => {
    if (selectedPropId === id) {
      setSelectedPropId(null);
      requestGenRef.current += 1;
      setLoadingTax(false);
      return;
    }
    setSelectedPropId(id);
    setLoadingTax(true);
    setRvTaxes([]);
    setRvTotal(null);
    setCvTaxes([]);
    setCvTotal(null);

    const currentGen = ++requestGenRef.current;

    Promise.all([
      fetchApartmentPropertyTaxDetailsRvAction(id).catch(() => null),
      fetchApartmentPropertyTaxDetailsCvAction(id).catch(() => null),
    ])
      .then(([rvRes, cvRes]) => {
        if (requestGenRef.current !== currentGen) return;
        if (rvRes?.success && rvRes.data) {
          const { list, total } = extractTaxList(rvRes.data);
          setRvTaxes(list);
          setRvTotal(total);
        }
        if (cvRes?.success && cvRes.data) {
          const { list, total } = extractTaxList(cvRes.data);
          setCvTaxes(list);
          setCvTotal(total);
        }
      })
      .finally(() => {
        if (requestGenRef.current === currentGen) {
          setLoadingTax(false);
        }
      });
  }, [selectedPropId]);

  useEffect(() => {
    if (!oldPropertyId || oldPropertyId <= 0) return;
    let isMounted = true;

    fetchMappedNewPropertiesAction({ oldPropertyId, pageNumber: 1, pageSize: 25 })
      .then((res) => {
        if (!isMounted) return;
        const data = res.success ? res.data : null;
        setItems(data?.items || []);
        setTotalCount(data?.totalCount || data?.items?.length || 0);
        setHasNext(Boolean(data?.hasNext || (data?.totalCount && data.totalCount > 25)));
        setPageNumber(1);
      })
      .catch(() => { if (isMounted) setItems([]); })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [oldPropertyId]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && hasNext && !loadingMoreRef.current && oldPropertyId) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      const nextPage = pageNumber + 1;

      fetchMappedNewPropertiesAction({ oldPropertyId, pageNumber: nextPage, pageSize: 25 })
        .then((res) => {
          if (res.success && res.data?.items?.length) {
            setItems((prev) => [...prev, ...(res.data?.items || [])]);
            setPageNumber(nextPage);
            setHasNext(Boolean(res.data.hasNext));
          } else {
            setHasNext(false);
          }
        })
        .catch(() => setHasNext(false))
        .finally(() => {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        });
    }
  }, [hasNext, oldPropertyId, pageNumber]);

  if (!oldPropertyId || oldPropertyId <= 0) {
    return (
      <EmptyMappedPropertiesState
        message={
          propertyId
            ? `No mapped old properties found for New Property #${propertyId}`
            : 'No Old Property ID associated with this unit.'
        }
        theme={isExisting ? 'emerald' : 'sky'}
      />
    );
  }

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 text-xs font-sans rounded-md border shadow-2xs sticky left-1 w-fit',
          isExisting ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-sky-50/80 border-sky-200 text-sky-900'
        )}
      >
        <Loader2 className={cn('w-3.5 h-3.5 animate-spin', isExisting ? 'text-emerald-600' : 'text-blue-600')} />
        <span>Loading mapped properties for Old Property #{oldPropertyId}...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyMappedPropertiesState
        message={
          propertyId
            ? `No mapped old properties found for New Property #${propertyId}`
            : `No mapped new properties found for Old Property #${oldPropertyId}`
        }
        theme={isExisting ? 'emerald' : 'sky'}
      />
    );
  }

  return (
    <div
      className={cn(
        'p-2 rounded-lg border text-xs font-sans shadow-2xs space-y-1.5 select-none w-full max-w-[calc(100vw-100px)] sticky left-1',
        isExisting ? 'bg-emerald-50/50 border-emerald-200' : 'bg-sky-50/50 border-sky-200'
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <div className={cn('flex items-center gap-1.5 font-bold text-[11px]', isExisting ? 'text-emerald-950' : 'text-sky-950')}>
          <Building2 className={cn('w-3.5 h-3.5', isExisting ? 'text-emerald-700' : 'text-sky-700')} />
          <span>Mapped New Properties ({items.length}{totalCount > items.length ? ` of ${totalCount}` : ''})</span>
          <span className="text-[10px] font-normal text-zinc-500 font-mono">(Old #{oldPropertyId})</span>
        </div>
        <span className="text-[10px] text-zinc-400 italic">Scroll horizontally/vertically to browse all records • Click row to show tax</span>
      </div>

      <MappedPropertiesSubTable
        items={items}
        selectedPropId={selectedPropId}
        onSelectProperty={handleSelectProperty}
        onScroll={handleScroll}
        isLoadingMore={loadingMore}
        variant={variant}
        onViewDocument={onViewDocument}
        loadingTax={loadingTax}
        rvTaxes={rvTaxes}
        rvTotal={rvTotal}
        cvTaxes={cvTaxes}
        cvTotal={cvTotal}
      />
    </div>
  );
};

