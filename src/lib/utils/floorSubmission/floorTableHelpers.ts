import { FloorData } from '@/types/room-details.types';

/**
 * Safely extract typeOfUseId from floor data with multiple property name variations
 * @param floor - Floor data object
 * @returns String representation of typeOfUseId or empty string
 */
export const getTypeOfUseId = (floor: FloorData): string => {
  return String(
    floor.typeOfUseId ||
    floor.TypeOfUseId ||
    floor.useId ||
    ''
  );
};

/**
 * Normalize floor field IDs to string format for form inputs
 * @param floor - Raw floor data from API
 * @returns Normalized floor data with string IDs
 */
export const normalizeFloorFormData = (floor: FloorData): Partial<FloorData> => ({
  ...floor,
  floorId: String(floor.floorId || floor.floorID || floor.FloorID || ''),
  subFloorId: String(floor.subFloorId || floor.subFloorID || floor.SubFloorID || ''),
  constructionTypeId: String(floor.constructionTypeId || floor.constructionId || floor.ConstructionTypeId || ''),
  typeOfUseId: String(floor.typeOfUseId || floor.TypeOfUseId || floor.useId || ''),
  subTypeOfUseId: String(floor.subTypeOfUseId || floor.subTypId || floor.SubTypeOfUseId || ''),
  // Preserve display fields for table context if needed
  floor: String(floor.floor || ''),
  subFloor: String(floor.subFloor || ''),
  conTyp: String(floor.conTyp || ''),
  use: String(floor.use || ''),
  subTyp: String(floor.subTyp || ''),
  conYr: String(floor.conYr !== undefined && floor.conYr !== null ? floor.conYr : floor.constructionYear || ''),
  asstYr: String(floor.asstYr !== undefined && floor.asstYr !== null ? floor.asstYr : floor.assessmentYear || ''),
  rooms: String(floor.rooms !== undefined && floor.rooms !== null ? floor.rooms : floor.noOfRooms || ''),
  areaSqFt: String(floor.areaSqFt !== undefined && floor.areaSqFt !== null ? floor.areaSqFt : floor.carpetAreaSqFeet || ''),
  areaSqM: String(floor.areaSqM !== undefined && floor.areaSqM !== null ? floor.areaSqM : floor.carpetAreaSqMeter || ''),
  builtupAreaSqFt: String(floor.builtupAreaSqFt !== undefined && floor.builtupAreaSqFt !== null ? floor.builtupAreaSqFt : floor.builtupAreaSqFeet || floor.builtUpAreaSqFeet || '0.00'),
  builtupAreaSqM: String(floor.builtupAreaSqM !== undefined && floor.builtupAreaSqM !== null ? floor.builtupAreaSqM : floor.builtupAreaSqMeter || floor.builtUpAreaSqMeter || '0.00'),
  renter: (floor.renter === 'Yes' || floor.renter === true || floor.isRenter === true || floor.renterYesNo === true || floor.renterYesNO === true) ? 'Yes' : 'No',
  isTaxable: (floor.isTaxable === 'Yes' || floor.isTaxable === true) ? 'Yes' : 'No',
});
