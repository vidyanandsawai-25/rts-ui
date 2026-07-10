import { notFound } from "next/navigation";
import { getCmsApplicationByIdAction, getCmsUsersAction } from "../../actions";
import { readStoredAdminServiceFormByServiceId } from "@/components/modules/rts/admin/service-builder/data.server";
import CmsApplicationDetails from "@/components/modules/cms/CmsApplicationDetails";

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

  // Retrieve matching dynamic schema config for EAV form rendering
  const [storedForm, officers] = await Promise.all([
    readStoredAdminServiceFormByServiceId(app.serviceId),
    getCmsUsersAction()
  ]);

  return (
    <div className="w-full">
      <CmsApplicationDetails
        application={app}
        formSchema={storedForm?.generatedSchema ?? null}
        officers={officers}
        locale={locale}
      />
    </div>
  );
}
