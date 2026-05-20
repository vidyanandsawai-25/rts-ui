import {
    type FloorSubmissionPayload,
} from '@/types/floor-details.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sanitizeRoomBase = (room: Record<string, unknown>) => ({
    isActive: true,
    // Only include id when it's a real persisted record (> 0); omit on create to avoid backend treating it as update
    ...(Number(room.id) > 0 ? { id: Number(room.id) } : {}),
    // Only include propertyDetailsId when valid
    ...(Number(room.propertyDetailsId) > 0 ? { propertyDetailsId: Number(room.propertyDetailsId) } : {}),
    propertyId: Number(room.propertyId || 0),
    lengthMtr: Number(room.lengthMtr || 0),
    widthMtr: Number(room.widthMtr || 0),
    heightMtr: Number(room.heightMtr || 0),
    breadth: Number(room.breadth || 0),
    areaSqMtr: Number(room.areaSqMtr || 0),
    noOfRooms: Number(room.noOfRooms || 1),
    totalAreaSqMtr: Number(room.totalAreaSqMtr || 0),
    roomNo: String(room.roomNo || ''),
    roomType: String(room.roomType || 'Room'),
    shape: String(room.shape || 'Rectangle'),
    outerYesNo: Boolean(room.outerYesNo),
    minusYesNo: Boolean(room.minusYesNo),
    submissionType: String(room.submissionType || 'Room'),
    base1Mtr: Number(room.base1Mtr || room.baseMtr || 0),
    base2Mtr: Number(room.base2Mtr || 0),
});

