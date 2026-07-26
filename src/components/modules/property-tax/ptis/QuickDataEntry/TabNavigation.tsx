'use client';

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TABS, RETURN_TAB_BY_QDE_HREF, TAB_GRADIENT_CLASSES } from './navigation-constants';
import { useConfirm } from '@/components/common/ConfirmProvider';

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
  const appartmentPartition = searchParams.get('appartmentPartition') || '';
  const parentPropertyId = searchParams.get('parentPropertyId') || '';

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
  if (appartmentPartition) params.set('appartmentPartition', appartmentPartition);
  if (parentPropertyId) params.set('parentPropertyId', parentPropertyId);
  rateableExpands.forEach(v => params.append('rateableExpand', v));
  capitalExpands.forEach(v => params.append('capitalExpand', v));
  dualExpands.forEach(v => params.append('dualExpand', v));

  const queryString = params.toString();

  const { confirm } = useConfirm();

  const handleTabClick = (tabHref: string) => {
    const win = typeof window !== 'undefined' ? (window as unknown as { __buildingFormHasChanges?: boolean; __discountFormHasChanges?: boolean; __socialFormHasChanges?: boolean }) : {};
    const hasBuildingChanges = !!win.__buildingFormHasChanges;
    const hasDiscountChanges = !!win.__discountFormHasChanges || !!win.__socialFormHasChanges;

    if (hasBuildingChanges || hasDiscountChanges) {
      const title = hasBuildingChanges 
          ? (t('building.unsavedChangesTitle') || 'Unsaved Changes')
          : (t('discount.unsavedChangesTitle') || 'Unsaved Changes');

      const description = hasBuildingChanges
          ? (t('building.unsavedChangesDesc') || 'You have unsaved changes in the Building Permission tab. Do you want to discard them, or continue editing?')
          : (t('discount.unsavedChangesDesc') || 'You have unsaved changes in the Discount & Social Data tab. Do you want to discard them, or continue editing?');

      const continueButton = hasBuildingChanges
          ? (t('building.continueButton') || 'Continue Editing')
          : (t('discount.continueButton') || 'Continue Editing');

      const discardButton = hasBuildingChanges
          ? (t('building.discardConfirmButton') || 'Discard Changes')
          : (t('discount.discardConfirmButton') || 'Discard Changes');

      confirm({
        variant: 'warning',
        title,
        description,
        confirmText: continueButton,
        cancelText: discardButton,
        onConfirm: () => {
          // Do nothing, stays on screen
        },
        onCancel: () => {
          const e = typeof window !== 'undefined' ? (window.event as Event | undefined) : null;
          const target = e?.target as HTMLElement | null;
          const isSafeDismiss = e && (
            e.type === 'keydown' ||
            (e.type === 'click' && !target?.closest?.('button')) ||
            target?.closest?.('button')?.getAttribute?.('aria-label') === 'Close'
          );

          if (isSafeDismiss) return;

          win.__buildingFormHasChanges = false;
          win.__discountFormHasChanges = false;
          win.__socialFormHasChanges = false;
          router.replace(tabHref);
        }
      });
    } else {
      router.replace(tabHref);
    }
  };

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
            if (appartmentPartition) tabParams.set('appartmentPartition', appartmentPartition);
            if (parentPropertyId) tabParams.set('parentPropertyId', parentPropertyId);
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
              onClick={() => handleTabClick(tabHref)}
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
