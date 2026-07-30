'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AutomationTable } from '@/components/common/AutomationTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ExportButton, SearchButton } from '@/components/common';
import { InternalSurveyGridItems } from "@/types/automation-dashboard/internal-surveygrid/internal-surveygrid.type";
import { getInternalSurveyColumns, getInternalSurveyHeaderRows, InternalSurveyTableRow } from './InternalSurveyColumns';
interface InternalSurveyPageProps {
    serverData: InternalSurveyGridItems | null;
}

const TopBar = ({ t }: { t: (key: string) => string }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t('internalSurvey.searchPlaceholder')}
                    className="w-full flex-1 mb-0"
                />

                <SearchButton label={t('internalSurvey.buttons.search')} />
            </div>
            <ExportButton label={t('internalSurvey.buttons.export')} />
        </div>
    );
};

const InternalSurveyPage: React.FC<InternalSurveyPageProps> = ({ serverData }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('automationDashboard');
    const locale = useLocale();
    const workflowStageId = searchParams.get('workflowStageId') || '';
    const basePath = `/${locale}/property-tax/automation-dashboard`;

    const columns = useMemo(() => {
        return getInternalSurveyColumns(
            t,
            (divisionStr) => {
                const zoneId = divisionStr.split(' ')[0];
                const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/internal-survey${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                const query = `?returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}`;
                router.push(`${basePath}/internal-survey/ward-wise-summary/${zoneId}${query}`);
            },
            undefined,
            (row, columnKey) => {
                if (row.sr === t('internalSurvey.total') || !row.division) return;
                const zoneId = row.division.split(' ')[0];
                const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/internal-survey${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                const query = `?stage=internalSurvey&source=division&column=${columnKey}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}`;
                router.push(`${basePath}/property-details-dashboard/${zoneId}${query}`);
            }
        );
    }, [t, router, basePath, workflowStageId, locale]);

    const headerRows = useMemo(() => getInternalSurveyHeaderRows(t), [t]);

    const tableData: InternalSurveyTableRow[] = useMemo(() => {
        if (!serverData) return [];

        const mappedData: InternalSurveyTableRow[] = (serverData.divisionData || []).map((data, index) => ({
            sr: (index + 1).toString(),
            division: data.divisionId ? `${data.divisionId} - ${data.divisionName}` : data.divisionName,
            isTotal: false,
            geoStruct: data.geoSequencingProperties?.structure ?? 0,
            geoUnit: data.geoSequencingProperties?.unit ?? 0,
            surveyStruct: data.surveyProperties?.structure ?? 0,
            surveyUnit: data.surveyProperties?.unit ?? 0,
            propRes: data.propertyType?.residential ?? 0,
            propNonRes: data.propertyType?.nonResidential ?? 0,
            propMixed: data.propertyType?.mixed ?? 0,
            propPublic: data.propertyType?.publicUtility ?? 0,
            propUnder: data.propertyType?.underConstruction ?? 0,
            assessStruct: data.assessedProperties?.structure ?? 0,
            assessUnit: data.assessedProperties?.units ?? 0,
            unassessStruct: data.unassessedProperties?.structure ?? 0,
            unassessUnit: data.unassessedProperties?.units ?? 0,
            newlyStruct: data.newlyAssessedFound?.structure ?? 0,
            newlyUnit: data.newlyAssessedFound?.unit ?? 0,
            inprocessStruct: data.assessmentInprocess?.structure ?? 0,
            inprocessUnit: data.assessmentInprocess?.unit ?? 0,
            photoCount: data.photoCount ?? 0,
        }));

        if (serverData.totalRow) {
            const total = serverData.totalRow;
            mappedData.push({
                sr: t('internalSurvey.total'),
                division: '',
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

        return mappedData;
    }, [serverData, t]);

    return (
        <div className="flex flex-col gap-4 w-full pb-4">
            <TopBar t={t} />

            <div className="flex-1 w-full bg-white rounded-lg shadow-sm border border-slate-200">
                <AutomationTable<InternalSurveyTableRow>
                    data={tableData}
                    columns={columns}
                    headerRows={headerRows}
                    loading={!serverData}
                    rowClassName={(row) => row.sr === t('internalSurvey.total') ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]" : "group transition-colors hover:bg-transparent"}
                    emptyText={t('internalSurvey.emptyMessage')}
                    containerClassName="max-h-[calc(100vh-220px)]"
                />
            </div>
        </div>
    );
};

export default InternalSurveyPage;