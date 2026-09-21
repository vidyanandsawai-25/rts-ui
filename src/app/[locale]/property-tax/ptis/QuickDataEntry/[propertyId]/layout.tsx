import { QuickDataEntryClientWrapper } from "@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataEntryClientWrapper";
import { getPropertyBasicDetailsAction, validateFloorCompatibilityAction } from "./Property/action";
import { getPhotoSlotsAction, getPropertyPhotosAction } from "@/app/[locale]/property-tax/ptis/media-fetch.action";
import { getPropertyPhotoTypesByScopeAction } from "@/app/[locale]/property-tax/ptis/PhotoPlanType.action";
import type { PropertyPhotoTypeWithStatusDto } from "@/types/photoplan.types";

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function Layout({ children, params }: Props) {
    const { propertyId } = await params;
    const numericPropertyId = Number(propertyId);
    const isValidPropId = Boolean(numericPropertyId && !isNaN(numericPropertyId));

    const [basicDetailsRes, compatibilityRes, photoSlotsRes, photosRes, propScopeTypesRes] = await Promise.all([
        propertyId ? getPropertyBasicDetailsAction(numericPropertyId) : Promise.resolve(null),
        isValidPropId ? validateFloorCompatibilityAction(numericPropertyId) : Promise.resolve(null),
        isValidPropId ? getPhotoSlotsAction(numericPropertyId) : Promise.resolve(null),
        isValidPropId ? getPropertyPhotosAction(numericPropertyId) : Promise.resolve(null),
        getPropertyPhotoTypesByScopeAction('PROPERTY'),
    ]);

    const basicDetails = basicDetailsRes?.success ? basicDetailsRes.data : null;
    const categoryId = basicDetails?.categoryId ?? null;
    const propertyTypeId = basicDetails?.propertyTypeId ?? null;
    const categoryName = basicDetails?.categoryName || "";
    const propertyDescription = basicDetails?.propertyDescription || "";
    const initialHasIncompatibleFloor = compatibilityRes?.success ? !compatibilityRes.data?.isCompatible : false;

    const initialPhotoSlots: PropertyPhotoTypeWithStatusDto[] = [
        ...(photoSlotsRes?.success && Array.isArray(photoSlotsRes.data) ? photoSlotsRes.data : []),
    ];

    if (propScopeTypesRes?.success && Array.isArray(propScopeTypesRes.data)) {
        propScopeTypesRes.data.forEach((pt) => {
            if (pt.isActive === false) return;
            const code = (pt.photoTypeCode || '').toUpperCase();
            const existingIdx = initialPhotoSlots.findIndex(
                (s) => (s.photoTypeCode && s.photoTypeCode.toUpperCase() === code) || s.photoTypeId === pt.id
            );
            if (existingIdx === -1) {
                initialPhotoSlots.push({
                    photoTypeId: pt.id,
                    photoTypeCode: pt.photoTypeCode,
                    photoTypeName: pt.photoTypeName,
                    photoScope: pt.photoScope || 'PROPERTY',
                    displayOrder: pt.displayOrder || 1,
                    hasPhoto: false,
                    photoCount: 0,
                });
            } else {
                if (!initialPhotoSlots[existingIdx].photoScope) {
                    initialPhotoSlots[existingIdx].photoScope = pt.photoScope || 'PROPERTY';
                }
            }
        });
    }

    const initialPhotos = photosRes?.success && Array.isArray(photosRes.data) ? photosRes.data : [];

    return (
        <QuickDataEntryClientWrapper
            categoryId={categoryId}
            propertyTypeId={propertyTypeId}
            categoryName={categoryName}
            propertyDescription={propertyDescription}
            initialHasIncompatibleFloor={initialHasIncompatibleFloor}
            initialPhotoSlots={initialPhotoSlots}
            initialPhotos={initialPhotos}
        >
            {children}
        </QuickDataEntryClientWrapper>
    );
}