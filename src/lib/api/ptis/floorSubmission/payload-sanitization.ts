/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    type FloorSubmissionPayload,
} from '@/types/floor-details.types';
import {
    sanitizeRenterDetailsForCreate,
    sanitizeRenterDetailsForUpdate,
    sanitizeRenterMastForCreate,
    sanitizeRenterMastForUpdate,
    sanitizeRenterRowsFromData,
} from './renter-payload-sanitization';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sanitizeRoomBase = (room: Record<string, unknown>) => ({
    isActive: true,
    // Only include id when it's a real persisted record (> 0 and not a temporary millisecond timestamp UI ID)
    ...(Number(room.id) > 0 && Number(room.id) < 1_000_000_000_000 ? { id: Number(room.id) } : {}),
    // Only include propertyDetailsId when valid, default to 1 on create to satisfy backend range validation
    propertyDetailsId: Number(room.propertyDetailsId || 0) > 0 && Number(room.propertyDetailsId) < 1_000_000_000_000 ? Number(room.propertyDetailsId) : 1,
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
    roomTypeId: Number(room.roomTypeId || 0),
    shape: String(room.shape || 'Rectangle'),
    outerYesNo: Boolean(room.outerYesNo),
    minusYesNo: Boolean(room.minusYesNo),
    submissionType: String(room.submissionType || 'Room'),
    base1Mtr: Number(room.base1Mtr || room.baseMtr || 0),
    base2Mtr: Number(room.base2Mtr || 0),
});

const sanitizeMinusData = (minus: Record<string, unknown>, extra: Record<string, unknown> = {}) => {
    const isOffsetVal = minus.isOffset !== undefined 
        ? Boolean(minus.isOffset) 
        : (minus.operation === 'add' || minus.operation === 'Add' || minus.operation === true);

    return {
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
        isOffset: isOffsetVal,
        ...extra
    };
};

const parseSafeInt = (value: any): number => {
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    if (!isNaN(num)) return num;
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) return parsed;
    }
    return 0;
};

/**
 * Normalize any date-ish value into a backend-friendly ISO 8601 datetime string.
 * Accepts ISO strings, "YYYY-MM-DD" strings, Date objects, or numeric timestamps.
 * Returns null when the input cannot be parsed — the backend treats explicit
 * null as "no date" rather than barfing on garbled strings like "Invalid Date".
 */
const toIsoOrNull = (value: any): string | null => {
    if (value === undefined || value === null || value === '') return null;
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
    } catch {
        return null;
    }
};

