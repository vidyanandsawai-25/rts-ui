import { notFound } from "next/navigation";
import { getRtsApplicationByIdAction, getRtsUsersAction } from "../actions";
import { getRtsFieldDefinitionsByServiceId } from "@/lib/api/rts/rtsfielddefinition.service";
import { buildOldServiceFormConfigFromRtsFieldDefinitions } from "@/lib/utils/rts/rts-field-definition-mapper";
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

  // Retrieve real matching dynamic fields config for EAV form rendering
  const fieldDefinitions = await getRtsFieldDefinitionsByServiceId(app.serviceId).catch(() => []);
  const formSchema = buildOldServiceFormConfigFromRtsFieldDefinitions(String(app.serviceId), fieldDefinitions);
  const officers = await getRtsUsersAction();

  return (
    <div className="w-full">
      <RtsApplicationDetails
        application={app}
        formSchema={formSchema}
        officers={officers}
        locale={locale}
      />
    </div>
  );
}
