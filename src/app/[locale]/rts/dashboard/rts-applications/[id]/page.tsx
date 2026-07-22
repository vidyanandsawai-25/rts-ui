import { notFound } from "next/navigation";
import { getRtsApplicationByIdAction, getRtsUsersAction } from "../../../actions";
import { getRtsWorkflowStages } from "@/lib/api/rts/rts-workflow.service";
import RtsApplicationDetails from "@/components/modules/rts/dashboard/RtsApplicationDetails";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function RtsApplicationDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;

  const app = await getRtsApplicationByIdAction(id);
  if (!app) {
    notFound();
  }

  // Retrieve matching officers and workflow details
  const [officers, workflowDetails] = await Promise.all([
    getRtsUsersAction(),
    getRtsWorkflowStages(Number(app.serviceId)),
  ]);

  return (
    <div className="w-full">
      <RtsApplicationDetails
        application={app}
        formSchema={null}
        officers={officers}
        locale={locale}
        workflowDetails={workflowDetails}
      />
    </div>
  );
}
