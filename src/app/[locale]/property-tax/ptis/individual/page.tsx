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
import { getIndividualQcTopSectionAction } from '@/lib/api/ptis/individual';
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

  const [pageData, workflowStagesResult, currentWorkflow, topSectionRes] = await Promise.all([
    fetchPtisPageData(resolvedSearchParams, locale),
    propertyWorkflowStageService.getWorkflowStages().catch(() => null),
    isPropIdValid ? propertyWorkflowStageService.getCurrentWorkflowDetail(propertyIdRaw).catch(() => null) : Promise.resolve(null),
    isPropIdValid ? getIndividualQcTopSectionAction(propertyIdRaw).catch(() => null) : Promise.resolve(null),
  ]);

  const workflowStages = workflowStagesResult?.success && workflowStagesResult.data ? workflowStagesResult.data : [];
  const currentWorkflowStageId = currentWorkflow?.success ? currentWorkflow.data?.workflowStageId : undefined;
  const resolvedPropertyId = isPropIdValid ? propertyIdRaw : (pageData?.resolvedPropertyId ?? undefined);

  const initialData: PtisInitialData = {
    propertyDetails: pageData.propertyDetailsResult?.propertyDetails || undefined,
    kycDetails: pageData.kycDetails ?? undefined,
    societyDetails: pageData.societyDetails ?? undefined,
    buildingPermission: pageData.buildingPermission ?? undefined,
    wardOptions: pageData.wardOptions,
    propertyOptions: pageData.propertyOptions,
    rawPropertyData: pageData.rawPropertyData,
    oldDetails: pageData.oldDetails ?? undefined,
    oldFloorTableData: pageData.oldFloorTableData,
    showOldFloorInfo: pageData.showFloorParam,
    oldTaxesData: Array.isArray(pageData.oldTaxesData) ? null : (pageData.oldTaxesData ?? null),
    showOldTaxInfo: pageData.showOldTaxParam,
    showOldMapInfo: pageData.showMapDetailsParam,
    discountDetails: pageData.discountDetails ?? undefined,
    tabHeaderInfo: pageData.tabHeaderInfo,
    mappedPropertiesData: pageData.mappedPropertiesData,
  };

  const baseData = topSectionRes?.success && topSectionRes.data ? topSectionRes.data : undefined;
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
