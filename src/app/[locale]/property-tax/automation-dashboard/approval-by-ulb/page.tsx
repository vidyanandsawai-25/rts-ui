
import ApprovalbyUlbDashboard from "@/components/modules/property-tax/automation-dashboard/ApprovalByULB/ApprovalbyUlbDashboard";
import { getApprovalByUlbGridDetailsAction } from "./action";

const page = async () => {

    const [dataResult] = await Promise.all([
        getApprovalByUlbGridDetailsAction()
    ]);

    return (
        <ApprovalbyUlbDashboard serverData={dataResult.data} />
    )
}

export default page