import { Suspense } from "react";
import { fetchSubFloorPagedServerAction } from "@/app/[locale]/property-tax/floormaster/actions";
import type { SubFloorPagedResponse } from "@/types/floor.types";
import SubFloorMaster from "@/components/modules/property-tax/Floormaster/subfloor/SubFloorMaster";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function Page({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const pageNumber = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const searchQuery = params?.q || "";
  const sortBy = params?.sortBy;
  const sortOrder = params?.sortOrder;

  const result: SubFloorPagedResponse =
    await fetchSubFloorPagedServerAction(
      pageNumber,
      pageSize,
      searchQuery,
      sortBy,
      sortOrder
    );

  return (
    <Suspense fallback={null}>
      <SubFloorMaster 
        subFloorPaged={result} 
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </Suspense>
  );
}
