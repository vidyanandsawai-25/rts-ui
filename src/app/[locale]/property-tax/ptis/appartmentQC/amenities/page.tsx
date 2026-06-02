import { ApartmentQCDetail } from "@/types/apartmentQC.types";
import { fetchApartmentQCDetailsPagedAction } from "../action";
import Amenities from "@/components/modules/property-tax/ptis/appartmentQC/Amenities";

interface PageProps {
  searchParams: Promise<{
    WardId?: string;
    wardId?: string;
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
  const wardId = params.WardId || params.wardId || "";
  const propertyNo = params.PropertyNo || params.propertyNo || "";

  const pageNumber = Number(params.pageNumber) || Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || Number(params.limit) || 10;
  const searchTerm = params.searchTerm || params.q || "";
  const sortBy = params.sortBy || "";
  const sortOrder = params.sortOrder || "";

  // If required params are missing, return empty state (server-side guard)
  if (!wardId || !propertyNo) {
    return (
      <Amenities
        initialData={[]}
        initialTotalCount={0}
        initialPageNumber={1}
        initialPageSize={10}
        initialTotalPages={0}
        initialSearchTerm=""
        wardId=""
        propertyNo=""
      />
    );
  }

  const result = await fetchApartmentQCDetailsPagedAction({
    partType: "Aminity",
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
    <Amenities
      initialData={data}
      initialPageNumber={pageNumber}
      initialPageSize={pageSize}
      initialTotalCount={totalCount}
      initialTotalPages={totalPages}
      initialSearchTerm={searchTerm}
      wardId={wardId}
      propertyNo={propertyNo}
      error={result.success ? undefined : result.error}
    />
  );
};

export default Page;