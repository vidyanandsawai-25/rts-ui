import { notFound } from "next/navigation";
import { getCmsApplicationByIdAction, getCmsUsersAction } from "../../../actions";
import { getRtsWorkflowStages } from "@/lib/api/rts/rts-workflow.service";
import CmsApplicationDetails from "@/components/modules/rts/dashboard/RtsApplicationDetails";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function CmsApplicationDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;

  const app = await getCmsApplicationByIdAction(id);
  if (!app) {
    notFound();
  }

  // Retrieve matching officers and workflow details
  const [officers, workflowDetails] = await Promise.all([
    getCmsUsersAction(),
    getRtsWorkflowStages(Number(app.serviceId)),
  ]);

  const storedForm = null;

  return (
    <div className="w-full">
      <CmsApplicationDetails
        application={app}
        formSchema={null}
        officers={officers}
        locale={locale}
        workflowDetails={workflowDetails}
      />
    </div>
  );
}
