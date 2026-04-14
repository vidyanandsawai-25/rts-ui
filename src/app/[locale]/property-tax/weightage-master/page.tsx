import React from "react";
import FloorCvWeightageMaster from "@/components/modules/property-tax/weightage-mastercv/FloorCvWeightageMaster";
import { fetchFloorFactorCVMasterPagedServerAction } from "./action";
import { getAssessmentYearsPagedServerCV, getFloorPaged } from "@/lib/api/weightageMaster.service";
// import { getFloorPaged } from "@/lib/api/floor.services";
// import { getAssessmentYearsPagedServerCV } from "@/lib/api/assessmentYearMasterCV.service";


interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    selectedYearRange?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const pageNumber = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const searchTerm = params.q || undefined;
  const selectedYearRange = params.selectedYearRange || undefined;

  // Fetch assessment years for dropdowns
  const assessmentYearData = await getAssessmentYearsPagedServerCV(1, -1);
  const assessmentYearOptions = assessmentYearData.items.map((year) => ({
    label: `${year.fromYear}-${year.toYear}`,
    value: year.yearRangeCVId.toString(),
  }));

  const result = await fetchFloorFactorCVMasterPagedServerAction(pageNumber, pageSize, searchTerm, selectedYearRange);

  // Fetch floor data for dropdowns
  const floorData = await getFloorPaged(1, -1); // Fetch all floors
  const floorOptions = floorData.items.map((floor) => ({
    label: `${floor.floorCode} - ${floor.description}`,
    value: floor.floorId.toString(),
  }));

  return (
    <div className="pt-6">
      <FloorCvWeightageMaster
        data={result.items}
        pageNumber={result.pageNumber}
        pageSize={result.pageSize}
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        floorOptions={floorOptions}
        assessmentYearOptions={assessmentYearOptions}
      />
    </div>
  );
}