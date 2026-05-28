"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  listLookupOptionsAction,
  listWardsByZoneAction,
} from "@/app/[locale]/property-tax/search-property/action";
import type { WardApiResponse } from "@/types/property-search-api.types";
import type {
  LookupOptions,
  WardOption,
} from "@/types/property-search.types";

const EMPTY_LOOKUP: LookupOptions = {
  propertyNos: [],
  oldPropertyNos: [],
  upicIds: [],
  csns: [],
  subZoneNos: [],
};

function mapWardOptions(wards: WardApiResponse[], zoneId: number): WardOption[] {
  return wards
    .filter((w) => w.zoneId === zoneId)
    .map((w) => ({
      id: w.wardId,
      label: w.description?.trim() ? w.description : w.wardNo,
      zoneId: w.zoneId,
    }));
}

function mapLookupOptions(lookup: {
  propertyNos: string[];
  oldPropertyNos: string[];
  upicIds: string[];
  csns: string[];
  subZoneNos: string[];
}): LookupOptions {
  return {
    propertyNos: lookup.propertyNos,
    oldPropertyNos: lookup.oldPropertyNos,
    upicIds: lookup.upicIds,
    csns: lookup.csns,
    subZoneNos: lookup.subZoneNos,
  };
}

export interface UsePropertySearchDependentOptionsProps {
  zoneId: number;
  wardId: number;
  initialWardOptions: WardOption[];
  initialLookupOptions: LookupOptions;
}

type FetchedWards = {
  zoneId: number;
  options: WardOption[];
  initialKey: string;
};

type FetchedLookup = {
  zoneId: number;
  wardId: number;
  options: LookupOptions;
  initialKey: string;
};

/**
 * Loads ward and quick-search lookup options when zone/ward change in the form.
 * Avoids URL navigation on every dropdown change (table stays stable until Search).
 */
export function usePropertySearchDependentOptions({
  zoneId,
  wardId,
  initialWardOptions,
  initialLookupOptions,
}: UsePropertySearchDependentOptionsProps) {
  const [fetchedWards, setFetchedWards] = useState<FetchedWards | null>(null);
  const [fetchedLookup, setFetchedLookup] = useState<FetchedLookup | null>(null);
  const skipZoneFetchRef = useRef(true);
  const skipLookupFetchRef = useRef(true);
  const initialWardKey = useMemo(
    () => JSON.stringify(initialWardOptions),
    [initialWardOptions]
  );
  const initialLookupKey = useMemo(
    () => JSON.stringify(initialLookupOptions),
    [initialLookupOptions]
  );

  const wardOptions =
    zoneId <= 0
      ? []
      : fetchedWards?.zoneId === zoneId &&
          fetchedWards.initialKey === initialWardKey
        ? fetchedWards.options
        : initialWardOptions;

  const lookupOptions =
    zoneId <= 0
      ? EMPTY_LOOKUP
      : fetchedLookup?.zoneId === zoneId &&
          fetchedLookup.wardId === wardId &&
          fetchedLookup.initialKey === initialLookupKey
        ? fetchedLookup.options
        : initialLookupOptions;

  useEffect(() => {
    if (skipZoneFetchRef.current) {
      skipZoneFetchRef.current = false;
      return;
    }
    if (zoneId <= 0) return;

    let cancelled = false;

    void (async () => {
      try {
        const wards = await listWardsByZoneAction(zoneId);
        if (!cancelled) {
          setFetchedWards({
            zoneId,
            options: mapWardOptions(wards, zoneId),
            initialKey: initialWardKey,
          });
        }
      } catch {
        if (!cancelled) {
          setFetchedWards({
            zoneId,
            options: [],
            initialKey: initialWardKey,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialWardKey, zoneId]);

  useEffect(() => {
    if (skipLookupFetchRef.current) {
      skipLookupFetchRef.current = false;
      return;
    }
    if (zoneId <= 0) return;

    let cancelled = false;

    void (async () => {
      try {
        const lookup = await listLookupOptionsAction(
          zoneId,
          wardId > 0 ? wardId : null
        );
        if (!cancelled) {
          setFetchedLookup({
            zoneId,
            wardId,
            options: mapLookupOptions(lookup),
            initialKey: initialLookupKey,
          });
        }
      } catch {
        if (!cancelled) {
          setFetchedLookup({
            zoneId,
            wardId,
            options: EMPTY_LOOKUP,
            initialKey: initialLookupKey,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialLookupKey, wardId, zoneId]);

  return { wardOptions, lookupOptions };
}
