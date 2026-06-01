// Server Component — fetches ALL data server-side for SSR
import { getTranslations } from 'next-intl/server';
import { getFloorPaged } from "@/lib/api/floor.service";
import { getConstructionPaged } from "@/lib/api/constructiontypemaster/construction-crud.service";
import { getUseTypesPagedServer, getSubTypesPagedServer } from "@/lib/api/typeofusemaster.service";
import { 
  getApartmentQCDetailsSafe,
  getFloorQCByPropertyIdSafe
} from "@/lib/api/appartmentQC.service";
import {
  fetchRoomTypesAction,
  fetchAllPropertyTypesAction,
} from "@/app/[locale]/property-tax/ptis/appartmentQC/action";
import type { Floor } from "@/types/floor.types";
import type { ConstructionType } from "@/types/construction.types";
import type { UseType, UseSubType } from "@/types/typeOfUse.types";
import type { PropertyEditFormCopy } from "@/types/propertyEdit.types";
import PropertyDetailsEditForm from "@/components/modules/property-tax/ptis/appartmentQC/PropertyDetailsEditForm";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ 
    subTab?: string;
  }>;
}

/** Fetches ALL floors across all pages */
async function fetchAllFloors(): Promise<Floor[]> {
  const pageSize = 1000;
  let page = 1;
  let all: Floor[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getFloorPaged(page, pageSize);
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

/** Fetches ALL construction types across all pages */
async function fetchAllConstructionTypes(): Promise<ConstructionType[]> {
  const pageSize = 1000;
  let page = 1;
  let all: ConstructionType[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getConstructionPaged(page, pageSize);
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

/** Fetches ALL use types across all pages */
async function fetchAllUseTypes(): Promise<UseType[]> {
  const pageSize = 5000;
  let page = 1;
  let all: UseType[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getUseTypesPagedServer({ pageNumber: page, pageSize });
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

/** Fetches ALL sub-types across all pages (client will filter by selected typeOfUseId) */
async function fetchAllSubTypes(): Promise<UseSubType[]> {
  const pageSize = 5000;
  let page = 1;
  let all: UseSubType[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getSubTypesPagedServer({ pageNumber: page, pageSize });
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

/** Fetches ALL property types */
async function fetchAllPropertyTypes() {
  const result = await fetchAllPropertyTypesAction();
  if (result.success && result.data) {
    // Convert { value, label } to { id, propertyDescription }
    return result.data.map(item => ({
      id: parseInt(item.value, 10),
      code: item.value,
      propertyDescription: item.label
    }));
  }
  return [];
}

/** Fetches ALL room types */
async function fetchAllRoomTypes() {
  const result = await fetchRoomTypesAction();
  if (result.success && result.data) {
    return result.data;
  }
  return [];
}

export default async function Page({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const propertyId = resolvedParams.id;
  const locale = resolvedParams.locale;
  const { subTab } = await searchParams;

  // Redirect if no property ID
  if (!propertyId) {
    redirect('/property-tax/ptis/appartmentQC/residential');
  }

  // Load translations
  const t = await getTranslations({ locale, namespace: 'apartmentQc' });

  // Build copy object for client component
  const copy: PropertyEditFormCopy = {
    pageTitle: t('pageTitle'),
    badges: {
      ward: t('badges.ward'),
      zone: t('badges.zone'),
      prop: t('badges.prop'),
      type: t('badges.type'),
    },
    buttons: {
      back: t('buttons.back'),
      save: t('buttons.save'),
      saving: t('buttons.saving'),
    },
    messages: {
      propertyIdMissing: t('messages.propertyIdMissing'),
      validationErrors: t('messages.validationErrors'),
      floorQCValidationError: t('messages.floorQCValidationError'),
      basicDetailsUpdateFailed: t('messages.basicDetailsUpdateFailed'),
      floorQCUpdateFailed: t('messages.floorQCUpdateFailed'),
      allChangesSaved: t('messages.allChangesSaved'),
      basicDetailsUpdated: t('messages.basicDetailsUpdated'),
      roomDataUpdated: t('messages.roomDataUpdated'),
      failedToLoadRooms: t('messages.failedToLoadRooms'),
      cannotOpenRoomSubmission: t('messages.cannotOpenRoomSubmission'),
    },
    basicInfo: {
      title: t('basicInfo.title'),
      fields: {
        ownerName: { label: t('basicInfo.fields.ownerName.label'), placeholder: t('basicInfo.fields.ownerName.placeholder') },
        occupierName: { label: t('basicInfo.fields.occupierName.label'), placeholder: t('basicInfo.fields.occupierName.placeholder') },
        renterName: { label: t('basicInfo.fields.renterName.label'), placeholder: t('basicInfo.fields.renterName.placeholder') },
        propertyDescription: { label: t('basicInfo.fields.propertyDescription.label'), placeholder: t('basicInfo.fields.propertyDescription.placeholder') },
        bhk: { label: t('basicInfo.fields.bhk.label'), placeholder: t('basicInfo.fields.bhk.placeholder') },
        mobileNo: { label: t('basicInfo.fields.mobileNo.label'), placeholder: t('basicInfo.fields.mobileNo.placeholder') },
        emailId: { label: t('basicInfo.fields.emailId.label'), placeholder: t('basicInfo.fields.emailId.placeholder') },
        flatOrShopName: { label: t('basicInfo.fields.flatOrShopName.label'), placeholder: t('basicInfo.fields.flatOrShopName.placeholder') },
        wingName: { label: t('basicInfo.fields.wingName.label'), placeholder: t('basicInfo.fields.wingName.placeholder') },
        flatOrShopNo: { label: t('basicInfo.fields.flatOrShopNo.label'), placeholder: t('basicInfo.fields.flatOrShopNo.placeholder') },
        oldPropertyNo: { label: t('basicInfo.fields.oldPropertyNo.label'), placeholder: t('basicInfo.fields.oldPropertyNo.placeholder') },
        remark: { label: t('basicInfo.fields.remark.label') },
        oldRV: { label: t('basicInfo.fields.oldRV.label') },
        newRV: { label: t('basicInfo.fields.newRV.label') },
        oldTax: { label: t('basicInfo.fields.oldTax.label') },
        newTax: { label: t('basicInfo.fields.newTax.label') },
        oldArea: { label: t('basicInfo.fields.oldArea.label') },
        newArea: { label: t('basicInfo.fields.newArea.label') },
        oldUseType: { label: t('basicInfo.fields.oldUseType.label') },
        oldConstructionType: { label: t('basicInfo.fields.oldConstructionType.label') },
        oldCSN: { label: t('basicInfo.fields.oldCSN.label') },
        oldConstructionYear: { label: t('basicInfo.fields.oldConstructionYear.label') },
      },
      validation: {
        ownerNameRequired: t('basicInfo.validation.ownerNameRequired'),
        occupierNameRequired: t('basicInfo.validation.occupierNameRequired'),
        invalidNameFormat: t('basicInfo.validation.invalidNameFormat'),
        invalidMobile: t('basicInfo.validation.invalidMobile'),
        invalidEmail: t('basicInfo.validation.invalidEmail'),
        flatOrShopNoRequired: t('basicInfo.validation.flatOrShopNoRequired'),
        invalidWingFormat: t('basicInfo.validation.invalidWingFormat'),
        invalidPropertyNoFormat: t('basicInfo.validation.invalidPropertyNoFormat'),
      },
    },
    floorQC: {
      title: t('floorQC.title'),
      columns: {
        floor: t('floorQC.columns.floor'),
        conYear: t('floorQC.columns.conYear'),
        asstYear: t('floorQC.columns.asstYear'),
        conType: t('floorQC.columns.conType'),
        use: t('floorQC.columns.use'),
        subTypeOfUse: t('floorQC.columns.subTypeOfUse'),
        noOfRooms: t('floorQC.columns.noOfRooms'),
        area: t('floorQC.columns.area'),
        rentMY: t('floorQC.columns.rentMY'),
        rateMY: t('floorQC.columns.rateMY'),
        rentalValue: t('floorQC.columns.rentalValue'),
        depreciation: t('floorQC.columns.depreciation'),
        alv: t('floorQC.columns.alv'),
        mr: t('floorQC.columns.mr'),
        rv: t('floorQC.columns.rv'),
        sdrr: t('floorQC.columns.sdrr'),
        baseValue: t('floorQC.columns.baseValue'),
        floorFactor: t('floorQC.columns.floorFactor'),
        ageFactor: t('floorQC.columns.ageFactor'),
        ntbFactor: t('floorQC.columns.ntbFactor'),
        useFactor: t('floorQC.columns.useFactor'),
        capitalValue: t('floorQC.columns.capitalValue'),
      },
      tabs: {
        rateable: t('floorQC.tabs.rateable'),
        capital: t('floorQC.tabs.capital'),
      },
      validation: {
        invalidYear: t('floorQC.validation.invalidYear'),
        yearOutOfRange: t('floorQC.validation.yearOutOfRange'),
      },
      tooltips: {
        viewRoomDetails: t('floorQC.tooltips.viewRoomDetails'),
        noDetailId: t('floorQC.tooltips.noDetailId'),
      },
    },
  };

  let propertyData;
  let floorQCData;
  let floors;
  let constructionTypes;
  let useTypes;
  let allSubTypes;
  let propertyTypes;
  let roomTypes;

  try {
    // Fetch ALL data server-side in parallel for SSR
    const results = await Promise.all([
      // Fetch property details
      getApartmentQCDetailsSafe({ propertyId }),
      // Fetch Floor QC data
      getFloorQCByPropertyIdSafe(propertyId, subTab || 'rateable'),
      // Fetch all master dropdown data
      fetchAllFloors(),
      fetchAllConstructionTypes(),
      fetchAllUseTypes(),
      fetchAllSubTypes(),
      fetchAllPropertyTypes(),
      fetchAllRoomTypes(),
    ]);

    [
      propertyData,
      floorQCData,
      floors,
      constructionTypes,
      useTypes,
      allSubTypes,
      propertyTypes,
      roomTypes
    ] = [
      results[0].length > 0 ? results[0][0] : null,
      results[1],
      results[2],
      results[3],
      results[4],
      results[5],
      results[6],
      results[7]
    ];

    // If no property data found, redirect to list
    if (!propertyData) {
      redirect('/property-tax/ptis/appartmentQC/residential');
    }
  } catch (error) {
    console.error('[SSR Edit Page] Error fetching data:', error);
    // Redirect to list on error
    redirect('/property-tax/ptis/appartmentQC/residential');
  }

  return (
    <PropertyDetailsEditForm
      propertyData={propertyData}
      floorQCData={floorQCData}
      floors={floors}
      constructionTypes={constructionTypes}
      useTypes={useTypes}
      allSubTypes={allSubTypes}
      propertyTypes={propertyTypes}
      roomTypes={roomTypes}
      subTab={subTab || 'rateable'}
      copy={copy}
    />
  );
}