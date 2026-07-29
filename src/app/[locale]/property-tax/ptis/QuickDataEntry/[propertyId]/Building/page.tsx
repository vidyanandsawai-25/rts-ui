import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import BuildingForm from "@/components/modules/property-tax/ptis/QuickDataEntry/building/BuildingForm";
import { getBuildingPermissionsAction, getFloorCertificatesAction } from "./action";
import {
    getFloorSubmissionsByOwnerAction,
    getFloorDataAction,
    getConstructionTypeDataAction,
    getTypeOfUseDataAction,
    getSubFloorDataAction,
    getSubTypeOfUseDataAction,
    getPropertyBasicDetailsAction,
} from '../FloorSubmission/actions';
import { normalizeArrayResponse } from '@/lib/utils/action-response-helpers';
import type { FloorResponse, ConstructionTypeResponse, TypeOfUseApiItem, SubFloorResponse, SubTypeOfUseResponse } from '@/types/floor-details.types';
import type { FloorData } from '@/types/room-details.types';

export const dynamic = 'force-dynamic';

interface BuildingPageProps {
    params: Promise<{ locale: string; propertyId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 1. The Suspense Skeleton UI
function BuildingFormSkeleton() {
    return (
        <div className="flex-1 flex flex-col min-h-0 h-full lg:h-[calc(100vh-125px)] max-h-[calc(100vh-125px)] overflow-hidden">
            <div className="bg-white rounded-xl border border-blue-100 flex flex-col flex-1 min-h-0 h-full overflow-hidden p-3 gap-3 animate-pulse">
                {/* Header Placeholder */}
                <div className="flex-shrink-0 space-y-2 pb-1.5 border-b border-blue-200">
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                </div>

                {/* Content Area Placeholder */}
                <div className="flex-1 min-h-0 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-4 xl:col-span-3 h-full min-h-0 bg-slate-50 rounded-xl border border-slate-100"></div>

                    {/* Main Form Skeleton */}
                    <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0 bg-slate-50 rounded-xl border border-slate-100"></div>
                </div>
            </div>
            
            {/* Save button fixed in the bottom corner placeholder */}
            <div className="flex justify-end p-2.5 md:p-3 bg-slate-50 border-t border-blue-100 flex-shrink-0 z-20">
                <div className="h-10 w-32 bg-slate-200 rounded-md"></div>
            </div>
        </div>
    );
}

// 2. The Data Loader Component (Server Component)
async function BuildingFormDataLoader({ 
    propertyId, 
    selectedFloorIdNum 
}: { 
    propertyId: string, 
    selectedFloorIdNum?: number 
}) {
    // Fetch building permissions, basic details, and floor lookups concurrently
    const [
        response,
        floorCertificatesResponse,
        floorDataResult,
        constructionTypeDataResult,
        subFloorDataResult,
        subTypeDataResult,
        initialFloorsRaw,
        propertyBasicDetails,
    ] = await Promise.all([
        getBuildingPermissionsAction(propertyId),
        getFloorCertificatesAction(propertyId, selectedFloorIdNum),
        getFloorDataAction(),
        getConstructionTypeDataAction(),
        getSubFloorDataAction(),
        getSubTypeOfUseDataAction(),
        getFloorSubmissionsByOwnerAction(propertyId),
        getPropertyBasicDetailsAction(propertyId),
    ]);

    const resolvedPropertyTypeId = propertyBasicDetails?.propertyTypeId;
    const useDataResult = await getTypeOfUseDataAction(resolvedPropertyTypeId);

    function checkResult<T>(res: unknown): T[] {
        if (res && typeof res === 'object' && 'success' in res && !(res as { success: boolean }).success) {
            return [];
        }
        return Array.isArray(res) ? (res as T[]) : [];
    }

    const floorData = checkResult<FloorResponse>(floorDataResult);
    const constructionTypeData = checkResult<ConstructionTypeResponse>(constructionTypeDataResult);
    const useData = checkResult<TypeOfUseApiItem>(useDataResult);
    const subFloorData = checkResult<SubFloorResponse>(subFloorDataResult);
    const subTypeData = checkResult<SubTypeOfUseResponse>(subTypeDataResult);
    const initialFloors = normalizeArrayResponse<FloorData>(initialFloorsRaw);

    return (
        <BuildingForm
            key={propertyId}
            initialBuildingPermission={response.data || null}
            initialFloorCertificates={floorCertificatesResponse.data || null}
            propertyId={propertyId}
            floorData={floorData}
            constructionTypeData={constructionTypeData}
            useData={useData}
            subFloorData={subFloorData}
            subTypeData={subTypeData}
            initialFloors={initialFloors}
        />
    );
}

// 3. Main Page Component
export default async function BuildingPage({ params, searchParams }: BuildingPageProps) {
    const { locale, propertyId } = await params;
    const sp = await searchParams;
    setRequestLocale(locale);

    // Extract selected floor ID from URL params if coming from Floor tab or floor URL
    const rawFloorId = sp.activeFloorId || sp.selectedPropertyDetailsId || sp.floorId;
    const activeFloorId = rawFloorId ? Number(Array.isArray(rawFloorId) ? rawFloorId[0] : rawFloorId) : undefined;
    const selectedFloorIdNum = activeFloorId && !isNaN(activeFloorId) ? activeFloorId : undefined;

    return (
        <Suspense fallback={<BuildingFormSkeleton />}>
            <BuildingFormDataLoader 
                propertyId={propertyId} 
                selectedFloorIdNum={selectedFloorIdNum} 
            />
        </Suspense>
    );
}