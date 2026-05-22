/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FloorAPIResponse } from '@/types/floor-details.types';
import {
    type RoomData,
    type RoomAPIResponse,
    type ShapeParameters,
} from '@/types/room-details.types';
import { type OffsetAPIResponse } from '@/types/offset-details.types';
import { parseBoolean } from "@/lib/utils/type-guards";


export const mapRoomDataToUi = (room: RoomAPIResponse, index: number): RoomData => {
    const shape = room.shape || 'Rectangle';
    const lengthVal = String(room.lengthMtr || room.length || 0);
    const widthVal = String(room.widthMtr || room.width || 0);
    const heightVal = String(room.heightMtr || room.height || 0);
    const base1Val = String(room.base1Mtr || room.base1 || 0);
    const base2Val = String(room.base2Mtr || room.base2 || 0);

    const shapeParams: ShapeParameters = {
        length: lengthVal, width: widthVal, height: heightVal,
        base1: base1Val, base2: base2Val, radius: '', base: '', side: '',
    };

    if (shape === 'Square') { shapeParams.side = lengthVal; }
    else if (shape === 'Circle' || shape === 'Semi Circle' || shape === 'Quarter Circle') { shapeParams.radius = lengthVal; }
    else if (shape === 'Triangle') { shapeParams.base = base1Val || lengthVal; shapeParams.height = heightVal; }

    const offsetsData = Array.isArray(room.roomWiseMinusData) ? room.roomWiseMinusData : (Array.isArray(room.minusRooms) ? room.minusRooms : []);
    const offsets = offsetsData.map((offset: OffsetAPIResponse, offIndex: number) => {
        const offShape = offset.shape || 'Rectangle';
        const offLengthVal = String(offset.lengthMtr || offset.length || 0);
        const offWidthVal = String(offset.widthMtr || offset.width || 0);
        const offHeightVal = String(offset.heightMtr || offset.height || 0);
        const offBase1Val = String(offset.base1Mtr || offset.base1 || 0);
        const offBase2Val = String(offset.base2Mtr || offset.base2 || 0);

        const offShapeParams: ShapeParameters = {
            length: offLengthVal, width: offWidthVal, height: offHeightVal,
            base1: offBase1Val, base2: offBase2Val, radius: '', base: '', side: '',
        };

        if (offShape === 'Square') { offShapeParams.side = offLengthVal; }
        else if (offShape === 'Circle' || offShape === 'Semi Circle' || offShape === 'Quarter Circle') { offShapeParams.radius = offLengthVal; }
        else if (offShape === 'Triangle') { offShapeParams.base = offBase1Val || offLengthVal; offShapeParams.height = offHeightVal; }

        return {
            id: Number(offset.roomWiseMinusId ?? offset.id) || undefined,
            offsetNo: `O${offIndex + 1}`, 
            shape: String(offShape),
            length: offLengthVal, 
            width: offWidthVal, 
            height: offHeightVal,
            area: Number(offset.areaSqMtr || offset.area) || 0,
            operation: String(offset.operation || 'subtract'),
            remark: String(offset.remark || ''),
            shapeType: String(offShape), 
            shapeParams: offShapeParams,
        };
    });

    return {
        id: Number(room.roomWiseSubmissionId ?? room.id) || undefined,
        roomNo: String(room.roomNo || `R${index + 1}`),
        utilities: room.roomType || room.utilities || 'Room',
        shape: shape,
        length: lengthVal, width: widthVal, height: heightVal,
        area: Number(room.areaSqMtr || room.area) || 0,
        roomCount: String(room.noOfRooms || room.roomCount || 1),
        total: Number(room.totalAreaSqMtr || room.total || room.areaSqMtr) || 0,
        outer: (room.outerYesNo === true || room.OuterYesNo === true || room.outer === 'Yes') ? 'Yes' : 'No',
        offsetMinus: (room.minusYesNo === true || room.MinusYesNo === true || room.offsetMinus === 'Yes') ? 'Yes' : 'No',
        remark: room.remark || '',
        shapeParams, offsets,
    };
};

