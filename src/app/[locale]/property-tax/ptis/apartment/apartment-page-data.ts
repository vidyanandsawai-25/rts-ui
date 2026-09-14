import 'server-only';

import { fetchPtisPageData } from '@/app/[locale]/property-tax/ptis/ptis-fetch.service';
import { toSafeString } from '@/lib/utils/format';
import {
  ApartmentQCTopSectionBelowFlexItemsDto,
  ApartmentQCTopSectionBelowFlexResponseDto,
  WingWiseDetailsItems,
} from '@/types/property-tax/apartment';
import { PtisInitialData } from '@/types/ptis.types';
import {
  getApartmentQcTopSectionAction,
  getApartmentQCTopSectionBelowFlex,
  getWingWiseDetails,
  getApartmentTaxDetails,
} from '@/lib/api/ptis/apartment';
import { propertyWorkflowStageService } from '@/lib/api/ptis/propertyWorkflowStage/propertyWorkflowStage.service';
import type { PropertyMasterData, ApartmentTaxDetailsItem } from '@/types/property-tax/apartment';
import type { PropertyWorkflowStage } from '@/types/propertyWorkflowStage.types';
import { buildInitialPropertyMasterData, PtisPageData } from './apartment-master-builder';

export interface LoadedApartmentPageData {
  wardNo: string;
  wardId: string;
  propertyNo: string;
  partitionNo: string;
  resolvedPropertyId?: number;
  isMainProp: boolean;
  currentCategoryId?: number;
  currentPropertyTypeId?: number;
  currentType: string | null;
  currentSocietyDetailId?: number;
  workflowStages: PropertyWorkflowStage[];
  currentWorkflowStageId?: number;
  pageData: PtisPageData;
  rawData: WingWiseDetailsItems | null;
  initialData: PtisInitialData;
  initialPropertyMasterData?: PropertyMasterData;
  initialQcTopSectionBelowFlex?:
    | ApartmentQCTopSectionBelowFlexItemsDto
    | ApartmentQCTopSectionBelowFlexResponseDto
    | Record<string, unknown>
    | null;
  initialApartmentTaxDetails: ApartmentTaxDetailsItem | null;
  isApartmentSocietyProperty: boolean;
}

