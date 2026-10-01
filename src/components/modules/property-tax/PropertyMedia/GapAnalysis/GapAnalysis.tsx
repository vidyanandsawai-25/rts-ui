'use client';
import { Card } from '@/components/common/Card';
import { MasterTable, PreviewButton } from "@/components/common";
import { GapAnalysisHeader } from "@/components/modules/property-tax/PropertyMedia/GapAnalysis/GapAnalysisHeader";
import { GapAnalysisSummaryCards } from "@/components/modules/property-tax/PropertyMedia/GapAnalysis/GapAnalysisSummaryCards";
import { DetailedCoverageHeader } from "@/components/modules/property-tax/PropertyMedia/GapAnalysis/DetailedCoverageHeader";
import { GapAnalysisProps, DetailedCoverageItem } from "@/types/PropertyMedia/PropertyMedia.types";
import { useGapAnalysis } from "@/hooks/PropertyMedia/useGapAnalysis";
import { getCoverageColumns } from "./GapAnalysisColumn";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { usePropertyMediaExport } from "@/hooks/PropertyMedia/usePropertyMediaExport";

export function GapAnalysis({ dashboardStats, tableData }: GapAnalysisProps) {
    const router = useRouter();
    const locale = useLocale();
    const { exportDetailedCoverage, isExporting } = usePropertyMediaExport();

    const {
        searchInputRef,
        handleFilterClick,
        activeCategory,
        searchTerm,
        handleSearchChange,
        handleCategoryClick,
        handleShowAll,
        handlePageChange,
        handlePageSizeChange,
        currentCategoryLabel,
        isShowAllDisabled,
        t,
    } = useGapAnalysis();

    const handleExport = (format: 0 | 1) => {
        exportDetailedCoverage({
            format,
            category: activeCategory || undefined,
            searchTerm: searchTerm || undefined,
            pageNumber: tableData?.pageNumber,
            pageSize: tableData?.pageSize,
        });
    };

    return (
        <Card
            className="mt-4 !rounded-[14px] !border !border-[#dfe9f5] !bg-white !shadow-[0_7px_22px_rgba(35,85,145,0.07)]"
            padding="none"
        >
            <GapAnalysisHeader
                handleFilterClick={handleFilterClick}
                onExport={handleExport}
                isExporting={isExporting}
                t={t}
            />
            <GapAnalysisSummaryCards
                dashboardStats={dashboardStats}
                activeCategory={activeCategory}
                onCategoryClick={handleCategoryClick}
                t={t}
            />
            <DetailedCoverageHeader
                searchInputRef={searchInputRef}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                currentCategoryLabel={currentCategoryLabel}
                isShowAllDisabled={isShowAllDisabled}
                onShowAll={handleShowAll}
                t={t}
            />
            <div className="px-4 mb-4">
                <MasterTable<DetailedCoverageItem>
                    data={(tableData?.items ?? []) as DetailedCoverageItem[]}
                    columns={getCoverageColumns(t)}
                    actionHeaderAlign="left"
                    actionCellAlign="left"
                    containerClassName="[&>div]:overflow-hidden"
                    paginationConfig={{ enabled: true, showPageSizeSelector: true }}
                    pageNumber={tableData?.pageNumber}
                    pageSize={tableData?.pageSize}
                    totalCount={tableData?.totalCount}
                    totalPages={tableData?.totalPages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    renderActions={(row) => (
                        <PreviewButton
                            variant="secondary"
                            label={t('detailedCoverageTable.buttons.view')}
                            size="xs"
                            onClick={() => {
                                const rowId = row?.photoTypeId ?? row?.id;
                                if (rowId !== undefined && rowId !== null) {
                                    router.push(`/${locale}/property-tax/property-media/view/${encodeURIComponent(String(rowId))}`)
                                }
                            }}
                        >
                            {t('detailedCoverageTable.buttons.view')}
                        </PreviewButton>
                    )}
                />
            </div>
        </Card>
    );
}