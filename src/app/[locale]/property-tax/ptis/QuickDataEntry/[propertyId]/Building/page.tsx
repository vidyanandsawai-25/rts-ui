import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import BuildingForm from "@/components/modules/property-tax/ptis/QuickDataEntry/building/BuildingForm";
import {
    getBuildingPermissionsAction,
    getSocietyWingTypesWithStatusAction,
    getWingsByPropertyAction,
    getUnitsByPropertyAction,
    getCertificateTypeMasterAction,
    getApartmentQcCertificateGridAction
} from "./action";
import {
    getFloorDataAction,
    getConstructionTypeDataAction,
    getTypeOfUseDataAction,
    getPropertyBasicDetailsAction,
} from '../FloorSubmission/actions';
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
    selectedFloorIdNum: _selectedFloorIdNum,
    searchCategory,
    searchSocietyId,
    searchWingDetailId,
    isWingWise,
    levelParam,
    rawSearchParams,
    locale,
}: {
    propertyId: string,
    selectedFloorIdNum?: number,
    searchCategory?: string,
    searchSocietyId?: string,
    searchWingDetailId?: string,
    returnTab?: string,
    isSocietyWise?: string,
    isWingWise?: string,
    levelParam?: string,
    rawSearchParams?: Record<string, string | string[] | undefined>,
    locale?: string,
}) {
    const targetPropId = null;
    const targetWingId = (levelParam === 'Wing' || levelParam === 'Unit') && searchWingDetailId ? Number(searchWingDetailId) : null;
    const targetSocId = (levelParam === 'Apartment' || !levelParam) && searchSocietyId ? Number(searchSocietyId) : null;

    // Fetch essential initial building permission, basic details, wings, units, and core lookup data concurrently
    const [
        response,
        floorDataResult,
        constructionTypeDataResult,
        propertyBasicDetails,
        wingsResult,
        unitsResult,
        certificateTypesResult,
        certificateGridResult,
    ] = await Promise.all([
        (isWingWise === 'true' && searchWingDetailId)
            ? getSocietyWingTypesWithStatusAction(null, Number(searchWingDetailId))
            : (searchSocietyId)
                ? getSocietyWingTypesWithStatusAction(Number(searchSocietyId), null)
                : getBuildingPermissionsAction(propertyId),
        getFloorDataAction(),
        getConstructionTypeDataAction(),
        getPropertyBasicDetailsAction(propertyId),
        getWingsByPropertyAction(propertyId),
        getUnitsByPropertyAction(propertyId, targetWingId, 1, 10),
        getCertificateTypeMasterAction(),
        getApartmentQcCertificateGridAction(
            targetPropId,
            targetWingId,
            targetSocId
        ),
    ]);

    const resolvedPropertyTypeId = propertyBasicDetails?.propertyTypeId;
    const useDataResult = resolvedPropertyTypeId ? await getTypeOfUseDataAction(resolvedPropertyTypeId) : [];

    function checkResult<T>(res: unknown): T[] {
        if (res && typeof res === 'object' && 'success' in res && !(res as { success: boolean }).success) {
            return [];
        }
        return Array.isArray(res) ? (res as T[]) : [];
    }

    const floorData = checkResult<FloorResponse>(floorDataResult);
    const constructionTypeData = checkResult<ConstructionTypeResponse>(constructionTypeDataResult);
    const useData = checkResult<TypeOfUseApiItem>(useDataResult);
    const subFloorData: SubFloorResponse[] = [];
    const subTypeData: SubTypeOfUseResponse[] = [];
    const initialFloors: FloorData[] = [];
    const floorCertificatesResponse = { success: true, data: null };

    // Process Wings SSR Data
    const rawWings = (wingsResult?.success && Array.isArray(wingsResult.data)) ? wingsResult.data as Record<string, unknown>[] : [];
    const initialWings = rawWings.map((w, idx) => {
        const rawName = String(
            w.wingName || w.WingName || w.societyWingName || w.SocietyWingName || w.name || w.Name || w.wingDescription || w.WingDescription || w.wingNo || w.WingNo || w.wing || w.Wing || w.blockName || w.BlockName || ''
        ).trim();
        if (!rawName) return null;
        return {
            wingDetailId: Number(w.wingDetailId || w.WingDetailId || w.societyWingId || w.SocietyWingId || w.id || w.Id || idx + 1),
            wingName: rawName,
        };
    }).filter((w): w is NonNullable<typeof w> => w !== null);

    // Process Units SSR Data
    const rawUnits = (unitsResult?.success && Array.isArray(unitsResult.data)) ? unitsResult.data as Record<string, unknown>[] : [];
    const initialUnits = rawUnits.map((u, idx) => ({
        propertyDetailsId: Number(u.propertyDetailsId || u.PropertyDetailsId || u.id || u.Id || idx + 1),
        propertyId: Number(u.propertyId || u.PropertyId || u.propertyDetailsId || u.PropertyDetailsId || 0),
        unitNo: String(u.unitNo || u.UnitNo || u.partitionNo || u.PartitionNo || u.flatNo || u.FlatNo || `Unit ${idx + 1}`),
        wingDetailId: Number(u.wingDetailId || u.WingDetailId || 0),
        wingName: String(u.wingName || u.WingName || 'Wing'),
        floorName: String(u.floorName || u.FloorName || u.floor || '1st Floor'),
        useName: String(u.useName || u.UseName || u.use || 'Residential'),
        isSelected: false,
    }));

    // Process Certificate Types Master SSR Data
    const rawTypes = (certificateTypesResult?.success && Array.isArray(certificateTypesResult.data)) ? certificateTypesResult.data as Record<string, unknown>[] : [];
    const initialCertificateTypes = rawTypes.map((item) => {
        const typeCode = String(item.certificateTypeCode || item.code || 'DOC');
        const typeName = String(item.certificateTypeName || item.name || typeCode);
        const typeId = Number(item.id || item.certificateTypeId || 0);
        return {
            certificateTypeId: typeId,
            certificateTypeCode: typeCode,
            certificateTypeName: typeName,
            badgeCode: typeCode.substring(0, 2).toUpperCase(),
        };
    });

    const initialCertificateGrid = certificateGridResult?.success ? certificateGridResult.data : null;

    const sCat = (searchCategory || '').toLowerCase();
    const pb = (propertyBasicDetails || {}) as Record<string, unknown>;
    const bCat = String(pb.categoryName || pb.propertyCategoryName || '').toLowerCase();

    // 1. Explicit Individual check
    const isExplicitIndividual = sCat.includes('individual') || bCat.includes('individual');

    // 2. Explicit Apartment / Society check
    const isExplicitApartment =
        sCat.includes('apartment') ||
        sCat.includes('society') ||
        sCat.includes('flat') ||
        sCat.includes('complex') ||
        bCat.includes('apartment') ||
        bCat.includes('society') ||
        bCat.includes('flat') ||
        bCat.includes('complex');

    // 3. Query params / Society ID check
    const hasSocietyId = Boolean(
        (searchSocietyId && String(searchSocietyId) !== '0') ||
        (pb.societyDetailId && Number(pb.societyDetailId) > 0) ||
        (pb.societyId && Number(pb.societyId) > 0)
    );

    const isSociety = !isExplicitIndividual && (isExplicitApartment || hasSocietyId);

    const resolvedSocietyDetailId = searchSocietyId
        ? Number(searchSocietyId)
        : (pb.societyDetailId ? Number(pb.societyDetailId) : (pb.societyId ? Number(pb.societyId) : null));

    // Redirect to include societyDetailId in searchParams if missing
    if (resolvedSocietyDetailId && !searchSocietyId && rawSearchParams && locale) {
        const params = new URLSearchParams();
        Object.entries(rawSearchParams).forEach(([k, v]) => {
            if (typeof v === 'string') params.set(k, v);
        });
        params.set('societyDetailId', String(resolvedSocietyDetailId));
        redirect(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building?${params.toString()}`);
    }

    return (
        <BuildingForm
            key={propertyId}
            initialBuildingPermission={response.data || null}
            initialFloorCertificates={floorCertificatesResponse.data || null}
            propertyId={propertyId}
            isSociety={isSociety}
            societyDetailId={resolvedSocietyDetailId}
            floorData={floorData}
            constructionTypeData={constructionTypeData}
            useData={useData}
            subFloorData={subFloorData}
            subTypeData={subTypeData}
            initialFloors={initialFloors}
            initialWings={initialWings}
            initialUnits={initialUnits}
            initialCertificateTypes={initialCertificateTypes}
            initialCertificateGrid={initialCertificateGrid}
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

    const rawCategory = sp.propertyCategory || sp.category;
    const searchCategory = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;

    const rawSocietyId = sp.societyDetailId || sp.societyId;
    const searchSocietyId = Array.isArray(rawSocietyId) ? rawSocietyId[0] : rawSocietyId;

    const rawWingDetailId = sp.wingDetailId;
    const searchWingDetailId = Array.isArray(rawWingDetailId) ? rawWingDetailId[0] : rawWingDetailId;

    const rawReturnTab = sp.returnTab;
    const returnTab = Array.isArray(rawReturnTab) ? rawReturnTab[0] : rawReturnTab;

    const rawIsSocietyWise = sp.isSocietyWise;
    const isSocietyWise = Array.isArray(rawIsSocietyWise) ? rawIsSocietyWise[0] : rawIsSocietyWise;

    const rawIsWingWise = sp.isWingWise;
    const isWingWise = Array.isArray(rawIsWingWise) ? rawIsWingWise[0] : rawIsWingWise;

    const rawLevel = sp.level;
    const levelParam = Array.isArray(rawLevel) ? rawLevel[0] : rawLevel;

    return (
        <Suspense fallback={<BuildingFormSkeleton />}>
            <BuildingFormDataLoader
                propertyId={propertyId}
                selectedFloorIdNum={selectedFloorIdNum}
                searchCategory={searchCategory}
                searchSocietyId={searchSocietyId}
                searchWingDetailId={searchWingDetailId}
                returnTab={returnTab}
                isSocietyWise={isSocietyWise}
                isWingWise={isWingWise}
                levelParam={levelParam}
                rawSearchParams={sp}
                locale={locale}
            />
        </Suspense>
    );
}