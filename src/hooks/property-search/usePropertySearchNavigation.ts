"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type {
  PropertyStatus,
  SearchCriteria,
  SearchTab,
  UsePropertySearchNavigationProps,
} from "@/types/property-search.types";
import {
  applyTabSearchCriteria,
  clearTabFieldsFromParams,
  NON_PERSISTED_CRITERIA_FIELDS,
} from "@/components/modules/property-tax/search-property/search-field-groups";

/**
 * Hook for managing URL-based navigation and state updates.
 * All Property Search state lives in the URL; this hook mutates it.
 */
export function usePropertySearchNavigation({
  startTransition,
}: UsePropertySearchNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();

  /**
   * Build a URL with only the keys we want, dropping empty values.
   */
  const buildUrl = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(currentParams.toString());
      mutator(next);

      // Drop empty values to keep the URL tidy
      const cleaned = new URLSearchParams();
      next.forEach((value, key) => {
        if (value.trim() !== "") {
          cleaned.set(key, value);
        }
      });

      const qs = cleaned.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [currentParams, pathname]
  );

  /**
   * Navigate to a new URL with transition
   */
  const navigateTo = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url);
        router.refresh();
      });
    },
    [router, startTransition]
  );

  /**
   * Update search criteria in URL
   */
  const updateSearchCriteria = useCallback(
    (
      criteria: SearchCriteria,
      tab: SearchTab,
      status: PropertyStatus | null = null
    ) => {
      const tabCriteria = applyTabSearchCriteria(criteria, tab);
      const url = buildUrl((params) => {
        clearTabFieldsFromParams(params, tab);

        (Object.keys(tabCriteria) as Array<keyof SearchCriteria>).forEach((key) => {
          if (NON_PERSISTED_CRITERIA_FIELDS.has(key)) {
            params.delete(key);
            return;
          }

          const value = tabCriteria[key];
          if (key === "zoneId" || key === "wardId") {
            if (typeof value === "number" && value > 0) {
              params.set(key, String(value));
            } else {
              params.delete(key);
            }
            return;
          }

          if (typeof value === "string" && value.trim() !== "") {
            params.set(key, value);
          } else {
            params.delete(key);
          }
        });

        if (tab === "quick-search") {
          params.delete("tab");
        } else {
          params.set("tab", tab);
        }

        if (status) {
          params.set("status", status);
        } else {
          params.delete("status");
        }

        params.set("isActive", "1");
      });
      navigateTo(url);
    },
    [buildUrl, navigateTo]
  );

  /**
   * Reset all search parameters. Locale stays in the pathname; every query
   * param on this screen is search state, so we drop the entire query string.
   */
  const resetSearch = useCallback(() => {
    navigateTo(pathname);
  }, [navigateTo, pathname]);

  /**
   * Update tab selection
   */
  const updateTab = useCallback(
    (tab: SearchTab) => {
      const url = buildUrl((params) => {
        clearTabFieldsFromParams(params, tab);
        params.delete("isActive");
        params.delete("status");

        if (tab === "quick-search") {
          params.delete("tab");
        } else {
          params.set("tab", tab);
        }
      });
      navigateTo(url);
    },
    [buildUrl, navigateTo]
  );

  /**
   * Update zone and reset ward
   */
  const updateZone = useCallback(
    (zoneId: number) => {
      const url = buildUrl((params) => {
        if (zoneId > 0) {
          params.set("zoneId", String(zoneId));
        } else {
          params.delete("zoneId");
        }
        params.delete("wardId");
        params.delete("status");
      });
      navigateTo(url);
    },
    [buildUrl, navigateTo]
  );

  /**
   * Update ward selection
   */
  const updateWard = useCallback(
    (wardId: number) => {
      const url = buildUrl((params) => {
        if (wardId > 0) {
          params.set("wardId", String(wardId));
        } else {
          params.delete("wardId");
        }
        params.delete("status");
      });
      navigateTo(url);
    },
    [buildUrl, navigateTo]
  );

  /**
   * Update status filter
   */
  const updateStatus = useCallback(
    (status: string | null) => {
      const url = buildUrl((params) => {
        if (status) {
          params.set("status", status);
          params.delete("isActive");
          clearTabFieldsFromParams(params, "quick-search");
          clearTabFieldsFromParams(params, "kyc");
        } else {
          params.delete("status");
        }
      });
      navigateTo(url);
    },
    [buildUrl, navigateTo]
  );

  return {
    updateSearchCriteria,
    resetSearch,
    updateTab,
    updateZone,
    updateWard,
    updateStatus,
  };
}
