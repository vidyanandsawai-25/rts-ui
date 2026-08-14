

import WardWiseDashboard from "@/components/modules/property-tax/automation-dashboard/ApprovalByULB/ward-wise-summary/WardWiseDashboard";
import { getWardWiseApprovalByUlbGridDetailsAction } from "../../action";

interface WardWisePageProps {
    params: Promise<{
        zoneId: string;
    }>;
}

export default async function WardWisePage({ params }: WardWisePageProps) {
    const resolvedParams = await params;
    const { zoneId } = resolvedParams;

    const summaryResponse = await getWardWiseApprovalByUlbGridDetailsAction(zoneId);

    const serverData = summaryResponse.success && summaryResponse.data ? summaryResponse.data : null;

    return (
        <>
            <WardWiseDashboard
                zoneId={zoneId}
                serverData={serverData}
            />
        </>
    )
}