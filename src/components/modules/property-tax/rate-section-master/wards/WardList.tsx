"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WardListProps } from "@/types/rateSectionMaster.types";
import { useConfirm } from "@/components/common";
import { useTranslations } from "next-intl";
import { TEXT_SANITIZE } from "@/lib/utils/validation";
import WardTable from "./WardTable";
import WardListHeader from "./WardListHeader";
import { handleWardDelete, handleWardEdit } from "./wardHandlers";
import { useWardData } from "@/hooks/rateSectionMaster/useWardData";
import { useWardRateSectionLabel } from "@/hooks/rateSectionMaster/useWardRateSectionLabel";

const sanitizeSearch = (value: string) => value.replace(TEXT_SANITIZE, '');

export default function WardList({
  rates = [],
  sections = [],
  sectionsTotalCount = 0,
  selectedRateSection: propSelectedRateSection,
  selectedRateSectionLabel: propSelectedRateSectionLabel,
  onWardsChanged,
}: WardListProps) {
  const t = useTranslations("rateSectionMaster");
  const router = useRouter();
  const { confirm } = useConfirm();
  const searchParams = useSearchParams();

  const rateSectionFromUrl = searchParams.get("zone");
  const selectedRateSection = rateSectionFromUrl || propSelectedRateSection;
  const pageNumber = Number(searchParams?.get("wardpage")) || 1;
  const pageSize = Number(searchParams?.get("wardpagesize")) || 10;
  const initialSearch = searchParams?.get("wardq") || "";
  const [search, setSearch] = useState(sanitizeSearch(initialSearch));

  const { rateSectionLabel, effectiveSelectedRateSection } = useWardRateSectionLabel({
    selectedRateSection,
    propSelectedRateSectionLabel,
    rates,
    sections
  });

  const {
    paginatedWards,
    totalCount,
    totalPages,
    effectivePageNumber,
    effectivePageSize,
    setDeletedIds
  } = useWardData({
    sections,
    sectionsTotalCount,
    search,
    pageNumber,
    pageSize
  });

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("wardpage", page.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("wardpagesize", newSize.toString());
      params.set("wardpage", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (value: string) => {
      const sanitizedValue = sanitizeSearch(value);
      setSearch(sanitizedValue);
      const params = new URLSearchParams(searchParams.toString());
      params.set("wardpage", "1");
      const trimmed = sanitizedValue.trim();
      if (trimmed) {
        params.set("wardq", trimmed);
      } else {
        params.delete("wardq");
      }
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleAddWard = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("addWard", "");
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <div className="flex flex-col h-full">
      <WardListHeader
        title={t('wards.title')}
        effectiveSelectedRateSection={effectiveSelectedRateSection}
        rateSectionLabel={rateSectionLabel}
        selectRateSectionText={t("wards.selectRateSection")}
        totalCount={totalCount}
        totalWardsLabel={t('list.totalWards')}
        search={search}
        searchPlaceholder={t('wards.searchWardNo')}
        linkWardLabel={t('wards.linkWard')}
        onSearch={handleSearch}
        onAddWard={handleAddWard}
      />

      <div className="flex-1 px-4 pb-4">
        {!effectiveSelectedRateSection ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t('wards.selectRateSectionToView')}
          </div>
        ) : (
          <WardTable
            data={paginatedWards}
            pageNumber={effectivePageNumber}
            pageSize={effectivePageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onEdit={(row) => handleWardEdit({ row, searchParams, router })}
            onDelete={(row) => handleWardDelete({
              row,
              rateSectionLabel,
              effectiveSelectedRateSection,
              confirm,
              setDeletedIds,
              onWardsChanged,
              t
            })}
            emptyText={t('wards.noWardsFound')}
          />
        )}
      </div>
    </div>
  );
}

