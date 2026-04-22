import TaxZoningPage from "@/components/modules/property-tax/taxzoningmaster/TaxZoningPage";

import { fetchTaxZonePagedAction, fetchWardPagedAction, getAllTaxZonningAction, getTaxZonningPropertyNoPagedAction } from "./actions";

// Force dynamic rendering - this page requires runtime API data
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const pageNumber = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 5));

  // Run all independent server actions concurrently to avoid unnecessary TTFB.
  const [result, allPropertiesOptions, taxZonesResult, wardsDataResult] = await Promise.all([
    getTaxZonningPropertyNoPagedAction(pageNumber, pageSize),
    getAllTaxZonningAction(1, -1),
    fetchTaxZonePagedAction(1, -1),
    fetchWardPagedAction(1, -1)
  ]);

  const tableData = result.success && result.data ? result.data.items : [];
  const totalCount = result.success && result.data ? result.data.totalCount : 0;
  const totalPages = result.success && result.data ? result.data.totalPages : 1;

  return (
      <TaxZoningPage
        data={tableData}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        taxZones={taxZonesResult}
        wardsData={wardsDataResult}
        allProperties={allPropertiesOptions}
      />
  );
}
