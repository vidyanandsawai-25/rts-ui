
import { redirect } from "next/navigation";
import GeoSequencingPage from "@/components/modules/property-tax/automation-dashboard/GeoSequencing/GeoSequencingPage";
import { getGeoSequencingGridAction } from "./action";
import { getAutomationWorkflowCardsAction } from "../action";

interface Props {
    searchParams: Promise<{ workflowStageId?: string }>;
}

export default async function GeoSequencingPageServer({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    let workflowStageId = resolvedParams?.workflowStageId;

    if (!workflowStageId) {
        const workflowCardsResult = await getAutomationWorkflowCardsAction();
        const geoCard = workflowCardsResult?.data?.find((card: { stageName: string; id: string }) => card.stageName === 'GeoSequencing');
        if (geoCard?.id) {
            workflowStageId = geoCard.id;
            redirect(`?workflowStageId=${geoCard.id}`);
        }
    }

    const [dataResult] = await Promise.all([
        getGeoSequencingGridAction(workflowStageId)
    ]);

    return (
        <GeoSequencingPage
            serverData={dataResult?.data ?? null}
            defaultWorkflowStageId={workflowStageId}
        />
    );
}