export function normalizeApiFloorData(apiData: Record<string, unknown>) {
    // Basic shape check to ensure we have an object with an ID
    if (!apiData || typeof apiData !== 'object' || !('id' in apiData || 'propertyDetailsId' in apiData || 'propertyId' in apiData)) {
        return apiData;
    }

    const data = apiData as unknown as FloorAPIResponse;
    const builtupAreaSqFtVal = Number(data.builtupAreaSqFeet ?? data.builtUpAreaSqFeet ?? 0);
    const builtupAreaSqMVal = Number(data.builtupAreaSqMeter ?? data.builtUpAreaSqMeter ?? 0);
    const carpetAreaSqFtVal = Number(data.carpetAreaSqFeet ?? data.carpetAreaSqFt ?? 0);
    const carpetAreaSqMVal = Number(data.carpetAreaSqMeter ?? data.carpetAreaSqM ?? 0);

    // Helper to get string safely
    const s = (val: unknown) => String(val ?? '').trim();
    // Helper to check for 'undefined' or 'null' strings
    const isValid = (val: unknown) => val && s(val).toLowerCase() !== 'undefined' && s(val).toLowerCase() !== 'null';

    return {
        id: data.propertyDetailsId ?? data.id,
        ownerID: data.ownerID ?? data.ownerId ?? data.propertyId,
        floor: isValid(data.floorDescription) ? s(data.floorDescription) : s(data.floorID ?? data.floorId ?? ''),
        floorId: s(data.floorID ?? data.floorId ?? ''),
        subFloor: isValid(data.subFloorDescription) ? s(data.subFloorDescription) : s(data.subFloorID ?? data.subFloorId ?? ''),
        subFloorId: s(data.subFloorID ?? data.subFloorId ?? ''),
        conYr: s(data.constructionYear),
        asstYr: s(data.assessmentYear),
        conTyp: isValid(data.constructionTypeDescription) ? s(data.constructionTypeDescription) : s(data.constructionId ?? data.constructionTypeId ?? data.ConstructionTypeId ?? ''),
        constructionTypeId: s(data.constructionId ?? data.constructionTypeId ?? data.ConstructionTypeId ?? ''),
        use: isValid(data.typeOfUseDescription) ? s(data.typeOfUseDescription) : (isValid(data.typeOfUseId) ? s(data.typeOfUseId) : ''),
        useId: isValid(data.typeOfUseId) ? s(data.typeOfUseId) : '',
        typeOfUseId: isValid(data.typeOfUseId) ? s(data.typeOfUseId) : '',
        subTyp: isValid(data.subTypeOfUseDescription) ? s(data.subTypeOfUseDescription) : (isValid(data.subTypeOfUseId) ? s(data.subTypeOfUseId) : ''),
        subTypId: isValid(data.subTypeOfUseId) ? s(data.subTypeOfUseId) : '',
        subTypeOfUseId: Number(data.subTypeOfUseId || 0),
        subTypeOfUseDescription: isValid(data.subTypeOfUseDescription) ? s(data.subTypeOfUseDescription) : '',
        renter: parseBoolean(data.isRenter ?? data.renterYesNO ?? data.renterYesNo) ? ('Yes' as const) : ('No' as const),
        rooms: String(data.noOfRooms || 0),
        areaSqFt: String(carpetAreaSqFtVal),
        areaSqM: String(carpetAreaSqMVal),
        builtupAreaSqFt: String(builtupAreaSqFtVal),
        builtupAreaSqM: String(builtupAreaSqMVal),
        isTaxable: parseBoolean(data.isTaxable) ? ('Yes' as const) : ('No' as const),
        renterDetails: data.renterDetails || [],
        renterMast: data.renterMast || data.renters || [],
        renterName: s(
            data.renterName || 
            data.renterNameEnglish || 
            (data.renters && (data.renters as any[])[0]?.renterName) || 
            (data.renters && (data.renters as any[])[0]?.renterNameEnglish) || 
            (data.renterMast && (data.renterMast as any[])[0]?.renterName) || 
            (data.renterMast && (data.renterMast as any[])[0]?.renterNameEnglish)
        ),
        rentMonthly: Number(
            data.rentMonthly || 
            (data.renters && (data.renters as any[])[0]?.rentMonthly) || 
            (data.renterMast && (data.renterMast as any[])[0]?.rentMonthly) || 
            0
        ),
        rentYearly: Number(
            data.rentYearly || 
            (data.renters && (data.renters as any[])[0]?.finalYearlyRent) || 
            (data.renterMast && (data.renterMast as any[])[0]?.finalYearlyRent) || 
            0
        ) || (Number(
            data.rentMonthly || 
            (data.renters && (data.renters as any[])[0]?.rentMonthly) || 
            (data.renterMast && (data.renterMast as any[])[0]?.rentMonthly) || 
            0
        ) * 12),
        agreementFromDate: s(
            data.agreementFromDate || 
            (data.renters && ((data.renters as any[])[0]?.agreementFromDate || (data.renters as any[])[0]?.durationFrom)) || 
            (data.renterMast && ((data.renterMast as any[])[0]?.agreementFromDate || (data.renterMast as any[])[0]?.durationFrom))
        ),
        agreementToDate: s(
            data.agreementToDate || 
            (data.renters && ((data.renters as any[])[0]?.agreementToDate || (data.renters as any[])[0]?.durationTo)) || 
            (data.renterMast && ((data.renterMast as any[])[0]?.agreementToDate || (data.renterMast as any[])[0]?.durationTo))
        ),
        agreementDate: s(
            data.agreementDate || 
            (data.renters && (data.renters as any[])[0]?.agreementDate) || 
            (data.renterMast && (data.renterMast as any[])[0]?.agreementDate)
        ),
        roomData: (data.roomWiseSubmissionDetails || data.propertyRooms || []).map((r, i) => mapRoomDataToUi(r, i)),
    };
}

