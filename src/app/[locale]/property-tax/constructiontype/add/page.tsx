import { ConstructionTypeForm} from "@/components/modules/property-tax/construction-type-master";
import React from "react";
import { getConstructionPaged } from "@/lib/api/constructiontypemaster/construction-crud.service";
import type { ConstructionType } from "@/types/construction.types";

export default async function AddPage(): Promise<React.ReactElement> {
  // Fetch the max sequence and prefill the next one for convenience.
  const response = await getConstructionPaged(1, 1, undefined, "searchSequence", "desc");
 
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
      <ConstructionTypeForm id={null} initialData={initialData} />
    </>
  );
}