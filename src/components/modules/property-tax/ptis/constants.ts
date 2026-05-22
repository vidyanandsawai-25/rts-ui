import { FooterAction } from '@/lib/api/footer.service';

export const DEFAULT_PTIS_FOOTER_ACTIONS: FooterAction[] = [
  {
    id: 10001,
    actionCommand: 'PTIS_REFRESH',
    buttonName: 'Refresh',
    lucideIcon: 'RefreshCw',
    displayOrder: 1,
    isEnabled: false,
    canView: false,
    canEdit: false,
    canDelete: false,
    haveFullAccess: false,
    haveNoAccess: true,
    routePath: '/property-tax/ptis',
    style: { iconName: 'RefreshCw', variant: 'blue', alignment: 'middle' },
  },
  {
    id: 10003,
    actionCommand: 'PTIS_SAVE',
    buttonName: 'Save',
    lucideIcon: 'Save',
    displayOrder: 3,
    isEnabled: false,
    canView: false,
    canEdit: false,
    canDelete: false,
    haveFullAccess: false,
    haveNoAccess: true,
    routePath: '/property-tax/ptis',
    style: { iconName: 'Save', variant: 'success', alignment: 'right' },
  },
];

/**
 * Shared Tailwind CSS class combinations for PTIS components
 */
export const PTIS_UI_CLASSES = {
  // Tabs
  tabActive: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm',
  tabInactive: 'text-indigo-600 hover:bg-white hover:text-indigo-800',
  tabContainer: 'inline-flex flex-wrap gap-2 rounded-full border border-indigo-100 bg-white p-1 shadow-inner',
  
  // Sections
  sectionCard: 'bg-white rounded-2xl shadow-lg border border-indigo-50 overflow-hidden',
  sectionHeader: 'p-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest',
  
  // Buttons
  expandButton: 'flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-indigo-600 shadow-sm transition-all duration-200 hover:bg-gray-50',
};

/**
 * Shared FloorDetailsTable configuration presets for PTIS modules
 */
export const PTIS_TABLE_PRESETS = {
  // Common container for valuation tables
  container: 'space-y-0.5 p-0.5',
  
  // Header badge styles (Blue theme used across valuation modules)
  headerBadge: 'text-[10px] h-8 bg-blue-800/40 border-blue-400/30',
  
  // Standard cell text styles
  cellText: 'text-[11px] text-gray-700 font-medium',
};

/**
 * Maps raw API tax labels to the camelCase translation keys used by PTIS locales.
 */
export const PTIS_TAX_KEY_MAP: Record<string, string> = {
  'SPECIAL WATER CESS': 'spWaterCess',
  'SPECIAL EDUCATION TAX': 'spEducationTax',
  'ILLEGAL CONSTRUCTION PENALTY': 'illegalConstPenalty',
  'WATER BILL': 'waterBill',
  'GENERAL TAX': 'generalTax',
  'STATE EDUCATION TAX': 'stateEducationTax',
  'STATE EMPLOYMENT TAX': 'stateEmploymentTax',
  'TREE CESS': 'treeCess',
  'ROAD CESS': 'roadCess',
  'FIRE CESS': 'fireCess',
  'LIGHT CESS': 'lightCess',
  'WATER BENEFIT CESS': 'waterBenefitCess',
  'SEWAGE DISPOSAL CESS': 'sewageDisposalCess',
  'SANITATION CESS': 'sanitationCess',
  'DRAIN CESS': 'drainCess',
  'BIG BUILDING': 'bigBuilding',
  'USER CHARGES': 'userCharges',
  'SERVICE TAX': 'serviceTax',
  'OLD PENALTY OF ULB': 'oldPenaltyOfULB',
  'RUN TIME PENALTY': 'runTimePenalty',
  'WATER TAX': 'waterTax',
  'EDUCATION CESS': 'educationCess',
  'EMPLOYMENT CESS': 'employmentCess',
  'DRAINAGE TAX': 'drainageTax',
  'FIRE TAX': 'fireTax',
  'LIGHT TAX': 'lightTax',
  'CLEANING TAX': 'cleaningTax',
  'SEWERAGE TAX': 'sewerageTax',
  'TREE TAX': 'treeTax',
  'EDUCATION TAX': 'educationTax',
  'EMPLOYMENT TAX': 'employmentTax',
};

