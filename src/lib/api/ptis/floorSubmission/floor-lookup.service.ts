import {
    ConstructionTypeResponse,
    FloorResponse,
    SubFloorResponse,
    SubTypeOfUseResponse
} from "@/types/floor-details.types";

import {
    fetchItems,
    getOptionsFromData,
    getPropertySafely
} from "./floor-service-utils"

import { TypeOfUseApiItem } from "@/types/property-basic-details.types";
import { RoomTypeResponse } from "@/types/room-details.types";

/**
 * Fetches floor type data from API
 * @returns Promise<FloorResponse[]>
 */
export async function getFloorData(): Promise<FloorResponse[]> {
    return fetchItems<FloorResponse>("/Floor?pageNumber=1&pageSize=-1", "Failed to fetch floors");
}

/**
 * Generates dropdown options from floor data
 * @returns Promise<string[]>
 */
export async function getFloorOptions(): Promise<string[]> {
    return getOptionsFromData(
        getFloorData,
        (a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0),
        f => {
            const id = f.floorCode || f.floorId || getPropertySafely(f, ['id', 'ID']);
            const desc = f.description || '';
            return id && desc ? `${id} - ${desc}` : (desc || String(id));
        }
    );
}

/**
 * Fetches construction type data from API
 * @returns Promise<ConstructionTypeResponse[]>
 */
export async function getConstructionTypeData(): Promise<ConstructionTypeResponse[]> {
    return fetchItems<ConstructionTypeResponse>("/ConstructionType?pageNumber=1&pageSize=-1", "Failed to fetch construction types");
}

/**
 * Generates dropdown options from construction type data
 * @returns Promise<string[]>
 */
export async function getConstructionTypeOptions(): Promise<string[]> {
    return getOptionsFromData(
        getConstructionTypeData,
        (a, b) => (a.searchSequence ?? 0) - (b.searchSequence ?? 0),
        item => {
            const id = item.constructionCode || item.constructionTypeId || getPropertySafely(item, ['id', 'ID']);
            const desc = item.description || '';
            return id && desc ? `${id} - ${desc}` : (desc || String(id));
        }
    );
}

/**
 * Fetches type of use data from API
 */
export async function getTypeOfUseData(): Promise<TypeOfUseApiItem[]> {
    return fetchItems<TypeOfUseApiItem>("/TypeOfUse?pageNumber=1&pageSize=-1", "Failed to fetch types of use");
}

/**
 * Generates dropdown options for type of use
 */
export async function getTypeOfUseOptions(): Promise<string[]> {
    return getOptionsFromData(
        getTypeOfUseData,
        (a, b) => (a.searchSequence ?? 0) - (b.searchSequence ?? 0),
        item => {
            const id = item.typeOfUseCode || item.typeOfUseId || getPropertySafely(item, ['id', 'ID']);
            const desc = item.description || '';
            return id && desc ? `${id} - ${desc}` : (desc || String(id));
        }
    );
}

/**
 * Fetches sub-type of use data, optionally filtered by typeOfUseId
 */
export async function getSubTypeOfUseData(typeOfUseId?: string): Promise<SubTypeOfUseResponse[]> {
    const params = new URLSearchParams({ pageNumber: "1", pageSize: "-1" });
    if (typeOfUseId && typeOfUseId !== 'undefined' && typeOfUseId !== 'null') {
        const isLikelyDescription = /[\u0900-\u097F\s]/.test(typeOfUseId);
        if (!isLikelyDescription) params.append("typeOfUseId", typeOfUseId);
    }
    return fetchItems<SubTypeOfUseResponse>(`/SubTypeOfUse?${params.toString()}`, "Failed to fetch sub-types of use");
}

/**
 * Generates dropdown options for sub-type of use
 */
export async function getSubTypeOfUseOptions(typeOfUseID?: string): Promise<string[]> {
    return getOptionsFromData(
        () => getSubTypeOfUseData(typeOfUseID),
        (a, b) => (a.searchSequence ?? 0) - (b.searchSequence ?? 0),
        item => item.searchKey ? `${item.searchKey} - ${item.description}` : item.description
    );
}

/**
 * Fetches sub-floor data
 */
export async function getSubFloorData(): Promise<SubFloorResponse[]> {
    return fetchItems<SubFloorResponse>("/SubFloor?pageNumber=1&pageSize=-1", "Failed to fetch sub-floors");
}

/**
 * Generates dropdown options for sub-floor
 */
export async function getSubFloorOptions(): Promise<string[]> {
    return getOptionsFromData(
        getSubFloorData,
        () => 0,
        item => {
            const id = item.subFloorCode || item.subFloorId || getPropertySafely(item, ['id', 'ID']);
            const desc = item.description || '';
            return id && desc ? `${id} - ${desc}` : (desc || String(id));
        }
    );
}

/**
 * Fetches room type data from API
 * @returns Promise<RoomTypeResponse[]>
 */
export async function getRoomTypeData(): Promise<RoomTypeResponse[]> {
    return fetchItems<RoomTypeResponse>("/RoomTypeMaster?pageNumber=1&pageSize=-1", "Failed to fetch room types");
}

/**
 * Generates dropdown options for room type
 * @returns Promise<string[]>
 */
export async function getRoomTypeOptions(): Promise<string[]> {
    return getOptionsFromData(
        getRoomTypeData,
        () => 0,
        item => {
            const name = item.roomTypeName || item.description || '';
            const code = item.roomTypeCode || String(item.roomTypeId || getPropertySafely(item, ['id', 'ID']));
            return name || code;
        }
    );
}
