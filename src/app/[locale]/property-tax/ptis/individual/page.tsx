import { cookies } from 'next/headers';
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
  getIndividualTaxDetailsAction,
  fetchIndividualPropertyComparisonAction,
  getIndividualOldDetailsAction,
  getIndividualOldFloorDetailsAction,
  getIndividualOldTaxesDetailsAction,
  getIndividualMappedPropertiesAction,
} from './action';
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
  ] = await Promise.all([
    fetchPtisPageData(resolvedSearchParams, locale),
    propertyWorkflowStageService.getWorkflowStages().catch(() => null),
    isPropIdValid ? propertyWorkflowStageService.getCurrentWorkflowDetail(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getIndividualQcTopSectionAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getApartmentQCTopSectionBelowFlex(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getIndividualOldDetailsAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getIndividualOldFloorDetailsAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getIndividualOldTaxesDetailsAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getIndividualMappedPropertiesAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
  ]);

  const resolvedPropertyId = isPropIdValid ? propertyIdRaw : (pageData?.resolvedPropertyId ?? undefined);

  let finalTopSectionRes = topSectionRes;
  let finalCurrentWorkflow = currentWorkflow;
  let finalBelowFlexRes = belowFlexRes;
  let finalOldDetailsRes = oldDetailsRes;
  let finalOldFloorRes = oldFloorRes;
  let finalOldTaxesRes = oldTaxesRes;
  let finalMappedPropsRes = mappedPropsRes;

  // Complete SSR: if property was resolved (e.g. from pageData or query), ensure details are fetched server-side
  const needsTopSection = !finalTopSectionRes?.success;
  const needsWorkflow = !finalCurrentWorkflow?.success;
  const needsBelowFlex = !finalBelowFlexRes?.success;
  const needsOldDetails = !finalOldDetailsRes?.success || !finalOldDetailsRes?.data;

  if (resolvedPropertyId && (needsTopSection || needsWorkflow || needsBelowFlex || needsOldDetails)) {
    const [
      lateTopSection,
      lateWorkflow,
      lateBelowFlex,
      lateOldDetails,
      lateOldFloor,
      lateOldTaxes,
      lateMappedProps,
    ] = await Promise.all([
      needsTopSection ? getIndividualQcTopSectionAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      needsWorkflow ? propertyWorkflowStageService.getCurrentWorkflowDetail(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      needsBelowFlex ? getApartmentQCTopSectionBelowFlex(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      needsOldDetails ? getIndividualOldDetailsAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      (!finalOldFloorRes?.success) ? getIndividualOldFloorDetailsAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      (!finalOldTaxesRes?.success) ? getIndividualOldTaxesDetailsAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
      (!finalMappedPropsRes?.success) ? getIndividualMappedPropertiesAction(resolvedPropertyId).catch(() => null) : Promise.resolve(null),
    ]);
    if (lateTopSection) finalTopSectionRes = lateTopSection;
    if (lateWorkflow) finalCurrentWorkflow = lateWorkflow;
    if (lateBelowFlex) finalBelowFlexRes = lateBelowFlex;
    if (lateOldDetails) finalOldDetailsRes = lateOldDetails;
    if (lateOldFloor) finalOldFloorRes = lateOldFloor;
    if (lateOldTaxes) finalOldTaxesRes = lateOldTaxes;
    if (lateMappedProps) finalMappedPropsRes = lateMappedProps;
  }


  const initialQcTopSectionBelowFlex = (finalBelowFlexRes?.success && (finalBelowFlexRes.items || finalBelowFlexRes.data))
    ? ((finalBelowFlexRes.items ?? finalBelowFlexRes.data) ?? null)
    : null;

  const workflowStages = workflowStagesResult?.success && workflowStagesResult.data ? workflowStagesResult.data : [];
  const currentWorkflowStageId = finalCurrentWorkflow?.success ? finalCurrentWorkflow.data?.workflowStageId : undefined;

  const initialData: PtisInitialData = {
    propertyDetails: pageData.propertyDetailsResult?.propertyDetails || undefined,
    kycDetails: pageData.kycDetails ?? undefined,
    societyDetails: pageData.societyDetails ?? undefined,
    buildingPermission: pageData.buildingPermission ?? undefined,
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
    discountDetails: pageData.discountDetails ?? undefined,
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
    initialPropertyMasterData?.ownerName && initialPropertyMasterData.ownerName !== '-'
      ? initialPropertyMasterData.ownerName
      : kycDetails?.propertyHolderName ||
        kycDetails?.propertyHolderNameEnglish ||
        tabHeaderInfo?.ownerName ||
        '';

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
  const initialTaxType = initialTaxMode === 'capital' ? 'CV' : initialTaxMode === 'dual' ? 'Dual' : 'RV';

  const finalWardId = pageData.resolvedWardId ? String(pageData.resolvedWardId) : wardId;
  const initialTaxDetailsRes = finalWardId && propertyNo
    ? await getIndividualTaxDetailsAction(finalWardId, propertyNo, initialTaxType).catch(() => null)
    : null;
  const initialTaxDetails = initialTaxDetailsRes?.success && initialTaxDetailsRes.items ? initialTaxDetailsRes.items : null;

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
            initialRateableData={pageData.rateableResult?.success ? pageData.rateableResult.data : null}
            initialCapitalData={pageData.capitalResult?.success ? pageData.capitalResult.data : null}
            initialDualMethodData={pageData.dualSectionData?.initialDualMethodData ?? null}
            initialComparisonData={initialComparisonData}
            initialTaxDetails={initialTaxDetails}
            initialTaxMode={initialTaxMode}
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
