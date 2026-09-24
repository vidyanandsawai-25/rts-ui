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
import type { PropertyMasterData, ApartmentTaxDetailsItem } from '@/types/property-tax/apartment';
import type { PropertyWorkflowStage } from '@/types/propertyWorkflowStage.types';
import { propertyWorkflowStageService } from '@/lib/api/ptis/propertyWorkflowStage/propertyWorkflowStage.service';
import { extractCoordinates } from '@/lib/utils/coordinate-utils';
import { DEFAULT_WAYBACK_RELEASES } from '@/lib/api/wayback.service';
import { getPhotosBySocietyAction, getSocietyPhotoTypesWithStatusAction } from '@/app/[locale]/property-tax/ptis/SocietyPhoto.action';
import type { PropertyPhotoDto, PropertyPhotoTypeWithStatusDto, SocietyPhotoTypeWithStatusDto } from '@/types/photoplan.types';
import { buildInitialPropertyMasterData, PtisPageData } from './apartment-master-builder';
import { fetchApartmentQcCertificateGrid } from '@/lib/api/ptis/apartment/apartment-qc-top-section.service';
import { getCertificateTypeMaster } from '@/lib/api/building.service';

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
  societyLatitude?: number;
  societyLongitude?: number;
  initialCertificateGrid?: unknown;
  initialMasterTypes?: unknown[] | null;
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

  let finalTaxDetailsRes = taxDetailsRes;
  if (!finalTaxDetailsRes && finalWardId && propertyNo) {
    finalTaxDetailsRes = await getApartmentTaxDetails({
      wardId: finalWardId,
      propertyNo,
      taxType: initialTaxType,
    }).catch(() => null);
  }

  const initialApartmentTaxDetails = (finalTaxDetailsRes?.success && finalTaxDetailsRes.items) ? finalTaxDetailsRes.items : null;
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

  const searchSocietyId =
    resolvedSearchParams?.societyDetailId ||
    resolvedSearchParams?.societydetailid ||
    resolvedSearchParams?.societyId ||
    resolvedSearchParams?.societyid;
  const currentSocietyDetailId =
    (pageData.societyDetails as unknown as { societyDetailId?: number })?.societyDetailId ??
    rawData?.societyId ??
    (searchSocietyId ? Number(searchSocietyId) : undefined) ??
    undefined;

  if (currentSocietyDetailId && currentSocietyDetailId > 0) {
    const hasSocietyInPhotos = pageData.initialPhotos?.some(
      (p) =>
        p.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
        p.photoTypeName?.toLowerCase().includes('society')
    );
    if (!hasSocietyInPhotos) {
      try {
        const [socPhotosRes, socSlotsRes] = await Promise.all([
          getPhotosBySocietyAction(currentSocietyDetailId),
          getSocietyPhotoTypesWithStatusAction(currentSocietyDetailId),
        ]);
        if (socPhotosRes?.success && Array.isArray(socPhotosRes.data)) {
          const mappedSocPhotos: PropertyPhotoDto[] = socPhotosRes.data.map((sp) => ({
            propertyPhotoId: Number(sp.societyPhotoId || 0),
            propertyId: resolvedPropertyId || 0,
            photoTypeId: Number(sp.photoTypeId || 0),
            photoTypeCode: String(sp.photoTypeCode || ''),
            photoTypeName: String(sp.photoTypeName || ''),
            displayOrder: Number(sp.displayOrder || 0),
            remarks: sp.remarks ? String(sp.remarks) : undefined,
            documentBindingId: sp.documentBindingId ? Number(sp.documentBindingId) : undefined,
            documentGuid: sp.documentGuid ? String(sp.documentGuid) : undefined,
            fileName: sp.fileName ? String(sp.fileName) : undefined,
            mimeType: sp.mimeType ? String(sp.mimeType) : undefined,
            viewUrl: sp.viewUrl ? String(sp.viewUrl) : undefined,
            downloadUrl: sp.downloadUrl ? String(sp.downloadUrl) : undefined,
            societyDetailId: currentSocietyDetailId,
          }));
          pageData.initialPhotos = [...(pageData.initialPhotos || []), ...mappedSocPhotos];
        }
        if (socSlotsRes?.success && Array.isArray(socSlotsRes.data)) {
          const mappedSocSlots: PropertyPhotoTypeWithStatusDto[] = socSlotsRes.data.map((ss: SocietyPhotoTypeWithStatusDto) => ({
            photoTypeId: Number(ss.photoTypeId),
            photoTypeCode: String(ss.photoTypeCode || ''),
            photoTypeName: String(ss.photoTypeName || ''),
            displayOrder: Number(ss.displayOrder || 0),
            hasPhoto: Boolean(ss.hasPhoto),
            photoCount: Number(ss.photoCount || 0),
            propertyPhotoId: Number(ss.societyPhotoId || 0),
            remarks: ss.remarks ? String(ss.remarks) : undefined,
            documentGuid: ss.documentGuid ? String(ss.documentGuid) : undefined,
            fileName: ss.fileName ? String(ss.fileName) : undefined,
            mimeType: ss.mimeType ? String(ss.mimeType) : undefined,
            viewUrl: ss.viewUrl ? String(ss.viewUrl) : undefined,
          }));
          const existingSlots = [...(pageData.initialPhotoSlots || [])];
          mappedSocSlots.forEach((ss) => {
            const existingIdx = existingSlots.findIndex(
              (s) =>
                (s.photoTypeCode && ss.photoTypeCode && s.photoTypeCode.toUpperCase() === ss.photoTypeCode.toUpperCase()) ||
                (s.photoTypeId === ss.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('SOCIETY_'))
            );
            if (existingIdx !== -1) {
              existingSlots[existingIdx] = { ...existingSlots[existingIdx], ...ss };
            } else {
              existingSlots.push(ss as PropertyPhotoTypeWithStatusDto);
            }
          });
          pageData.initialPhotoSlots = existingSlots;
        }
      } catch {
        // Non-blocking fetch fallback
      }
    }
  }

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

  if (pageData.latitude === undefined || pageData.longitude === undefined) {
    const aptCoords = extractCoordinates([
      { latitude: pageData.latitude, longitude: pageData.longitude },
      pageData.propertyDetailsResult?.propertyDetails as unknown as Record<string, unknown>,
      ...(rawData?.wings || []).map((w) => w as unknown as Record<string, unknown>),
      rawData as unknown as Record<string, unknown>,
      initialPropertyMasterData as unknown as Record<string, unknown>,
      pageData.societyDetails as unknown as Record<string, unknown>,
      { latitude: pageData.societyLatitude, longitude: pageData.societyLongitude },
    ]);
    if (aptCoords.hasCoords) {
      pageData.latitude = aptCoords.latitude;
      pageData.longitude = aptCoords.longitude;
    }
  }

  if (!pageData.waybackReleases || pageData.waybackReleases.length === 0) {
    pageData.waybackReleases = DEFAULT_WAYBACK_RELEASES;
  }

  const currentCategoryId = pageData.propertyDetailsResult?.propertyDetails?.categoryId ?? initialPropertyMasterData?.categoryId ?? undefined;
  const currentCategoryName = pageData.tabHeaderInfo?.category ?? initialPropertyMasterData?.category ?? '';
  const isIndividual = currentCategoryId === 2 || String(currentCategoryName).toLowerCase().includes('individual');
  const isApartment = currentCategoryId === 1 || currentCategoryId === 0 || String(currentCategoryName).toLowerCase().includes('apartment') || (!isIndividual && (Boolean(rawData?.societyId) || Boolean(rawData?.wings && rawData.wings.length > 0) || Boolean(pageData.societyDetails?.societyDetailId)));
  const isMainProp = isApartment && (!partitionNo || partitionNo === '0' || partitionNo.trim() === '' || partitionNo.trim() === '-');
  const currentPropertyTypeId = (pageData.propertyDetailsResult?.propertyDetails as unknown as { propertyTypeId?: number })?.propertyTypeId ?? initialPropertyMasterData?.propertyTypeId ?? undefined;
  const currentType = pageData.tabHeaderInfo?.type ?? (pageData.propertyDetailsResult?.propertyDetails as unknown as { type?: string })?.type ?? (initialPropertyMasterData as unknown as { type?: string })?.type ?? null;

  const isApartmentSocietyProperty = isMainProp || currentCategoryId === 0 || String(currentCategoryName).toLowerCase() === 'apartment society property';

  const [certGridRes, masterTypesRes] = await Promise.all([
    (currentSocietyDetailId || (finalWardId && propertyNo) || resolvedPropertyId)
      ? fetchApartmentQcCertificateGrid({
          societyId: currentSocietyDetailId,
          // Only pass wingDetailsId when no societyId (matches client-side behavior)
          wingDetailsId: currentSocietyDetailId ? undefined : undefined,
          ward: finalWardId || undefined,
          propertyNo: propertyNo || undefined,
          // Do NOT pass propertyId when societyId is available — society-level certificates
          // have PropertyId=NULL in the DB, so filtering by propertyId would exclude them.
          propertyId: currentSocietyDetailId ? undefined : (resolvedPropertyId || undefined),
        }).catch(() => null)
      : Promise.resolve(null),
    getCertificateTypeMaster().catch(() => null),
  ]);

  const initialCertificateGrid = (certGridRes?.success && certGridRes.data) ? certGridRes.data : null;
  const initialMasterTypes = (masterTypesRes?.success && Array.isArray(masterTypesRes.data)) ? masterTypesRes.data : null;

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
    societyLatitude: pageData.societyLatitude,
    societyLongitude: pageData.societyLongitude,
    initialCertificateGrid,
    initialMasterTypes,
  };
}
