import TaxZoningPage from "@/components/modules/property-tax/taxzoningmaster/TaxZoningPage";

import { fetchTaxZonePagedAction, fetchWardPagedAction, getTaxZonningByWardAction, getTaxZonningPropertyNoPagedAction } from "./tax-zone.actions";

// Force dynamic rendering - this page requires runtime API data
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    wardNo?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const wardNo = params.wardNo || "1"; // Default to wardNo "1" if not provided

  const pageNumber = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  // ✅ CALL ACTION (not server service)
  const result = await getTaxZonningPropertyNoPagedAction(
    pageNumber,
    pageSize
  );
  const propertiesOptions = await getTaxZonningByWardAction(wardNo, 1, -1);
  console.log("Properties Options:", propertiesOptions); // Debug log for properties options

  // Await all server data
  const [taxZonesResult, wardsDataResult] = await Promise.all([
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
      wardProperties={propertiesOptions}
    />
  );
}
