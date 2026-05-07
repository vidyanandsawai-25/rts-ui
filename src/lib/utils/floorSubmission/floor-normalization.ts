import { FloorData, RoomData } from "@/types/room-details.types";
import { RenterDetailItem, RenterMastItem } from "@/types/renter-details.types";
import { LookupData } from "@/types/common-details.types";
import {
  getFloorDescription,
  getSubFloorDescription,
  getConstructionDescription,
  getUseDescription,
  getSubTypeDescription,
} from "./floor-descriptions";

/**
 * Normalizes a polymorphic floor object from various API responses into a 
 * consistent, camelCased FloorData structure.
 * 
 * Handles property name variances like 'floorId' vs 'floorID' vs 'FloorID'.
 */
export function normalizeFloorData(
  raw: Record<string, unknown>, 
  lookups: {
    floor?: LookupData[];
    subFloor?: LookupData[];
    construction?: LookupData[];
    use?: LookupData[];
    subType?: LookupData[];
  }
): FloorData {
  if (!raw) return {} as FloorData;

  // Helper to safely extract string from unknown value
  const getString = (val: unknown): string => (val !== null && val !== undefined) ? String(val) : '';
  const getNumber = (val: unknown): number => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // 1. Extract IDs using property guards for all known variations
  const floorId = getString(raw.floorId) || getString(raw.floorID) || getString(raw.FloorID) || '';
  const subFloorId = getString(raw.subFloorId) || getString(raw.subFloorID) || getString(raw.SubFloorID) || '';
  const constructionTypeId = getString(raw.constructionTypeId) || getString(raw.constructionId) || getString(raw.ConstructionTypeId) || '';
  const typeOfUseId = getString(raw.typeOfUseId) || getString(raw.TypeOfUseId) || getString(raw.useId) || '';
  const subTypeOfUseId = getString(raw.subTypeOfUseId) || getString(raw.subTypId) || getString(raw.SubTypeOfUseId) || '';

  // 2. Resolve Descriptions (Marathi Labels)
  const floorDesc = getString(raw.floorDescription) || getFloorDescription(floorId, lookups.floor || []) || (raw.floor && isNaN(Number(raw.floor)) ? getString(raw.floor) : '');
  const subFloorDesc = getString(raw.subFloorDescription) || getSubFloorDescription(subFloorId, lookups.subFloor || []) || (raw.subFloor && isNaN(Number(raw.subFloor)) ? getString(raw.subFloor) : '');
  const conTypDesc = getString(raw.constructionTypeDescription) || getConstructionDescription(constructionTypeId, lookups.construction || []) || (raw.conTyp && isNaN(Number(raw.conTyp)) ? getString(raw.conTyp) : '');
  const useDesc = getString(raw.typeOfUseDescription) || getUseDescription(typeOfUseId, lookups.use || []) || (raw.use && isNaN(Number(raw.use)) ? getString(raw.use) : '');
  const subTypeDesc = getString(raw.subTypeOfUseDescription) || getSubTypeDescription(Number(subTypeOfUseId), lookups.subType || []) || (raw.subTyp && isNaN(Number(raw.subTyp)) ? getString(raw.subTyp) : '');

  // 3. Return a clean, normalized object
  return {
    ...raw, // Preserve original fields for safety
    id: getNumber(raw.id) || getNumber(raw.propertyDetailsId) || 0,
    floor: floorDesc || floorId,
    subFloor: subFloorDesc || subFloorId,
    conYr: getString(raw.conYr) || getString(raw.constructionYear) || '',
    asstYr: getString(raw.asstYr) || getString(raw.assessmentYear) || '',
    conTyp: conTypDesc || constructionTypeId,
    use: useDesc || typeOfUseId,
    subTyp: subTypeDesc || subTypeOfUseId,
    renter: (raw.renter === 'Yes' || raw.renterYesNo === true || raw.renterYesNO === true) ? 'Yes' : 'No',
    rooms: getString(raw.rooms) || getString(raw.noOfRooms) || '',
    areaSqFt: getString(raw.areaSqFt) || getString(raw.carpetAreaSqFeet) || '',
    areaSqM: getString(raw.areaSqM) || getString(raw.carpetAreaSqMeter) || '',
    builtupAreaSqFt: getString(raw.builtupAreaSqFt) || getString(raw.builtupAreaSqFeet) || '0.00',
    builtupAreaSqM: getString(raw.builtupAreaSqM) || getString(raw.builtupAreaSqMeter) || '0.00',
    isTaxable: (raw.isTaxable === 'Yes' || raw.isTaxable === true) ? 'Yes' : 'No',
    
    // Consistent Internal IDs for Form Mapping
    floorId,
    subFloorId,
    constructionTypeId,
    typeOfUseId,
    subTypeOfUseId,
    
    // Preserved Descriptions for initialLabel fallbacks
    floorDescription: floorDesc,
    subFloorDescription: subFloorDesc,
    constructionTypeDescription: conTypDesc,
    typeOfUseDescription: useDesc,
    subTypeOfUseDescription: subTypeDesc,
    
    // Nested Data - Preserve already-normalized data if available
    roomData: (raw.roomData || raw.propertyRooms || raw.roomWiseSubmissionDetails || []) as RoomData[],
    renterDetails: (raw.renterDetails || []) as RenterDetailItem[],
    renterMast: (raw.renterMast || raw.renterMasts || []) as RenterMastItem[],
  };
}
