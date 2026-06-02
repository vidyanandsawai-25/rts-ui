import { ApartmentQCDetail } from "@/types/apartmentQC.types";
import Commercial from "@/components/modules/property-tax/ptis/appartmentQC/Commercial";
import { fetchApartmentQCDetailsPagedAction } from "../action";

interface PageProps {
  searchParams: Promise<{
    WardId?: number;
    wardId?: number;
    PropertyNo?: string;
    propertyNo?: string;
    pageNumber?: string;
    page?: string;
    pageSize?: string;
    limit?: string;
    searchTerm?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
    filterWing?: string;
    filterFlatOrShopNo?: string;
    filterApartmentType?: string;
    filterPropertyType?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  // Support both PascalCase and camelCase for better resilience
  const wardId = params.WardId || params.wardId;
  const propertyNo = params.PropertyNo || params.propertyNo;

  const pageNumber = Number(params.pageNumber) || Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || Number(params.limit) || 10;
  const searchTerm = params.searchTerm || params.q || "";
  const sortBy = params.sortBy || "";
  const sortOrder = params.sortOrder || "";

  // If required params are missing, return empty state
  if (!wardId || !propertyNo) {
    return (
      <Commercial
        initialData={[]}
        initialTotalCount={0}
        initialPageNumber={1}
        initialPageSize={10}
        initialTotalPages={0}
        initialSearchTerm=""
        wardId=""
        propertyNo=""
        error="Ward ID and Property Number are required"
      />
    );
  }

  const result = await fetchApartmentQCDetailsPagedAction({
    partType: "C",
    wardId,
    propertyNo,
    pageNumber,
    pageSize,
    searchTerm,
    sortBy,
    sortOrder,
  });

  const data: ApartmentQCDetail[] = result.success ? (result.data?.items ?? []) : [];
  const totalCount = result.success ? (result.data?.totalCount ?? 0) : 0;
  const totalPages = result.success ? (result.data?.totalPages ?? 1) : 1;

  return (
    <Commercial
      initialData={data}
      initialTotalCount={totalCount}
      initialPageNumber={pageNumber}
      initialPageSize={pageSize}
      initialTotalPages={totalPages}
      initialSearchTerm={searchTerm}
      wardId={wardId}
      propertyNo={propertyNo}
      error={result.success ? undefined : result.error}
    />
  );
};

export default Page;