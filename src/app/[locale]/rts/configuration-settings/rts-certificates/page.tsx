import { fetchCertificateTemplatesPageDataAction } from "./actions";
import RtsCertificateTemplateList from "@/components/modules/rts/configuration/RtsCertificateTemplateList";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RtsCertificateTemplatesPage({ params }: PageProps) {
  const { locale } = await params;
  const { templates, services } = await fetchCertificateTemplatesPageDataAction();

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2">
      <RtsCertificateTemplateList
        initialTemplates={templates}
        services={services}
        locale={locale}
      />
    </div>
  );
}
