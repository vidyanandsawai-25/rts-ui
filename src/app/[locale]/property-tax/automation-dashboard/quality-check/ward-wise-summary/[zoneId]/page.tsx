
import DataEntryWardWisedashboard from "@/components/modules/property-tax/automation-dashboard/DataEntryQualityCheck/ward-wise-summary/DataEntryWardWisedashboard";
import { getDataEntryWardWiseSummaryAction } from "../../action";
interface WardWiseSummaryPageProps {
    params: Promise<{
        zoneId: string;
        locale: string;
    }>;
    searchParams: Promise<{
        workflowStageId?: string;
        pageNumber?: string;
        pageSize?: string;
    }>;
}

export default async function QualityCheckWardWiseSummaryPage({ params, searchParams }: WardWiseSummaryPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { zoneId } = resolvedParams;
    const { workflowStageId } = resolvedSearchParams;
    const pageNumber = resolvedSearchParams.pageNumber ? parseInt(resolvedSearchParams.pageNumber) : 1;
    const pageSize = resolvedSearchParams.pageSize ? parseInt(resolvedSearchParams.pageSize) : 10;

    const summaryResponse = await getDataEntryWardWiseSummaryAction(zoneId, workflowStageId, pageNumber, pageSize);
    const summaryData = summaryResponse.success ? (summaryResponse.data ?? null) : null;
    return (
        <>
            <DataEntryWardWisedashboard zoneId={zoneId} summaryData={summaryData}/>
        </>
    );
}