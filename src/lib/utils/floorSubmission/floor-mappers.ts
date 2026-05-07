/**
 * Floor Data Mapping Utilities
 * 
 * Provides utilities for mapping floor/lookup data to display formats
 * Handles property name variations from different API responses
 * 
 * @module floor-mappers
 */

import { LookupData } from "@/types/common-details.types";
export type { LookupData };
import { FloorSubmissionPayload } from "@/types/floor-details.types";
import { FloorData } from "@/types/room-details.types";
import { 
  getFloorDescription, 
  getSubFloorDescription, 
  getConstructionDescription, 
  getUseDescription, 
  getSubTypeDescription 
} from "./floor-descriptions";
import { resolveIdFromDescription } from "./floor-resolvers";
import { mapRoomDataToApi } from "./room-mappers";

// Re-export children utilities for consistent access
export * from "./floor-descriptions";
export * from "./floor-resolvers";
export * from "./room-mappers";
export * from "./floor-normalization";
export * from "./floorTableHelpers";

/**
 * Maps FloorData form to FloorSubmissionPayload for API submission
 * Centralizes all the structural mapping logic for floor submissions
 */
export const mapFormToPayload = (params: {
  formData: FloorData;
  floorLookup: LookupData[];
  subFloorLookup: LookupData[];
  constructionLookup: LookupData[];
  useLookup: LookupData[];
  subTypeLookup: LookupData[];
  propertyId: number | string;
  isAddingNew: boolean;
  existingFloorId?: number | string;
}): FloorSubmissionPayload => {
  const {
    formData,
    floorLookup,
    subFloorLookup,
    constructionLookup,
    useLookup,
    subTypeLookup,
    propertyId,
    isAddingNew,
    existingFloorId
  } = params;

  // Resolve IDs primarily from explicit ID fields, fallback to resolving from descriptions
  const floorId = Number(formData.floorId) || resolveIdFromDescription(
    formData.floor,
    floorLookup,
    'floorId',
    'floorCode'
  );

  const subFloorId = Number(formData.subFloorId) || resolveIdFromDescription(
    formData.subFloor,
    subFloorLookup,
    'subFloorId',
    'subFloorCode'
  );

  const conTypId = Number(formData.constructionTypeId) || resolveIdFromDescription(
    formData.conTyp,
    constructionLookup,
    'constructionTypeId',
    'constructionCode'
  );

  const useId = Number(formData.typeOfUseId) || resolveIdFromDescription(
    formData.use,
    useLookup,
    'typeOfUseId',
    'typeOfUseCode'
  );

  const subTypId = Number(formData.subTypeOfUseId) || resolveIdFromDescription(
    formData.subTyp,
    subTypeLookup,
    'subTypeOfUseId',
    'searchKey'
  );

  // Get descriptions for the resolved IDs
  const floorDescription = getFloorDescription(floorId, floorLookup) || String(formData.floor || '');
  const subFloorDescription = getSubFloorDescription(subFloorId, subFloorLookup) || String(formData.subFloor || '');
  const constructionTypeDescription = getConstructionDescription(conTypId, constructionLookup) || String(formData.conTyp || '');
  const typeOfUseDescription = getUseDescription(useId, useLookup) || String(formData.use || '');
  const subTypeOfUseDescription = String(
    getSubTypeDescription(subTypId, subTypeLookup) || formData.subTypeOfUseDescription || ''
  );

  // Build the payload
  return {
    isActive: true,
    propertyDetailsId: isAddingNew ? 0 : Number(existingFloorId || 0),
    updatedBy: 0,
    propertyId: Number(propertyId || 0),
    floorId,
    floorDescription,
    subFloorId,
    subFloorDescription,
    constructionYear: String(formData.conYr || ''),
    assessmentYear: String(formData.asstYr || ''),
    constructionTypeId: conTypId,
    constructionTypeDescription,
    typeOfUseId: useId,
    typeOfUseDescription,
    subTypeOfUseId: subTypId,
    subTypeOfUseDescription,
    carpetAreaSqFeet: parseFloat(String(formData.areaSqFt)) || 0,
    carpetAreaSqMeter: parseFloat(String(formData.areaSqM)) || 0,
    builtupAreaSqMeter: parseFloat(String(formData.builtupAreaSqM || 0)),
    builtupAreaSqFeet: parseFloat(String(formData.builtupAreaSqFt || 0)),
    noOfRooms: parseInt(String(formData.rooms)) || 0,
    renterYesNo: formData.renter === 'Yes',
    // Only include renter data if floor is marked as rented
    renterName: formData.renter === 'Yes' ? String(formData.renterName || '') : '',
    renterNameEnglish: formData.renter === 'Yes' ? String(formData.renterNameEnglish || formData.renterName || '') : '',
    rentYearly: formData.renter === 'Yes' ? Number(formData.rentYearly) || 0 : 0,
    agreementFromDate: formData.renter === 'Yes' && typeof formData.agreementFromDate === 'string' ? formData.agreementFromDate : undefined,
    agreementToDate: formData.renter === 'Yes' && typeof formData.agreementToDate === 'string' ? formData.agreementToDate : undefined,
    agreementDate: formData.renter === 'Yes' && typeof formData.agreementDate === 'string' ? formData.agreementDate : undefined,
    rentMonthly: formData.renter === 'Yes' ? Number(formData.rentMonthly) || 0 : 0,
    // isTaxable status is independent of renter status - respect form value
    isTaxable: formData.isTaxable === 'Yes' || formData.isTaxable === true,
    taxLiability: formData.renter === 'Yes' ? String(formData.taxLiability || '') : '',
    occupancyDate: formData.renter === 'Yes' && typeof formData.occupancyDate === 'string' ? formData.occupancyDate : undefined,
    occupancyApplyOrNot: formData.renter === 'Yes' && (formData.occupancyApplyOrNot === 'Yes' || formData.occupancyApplyOrNot === true || formData.occupancyApplyOrNot === 'true'),
    occupancyNumber: formData.renter === 'Yes' ? String(formData.occupancyNumber || '') : '',
    nonCalculateRentMonthly: formData.renter === 'Yes' ? Number(formData.nonCalculateRentMonthly) || 0 : 0,
    renterDetails: formData.renter === 'Yes' && Array.isArray(formData.renterDetails) ? formData.renterDetails : undefined,
    renterMast: formData.renter === 'Yes' && Array.isArray(formData.renterMast) ? formData.renterMast : undefined,
    roomWiseSubmissionDetails: (formData.roomData || [])
      .filter(r => Number(r.area || 0) > 0)
      .map(mapRoomDataToApi),
  };
};
