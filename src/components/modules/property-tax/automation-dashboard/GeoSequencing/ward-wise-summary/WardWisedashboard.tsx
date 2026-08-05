
'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Download, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/common/ActionButton';
import { WardWiseSummaryCards } from './WardWiseSummaryCards';
import {
    getGeoSequencingSharedColumns,
    getGeoSequencingSharedHeaderRows,
    getPropertyTypeIdParam,
    GeoSequencingData
} from '../CommonGeoSequencingColumns';
import { GeoSequencingWardWiseItems, GeoSequencingWard } from '@/types/automation-dashboard/geo-sequencing/geo-sequencing.type';
import { useFormattedDate } from '@/hooks/automation-dashboard/useFormattedDate';
import { AutomationTable } from '@/components/common/AutomationTable';
import { DashboardFilterBar } from '@/components/modules/property-tax/automation-dashboard/CommonFilterDashbaord/DashboardFilterBar';
import { PropertyTypeMasterItem } from '@/types/automation-dashboard/property-dashboard/property-subgrid-details.type';

interface GeoSequencingWardWiseDashboardProps {
    zoneId: string;
    summaryData?: GeoSequencingWardWiseItems | null;
    propertyDescriptions?: PropertyTypeMasterItem[];
}

export function GeoSequencingWardWiseDashboard({ zoneId, summaryData, propertyDescriptions = [] }: GeoSequencingWardWiseDashboardProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const basePath = `/${locale}/property-tax/automation-dashboard`;
    const stage = searchParams.get('stage') || 'geoSequencing';
    const workflowStageId = searchParams.get('workflowStageId');

    // Generate a formatted current date string once
    const generatedOn = useFormattedDate();

    // Calculate back URL to the main dashboard
    const backUrl = workflowStageId ? `${basePath}/geo-sequencing?workflowStageId=${workflowStageId}` : `${basePath}/geo-sequencing`;

    // Format Stage Name for display
    const formattedStage = useMemo(() => {
        if (stage === 'geoSequencing') return 'Geo-sequencing';
        return stage;
    }, [stage]);

    const t = useTranslations('automationDashboard');

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

    const zoneNo = searchParams.get('zoneNo');
    const columns = useMemo(() => getGeoSequencingSharedColumns(
        t,
        'ward',
        (_wardNo, row) => {
            const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/geo-sequencing/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
            const pathId = row.wardId ? row.wardId : _wardNo.split(' - ')[0];
            const zoneNoParam = zoneNo ? `&zoneNo=${zoneNo}` : '';
            const query = `?stage=geoSequencing&source=ward&wardWise=true&zoneId=${zoneId}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
            router.push(`${basePath}/property-details-dashboard/${pathId}${query}`);
        },
        undefined,
        (row, columnKey) => {
            if (row.isTotal || !row.division) return;
            const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/geo-sequencing/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
            const pathId = row.wardId ? row.wardId : row.division.split(' - ')[0];
            const zoneNoParam = zoneNo ? `&zoneNo=${zoneNo}` : '';
            
            const typeIdParam = getPropertyTypeIdParam(columnKey);
            
            const query = `?stage=geoSequencing&source=ward&column=${columnKey}&wardWise=true&zoneId=${zoneId}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}${typeIdParam}`;
            router.push(`${basePath}/property-details-dashboard/${pathId}${query}`);
        }
    ), [t, locale, zoneId, workflowStageId, basePath, router, zoneNo]);
    const headerRows = useMemo(() => getGeoSequencingSharedHeaderRows(t, 'ward'), [t]);

    const tableData = useMemo<GeoSequencingData[]>(() => {
        if (!summaryData?.wardData) return [];

        const pageNum = summaryData.pageNumber ?? 1;
        const size = summaryData.pageSize ?? 10;
        const startSr = (pageNum - 1) * size;

        const mappedWards: GeoSequencingData[] = summaryData.wardData.map((ward: GeoSequencingWard, index: number) => ({
            sr: startSr + index + 1,
            division: ward.wardNo,
            wardId: ward.wardId,
            geoStruct: ward.geoSequencedProperties?.structureCount ?? 0,
            geoUnit: ward.geoSequencedProperties?.unitCount ?? 0,
            propRes: ward.propertyTypeBreakdown?.residential ?? 0,
            propNonRes: ward.propertyTypeBreakdown?.nonResidential ?? 0,
            propMixed: ward.propertyTypeBreakdown?.mixed ?? 0,
            propPublic: ward.propertyTypeBreakdown?.publicUtility ?? 0,
            propUnder: ward.propertyTypeBreakdown?.underConstruction ?? 0,
            assessStruct: ward.assessmentStatusBreakdown?.assessed?.structureCount ?? 0,
            assessUnit: ward.assessmentStatusBreakdown?.assessed?.unitCount ?? 0,
            unassessStruct: ward.assessmentStatusBreakdown?.unassessed?.structureCount ?? 0,
            unassessUnit: ward.assessmentStatusBreakdown?.unassessed?.unitCount ?? 0,
            newlyStruct: ward.assessmentStatusBreakdown?.newlyAssessedFound?.structureCount ?? 0,
            newlyUnit: ward.assessmentStatusBreakdown?.newlyAssessedFound?.unitCount ?? 0,
            inprocessStruct: ward.assessmentStatusBreakdown?.assessmentInProcess?.structureCount ?? 0,
            inprocessUnit: ward.assessmentStatusBreakdown?.assessmentInProcess?.unitCount ?? 0,
        }));

        if (summaryData.totalRow) {
            const total = summaryData.totalRow;
            mappedWards.push({
                sr: t('geoSequencing.total'),
                division: total.wardNo,
                isTotal: true,
                geoStruct: total.geoSequencedProperties?.structureCount ?? 0,
                geoUnit: total.geoSequencedProperties?.unitCount ?? 0,
                propRes: total.propertyTypeBreakdown?.residential ?? 0,
                propNonRes: total.propertyTypeBreakdown?.nonResidential ?? 0,
                propMixed: total.propertyTypeBreakdown?.mixed ?? 0,
                propPublic: total.propertyTypeBreakdown?.publicUtility ?? 0,
                propUnder: total.propertyTypeBreakdown?.underConstruction ?? 0,
                assessStruct: total.assessmentStatusBreakdown?.assessed?.structureCount ?? 0,
                assessUnit: total.assessmentStatusBreakdown?.assessed?.unitCount ?? 0,
                unassessStruct: total.assessmentStatusBreakdown?.unassessed?.structureCount ?? 0,
                unassessUnit: total.assessmentStatusBreakdown?.unassessed?.unitCount ?? 0,
                newlyStruct: total.assessmentStatusBreakdown?.newlyAssessedFound?.structureCount ?? 0,
                newlyUnit: total.assessmentStatusBreakdown?.newlyAssessedFound?.unitCount ?? 0,
                inprocessStruct: total.assessmentStatusBreakdown?.assessmentInProcess?.structureCount ?? 0,
                inprocessUnit: total.assessmentStatusBreakdown?.assessmentInProcess?.unitCount ?? 0,
            });
        }
        return mappedWards;
    }, [summaryData, t]);

    const summaryCardsData = useMemo(() => {
        if (!summaryData?.totalRow) return undefined;
        return {
            totalStructure: summaryData.totalRow.geoSequencedProperties?.structureCount ?? 0,
            totalUnits: summaryData.totalRow.geoSequencedProperties?.unitCount ?? 0,
            assessed: summaryData.totalRow.assessmentStatusBreakdown?.assessed?.structureCount ?? 0,
            unassessed: summaryData.totalRow.assessmentStatusBreakdown?.unassessed?.structureCount ?? 0,
            formattedStage: formattedStage
        };
    }, [summaryData, formattedStage]);

    return (
        <div className="flex flex-col h-full gap-3 p-3">
            {/* Custom Page Header */}
            <div className="flex items-center justify-between bg-[#f8f9fe] px-4 py-3 rounded-lg shadow-sm border border-indigo-100/60">
                <div className="flex-1 flex justify-start">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('geoSequencing.buttons.backToDivisions')}
                    </Link>
                </div>

                <div className="flex-none flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[16px] font-bold text-slate-800">
                            {zoneNo ? `${zoneNo} - ` : ''}
                            {summaryData?.zoneName ? summaryData.zoneName : ''} - {t('geoSequencing.wardWiseSummary')}
                        </h1>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span>{t('geoSequencing.stage')} {formattedStage}</span>
                            <span>{t('geoSequencing.generatedOn')} {generatedOn}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-end gap-3">
                    <DashboardFilterBar t={t} propertyDescriptions={propertyDescriptions} />
                    <Button variant="secondary" size="sm" icon={Download} className="bg-white border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-[13px]">
                        {t('geoSequencing.buttons.export')}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <WardWiseSummaryCards data={summaryCardsData} />

            {/* Ward-wise Table */}
            <div className="relative border-0 shadow-lg overflow-hidden transition-all duration-300 bg-white rounded-lg flex flex-col flex-1">
                <div className="flex-1 p-0 overflow-auto max-h-[70vh] transition-all duration-300 border-t border-slate-200 [&_thead>tr:first-child]:bg-gradient-to-r [&_thead>tr:first-child]:from-indigo-100 [&_thead>tr:first-child]:to-purple-100 [&_thead>tr:first-child]:shadow-sm [&_thead>tr:nth-child(2)]:bg-gradient-to-r [&_thead>tr:nth-child(2)]:from-indigo-50 [&_thead>tr:nth-child(2)]:to-purple-50 [&_th]:border [&_th]:border-slate-300 [&_td]:border [&_td]:border-slate-300">
                    <AutomationTable<GeoSequencingData>
                        data={tableData}
                        columns={columns}
                        headerRows={headerRows}
                        containerClassName="h-full"
                        tableClassName="w-full border-collapse text-xs border border-slate-300"
                        theadClassName="sticky top-0 z-20 shadow-[0_1px_0_0_#cbd5e1,0_2px_4px_rgba(0,0,0,0.04)]"
                        maxBodyHeightClassName="max-h-none"
                        rowClassName={(row) => row.isTotal ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] [&>td]:!border-indigo-200 [&>td]:!border-r" : "group transition-colors border-b border-slate-200"}
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
                    />
                </div>
            </div>
        </div>
    );
}
