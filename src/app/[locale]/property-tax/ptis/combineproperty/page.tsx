import CombinePropertyForm from "@/components/modules/property-tax/ptis/combineproperty/CombinePropertyForm";
import { fetchCombinePropertiesPagedAction } from "./action";
import { CombinePropertyItem } from "@/types/combine-property.types";

/** Use pageSize = -1 to fetch all records (supported by the action) */
const ALL_RECORDS_PAGE_SIZE = -1;

interface PageProps {
  searchParams: Promise<{
    basePropertyId?: string;
    wardId?: string;
    wardNo?: string;
    propertyNo?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { basePropertyId, wardId, wardNo, propertyNo } = params;

  // ── 1. Fetch base property list (filtered by ward if available) ─────────
  const baseResult = await fetchCombinePropertiesPagedAction({
    pageNumber: 1,
    pageSize: ALL_RECORDS_PAGE_SIZE,
    ...(wardId ? { wardId: Number(wardId) } : {}),
  });
  const basePropertyList: CombinePropertyItem[] = baseResult.items ?? [];

  // ── 2. If a base property is selected, fetch its sub-properties ───────────
  let subPropertyList: CombinePropertyItem[] = [];
  if (propertyNo && wardId) {
    const subResult = await fetchCombinePropertiesPagedAction({
      pageNumber: 1,
      pageSize: ALL_RECORDS_PAGE_SIZE,
      wardId: Number(wardId),
      propertyNo: propertyNo,
    });
    subPropertyList = subResult.items ?? [];
  }

  return (
    <CombinePropertyForm
      basePropertyList={basePropertyList}
      subPropertyList={subPropertyList}
      selectedBasePropertyId={basePropertyId}
      selectedWardId={wardId}
      selectedWardNo={wardNo}
      selectedPropertyNo={propertyNo}
    />
  );
}