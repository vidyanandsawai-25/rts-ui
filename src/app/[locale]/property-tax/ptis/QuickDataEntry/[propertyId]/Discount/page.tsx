
import { setRequestLocale } from 'next-intl/server';
import DiscountFormview from "@/components/modules/property-tax/ptis/QuickDataEntry/discount/DiscountFormview";
import { getDiscountDetailsAction, getSocialAttributeMasterAction, getDiscountWingsAction,
     getDiscountUnitsAction, getPropertySocialDetailsByFiltersAction 
    } from './discount-actions';
import { getPropertySocialInfoAction } from './social-actions';
import { getPropertyBasicDetailsAction } from '../FloorSubmission/actions';
import type { WingOption, UnitSelectionItem } from "@/types/building-permission.types";

export const dynamic = 'force-dynamic';
interface PageProps {
    params: Promise<{ locale: string; propertyId: string }>;
    searchParams: Promise<{ view?: string; propertyCategory?: string; category?: string; societyDetailId?: string; societyId?: string; wingDetailId?: string | string[]; level?: string; socialAttributeId?: string; isWingWise?: string }>;
}

export default async function DiscountFormPage({ params, searchParams }: PageProps) {
    const { locale, propertyId } = await params;
    const resolvedSearchParams = await searchParams;
    const activeTab = resolvedSearchParams.view || "discount";

    setRequestLocale(locale);

    const propertyBasicDetails = await getPropertyBasicDetailsAction(propertyId);

    const pb = (propertyBasicDetails || {}) as Record<string, unknown>;
    const sp = resolvedSearchParams;
    const isWingWise = sp.isWingWise === 'true';
    const rawCategory = sp.propertyCategory || sp.category;
    const searchCategory = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
    const sCat = (searchCategory || '').toLowerCase();
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

    const searchSocietyId = sp.societyDetailId || sp.societyId;
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
    let finalWingDetailId: number | null = null;
    const level = sp.level || (isWingWise ? 'Wing' : 'Apartment');

    if (isSociety) {
        // For society, call master API and also fetch wings and units
        const rawWingDetailId = sp.wingDetailId;
        const searchWingDetailId = Array.isArray(rawWingDetailId) ? rawWingDetailId[0] : rawWingDetailId;
        const parsedWingDetailId = searchWingDetailId ? Number(searchWingDetailId) : null;

        const wingsResponse = await getDiscountWingsAction(propertyId);
        mappedWings = wingsResponse?.success && Array.isArray(wingsResponse?.data) ? wingsResponse.data : [];

        finalWingDetailId = parsedWingDetailId;
        if (!finalWingDetailId && mappedWings.length > 0) {
            finalWingDetailId = mappedWings[0].wingDetailId;
        }      
        const WingDetilasId = level === 'Apartment' ? null : finalWingDetailId

        const isDiscountTab = activeTab === 'discount';

        const [masterRes, unitsResponse, savedDetailsResponse] = await Promise.all([
            getSocialAttributeMasterAction(isDiscountTab),
            getDiscountUnitsAction(propertyId, finalWingDetailId, 1, 10),
            // No socialAttributeId filter: every saved attribute of the wing is needed, not just the selected one.
            searchSocietyId ? getPropertySocialDetailsByFiltersAction(undefined, Number(searchSocietyId), WingDetilasId || undefined) : Promise.resolve({ success: true, data: [] })
        ]);
        socialAttributeMaster = masterRes;

        mappedUnits = unitsResponse?.success && unitsResponse?.data?.items && Array.isArray(unitsResponse.data.items) ? unitsResponse.data.items : [];

        // An empty result must still produce an empty payload so the previous wing's data is cleared.
        const savedDetails = savedDetailsResponse?.success && Array.isArray(savedDetailsResponse.data)
            ? savedDetailsResponse.data
            : [];           

        // dataType and the document/photo flags only exist on the master list.
        const masterById = new Map((masterRes.data || []).map(a => [a.id, a]));

        // Filter saved details so discount tab gets discount attributes and social tab gets social attributes
        const filteredSavedDetails = savedDetails.filter(item => {
            const master = masterById.get(item.socialAttributeId);
            if (!master) return true; // Keep if not in master list
            return isDiscountTab ? master.isDiscountApplicable === true : master.isDiscountApplicable === false;
        });

        const mappedAttributes = filteredSavedDetails.map(item => {
            const master = masterById.get(item.socialAttributeId);
            return {
                id: item.socialAttributeId,
                socialAttributeCode: item.socialAttributeCode || master?.socialAttributeCode || '',
                socialAttributeName: item.socialAttributeName || master?.socialAttributeName || '',
                dataType: master?.dataType || 'BIT',
                unit: master?.unit,
                displayOrder: master?.displayOrder,
                isPhotoRequired: master?.isPhotoRequired,
                isDocumentRequired: master?.isDocumentRequired,
                isActive: master?.isActive,
                isDiscountApplicable: master?.isDiscountApplicable ?? isDiscountTab,
                propertySocialDetailId: item.id,
                bitValue: item.bitValue,
                intValue: item.intValue,
                decimalValue: item.decimalValue,
                textValue: item.textValue,
                dateValue: item.dateValue,
                documentBindingId: item.documentBindingId,
                documentGuid: item.documentGuid,
                photoGuid: item.photoGuid,
                photoBindingId: item.photoBindingId,
                remark: item.remark
            };
        });

        if (isDiscountTab) {
            discountResponse = {
                success: true,
                data: {
                    propertyId: Number(propertyId),
                    discountAttributes: mappedAttributes.map(attr => ({
                        id: attr.id,
                        socialAttributeCode: attr.socialAttributeCode,
                        socialAttributeName: attr.socialAttributeName,
                        dataType: attr.dataType,
                        unit: attr.unit,
                        displayOrder: attr.displayOrder,
                        isDiscountApplicable: attr.isDiscountApplicable,
                        propertySocialDetailId: attr.propertySocialDetailId,
                        bitValue: attr.bitValue,
                        intValue: attr.intValue,
                        decimalValue: attr.decimalValue,
                        textValue: attr.textValue,
                        dateValue: attr.dateValue,
                        documentBindingId: attr.documentBindingId,
                        documentGuid: attr.documentGuid,
                        remark: attr.remark,
                        isPhotoRequired: attr.isPhotoRequired,
                        isDocumentRequired: attr.isDocumentRequired,
                        isActive: attr.isActive,
                    }))
                }
            };
        } else {
            socialResponse = {
                success: true,
                data: {
                    success: true,
                    message: "Success",
                    items: {
                        propertyId: Number(propertyId),
                        socialAttributes: mappedAttributes.map(attr => ({
                            id: attr.id,
                            socialAttributeCode: attr.socialAttributeCode,
                            socialAttributeName: attr.socialAttributeName,
                            dataType: attr.dataType,
                            unit: attr.unit,
                            displayOrder: attr.displayOrder,
                            parentAttributeId: null,
                            isRequiredWhenParentTrue: false,
                            isDiscountApplicable: attr.isDiscountApplicable,
                            propertySocialDetailId: attr.propertySocialDetailId,
                            bitValue: attr.bitValue,
                            intValue: attr.intValue,
                            decimalValue: attr.decimalValue,
                            textValue: attr.textValue,
                            dateValue: attr.dateValue,
                            documentBindingId: attr.documentBindingId,
                            remark: attr.remark,
                            photoTypeId: null,
                            isPhotoRequired: attr.isPhotoRequired,
                            isDocumentRequired: attr.isDocumentRequired,
                            isActive: attr.isActive,
                            documentGuid: attr.documentGuid,
                            photoBindingId: attr.photoBindingId,
                            photoGuid: attr.photoGuid,
                            children: []
                        }))
                    }
                }
            };
        }
    } else {
        // For individuals, only call the details API. The details API already provides the complete schema.
        const [discountRes, socialRes] = await Promise.all([
            activeTab === "discount" ? getDiscountDetailsAction(propertyId) : Promise.resolve({ data: null }),
            activeTab === "social" ? getPropertySocialInfoAction(propertyId) : Promise.resolve({ data: { items: null } })
        ]);
        discountResponse = discountRes as typeof discountResponse;
        socialResponse = socialRes as typeof socialResponse;
        socialAttributeMaster = { success: true, data: [] };
    }

    const initialDiscountData = discountResponse.data ?? null;
    const initialSocialData = socialResponse.data?.items ?? null;

    // Separate master attributes based on isDiscountApplicable
    const masterAttributes = socialAttributeMaster.data || [];
    const discountMasterAttributes = masterAttributes.filter(a => a.isDiscountApplicable === true);
    const socialMasterAttributes = masterAttributes.filter(a => a.isDiscountApplicable === false);

    return (
        <DiscountFormview
            key={`${propertyId}-${activeTab}-${level}-${finalWingDetailId ?? 'na'}`}
            initialDiscountData={initialDiscountData}
            initialSocialData={initialSocialData}
            propertyId={propertyId}
            isSociety={isSociety}
            discountMasterAttributes={discountMasterAttributes}
            socialMasterAttributes={socialMasterAttributes}
            wings={mappedWings}
            units={mappedUnits}
        />
    );
}