const sanitizeMinusData = (minus: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({
    isActive: true,
    id: Number(minus.id || 0),
    lengthMtr: Number(minus.lengthMtr || 0),
    widthMtr: Number(minus.widthMtr || 0),
    heightMtr: Number(minus.heightMtr || 0),
    breadth: Number(minus.breadth || 0),
    areaSqMtr: Number(minus.areaSqMtr || 0),
    shape: String(minus.shape || 'Rectangle'),
    base1Mtr: Number(minus.base1Mtr || minus.baseMtr || 0),
    base2Mtr: Number(minus.base2Mtr || 0),
    offsetValue: Number(minus.offsetValue || 0),
    offsetArea: Number(minus.offsetArea || 0),
    ...extra
});

const sanitizeFloorBase = (payload: FloorSubmissionPayload) => ({
    isActive: true,
    id: Number(payload.propertyDetailsId || 0),
    propertyDetailsId: Number(payload.propertyDetailsId || 0),
    propertyId: Number(payload.propertyId) || 0,
    floorId: Number(payload.floorId) || 0,
    floorDescription: String(payload.floorDescription || ''),
    subFloorId: Number(payload.subFloorId) || 0,
    subFloorDescription: String(payload.subFloorDescription || ''),
    constructionYear: String(payload.constructionYear || ''),
    assessmentYear: String(payload.assessmentYear || ''),
    constructionTypeId: Number(payload.constructionTypeId) || 0,
    constructionTypeDescription: String(payload.constructionTypeDescription || ''),
    typeOfUseId: Number(payload.typeOfUseId) || 0,
    typeOfUseDescription: String(payload.typeOfUseDescription || ''),
    subTypeOfUseId: Number(payload.subTypeOfUseId) || 0,
    subTypeOfUseDescription: String(payload.subTypeOfUseDescription || ''),
    carpetAreaSqFeet: Number(payload.carpetAreaSqFeet) || 0,
    carpetAreaSqMeter: Number(payload.carpetAreaSqMeter) || 0,
    builtupAreaSqMeter: Number(payload.builtupAreaSqMeter) || 0,
    builtupAreaSqFeet: Number(payload.builtupAreaSqFeet) || 0,
    noOfRooms: Number(payload.noOfRooms) || 0,
    renterYesNo: Boolean(payload.renterYesNo),
    renterName: String(payload.renterName || ''),
    renterNameEnglish: String(payload.renterNameEnglish || ''),
    rentYearly: Number(payload.rentYearly) || 0,
    agreementFromDate: payload.agreementFromDate || null,
    agreementToDate: payload.agreementToDate || null,
    agreementDate: payload.agreementDate || null,
    rentMonthly: Number(payload.rentMonthly) || 0,
    isTaxable: Boolean(payload.isTaxable),
    taxLiability: String(payload.taxLiability || ''),
    occupancyDate: payload.occupancyDate || null,
    occupancyApplyOrNot: Boolean(payload.occupancyApplyOrNot),
    occupancyNumber: String(payload.occupancyNumber || ''),
    nonCalculateRentMonthly: Number(payload.nonCalculateRentMonthly) || 0,
});

// ─── Main Sanitizers ──────────────────────────────────────────────────────────

export function sanitizeFloorPayload(payload: FloorSubmissionPayload): FloorSubmissionPayload {
    const sanitizeRoom = (room: Record<string, unknown>) => ({
        ...sanitizeRoomBase(room),
        createdBy: 0,
        roomWiseMinusData: ((room.roomWiseMinusData || room.minusRooms || []) as Record<string, unknown>[]).map(m => sanitizeMinusData(m, { createdBy: 0, roomWiseSubmissionId: Number(m.roomWiseSubmissionId || 0) }))
    });

    return {
        ...sanitizeFloorBase(payload),
        createdBy: 0,
        renterDetails: (payload.renterDetails as Record<string, unknown>[]) || [],
        renterMast: (payload.renterMast as Record<string, unknown>[]) || [],
        roomWiseSubmissionDetails: (((payload as unknown as Record<string, unknown>).roomWiseSubmissionDetails || (payload as unknown as Record<string, unknown>).propertyRooms || []) as Record<string, unknown>[]).map(sanitizeRoom)
    } as unknown as FloorSubmissionPayload;
}

export function sanitizeFloorUpdatePayload(payload: FloorSubmissionPayload): Record<string, unknown> {
    const sanitizeRoomUpdate = (room: Record<string, unknown>) => ({
        ...sanitizeRoomBase(room),
        updatedBy: 0,
        roomWiseSubmissionId: Number(room.id || room.roomWiseSubmissionId || 0),
        roomWiseMinusData: ((room.roomWiseMinusData || room.minusRooms || []) as Record<string, unknown>[]).map(m => sanitizeMinusData(m, { updatedBy: 0, roomWiseMinusId: Number(m.id || m.roomWiseMinusId || 0), roomWiseSubmissionId: Number(m.roomWiseSubmissionId || room.id || room.roomWiseSubmissionId || 0) })),
    });

    return {
        ...sanitizeFloorBase(payload),
        updatedBy: 0,
        renterDetails: ((payload.renterDetails as Record<string, unknown>[]) || []).map(rd => ({
            isActive: true,
            updatedBy: 0,
            agreementId: String(rd.agreementId || ''),
            incrementFrequency: String(rd.incrementFrequency || 'Yearly'),
            incrementType: String(rd.incrementType || 'Percentage'),
            incrementValue: Number(rd.incrementValue) || 0,
            incrementMethod: String(rd.incrementMethod || 'base'),
            durationFrom: rd.durationFrom || null,
            durationTo: rd.durationTo || null,
            rentAmount: Number(rd.rentAmount) || 0,
            rentMonthly: Number(rd.rentMonthly) || 0,
            increment: Number(rd.increament ?? rd.increment) || 0,
            incrementStatus: Boolean(rd.incrementStatus ?? true),
        })),
        renterMast: ((payload.renterMast as Record<string, unknown>[]) || []).map(rm => ({
            isActive: true,
            updatedBy: 0,
            finalRent: Number(rm.finalRent) || 0,
            financialYear: String(rm.financialYear || ''),
            durationFrom: rm.durationFrom || null,
            durationTo: rm.durationTo || null,
        })),
        roomWiseSubmissionDetails: (((payload as unknown as Record<string, unknown>).roomWiseSubmissionDetails || (payload as unknown as Record<string, unknown>).propertyRooms || []) as Record<string, unknown>[]).map(sanitizeRoomUpdate),
    };
}

/**
 * Sanitizes renter-specific payload
 * 
 * @param payload - Raw renter payload
 * @returns Sanitized payload for API
 */
export function sanitizeRenterPayload(payload: unknown): Record<string, unknown> {
    const data = payload as Record<string, unknown>; // Cast locally for access
    const base = sanitizeFloorBase(data as unknown as FloorSubmissionPayload);
    
    return {
        ...base,
        updatedBy: 0,
        // Ensure renter details and mast are properly mapped/sanitized if present
        renterDetails: ((data.renterDetails as Record<string, unknown>[]) || []).map(rd => ({
            isActive: true,
            updatedBy: 0,
            agreementId: String(rd.agreementId || ''),
            incrementFrequency: String(rd.incrementFrequency || 'Yearly'),
            incrementType: String(rd.incrementType || 'Percentage'),
            incrementValue: Number(rd.incrementValue) || 0,
            incrementMethod: String(rd.incrementMethod || 'base'),
            durationFrom: rd.durationFrom || null,
            durationTo: rd.durationTo || null,
            rentAmount: Number(rd.rentAmount) || 0,
            rentMonthly: Number(rd.rentMonthly) || 0,
            increment: Number(rd.increament ?? rd.increment) || 0,
            incrementStatus: Boolean(rd.incrementStatus ?? true),
        })),
        renterMast: ((data.renterMast as Record<string, unknown>[]) || []).map(rm => ({
            isActive: true,
            updatedBy: 0,
            finalRent: Number(rm.finalRent) || 0,
            financialYear: String(rm.financialYear || ''),
            durationFrom: rm.durationFrom || null,
            durationTo: rm.durationTo || null,
        })),
        ...(data.renterCustomIncrements ? { renterCustomIncrements: data.renterCustomIncrements } : {}),
        ...(data.renterTableEntries ? { renterTableEntries: data.renterTableEntries } : {}),
        ...(data.grandTotal !== undefined ? { grandTotal: Number(data.grandTotal) } : {}),
    };
}

