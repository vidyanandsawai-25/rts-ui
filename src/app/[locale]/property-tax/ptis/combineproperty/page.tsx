import CombinePropertyForm from "@/components/modules/property-tax/ptis/combineproperty/CombinePropertyForm";
import { fetchCombinePropertiesPagedAction, fetchCombinePropertiesHistoryAction } from "./action";
import { fetchPropertyTypePagedServerAction } from "../../propertytype/action";
import { CombinePropertyItem } from "@/types/combine-property.types";
import { PropertyType } from "@/types/property-type.types";
import { PropertyCombineDetails } from "@/types/combine-property.types";

/** Use pageSize = -1 to fetch all records (supported by the action) */
const ALL_RECORDS_PAGE_SIZE = -1;

interface PageProps {
  searchParams: Promise<{
    basePropertyId?: string;
    wardId?: string;
    wardNo?: string;
    propertyNo?: string;
    basePartitionNo?: string;
    categoryId?: string;
    societyDetailId?: string;
    showHistory?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { basePropertyId, wardId, wardNo, propertyNo, basePartitionNo, categoryId, societyDetailId, showHistory } = params;

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
    let effectiveCategoryId: number | undefined = categoryId ? Number(categoryId) : undefined;
    let effectiveSocietyDetailId: number | undefined = societyDetailId ? Number(societyDetailId) : undefined;

    const selected = basePropertyList.find((item) => String(item.id) === basePropertyId);
    if (selected) {
      if (!partitionChar && selected.fromProperty) {
        partitionChar = selected.fromProperty.replace(/[^A-Za-z]/g, '');
      }
      if (!effectiveCategoryId && selected.categoryId) {
        effectiveCategoryId = selected.categoryId;
      }
      if (!effectiveSocietyDetailId && selected.societyDetailId) {
        effectiveSocietyDetailId = selected.societyDetailId;
      }
    }

    const subResult = await fetchCombinePropertiesPagedAction({
      pageNumber: 1,
      pageSize: ALL_RECORDS_PAGE_SIZE,
      wardId: Number(wardId),
      propertyNo: propertyNo,
      ...(partitionChar ? { partitionNo: partitionChar } : {}),
      ...(effectiveCategoryId ? { categoryId: effectiveCategoryId } : {}),
      ...(effectiveSocietyDetailId ? { societyDetailId: effectiveSocietyDetailId } : {}),
    });
    subPropertyList = subResult.items ?? [];
  }

  // ── 3. Fetch property types for the dropdown ─────────
  const propertyTypeResult = await fetchPropertyTypePagedServerAction(1, ALL_RECORDS_PAGE_SIZE);
  const propertyTypeList: PropertyType[] = propertyTypeResult.items ?? [];

  // ── 4. Fetch history data if requested ─────────
  let historyData: PropertyCombineDetails[] = [];
  if (showHistory === 'true') {
    historyData = await fetchCombinePropertiesHistoryAction({});
  }

  return (
    <CombinePropertyForm
      basePropertyList={basePropertyList}
      subPropertyList={subPropertyList}
      propertyTypeList={propertyTypeList}
      selectedBasePropertyId={basePropertyId}
      selectedWardId={wardId}
      selectedWardNo={wardNo}
      selectedPropertyNo={propertyNo}
      showHistory={showHistory === 'true'}
      historyData={historyData}
    />
  );
}