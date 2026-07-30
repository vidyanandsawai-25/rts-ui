'use client';

import { useState } from 'react';
import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AutomationTable } from '@/components/common/AutomationTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ExportButton, SearchButton } from '@/components/common';
import { GeoSequencingItems } from '@/types/automation-dashboard/geo-sequencing/geo-sequencing.type';
import {
    GeoSequencingData,
    getGeoSequencingSharedColumns,
    getGeoSequencingSharedHeaderRows,
} from './CommonGeoSequencingColumns';

interface GeoSequencingPageProps {
    serverData?: GeoSequencingItems | null;
    defaultWorkflowStageId?: string;
}

const TopBar = ({ t }: { t: (key: string) => string }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t('geoSequencing.searchPlaceholder')}
                    className="w-full flex-1 mb-0"
                />

                <SearchButton label={t('geoSequencing.buttons.search')} />
            </div>
            <ExportButton label={t('geoSequencing.buttons.export')} />
        </div>
    );
};

const GeoSequencingPage = ({ serverData, defaultWorkflowStageId }: GeoSequencingPageProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('automationDashboard');
    const locale = useLocale();
    const workflowStageId = searchParams.get('workflowStageId') || defaultWorkflowStageId || '';
    const basePath = `/${locale}/property-tax/automation-dashboard`;

    const columns = useMemo(() => {
        return getGeoSequencingSharedColumns(
            t,
            'zone',
            (zoneCode, row) => {
                const targetZoneId = row.zoneId ?? zoneCode;
                const zoneNoParam = row.zoneNo ? `&zoneNo=${row.zoneNo}` : '';
                const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/geo-sequencing${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                const query = `?returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
                router.push(`${basePath}/geo-sequencing/ward-wise-summary/${targetZoneId}${query}`);
            },
            undefined,
            (row, columnKey) => {
                if (row.isTotal || !row.division) return;
                const zoneId = row.zoneId ?? row.division.split(' ')[0];
                const zoneNoParam = row.zoneNo ? `&zoneNo=${row.zoneNo}` : '';
                const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/geo-sequencing${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
                const query = `?stage=geoSequencing&source=division&column=${columnKey}&returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${zoneNoParam}`;
                router.push(`${basePath}/property-details-dashboard/${zoneId}${query}`);
            }
        );
    }, [t, router, basePath, workflowStageId, locale]);
    const headerRows = useMemo(() => getGeoSequencingSharedHeaderRows(t, 'zone'), [t]);

    const tableData = useMemo<GeoSequencingData[]>(() => {
        if (!serverData || !serverData.zones) return [];

        const mappedZones: GeoSequencingData[] = serverData.zones.map((zone, index) => ({
            sr: index + 1,
            division: zone.zoneNo ? `${zone.zoneNo} - ${zone.zoneName}` : zone.zoneName,
            zoneId: zone.zoneId,
            zoneNo: zone.zoneNo,
            registered: zone.registeredProperties ?? 0,
            geoStruct: zone.geoSequencedProperties?.structureCount ?? 0,
            geoUnit: zone.geoSequencedProperties?.unitCount ?? 0,
            propRes: zone.propertyTypeBreakdown?.residential ?? 0,
            propNonRes: zone.propertyTypeBreakdown?.nonResidential ?? 0,
            propMixed: zone.propertyTypeBreakdown?.mixed ?? 0,
            propPublic: zone.propertyTypeBreakdown?.publicUtility ?? 0,
            propUnder: zone.propertyTypeBreakdown?.underConstruction ?? 0,
            assessStruct: zone.assessmentStatusBreakdown?.assessed?.structureCount ?? 0,
            assessUnit: zone.assessmentStatusBreakdown?.assessed?.unitCount ?? 0,
            unassessStruct: zone.assessmentStatusBreakdown?.unassessed?.structureCount ?? 0,
            unassessUnit: zone.assessmentStatusBreakdown?.unassessed?.unitCount ?? 0,
            newlyStruct: zone.assessmentStatusBreakdown?.newlyAssessedFound?.structureCount ?? 0,
            newlyUnit: zone.assessmentStatusBreakdown?.newlyAssessedFound?.unitCount ?? 0,
            inprocessStruct: zone.assessmentStatusBreakdown?.assessmentInProcess?.structureCount ?? 0,
            inprocessUnit: zone.assessmentStatusBreakdown?.assessmentInProcess?.unitCount ?? 0,
        }));

        const totalRow: GeoSequencingData | null = serverData.totalRow ? {
            sr: t('geoSequencing.total'),
            division: '',
            isTotal: true,
            registered: serverData.totalRow.registeredProperties ?? 0,
            geoStruct: serverData.totalRow.geoSequencedProperties?.structureCount ?? 0,
            geoUnit: serverData.totalRow.geoSequencedProperties?.unitCount ?? 0,
            propRes: serverData.totalRow.propertyTypeBreakdown?.residential ?? 0,
            propNonRes: serverData.totalRow.propertyTypeBreakdown?.nonResidential ?? 0,
            propMixed: serverData.totalRow.propertyTypeBreakdown?.mixed ?? 0,
            propPublic: serverData.totalRow.propertyTypeBreakdown?.publicUtility ?? 0,
            propUnder: serverData.totalRow.propertyTypeBreakdown?.underConstruction ?? 0,
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
        <AutomationTable<GeoSequencingData>
            data={tableData}
            columns={columns}
            headerRows={headerRows}
            headerExtra={<TopBar t={t} />}
            containerClassName="h-full"
            paginationConfig={{ enabled: false, showPageSizeSelector: false }}
            rowClassName={(row) => row.sr === t('geoSequencing.total') ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]" : "group transition-colors border-b border-slate-200 hover:bg-transparent"}
        />
    );
};

export default GeoSequencingPage;