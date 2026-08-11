
import AssessmentDetails from "@/components/modules/property-tax/automation-dashboard/Assessment/AssessmentDetails";
import { getAssessmentGridAction } from "./action";

interface PageProps {
  searchParams: Promise<{ workflowStageId?: string; type?: string }>;
}

const page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  const workflowStageId = params.workflowStageId;
  const type = params.type as "Total" | "Assessed" | "Unassessed" | "Rented" || "Total";

  const data = await getAssessmentGridAction(workflowStageId, type);


  return (
    <AssessmentDetails serverData={data.data} />
  )
}

export default page