import { getCmsMastersAction } from "@/app/[locale]/rts/actions";
import RtsWorkflowsConfig from "@/components/modules/rts/configuration-settings/RtsWorkflowsConfig";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsWorkflowsPage({ params }: PageProps) {
  const { locale } = await params;
  const masters = await getCmsMastersAction();

  // Mock initial workflows list mapped to services for display
  const initialWorkflows = masters.services.slice(0, 10).map((s, idx) => ({
    id: idx + 1,
    serviceId: Number(s.id),
    flowName: `${s.name} Approval Flow`,
    isActive: true,
    stagesCount: 2,
  }));

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
