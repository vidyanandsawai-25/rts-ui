import React from 'react';

export interface PropertyTypeIconProps {
  type: 'Residential' | 'Commercial' | 'Amenity';
  className?: string;
}

export interface StatBadgeProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface ExemptionSummaryProps {
  wingName: string;
  amount: number;
  count: number;
}

export interface OverallTaxSummaryProps {
  from: number;
  to: number;
}

export interface RevenueImpactSummaryProps {
  wingName: string;
  amount: number;
  pct: number;
  isPositive: boolean;
  previousRv?: number;
  revisedRv?: number;
  affectedUnits?: number;
}

export interface WingCardHeaderProps {
  letter: string;
  name: string;
  rating: number;
  blockName: string;
  stats: {
    floors: string;
    props: number;
    area: number;
    collectedPct: number;
  };
  colorClass: string;
  onAmcClick?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
}

export interface WingType {
  type: 'Residential' | 'Commercial' | 'Amenity';
  units: number;
  area: number;
  old: number;
  cur: number;
  retro: number;
  total: number;
  rev: number;
  [key: string]: unknown;
}

export interface WingTypeTableProps {
  types: WingType[];
}

export interface WingCardFooterProps {
  wingName: string;
  exemption: { amount: number; count: number };
  overallTax: { from: number; to: number };
  revenueImpact: {
    amount: number;
    pct: number;
    isPositive: boolean;
    previousRv?: number;
    revisedRv?: number;
    affectedUnits?: number;
  };
}

export interface WingData {
  id: string;
  wingId?: string | number | null;
  wingNo?: string | null;
  wingMasterId?: number | null;
  wingDetailId?: number | null;
  societyId?: number | null;
  letter: string;
  name: string;
  rating: number;
  blockName: string;
  stats: {
    floors: string;
    props: number;
    area: number;
    collectedPct: number;
  };
  types: WingType[];
  exemption: { amount: number; count: number };
  overallTax: { from: number; to: number };
  revenueImpact: {
    amount: number;
    pct: number;
    isPositive: boolean;
    previousRv?: number;
    revisedRv?: number;
    affectedUnits?: number;
  };
  colorClass: string;
}

export interface WingCardProps {
  data: WingData;
  isSelected?: boolean;
  onClick?: () => void;
  onAmcClick?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
}

export interface WingWisePropertyType {
  propertyTypeName: string;
  propertyCount: number;
  totalArea: number;
  oldDemand: string;
  currentDemand: string;
  retroDemand: string;
  totalDemand: string;
  totalRevenue: string;
}

export interface WingWiseWingDetails {
  wingId?: number | string | null;
  wingMasterId?: number;
  wingDetailId?: number;
  societyId?: number;
  wingNo: string;
  wingName: string;
  propertyCount: number;
  floorRange: string;
  totalArea: number;
  collectionPercentage: number;
  oldDemand: string;
  currentDemand: string;
  retroDemand: string;
  totalDemand: string;
  revenueImpact: string;
  revenueImpactPercentage: number;
  exemptionAppliedAmount: string;
  exemptedPropertyCount: number;
  propertyTypes: WingWisePropertyType[];
}

export interface WingWiseDetailsItems {
  propertyId: number;
  propertyNo: string;
  wardId?: number;
  wardNo: string;
  societyId?: number;
  wings: WingWiseWingDetails[];
}

export interface WingWiseDetailsResponse {
  success: boolean;
  message: string;
  items: WingWiseDetailsItems | null;
  errors: string[] | null;
  correlationId: string | null;
}
