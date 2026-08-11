import { ConstructionTypeForm, ConstructionTypeMaster } from "@/components/modules/property-tax/construction-type-master";
import React from "react";
import { getConstructionPaged } from "@/lib/api/constructiontypemaster/construction-crud.service";
import type { ConstructionType } from "@/types/construction.types";
import { fetchConstructionPagedServerAction } from "../action";

export default async function AddPage(): Promise<React.ReactElement> {
  // Fetch the max sequence and prefill the next one for convenience.
  const response = await getConstructionPaged(1, 1, undefined, "searchSequence", "desc");
  const result = await fetchConstructionPagedServerAction(1, 10, undefined, "searchSequence", "asc");
  let maxSearchSequence = 0;

  if (response?.items?.length) {
    maxSearchSequence = response.items[0].searchSequence || 0;
  }

  const initialData = {
    id: 0,
    constructionCode: "",
    description: "",
    searchSequence: maxSearchSequence > 0 ? maxSearchSequence + 1 : 1,
    isActive: true,
  } as ConstructionType;

  return (
    <>
      <ConstructionTypeMaster
        data={result.items}
        pageNumber={result.pageNumber}
        pageSize={result.pageSize}
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        sortBy="searchSequence"
        sortOrder="asc"
      />
      <ConstructionTypeForm id={null} initialData={initialData} />
    </>
  );
}