const sanitizeFloorBase = (payload: any) => {
    const rawDetailsId = Number(payload.propertyDetailsId || payload.id || 0);
    const safeDetailsId = rawDetailsId > 0 && rawDetailsId < 1_000_000_000_000 ? rawDetailsId : 0;
    
    // Check both raw API keys and UI normalized keys
    const floorIdVal = parseSafeInt(payload.floorId !== undefined ? payload.floorId : payload.floorID);
    
    const rawSubFloorId = payload.subFloorId !== undefined ? payload.subFloorId : payload.subFloorID;
    const subFloorIdVal = (rawSubFloorId === undefined || rawSubFloorId === null || rawSubFloorId === "" || rawSubFloorId === 0 || rawSubFloorId === "0" || String(rawSubFloorId).toLowerCase() === "select sub floor" || String(rawSubFloorId).toLowerCase() === "select subfloor" || String(rawSubFloorId) === "-Select-")
        ? null 
        : parseSafeInt(rawSubFloorId);

    const constructionTypeIdVal = parseSafeInt(payload.constructionTypeId !== undefined ? payload.constructionTypeId : (payload.constructionId ?? payload.ConstructionTypeId));
    const typeOfUseIdVal = parseSafeInt(payload.typeOfUseId !== undefined ? payload.typeOfUseId : payload.useId);
    const subTypeOfUseIdVal = parseSafeInt(payload.subTypeOfUseId !== undefined ? payload.subTypeOfUseId : payload.subTypId);

    const floorDescriptionVal = String(payload.floorDescription || payload.floor || '');
    
    const rawSubFloorDesc = payload.subFloorDescription || payload.subFloor || '';
    const subFloorDescriptionVal = (subFloorIdVal === null || !rawSubFloorDesc || String(rawSubFloorDesc).toLowerCase() === "select sub floor" || String(rawSubFloorDesc).toLowerCase() === "select subfloor" || String(rawSubFloorDesc) === "-Select-")
        ? null
        : String(rawSubFloorDesc);

    const constructionTypeDescriptionVal = String(payload.constructionTypeDescription || payload.conTyp || '');
    const typeOfUseDescriptionVal = String(payload.typeOfUseDescription || payload.use || '');
    const subTypeOfUseDescriptionVal = String(payload.subTypeOfUseDescription || payload.subTyp || '');

    const constructionYearVal = String(payload.constructionYear !== undefined ? payload.constructionYear : (payload.conYr || ''));
    const assessmentYearVal = String(payload.assessmentYear !== undefined ? payload.assessmentYear : (payload.asstYr || ''));

    const carpetAreaSqFeetVal = Number(payload.carpetAreaSqFeet !== undefined ? payload.carpetAreaSqFeet : (payload.areaSqFt || 0));
    const carpetAreaSqMeterVal = Number(payload.carpetAreaSqMeter !== undefined ? payload.carpetAreaSqMeter : (payload.areaSqM || 0));
    const builtupAreaSqMeterVal = Number(payload.builtupAreaSqMeter !== undefined ? payload.builtupAreaSqMeter : (payload.builtupAreaSqM || 0));
    const builtupAreaSqFeetVal = Number(payload.builtupAreaSqFeet !== undefined ? payload.builtupAreaSqFeet : (payload.builtupAreaSqFt || 0));
    const noOfRoomsVal = Number(payload.noOfRooms !== undefined ? payload.noOfRooms : (payload.rooms || 0));

    const renterYesNoVal = payload.renterYesNo !== undefined 
        ? Boolean(payload.renterYesNo) 
        : (payload.isRenter !== undefined 
            ? Boolean(payload.isRenter) 
            : (payload.renter === 'Yes' || payload.renter === true));
    const isTaxableVal = payload.isTaxable !== undefined ? (payload.isTaxable === 'Yes' || payload.isTaxable === true) : Boolean(payload.isTaxable);

    return {
        isActive: true,
        id: safeDetailsId,
        propertyDetailsId: safeDetailsId,
        propertyId: Number(payload.propertyId) || 0,
        floorId: floorIdVal,
        floorDescription: floorDescriptionVal,
        subFloorId: subFloorIdVal,
        subFloorDescription: subFloorDescriptionVal,
        constructionYear: constructionYearVal,
        assessmentYear: assessmentYearVal,
        constructionTypeId: constructionTypeIdVal,
        constructionTypeDescription: constructionTypeDescriptionVal,
        typeOfUseId: typeOfUseIdVal,
        typeOfUseDescription: typeOfUseDescriptionVal,
        subTypeOfUseId: subTypeOfUseIdVal,
        subTypeOfUseDescription: subTypeOfUseDescriptionVal,
        carpetAreaSqFeet: carpetAreaSqFeetVal,
        carpetAreaSqMeter: carpetAreaSqMeterVal,
        builtupAreaSqMeter: builtupAreaSqMeterVal,
        builtupAreaSqFeet: builtupAreaSqFeetVal,
        noOfRooms: noOfRoomsVal,
        renterYesNo: renterYesNoVal,
        isRenter: renterYesNoVal,
        renterName: String(payload.renterName || payload.renterNameEnglish || ''),
        renterNameEnglish: String(payload.renterNameEnglish || payload.renterName || ''),
        rentYearly: Number(payload.rentYearly) || 0,
        agreementFromDate: toIsoOrNull(payload.agreementFromDate || payload.agreementDateFrom),
        agreementToDate: toIsoOrNull(payload.agreementToDate || payload.agreementDateTo),
        agreementDate: toIsoOrNull(payload.agreementDate),
        rentMonthly: Number(payload.rentMonthly) || 0,
        isTaxable: isTaxableVal,
        // Floor-level taxLiability must be one of the backend's enum values
        // (typically "Taxable" or "NonTaxable"). An empty string trips the
        // model validator and bounces with a generic 500 — default to a
        // sensible value derived from `isTaxable`.
        taxLiability: String(payload.taxLiability || (isTaxableVal ? 'Taxable' : 'NonTaxable')),
        occupancyDate: toIsoOrNull(payload.occupancyDate),
        occupancyApplyOrNot: Boolean(payload.occupancyApplyOrNot),
        occupancyNumber: String(payload.occupancyNumber || ''),
        nonCalculateRentMonthly: Number(payload.nonCalculateRentMonthly) || 0,
    };
};

// ─── Main Sanitizers ──────────────────────────────────────────────────────────