export async function loadApartmentPageData(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  locale: string
): Promise<LoadedApartmentPageData> {
  const resolvedSearchParams = searchParams || {};
  const propertyIdRaw = resolvedSearchParams?.propertyId
    ? parseInt(resolvedSearchParams.propertyId as string, 10)
    : NaN;
  const isPropIdValid = Number.isFinite(propertyIdRaw) && propertyIdRaw > 0;

  const wardNo = toSafeString(resolvedSearchParams.wardNo);
  const wardId = toSafeString(resolvedSearchParams.wardId);
  const propertyNo = toSafeString(resolvedSearchParams.propertyNo);
  const rawPartitionNo = toSafeString(resolvedSearchParams.partitionNo);
  const partitionNo = rawPartitionNo === '0' ? '' : rawPartitionNo;

  const initialTaxModeParam = (resolvedSearchParams?.taxMode as string) || 'rateable';
  const initialTaxType =
    initialTaxModeParam === 'capital' ? 'CV' : initialTaxModeParam === 'dual' ? 'Dual' : 'RV';

  const [
    pageData,
    workflowStagesResult,
    currentWorkflow,
    earlyTopSectionRes,
    earlyBelowFlexRes,
    earlyWingWiseRes,
    earlyTaxDetailsRes,
  ] = await Promise.all([
    fetchPtisPageData(resolvedSearchParams, locale),
    propertyWorkflowStageService.getWorkflowStages(),
    isPropIdValid ? propertyWorkflowStageService.getCurrentWorkflowDetail(propertyIdRaw) : Promise.resolve(null),
    isPropIdValid ? getApartmentQcTopSectionAction(propertyIdRaw) : Promise.resolve(null),
    isPropIdValid ? getApartmentQCTopSectionBelowFlex(propertyIdRaw) : Promise.resolve(null),
    wardId && propertyNo ? getWingWiseDetails(wardId, propertyNo).catch(() => null) : Promise.resolve(null),
    wardId && propertyNo ? getApartmentTaxDetails({ wardId, propertyNo, taxType: initialTaxType }).catch(() => null) : Promise.resolve(null),
  ]);

  const workflowStages = (workflowStagesResult?.success && workflowStagesResult.data) ? workflowStagesResult.data : [];
  const currentWorkflowStageId = currentWorkflow?.success ? currentWorkflow.data?.workflowStageId : undefined;

  const { resolvedPropertyId: pDataPropId, resolvedWardId: pDataWardId } = pageData;
  const resolvedPropertyId = isPropIdValid ? propertyIdRaw : pDataPropId;
  const finalWardId = (pDataWardId ? pDataWardId.toString() : wardId) || '';

  const [lateTopSectionRes, lateBelowFlexRes, lateWingWiseRes, lateTaxDetailsRes] = await Promise.all([
    !earlyTopSectionRes && resolvedPropertyId ? getApartmentQcTopSectionAction(resolvedPropertyId) : Promise.resolve(null),
    !earlyBelowFlexRes && resolvedPropertyId ? getApartmentQCTopSectionBelowFlex(resolvedPropertyId) : Promise.resolve(null),
    !earlyWingWiseRes && finalWardId && propertyNo ? getWingWiseDetails(finalWardId, propertyNo).catch(() => null) : Promise.resolve(null),
    !earlyTaxDetailsRes && finalWardId && propertyNo ? getApartmentTaxDetails({ wardId: finalWardId, propertyNo, taxType: initialTaxType }).catch(() => null) : Promise.resolve(null),
  ]);

  const topSectionRes = earlyTopSectionRes || lateTopSectionRes;
  const belowFlexRes = earlyBelowFlexRes || lateBelowFlexRes;
  const wingWiseRes = earlyWingWiseRes || lateWingWiseRes;
  const taxDetailsRes = earlyTaxDetailsRes || lateTaxDetailsRes;

  const rawData = wingWiseRes || null;
  const initialApartmentTaxDetails = (taxDetailsRes?.success && taxDetailsRes.items) ? taxDetailsRes.items : null;
  const initialQcTopSectionBelowFlex = (belowFlexRes?.success && (belowFlexRes.items || belowFlexRes.data))
    ? ((belowFlexRes.items ?? belowFlexRes.data) ?? null)
    : null;

  const initialData: PtisInitialData = {
    propertyDetails: pageData.propertyDetailsResult?.propertyDetails || null,
    kycDetails: pageData.kycDetails,
    societyDetails: pageData.societyDetails,
    buildingPermission: pageData.buildingPermission,
    wardOptions: pageData.wardOptions,
    propertyOptions: pageData.propertyOptions,
    rawPropertyData: pageData.rawPropertyData,
    oldDetails: pageData.oldDetails,
    oldFloorTableData: pageData.oldFloorTableData,
    showOldFloorInfo: pageData.showFloorParam,
    oldTaxesData: pageData.oldTaxesData,
    showOldTaxInfo: pageData.showOldTaxParam,
    showOldMapInfo: pageData.showMapDetailsParam,
    discountDetails: pageData.discountDetails,
    tabHeaderInfo: pageData.tabHeaderInfo,
    mappedPropertiesData: pageData.mappedPropertiesData,
  };

  const baseData = (topSectionRes?.success && topSectionRes.data) ? topSectionRes.data : undefined;
  const initialPropertyMasterData = buildInitialPropertyMasterData({
    resolvedPropertyId,
    baseData,
    pageData,
    wardNo,
    propertyNo,
    rawData,
    initialApartmentTaxDetails,
  });

  const currentCategoryId = pageData.propertyDetailsResult?.propertyDetails?.categoryId ?? initialPropertyMasterData?.categoryId ?? undefined;
  const currentCategoryName = pageData.tabHeaderInfo?.category ?? initialPropertyMasterData?.category ?? '';
  const isIndividual = currentCategoryId === 2 || String(currentCategoryName).toLowerCase().includes('individual');
  const isApartment = currentCategoryId === 1 || currentCategoryId === 0 || String(currentCategoryName).toLowerCase().includes('apartment') || (!isIndividual && (Boolean(rawData?.societyId) || Boolean(rawData?.wings && rawData.wings.length > 0) || Boolean(pageData.societyDetails?.societyDetailId)));
  const isMainProp = isApartment && (!partitionNo || partitionNo === '0' || partitionNo.trim() === '' || partitionNo.trim() === '-');
  const currentPropertyTypeId = (pageData.propertyDetailsResult?.propertyDetails as unknown as { propertyTypeId?: number })?.propertyTypeId ?? initialPropertyMasterData?.propertyTypeId ?? undefined;
  const currentType = pageData.tabHeaderInfo?.type ?? (pageData.propertyDetailsResult?.propertyDetails as unknown as { type?: string })?.type ?? (initialPropertyMasterData as unknown as { type?: string })?.type ?? null;
  const currentSocietyDetailId = (pageData.societyDetails as unknown as { societyDetailId?: number })?.societyDetailId ?? rawData?.societyId ?? undefined;

  const isApartmentSocietyProperty = isMainProp || currentCategoryId === 0 || String(currentCategoryName).toLowerCase() === 'apartment society property';

  return {
    wardNo,
    wardId,
    propertyNo,
    partitionNo,
    resolvedPropertyId,
    isMainProp,
    currentCategoryId,
    currentPropertyTypeId,
    currentType,
    currentSocietyDetailId,
    workflowStages,
    currentWorkflowStageId,
    pageData,
    rawData,
    initialData,
    initialPropertyMasterData,
    initialQcTopSectionBelowFlex,
    initialApartmentTaxDetails,
    isApartmentSocietyProperty,
  };
}
