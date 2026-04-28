'use client';

import { Layers } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { RateSectionListProps, RateItem } from "@/types/rateSectionMaster.types";
import { useConfirm } from "@/components/common";
import { CardList } from "@/components/common/CardList";
import RateSectionCard from "./RateSectionCard";
import RateSectionListHeader from "./RateSectionListHeader";
import { handleRateSectionDelete } from "./rateSectionHandlers";
import { useRateSectionList } from "@/hooks/useRateSectionList";

export default function RateSectionList({
  rates = [],
  selectedRateSection,
  newlyCreatedRateNo,
  initialWardCounts = {},
  totalCount = 0,
  onDeleteSuccess
}: RateSectionListProps) {
  const t = useTranslations("rateSectionMaster");
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageNumber = Number(searchParams?.get("ratesectionpage")) || 1;
  const pageSize = Number(searchParams?.get("ratesectionpagesize")) || 10;
  const initialSearch = searchParams?.get("q") || "";

  const {
    wardCounts,
    deletingId,
    setDeletingId,
    searchValue,
    setSearchValue,
    totalPages,
    effectivePageSize,
    changePageSize,
    handlePageChange
  } = useRateSectionList({
    initialWardCounts,
    initialSearch,
    totalCount,
    pageSize
  });

  const handleDeleteClick = (rateId: string, rateName: string, rateNo?: string) => {
    const displayName = rateNo ? `${rateNo} - ${rateName}` : rateName;

    confirm({
      variant: "delete",
      title: t("dialogs.deleteTitle"),
      description: t("dialogs.deleteDescription", { name: displayName }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
      onConfirm: () => handleRateSectionDelete({
        rateId,
        rateName,
        rateNo,
        wardCounts,
        searchParams,
        pathname,
        rates,
        router,
        onDeleteSuccess,
        t,
        setDeletingId
      }),
    });
  };

  return (
    <div className="p-3">
      <RateSectionListHeader
        title={t('list.title')}
        searchPlaceholder={t('list.searchPlaceholder')}
        addButtonLabel={t('list.addRateSection')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddClick={() => {
          const params = new URLSearchParams(searchParams?.toString());
          params.set("addRateSection", "");
          router.push(`?${params.toString()}`);
        }}
      />

    <CardList<RateItem>
      data={rates}
      pageNumber={pageNumber}
      pageSize={effectivePageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onPageSizeChange={changePageSize}
      emptyText={searchValue ? t('list.noRateSectionsFound') : t('list.noRateSectionsAvailable')}
      emptyIcon={<Layers className="w-12 h-12 mx-auto mb-2 text-gray-300" />}
      renderCard={(rate, index) => {
        const rateNo = rate.rateSectionNo;
        const isSelected = selectedRateSection === rateNo;
        const isNewlyCreated = newlyCreatedRateNo === rateNo;

        return (
          <RateSectionCard
            key={rate.id || rateNo || index}
            rate={rate}
            index={index}
            isSelected={isSelected}
            isNewlyCreated={isNewlyCreated}
            onDelete={handleDeleteClick}
            deletingId={deletingId}
            searchParams={searchParams}
            pathname={pathname}
            t={t}
          />
        );
      }}
    />

  </div>
);
}


