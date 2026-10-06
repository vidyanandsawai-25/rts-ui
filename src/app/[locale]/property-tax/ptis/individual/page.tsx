import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PtisLayoutWrapper } from '@/components/modules/property-tax/ptis/PtisLayoutWrapper';
import { getMediaPanelVisibleFromCookieStore } from '@/lib/utils/cookie';
import { BottomActionBar } from '@/components/layout/BottomActionBar';
import {
  PtisBackButton,
  PtisFooterDropdowns,
} from '@/components/modules/property-tax/ptis/PtisFooterControls';
import { PtisNavigationProvider } from '@/components/modules/property-tax/ptis/shared/PtisNavigationContext';
import { buildFooterActions } from '@/app/[locale]/property-tax/ptis/buildFooterActions';
import { fetchPtisPageData } from '@/app/[locale]/property-tax/ptis/ptis-fetch.service';
import { propertyWorkflowStageService } from '@/lib/api/ptis/propertyWorkflowStage/propertyWorkflowStage.service';
import { getApartmentQCTopSectionBelowFlex } from '@/lib/api/ptis/apartment';
import {
  getIndividualQcTopSectionAction,
  fetchIndividualPropertyComparisonAction,
  getIndividualOldDetailsAction,
  getIndividualOldFloorDetailsAction,
  getIndividualOldTaxesDetailsAction,
  getIndividualMappedPropertiesAction,
  fetchIndividualCapitalValueAction,
  fetchIndividualDualMethodAction,
  fetchIndividualRateableValueAction,
  fetchIndividualSocialAndDiscountDetailsAction,
  getIndividualBuildingCertificatesAction,
  fetchPropertyRuleLogsAction,
} from './action';
import { fetchTaxDetailsByTab, type TaxDetailsResult } from './TaxDetails/fetchTaxDetails';
import { buildInitialIndividualMasterData } from './individual-property.builder';
import { toSafeString } from '@/lib/utils/format';
import { PtisInitialData } from '@/types/ptis.types';
import { IndividualContainer } from '@/components/modules/property-tax/ptis/individual';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<
    Record<string, string | string[] | undefined> & {
      wardNo?: string;
      propertyNo?: string;
      partitionNo?: string;
      propertyId?: string;
      wardId?: string;
    }
  >;
}

