import CombinePropertyForm from "@/components/modules/property-tax/ptis/combineproperty/CombinePropertyForm";
import { fetchCombinePropertiesPagedAction } from "./action";
import { fetchPropertyTypePagedServerAction } from "../../propertytype/action";
import { CombinePropertyItem } from "@/types/combine-property.types";
import { PropertyType } from "@/types/property-type.types";

/** Use pageSize = -1 to fetch all records (supported by the action) */
const ALL_RECORDS_PAGE_SIZE = -1;

interface PageProps {
  searchParams: Promise<{
    basePropertyId?: string;
    wardId?: string;
    wardNo?: string;
    propertyNo?: string;
    basePartitionNo?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { basePropertyId, wardId, wardNo, propertyNo, basePartitionNo } = params;

  // ── 1. Fetch base property list (filtered by ward if available) ─────────
  const baseResult = await fetchCombinePropertiesPagedAction({
    pageNumber: 1,
    pageSize: ALL_RECORDS_PAGE_SIZE,
    ...(wardId ? { wardId: Number(wardId) } : {}),
  });
  const basePropertyList: CombinePropertyItem[] = baseResult.items ?? [];

  // ── 2. If a base property is selected, fetch its sub-properties ───────────
  let subPropertyList: CombinePropertyItem[] = [];
  if (basePropertyId && propertyNo && wardId) {
    let partitionChar = basePartitionNo;
    if (!partitionChar) {
      const selected = basePropertyList.find((item) => String(item.id) === basePropertyId);
      if (selected && selected.fromProperty) {
        partitionChar = selected.fromProperty.replace(/[^A-Za-z]/g, '');
      }
    }

    const subResult = await fetchCombinePropertiesPagedAction({
      pageNumber: 1,
      pageSize: ALL_RECORDS_PAGE_SIZE,
      wardId: Number(wardId),
      propertyNo: propertyNo,
      ...(partitionChar ? { partitionNo: partitionChar } : {}),
    });
    subPropertyList = subResult.items ?? [];
  }

  // ── 3. Fetch property types for the dropdown ─────────
  const propertyTypeResult = await fetchPropertyTypePagedServerAction(1, ALL_RECORDS_PAGE_SIZE);
  const propertyTypeList: PropertyType[] = propertyTypeResult.items ?? [];

  return (
    <CombinePropertyForm
      basePropertyList={basePropertyList}
      subPropertyList={subPropertyList}
      propertyTypeList={propertyTypeList}
      selectedBasePropertyId={basePropertyId}
      selectedWardId={wardId}
      selectedWardNo={wardNo}
      selectedPropertyNo={propertyNo}
    />
  );
}