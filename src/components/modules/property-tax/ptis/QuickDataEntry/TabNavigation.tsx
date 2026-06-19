'use client';

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Building2, Home, UserCheck, Percent } from 'lucide-react';
import { Tab } from '@/types/property-basic-details.types';

const TABS: Tab[] = [
  { label: 'Property', href: 'Property', icon: Home },
  { label: 'Kyc', href: 'Kyc', icon: UserCheck },
  { label: 'Society', href: 'Society', icon: Building2 },
  { label: 'BuildingPermission', href: 'Building', icon: Building2 },
  { label: 'Discount', href: 'Discount', icon: Percent },
  { label: 'FloorSubmission', href: 'FloorSubmission', icon: Building2 },
  { label: 'OldDetails', href: 'OldDetails/old-taxation', icon: Building2 },
];

const TAB_GRADIENT_CLASSES = {
  activeClass: 'from-blue-500 to-blue-600 border-blue-700',
};

const RETURN_TAB_BY_QDE_HREF: Record<string, string> = {
  Property: 'propertydetails',
  Kyc: 'kycdetails',
  Society: 'societydetails',
  Building: 'buildingpermission',
  Discount: 'discountdetails',
  'OldDetails/old-taxation': 'olddetails',
};

export function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const t = useTranslations('quickDataEntry');

  const propertyId = (routeParams.propertyId as string) || searchParams.get('propertyId') || '';
  const wardNo = searchParams.get('wardNo') || '';
  const wardId = searchParams.get('wardId') || '';
  const propertyNo = searchParams.get('propertyNo') || '';
  const partitionNo = searchParams.get('partitionNo') || '';
  const returnTab = searchParams.get('returnTab') || '';
  const valuationTab = searchParams.get('valuationTab') || '';
  const appartmentTab = searchParams.get('appartmentTab') || '';
  const subTab = searchParams.get('subTab') || '';
  const showDetails = searchParams.get('showDetails') || '';
  const rateableExpands = searchParams.getAll('rateableExpand');
  const capitalExpands = searchParams.getAll('capitalExpand');
  const dualExpands = searchParams.getAll('dualExpand');

  // Check if we have search parameters that can resolve authoritative property ID
  const hasPropertyKeys = wardNo && propertyNo && partitionNo;

  const params = new URLSearchParams();
  if (propertyId) params.set('propertyId', propertyId);
  if (wardNo) params.set('wardNo', wardNo);
  if (wardId) params.set('wardId', wardId);
  if (propertyNo) params.set('propertyNo', propertyNo);
  if (partitionNo) params.set('partitionNo', partitionNo);
  if (returnTab) params.set('returnTab', returnTab);
  if (valuationTab) params.set('valuationTab', valuationTab);
  if (appartmentTab) params.set('appartmentTab', appartmentTab);
  if (subTab) params.set('subTab', subTab);
  if (showDetails) params.set('showDetails', showDetails);
  rateableExpands.forEach(v => params.append('rateableExpand', v));
  capitalExpands.forEach(v => params.append('capitalExpand', v));
  dualExpands.forEach(v => params.append('dualExpand', v));

  const queryString = params.toString();

  return (
    <div className="bg-white border-b-2 border-slate-300 px-3 py-2 shadow-sm overflow-x-auto no-scrollbar">
      <nav className="flex md:grid w-full grid-cols-7 gap-1.5 h-auto p-1 rounded-lg">
        {TABS.map((tab) => {
          const currentPath = pathname.split('?')[0];
          const pathSegments = currentPath.split('/').filter(Boolean);

          // Find the base path up to the propertyId segment.
          // The structure is expected to be .../QuickDataEntry/[propertyId]/...
          const qdeIndex = pathSegments.indexOf('QuickDataEntry');
          const baseTabPath =
            qdeIndex !== -1 && pathSegments[qdeIndex + 1]
              ? `/${pathSegments.slice(0, qdeIndex + 2).join('/')}`
              : `/${pathSegments.slice(0, -1).join('/')}`;

          const tabPath = `${baseTabPath}/${tab.href}`;

          const tabReturnValue = RETURN_TAB_BY_QDE_HREF[tab.href] || returnTab;

          // For FloorSubmission tab: exclude propertyId if we have search params
          // to let the page resolve authoritative ID from backend
          let tabQueryString = queryString;
          if (tab.href === 'FloorSubmission' && hasPropertyKeys) {
            const tabParams = new URLSearchParams();
            if (wardNo) tabParams.set('wardNo', wardNo);
            if (wardId) tabParams.set('wardId', wardId);
            if (propertyNo) tabParams.set('propertyNo', propertyNo);
            if (partitionNo) tabParams.set('partitionNo', partitionNo);
            if (tabReturnValue) tabParams.set('returnTab', tabReturnValue);
            if (valuationTab) tabParams.set('valuationTab', valuationTab);
            if (appartmentTab) tabParams.set('appartmentTab', appartmentTab);
            if (subTab) tabParams.set('subTab', subTab);
            if (showDetails) tabParams.set('showDetails', showDetails);
            rateableExpands.forEach(v => tabParams.append('rateableExpand', v));
            capitalExpands.forEach(v => tabParams.append('capitalExpand', v));
            dualExpands.forEach(v => tabParams.append('dualExpand', v));
            tabQueryString = tabParams.toString();
          } else {
            const tabParams = new URLSearchParams(queryString);
            if (tabReturnValue) {
              tabParams.set('returnTab', tabReturnValue);
            } else {
              tabParams.delete('returnTab');
            }
            tabQueryString = tabParams.toString();
          }

          const tabHref = tabQueryString ? `${tabPath}?${tabQueryString}` : tabPath;

          const activeSegment = pathname.split('/').pop() ?? '';
          const oldDetailsSectionPath = `${baseTabPath}/OldDetails`;

          // This is safe and intentional for single-segment tabs; OldDetails is a section tab
          // and should remain active for any nested route under /OldDetails/.
          const isOldDetailsTab = tab.href === 'OldDetails/old-taxation';
          const isActive = isOldDetailsTab
            ? pathname === tabPath ||
            pathname === oldDetailsSectionPath ||
            pathname.startsWith(`${oldDetailsSectionPath}/`)
            : activeSegment === tab.href || pathname === tabPath;

          const Icon = tab.icon;

          const gradientClass = TAB_GRADIENT_CLASSES.activeClass;

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tabHref)}
              data-href={tabHref}
              className={[
                'inline-flex items-center gap-1 px-2 py-2 text-[11px] rounded-md border font-semibold transition-all hover:shadow-md cursor-pointer text-left focus:outline-none whitespace-nowrap',
                isActive
                  ? `bg-linear-to-br ${gradientClass} text-white shadow-lg`
                  : 'bg-white text-gray-600 border-gray-300',
              ].join(' ')}
            >
              <Icon className="w-4 h-4" />
              <span>{t(`tabs.${tab.label}`)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}