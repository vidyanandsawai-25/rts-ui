'use client';

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TABS, RETURN_TAB_BY_QDE_HREF, TAB_GRADIENT_CLASSES } from './navigation-constants';
import { useConfirm } from '@/components/common/ConfirmProvider';

interface TabNavigationProps {
  categoryName?: string;
}

export function TabNavigation({ categoryName }: TabNavigationProps = {}) {
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
  const societyDetailId = searchParams.get('societyDetailId') || searchParams.get('societyId') || '';
  const societyId = searchParams.get('societyId') || '';
  const wingDetailId = searchParams.get('wingDetailId') || '';
  const wingId = searchParams.get('wingId') || '';
  const isWingWise = searchParams.get('isWingWise') || '';
  const isSocietyWise = searchParams.get('isSocietyWise') || '';
  const fromSocietyEdit = searchParams.get('fromSocietyEdit') === 'true';
  const fromWingEdit = searchParams.get('fromWingEdit') === 'true';
  const fromFooterEdit = searchParams.get('fromFooterEdit') === 'true';
  const hideWing = searchParams.get('hideWing') === 'true' || fromSocietyEdit || fromFooterEdit;
  const hideSociety = searchParams.get('hideSociety') === 'true' || fromWingEdit || fromFooterEdit;

  // Check if Property Category is main Apartment or Apartment/Individual
  const rawCat = categoryName || searchParams.get('propertyCategory') || searchParams.get('categoryName') || '';
  const hasPartition = Boolean(appartmentPartition || partitionNo);
  const displayCategory = (hasPartition && rawCat.toLowerCase() === 'apartment')
    ? 'Apartment/Individual'
    : rawCat;

  const effectiveCategoryName = displayCategory.toLowerCase();
  const isMainApartmentCategory = !hasPartition && (effectiveCategoryName.includes('apartment') || returnTab === 'apartment');
  const isIndividualProperty =
    effectiveCategoryName.includes('apartment/individual') ||
    effectiveCategoryName.includes('individual') ||
    effectiveCategoryName === 'individual';

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
  if (societyDetailId) params.set('societyDetailId', societyDetailId);
  if (societyId) params.set('societyId', societyId);
  if (wingDetailId) params.set('wingDetailId', wingDetailId);
  if (wingId) params.set('wingId', wingId);
  if (isWingWise) params.set('isWingWise', isWingWise);
  if (isSocietyWise) params.set('isSocietyWise', isSocietyWise);
  if (fromSocietyEdit) params.set('fromSocietyEdit', 'true');
  if (fromWingEdit) params.set('fromWingEdit', 'true');
  if (fromFooterEdit) params.set('fromFooterEdit', 'true');
  if (hideWing) params.set('hideWing', 'true');
  if (hideSociety) params.set('hideSociety', 'true');
  rateableExpands.forEach(v => params.append('rateableExpand', v));
  capitalExpands.forEach(v => params.append('capitalExpand', v));
  dualExpands.forEach(v => params.append('dualExpand', v));

  const queryString = params.toString();

  const { confirm } = useConfirm();

  const handleTabClick = (tabHref: string) => {
    const win = typeof window !== 'undefined' ? (window as unknown as {
        __buildingFormHasChanges?: boolean;
        __discountFormHasChanges?: boolean;
        __socialFormHasChanges?: boolean;
        __buildingFormIncompleteDetails?: string[] | null;
        __showBuildingUnsavedChangesModal?: ((onDiscard: () => void) => void) | null;
    }) : {} as Record<string, never>;
    const hasBuildingChanges = !!win.__buildingFormHasChanges;
    const hasDiscountChanges = !!win.__discountFormHasChanges || !!win.__socialFormHasChanges;

    const onDiscard = () => {
      win.__buildingFormHasChanges = false;
      win.__discountFormHasChanges = false;
      win.__socialFormHasChanges = false;
      router.push(tabHref);
    };

    if (hasBuildingChanges && win.__showBuildingUnsavedChangesModal) {
      win.__showBuildingUnsavedChangesModal(onDiscard);
      return;
    }

    if (hasBuildingChanges || hasDiscountChanges) {
      const title = hasBuildingChanges 
          ? (t('building.unsavedChangesTitle') || 'Unsaved Changes')
          : (t('discount.unsavedChangesTitle') || 'Unsaved Changes');

      let description = hasBuildingChanges
          ? (t('building.unsavedChangesDesc') || 'You have unsaved changes in the Building Permission tab. Do you want to discard them, or continue editing?')
          : (t('discount.unsavedChangesDesc') || 'You have unsaved changes in the Discount & Social Data tab. Do you want to discard them, or continue editing?');

      if (hasBuildingChanges && win.__buildingFormIncompleteDetails && Array.isArray(win.__buildingFormIncompleteDetails)) {
          const incompleteMsg = t('building.incompleteFloorsWarning') || 'The following floor(s) have incomplete certificate information:';
          description = `${description}\n\n⚠️ ${incompleteMsg}\n• ${win.__buildingFormIncompleteDetails.join('\n• ')}`;
      }

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

  const isApartment = returnTab === 'apartment' || searchParams.get('from') === 'apartment';

  const visibleTabs = isApartment
    ? TABS.filter((tab) => {
        if (tab.label === 'Property' || tab.label === 'Kyc') return false;
        if ((hideWing || isIndividualProperty) && tab.label === 'Wing') return false;
        if ((hideSociety || isIndividualProperty) && tab.label === 'Society') return false;
        if (isMainApartmentCategory && tab.label === 'FloorSubmission') return false;
        return true;
      })
    : TABS.filter((tab) => {
        if ((hideWing || isIndividualProperty) && tab.label === 'Wing') return false;
        if ((hideSociety || isIndividualProperty) && tab.label === 'Society') return false;
        if (isMainApartmentCategory && tab.label === 'FloorSubmission') return false;
        return true;
      });

  return (
    <div className="bg-white border-b-2 border-slate-300 px-3 py-2 shadow-sm overflow-x-auto no-scrollbar">
      <nav
        className="flex md:grid w-full gap-1.5 h-auto p-1 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
      >
        {visibleTabs.map((tab) => {
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

          const tabReturnValue = isApartment ? 'apartment' : (RETURN_TAB_BY_QDE_HREF[tab.href] || returnTab);

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
            if (fromSocietyEdit) tabParams.set('fromSocietyEdit', 'true');
            if (fromWingEdit) tabParams.set('fromWingEdit', 'true');
            if (fromFooterEdit) tabParams.set('fromFooterEdit', 'true');
            if (hideWing) tabParams.set('hideWing', 'true');
            if (hideSociety) tabParams.set('hideSociety', 'true');
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

          const tabLabel = isApartment && tab.label === 'Society'
            ? (t('tabs.SocietyDetails') || 'Society Details')
            : t(`tabs.${tab.label}`);

          return (
            <button
              key={tab.href}
              onClick={() => handleTabClick(tabHref)}
              data-href={tabHref}
              className={[
                'inline-flex items-center gap-1 px-2 py-2 text-[11px] rounded-md border font-semibold transition-all hover:shadow-md cursor-pointer text-left focus:outline-none whitespace-nowrap justify-center',
                isActive
                  ? `bg-linear-to-br ${gradientClass} text-white shadow-lg`
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-slate-50',
              ].join(' ')}
            >
              <Icon className="w-4 h-4" />
              <span>{tabLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
