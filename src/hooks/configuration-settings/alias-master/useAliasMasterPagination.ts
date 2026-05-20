"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { SupportedLanguageCode } from "@/types/alias-master.types";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/app/[locale]/configuration-settings/alias-master/page";

interface UseAliasMasterPaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  locale: string;
  resource?: string;
  languages: SupportedLanguageCode[];
  autoTranslate: boolean;
  startTransition: (callback: () => void) => void;
}

const ROUTE_BASE = "configuration-settings/alias-master";

export function useAliasMasterPagination({
  pageNumber,
  pageSize,
  totalCount,
  locale,
  resource,
  languages,
  autoTranslate,
  startTransition,
}: UseAliasMasterPaginationProps) {
  const router = useRouter();

  const buildUrl = useCallback(
    (
      page: number,
      size: number,
      nextResource?: string,
      nextLanguages?: SupportedLanguageCode[],
      nextAutoTranslate?: boolean
    ) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));

      const effectiveResource = nextResource ?? resource;
      if (effectiveResource) {
        params.set("resource", effectiveResource);
      }

      const effectiveLanguages = nextLanguages ?? languages;
      for (const lang of effectiveLanguages) {
        params.append("languages", lang);
      }

      const effectiveAutoTranslate = nextAutoTranslate ?? autoTranslate;
      if (effectiveAutoTranslate) {
        params.set("autoTranslate", "true");
      }

      return `/${locale}/${ROUTE_BASE}?${params.toString()}`;
    },
    [locale, resource, languages, autoTranslate]
  );

  const changePage = useCallback(
    (p: number): void => {
      startTransition(() => {
        router.push(buildUrl(p, pageSize));
      });
    },
    [pageSize, buildUrl, router, startTransition]
  );

  const handlePageSizeChange = useCallback(
    (value: string) => {
      const next = Number(value);
      const clampedSize =
        Number.isFinite(next) && next > 0 && next <= MAX_PAGE_SIZE
          ? next
          : DEFAULT_PAGE_SIZE;
      startTransition(() => {
        router.push(buildUrl(1, clampedSize));
      });
    },
    [buildUrl, router, startTransition]
  );

  const handleResourceChange = useCallback(
    (nextResource: string) => {
      startTransition(() => {
        router.push(buildUrl(1, pageSize, nextResource, languages, autoTranslate));
      });
    },
    [buildUrl, pageSize, languages, autoTranslate, router, startTransition]
  );

  const handleLanguagesChange = useCallback(
    (nextLanguages: SupportedLanguageCode[]) => {
      startTransition(() => {
        router.push(buildUrl(1, pageSize, resource, nextLanguages, autoTranslate));
      });
    },
    [buildUrl, pageSize, resource, autoTranslate, router, startTransition]
  );

  const handleAutoTranslateChange = useCallback(
    (next: boolean) => {
      startTransition(() => {
        router.push(buildUrl(1, pageSize, resource, languages, next));
      });
    },
    [buildUrl, pageSize, resource, languages, router, startTransition]
  );

  const start = totalCount === 0 ? 0 : ((pageNumber || 1) - 1) * (pageSize || 10) + 1;
  const end = Math.min(start + (pageSize || 10) - 1, totalCount);

  return {
    buildUrl,
    changePage,
    handlePageSizeChange,
    handleResourceChange,
    handleLanguagesChange,
    handleAutoTranslateChange,
    paginationInfo: { start, end, total: totalCount || 0 },
  };
}
