import FloorInformationForm from '@/components/modules/property-tax/ptis/QuickDataEntry/old-details/FloorInformation/FloorInformationForm';
import { setRequestLocale } from 'next-intl/server';
import {
    getFloorsAction,
    getSubFloorsAction,
    getConstructionTypesAction,
    getTypeOfUsesAction,
    getSubTypeOfUsesAction,
    getOldFloorDetailsAction
} from './action';

import { SubTypeOfUse } from '@/types/property-old-details.types';

interface PageProps {
    params: Promise<{
        propertyId: string;
        locale: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FloorInformationPage({ params, searchParams }: PageProps) {
    const { locale, propertyId } = await params;
    const { typeOfUseId } = await searchParams;
    setRequestLocale(locale);

    const typeOfUseIdParam = Array.isArray(typeOfUseId) ? typeOfUseId[0] : typeOfUseId;
    const numericTypeOfUseId = typeOfUseIdParam ? Number(typeOfUseIdParam) : 0;

    // ✅ Parallel API calls with individual actions for better granularity
    const [
        floorsRes,
        subFloorsRes,
        constructionTypesRes,
        typeOfUseRes,
        subUseTypesRes,
        oldFloorDetailsRes
    ] = await Promise.all([
        getFloorsAction(1, -1),
        getSubFloorsAction(1, -1),
        getConstructionTypesAction(1, -1),
        getTypeOfUsesAction(1, -1),
        // Fetch sub-use types only if a valid typeOfUseId is provided
        numericTypeOfUseId > 0
            ? getSubTypeOfUsesAction(numericTypeOfUseId, 1, -1)
            : Promise.resolve({ success: true, data: [] as SubTypeOfUse[] }),
        getOldFloorDetailsAction(Number(propertyId))
    ]);

    // ✅ Consolidated error handling (for master data)
    const masterDataResponses = [floorsRes, subFloorsRes, constructionTypesRes, typeOfUseRes];
    const failedMasterResponse = masterDataResponses.find(res => !res.success);

    if (failedMasterResponse && !failedMasterResponse.success) {
        throw new Error(failedMasterResponse.error || 'Failed to load floor master data');
    }

    // ✅ Extract data from successful responses
    const floors = floorsRes.success ? floorsRes.data : [];
    const subFloors = subFloorsRes.success ? subFloorsRes.data : [];
    const constructionTypes = constructionTypesRes.success ? constructionTypesRes.data : [];
    const useTypes = typeOfUseRes.success ? typeOfUseRes.data : [];
    const subUseTypeList = subUseTypesRes.success ? subUseTypesRes.data : [];
    const existingFloors = oldFloorDetailsRes.success ? oldFloorDetailsRes.data : [];

    return (
        <FloorInformationForm
            floorOptions={floors}
            subFloorOptions={subFloors}
            constructionTypeOptions={constructionTypes}
            useOptions={useTypes}
            initialSubUseTypeOptions={subUseTypeList}
            existingFloorDetails={existingFloors}
        />
    );
}
