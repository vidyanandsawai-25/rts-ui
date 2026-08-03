'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/common/ActionButton';
import { SearchInput } from '@/components/common/SearchInput';
import { SearchSelect } from '@/components/common/SearchSelect';
import { AutomationTable } from '@/components/common/AutomationTable';
import { ArrowLeft, Send } from 'lucide-react';
import { PendingAssessmentItems, SendToApproveData } from '@/types/automation-dashboard/assessment/assessmentgrid.type';
import { getSendToApproveColumns, getSendToApproveHeaderRows } from './SendToApproveColumns';
import { DocumentViewerModal } from '@/components/common';

interface OptionType {
    value: string;
    label: string;
}

interface SendToApproveDashboardProps {
    serverData?: PendingAssessmentItems | null;
    pageNumber: number;
    pageSize: number;
    zoneOptions: OptionType[];
    wardOptions: OptionType[];
    propertyTypeOptions: OptionType[];
    propertyDescriptionOptions: OptionType[];
    surveyTypeOptions: OptionType[];
    initialSearchTerm?: string;
}

export default function SendToApproveDashboard({
    serverData,
    pageNumber,
    pageSize,
    zoneOptions,
    wardOptions,
    propertyTypeOptions,
    propertyDescriptionOptions,
    surveyTypeOptions,
    initialSearchTerm
}: SendToApproveDashboardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const t = useTranslations('automationDashboard');
    const locale = useLocale();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const selectedSurveyType = searchParams.get('surveyType') || 'All';
    const selectedZoneName = searchParams.get('zoneName') || 'All';
    const selectedWardNumber = searchParams.get('wardNumber') || 'All';
    const selectedPropertyType = searchParams.get('PropertyTypeCategoryId') || 'All';
    const selectedPropertyDescription = searchParams.get('PropertyTypeId') || 'All';

    const [viewerDocumentGuid, setViewerDocumentGuid] = useState<string | null>(null);
    const [viewerPropertyNo, setViewerPropertyNo] = useState<string>('');
    const [viewerWardNo, setViewerWardNo] = useState<string>('');
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerType, setViewerType] = useState<'plan' | 'image'>('image');

    const triggerSearch = () => {
        const currentParams = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
            currentParams.set('SearchTerm', searchTerm);
        } else {
            currentParams.delete('SearchTerm');
        }
        currentParams.set('pageNumber', '1');
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const currentParams = new URLSearchParams(searchParams.toString());
        if (value) {
            currentParams.set('SearchTerm', value);
        } else {
            currentParams.delete('SearchTerm');
        }
        currentParams.set('pageNumber', '1');
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const handlePageChange = (newPageNumber: number) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set('pageNumber', newPageNumber.toString());
        currentParams.set('pageSize', pageSize.toString());
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const handlePageSizeChange = (newSize: number) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set('pageNumber', '1');
        currentParams.set('pageSize', newSize.toString());
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
        );
    };

    // Map API property data to SendToApproveData format
    const mappedProperties: SendToApproveData[] = useMemo(() => {
        if (!serverData?.properties) return [];
        return serverData.properties.map((prop) => ({
            id: prop.propertyId.toString(),
            propertyNo: {
                new: prop.propertyNo,
                old: 'N/A'
            },
            wardNo: serverData?.zoneName || 'N/A',
            category: prop.category,
            categoryMarathi: prop.propertyDescription,
            desc: {
                floors: prop.floorCount?.toString()
            },
            owner: prop.ownerName,
            occupier: prop.occupierName,
            shopName: prop.flatOrShopName || '',
            mobile: prop.mobileNo,
            address: prop.address,
            oldRecord: {
                area: prop.propertyDetailsComparison?.oldRecord?.area || 'N/A',
                use: prop.propertyDetailsComparison?.oldRecord?.use || 'N/A',
                rv: prop.propertyDetailsComparison?.oldRecord?.rv || 'N/A',
                cTax: prop.propertyDetailsComparison?.oldRecord?.cTax || 'N/A',
                rTax: prop.propertyDetailsComparison?.oldRecord?.rTax || 'N/A',
                totalTax: prop.propertyDetailsComparison?.oldRecord?.totalTax || 'N/A',
            },
            newRecord: {
                area: prop.propertyDetailsComparison?.newRecord?.area || 'N/A',
                use: prop.propertyDetailsComparison?.newRecord?.use || 'N/A',
                rv: prop.propertyDetailsComparison?.newRecord?.rv || 'N/A',
                cTax: prop.propertyDetailsComparison?.newRecord?.cTax || 'N/A',
                rTax: prop.propertyDetailsComparison?.newRecord?.rTax || 'N/A',
                totalTax: prop.propertyDetailsComparison?.newRecord?.totalTax || 'N/A',
            },
            additionalRevenue: prop.additionalRevenue,
            propertyType: prop.propertyType === 'R' ? 'Residential' : prop.propertyType,
            documentGuid: prop.documentGuid,
            planDocumentGuid: prop.planDocumentGuid,
            qcChecklist: {
                siteQC: prop.qcChecklist?.siteQc ?? false,
                applyTaxes: prop.qcChecklist?.applyTaxes ?? false,
                officeQC: prop.qcChecklist?.officeQc ?? false,
                dataUpdated: prop.qcChecklist?.dataUpdated ?? false,
                addTaxes: prop.qcChecklist?.addTaxes ?? false,
                qcCcBill: prop.qcChecklist?.ocCcBill ?? false,
            }
        }));
    }, [serverData]);

    const totalCount = serverData?.totalCount ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paginatedData = mappedProperties;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const pageIds = paginatedData.map(d => d.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        } else {
            const pageIds = paginatedData.map(d => d.id);
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        }
    };

    const handleFilterChange = (name: string, value: string) => {
        // Push filter changes to the URL
        const currentParams = new URLSearchParams(searchParams.toString());
        if (value && value !== 'All') {
            currentParams.set(name, value);
        } else {
            currentParams.delete(name);
        }
        // Reset to page 1 on filter change
        currentParams.set('pageNumber', '1');
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const handleDocumentClick = (guid: string, propertyNo: string, wardNo: string, isPlan: boolean) => {
        setViewerDocumentGuid(guid);
        setViewerPropertyNo(propertyNo);
        setViewerWardNo(wardNo);
        setViewerType(isPlan ? 'plan' : 'image');
        setIsViewerOpen(true);
    };

    const closeViewer = () => {
        setIsViewerOpen(false);
        setViewerDocumentGuid(null);
    };

    const columns = getSendToApproveColumns(selectedIds, handleSelectRow, handleDocumentClick, undefined, t);
    const headerRows = getSendToApproveHeaderRows(selectedIds, paginatedData, handleSelectAll, t);
    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-4 gap-4">
            {/* Header Section */}
            <div className="flex flex-col rounded-lg border border-slate-200 shadow-sm bg-white flex-shrink-0">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            icon={ArrowLeft}
                            onClick={() => router.push(`/${locale}/property-tax/automation-dashboard/assessment?workflowStageId=4`)}
                            className="group h-9 px-4 text-xs font-semibold flex items-center gap-2 text-slate-700 bg-white border border-slate-300 shadow-sm hover:bg-slate-50 transition-all duration-300 rounded-md"
                        >
                            {t('sendToApprove.backToAssessment')}
                        </Button>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 leading-tight">
                                {t('sendToApprove.title')}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                                {t('sendToApprove.subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-50/50 border border-blue-200 px-2 py-1 rounded font-medium">
                                {`${selectedIds.length} ${t('sendToApprove.selected')}`}
                            </span>
                        )}
                        <Button
                            variant="primary"
                            className="h-9 px-4 text-xs font-semibold flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm rounded-md transition-colors border-none"
                        >
                            {t('sendToApprove.updateNoticeNo')}
                        </Button>
                        <Button
                            variant="primary"
                            icon={Send}
                            disabled={selectedIds.length === 0}
                            className={`h-9 px-4 text-xs font-semibold flex items-center gap-2 shadow-sm rounded-md transition-colors border-none ${selectedIds.length > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-300 text-white cursor-not-allowed'
                                }`}
                        >
                            {`${t('sendToApprove.sendToApprove')} (${selectedIds.length})`}
                        </Button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="p-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 bg-white rounded-b-lg border-t border-slate-100">
                    <div className="min-w-0">
                        <label className="text-xs font-medium text-slate-600 mb-1 block">{t('sendToApprove.filters.search')}</label>
                        <SearchInput
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onEnter={triggerSearch}
                            placeholder={t('sendToApprove.searchPlaceholder')}
                            className="w-full h-8 mb-0 text-xs"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="text-xs font-medium text-slate-600 mb-1 block">{t('sendToApprove.filters.surveyType')}</label>
                        <SearchSelect
                            name="surveyType"
                            value={selectedSurveyType}
                            onChange={handleFilterChange}
                            options={surveyTypeOptions}
                            className="h-8 text-xs font-bold text-slate-800"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="text-xs font-medium text-slate-600 mb-1 block">{t('sendToApprove.filters.zoneName')}</label>
                        <SearchSelect
                            name="zoneName"
                            value={selectedZoneName}
                            onChange={handleFilterChange}
                            options={zoneOptions}
                            className="h-8 text-xs font-bold text-slate-800"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="text-xs font-medium text-slate-600 mb-1 block">{t('sendToApprove.filters.wardNumber')}</label>
                        <SearchSelect
                            name="wardNumber"
                            value={selectedWardNumber}
                            onChange={handleFilterChange}
                            options={wardOptions}
                            className="h-8 text-xs font-bold text-slate-800"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="text-xs font-medium text-slate-600 mb-1 block">{t('sendToApprove.filters.propertyType')}</label>
                        <SearchSelect
                            name="PropertyTypeCategoryId"
                            value={selectedPropertyType}
                            onChange={handleFilterChange}
                            options={propertyTypeOptions}
                            className="h-8 text-xs font-bold text-slate-800"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="text-xs font-medium text-slate-600 mb-1 block">{t('sendToApprove.filters.propertyDescription')}</label>
                        <SearchSelect
                            name="PropertyTypeId"
                            value={selectedPropertyDescription}
                            onChange={handleFilterChange}
                            options={propertyDescriptionOptions}
                            className="h-8 text-xs font-bold text-slate-800"
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-slate-200">
                <AutomationTable
                    columns={columns}
                    headerRows={headerRows}
                    data={paginatedData}
                    loading={false}
                    totalCount={totalCount}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    paginationConfig={{
                        enabled: true,
                        showPageSizeSelector: true
                    }}
                    rowClassName={(row) => selectedIds.includes(row.id) ? 'bg-blue-50/60 transition-colors' : 'transition-colors'}
                    containerClassName="h-full border-none shadow-none rounded-none"
                    maxBodyHeightClassName="max-h-[calc(100vh-270px)]"
                />
            </div>

            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={closeViewer}
                fileUrl={viewerDocumentGuid || ''}
                fileName={viewerDocumentGuid ? `Property_${viewerType === 'plan' ? 'Plan' : 'Image'}_${viewerPropertyNo}.jpg` : ''}
                propertyNo={viewerPropertyNo || '-'}
                wardNo={viewerWardNo || '-'}
            />
        </div>
    );
}
