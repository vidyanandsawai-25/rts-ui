import { WardItem } from "./wardMaster.types";
import { PropertyType } from "./property-type.types";
import { PropertyCategory } from "./property-category.types";
import { TaxZone } from "./taxzoning.types";

/**
 * Props for the CreatePropertyDrawer component
 */
export interface CreatePropertyDrawerProps {
  isOpen: boolean;
  selectedWard: WardItem | null;
  propertyTypes: PropertyType[];
  propertyCategories: PropertyCategory[];
  taxZones: TaxZone[];
  /** Next available property number for auto-population (SSR fetched) */
  nextPropertyNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Form data for creating properties
 */
export interface CreatePropertyFormData {
  propertyTypeId: string;
  categoryId: string;
  taxZoneId: string;
  propertyNo: string;
  ownerName: string;
  isBulkCreate: boolean;
  fromPropertyNo: string;
  toPropertyNo: string;
}

/**
 * Validation errors for the create property form
 */
export interface CreatePropertyFormErrors {
  propertyTypeId?: string;
  categoryId?: string;
  taxZoneId?: string;
  propertyNo?: string;
  ownerName?: string;
  fromPropertyNo?: string;
  toPropertyNo?: string;
}
