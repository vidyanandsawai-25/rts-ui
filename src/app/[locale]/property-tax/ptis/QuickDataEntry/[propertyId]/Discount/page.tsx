
import { setRequestLocale } from 'next-intl/server';
import DiscountFormview from "@/components/modules/property-tax/ptis/QuickDataEntry/discount/DiscountFormview";
import {
    getDiscountDetailsAction, getSocialAttributeMasterAction, getDiscountWingsAction,
    getDiscountUnitsAction, getPropertySocialDetailsByFiltersAction
} from './discount-actions';
import { getPropertySocialInfoAction } from './social-actions';
import { getPropertyBasicDetailsAction } from '../FloorSubmission/actions';
import type { WingOption, UnitSelectionItem } from "@/types/building-permission.types";
import type { PropertySocialDetailsDto } from "@/types/property-social-details.types";

export const dynamic = 'force-dynamic';
interface PageProps {
    params: Promise<{ locale: string; propertyId: string }>;
    searchParams: Promise<{
        view?: string;
        propertyCategory?: string;
        category?: string;
        societyDetailId?: string;
        societyId?: string;
        wingDetailId?: string | string[];
        level?: string;
        socialAttributeId?: string;
        isWingWise?: string;
        unitPropertyId?: string;
        propertyId?: string;
    }>;
}

