import FloorInformationForm from '@/components/modules/property-tax/ptis/QuickDataEntry/old-details/FloorInformation/FloorInformationForm';
import { setRequestLocale } from 'next-intl/server';
import {
    GetFloorsAction,
    GetSubFloorsAction,
    GetConstructionTypesAction,
    GetTypeOfUsesAction,
    GetSubTypeOfUsesAction,
    GetOldFloorDetailsAction
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

    // ✅ Parallel API calls with individual actions for better granularity
    const [
        floorsRes,
        subFloorsRes,
        constructionTypesRes,
        TypeOfUseRes,
        subUseTypesRes,
        oldFloorDetailsRes
    ] = await Promise.all([
        GetFloorsAction(1, -1),
        GetSubFloorsAction(1, -1),
        GetConstructionTypesAction(1, -1),
        GetTypeOfUsesAction(1, -1),
        typeOfUseId ? GetSubTypeOfUsesAction(Number(typeOfUseId),1,-1) : Promise.resolve({ success: true, data: [] as SubTypeOfUse[] }),
        GetOldFloorDetailsAction(Number(propertyId))
    ]);

    // ✅ Consolidated error handling (for master data)
    const masterDataResponses = [floorsRes, subFloorsRes, constructionTypesRes, TypeOfUseRes];
    const failedMasterResponse = masterDataResponses.find(res => !res.success);

    if (failedMasterResponse && !failedMasterResponse.success) {
        throw new Error(failedMasterResponse.error || 'Failed to load floor master data');
    }

    // ✅ Extract data from successful responses
    const floors = floorsRes.success ? floorsRes.data : [];
    const subFloors = subFloorsRes.success ? subFloorsRes.data : [];
    const constructionTypes = constructionTypesRes.success ? constructionTypesRes.data : [];
    const useTypes = TypeOfUseRes.success ? TypeOfUseRes.data : [];
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
