import { QuickDataEntryClientWrapper } from "@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataEntryClientWrapper";
import { getPropertyBasicDetailsAction, validateFloorCompatibilityAction } from "./Property/action";
import { getPropertySocietyDetailsAction } from "./Society/action";
import { getPhotoSlotsAction, getPropertyPhotosAction } from "@/app/[locale]/property-tax/ptis/media-fetch.action";
import { getPropertyPhotoTypesByScopeAction } from "@/app/[locale]/property-tax/ptis/PhotoPlanType.action";
import { getSocietyPhotoTypesWithStatusAction, getPhotosBySocietyAction } from "@/app/[locale]/property-tax/ptis/SocietyPhoto.action";
import { getWingWiseDetailsAction } from "@/app/[locale]/property-tax/ptis/apartment/action";
import { getWingPhotoTypesWithStatusAction, getPhotosByWingAction } from "@/app/[locale]/property-tax/ptis/WingPhoto.action";
import type { PropertyPhotoDto, PropertyPhotoTypeWithStatusDto, SocietyPhotoTypeWithStatusDto } from "@/types/photoplan.types";
import type { WingWiseWingDetails } from "@/types/property-tax/apartment/wing-intelligence.types";

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function Layout({ children, params }: Props) {
    const { propertyId } = await params;
    const numericPropertyId = Number(propertyId);
    const isValidPropId = Boolean(numericPropertyId && !isNaN(numericPropertyId));

    const [basicDetailsRes, compatibilityRes, photoSlotsRes, photosRes, propScopeTypesRes, societyDetailsRes, socScopeTypesRes] = await Promise.all([
        propertyId ? getPropertyBasicDetailsAction(numericPropertyId) : Promise.resolve(null),
        isValidPropId ? validateFloorCompatibilityAction(numericPropertyId) : Promise.resolve(null),
        isValidPropId ? getPhotoSlotsAction(numericPropertyId) : Promise.resolve(null),
        isValidPropId ? getPropertyPhotosAction(numericPropertyId) : Promise.resolve(null),
        getPropertyPhotoTypesByScopeAction('PROPERTY'),
        isValidPropId ? getPropertySocietyDetailsAction(numericPropertyId) : Promise.resolve(null),
        getPropertyPhotoTypesByScopeAction('SOCIETY'),
    ]);

    const basicDetails = basicDetailsRes?.success ? basicDetailsRes.data : null;
    const categoryId = basicDetails?.categoryId ?? null;
    const propertyTypeId = basicDetails?.propertyTypeId ?? null;
    const categoryName = basicDetails?.categoryName || "";
    const propertyDescription = basicDetails?.propertyDescription || "";
    const isApartment = categoryId === 1 || categoryName.toLowerCase().includes('apartment');
    const initialHasIncompatibleFloor = compatibilityRes?.success ? !compatibilityRes.data?.isCompatible : false;

    // Fetch wing-wise details if wardId and propertyNo exist
    let wings: WingWiseWingDetails[] = [];
    let wingsSocietyId: number | null = null;
    if (basicDetails?.wardId && basicDetails?.propertyNo) {
        try {
            const wingsRes = await getWingWiseDetailsAction(basicDetails.wardId, basicDetails.propertyNo);
            if (wingsRes?.success && wingsRes.data) {
                wings = Array.isArray(wingsRes.data.wings) ? wingsRes.data.wings : [];
                wingsSocietyId = wingsRes.data.societyId ? Number(wingsRes.data.societyId) : null;
            }
        } catch {
            // Non-blocking fallback
        }
    }

    const resolvedSocietyDetailId =
        (societyDetailsRes?.success && societyDetailsRes.data?.societyDetailId
            ? Number(societyDetailsRes.data.societyDetailId)
            : null) ||
        wingsSocietyId ||
        (wings[0]?.societyId ? Number(wings[0].societyId) : null) ||
        (wings[0]?.societyDetailId ? Number(wings[0].societyDetailId) : null) ||
        null;

    const matchedWing = wings.find(
        (w) =>
            (basicDetails?.wingId && (Number(w.wingDetailId) === Number(basicDetails.wingId) || Number(w.wingMasterId) === Number(basicDetails.wingId) || Number(w.wingId) === Number(basicDetails.wingId))) ||
            (basicDetails?.wingName && w.wingName && w.wingName.trim().toLowerCase() === basicDetails.wingName.trim().toLowerCase()) ||
            (basicDetails?.wingNo && w.wingNo && w.wingNo.trim().toLowerCase() === basicDetails.wingNo.trim().toLowerCase())
    ) || (wings.length > 0 ? wings[0] : null);

    const resolvedWingDetailId = matchedWing?.wingDetailId ?? (basicDetails?.wingId ? Number(basicDetails.wingId) : null);
    const resolvedWingName =
        (matchedWing?.wingName && matchedWing.wingName.trim()) ||
        (matchedWing?.wingNo ? `${matchedWing.wingNo} Wing` : '') ||
        (basicDetails?.wingName && basicDetails.wingName.trim()) ||
        (basicDetails?.wingNo ? `${basicDetails.wingNo} Wing` : '') ||
        '';

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

    // Ensure society-scoped slots (Society Place Photo, Society Board Photo, Society Sign Board Photo)
    // are present immediately on SSR for apartments or properties with society details
    if (isApartment || (resolvedSocietyDetailId && resolvedSocietyDetailId > 0)) {
        if (socScopeTypesRes?.success && Array.isArray(socScopeTypesRes.data)) {
            socScopeTypesRes.data.forEach((st) => {
                if (st.isActive === false) return;
                const code = (st.photoTypeCode || '').toUpperCase();
                const existingIdx = initialPhotoSlots.findIndex(
                    (s) =>
                        (s.photoTypeCode && s.photoTypeCode.toUpperCase() === code) ||
                        (s.photoTypeId === st.id && s.photoTypeCode?.toUpperCase().startsWith('SOCIETY_'))
                );
                if (existingIdx === -1) {
                    initialPhotoSlots.push({
                        photoTypeId: st.id,
                        photoTypeCode: st.photoTypeCode,
                        photoTypeName: st.photoTypeName,
                        photoScope: 'SOCIETY',
                        displayOrder: st.displayOrder || 1,
                        hasPhoto: false,
                        photoCount: 0,
                    });
                }
            });
        }
    }

    const initialPhotos: PropertyPhotoDto[] = photosRes?.success && Array.isArray(photosRes.data) ? [...photosRes.data] : [];

    // Parallel fetch society & wing photo statuses if applicable
    const extraPromises: Promise<unknown>[] = [];
    let hasSocPromise = false;
    let hasWingPromise = false;

    if (resolvedSocietyDetailId && resolvedSocietyDetailId > 0) {
        extraPromises.push(getSocietyPhotoTypesWithStatusAction(resolvedSocietyDetailId));
        extraPromises.push(getPhotosBySocietyAction(resolvedSocietyDetailId));
        hasSocPromise = true;
    }
    if (resolvedWingDetailId && resolvedWingDetailId > 0) {
        extraPromises.push(getWingPhotoTypesWithStatusAction(resolvedWingDetailId));
        extraPromises.push(getPhotosByWingAction(resolvedWingDetailId));
        hasWingPromise = true;
    }

    if (extraPromises.length > 0) {
        try {
            const results = await Promise.all(extraPromises);
            let idx = 0;
            if (hasSocPromise) {
                const socSlotsRes = results[idx++] as { success?: boolean; data?: SocietyPhotoTypeWithStatusDto[] };
                const socPhotosRes = results[idx++] as { success?: boolean; data?: Record<string, unknown>[] };

                if (socSlotsRes?.success && Array.isArray(socSlotsRes.data)) {
                    socSlotsRes.data.forEach((ss: SocietyPhotoTypeWithStatusDto) => {
                        const code = (ss.photoTypeCode || '').toUpperCase();
                        const existingIdx = initialPhotoSlots.findIndex(
                            (s) =>
                                (s.photoTypeCode && s.photoTypeCode.toUpperCase() === code) ||
                                (s.photoTypeId === ss.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('SOCIETY_'))
                        );
                        if (existingIdx !== -1) {
                            initialPhotoSlots[existingIdx] = {
                                ...initialPhotoSlots[existingIdx],
                                ...ss,
                            };
                        } else {
                            initialPhotoSlots.push({
                                photoTypeId: Number(ss.photoTypeId),
                                photoTypeCode: String(ss.photoTypeCode || ''),
                                photoTypeName: String(ss.photoTypeName || ''),
                                photoScope: 'SOCIETY',
                                displayOrder: Number(ss.displayOrder || 0),
                                hasPhoto: Boolean(ss.hasPhoto),
                                photoCount: Number(ss.photoCount || 0),
                                propertyPhotoId: Number(ss.societyPhotoId || 0),
                                remarks: ss.remarks ? String(ss.remarks) : undefined,
                                documentGuid: ss.documentGuid ? String(ss.documentGuid) : undefined,
                                fileName: ss.fileName ? String(ss.fileName) : undefined,
                                mimeType: ss.mimeType ? String(ss.mimeType) : undefined,
                                viewUrl: ss.viewUrl ? String(ss.viewUrl) : undefined,
                            });
                        }
                    });
                }

                if (socPhotosRes?.success && Array.isArray(socPhotosRes.data)) {
                    const mappedSocPhotos: PropertyPhotoDto[] = socPhotosRes.data.map((sp) => ({
                        propertyPhotoId: Number(sp.societyPhotoId || sp.propertyPhotoId || 0),
                        propertyId: numericPropertyId,
                        photoTypeId: Number(sp.photoTypeId || 0),
                        photoTypeCode: String(sp.photoTypeCode || ''),
                        photoTypeName: String(sp.photoTypeName || ''),
                        displayOrder: Number(sp.displayOrder || 0),
                        remarks: sp.remarks ? String(sp.remarks) : undefined,
                        documentBindingId: sp.documentBindingId ? Number(sp.documentBindingId) : undefined,
                        documentGuid: sp.documentGuid ? String(sp.documentGuid) : undefined,
                        fileName: sp.fileName ? String(sp.fileName) : undefined,
                        mimeType: sp.mimeType ? String(sp.mimeType) : undefined,
                        viewUrl: sp.viewUrl ? String(sp.viewUrl) : undefined,
                        downloadUrl: sp.downloadUrl ? String(sp.downloadUrl) : undefined,
                        societyDetailId: resolvedSocietyDetailId || undefined,
                    }));
                    mappedSocPhotos.forEach((sp) => {
                        const existingIdx = initialPhotos.findIndex((p) => p.propertyPhotoId === sp.propertyPhotoId && p.photoTypeCode?.toUpperCase() === sp.photoTypeCode?.toUpperCase());
                        if (existingIdx !== -1) {
                            initialPhotos[existingIdx] = { ...initialPhotos[existingIdx], ...sp };
                        } else {
                            initialPhotos.push(sp);
                        }
                    });
                }
            }

            if (hasWingPromise) {
                const wingSlotsRes = results[idx++] as { success?: boolean; data?: Record<string, unknown>[] };
                const wingPhotosRes = results[idx++] as { success?: boolean; data?: Record<string, unknown>[] };

                if (wingSlotsRes?.success && Array.isArray(wingSlotsRes.data)) {
                    wingSlotsRes.data.forEach((ws) => {
                        const code = String(ws.photoTypeCode || ws.photoTypeSlotCode || '').toUpperCase();
                        const existingIdx = initialPhotoSlots.findIndex(
                            (s) =>
                                (s.photoTypeCode && s.photoTypeCode.toUpperCase() === code) ||
                                (s.photoTypeId === Number(ws.photoTypeId) && s.photoTypeCode?.toUpperCase().startsWith('WING_'))
                        );
                        const mappedSlot: PropertyPhotoTypeWithStatusDto = {
                            photoTypeId: Number(ws.photoTypeId),
                            photoTypeCode: String(ws.photoTypeCode || ws.photoTypeSlotCode || ''),
                            photoTypeName: String(ws.photoTypeName || ws.photoTypeSlotName || ''),
                            photoScope: 'WING',
                            displayOrder: Number(ws.displayOrder || 0),
                            hasPhoto: Boolean(ws.hasPhoto),
                            photoCount: Number(ws.photoCount || 0),
                            propertyPhotoId: Number(ws.wingPhotoId || ws.propertyPhotoId || 0),
                            remarks: ws.remarks ? String(ws.remarks) : undefined,
                            documentGuid: ws.documentGuid ? String(ws.documentGuid) : undefined,
                            fileName: ws.fileName ? String(ws.fileName) : undefined,
                            mimeType: ws.mimeType ? String(ws.mimeType) : undefined,
                            viewUrl: ws.viewUrl ? String(ws.viewUrl) : undefined,
                        };
                        if (existingIdx !== -1) {
                            initialPhotoSlots[existingIdx] = { ...initialPhotoSlots[existingIdx], ...mappedSlot };
                        } else {
                            initialPhotoSlots.push(mappedSlot);
                        }
                    });
                }

                if (wingPhotosRes?.success && Array.isArray(wingPhotosRes.data)) {
                    const mappedWingPhotos: PropertyPhotoDto[] = wingPhotosRes.data.map((wp) => ({
                        propertyPhotoId: Number(wp.wingPhotoId || wp.propertyPhotoId || 0),
                        propertyId: numericPropertyId,
                        photoTypeId: Number(wp.photoTypeId || 0),
                        photoTypeCode: String(wp.photoTypeCode || ''),
                        photoTypeName: String(wp.photoTypeName || ''),
                        displayOrder: Number(wp.displayOrder || 0),
                        remarks: wp.remarks ? String(wp.remarks) : undefined,
                        documentBindingId: wp.documentBindingId ? Number(wp.documentBindingId) : undefined,
                        documentGuid: wp.documentGuid ? String(wp.documentGuid) : undefined,
                        fileName: wp.fileName ? String(wp.fileName) : undefined,
                        mimeType: wp.mimeType ? String(wp.mimeType) : undefined,
                        viewUrl: wp.viewUrl ? String(wp.viewUrl) : undefined,
                        downloadUrl: wp.downloadUrl ? String(wp.downloadUrl) : undefined,
                        wingDetailId: resolvedWingDetailId || undefined,
                        wingName: resolvedWingName,
                    }));
                    mappedWingPhotos.forEach((wp) => {
                        const existingIdx = initialPhotos.findIndex((p) => p.propertyPhotoId === wp.propertyPhotoId);
                        if (existingIdx !== -1) {
                            initialPhotos[existingIdx] = { ...initialPhotos[existingIdx], ...wp };
                        } else {
                            initialPhotos.push(wp);
                        }
                    });
                }
            }
        } catch {
            // Non-blocking fallback
        }
    }

    return (
        <QuickDataEntryClientWrapper
            categoryId={categoryId}
            propertyTypeId={propertyTypeId}
            categoryName={categoryName}
            propertyDescription={propertyDescription}
            initialHasIncompatibleFloor={initialHasIncompatibleFloor}
            initialPhotoSlots={initialPhotoSlots}
            initialPhotos={initialPhotos}
            societyDetailId={resolvedSocietyDetailId}
            wings={wings}
            wingName={resolvedWingName}
            wingDetailId={resolvedWingDetailId}
        >
            {children}
        </QuickDataEntryClientWrapper>
    );
}