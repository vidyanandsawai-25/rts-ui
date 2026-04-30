import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { normalizePartition } from '@/lib/utils/format';
import type { SearchSelectOption } from '@/components/common/SearchSelect';
import type { PropertyListItem } from '@/types/ptis.types';

/** Separator used in composite option-value keys to prevent key collisions. */
const COMPOSITE_KEY_SEP = '::' as const;

/**
 * The decoded payload stored behind each partition option's composite key.
 * Replaces the previous JSON.stringify/JSON.parse pattern.
 */
export interface PartitionOptionValue {
  partitionNo: string;
  propertyId: number;
}

/**
 * The decoded payload stored behind each property option's composite key.
 * Replaces the previous JSON.stringify/JSON.parse pattern.
 */
export interface PropertyOptionValue {
  propertyNo: string;
  partitionNo: string;
  propertyId: number;
}

/** Builds a stable composite key for a property option. */
export function buildPropertyOptionKey(propertyNo: string, partitionNo: string): string {
  return `${propertyNo}${COMPOSITE_KEY_SEP}${normalizePartition(partitionNo)}`;
}

/** Builds a stable composite key for a partition option. */
export function buildPartitionOptionKey(propertyNo: string, partitionNo: string): string {
  return `${propertyNo}${COMPOSITE_KEY_SEP}${normalizePartition(partitionNo)}`;
}

export function usePropertyOptions(
  propertyNo: string,
  initialPropertyOptions: SearchSelectOption[],
  initialRawPropertyData: PropertyListItem[]
) {
  const t = useTranslations('ptis');

  /**
   * Maps composite key → PropertyOptionValue for O(1) lookup in the component.
   * Key format: "propertyNo::normalizedPartitionNo"
   *
   * NOTE: initialPropertyOptions values are still JSON strings (produced by page.tsx SSR).
   * This map bridges the SSR format to a type-safe lookup without JSON.parse at render time.
   */
  const propertyOptionValueMap = useMemo(() => {
    const map = new Map<string, string>();
    initialPropertyOptions.forEach((o) => {
      try {
        const p = JSON.parse(o.value) as PropertyOptionValue;
        const key = buildPropertyOptionKey(p.propertyNo, p.partitionNo);
        map.set(key, o.value);
      } catch {
        // Malformed option — skip silently.
      }
    });
    return map;
  }, [initialPropertyOptions]);

  /**
   * Maps composite key → PartitionOptionValue for O(1) lookup in handlePartitionChange.
   * Eliminates the JSON.parse inside the render loop and inside the onChange handler.
   */
  const partitionValueMap = useMemo(() => {
    const map = new Map<string, PartitionOptionValue>();
    if (!propertyNo || initialRawPropertyData.length === 0) return map;

    initialRawPropertyData
      .filter((p) => p.propertyNo === propertyNo)
      .forEach((p) => {
        const normalized = normalizePartition(p.partitionNo);
        const key = buildPartitionOptionKey(p.propertyNo, normalized);
        map.set(key, { partitionNo: normalized, propertyId: p.propertyId });
      });

    return map;
  }, [propertyNo, initialRawPropertyData]);

  /** Partition options whose value is a stable composite key — no JSON serialization. */
  const partitionOptions = useMemo<SearchSelectOption[]>(() => {
    return Array.from(partitionValueMap.entries()).map(([key, data]) => ({
      label: data.partitionNo || t('search.noPartition'),
      value: key,
    }));
  }, [partitionValueMap, t]);

  return {
    propertyOptions: initialPropertyOptions,
    rawPropertyData: initialRawPropertyData,
    partitionOptions,
    partitionValueMap,
    propertyOptionValueMap,
  };
}