export function sanitizeFloorPayload(payload: FloorSubmissionPayload): FloorSubmissionPayload {
    const rawParentId = Number(payload.propertyDetailsId || 0);
    const parentPropertyDetailsId = rawParentId > 0 && rawParentId < 1_000_000_000_000 ? rawParentId : 1;
    const sanitizeRoom = (room: Record<string, unknown>) => ({
        ...sanitizeRoomBase(room),
        createdBy: 0,
        roomWiseMinusData: ((room.roomWiseMinusData || room.minusRooms || []) as Record<string, unknown>[]).map(m => sanitizeMinusData(m, { createdBy: 0, roomWiseSubmissionId: Number(m.roomWiseSubmissionId || 0) }))
    });

    const sanitizedRenterDetails = sanitizeRenterDetailsForCreate(payload, parentPropertyDetailsId);
    const sanitizedRenterMast = sanitizeRenterMastForCreate(payload, parentPropertyDetailsId);

    return {
        ...sanitizeFloorBase(payload),
        createdBy: 0,
        renterDetails: sanitizedRenterDetails,
        renterMast: sanitizedRenterMast,
        renters: sanitizedRenterMast,
        roomWiseSubmissionDetails: (((payload as unknown as Record<string, unknown>).roomWiseSubmissionDetails || (payload as unknown as Record<string, unknown>).propertyRooms || []) as Record<string, unknown>[]).map(sanitizeRoom)
    } as unknown as FloorSubmissionPayload;
}

