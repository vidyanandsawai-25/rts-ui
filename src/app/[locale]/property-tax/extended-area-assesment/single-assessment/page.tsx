import React from "react";
import { SingleAssessmentScreen } from "@/components/modules/property-tax/extended-area-assessment/SingleAssessmentScreen";
import { getFinancialYearsPaged } from "@/lib/api/financial-year.service";
import { getUseGroupsPagedServer } from "@/lib/api/typeofusegroup.service";
import {
  searchSection129PropertyByUpicAction,
  searchSection129PropertyByOldGpNoAction,
  getWardsDropdownAction,
  getApartmentQCSuggestionsAction,
  type Section129ActionResult,
  type WardDropdownOption,
  type ApartmentQcSearchSuggestionDto,
} from "./action";
import type { SelectOption } from "@/types/extended-area-assessment.types";

export const dynamic = "force-dynamic";

interface SingleAssessmentPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Section 129A single-property assessment — search a property by UPIC, then view/apply
 * its year-wise schedule via the real API (see `useSingleAssessment` / `action.ts`).
 *
 * Search input values (e.g. `?upic=...`, `?wardId=...`, `?propertyNo=...`, `?partitionNo=...`)
 * are passed via URL query parameters, driving Next.js server-side data fetching.
 */
export default async function Page({ searchParams }: SingleAssessmentPageProps): Promise<React.ReactElement> {
  const resolvedParams = await searchParams;

  const getParam = (key: string): string => {
    const val = resolvedParams?.[key];
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val)) return val[0]?.trim() ?? "";
    return "";
  };

  const upic = getParam("upic");
  const oldGpNo = getParam("oldGpNo");
  const wardId = getParam("wardId");
  const propertyNo = getParam("propertyNo");
  const partitionNo = getParam("partitionNo");

  const wardIdNum = Number(wardId);
  const searchTarget = upic || propertyNo;

  const [
    initialCurrentFinancialYear,
    usageTypeOptions,
    initialSearchResult,
    wardRes,
    initialPropertiesRes,
    initialPartitionsRes,
  ] = await Promise.all([
    getFinancialYearsPaged(1, -1)
      .then((res) => res.items?.find((y) => y.isActive) ?? null)
      .then((active) => (active ? (active.yearCode ?? `${active.year}-${String((active.year + 1) % 100).padStart(2, "0")}`) : null))
      .catch(() => null),
    getUseGroupsPagedServer({ pageNumber: 1, pageSize: -1 })
      .then((res) => (res.items ?? []).map((g): SelectOption => ({ label: g.groupName, value: g.groupName })))
      .catch(() => [] as SelectOption[]),
    searchTarget
      ? searchSection129PropertyByUpicAction(searchTarget)
      : oldGpNo
        ? searchSection129PropertyByOldGpNoAction(oldGpNo)
        : Promise.resolve<Section129ActionResult | null>(null),
    getWardsDropdownAction().catch(() => ({ success: false, data: [] as WardDropdownOption[] })),
    wardIdNum
      ? getApartmentQCSuggestionsAction(wardIdNum).catch(() => ({ success: false, data: [] as ApartmentQcSearchSuggestionDto[] }))
      : Promise.resolve({ success: false, data: [] as ApartmentQcSearchSuggestionDto[] }),
    wardIdNum && propertyNo
      ? getApartmentQCSuggestionsAction(wardIdNum, propertyNo).catch(() => ({ success: false, data: [] as ApartmentQcSearchSuggestionDto[] }))
      : Promise.resolve({ success: false, data: [] as ApartmentQcSearchSuggestionDto[] }),
  ]);

  const initialWards = wardRes?.success ? wardRes.data : [];
  const initialProperties = initialPropertiesRes?.success && initialPropertiesRes.data
    ? Array.from(
      new Set(
        initialPropertiesRes.data
          .map((item) => item.propertyNo?.trim())
          .filter((p): p is string => Boolean(p))
      )
    )
    : [];
  const initialPartitions = initialPartitionsRes?.success && initialPartitionsRes.data ? initialPartitionsRes.data : [];

  return (
    <SingleAssessmentScreen
      initialUpic={upic}
      initialOldGpNo={oldGpNo}
      initialWardId={wardId}
      initialPropertyNo={propertyNo}
      initialPartitionNo={partitionNo}
      initialWards={initialWards}
      initialProperties={initialProperties}
      initialPartitions={initialPartitions}
      initialSearchResult={initialSearchResult}
      initialCurrentFinancialYear={initialCurrentFinancialYear}
      usageTypeOptions={usageTypeOptions}
    />
  );
}



