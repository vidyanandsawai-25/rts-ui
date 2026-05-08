/**
 * Type of Use Group Icon Configuration
 * 
 * Centralized configuration for group icons used in Type of Use Master
 * This file contains all icon mappings, labels, and helper functions
 */

import {
  Home,
  Briefcase,
  Factory,
  GraduationCap,
  Wheat,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UseGroupIconKey } from '@/types/typeOfUse.types';

/**
 * Icon option type with proper typing for Lucide icons
 */
export interface IconOption {
  value: UseGroupIconKey;
  label: string;
  Icon: LucideIcon;
}

/**
 * Available icon options for Type of Use groups
 * Each option includes the key, display label, and Lucide icon component
 */
export const ICON_OPTIONS: IconOption[] = [
  { value: 'home', label: 'Home', Icon: Home },
  { value: 'building', label: 'Briefcase', Icon: Briefcase },
  { value: 'factory', label: 'Factory', Icon: Factory },
  { value: 'school', label: 'School', Icon: GraduationCap },
  { value: 'leaf', label: 'Wheat', Icon: Wheat },
  { value: 'map', label: 'MapPin', Icon: MapPin },
];

/**
 * Helper to convert groupIcon string to UseGroupIconKey for display
 * Handles legacy icon formats and normalizes to standard keys
 * 
 * @param iconStr - The icon string from the database (e.g., 'home-icon', 'building')
 * @returns The normalized UseGroupIconKey
 */
export const getIconKey = (iconStr: string): UseGroupIconKey => {
  if (iconStr.includes('home')) return 'home';
  if (iconStr.includes('building') || iconStr.includes('briefcase')) return 'building';
  if (iconStr.includes('factory')) return 'factory';
  if (iconStr.includes('school') || iconStr.includes('graduation')) return 'school';
  if (iconStr.includes('leaf') || iconStr.includes('wheat')) return 'leaf';
  if (iconStr.includes('map') || iconStr.includes('pin')) return 'map';
  return 'home'; // default fallback
};

/**
 * Get the icon component for a given icon key
 * 
 * @param iconKey - The UseGroupIconKey
 * @returns The corresponding Lucide icon component
 */
export const getIconComponent = (iconKey: UseGroupIconKey): LucideIcon => {
  const option = ICON_OPTIONS.find(opt => opt.value === iconKey);
  return option?.Icon || Home;
};