export default async function DiscountFormPage({ params, searchParams }: PageProps) {
    const { locale, propertyId } = await params;
    const resolvedSearchParams = await searchParams;
    const activeTab = resolvedSearchParams.view || "discount";

    setRequestLocale(locale);

    const propertyBasicDetails = await getPropertyBasicDetailsAction(propertyId);
    const pb = (propertyBasicDetails || {}) as Record<string, unknown>;

    const sp = resolvedSearchParams;
    const sCat = String(sp.propertyCategory || sp.category || '').toLowerCase();
    const bCat = String(pb.categoryName || pb.propertyCategoryName || '').toLowerCase();
    const isExplicitIndividual = sCat.includes('individual') || bCat.includes('individual');
    const isExplicitApartment =
        sCat.includes('apartment') ||
        sCat.includes('society') ||
        sCat.includes('flat') ||
        sCat.includes('complex') ||
        bCat.includes('apartment') ||
        bCat.includes('society') ||
        bCat.includes('flat') ||
        bCat.includes('complex');
    const isWingWise = sp.isWingWise === 'true';

    let searchSocietyId = sp.societyDetailId || sp.societyId || pb.societyDetailId || pb.societyId;
    const hasSocietyId = Boolean(
        (searchSocietyId && String(searchSocietyId) !== '0') ||
        (pb.societyDetailId && Number(pb.societyDetailId) > 0) ||
        (pb.societyId && Number(pb.societyId) > 0)
    );

    const isSociety = !isExplicitIndividual && (isExplicitApartment || hasSocietyId);

    let discountResponse: Awaited<ReturnType<typeof getDiscountDetailsAction>> | { data: null } = { data: null };
    let socialResponse: Awaited<ReturnType<typeof getPropertySocialInfoAction>> | { data: { items: null } } = { data: { items: null } };
    let socialAttributeMaster: Awaited<ReturnType<typeof getSocialAttributeMasterAction>> = { success: true, data: [] };
    let mappedWings: WingOption[] = [];
    let mappedUnits: UnitSelectionItem[] = [];
    let savedDetails: PropertySocialDetailsDto[] = [];
    let allAppliedDetails: PropertySocialDetailsDto[] = [];
    let finalWingDetailId: number | null = null;
    let targetUnitPropId: number | undefined;
    const level = sp.level || (isWingWise ? 'Wing' : 'Apartment');

    if (isSociety) {
        // For society, call master API and also fetch wings and units
        const rawWingDetailId = sp.wingDetailId;
        const searchWingDetailId = Array.isArray(rawWingDetailId) ? rawWingDetailId[0] : rawWingDetailId;
        const parsedWingDetailId = searchWingDetailId ? Number(searchWingDetailId) : null;

        const wingsResponse = await getDiscountWingsAction(propertyId, searchSocietyId ? Number(searchSocietyId) : undefined);
        mappedWings = wingsResponse?.success && Array.isArray(wingsResponse?.data) ? wingsResponse.data : [];

        if (!searchSocietyId && mappedWings.length > 0) {
            const firstW = mappedWings[0] as unknown as Record<string, unknown>;
            const wingSocId = firstW.societyDetailId || firstW.SocietyDetailId || firstW.societyId || firstW.SocietyId;
            if (wingSocId) {
                searchSocietyId = String(wingSocId);
            }
        }

        finalWingDetailId = parsedWingDetailId;
        if (!finalWingDetailId && mappedWings.length > 0) {
            finalWingDetailId = mappedWings[0].wingDetailId;
        }

        targetUnitPropId = sp.unitPropertyId
            ? Number(sp.unitPropertyId)
            : (level === 'Unit' && sp.propertyId && sp.propertyId !== String(searchSocietyId) ? Number(sp.propertyId) : undefined);

        const socIdNum = searchSocietyId ? Number(searchSocietyId) : undefined;

        // Fetch master attributes, units, and hierarchical levels in parallel
        const [masterRes, unitsResponse, apartmentDetailsRes, wingDetailsRes, unitDetailsRes] = await Promise.all([
            getSocialAttributeMasterAction(),
            finalWingDetailId && finalWingDetailId > 0
                ? getDiscountUnitsAction(propertyId, finalWingDetailId, 1, 1000)
                : Promise.resolve({ success: true, data: { items: [], totalCount: 0 } }),
            socIdNum
                ? getPropertySocialDetailsByFiltersAction(undefined, socIdNum)
                : Promise.resolve({ success: true, data: [] as PropertySocialDetailsDto[] }),
            (socIdNum && finalWingDetailId && (level === 'Wing' || level === 'Unit'))
                ? getPropertySocialDetailsByFiltersAction(undefined, socIdNum, finalWingDetailId)
                : Promise.resolve({ success: true, data: [] as PropertySocialDetailsDto[] }),
            (socIdNum && targetUnitPropId && level === 'Unit')
                ? getPropertySocialDetailsByFiltersAction(undefined, socIdNum, finalWingDetailId || undefined, targetUnitPropId)
                : Promise.resolve({ success: true, data: [] as PropertySocialDetailsDto[] })
        ]);

        socialAttributeMaster = masterRes;
        mappedUnits = unitsResponse?.success && unitsResponse?.data?.items && Array.isArray(unitsResponse.data.items) ? unitsResponse.data.items : [];

        // Hierarchical top-down merge: Apartment -> Wing -> Unit
        const mergedDetailsMap = new Map<number, PropertySocialDetailsDto>();

        // 1. Apartment level attributes (baseline)
        const apartmentItems = (apartmentDetailsRes?.success && Array.isArray(apartmentDetailsRes.data)) ? apartmentDetailsRes.data : [];
        const wingItems = (wingDetailsRes?.success && Array.isArray(wingDetailsRes.data)) ? wingDetailsRes.data : [];
        const unitItems = (unitDetailsRes?.success && Array.isArray(unitDetailsRes.data)) ? unitDetailsRes.data : [];

        apartmentItems.forEach(item => {
            mergedDetailsMap.set(item.socialAttributeId, {
                ...item,
                entityType: item.entityType || 'S',
                inheritanceLevel: level === 'Apartment' ? 'Self' : 'Apartment',
                inheritedFrom: level === 'Apartment' ? null : 'Apartment',
            });
        });

        // 2. Wing level overrides (applied when level === 'Wing' or level === 'Unit')
        if (level === 'Wing' || level === 'Unit') {
            wingItems.forEach(item => {
                const isWingEntity = item.entityType === 'W' || (item.wingDetailId && !item.propertyId);
                if (isWingEntity) {
                    mergedDetailsMap.set(item.socialAttributeId, {
                        ...item,
                        entityType: 'W',
                        inheritanceLevel: level === 'Wing' ? 'Self' : 'Wing',
                        inheritedFrom: level === 'Wing' ? null : 'Wing',
                    });
                }
            });
        }

        // 3. Unit level overrides (applied when level === 'Unit')
        if (level === 'Unit') {
            unitItems.forEach(item => {
                const isUnitEntity = item.entityType === 'P' || (item.propertyId && item.propertyId > 0);
                if (isUnitEntity) {
                    mergedDetailsMap.set(item.socialAttributeId, {
                        ...item,
                        entityType: 'P',
                        inheritanceLevel: 'Self',
                        inheritedFrom: null,
                    });
                }
            });
        }

        savedDetails = Array.from(mergedDetailsMap.values());

        const allAppliedMap = new Map<string, PropertySocialDetailsDto>();
        [...apartmentItems, ...wingItems, ...unitItems].forEach(item => {
            const key = item.id ? `id-${item.id}` : `${item.socialAttributeId}-${item.entityType}-${item.wingDetailId ?? '0'}-${item.propertyId ?? '0'}`;
            allAppliedMap.set(key, item);
        });
        allAppliedDetails = Array.from(allAppliedMap.values());

        // dataType and the document/photo flags only exist on the master list.
        const masterById = new Map((masterRes.data || []).map(a => [a.id, a]));

        // Filter saved details so discount tab strictly gets discount attributes and social tab strictly gets social attributes
        const discountSavedDetails = savedDetails.filter(item => {
            const master = masterById.get(item.socialAttributeId);
            return master?.isDiscountApplicable === true;
        });

        const socialSavedDetails = savedDetails.filter(item => {
            const master = masterById.get(item.socialAttributeId);
            return master && master.isDiscountApplicable === false;
        });

        const mapToItem = (item: PropertySocialDetailsDto, isDiscount: boolean) => {
            const master = masterById.get(item.socialAttributeId);
            return {
                id: item.socialAttributeId,
                socialAttributeCode: item.socialAttributeCode || master?.socialAttributeCode || '',
                socialAttributeName: item.socialAttributeName || master?.socialAttributeName || (item.socialAttributeCode ? item.socialAttributeCode : `Attribute #${item.socialAttributeId}`),
                dataType: master?.dataType || 'BIT',
                unit: master?.unit,
                displayOrder: master?.displayOrder,
                isPhotoRequired: master?.isPhotoRequired,
                isDocumentRequired: master?.isDocumentRequired,
                isActive: master?.isActive,
                isDiscountApplicable: master?.isDiscountApplicable ?? isDiscount,
                propertySocialDetailId: item.id,
                bitValue: item.bitValue,
                intValue: item.intValue,
                decimalValue: item.decimalValue,
                textValue: item.textValue,
                dateValue: item.dateValue,
                documentBindingId: item.documentBindingId,
                documentGuid: item.documentGuid,
                documentUrl: item.documentUrl || (item.documentGuid ? `/api/documents/${item.documentGuid}/view` : undefined),
                fileName: item.fileName,
                photoGuid: item.photoGuid,
                photoBindingId: item.photoBindingId,
                remark: item.remark,
                entityType: item.entityType,
                inheritedFrom: item.inheritedFrom,
                inheritanceLevel: item.inheritanceLevel,
            };
        };

        discountResponse = {
            success: true,
            data: {
                propertyId: Number(propertyId),
                discountAttributes: discountSavedDetails.map(item => mapToItem(item, true))
            }
        };

        socialResponse = {
            success: true,
            data: {
                success: true,
                message: "Success",
                items: {
                    propertyId: Number(propertyId),
                    societyDetailId: socIdNum,
                    wingDetailId: finalWingDetailId,
                    socialAttributes: socialSavedDetails.map(item => ({
                        ...mapToItem(item, false),
                        parentAttributeId: masterById.get(item.socialAttributeId)?.parentAttributeId ?? null,
                        isRequiredWhenParentTrue: masterById.get(item.socialAttributeId)?.isRequiredWhenParentTrue ?? false,
                        photoTypeId: null,
                        children: []
                    }))
                }
            }
        };
    } else {
        // For individuals, fetch details and master attributes in parallel
        const [discountRes, socialRes, masterRes] = await Promise.all([
            getDiscountDetailsAction(propertyId),
            getPropertySocialInfoAction(propertyId),
            getSocialAttributeMasterAction()
        ]);
        discountResponse = discountRes as unknown as typeof discountResponse;
        socialResponse = socialRes as unknown as typeof socialResponse;
        socialAttributeMaster = masterRes;
    }

    const initialDiscountData = discountResponse.data ?? null;
    const initialSocialData = socialResponse.data?.items ?? null;

    // Separate master attributes based on isDiscountApplicable
    const masterAttributes = socialAttributeMaster.data || [];
    const discountMasterAttributes = masterAttributes.filter(a => a.isDiscountApplicable === true);
    const socialMasterAttributes = masterAttributes.filter(a => a.isDiscountApplicable === false);

    return (
        <DiscountFormview
            key={`${propertyId}-${activeTab}-${level}-${finalWingDetailId ?? 'na'}-${targetUnitPropId ?? 'all'}`}
            initialDiscountData={initialDiscountData}
            initialSocialData={initialSocialData}
            propertyId={propertyId}
            isSociety={isSociety}
            societyDetailId={searchSocietyId ? Number(searchSocietyId) : undefined}
            wingDetailId={finalWingDetailId ?? undefined}
            discountMasterAttributes={discountMasterAttributes}
            socialMasterAttributes={socialMasterAttributes}
            wings={mappedWings}
            units={mappedUnits}
            savedPropertyDetails={allAppliedDetails.length > 0 ? allAppliedDetails : savedDetails}
        />
    );
}