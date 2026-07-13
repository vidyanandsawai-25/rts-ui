/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { getReportLookupAction } from '@/app/[locale]/property-tax/reports/action';
import type { LookupOption } from '@/types/report.types';

/**
 * Fetches options for a 'select' parameter from the generic lookup endpoint.
 * - `source` is the parameter's OptionsSource (null for non-select params → no fetch).
 * - `parentValue` is the selected value of the CascadeFromKey parameter.
 * - `hasParent` true means this is a cascading select: wait until the parent has a value,
 *   and re-fetch whenever it changes.
 */
export function useLookupOptions(source: string | null, parentValue: string | undefined, hasParent: boolean) {
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!source || (hasParent && !parentValue?.trim())) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getReportLookupAction(source, parentValue?.trim() || undefined)
      .then((opts) => {
        if (!cancelled && mountedRef.current) {
          setOptions(opts);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) {
          setOptions([]);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [source, parentValue, hasParent]);

  return { options, loading };
}
