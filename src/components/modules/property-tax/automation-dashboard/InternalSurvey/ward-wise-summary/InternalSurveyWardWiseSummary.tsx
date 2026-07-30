'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Download, MapPin } from 'lucide-react';
import Link from 'next/link';
import { AutomationTable, Column } from '@/components/common/AutomationTable';
import { Button } from '@/components/common/ActionButton';
import { InternalSurveyWardWiseSummaryCards } from './InternalSurveyWardWiseSummaryCards';
import {
    getInternalSurveyColumns,
    getInternalSurveyHeaderRows,
    InternalSurveyTableRow
} from '../InternalSurveyColumns';
import { InternalSurveyWardWiseItems, InternalSurveyWardWiseData } from '@/types/automation-dashboard/internal-surveygrid/internal-surveygrid.type';
import { useFormattedDate } from '@/hooks/automation-dashboard/useFormattedDate';

interface InternalSurveyWardWiseSummaryProps {
    zoneId: string;
    summaryData?: InternalSurveyWardWiseItems | null;
}

const InternalSurveyWardWiseSummary = ({ zoneId, summaryData }: InternalSurveyWardWiseSummaryProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const basePath = `/${locale}/property-tax/automation-dashboard`;
    const stage = searchParams.get('stage') || 'internalSurvey';
    const workflowStageId = searchParams.get('workflowStageId');

    // Generate a formatted current date string once
    const generatedOn = useFormattedDate();

    // Calculate back URL to the main dashboard
    const backUrl = workflowStageId ? `${basePath}/internal-survey?workflowStageId=${workflowStageId}` : `${basePath}/internal-survey`;

    // Format Stage Name for display
    const formattedStage = useMemo(() => {
        if (stage === 'internalSurvey') return 'Internal Survey';
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
    const columns = useMemo(() => getInternalSurveyColumns(
        t,
        (divisionStr, row) => {
            const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/internal-survey/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
            const pathId = row.wardId ? row.wardId : divisionStr.split(' - ')[0];
            const zoneNoParam = zoneNo ? `&zoneNo=${zoneNo}` : '';
            const query = `?stage=internalSurvey&source=ward&wardWise=true&zoneId=${zoneId}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
            router.push(`${basePath}/property-details-dashboard/${pathId}${query}`);
        },
        undefined,
        (row, columnKey) => {
            if (row.isTotal || !row.division) return;
            const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/internal-survey/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
            const pathId = row.wardId ? row.wardId : row.division.split(' - ')[0];
            const zoneNoParam = zoneNo ? `&zoneNo=${zoneNo}` : '';
            const query = `?stage=internalSurvey&source=ward&wardWise=true&zoneId=${zoneId}&column=${columnKey}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
            router.push(`${basePath}/property-details-dashboard/${pathId}${query}`);
        }
    ), [t, locale, zoneId, workflowStageId, basePath, router, zoneNo]);
    const headerRows = useMemo(() => getInternalSurveyHeaderRows(t), [t]);

    const tableData = useMemo(() => {
        if (!summaryData?.wardData) return [];

        const pageNum = summaryData.pageNumber ?? 1;
        const size = summaryData.pageSize ?? 10;
        const startSr = (pageNum - 1) * size;

        const mappedWards: InternalSurveyTableRow[] = summaryData.wardData.map((ward: InternalSurveyWardWiseData, index: number) => ({
            sr: startSr + index + 1,
            division: ward.wardNo,
            wardId: ward.wardId ?? undefined,
            geoStruct: ward.geoSequencingProperties?.structure ?? 0,
            geoUnit: ward.geoSequencingProperties?.unit ?? 0,
            surveyStruct: ward.surveyProperties?.structure ?? 0,
            surveyUnit: ward.surveyProperties?.unit ?? 0,
            propRes: ward.propertyType?.residential ?? 0,
            propNonRes: ward.propertyType?.nonResidential ?? 0,
            propMixed: ward.propertyType?.mixed ?? 0,
            propPublic: ward.propertyType?.publicUtility ?? 0,
            propUnder: ward.propertyType?.underConstruction ?? 0,
            assessStruct: ward.assessedProperties?.structure ?? 0,
            assessUnit: ward.assessedProperties?.units ?? 0,
            unassessStruct: ward.unassessedProperties?.structure ?? 0,
            unassessUnit: ward.unassessedProperties?.units ?? 0,
            newlyStruct: ward.newlyAssessedFound?.structure ?? 0,
            newlyUnit: ward.newlyAssessedFound?.unit ?? 0,
            inprocessStruct: ward.assessmentInprocess?.structure ?? 0,
            inprocessUnit: ward.assessmentInprocess?.unit ?? 0,
            photoCount: ward.photoCount ?? 0,
        }));

        if (summaryData.totalRow) {
            const total = summaryData.totalRow;
            mappedWards.push({
                sr: t('internalSurvey.total'),
                division: total.wardNo,
                isTotal: true,
                geoStruct: total.geoSequencingProperties?.structure ?? 0,
                geoUnit: total.geoSequencingProperties?.unit ?? 0,
                surveyStruct: total.surveyProperties?.structure ?? 0,
                surveyUnit: total.surveyProperties?.unit ?? 0,
                propRes: total.propertyType?.residential ?? 0,
                propNonRes: total.propertyType?.nonResidential ?? 0,
                propMixed: total.propertyType?.mixed ?? 0,
                propPublic: total.propertyType?.publicUtility ?? 0,
                propUnder: total.propertyType?.underConstruction ?? 0,
                assessStruct: total.assessedProperties?.structure ?? 0,
                assessUnit: total.assessedProperties?.units ?? 0,
                unassessStruct: total.unassessedProperties?.structure ?? 0,
                unassessUnit: total.unassessedProperties?.units ?? 0,
                newlyStruct: total.newlyAssessedFound?.structure ?? 0,
                newlyUnit: total.newlyAssessedFound?.unit ?? 0,
                inprocessStruct: total.assessmentInprocess?.structure ?? 0,
                inprocessUnit: total.assessmentInprocess?.unit ?? 0,
                photoCount: total.photoCount ?? 0,
            });
        }

        return mappedWards;
    }, [summaryData, t]);

    const summaryCardsData = useMemo(() => {
        if (!summaryData?.totalRow) return undefined;
        return {
            totalStructure: summaryData.totalRow.surveyProperties?.structure ?? 0,
            totalUnits: summaryData.totalRow.surveyProperties?.unit ?? 0,
            assessed: summaryData.totalRow.assessedProperties?.structure ?? 0,
            unassessed: summaryData.totalRow.unassessedProperties?.structure ?? 0,
            photos: summaryData.totalRow.photoCount ?? 0,
            formattedStage: formattedStage
        };
    }, [summaryData, formattedStage]);

    return (
        <div className="flex flex-col h-full gap-3 p-3">
            {/* Custom Page Header */}
            <div className="flex items-center justify-between bg-[#fcfaff] px-4 py-3 rounded-lg shadow-sm border border-purple-100/60">
                <Link
                    href={backUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('internalSurvey.buttons.backToDivisions')}
                </Link>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center shadow-md">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[16px] font-bold text-slate-800">
                            {zoneNo ? `${zoneNo} - ` : ''}
                            {summaryData?.zoneName ? summaryData.zoneName : ''} - {t('internalSurvey.wardWiseSummary')}
                        </h1>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span>{t('internalSurvey.stage')} {formattedStage}</span>
                            <span>{t('internalSurvey.generatedOn')} {generatedOn}</span>
                        </div>
                    </div>
                </div>

                <Button variant="secondary" size="sm" icon={Download} className="bg-white border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-[13px]">
                    {t('internalSurvey.buttons.export')}
                </Button>
            </div>

            {/* Summary Cards */}
            <InternalSurveyWardWiseSummaryCards data={summaryCardsData} />

            {/* Ward-wise Table */}
            <div className="relative border-0 shadow-lg overflow-hidden transition-all duration-300 bg-white rounded-lg flex flex-col flex-1">
                <div className="flex-1 p-0 overflow-auto max-h-[70vh] transition-all duration-300 border-t border-slate-200 [&_thead>tr:first-child]:bg-gradient-to-r [&_thead>tr:first-child]:from-indigo-100 [&_thead>tr:first-child]:to-purple-100 [&_thead>tr:first-child]:shadow-sm [&_thead>tr:nth-child(2)]:bg-gradient-to-r [&_thead>tr:nth-child(2)]:from-indigo-50 [&_thead>tr:nth-child(2)]:to-purple-50 [&_th]:border [&_th]:border-slate-300 [&_td]:border [&_td]:border-slate-300">
                    <AutomationTable
                        data={tableData}
                        columns={columns as unknown as Column<InternalSurveyTableRow>[]}
                        headerRows={headerRows}
                        containerClassName="h-full"
                        tableClassName="w-full border-collapse text-xs border border-slate-300"
                        theadClassName="sticky top-0 z-20 shadow-[0_1px_0_0_#cbd5e1,0_2px_4px_rgba(0,0,0,0.04)]"
                        maxBodyHeightClassName="max-h-none"
                        rowClassName={(row) => row.isTotal ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] [&>td]:!border-indigo-200 [&>td]:!border-r" : "group transition-colors border-b border-slate-200 cursor-pointer"}
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
                            if (row.isTotal || !row.division) return;
                            const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/internal-survey/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                            const pathId = row.wardId ? row.wardId : row.division.split(' - ')[0];
                            const zoneNoParam = zoneNo ? `&zoneNo=${zoneNo}` : '';
                            const query = `?stage=internalSurvey&source=ward&wardWise=true&zoneId=${zoneId}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
                            router.push(`${basePath}/property-details-dashboard/${pathId}${query}`);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default InternalSurveyWardWiseSummary;