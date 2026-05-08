/**
 * Room and Floor data type definitions
 */

export interface FloorData {
    id?: number;
    ownerID?: number | string;
    ownerId?: number | string;
    propertyId?: number | string;
    floor: string;
    floorId?: number | string;
    floorID?: number | string;
    FloorID?: number | string;
    subFloor: string;
    subFloorId?: number | string;
    subFloorID?: number | string;
    SubFloorID?: number | string;
    conYr: string;
    asstYr: string;
    conTyp: string;
    constructionTypeId?: number | string;
    constructionId?: number | string;
    ConstructionTypeId?: number | string;
    use: string;
    useId?: number | string;
    typeOfUseId?: number | string;
    TypeOfUseId?: number | string;
    subTyp: string;
    subTypId?: number | string;
    subTypeOfUseId?: number | string;
    SubTypeOfUseId?: number | string;
    subFloorDescription?: string;
    floorDescription?: string;
    constructionTypeDescription?: string;
    typeOfUseDescription?: string;
    subTypeOfUseDescription?: string;
    propertyDetailsId?: number;
    rooms: string | number;
    noOfRooms?: string | number;
    areaSqFt: string | number;
    carpetAreaSqFeet?: string | number;
    areaSqM: string | number;
    carpetAreaSqMeter?: string | number;
    builtupAreaSqFt: string | number;
    builtupAreaSqFeet?: string | number;
    builtUpAreaSqFeet?: string | number;
    builtupAreaSqM: string | number;
    builtupAreaSqMeter?: string | number;
    builtUpAreaSqMeter?: string | number;
    renter: boolean | string;
    renterYesNo?: boolean;
    renterYesNO?: boolean;
    renterName?: string;
    renterMonthly?: string | number;
    rentMonthly?: string | number;
    agreementFromDate?: string | null;
    occupancyDate?: string | null;
    occupancyYesNo?: boolean;
    occupancyApplyOrNot?: boolean | string;
    renterDetails?: unknown[];
    renterMast?: unknown[];
    isTaxable?: boolean | string;
    constructionYear?: string;
    assessmentYear?: string;
    roomData?: RoomData[];
    [key: string]: unknown;
}

export interface RoomData {
    id?: number;
    roomId?: number | string;
    roomName?: string;
    roomType?: string;
    roomTypeId?: number | string;
    length?: number | string;
    breadth?: number | string;
    height?: number | string;
    area?: number | string;
    shape?: string;
    shapeParameters?: ShapeParameters;
    offsets?: import('./offset-details.types').OffsetData[];
    [key: string]: unknown;
}

export interface ShapeParameters {
    shape?: string;
    side1?: number | string;
    side2?: number | string;
    side3?: number | string;
    side4?: number | string;
    diagonal1?: number | string;
    diagonal2?: number | string;
    radius?: number | string;
    baseWidth?: number | string;
    topWidth?: number | string;
    height?: number | string;
    length?: number | string;
    width?: number | string;
    base?: number | string;
    side?: number | string;
    base1?: number | string;
    base2?: number | string;
    [key: string]: unknown;
}

export interface RoomAPIResponse {
    id?: number;
    roomId?: number;
    roomWiseSubmissionId?: number;
    roomName?: string;
    roomNo?: string;
    roomType?: string;
    roomTypeId?: number | string;
    utilities?: string;
    length?: number;
    lengthMtr?: number;
    breadth?: number;
    widthMtr?: number;
    height?: number;
    heightMtr?: number;
    area?: number;
    areaSqMtr?: number;
    totalAreaSqMtr?: number;
    shape?: string;
    shapeType?: string;
    shapeParameters?: ShapeParameters;
    noOfRooms?: number | string;
    roomCount?: number | string;
    outerYesNo?: boolean;
    OuterYesNo?: boolean;
    outer?: string;
    minusYesNo?: boolean;
    MinusYesNo?: boolean;
    offsetMinus?: string;
    remark?: string;
    [key: string]: unknown;
}

export interface RoomSubmissionItem {
    roomId?: number | string;
    roomName?: string;
    roomTypeId?: number | string;
    length?: number;
    breadth?: number;
    height?: number;
    area?: number;
    shape?: string;
    shapeParameters?: ShapeParameters;
    roomWiseMinusData?: unknown[];
    [key: string]: unknown;
}
