import { fetchCertificateTemplatesPageDataAction } from "./actions";
import RtsCertificateMasterStudio from "@/components/modules/rts/configuration/RtsCertificateMasterStudio";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RtsCertificateTemplatesPage({ params }: PageProps) {
  const { locale } = await params;
  const { templates, services, ulbInfo } = await fetchCertificateTemplatesPageDataAction();

  return (
    <div className="w-full min-h-screen">
      <RtsCertificateMasterStudio
        initialTemplates={templates}
        services={services}
        ulbInfo={ulbInfo}
        locale={locale}
      />
    </div>
  );
}
