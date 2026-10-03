"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { useTranslations } from "next-intl";
import {
  getWardsDropdownAction,
  getApartmentQCSuggestionsAction,
  type WardDropdownOption,
  type ApartmentQcSearchSuggestionDto,
} from "@/app/[locale]/property-tax/extended-area-assesment/single-assessment/action";
import { buildWardOptions, buildPropertyNoOptions, buildPartitionOptions } from "./buildCascadingOptions";

export interface UseCascadingPropertyFiltersOptions {
  t: ReturnType<typeof useTranslations>;
  initialWardId?: string;
  initialPropertyNo?: string;
  initialPartitionNo?: string;
  initialWards?: WardDropdownOption[];
  initialProperties?: string[];
  initialPartitions?: ApartmentQcSearchSuggestionDto[];
  /** Called with the resolved UPIC/property-no once a partition is picked, so the caller can trigger its own search. */
  onPartitionResolved: (upicOrPropertyNo: string) => void;
}

/** Owns the Ward -> Property No -> Partition No cascading dropdown state (URL-synced), used by
 *  the single-assessment screen's property-identification section. */
export function useCascadingPropertyFilters({
  t,
  initialWardId = "",
  initialPropertyNo = "",
  initialPartitionNo = "",
  initialWards = [],
  initialProperties = [],
  initialPartitions = [],
  onPartitionResolved,
}: UseCascadingPropertyFiltersOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [wards, setWards] = useState<WardDropdownOption[]>(initialWards);
  const [selectedWardId, setSelectedWardId] = useState<string>(initialWardId || searchParams.get("wardId") || "");
  const [isLoadingWards, setIsLoadingWards] = useState<boolean>(false);

  const [propertyNoList, setPropertyNoList] = useState<string[]>(initialProperties);
  const [selectedPropertyNo, setSelectedPropertyNo] = useState<string>(initialPropertyNo || searchParams.get("propertyNo") || "");
  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(false);

  const [partitionSuggestions, setPartitionSuggestions] = useState<ApartmentQcSearchSuggestionDto[]>(initialPartitions);
  const [selectedPartitionNo, setSelectedPartitionNo] = useState<string>(initialPartitionNo || searchParams.get("partitionNo") || "");
  const [isLoadingPartitions, setIsLoadingPartitions] = useState<boolean>(false);

  // Sync props from server navigation / searchParams updates
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialWards && initialWards.length > 0) setWards(initialWards);
    if (initialWardId) setSelectedWardId(initialWardId);
    if (initialPropertyNo) setSelectedPropertyNo(initialPropertyNo);
    if (initialPartitionNo) setSelectedPartitionNo(initialPartitionNo);
    if (initialProperties && initialProperties.length > 0) setPropertyNoList(initialProperties);
    if (initialPartitions && initialPartitions.length > 0) setPartitionSuggestions(initialPartitions);
  }, [initialWards, initialWardId, initialPropertyNo, initialPartitionNo, initialProperties, initialPartitions]);

  // Fallback Wards fetch if initialWards was empty
  useEffect(() => {
    if (wards.length === 0) {
      let isMounted = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingWards(true);
      getWardsDropdownAction()
        .then((res) => {
          if (isMounted && res.success && res.data) {
            setWards(res.data);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingWards(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [wards.length]);

  /** Applies `updates` (null deletes the param) to the current query string and navigates to it. */
  const pushQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleWardChange = async (wardIdStr: string) => {
    setSelectedWardId(wardIdStr);
    setSelectedPropertyNo("");
    setPropertyNoList([]);
    setSelectedPartitionNo("");
    setPartitionSuggestions([]);

    pushQueryParams({ wardId: wardIdStr || null, propertyNo: null, partitionNo: null, upic: null });

    if (!wardIdStr) return;
    const wardIdNum = Number(wardIdStr);
    if (!wardIdNum) return;

    setIsLoadingProperties(true);
    try {
      const res = await getApartmentQCSuggestionsAction(wardIdNum);
      if (res.success && res.data) {
        const uniquePropNos = Array.from(
          new Set(
            res.data
              .map((item) => item.propertyNo?.trim())
              .filter((p): p is string => Boolean(p))
          )
        );
        setPropertyNoList(uniquePropNos);
      }
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handlePropertyNoChange = async (propNo: string) => {
    setSelectedPropertyNo(propNo);
    setSelectedPartitionNo("");
    setPartitionSuggestions([]);

    pushQueryParams({ propertyNo: propNo || null, partitionNo: null, upic: null });

    if (!selectedWardId || !propNo) return;
    const wardIdNum = Number(selectedWardId);

    setIsLoadingPartitions(true);
    try {
      const res = await getApartmentQCSuggestionsAction(wardIdNum, propNo);
      if (res.success && res.data) {
        setPartitionSuggestions(res.data);
      }
    } finally {
      setIsLoadingPartitions(false);
    }
  };

  const handlePartitionChange = (val: string) => {
    setSelectedPartitionNo(val);

    const matched = partitionSuggestions.find(
      (s) =>
        s.partitionNo === val ||
        s.upicId === val ||
        s.displayLabel === val ||
        String(s.propertyId) === val
    );

    const targetUpicOrPropNo = matched?.upicId || matched?.propertyNo || matched?.displayLabel || val;

    // upic is only ever SET here, never deleted — omitted from the update when there's nothing to set.
    pushQueryParams({ partitionNo: val || null, ...(targetUpicOrPropNo ? { upic: targetUpicOrPropNo } : {}) });

    if (targetUpicOrPropNo) {
      onPartitionResolved(targetUpicOrPropNo);
    }
  };

  const wardOptions = buildWardOptions(wards, isLoadingWards, t);
  const propertyNoOptions = buildPropertyNoOptions(propertyNoList, selectedWardId, isLoadingProperties, t);
  const partitionOptions = buildPartitionOptions(partitionSuggestions, selectedPropertyNo, isLoadingPartitions, t);

  return {
    selectedWardId,
    isLoadingWards,
    selectedPropertyNo,
    isLoadingProperties,
    selectedPartitionNo,
    isLoadingPartitions,
    wardOptions,
    propertyNoOptions,
    partitionOptions,
    handleWardChange,
    handlePropertyNoChange,
    handlePartitionChange,
  };
}

export type UseCascadingPropertyFilters = ReturnType<typeof useCascadingPropertyFilters>;
