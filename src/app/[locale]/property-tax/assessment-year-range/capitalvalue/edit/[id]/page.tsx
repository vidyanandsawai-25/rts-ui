import AssessmentYearFormCV from "@/components/modules/property-tax/AssesssmentYearRange/CapitalValue/AssessmentYearFormCV";
import { getAssessmentYearByIdCV } from "@/lib/api/assessmentYearMasterCV.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssessmentYearPageCV({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  // Guard against invalid id
  if (!resolvedParams.id || isNaN(id) || id <= 0) {
    // Optionally, you can return a not-found state or redirect
    return null;
  }
  const data = await getAssessmentYearByIdCV(id);

  return (
    <AssessmentYearFormCV
      open={true}
      initialData={data}
      key={data.yearId}
    />
  );
}