export default async function PtisIndividualPage({ params, searchParams }: PageProps) {
  const cookieStore = await cookies();
  const isMediaPanelVisible = getMediaPanelVisibleFromCookieStore(cookieStore);
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const { locale } = resolvedParams;

  const propertyIdRaw = resolvedSearchParams?.propertyId
    ? parseInt(resolvedSearchParams.propertyId as string, 10)
    : NaN;
  const isPropIdValid = Number.isFinite(propertyIdRaw) && propertyIdRaw > 0;

  const wardNo = toSafeString(resolvedSearchParams.wardNo);
  const wardId = toSafeString(resolvedSearchParams.wardId);
  const propertyNo = toSafeString(resolvedSearchParams.propertyNo);
  const rawPartitionNo = toSafeString(resolvedSearchParams.partitionNo);
  const partitionNo = rawPartitionNo === '0' ? '' : rawPartitionNo;

  const rawTab = toSafeString(resolvedSearchParams?.tab).toLowerCase();
  const isOldDetailsTab = rawTab === 'olddetails' || rawTab === 'old';
  const isDiscountTab = rawTab === 'discount' || rawTab === 'discountdetails';
  const isBuildingTab = rawTab === 'building' || rawTab === 'buildingpermission';

  const [
    pageData,
    workflowStagesResult,
    currentWorkflow,
    topSectionRes,
    belowFlexRes,
    oldDetailsRes,
    oldFloorRes,
    oldTaxesRes,
    mappedPropsRes,
    ruleLogsRes,
  ] = await Promise.all([
    fetchPtisPageData(resolvedSearchParams, locale),
    propertyWorkflowStageService.getWorkflowStages().catch(() => null),
    isPropIdValid ? propertyWorkflowStageService.getCurrentWorkflowDetail(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getIndividualQcTopSectionAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    (isPropIdValid || (wardId && propertyNo))
      ? getApartmentQCTopSectionBelowFlex({
          propertyId: isPropIdValid ? propertyIdRaw : undefined,
          ward: wardId || undefined,
          propertyNo: propertyNo || undefined,
          partitionNo: partitionNo || undefined,
        }).catch(() => null)
      : Promise.resolve(null),
    isPropIdValid && isOldDetailsTab ? getIndividualOldDetailsAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid && isOldDetailsTab ? getIndividualOldFloorDetailsAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid && isOldDetailsTab ? getIndividualOldTaxesDetailsAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid && isOldDetailsTab ? getIndividualMappedPropertiesAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? fetchPropertyRuleLogsAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
  ]);

  const resolvedPropertyId = isPropIdValid ? propertyIdRaw : (pageData?.resolvedPropertyId ?? undefined);

  const rawCategoryId = pageData?.propertyDetailsResult?.propertyDetails?.categoryId;
  const rawCategoryName = pageData?.tabHeaderInfo?.category ?? '';
  const isIndividual = rawCategoryId === 2 || String(rawCategoryName).toLowerCase().includes('individual');
  const isApartment = rawCategoryId === 1 || rawCategoryId === 0 || String(rawCategoryName).toLowerCase().includes('apartment') || (!isIndividual && Boolean(pageData?.societyDetails?.societyDetailId));
  const isMainProp = isApartment && (!partitionNo || partitionNo === '0' || partitionNo.trim() === '' || partitionNo.trim() === '-');

  const isApartmentSocietyProperty =
    isMainProp ||
    rawCategoryId === 0 ||
    String(rawCategoryName).toLowerCase() === 'apartment society property';

  if (resolvedPropertyId && isApartmentSocietyProperty) {
    const redirectParams = new URLSearchParams();
    if (resolvedSearchParams) {
      Object.entries(resolvedSearchParams).forEach(([k, v]) => {
        if (typeof v === 'string') redirectParams.set(k, v);
      });
    }
    redirect(`/${locale}/property-tax/ptis/apartment?${redirectParams.toString()}`);
  }

  let finalTopSectionRes = topSectionRes;
  let finalCurrentWorkflow = currentWorkflow;
  let finalBelowFlexRes = belowFlexRes;
  let finalOldDetailsRes = oldDetailsRes;
  let finalOldFloorRes = oldFloorRes;
  let finalOldTaxesRes = oldTaxesRes;
  let finalMappedPropsRes = mappedPropsRes;
  let finalRuleLogsRes = ruleLogsRes;

  // Complete SSR: if property was resolved (e.g. from pageData or query), ensure details are fetched server-side
  const needsTopSection = !finalTopSectionRes?.success;
  const needsWorkflow = !finalCurrentWorkflow?.success;
  const needsBelowFlex = !finalBelowFlexRes?.success;
  const needsOldDetails = isOldDetailsTab && (!finalOldDetailsRes?.success || !finalOldDetailsRes?.data);
  const needsRuleLogs = !finalRuleLogsRes?.success;

  if (resolvedPropertyId && (needsTopSection || needsWorkflow || needsBelowFlex || needsOldDetails || needsRuleLogs)) {
    const [
      lateTopSection,
      lateWorkflow,
      lateBelowFlex,
      lateOldDetails,
      lateOldFloor,
      lateOldTaxes,
      lateMappedProps,
      lateRuleLogs,
    ] = await Promise.all([
      needsTopSection ? getIndividualQcTopSectionAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      needsWorkflow ? propertyWorkflowStageService.getCurrentWorkflowDetail(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      needsBelowFlex && (resolvedPropertyId || (wardId && propertyNo))
        ? getApartmentQCTopSectionBelowFlex({
            propertyId: resolvedPropertyId || undefined,
            ward: (pageData?.resolvedWardId?.toString() || wardId) || undefined,
            propertyNo: propertyNo || undefined,
            partitionNo: partitionNo || undefined,
          }).catch(() => null)
        : Promise.resolve(null),
      needsOldDetails ? getIndividualOldDetailsAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      (isOldDetailsTab && !finalOldFloorRes?.success) ? getIndividualOldFloorDetailsAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      (isOldDetailsTab && !finalOldTaxesRes?.success) ? getIndividualOldTaxesDetailsAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      (isOldDetailsTab && !finalMappedPropsRes?.success) ? getIndividualMappedPropertiesAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      needsRuleLogs ? fetchPropertyRuleLogsAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
    ]);
    if (lateTopSection) finalTopSectionRes = lateTopSection;
    if (lateWorkflow) finalCurrentWorkflow = lateWorkflow;
    if (lateBelowFlex) finalBelowFlexRes = lateBelowFlex;
    if (lateOldDetails) finalOldDetailsRes = lateOldDetails;
    if (lateOldFloor) finalOldFloorRes = lateOldFloor;
    if (lateOldTaxes) finalOldTaxesRes = lateOldTaxes;
    if (lateMappedProps) finalMappedPropsRes = lateMappedProps;
    if (lateRuleLogs) finalRuleLogsRes = lateRuleLogs;
  }

  const initialQcTopSectionBelowFlex = (finalBelowFlexRes?.success && (finalBelowFlexRes.items || finalBelowFlexRes.data))
    ? ((finalBelowFlexRes.items ?? finalBelowFlexRes.data) ?? null)
    : ((finalBelowFlexRes?.items || finalBelowFlexRes?.data) ?? null);

  const workflowStages = workflowStagesResult?.success && workflowStagesResult.data ? workflowStagesResult.data : [];
  const currentWorkflowStageId = finalCurrentWorkflow?.success ? finalCurrentWorkflow.data?.workflowStageId : undefined;
  const societyDetailIdRaw = resolvedSearchParams?.societyDetailId || resolvedSearchParams?.societyId;
  const resolvedSocietyDetailId = societyDetailIdRaw
    ? parseInt(societyDetailIdRaw as string, 10)
    : (pageData?.societyDetails?.societyDetailId ?? undefined);

  const wingDetailIdRaw = resolvedSearchParams?.wingDetailId || resolvedSearchParams?.wingId;
  const resolvedWingDetailId = wingDetailIdRaw
    ? parseInt(wingDetailIdRaw as string, 10)
    : (pageData?.propertyDetailsResult?.propertyDetails?.wingDetailId ?? undefined);

  const resolvedWingName =
    toSafeString(resolvedSearchParams?.wingName) ||
    pageData?.propertyDetailsResult?.propertyDetails?.wingName ||
    undefined;

  let initialDiscountData = pageData.discountDetails ?? undefined;
  let initialSocialData = pageData.socialDetails ?? undefined;

  const hasDiscountItems = Boolean(initialDiscountData?.items && initialDiscountData.items.length > 0);
  const hasSocialItems = Boolean(initialSocialData?.items && initialSocialData.items.length > 0);

  if (isDiscountTab && resolvedPropertyId && (!hasDiscountItems && !hasSocialItems)) {
    const discountRes = await fetchIndividualSocialAndDiscountDetailsAction(
      resolvedPropertyId,
      resolvedSocietyDetailId,
      resolvedWingDetailId
    ).catch(() => null);
    if (discountRes?.success) {
      if (discountRes.discountData) initialDiscountData = discountRes.discountData;
      if (discountRes.socialData) initialSocialData = discountRes.socialData;
    }
  }

  let initialBuildingPermissionData = pageData.buildingPermission ?? undefined;
  const hasBuildingItems = Boolean(
    initialBuildingPermissionData?.items && initialBuildingPermissionData.items.length > 0
  );

  if (isBuildingTab && resolvedPropertyId && !hasBuildingItems) {
    const buildingRes = await getIndividualBuildingCertificatesAction(resolvedPropertyId).catch(() => null);
    if (buildingRes?.success && buildingRes.data) {
      initialBuildingPermissionData = buildingRes.data;
    }
  }

  const initialData: PtisInitialData = {
    propertyDetails: pageData.propertyDetailsResult?.propertyDetails || undefined,
    kycDetails: pageData.kycDetails ?? undefined,
    societyDetails: pageData.societyDetails ?? undefined,
    buildingPermission: initialBuildingPermissionData,
    wardOptions: pageData.wardOptions,
    propertyOptions: pageData.propertyOptions,
    rawPropertyData: pageData.rawPropertyData,
    oldDetails: (finalOldDetailsRes?.success && finalOldDetailsRes.data)
      ? finalOldDetailsRes.data
      : (pageData.oldDetails ?? undefined),
    oldFloorTableData: (finalOldFloorRes?.success && Array.isArray(finalOldFloorRes.data) && finalOldFloorRes.data.length > 0)
      ? finalOldFloorRes.data
      : (pageData.oldFloorTableData || []),
    showOldFloorInfo: pageData.showFloorParam,
    oldTaxesData: (finalOldTaxesRes?.success && finalOldTaxesRes.data)
      ? finalOldTaxesRes.data
      : (Array.isArray(pageData.oldTaxesData) ? null : (pageData.oldTaxesData ?? null)),
    showOldTaxInfo: pageData.showOldTaxParam,
    showOldMapInfo: pageData.showMapDetailsParam,
    discountDetails: initialDiscountData,
    socialDetails: initialSocialData,
    tabHeaderInfo: pageData.tabHeaderInfo,
    mappedPropertiesData: (finalMappedPropsRes?.success && Array.isArray(finalMappedPropsRes.data) && finalMappedPropsRes.data.length > 0)
      ? finalMappedPropsRes.data
      : (pageData.mappedPropertiesData || []),
  };

  const baseData = finalTopSectionRes?.success && finalTopSectionRes.data ? finalTopSectionRes.data : undefined;
  const initialPropertyMasterData = buildInitialIndividualMasterData({
    resolvedPropertyId,
    baseData,
    pageData,
    wardNo,
    propertyNo,
  });

  const footerActions = buildFooterActions();

  const { kycDetails, tabHeaderInfo, propertyDetailsResult, societyDetails } = pageData;
  const propDetails = propertyDetailsResult?.propertyDetails;

  const ownerName =
    initialPropertyMasterData?.ownerNameEnglish && initialPropertyMasterData.ownerNameEnglish !== '-'
      ? initialPropertyMasterData.ownerNameEnglish
      : initialPropertyMasterData?.ownerName && initialPropertyMasterData.ownerName !== '-'
        ? initialPropertyMasterData.ownerName
        : kycDetails?.ownerNameEnglish ||
          kycDetails?.propertyHolderNameEnglish ||
          tabHeaderInfo?.ownerName ||
          propDetails?.ownerName ||
          kycDetails?.ownerName ||
          kycDetails?.propertyHolderName ||
          '-';

  const propertyDescription =
    initialPropertyMasterData?.propertyDescription && initialPropertyMasterData.propertyDescription !== '-'
      ? initialPropertyMasterData.propertyDescription
      : tabHeaderInfo?.description ||
        '';

  const currentCategoryId = propDetails?.categoryId ?? initialPropertyMasterData?.categoryId ?? undefined;
  const currentPropertyTypeId = initialPropertyMasterData?.propertyTypeId ?? undefined;
  const currentType = tabHeaderInfo?.type ?? null;
  const currentSocietyDetailId = societyDetails?.societyDetailId ?? undefined;


  const rawValuationTab = toSafeString(resolvedSearchParams?.valuationTab || resolvedSearchParams?.tab);
  const initialTaxMode = rawValuationTab === 'capital' ? 'capital' : rawValuationTab === 'dual' ? 'dual' : 'rateable';

  const initialTaxDetailsRes: TaxDetailsResult = resolvedPropertyId
    ? await fetchTaxDetailsByTab(resolvedPropertyId, initialTaxMode, true).catch(() => ({} as TaxDetailsResult))
    : {};
  const initialRateableTaxDetails = initialTaxDetailsRes.rateableTaxDetails;
  const initialCapitalTaxDetails = initialTaxDetailsRes.capitalTaxDetails;

  let initialRateableData = pageData.rateableResult?.success ? pageData.rateableResult.data : null;
  let initialCapitalData = pageData.capitalResult?.success ? pageData.capitalResult.data : null;
  let initialDualMethodData = pageData.dualSectionData?.initialDualMethodData ?? null;

  if (resolvedPropertyId) {
    if (initialTaxMode === 'capital' && !initialCapitalData) {
      const capRes = await fetchIndividualCapitalValueAction(resolvedPropertyId).catch(() => null);
      if (capRes?.success && capRes.data) initialCapitalData = capRes.data;
    } else if (initialTaxMode === 'rateable' && !initialRateableData) {
      const rvRes = await fetchIndividualRateableValueAction(resolvedPropertyId).catch(() => null);
      if (rvRes?.success && rvRes.data) initialRateableData = rvRes.data;
    } else if (initialTaxMode === 'dual' && !initialDualMethodData) {
      const dualRes = await fetchIndividualDualMethodAction(resolvedPropertyId).catch(() => null);
      if (dualRes?.success && dualRes.data) initialDualMethodData = dualRes.data;
    }
  }

  const initialComparisonRes = pageData.comparisonResult?.success
    ? pageData.comparisonResult
    : (resolvedPropertyId ? await fetchIndividualPropertyComparisonAction(resolvedPropertyId).catch(() => null) : null);
  const initialComparisonData = initialComparisonRes?.success && initialComparisonRes.data ? initialComparisonRes.data : null;

  return (
    <PtisNavigationProvider properties={pageData.rawPropertyData}>
      <div className="flex flex-col gap-6 pb-24 font-sans bg-slate-100 min-h-screen">
        <PtisLayoutWrapper
          wardNo={wardNo}
          propertyNo={propertyNo}
          partitionNo={partitionNo}
          propertyHolderName={kycDetails?.propertyHolderName || ''}
          propertyHolderNameMarathi={kycDetails?.propertyHolderNameMarathi || ''}
          isQCApproved={false}
          propertyId={resolvedPropertyId}
          isMainProperty={false}
          categoryId={currentCategoryId}
          propertyTypeId={currentPropertyTypeId}
          propertyDescription={propertyDescription}
          type={currentType}
          societyDetailId={currentSocietyDetailId}
          initialPhotoSlots={pageData.initialPhotoSlots}
          initialPhotos={pageData.initialPhotos}
          initialLatitude={pageData.latitude ? Number(pageData.latitude) : undefined}
          initialLongitude={pageData.longitude ? Number(pageData.longitude) : undefined}
          initialWaybackReleases={pageData.waybackReleases}
          initialVisible={isMediaPanelVisible}
        >
          <IndividualContainer
            initialData={initialData}
            initialWardId={pageData.resolvedWardId ?? (wardId ? Number(wardId) : null)}
            initialPropertyMasterData={initialPropertyMasterData}
            initialQcTopSectionBelowFlex={initialQcTopSectionBelowFlex}
            initialRateableData={initialRateableData}
            initialCapitalData={initialCapitalData}
            initialDualMethodData={initialDualMethodData}
            initialComparisonData={initialComparisonData}
            initialRateableTaxDetails={initialRateableTaxDetails}
            initialCapitalTaxDetails={initialCapitalTaxDetails}
            initialTaxMode={initialTaxMode}
            societyDetailId={resolvedSocietyDetailId}
            wingDetailId={resolvedWingDetailId}
            wingName={resolvedWingName}
            hasAppliedRules={
              (finalRuleLogsRes?.success && finalRuleLogsRes.data?.items && finalRuleLogsRes.data.items.length > 0)
                ? true
                : (pageData.hasAppliedRules || false)
            }
            appliedRules={
              (finalRuleLogsRes?.success && finalRuleLogsRes.data?.items)
                ? finalRuleLogsRes.data.items
                : (pageData.appliedRulesList || [])
            }
            locale={locale}
          />
        </PtisLayoutWrapper>

        <BottomActionBar
          actions={footerActions}
          properties={pageData.rawPropertyData}
          workflowStages={[]}
          currentWorkflowStageId={currentWorkflowStageId}
          leftContent={<PtisBackButton />}
          rightContent={
            <PtisFooterDropdowns
              key="footer-dropdowns"
              workflowStages={workflowStages}
              propertyId={resolvedPropertyId}
              currentWorkflowStageId={currentWorkflowStageId}
              propertyNo={propertyNo}
              ownerName={ownerName}
            />
          }
          categoryId={pageData.propertyDetailsResult?.propertyDetails?.categoryId}
          societyDetailId={pageData.societyDetails?.societyDetailId}
          isCombined={!!tabHeaderInfo?.isCombined}
        />
      </div>
    </PtisNavigationProvider>
  );
}
