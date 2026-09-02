import { useCallback, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CombinePropertyItem } from '@/types/combine-property.types';
import { comparePropertyNo } from '@/hooks/taxZoningRange/useTaxZoningRange';

export type SelectionMethod = 'range' | 'individual';

/** Two-level natural sort — PropertyNo first, then partition (fromProperty) — mirroring the
 *  backend's `OrderBy(PropertyNo, NaturalStringComparer).ThenBy(PartitionNo, NaturalStringComparer)`.
 *  Sorting by partition alone (the previous behavior) put un-partitioned properties like "13"
 *  ahead of partitioned ones like "12-1" regardless of the actual property number, since an empty
 *  partition string sorts before any non-empty one. */
export function compareSubProperty(a: CombinePropertyItem, b: CombinePropertyItem): number {
  const byPropertyNo = comparePropertyNo(a.propertyNo || '', b.propertyNo || '');
  if (byPropertyNo !== 0) return byPropertyNo;
  return comparePropertyNo(a.fromProperty || '', b.fromProperty || '');
}

export function useCombinePropertyFilters(
  basePropertyList: CombinePropertyItem[],
  subPropertyList: CombinePropertyItem[],
  t: (key: string, values?: Record<string, string | number>) => string,
  onClearReview: () => void
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for individual selections to avoid URL length limits (404 errors)
  const [individualSelection, setIndividualSelection] = useState<string[]>(() => {
    return searchParams.get('individual')?.split(',').filter(Boolean) ?? [];
  });

  const rangeFrom = searchParams.get('from') ?? '';
  const rangeTo = searchParams.get('to') ?? '';
  const selectionMethod = (searchParams.get('method') as SelectionMethod) ?? 'range';

  // Keep individual selection in sync if it changes from URL (e.g. initial load or back button)
  const urlIndividual = searchParams.get('individual');
  const [prevIndividual, setPrevIndividual] = useState<string | null>(urlIndividual);

  if (urlIndividual !== prevIndividual) {
    setPrevIndividual(urlIndividual);
    if (urlIndividual) {
      setIndividualSelection(urlIndividual.split(',').filter(Boolean));
    }
  }

  const selectedProperties = useMemo(() => {
    return individualSelection.filter(id => subPropertyList.some(p => String(p.id) === id));
  }, [individualSelection, subPropertyList]);

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

  const computedParams = useMemo(() => {
    const sortedSubPropertyList = [...subPropertyList].sort(compareSubProperty);
    let slice: CombinePropertyItem[] = [];
    if (selectionMethod === 'range' && rangeFrom && rangeTo) {
      const fromIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeFrom);
      const toIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeTo);
      if (fromIdx !== -1 && toIdx !== -1) {
        const start = Math.min(fromIdx, toIdx);
        const end = Math.max(fromIdx, toIdx);
        slice = sortedSubPropertyList.slice(start, end + 1);
      }
    } else if (selectionMethod === 'individual' && individualSelection.length > 0) {
      slice = sortedSubPropertyList.filter((i) => individualSelection.includes(String(i.id)));
    }
    const partitionNos = Array.from(new Set(slice.map((i) => i.fromProperty || '0'))).join(',');
    const propertyNosArray = Array.from(new Set(slice.map((i) => i.propertyNo).filter(Boolean))).join(',');
    return { partitionNos, propertyNos: propertyNosArray };
  }, [subPropertyList, selectionMethod, rangeFrom, rangeTo, individualSelection]);

  const handleBasePropertyChange = (_name: string, value: string) => {
    const selected = basePropertyList.find((item) => String(item.id) === value);
    if (!selected) return;

    // Extract alphabetical prefix from partition number (e.g. "A1" -> "A", "B2" -> "B")
    const partitionChar = selected.fromProperty ? selected.fromProperty.replace(/[^A-Za-z]/g, '') : undefined;

    onClearReview();
    setIndividualSelection([]);
    router.push(
      buildUrl({
        basePropertyId: String(selected.id),
        wardId: String(selected.wardId),
        wardNo: selected.wardNo,
        propertyNo: selected.propertyNo,
        categoryId: selected.categoryId ? String(selected.categoryId) : undefined,
        societyDetailId: selected.societyDetailId ? String(selected.societyDetailId) : undefined,
        basePartitionNo: partitionChar,
        from: undefined,
        to: undefined,
        individual: undefined,
        combinePartitionNo: undefined,
        propertyNos: undefined,
        showHistory: undefined,
      })
    );
  };

  const handleMethodChange = (method: SelectionMethod) => {
    onClearReview();
    setIndividualSelection([]);
    router.push(
      buildUrl({
        method,
        from: undefined,
        to: undefined,
        individual: undefined,
        combinePartitionNo: undefined,
        propertyNos: undefined,
        showHistory: undefined
      })
    );
  };

  const handleRangeFromChange = (_name: string, value: string) => {
    onClearReview();
    if (rangeTo) {
      const sortedSubPropertyList = [...subPropertyList].sort(compareSubProperty);
      const fromIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === value);
      const toIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeTo);
      if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
        toast.error(t('rangeInvalidError'));
      }
    }
    // We only update the small search params in URL to prevent URL length limits
    router.replace(
      buildUrl({
        from: value,
        showHistory: 'false',
        combinePartitionNo: undefined,
        propertyNos: undefined,
        individual: undefined
      }),
      { scroll: false }
    );
  };

  const handleRangeToChange = (_name: string, value: string) => {
    onClearReview();
    if (rangeFrom) {
      const sortedSubPropertyList = [...subPropertyList].sort(compareSubProperty);
      const fromIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeFrom);
      const toIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === value);
      if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
        toast.error(t('rangeInvalidError'));
      }
    }
    router.replace(
      buildUrl({
        to: value,
        showHistory: 'false',
        combinePartitionNo: undefined,
        propertyNos: undefined,
        individual: undefined
      }),
      { scroll: false }
    );
  };

  const handleIndividualChange = (values: string[]) => {
    onClearReview();
    setIndividualSelection(values);
    // Remove large query parameters from the URL to prevent 404 errors
    router.replace(
      buildUrl({
        individual: undefined,
        combinePartitionNo: undefined,
        propertyNos: undefined,
        showHistory: 'false'
      }),
      { scroll: false }
    );
  };

  const clearFilters = () => {
    setIndividualSelection([]);
    router.push(
      buildUrl({
        from: undefined,
        to: undefined,
        individual: undefined,
        rangeFromPartition: undefined,
        rangeToPartition: undefined,
        combinePartitionNo: undefined,
        propertyNos: undefined,
        showHistory: undefined,
      })
    );
  };

  const selectedCount = useMemo(() => {
    if (selectionMethod === 'individual') return selectedProperties.length;
    if (selectionMethod === 'range' && rangeFrom && rangeTo) {
      const sortedSubPropertyList = [...subPropertyList].sort(compareSubProperty);
      const fromIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeFrom);
      const toIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeTo);
      if (fromIdx === -1 || toIdx === -1) return 0;
      return Math.abs(toIdx - fromIdx) + 1;
    }
    return 0;
  }, [selectionMethod, selectedProperties, rangeFrom, rangeTo, subPropertyList]);

  const isRangeInvalid = useMemo(() => {
    if (selectionMethod !== 'range' || !rangeFrom || !rangeTo) return false;
    const sortedSubPropertyList = [...subPropertyList].sort(compareSubProperty);
    const fromIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeFrom);
    const toIdx = sortedSubPropertyList.findIndex((i) => String(i.id) === rangeTo);
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
    router,
    computedCombinePartitionNo: computedParams.partitionNos,
    computedPropertyNos: computedParams.propertyNos,
    individualSelection
  };
}

