
import { GeoSequencingWardWiseDashboard } from "@/components/modules/property-tax/automation-dashboard/GeoSequencing/ward-wise-summary/WardWisedashboard";
import { getWardWiseSummaryAction } from "../../action";
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

export default async function WardWiseSummaryPage({ params, searchParams }: WardWiseSummaryPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { zoneId } = resolvedParams;
    const { workflowStageId } = resolvedSearchParams;
    const pageNumber = resolvedSearchParams.pageNumber ? parseInt(resolvedSearchParams.pageNumber) : 1;
    const pageSize = resolvedSearchParams.pageSize ? parseInt(resolvedSearchParams.pageSize) : 10;

    const summaryResponse = await getWardWiseSummaryAction(zoneId, workflowStageId, pageNumber, pageSize);
    const summaryData = summaryResponse.success ? summaryResponse.data : null;
    
    return (
        <>
            <GeoSequencingWardWiseDashboard zoneId={zoneId} summaryData={summaryData} />
        </>
    );
}
