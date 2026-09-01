import { fetchCertificateTemplatesPageDataAction } from "./actions";
import RtsCertificateConfigurationManager from "@/components/modules/rts/configuration/RtsCertificateConfigurationManager";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RtsCertificateTemplatesPage({ params }: PageProps) {
  const { locale } = await params;
  const { templates, libraryTemplates, departments, services, ulbInfo } = await fetchCertificateTemplatesPageDataAction();

  return (
    <div className="w-full min-h-screen">
      <RtsCertificateConfigurationManager
        initialTemplates={templates}
        initialLibraryTemplates={libraryTemplates}
        departments={departments}
        services={services}
        ulbInfo={ulbInfo}
        locale={locale}
      />
    </div>
  );
}
