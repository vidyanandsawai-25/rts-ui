import {
  getRtsWorkflowsDataAction,
  getWorkflowStagesByApprovalFlowIdAction,
  saveWorkflowWithStagesAction,
  setWorkflowActiveAction,
} from './actions';
import RtsWorkflowsConfig from '@/components/modules/rts/configuration-settings/RtsWorkflowsConfig';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsWorkflowsPage({ params }: PageProps) {
  const { locale } = await params;
  const data = await getRtsWorkflowsDataAction();

  return (
    <div className="w-full">
      <RtsWorkflowsConfig
        data={data}
        locale={locale}
        getStagesByApprovalFlowId={getWorkflowStagesByApprovalFlowIdAction}
        saveWorkflow={saveWorkflowWithStagesAction}
        setWorkflowActive={setWorkflowActiveAction}
      />
    </div>
  );
}
