export type DiscountKey =
    | "solarPanel"
    | "solarHeater"
    | "rainwaterHarvesting"
    | "wasteSegregation"
    | "wasteDisposal"
    | "greenCertified"
    | "fireFighting"
    | "evCharging"
    | "womanOwner"
    | "exServicemanOwner";

export interface DiscountDetailsItem {
    propertyId: number;
    [key: string]: string | number | boolean | null | undefined;
}

export interface DiscountApiResponse {
    success: boolean;
    message: string;
    items: DiscountDetailsItem;
}

export interface DiscountItemState {
    enabled: boolean;
    amount: string;
    percentage: string;
    documentGuid?: string;
    isUploading?: boolean;
}

export type DiscountState = Record<DiscountKey, DiscountItemState>;

export const DOC_TYPE_MAPPING: Record<DiscountKey, string> = {
    solarPanel: "SolarPanelSystem",
    solarHeater: "SolarWaterHeater",
    rainwaterHarvesting: "RainWaterHarvesting",
    wasteSegregation: "WasteSegregationSystem",
    wasteDisposal: "WasteDisposalSystem",
    greenCertified: "GreenCertifiedProperty",
    fireFighting: "FireFightingSystem",
    evCharging: "EvChargingStation",
    womanOwner: "WomenOwner",
    exServicemanOwner: "ExServicemanOwner"
};

export const API_MAPPING: Record<DiscountKey, string> = {
    solarPanel: "solarPanelSystem",
    solarHeater: "solarWaterHeater",
    rainwaterHarvesting: "rainWaterHarvesting",
    wasteSegregation: "wasteSegregationSystem",
    wasteDisposal: "wasteDisposalSystem",
    greenCertified: "greenCertifiedProperty",
    fireFighting: "fireFightingSystem",
    evCharging: "evChargingStation",
    womanOwner: "womanOwner",
    exServicemanOwner: "exServicemanOwner"
};
