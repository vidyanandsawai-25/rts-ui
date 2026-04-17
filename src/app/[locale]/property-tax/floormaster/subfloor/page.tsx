
import { getSubFloorPaged } from "@/lib/api/floor.services";
import type { SubFloorPagedResponse } from "@/types/floor.types";
import SubFloorPage from "@/components/modules/property-tax/Floormaster/subfloor/SubFloorMaster";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
  }>;
}

export default async function Page({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const pageNumber = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const searchQuery = params?.q || "";

  const result: SubFloorPagedResponse =
    await getSubFloorPaged(
      pageNumber,
      pageSize,
      searchQuery
    );

  return (
    <SubFloorPage subFloorPaged={result} />
  );
}