export function sanitizeFloorUpdatePayload(payload: FloorSubmissionPayload): Record<string, unknown> {
    const rawParentId = Number(payload.propertyDetailsId || 0);
    const parentPropertyDetailsId = rawParentId > 0 && rawParentId < 1_000_000_000_000 ? rawParentId : 1;
    const sanitizeRoomUpdate = (room: Record<string, unknown>) => ({
        ...sanitizeRoomBase(room),
        updatedBy: 0,
        roomWiseSubmissionId: Number(room.id || room.roomWiseSubmissionId || 0),
        roomWiseMinusData: ((room.roomWiseMinusData || room.minusRooms || []) as Record<string, unknown>[]).map(m => sanitizeMinusData(m, { updatedBy: 0, roomWiseMinusId: Number(m.id || m.roomWiseMinusId || 0), roomWiseSubmissionId: Number(m.roomWiseSubmissionId || room.id || room.roomWiseSubmissionId || 0) })),
    });

    const sanitizedRenterDetails = sanitizeRenterDetailsForUpdate(payload, parentPropertyDetailsId);
    const sanitizedRenterMast = sanitizeRenterMastForUpdate(payload, parentPropertyDetailsId);

    return {
        ...sanitizeFloorBase(payload),
        updatedBy: 0,
        renterDetails: sanitizedRenterDetails,
        // Mirror the GET projection by writing the renter-mast collection
        // under BOTH keys the backend exposes (`renters` is what comes back
        // from `GET /DataEntry/{id}`, `renterMast` is the entity table name).
        // Both arrays carry the SAME id-aligned rows so EF can match by id
        // and update in place — no risk of double-insert because both reference
        // the same primary keys.
        renters: sanitizedRenterMast,
        renterMast: sanitizedRenterMast,
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
    const base = sanitizeFloorBase(data as any);
    const rawParentId = Number(base.propertyDetailsId || data.propertyDetailsId || data.id || 0);
    const parentPropertyDetailsId = rawParentId > 0 && rawParentId < 1_000_000_000_000 ? rawParentId : 1;
    const isUpdate = rawParentId > 0 && rawParentId < 1_000_000_000_000;
    
    // Rooms Mapping: merge both raw roomWiseSubmissionDetails and UI-normalized roomData
    const rawRooms = ((data.roomWiseSubmissionDetails || data.propertyRooms || []) as Record<string, unknown>[]) || [];
    const uiRooms = ((data.roomData || []) as Record<string, unknown>[]) || [];
    
    const sanitizeRoom = (room: Record<string, unknown>) => {
        const roomId = Number(room.id || room.roomWiseSubmissionId || 0);
        const hasRealRoomId = roomId > 0 && roomId < 1_000_000_000_000;
        
        return {
            isActive: true,
            // Only include id when it's a real persisted record (> 0 and not a temporary millisecond timestamp UI ID)
            ...(hasRealRoomId ? { id: roomId } : {}),
            propertyDetailsId: parentPropertyDetailsId,
            propertyId: Number(room.propertyId || base.propertyId || 0),
            lengthMtr: Number(room.lengthMtr || room.length || 0),
            widthMtr: Number(room.widthMtr || room.width || 0),
            heightMtr: Number(room.heightMtr || room.height || 0),
            breadth: Number(room.breadth || 0),
            areaSqMtr: Number(room.areaSqMtr || room.area || 0),
            noOfRooms: Number(room.noOfRooms || room.roomCount || 1),
            totalAreaSqMtr: Number(room.totalAreaSqMtr || room.total || room.area || 0),
            roomNo: String(room.roomNo || ''),
            roomType: String(room.roomType || room.utilities || 'Room'),
            roomTypeId: Number(room.roomTypeId || 0),
            shape: String(room.shape || 'Rectangle'),
            outerYesNo: room.outerYesNo !== undefined ? Boolean(room.outerYesNo) : (room.outer === 'Yes'),
            minusYesNo: room.minusYesNo !== undefined ? Boolean(room.minusYesNo) : (room.offsetMinus === 'Yes'),
            submissionType: String(room.submissionType || 'Room'),
            base1Mtr: Number(room.base1Mtr || room.baseMtr || 0),
            base2Mtr: Number(room.base2Mtr || 0),
            ...(isUpdate ? {
                updatedBy: 0,
                roomWiseSubmissionId: roomId,
            } : {
                createdBy: 0,
            }),
            roomWiseMinusData: (((room.roomWiseMinusData || room.minusRooms || room.offsets || []) as Record<string, unknown>[]) || []).map(m => {
                const minusId = Number(m.id || m.roomWiseMinusId || 0);
                const hasRealMinusId = minusId > 0 && minusId < 1_000_000_000_000;
                const isOffsetVal = m.isOffset !== undefined 
                    ? Boolean(m.isOffset) 
                    : (m.operation === 'add' || m.operation === 'Add' || m.operation === true);
                
                return {
                    isActive: true,
                    id: hasRealMinusId ? minusId : 0,
                    lengthMtr: Number(m.lengthMtr || m.length || 0),
                    widthMtr: Number(m.widthMtr || m.width || 0),
                    heightMtr: Number(m.heightMtr || m.height || 0),
                    breadth: Number(m.breadth || 0),
                    areaSqMtr: Number(m.areaSqMtr || m.area || 0),
                    shape: String(m.shape || 'Rectangle'),
                    base1Mtr: Number(m.base1Mtr || m.baseMtr || 0),
                    base2Mtr: Number(m.base2Mtr || 0),
                    offsetValue: Number(m.offsetValue || 0),
                    offsetArea: Number(m.offsetArea || 0),
                    roomWiseSubmissionId: Number(m.roomWiseSubmissionId || roomId || 0),
                    isOffset: isOffsetVal,
                    ...(isUpdate ? {
                        updatedBy: 0,
                        roomWiseMinusId: minusId,
                    } : {
                        createdBy: 0,
                    })
                };
            })
        };
    };

    const combinedRooms = [...rawRooms, ...uiRooms];
    // Deduplicate rooms by ID or roomNo
    const uniqueRooms: Record<string, unknown>[] = [];
    combinedRooms.forEach((r) => {
        const idVal = Number(r.id || r.roomWiseSubmissionId || 0);
        const roomNoVal = String(r.roomNo || '');
        const exists = uniqueRooms.some(existing => 
            (idVal > 0 && Number(existing.id || existing.roomWiseSubmissionId || 0) === idVal) || 
            (roomNoVal && String(existing.roomNo || '') === roomNoVal)
        );
        if (!exists) {
            uniqueRooms.push(r);
        }
    });

    return {
        ...base,
        ...(isUpdate ? { 
            updatedBy: 0, 
            isRenter: base.isRenter,
            renterYesNo: base.renterYesNo,
        } : { 
            createdBy: 0,
            isRenter: base.isRenter,
            renterYesNo: base.renterYesNo,
        }),
        ...sanitizeRenterRowsFromData(data, parentPropertyDetailsId, isUpdate),
        roomWiseSubmissionDetails: uniqueRooms.map(sanitizeRoom),
        ...(data.renterCustomIncrements ? { renterCustomIncrements: data.renterCustomIncrements } : {}),
        ...(data.renterTableEntries ? { renterTableEntries: data.renterTableEntries } : {}),
        ...(data.grandTotal !== undefined ? { grandTotal: Number(data.grandTotal) } : {}),
    };
}

