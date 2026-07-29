import { getRtsMastersAction } from "@/app/[locale]/rts/actions";
import RtsWorkflowsConfig from "@/components/modules/rts/configuration-settings/RtsWorkflowsConfig";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsWorkflowsPage({ params }: PageProps) {
  const { locale } = await params;
  const masters = await getRtsMastersAction();

  const initialWorkflows = masters.services.slice(0, 10).map(
    (service: { id: string; name: string }, index: number) => ({
      id: index + 1,
      serviceId: Number(service.id),
      flowName: `${service.name} Approval Flow`,
      isActive: true,
      stagesCount: 2,
    })
  );

  return (
    <div className="w-full">
      <RtsWorkflowsConfig
        data={{
          workflows: initialWorkflows,
          departments: masters.departments,
          services: masters.services,
        }}
        locale={locale}
      />
    </div>
  );
}
