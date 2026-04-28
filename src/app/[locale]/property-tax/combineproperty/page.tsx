import CombinePropertyForm from "@/components/modules/property-tax/combineproperty/CombinePropertForm";
import { fetchCombinePropertiesPagedAction } from "./action";
import { CombinePropertyItem } from "@/types/combine-property.types";

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
    pageSize: -1,
  });
  const basePropertyList: CombinePropertyItem[] = baseResult.items ?? [];

  // ── 2. If a base property is selected, fetch its sub-properties ───────────
  let subPropertyList: CombinePropertyItem[] = [];
  if (propertyNo && wardId) {
    const subResult = await fetchCombinePropertiesPagedAction({
      pageNumber: 1,
      pageSize: -1,
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