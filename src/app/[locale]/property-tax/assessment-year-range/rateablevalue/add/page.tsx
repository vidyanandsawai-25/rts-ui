import React from "react";
import { AssessmentYearRangeForm } from "@/components/modules/property-tax/assessment-year-range";
import { rateableValueConfig } from "@/components/modules/property-tax/assessment-year-range/config";
import { createAssessmentYearRangeRVAction, updateAssessmentYearRangeRVAction } from "../action";
import { AssessmentYearRangeRV } from "@/types/assessment-year-range.types";

export default async function AddPage(): Promise<React.ReactElement> {
  return (
    <AssessmentYearRangeForm<AssessmentYearRangeRV>
      config={rateableValueConfig}
      id={null}
      initialData={undefined}
      createAction={createAssessmentYearRangeRVAction}
      updateAction={updateAssessmentYearRangeRVAction}
    />
  );
}
