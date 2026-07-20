import { Home, UserCheck, Building2, Percent } from 'lucide-react';
import { Tab } from '@/types/property-basic-details.types';

export const TABS: Tab[] = [
  { label: 'Property', href: 'Property', icon: Home },
  { label: 'Kyc', href: 'Kyc', icon: UserCheck },
  { label: 'Society', href: 'Society', icon: Building2 },
  { label: 'BuildingPermission', href: 'Building', icon: Building2 },
  { label: 'Discount', href: 'Discount', icon: Percent },
  { label: 'FloorSubmission', href: 'FloorSubmission', icon: Building2 },
  { label: 'OldDetails', href: 'OldDetails/old-taxation', icon: Building2 },
];

export const RETURN_TAB_BY_QDE_HREF: Record<string, string> = {
  Property: 'propertydetails',
  Kyc: 'kycdetails',
  Society: 'societydetails',
  Building: 'buildingpermission',
  Discount: 'discountdetails',
  'OldDetails/old-taxation': 'olddetails',
};

export const TAB_GRADIENT_CLASSES = {
  activeClass: 'from-blue-500 to-blue-600 border-blue-700',
};
