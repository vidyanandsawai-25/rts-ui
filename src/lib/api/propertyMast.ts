import {
  getPropertyDtoLocal,
  getPropertyDtoByPropertyIdLocal,
  getPropertyMastListLocal,
} from "@/lib/mock/ui-only";
import type { PropertyMastDto, PropertyMastListItem } from "@/types/propertyMast.types";

export async function getPropertyMastList(): Promise<PropertyMastListItem[]> {
  return getPropertyMastListLocal();
}

export async function getPropertyByOwnerId(ownerId: number): Promise<PropertyMastDto> {
  return getPropertyDtoLocal(ownerId);
}

export async function getPropertyByPropertyId(propertyId: string): Promise<PropertyMastDto> {
  return getPropertyDtoByPropertyIdLocal(propertyId);
}
