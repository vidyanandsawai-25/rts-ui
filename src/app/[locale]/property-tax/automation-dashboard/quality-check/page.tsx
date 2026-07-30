
import DataEntryQualityCheck from "@/components/modules/property-tax/automation-dashboard/DataEntryQualityCheck/DataEntryQualityCheck";
import { getDataEntryGridAction } from "./action";

interface Props {
    searchParams: Promise<{ workflowStageId?: string }>;
}

export default async function QualityCheckPageServer({ searchParams }: Props) {

    const resolvedParams = await searchParams;
    const workflowStageId = resolvedParams?.workflowStageId;

    const [dataResult] = await Promise.all([
        getDataEntryGridAction(workflowStageId)
    ]);

    return (
       <DataEntryQualityCheck serverData={dataResult?.data ?? null} />  
    );
}
