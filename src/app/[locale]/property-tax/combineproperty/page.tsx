import CombinePropertyForm from "@/components/modules/property-tax/combineproperty/CombinePropertyForm";
import { fetchCombinePropertiesPagedAction } from "./action";
import { CombinePropertyItem } from "@/types/combine-property.types";

/** Page size constants */
const BASE_LIST_PAGE_SIZE = 1000;
const SUB_LIST_PAGE_SIZE = 100;

interface PageProps {
  searchParams: Promise<{
    basePropertyId?: string;
    wardId?: string;
    propertyNo?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { basePropertyId, wardId, propertyNo } = params;

  // ── 1. Fetch base property list (all properties) ─────────────────────────
  const baseResult = await fetchCombinePropertiesPagedAction({
    pageNumber: 1,
    pageSize: BASE_LIST_PAGE_SIZE,
  });
  const basePropertyList: CombinePropertyItem[] = baseResult.items ?? [];

  // ── 2. If a base property is selected, fetch its sub-properties ───────────
  let subPropertyList: CombinePropertyItem[] = [];
  if (propertyNo && wardId) {
    const subResult = await fetchCombinePropertiesPagedAction({
      pageNumber: 1,
      pageSize: SUB_LIST_PAGE_SIZE,
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
      selectedPropertyNo={propertyNo}
    />
  );
}