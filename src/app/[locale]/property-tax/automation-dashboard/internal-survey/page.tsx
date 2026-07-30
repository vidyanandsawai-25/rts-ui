
import InternalSurveyPage from "@/components/modules/property-tax/automation-dashboard/InternalSurvey/InternalSurveyPage";
import { getInternalSurveyGridAction } from "./action";

interface Props {
    searchParams: Promise<{ workflowStageId?: string }>;
}

export default async function InternalSurveyPageServer({ searchParams }: Props) {

    const resolvedParams = await searchParams;
    const workflowStageId = resolvedParams?.workflowStageId;

    const [dataResult] = await Promise.all([
        getInternalSurveyGridAction(workflowStageId)
    ]);

    return (
       <InternalSurveyPage serverData={dataResult?.data ?? null} />  
    );
}
