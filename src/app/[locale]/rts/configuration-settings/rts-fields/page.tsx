import { getCmsFieldsAction } from "../../actions";
import CmsFieldsConfig from "@/components/modules/rts/configuration-settings/RtsFieldsConfig";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CmsFieldsPage({ params }: PageProps) {
  const { locale } = await params;
  const data = await getCmsFieldsAction();

  return (
    <div className="w-full">
      <CmsFieldsConfig data={data} locale={locale} />
    </div>
  );
}
