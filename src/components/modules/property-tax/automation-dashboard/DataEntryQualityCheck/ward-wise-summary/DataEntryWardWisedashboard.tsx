'use client';

import { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { AutomationTable } from '@/components/common/AutomationTable';
import { Button } from '@/components/common/ActionButton';
import { ArrowLeft, Download, MapPin } from 'lucide-react';
import { DataEntryWardWiseSummaryItems, DataEntryWardData } from '@/types/automation-dashboard/data-entry-quality-check/data-entry-quality-check.type';
import { getDataEntryColumns, getDataEntryHeaderRows, DataEntryData } from '../DataEntryQualityCheckColumns';
import { DataEnteryWardWiseSummaryCards } from './DataEnteryWardWiseSummaryCards';
import { PropertyTypeMasterItem } from '@/types/automation-dashboard/property-dashboard/property-subgrid-details.type';
import { DashboardFilterBar } from '@/components/modules/property-tax/automation-dashboard/CommonFilterDashbaord/DashboardFilterBar';
import { getPropertyTypeIdParam } from '@/components/modules/property-tax/automation-dashboard/GeoSequencing/CommonGeoSequencingColumns';

interface DataEntryWardWiseDashboardProps {
    zoneId: string;
    summaryData: DataEntryWardWiseSummaryItems | null;
    propertyDescriptions?: PropertyTypeMasterItem[];
}

export default function DataEntryWardWisedashboard({ zoneId, summaryData, propertyDescriptions = [] }: DataEntryWardWiseDashboardProps) {
    const searchParams = useSearchParams();
    const workflowStageId = searchParams.get('workflowStageId') || '';
    const t = useTranslations('automationDashboard');
    const router = useRouter();
    const locale = useLocale();
    const basePath = `/${locale}/property-tax/automation-dashboard`;

    const handleBack = () => {
        const query = workflowStageId ? `?workflowStageId=${workflowStageId}` : '';
        router.push(`${basePath}/quality-check${query}`);
    };

    const pageNumber = summaryData?.pageNumber ?? 1;
    const pageSize = summaryData?.pageSize ?? 10;
    const totalCount = summaryData?.totalCount ?? 0;

    const handlePageChange = (newPageNumber: number) => {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('pageNumber', newPageNumber.toString());
        currentParams.set('pageSize', pageSize.toString());
        router.push(`${window.location.pathname}?${currentParams.toString()}`);
    };

    const handlePageSizeChange = (newSize: number) => {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('pageNumber', '1');
        currentParams.set('pageSize', newSize.toString());
        router.push(`${window.location.pathname}?${currentParams.toString()}`);
    };

    const columns = useMemo(() => {
        return getDataEntryColumns(
            'ward',
            t,
            undefined,
            undefined,
            (row, columnKey) => {
                if (row.isTotal || !row.wardNo) return;
                const pathId = row.wardId ? row.wardId : row.wardNo;
                const zoneNoParam = row.zoneNo ? `&zoneNo=${row.zoneNo}` : '';
                const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/quality-check/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                const typeIdParam = getPropertyTypeIdParam(columnKey);
                const query = `?stage=dataEntryQC&source=ward&column=${columnKey}&wardWise=true&zoneId=${zoneId}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}${typeIdParam}`;
                router.push(`${basePath}/property-details-dashboard/${pathId}${query}`);
            }
        );
    }, [t, router, basePath, workflowStageId, locale, zoneId]);

    const headerRows = useMemo(() => getDataEntryHeaderRows('ward', t), [t]);

    const tableData = useMemo(() => {
        if (!summaryData || !summaryData.wardData) return [];

        const pageNum = summaryData.pageNumber ?? 1;
        const size = summaryData.pageSize ?? 10;
        const startSr = (pageNum - 1) * size;

        const mapWardDataToRow = (ward: DataEntryWardData, isTotal: boolean = false, index: number = 0): DataEntryData => ({
            isTotal: isTotal,
            sr: isTotal ? t('dataEntryQualityCheck.total') || 'Total' : startSr + index + 1,
            division: isTotal ? '' : `${ward.wardNo}`,
            wardNo: isTotal ? '' : `${ward.wardNo}`,
            wardId: ward.wardId ?? undefined,
            zoneNo: ward.zoneNo ?? undefined,
            structure: 0,
            unit: 0,
            isStruct: ward.internalSurvey?.structure ?? 0,
            isUnit: ward.internalSurvey?.unit ?? 0,
            deCompStruct: ward.dataEntry?.completedStructure ?? 0,
            deCompUnit: ward.dataEntry?.completedUnit ?? 0,
            dePendStruct: ward.dataEntry?.pendingStructure ?? 0,
            dePendUnit: ward.dataEntry?.pendingUnit ?? 0,
            photoComp: ward.photo?.complete ?? 0,
            photoPend: ward.photo?.pending ?? 0,
            planComp: ward.plan?.complete ?? 0,
            planPend: ward.plan?.pending ?? 0,
            qaTypeWise: ward.qualityAnalyst?.typeWise ?? 0,
            qaCompStruct: ward.qualityAnalyst?.completedStructure ?? 0,
            qaCompUnit: ward.qualityAnalyst?.completedUnit ?? 0,
            qaPendStruct: ward.qualityAnalyst?.pendingStructure ?? 0,
            qaPendUnit: ward.qualityAnalyst?.pendingUnit ?? 0,
            propRes: ward.propertyType?.residential ?? 0,
            propNonRes: ward.propertyType?.nonResidential ?? 0,
            propMixed: ward.propertyType?.mixed ?? 0,
            propPublic: ward.propertyType?.publicUtility ?? 0,
            propUnder: ward.propertyType?.underConstruction ?? 0,
            assessStruct: ward.assessmentStatusBreakdown?.assessed?.structureCount ?? 0,
            assessUnit: ward.assessmentStatusBreakdown?.assessed?.unitCount ?? 0,
            unassessStruct: ward.assessmentStatusBreakdown?.unassessed?.structureCount ?? 0,
            unassessUnit: ward.assessmentStatusBreakdown?.unassessed?.unitCount ?? 0,
            newlyStruct: ward.assessmentStatusBreakdown?.newlyAssessedFound?.structureCount ?? 0,
            newlyUnit: ward.assessmentStatusBreakdown?.newlyAssessedFound?.unitCount ?? 0,
            inprocessStruct: ward.assessmentStatusBreakdown?.assessmentInProcess?.structureCount ?? 0,
            inprocessUnit: ward.assessmentStatusBreakdown?.assessmentInProcess?.unitCount ?? 0,
        });

        const mappedWards = summaryData.wardData.map((ward, index) => mapWardDataToRow(ward, false, index));

        if (summaryData.totalRow) {
            mappedWards.push(mapWardDataToRow(summaryData.totalRow, true));
        }

        return mappedWards;
    }, [summaryData, t]);
    const handleExport = () => {
        // Implement export logic
        console.log("Export triggered");
    };

    return (
        <div className="flex flex-col h-full gap-3 p-3">
            {/* Custom Page Header */}
            <div className="flex items-center justify-between bg-[#fcfaff] px-4 py-3 rounded-lg shadow-sm border border-indigo-100/60">
                <div className="flex-1 flex justify-start">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        icon={ArrowLeft}
                        className="text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 text-[13px] h-9 px-4 font-semibold"
                    >
                        {t('dataEntryQualityCheck.buttons.backToDivisions')}
                    </Button>
                </div>

                <div className="flex-none flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[16px] font-bold text-slate-800">
                            {searchParams.get('zoneNo') ? `${searchParams.get('zoneNo')} - ` : ''}
                            {summaryData?.zoneName ? summaryData.zoneName : ''} - {t('dataEntryQualityCheck.wardWiseSummary') || 'Ward-wise Summary'}
                        </h1>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-end gap-3">
                    <DashboardFilterBar t={t} propertyDescriptions={propertyDescriptions} />
                    <Button
                        variant="secondary"
                        onClick={handleExport}
                        icon={Download}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-[13px] h-9 px-4 font-semibold"
                    >
                        {t('dataEntryQualityCheck.buttons.export') || 'Export'}
                    </Button>
                </div>
            </div>

            <DataEnteryWardWiseSummaryCards summaryData={summaryData} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
                    {t('dataEntryQualityCheck.qualityAnalystWardWiseTable') || 'Quality Analyst - Ward-wise Table'}
                </div>
            </div>

            <AutomationTable<DataEntryData>
                data={tableData}
                columns={columns}
                headerRows={headerRows}
                containerClassName="h-full"
                rowClassName={(row) => row.isTotal ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] [&>td]:!border-indigo-200 [&>td]:!border-r" : "group transition-colors cursor-pointer border-b border-slate-200"}
                loading={false}
                totalCount={totalCount}
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalPages={Math.ceil(totalCount / pageSize)}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                paginationConfig={{
                    enabled: true,
                    showPageSizeSelector: true
                }}
                onRowClick={(row) => {
                    if (row.isTotal || !row.wardNo) return;
                    const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/quality-check/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                    const pathId = row.wardId ? row.wardId : row.wardNo;
                    const zoneNoParam = row.zoneNo ? `&zoneNo=${row.zoneNo}` : '';
                    const query = `?stage=dataEntryQC&source=ward&wardWise=true&zoneId=${zoneId}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
                    router.push(`${basePath}/property-details-dashboard/${pathId}${query}`);
                }}
            />
        </div>
    );
}