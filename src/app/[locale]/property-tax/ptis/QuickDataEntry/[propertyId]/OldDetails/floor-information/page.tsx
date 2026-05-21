import FloorInformationForm from '@/components/modules/property-tax/ptis/QuickDataEntry/old-details/FloorInformation/FloorInformationForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
    getFloorsAction,
    getSubFloorsAction,
    getConstructionTypesAction,
    getTypeOfUsesAction,
    getSubTypeOfUsesAction,
    getOldFloorDetailsAction
} from './action';

import { Floor, SubFloor, ConstructionType, TypeOfUse, SubTypeOfUse, OldFloorDetail } from '@/types/property-old-details.types';

import { ActionResult } from '@/types/common.types';

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

    let floors: Floor[] = [];
    let subFloors: SubFloor[] = [];
    let constructionTypes: ConstructionType[] = [];
    let useTypes: TypeOfUse[] = [];
    let subUseTypeList: SubTypeOfUse[] = [];
    let existingFloors: OldFloorDetail[] = [];

    try {
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
                : Promise.resolve({ success: true, data: [] as SubTypeOfUse[] } as ActionResult<SubTypeOfUse[]>),
            getOldFloorDetailsAction(Number(propertyId))
        ]);

        // ✅ Consolidated error handling (for master data and existing floor details)
        const masterDataResponses = [floorsRes, subFloorsRes, constructionTypesRes, typeOfUseRes, oldFloorDetailsRes, subUseTypesRes];
        const failedMasterResponse = masterDataResponses.find(res => !res.success);

        if (failedMasterResponse && !failedMasterResponse.success) {
            throw new Error(failedMasterResponse.error || 'Failed to load floor data');
        }

        // ✅ Extract data from successful responses
        floors = floorsRes.success ? (floorsRes.data ?? []) : [];
        subFloors = subFloorsRes.success ? (subFloorsRes.data ?? []) : [];
        constructionTypes = constructionTypesRes.success ? (constructionTypesRes.data ?? []) : [];
        useTypes = typeOfUseRes.success ? (typeOfUseRes.data ?? []) : [];
        subUseTypeList = subUseTypesRes.success ? (subUseTypesRes.data ?? []) : [];
        existingFloors = oldFloorDetailsRes.success ? (oldFloorDetailsRes.data ?? []) : [];
    } catch (error: unknown) {
        const t = await getTranslations({ locale, namespace: 'quickDataEntry' });
        const msg = error instanceof Error ? error.message.toLowerCase() : "";
        if (msg.includes('unauthorized') || msg.includes('token expired') || msg.includes('token is expired')) {
            throw new Error(t('oldDetails.error.unauthorized'));
        }
        if (msg.includes('forbidden')) {
            throw new Error(t('oldDetails.error.forbidden'));
        }
        if (msg.includes('not found')) {
            throw new Error(t('oldDetails.error.notFound'));
        }
        if (msg.includes('fetch failed') || msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('econnrefused')) {
            throw new Error(t('oldDetails.error.failedToConnect'));
        }
        throw error;
    }

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
