
import GeoSequencingPage from "@/components/modules/property-tax/automation-dashboard/GeoSequencing/GeoSequencingPage";
import { getGeoSequencingGridAction } from "./action";

interface Props {
    searchParams: Promise<{ workflowStageId?: string }>;
}

export default async function GeoSequencingPageServer({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const workflowStageId = resolvedParams?.workflowStageId;

    const [dataResult] = await Promise.all([
        getGeoSequencingGridAction(workflowStageId)
    ]);

    return (
        <GeoSequencingPage serverData={dataResult?.data ?? null} />
    );
}