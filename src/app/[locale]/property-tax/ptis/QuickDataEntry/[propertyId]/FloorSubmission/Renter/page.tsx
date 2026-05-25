import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import RenterDetailsForm from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/Renter/RenterDetailsForm';
import { ExistingFloorData } from '@/lib/utils/renter-validation';
import { 
    getFloorByIdAction, 
    getPropertyByDetailsAction, 
    saveFloorRenterDetailsAction,
    getFloorDataAction,
    getConstructionTypeDataAction,
    getTypeOfUseDataAction,
    getSubTypeOfUseDataAction,
    getSubFloorDataAction,
    getFloorSubmissionsByOwnerAction
} from '../actions';
import { PageContainer } from '@/components/common/PageContainer';

import { cache } from 'react';

const getCachedFloorData = cache(() => getFloorDataAction());
const getCachedConstructionData = cache(() => getConstructionTypeDataAction());
const getCachedTypeOfUseData = cache(() => getTypeOfUseDataAction());
const getCachedSubTypeOfUseData = cache(() => getSubTypeOfUseDataAction());
const getCachedSubFloorData = cache(() => getSubFloorDataAction());

interface RenterDetailsPageProps {
    params: Promise<{ locale: string; propertyId: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function RenterDetailsPage({ params, searchParams }: RenterDetailsPageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);
    const resolvedParams = await searchParams;
    
    const floorId = resolvedParams.floorId || '';
    const wardNo = resolvedParams.wardNo || '';
    const propertyNo = resolvedParams.propertyNo || '';
    const partitionNo = resolvedParams.partitionNo || '';

    // Parallel fetching for performance with defensive error boundaries using Promise.allSettled
    const settledResults = await Promise.allSettled([
        floorId ? getFloorByIdAction(floorId) : Promise.resolve(null),
        (wardNo && propertyNo && partitionNo) ? getPropertyByDetailsAction(wardNo, propertyNo, partitionNo) : Promise.resolve(null),
        getCachedFloorData(),
        getCachedConstructionData(),
        getCachedTypeOfUseData(),
        getCachedSubTypeOfUseData(),
        getCachedSubFloorData(),
        propertyId ? getFloorSubmissionsByOwnerAction(propertyId) : Promise.resolve([])
    ]);

    const rawFloorResponse = settledResults[0].status === 'fulfilled' ? settledResults[0].value : null;
    const propertyRaw = settledResults[1].status === 'fulfilled' ? settledResults[1].value : null;
    const floorLookupRes = settledResults[2].status === 'fulfilled' ? settledResults[2].value : null;
    const constructionLookupRes = settledResults[3].status === 'fulfilled' ? settledResults[3].value : null;
    const useLookupRes = settledResults[4].status === 'fulfilled' ? settledResults[4].value : null;
    const subTypeLookupRes = settledResults[5].status === 'fulfilled' ? settledResults[5].value : null;
    const subFloorLookupRes = settledResults[6].status === 'fulfilled' ? settledResults[6].value : null;
    const existingFloorsRes = settledResults[7].status === 'fulfilled' ? settledResults[7].value : [];

    let initialFloorData: Record<string, unknown> | null = null;
    if (rawFloorResponse && typeof rawFloorResponse === 'object' && 'data' in rawFloorResponse) {
        initialFloorData = (rawFloorResponse as Record<string, unknown>).data as Record<string, unknown>;
    } else {
        initialFloorData = rawFloorResponse as Record<string, unknown>;
    }

    const fallbackPropertyInfo = {
        propertyName: String((propertyRaw as Record<string, unknown>)?.ownerName || "New Renter Registration"),
        floorNumber: String(initialFloorData?.subFloorName || "Select Floor"),
        zone: String((propertyRaw as Record<string, unknown>)?.zoneName || "Assigned Zone")
    };

    const propertyInfo = {
        propertyName: String(initialFloorData?.propertyName || fallbackPropertyInfo.propertyName),
        floorNumber: String(initialFloorData?.subFloorName || fallbackPropertyInfo.floorNumber),
        zone: String(initialFloorData?.zoneName || fallbackPropertyInfo.zone),
    };

    const lookups = {
        floorLookup: ((floorLookupRes as Record<string, unknown>)?.data as unknown[]) || [],
        constructionLookup: ((constructionLookupRes as Record<string, unknown>)?.data as unknown[]) || [],
        useLookup: ((useLookupRes as Record<string, unknown>)?.data as unknown[]) || [],
        subTypeLookup: ((subTypeLookupRes as Record<string, unknown>)?.data as unknown[]) || [],
        subFloorLookup: ((subFloorLookupRes as Record<string, unknown>)?.data as unknown[]) || []
    };

    let existingFloors: ExistingFloorData[] = [];
    if (Array.isArray(existingFloorsRes)) {
        existingFloors = existingFloorsRes as ExistingFloorData[];
    } else if (existingFloorsRes && typeof existingFloorsRes === 'object' && 'success' in existingFloorsRes && (existingFloorsRes as Record<string, unknown>).success && Array.isArray((existingFloorsRes as Record<string, unknown>).data)) {
        existingFloors = (existingFloorsRes as Record<string, unknown>).data as ExistingFloorData[];
    } else if (existingFloorsRes && typeof existingFloorsRes === 'object' && Array.isArray((existingFloorsRes as Record<string, unknown>).items)) {
        existingFloors = (existingFloorsRes as Record<string, unknown>).items as ExistingFloorData[];
    }

    return (
        <PageContainer>
            <Suspense fallback={<div className="p-8 flex items-center justify-center">Loading Renter Screen...</div>}>
                <div className="flex flex-col flex-1 w-full">
                    <RenterDetailsForm 
                        initialData={initialFloorData} 
                        propertyInfo={propertyInfo} 
                        wardNo={wardNo}
                        propertyNo={propertyNo}
                        partitionNo={partitionNo}
                        propertyId={propertyId}
                        floorId={floorId}
                        saveAction={saveFloorRenterDetailsAction}
                        existingFloors={existingFloors}
                        {...lookups}
                    />
                </div>
            </Suspense>
        </PageContainer>
    );
}

