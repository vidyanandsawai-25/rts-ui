
import { TaxZoneMaster } from "@/components/modules/property-tax/taxzonemaster";
import { getTaxZonePagedServer } from "@/lib/api/taxzone.services";


export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const pageNumber = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const search = params.search ?? "";

  const result = await getTaxZonePagedServer(pageNumber, pageSize, search);

  return (
    
        <TaxZoneMaster
          data={result.items}
          pageNumber={result.pageNumber}
          pageSize={result.pageSize}
          totalCount={result.totalCount}
          totalPages={result.totalPages}
        />
     
  );
}



