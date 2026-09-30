import type React from "react";
import type { LucideIcon } from "lucide-react";
import type {
  Zone,
  Ward,
  Department,
  Mouja,
  OwnershipType,
  SubZone,
  Designation,
  AssetConditionOption,
} from "./master-data.types";
import type { FloorSummary } from "./form-orchestrator.types";
import type { MovableParentAssetItem } from "./buildBasicInfo-sections.types";
import type { AssetFloorDetailItem } from "./detail-tabs.types";
import type { ParentSubunitLookupItem } from "./basic-info-actions.types";
import type { AssetFormData } from "./asset-wizard.types";
import type { ProcessedField } from "./asset-field-renderer.types";
import type { UseNAFormOrchestratorReturn } from "./form-orchestrator.types";

export interface NewAddNewAssetPageProps {
  wards?: Ward[];
  zones?: Zone[];
  departments?: Department[];
  moujas?: Mouja[];
  designations?: Designation[];
  ownershipTypes?: OwnershipType[];
  subzones?: SubZone[];
  assetConditions?: AssetConditionOption[];
  parentAssetId?: number | null;
  initialParentAsset?: MovableParentAssetItem | null;
  initialParentFloors?: AssetFloorDetailItem[];
  initialParentSubunits?: ParentSubunitLookupItem[];
  initialWizardData?: Partial<AssetFormData> | null;
  prefetchedFields?: ProcessedField[];
  activeStepKey?: string;
}

export interface NAAssetMediaProps {
  currentStep?: number;
}

export interface FloorCvRollup {
  totalFloors?: number | string | null;
  floorCount?: number | string | null;
  totalUnits?: number | string | null;
  totalCarpetAreaSqMeter?: number | string | null;
  totalBuiltUpAreaSqMeter?: number | string | null;
  totalCapitalValue?: number | string | null;
}

export interface NASummaryCardsProps {
  summary: FloorSummary;
  cvRollup?: FloorCvRollup | number | null;
}

export interface NAProgressStepsProps {
  currentStep?: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void;
  steps: { id: number; key: string; title: string; subtitle: string; icon: LucideIcon }[];
}

export interface NAFooterProps {
  onPrevious?: () => void;
  previousLabel?: string;
  onSaveAsDraft?: () => void;
  onSaveAndNext?: () => void;
  showPrevious?: boolean;
  saveAndNextLabel?: string;
  saveAndNextDisabled?: boolean;
  isSubmitting?: boolean;
  isSaving?: boolean;
  isFinalSubmitting?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export interface NABasicInfoStepContentProps {
  orchestrator: UseNAFormOrchestratorReturn;
  currentStep: number;
  zones?: Zone[];
  wards?: Ward[];
  moujas?: Mouja[];
  subzones?: SubZone[];
  departments?: Department[];
  ownershipTypes?: OwnershipType[];
  designations?: Designation[];
  assetConditions?: AssetConditionOption[];
  initialParentAsset?: MovableParentAssetItem | null;
  initialParentFloors?: AssetFloorDetailItem[];
  initialParentSubunits?: ParentSubunitLookupItem[];
  cvRollup?: FloorCvRollup | number | null;
}

export interface NAPlaceholderStepContentProps {
  activeStepKey: string;
}

export interface BaseAssetPageProps {
  params: Promise<{ locale: string; assetId?: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface AssetStepPageProps {
  params: Promise<{ locale: string; assetId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface AssetLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; assetId: string }>;
}

export interface AssetStepErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export type NewAddNewAssetErrorProps = AssetStepErrorProps;
export type BasicInfoErrorProps = AssetStepErrorProps;
export type PageProps = BaseAssetPageProps;
export type LayoutProps = AssetLayoutProps;
