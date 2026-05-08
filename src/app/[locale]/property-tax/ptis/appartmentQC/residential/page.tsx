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
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  
  // Support both PascalCase and camelCase for better resilience
  const wardId = params.WardId || params.wardId || "89";
  const propertyNo = params.PropertyNo ||params.propertyNo || "20";
  
  const pageNumber = Number(params.pageNumber) || Number((params as any).page) || 1;
  const pageSize = Number(params.pageSize) || Number((params as any).limit) || 10;
  const searchTerm = params.searchTerm || (params as any).q || "";

  const result = await fetchApartmentQCDetailsPagedAction({
    partType: "R",
    wardId,
    propertyNo,
    pageNumber,
    pageSize,
    searchTerm,
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
      error={result.success ? undefined : (result as any).error}
    />
  );
};


export default Page;
