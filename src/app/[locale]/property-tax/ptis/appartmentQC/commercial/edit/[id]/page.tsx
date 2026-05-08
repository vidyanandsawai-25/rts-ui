// Server Component — fetches dropdown data only when requested via URL params
import { getFloorPaged } from "@/lib/api/floor.service";

import { getUseTypesPagedServer, getSubTypesPagedServer } from "@/lib/api/typeofusemaster.service";
import type { Floor } from "@/types/floor.types";
import type { ConstructionType } from "@/types/construction.types";
import type { UseType, UseSubType } from "@/types/typeOfUse.types";
import CommercialEditScreen from "@/components/modules/property-tax/ptis/appartmentQC/PropertyDetailsEditScreen";
import { getConstructionPaged } from "@/lib/api/construction-crud.service";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ 
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
  const pageSize = -1;
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
  const pageSize = -1;
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
  const pageSize = -1;
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
  const { id } = await params;
  const { loadFloors, loadConTypes, loadUseTypes, loadSubTypes } = await searchParams;

  // Fetch dropdown data only when requested via URL params (on-click loading)
  const [floors, constructionTypes, useTypes, allSubTypes] = await Promise.all([
    loadFloors === "true" ? fetchAllFloors() : Promise.resolve([]),
    loadConTypes === "true" ? fetchAllConstructionTypes() : Promise.resolve([]),
    loadUseTypes === "true" ? fetchAllUseTypes() : Promise.resolve([]),
    loadSubTypes === "true" ? fetchAllSubTypes() : Promise.resolve([]),
  ]);

  // TODO: Replace mock data below with an actual property API call using `id`
  const propertyData = {
    propertyNo: id,
    ward: "13",
    buildingNo: "N/A",
    society: "N/A",
    oldPropertyNo: `OLD-${id}`,
    wingName: "A",
    flatNo: "101",
    ownerName: "Rajesh Sharma",
    occupierName: "Rajesh Sharma",
    rent: "15000",
    renterName: "-",
    description: "Commercial Unit",
    type: "Commercial",
    floor: "1",
    asstYear: "2023",
    conYear: "2015",
    conType: "RCC",
    bhk: "2",
    toiletCount: "2",
    carpetArea: "750",
    buildupArea: "950",
    oldConstructionArea: "700",
    oldRV: "25000",
    newRV: "28000",
    oldTax: "2500",
    newTax: "2800",
    mobileNo: "9876543210",
    email: "rajesh@example.com",
    ocDate: "2015-03-15",
  };

  return (
    <CommercialEditScreen
      open={true}
      propertyData={propertyData}
      returnTo="commercial"
      floors={floors}
      constructionTypes={constructionTypes}
      useTypes={useTypes}
      allSubTypes={allSubTypes}
    />
  );
}