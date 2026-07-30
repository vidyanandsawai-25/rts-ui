'use client';

import { useState, useMemo } from 'react';
import { AutomationTable } from '@/components/common/AutomationTable';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { getPropertyDashboardColumns, getPropertyDashboardHeaderRows } from './PropertyDashboardColumns';
import { PropertyDashboardHeader } from './PropertyDashboardHeader';
import { DocumentViewerModal } from '@/components/common';
import { PropertySubGridDetailsItems, PropertySubGridProperty, WardItem, PropertyTypeMasterItem } from '@/types/automation-dashboard/property-dashboard/property-subgrid-details.type';
import { handleLocationClick } from '@/lib/utils/automation-dashboard/mapUtils';
interface PropertyMainDashboardProps {
    serverData?: PropertySubGridDetailsItems | null;
    wardsData?: WardItem[] | null;
    propertyType?: PropertyTypeMasterItem[] | null;
}

export const propertyTypeOptions = [
    { value: 'All', label: 'All Types' },
    { value: '1', label: 'Residential' },
    { value: '2', label: 'NonResidential' },
    { value: '3', label: 'Mixed' },
    { value: '4', label: 'OpenPlots' },
    { value: '5', label: 'PublicUtility' },
    { value: '6', label: 'UnderConstruction' }
];

export const assessmentTypeOptions = [
    { value: 'All', label: 'All' },
    { value: 'Assessed', label: 'Assessed' },
    { value: 'Unassessed', label: 'Unassessed' }
];

