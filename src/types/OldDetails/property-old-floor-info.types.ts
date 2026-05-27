import { OldFloorDetail, PropertyOldDetailsApiItem } from "./property-old-details.types";

export interface SearchSelectOption {
  label: string;
  value: string;
}

export interface FloorFormActionsProps {
  t: (key: string) => string;
  isEditMode: boolean;
  isSubmitting: boolean;
  isChanged: boolean;
  onSave: () => void;
  onReset: () => void;
}

export interface FloorFormFieldsProps {
  t: (key: string) => string;
  floorOptions: SearchSelectOption[];
  subFloorOptions: SearchSelectOption[];
  constructionTypeOptions: SearchSelectOption[];
  useOptions: SearchSelectOption[];
  subUseOptions: SearchSelectOption[];
  hasSubUseOptions: boolean;
  formData: {
    id?: number;
    oldFloorId: string | number;
    oldSubFloorId: string | number;
    oldConstructionYear: string;
    oldAssessmentYear?: string;
    oldConstructionTypeId: string | number;
    oldTypeOfUseId: string | number;
    oldSubTypeOfUseId: string | number;
    oldCarpetAreaSqFeet: string;
    oldAreaSqMeter?: string;
    oldBuiltupAreaSqFeet?: string;
    oldBuiltupAreaSqMeter?: string;
  };
  errors: Record<string, string>;
  showError: (field: string) => boolean;
  onFieldChange: (field: string, value: string) => void;
  onUseTypeChange: (value: string) => void;
  validateYearField: (field: 'oldConstructionYear' | 'oldAssessmentYear', value: string) => void;
  isSubmitting: boolean;
  isChanged: boolean;
  onSave: () => void;
  onReset: () => void;
}

export interface FloorTableSectionProps {
  t: (key: string) => string;
  tCommon: (key: string) => string;
  existingFloorDetails: OldFloorDetail[];
  onEdit: (floor: OldFloorDetail) => void;
  onDelete: (id: number) => Promise<void>;
}

export interface AreaDetailsFieldsProps {
  t: (key: string) => string;
  formData: {
    oldPlotArea: string;
    oldPlotNo: string;
    oldConstructionArea: string;
  };
  onFieldChange: (field: string, value: string | number) => void;
}

export interface PropertyDetailsFieldsProps {
  t: (key: string) => string;
  formData: {
    oldZoneNo: string;
    oldWardNo: string;
    oldPropertyNo: string;
    oldPartitionNo: string;
    oldEgovNo: string;
  };
  showError: (field: string, hasValue: boolean) => boolean;
  onFieldChange: (field: string, value: string | number) => void;
}

export interface TaxDetailsFieldsProps {
  t: (key: string) => string;
  formData: {
    oldRV: string;
    oldALV: string;
    oldGeneralTax: string;
    oldTotalTax: string;
  };
  onFieldChange: (field: string, value: string | number) => void;
}

export interface OldTaxationFormProps {
  propertyOldDetails?: PropertyOldDetailsApiItem | null;
}

export interface TaxItem {
  taxId: number;
  taxName: string;
  taxAmount: number;
}

export interface DynamicTaxFieldsProps {
  taxes: TaxItem[];
  onTaxChange: (taxId: number, value: string) => void;
  validationErrors: Record<string, string>;
}

export interface TaxationMetaFieldsProps {
  t: (key: string) => string;
  year: string;
  interest: number;
  onYearChange: (value: string) => void;
  onInterestChange: (value: string) => void;
  validationErrors: Record<string, string>;
}

export interface TaxationSummaryFieldsProps {
  t: (key: string) => string;
  taxTotal: number;
  netTotal: number;
  validationErrors: Record<string, string>;
}

export interface Section {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
}