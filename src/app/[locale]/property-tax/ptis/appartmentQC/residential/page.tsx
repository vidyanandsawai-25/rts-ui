import { ApartmentQCDetail } from "@/types/apartmentQC.types";
import Residential from "@/components/modules/property-tax/ptis/appartmentQC/Residential";
import { fetchApartmentQCDetailsPagedAction } from "../action";

interface PageProps {
  searchParams: Promise<{
    WardId?: number;
    wardId?: number;
    PropertyNo?: string;
    propertyNo?: string;
    pageNumber?: string;
    pageSize?: string;
    searchTerm?: string;
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
  
  const pageNumber = Number(params.pageNumber) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const searchTerm = params.searchTerm || "";
  const sortBy = params.sortBy || "";
  const sortOrder = params.sortOrder || "";

  // If required params are missing, return empty state
  if (!wardId || !propertyNo) {
    return (
      <Residential
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
    partType: "R",
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
    <Residential
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
