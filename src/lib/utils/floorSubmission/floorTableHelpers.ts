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
});