const PropertyMainDashboardClient = ({ serverData, wardsData, propertyType }: PropertyMainDashboardProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('automationDashboard.propertyDetailsDashboard');
    const params = useParams();
    const pathZoneId = params?.zoneId as string;

    const stage = searchParams.get('stage') || 'geoSequencing';
    const workflowStageId = searchParams.get('workflowStageId');
    const source = searchParams.get('source') || 'division';

    const backUrl = useMemo(() => {
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl) {
            return decodeURIComponent(returnUrl);
        }
        return `/${locale}/property-tax/automation-dashboard`;
    }, [locale, searchParams]);

    const pageNumber = parseInt(searchParams.get('pageNumber') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const [searchTerm, setSearchTerm] = useState('');

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState('All');
    
    const selectedWard = searchParams.get('wardId') || 'All';
    const setSelectedWard = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('wardId', val);
        params.set('pageNumber', '1');
        router.push(`?${params.toString()}`);
    };

    const [selectedDescription, setSelectedDescription] = useState('All');
    const [selectedPropertyType, setSelectedPropertyType] = useState('All');
    const [selectedAssessmentType, setSelectedAssessmentType] = useState('All');

    const zoneOptions = [
        { value: 'All', label: 'All Zones' },
        { value: pathZoneId || 'MU', label: pathZoneId || 'MU' }
    ];

    const wardOptions = useMemo(() => {
        const mapped = (wardsData || [])?.map((item) => ({ label: item?.wardNo, value: String(item?.id) }));
        return [{ value: 'All', label: 'All Ward' }]?.concat(mapped);
    }, [wardsData]);

    const descriptionOptions = useMemo(() => {
        const mapped = (propertyType || [])?.map((item) => ({ label: item?.propertyDescription, value: String(item?.id) }));
        return [{ value: 'All', label: 'All Descriptions' }]?.concat(mapped);
    }, [propertyType]);

    const handleClearFilters = () => {
        setSelectedZone('All');
        setSelectedDescription('All');
        setSelectedPropertyType('All');
        setSelectedAssessmentType('All');
        setSearchTerm('');

        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.delete('wardId');
        currentParams.set('pageNumber', '1');
        router.push(`?${currentParams.toString()}`);
    };

    const headerRows = getPropertyDashboardHeaderRows(t);

    const handleImageClick = (row: PropertySubGridProperty) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('imageId', row.propertyId.toString());
        router.push(`?${currentParams.toString()}`);
    };

    const closeViewer = () => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.delete('imageId');
        router.push(`?${currentParams.toString()}`);
    };

    const imageId = searchParams.get('imageId');
    const selectedPropertyForImage = useMemo(() => {
        if (!serverData || !serverData.properties) return null;
        return serverData.properties.find(p => p.propertyId.toString() === imageId) || null;
    }, [imageId, serverData]);

    const isViewerOpen = !!selectedPropertyForImage;
    const imageUrl = selectedPropertyForImage?.documentGuid || 'https://images.unsplash.com/photo-1546412414-e1885259563a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    const columns = getPropertyDashboardColumns(t, handleImageClick);

    const totalCount = serverData?.totalCount || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paginatedData = serverData?.properties || [];

    const handlePageChange = (newPageNumber: number) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('pageNumber', newPageNumber.toString());
        currentParams.set('pageSize', pageSize.toString());
        router.push(`?${currentParams.toString()}`);
    };

    const handlePageSizeChange = (newSize: number) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('pageNumber', '1');
        currentParams.set('pageSize', newSize.toString());
        router.push(`?${currentParams.toString()}`);
    };

    const renderActions = (row: PropertySubGridProperty) => {
        const sourceParam = source ? `&source=${source}` : '';
        const workflowStageIdParam = workflowStageId ? `&workflowStageId=${workflowStageId}` : '';
        const returnUrlParam = searchParams.get('returnUrl') ? `&returnUrl=${encodeURIComponent(searchParams.get('returnUrl')!)}` : '';
        return (
            <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <Link
                    href={`/${locale}/property-tax/automation-dashboard/property-details-dashboard/${pathZoneId}/PropertyReport/${row.propertyId}?zoneId=${pathZoneId}&stage=${stage}${sourceParam}${workflowStageIdParam}${returnUrlParam}`}
                    className="h-7 w-[70px] rounded-full text-xs flex items-center justify-center font-bold bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors cursor-pointer select-none"
                >
                    {t('actions.report')}
                </Link>
                <Link
                    href={`/${locale}/property-tax/automation-dashboard/property-details-dashboard/${pathZoneId}/PropertyTracking/${row.propertyId}?zoneId=${pathZoneId}&stage=${stage}${sourceParam}${workflowStageIdParam}${returnUrlParam}`}
                    className="h-6 w-[70px] rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors flex items-center justify-center cursor-pointer select-none"
                >
                    {t('actions.tracking')}
                </Link>
                <div
                    className="h-8 w-8 mt-0.5 hover:bg-slate-100 transition-colors flex items-center justify-center rounded-full animate-shimmer cursor-pointer"
                    title="Location"
                    onClick={() => handleLocationClick(row)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282015-2020%29.svg" alt="Location" className="h-6 w-6" />
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full flex-col gap-4 overflow-hidden bg-gray-50 p-2">
            <PropertyDashboardHeader
                backUrl={backUrl}
                division={pathZoneId || ''}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                stage={stage}
                columnName={searchParams.get('columnName') || undefined}

                isFilterOpen={isFilterOpen}
                onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
                onClearFilters={handleClearFilters}

                selectedZone={selectedZone}
                setSelectedZone={setSelectedZone}
                zoneOptions={zoneOptions}

                selectedWard={selectedWard}
                setSelectedWard={setSelectedWard}
                wardOptions={wardOptions}

                selectedDescription={selectedDescription}
                setSelectedDescription={setSelectedDescription}
                descriptionOptions={descriptionOptions}

                selectedPropertyType={selectedPropertyType}
                setSelectedPropertyType={setSelectedPropertyType}
                propertyTypeOptions={propertyTypeOptions}

                selectedAssessmentType={selectedAssessmentType}
                setSelectedAssessmentType={setSelectedAssessmentType}
                assessmentTypeOptions={assessmentTypeOptions}
            />

            {/* Main Table */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
                <AutomationTable
                    columns={columns}
                    headerRows={headerRows}
                    data={paginatedData}
                    renderActions={renderActions}
                    tableClassName="border-collapse w-full border border-slate-300 [&_tbody>tr>td]:border [&_tbody>tr>td]:border-slate-300 hover:[&_tbody>tr]:bg-slate-50"
                    theadClassName="[&>tr>th]:border [&>tr>th]:border-slate-300"
                    paginationConfig={{ enabled: true, showPageSizeSelector: true }}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    getRowKey={(row) => row.propertyId}
                />
            </div>

            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={closeViewer}
                fileUrl={imageUrl}
                fileName={selectedPropertyForImage ? `Property_Image_${selectedPropertyForImage.propertyNo}.jpg` : ''}
                propertyNo={selectedPropertyForImage?.propertyNo || '-'}
                wardNo={'-'}
            />
        </div>
    );
};

export default PropertyMainDashboardClient;