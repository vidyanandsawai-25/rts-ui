// Server Component — fetches dropdown data only when requested via URL params
import { getFloorPaged } from "@/lib/api/floor.service";
import { getConstructionPaged } from "@/lib/api/constructiontypemaster/construction-crud.service";
import { getUseTypesPagedServer, getSubTypesPagedServer } from "@/lib/api/typeofusemaster.service";
import { getApartmentQCDetailsSafe } from "@/lib/api/ptis/appartmentQC/appartmentQC.service";
import type { Floor } from "@/types/floor.types";
import type { ConstructionType } from "@/types/construction.types";
import type { UseType, UseSubType } from "@/types/typeOfUse.types";
import CommercialEditScreen from "@/components/modules/property-tax/ptis/appartmentQC/PropertyDetailsEditScreen";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ 
    pdnNo?: string;
    wardId?: string;
    subTab?: string;
    loadFloors?: string; 
    loadConTypes?: string; 
    loadUseTypes?: string; 
    loadSubTypes?: string; 
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

export default async function Page({ params, searchParams }: PageProps) {
  await params; // Required to await params in Next.js App Router
  const { pdnNo, subTab, loadFloors, loadConTypes, loadUseTypes, loadSubTypes } = await searchParams;

  // Fetch property data using propertyDetailsId from URL
  let propertyData = null;
  
  if (pdnNo) {
    // Fetch property details only - Floor QC data is now fetched client-side via API
    const propertyDetails = await getApartmentQCDetailsSafe({
      propertyDetailsId: pdnNo,
    });
    
    // Get the first item from the results
    propertyData = propertyDetails.length > 0 ? propertyDetails[0] : null;
  }

  // Fetch dropdown data only when requested via URL params (on-click loading)
  const [floors, constructionTypes, useTypes, allSubTypes] = await Promise.all([
    loadFloors === "true" ? fetchAllFloors() : Promise.resolve([]),
    loadConTypes === "true" ? fetchAllConstructionTypes() : Promise.resolve([]),
    loadUseTypes === "true" ? fetchAllUseTypes() : Promise.resolve([]),
    loadSubTypes === "true" ? fetchAllSubTypes() : Promise.resolve([]),
  ]);

  return (
    <CommercialEditScreen
      open={true}
      propertyData={propertyData}
      subTab={subTab || 'rateable'}
      returnTo="commercial"
      floors={floors}
      constructionTypes={constructionTypes}
      useTypes={useTypes}
      allSubTypes={allSubTypes}
    />
  );
}