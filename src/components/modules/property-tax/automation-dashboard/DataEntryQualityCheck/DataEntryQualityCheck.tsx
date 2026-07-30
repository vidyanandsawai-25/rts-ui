'use client';

import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchInput } from '@/components/common/SearchInput';
import { SearchButton } from '@/components/common';
import { ExportButton } from '@/components/common/ActionButtons';
import { AutomationTable } from '@/components/common/AutomationTable';
import { DataEntryGridItems } from '@/types/automation-dashboard/data-entry-quality-check/data-entry-quality-check.type';
import { getDataEntryColumns, getDataEntryHeaderRows } from './DataEntryQualityCheckColumns';

interface DataEntryQualityCheckProps {
    serverData: DataEntryGridItems | null;
}

const TopBar = ({ searchTerm, setSearchTerm, t }: { searchTerm: string, setSearchTerm: (val: string) => void, t: (key: string) => string }) => {
    return (
        <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t('dataEntryQualityCheck.searchPlaceholder')}
                    className="w-full flex-1 mb-0"
                />
                <SearchButton />
            </div>
            <div className="flex items-center gap-2">
                <ExportButton />
            </div>
        </div>
    );
};

const DataEntryQualityCheck: React.FC<DataEntryQualityCheckProps> = ({ serverData }) => {
    const locale = useLocale();
    const searchParams = useSearchParams();
    const t = useTranslations('automationDashboard');
    const [searchTerm, setSearchTerm] = useState('');

    const workflowStageId = searchParams.get('workflowStageId') || '';
    const router = useRouter();
    const basePath = `/${locale}/property-tax/automation-dashboard`;

    const columns = useMemo(() => {
        return getDataEntryColumns(
            'division',
            t,
            (zoneIdStr, row) => {
                const actualZoneId = row?.zoneId ?? zoneIdStr;
                const zoneNoParam = row?.zoneNo ? `&zoneNo=${row.zoneNo}` : '';
                const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/quality-check${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                const query = `?returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
                router.push(`${basePath}/quality-check/ward-wise-summary/${actualZoneId}${query}`);
            },
            undefined,
            (row, columnKey) => {
                if (row.isTotal || !row.division) return;
                const actualZoneId = row.zoneId ?? row.division.split(' ')[0];
                const zoneNoParam = row.zoneNo ? `&zoneNo=${row.zoneNo}` : '';
                const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/quality-check${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                const query = `?stage=dataEntryQC&source=division&column=${columnKey}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
                router.push(`${basePath}/property-details-dashboard/${actualZoneId}${query}`);
            }
        );
    }, [t, router, basePath, workflowStageId, locale]);

    const headerRows = useMemo(() => getDataEntryHeaderRows('division', t), [t]);

    const tableData = useMemo(() => {
        if (!serverData || !serverData.divisionData) return [];

        const mappedZones = serverData.divisionData.map((zone, index) => ({
            sr: index + 1,
            division: zone.zoneNo ? `${zone.zoneNo} - ${zone.divisionName}` : zone.divisionName,
            wardNo: '',
            zoneId: zone.divisionId ?? undefined,
            zoneNo: zone.zoneNo,
            structure: zone.structure ?? 0,
            unit: zone.unit ?? 0,

            isStruct: zone.internalSurvey?.structure ?? 0,
            isUnit: zone.internalSurvey?.unit ?? 0,

            deCompStruct: zone.dataEntry?.completedStructure ?? 0,
            deCompUnit: zone.dataEntry?.completedUnit ?? 0,
            dePendStruct: zone.dataEntry?.pendingStructure ?? 0,
            dePendUnit: zone.dataEntry?.pendingUnit ?? 0,

            photoComp: zone.photo?.complete ?? 0,
            photoPend: zone.photo?.pending ?? 0,

            planComp: zone.plan?.complete ?? 0,
            planPend: zone.plan?.pending ?? 0,

            qaCompStruct: zone.qualityAnalyst?.completedStructure ?? 0,
            qaCompUnit: zone.qualityAnalyst?.completedUnit ?? 0,
            qaPendStruct: zone.qualityAnalyst?.pendingStructure ?? 0,
            qaPendUnit: zone.qualityAnalyst?.pendingUnit ?? 0,
            qaTypeWise: zone.qualityAnalyst?.typeWise ?? 0,

            propRes: zone.propertyType?.residential ?? 0,
            propNonRes: zone.propertyType?.nonResidential ?? 0,
            propMixed: zone.propertyType?.mixed ?? 0,
            propPublic: zone.propertyType?.publicUtility ?? 0,
            propUnder: zone.propertyType?.underConstruction ?? 0,

            assessStruct: zone.assessmentStatusBreakdown?.assessed?.structureCount ?? 0,
            assessUnit: zone.assessmentStatusBreakdown?.assessed?.unitCount ?? 0,
            unassessStruct: zone.assessmentStatusBreakdown?.unassessed?.structureCount ?? 0,
            unassessUnit: zone.assessmentStatusBreakdown?.unassessed?.unitCount ?? 0,
            newlyStruct: zone.assessmentStatusBreakdown?.newlyAssessedFound?.structureCount ?? 0,
            newlyUnit: zone.assessmentStatusBreakdown?.newlyAssessedFound?.unitCount ?? 0,
            inprocessStruct: zone.assessmentStatusBreakdown?.assessmentInProcess?.structureCount ?? 0,
            inprocessUnit: zone.assessmentStatusBreakdown?.assessmentInProcess?.unitCount ?? 0,
        }));

        const totalRow = serverData.totalRow ? {
            isTotal: true,
            sr: t('dataEntryQualityCheck.total'),
            division: '',
            wardNo: '',
            zoneId: undefined,
            zoneNo: undefined,
            structure: serverData.totalRow.structure ?? 0,
            unit: serverData.totalRow.unit ?? 0,

            isStruct: serverData.totalRow.internalSurvey?.structure ?? 0,
            isUnit: serverData.totalRow.internalSurvey?.unit ?? 0,

            deCompStruct: serverData.totalRow.dataEntry?.completedStructure ?? 0,
            deCompUnit: serverData.totalRow.dataEntry?.completedUnit ?? 0,
            dePendStruct: serverData.totalRow.dataEntry?.pendingStructure ?? 0,
            dePendUnit: serverData.totalRow.dataEntry?.pendingUnit ?? 0,

            photoComp: serverData.totalRow.photo?.complete ?? 0,
            photoPend: serverData.totalRow.photo?.pending ?? 0,

            planComp: serverData.totalRow.plan?.complete ?? 0,
            planPend: serverData.totalRow.plan?.pending ?? 0,

            qaCompStruct: serverData.totalRow.qualityAnalyst?.completedStructure ?? 0,
            qaCompUnit: serverData.totalRow.qualityAnalyst?.completedUnit ?? 0,
            qaPendStruct: serverData.totalRow.qualityAnalyst?.pendingStructure ?? 0,
            qaPendUnit: serverData.totalRow.qualityAnalyst?.pendingUnit ?? 0,
            qaTypeWise: serverData.totalRow.qualityAnalyst?.typeWise ?? 0,

            propRes: serverData.totalRow.propertyType?.residential ?? 0,
            propNonRes: serverData.totalRow.propertyType?.nonResidential ?? 0,
            propMixed: serverData.totalRow.propertyType?.mixed ?? 0,
            propPublic: serverData.totalRow.propertyType?.publicUtility ?? 0,
            propUnder: serverData.totalRow.propertyType?.underConstruction ?? 0,

            assessStruct: serverData.totalRow.assessmentStatusBreakdown?.assessed?.structureCount ?? 0,
            assessUnit: serverData.totalRow.assessmentStatusBreakdown?.assessed?.unitCount ?? 0,
            unassessStruct: serverData.totalRow.assessmentStatusBreakdown?.unassessed?.structureCount ?? 0,
            unassessUnit: serverData.totalRow.assessmentStatusBreakdown?.unassessed?.unitCount ?? 0,
            newlyStruct: serverData.totalRow.assessmentStatusBreakdown?.newlyAssessedFound?.structureCount ?? 0,
            newlyUnit: serverData.totalRow.assessmentStatusBreakdown?.newlyAssessedFound?.unitCount ?? 0,
            inprocessStruct: serverData.totalRow.assessmentStatusBreakdown?.assessmentInProcess?.structureCount ?? 0,
            inprocessUnit: serverData.totalRow.assessmentStatusBreakdown?.assessmentInProcess?.unitCount ?? 0,
        } : null;

        return totalRow ? [...mappedZones, totalRow] : mappedZones;
    }, [serverData, t]);

    return (
        <AutomationTable
            data={tableData}
            columns={columns}
            headerRows={headerRows}
            headerExtra={<TopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />}
            containerClassName="h-full"
            paginationConfig={{ enabled: false, showPageSizeSelector: false }}
            rowClassName={(row) => row.isTotal ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] [&>td]:!border-indigo-200 [&>td]:!border-r" : "group transition-colors border-b border-slate-200 hover:bg-transparent"}
        />
    );
};

export default DataEntryQualityCheck;