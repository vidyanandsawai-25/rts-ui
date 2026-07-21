import { notFound } from "next/navigation";
import { getCmsApplicationByIdAction, getCmsUsersAction } from "../../../actions";
import { readStoredAdminServiceFormByServiceId } from "@/components/modules/rts/admin/service-builder/data.server";
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

  // Retrieve matching dynamic schema config for EAV form rendering and workflow details
  const [storedForm, officers, workflowDetails] = await Promise.all([
    readStoredAdminServiceFormByServiceId(app.serviceId),
    getCmsUsersAction(),
    getRtsWorkflowStages(Number(app.serviceId))
  ]);

  return (
    <div className="w-full">
      <CmsApplicationDetails
        application={app}
        formSchema={storedForm?.generatedSchema ?? null}
        officers={officers}
        locale={locale}
        workflowDetails={workflowDetails}
      />
    </div>
  );
}
