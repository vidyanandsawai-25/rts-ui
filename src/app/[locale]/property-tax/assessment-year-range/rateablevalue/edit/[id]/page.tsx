import React from "react";
import { notFound } from "next/navigation";
import { AssessmentYearRangeForm } from "@/components/modules/property-tax/assessment-year-range";
import { rateableValueConfig } from "@/components/modules/property-tax/assessment-year-range/config";
import {
  getAssessmentYearRangeRVByIdAction,
  createAssessmentYearRangeRVAction,
  updateAssessmentYearRangeRVAction,
} from "../../action";
import { AssessmentYearRangeRV } from "@/types/assessment-year-range.types";
import { ApiError } from "@/lib/utils/api";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id: idParam } = await params;

  // Parse and validate the ID
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  // Fetch data server-side
  let data: AssessmentYearRangeRV;
  try {
    data = await getAssessmentYearRangeRVByIdAction(id);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    console.error("Failed to fetch assessment year range:", error);
    throw error;
  }

  return (
    <AssessmentYearRangeForm<AssessmentYearRangeRV>
      config={rateableValueConfig}
      id={id}
      initialData={data}
      createAction={createAssessmentYearRangeRVAction}
      updateAction={updateAssessmentYearRangeRVAction}
    />
  );
}
