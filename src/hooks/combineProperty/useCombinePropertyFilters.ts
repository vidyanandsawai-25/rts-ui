import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CombinePropertyItem } from '@/types/combine-property.types';

export type SelectionMethod = 'range' | 'individual';

export function useCombinePropertyFilters(
  basePropertyList: CombinePropertyItem[],
  subPropertyList: CombinePropertyItem[],
  t: (key: string, values?: Record<string, string | number>) => string,
  onClearReview: () => void
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rangeFrom = searchParams.get('from') ?? '';
  const rangeTo = searchParams.get('to') ?? '';
  const selectedProperties = useMemo(
    () => searchParams.get('individual')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );
  const selectionMethod = (searchParams.get('method') as SelectionMethod) ?? 'range';

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([k, v]) => {
        if (v === undefined || v === '') next.delete(k);
        else next.set(k, v);
      });
      return `${pathname}?${next.toString()}`;
    },
    [pathname, searchParams]
  );

  const calculatePropertyParams = useCallback(
    (method: SelectionMethod, from: string, to: string, individual: string[]) => {
      let slice: CombinePropertyItem[] = [];
      if (method === 'range' && from && to) {
        const fromIdx = subPropertyList.findIndex((i) => String(i.id) === from);
        const toIdx = subPropertyList.findIndex((i) => String(i.id) === to);
        if (fromIdx !== -1 && toIdx !== -1) {
          const start = Math.min(fromIdx, toIdx);
          const end = Math.max(fromIdx, toIdx);
          slice = subPropertyList.slice(start, end + 1);
        }
      } else if (method === 'individual' && individual.length > 0) {
        slice = subPropertyList.filter((i) => individual.includes(String(i.id)));
      }
      const partitionNos = Array.from(new Set(slice.map((i) => i.fromProperty || '0'))).join(',');
      const propertyNos = Array.from(new Set(slice.map((i) => i.propertyNo).filter(Boolean))).join(',');
      return { partitionNos, propertyNos };
    },
    [subPropertyList]
  );

  const handleBasePropertyChange = (_name: string, value: string) => {
    const selected = basePropertyList.find((item) => String(item.id) === value);
    if (!selected) return;
    onClearReview();
    router.push(
      buildUrl({
        basePropertyId: String(selected.id),
        wardId: String(selected.wardId),
        wardNo: selected.wardNo,
        propertyNo: selected.propertyNo,
        from: undefined,
        to: undefined,
        individual: undefined,
      })
    );
  };

  const handleMethodChange = (method: SelectionMethod) => {
    onClearReview();
    router.push(buildUrl({ method, from: undefined, to: undefined, individual: undefined }));
  };

  const handleRangeFromChange = (_name: string, value: string) => {
    onClearReview();
    if (rangeTo) {
      const fromIdx = subPropertyList.findIndex((i) => String(i.id) === value);
      const toIdx = subPropertyList.findIndex((i) => String(i.id) === rangeTo);
      if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
        toast.error(t('rangeInvalidError'));
      }
    }
    const params = calculatePropertyParams('range', value, rangeTo, []);
    router.replace(buildUrl({ from: value, partitionNo: params.partitionNos, propertyNos: params.propertyNos }), { scroll: false });
  };

  const handleRangeToChange = (_name: string, value: string) => {
    onClearReview();
    if (rangeFrom) {
      const fromIdx = subPropertyList.findIndex((i) => String(i.id) === rangeFrom);
      const toIdx = subPropertyList.findIndex((i) => String(i.id) === value);
      if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
        toast.error(t('rangeInvalidError'));
      }
    }
    const params = calculatePropertyParams('range', rangeFrom, value, []);
    router.replace(buildUrl({ to: value, partitionNo: params.partitionNos, propertyNos: params.propertyNos }), { scroll: false });
  };

  const handleIndividualChange = (values: string[]) => {
    onClearReview();
    const params = calculatePropertyParams('individual', '', '', values);
    router.replace(buildUrl({ individual: values.join(','), partitionNo: params.partitionNos, propertyNos: params.propertyNos }), { scroll: false });
  };

  const clearFilters = () => {
    router.push(
      buildUrl({
        basePropertyId: undefined,
        wardId: undefined,
        wardNo: undefined,
        propertyNo: undefined,
        from: undefined,
        to: undefined,
        individual: undefined,
        rangeFromPartition: undefined,
        rangeToPartition: undefined,
        partitionNo: undefined,
        propertyNos: undefined,
      })
    );
  };

  const selectedCount = useMemo(() => {
    if (selectionMethod === 'individual') return selectedProperties.length;
    if (selectionMethod === 'range' && rangeFrom && rangeTo) {
      const fromIdx = subPropertyList.findIndex((i) => String(i.id) === rangeFrom);
      const toIdx = subPropertyList.findIndex((i) => String(i.id) === rangeTo);
      if (fromIdx === -1 || toIdx === -1) return 0;
      return Math.abs(toIdx - fromIdx) + 1;
    }
    return 0;
  }, [selectionMethod, selectedProperties, rangeFrom, rangeTo, subPropertyList]);

  const isRangeInvalid = useMemo(() => {
    if (selectionMethod !== 'range' || !rangeFrom || !rangeTo) return false;
    const fromIdx = subPropertyList.findIndex((i) => String(i.id) === rangeFrom);
    const toIdx = subPropertyList.findIndex((i) => String(i.id) === rangeTo);
    return fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx;
  }, [selectionMethod, rangeFrom, rangeTo, subPropertyList]);

  return {
    rangeFrom,
    rangeTo,
    selectedProperties,
    selectionMethod,
    selectedCount,
    isRangeInvalid,
    handleBasePropertyChange,
    handleMethodChange,
    handleRangeFromChange,
    handleRangeToChange,
    handleIndividualChange,
    clearFilters,
    searchParams,
    router
  };
}
