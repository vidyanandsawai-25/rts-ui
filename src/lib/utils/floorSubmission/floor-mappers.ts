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
  const propDetailsId = isAddingNew ? 0 : Number(existingFloorId || 0);

  return {
    isActive: true,
    createdBy: 0,
    propertyId: Number(propertyId || 0),
    propertyDetailsId: propDetailsId,
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
    carpetAreaSqMeter: parseFloat(String(formData.areaSqM || 0)),
    carpetAreaSqFeet: parseFloat(String(formData.areaSqFt || 0)),
    builtupAreaSqMeter: parseFloat(String(formData.builtupAreaSqM || 0)),
    builtupAreaSqFeet: parseFloat(String(formData.builtupAreaSqFt || 0)),
    noOfRooms: parseInt(String(formData.rooms)) || 0,
    renterYesNo: formData.renter === 'Yes' || formData.renter === true,
    isRenter: formData.renter === 'Yes' || formData.renter === true,
    isTaxable: formData.isTaxable === 'Yes' || formData.isTaxable === true,
    renterDetails: formData.renter === 'Yes' && Array.isArray(formData.renterDetails) ? formData.renterDetails : [],
    renterMast: formData.renter === 'Yes' && Array.isArray(formData.renterMast) ? formData.renterMast : [],
    renters: formData.renter === 'Yes' && Array.isArray(formData.renterMast) ? formData.renterMast : [],
    renterName: formData.renter === 'Yes' || formData.renter === true ? String(formData.renterName || '') : '',
    renterNameEnglish: formData.renter === 'Yes' || formData.renter === true ? String(formData.renterNameEnglish || formData.renterName || '') : '',
    rentMonthly: formData.renter === 'Yes' || formData.renter === true ? Number(formData.rentMonthly || formData.renterMonthly || 0) : 0,
    rentYearly: formData.renter === 'Yes' || formData.renter === true ? (Number(formData.rentMonthly || formData.renterMonthly || 0) * 12) : 0,
    agreementFromDate: formData.renter === 'Yes' || formData.renter === true ? (formData.agreementFromDate ? String(formData.agreementFromDate) : undefined) : undefined,
    agreementToDate: formData.renter === 'Yes' || formData.renter === true ? (formData.agreementToDate ? String(formData.agreementToDate) : undefined) : undefined,
    agreementDate: formData.renter === 'Yes' || formData.renter === true ? (formData.agreementDate ? String(formData.agreementDate) : undefined) : undefined,
    taxLiability: String(formData.taxLiability || ''),
    nonCalculateRentMonthly: formData.renter === 'Yes' || formData.renter === true ? Number(formData.nonCalculateRentMonthly || formData.rentMonthly || formData.renterMonthly || 0) : 0,
    occupancyDate: formData.occupancyDate || null,
    occupancyApplyOrNot: formData.occupancyApplyOrNot === 'Yes' || formData.occupancyApplyOrNot === true,
    occupancyNumber: String(formData.occupancyNumber || ''),
    roomWiseSubmissionDetails: ([...((formData.roomWiseSubmissionDetails as unknown[]) || []), ...((formData.roomData as unknown[]) || [])] as import("@/types/room-details.types").RoomData[])
      .filter((r, index, self) => {
        // Calculate effective area from any possible field
        const area = Number(r.area || 0) || Number(r.areaSqMtr || 0) || Number(r.totalAreaSqMtr || 0) || Number(r.total || 0);
        if (area <= 0) return false;

        // Deduplicate: if ID exists, match by ID; otherwise match by roomNo if it exists
        const matchIndex = self.findIndex(t => (t.id && t.id === r.id) || (t.roomNo && t.roomNo === r.roomNo));
        return matchIndex === index;
      })
      .map(r => mapRoomDataToApi(r as import("@/types/room-details.types").RoomData, Number(propertyId), propDetailsId)),
  };
};
