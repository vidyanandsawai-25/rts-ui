import { getRtsFieldsAction } from "../../actions";
import RtsFieldsConfig from "@/components/modules/rts/configuration-settings/RtsFieldsConfig";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsFieldsPage({ params }: PageProps) {
  const { locale } = await params;
  const data = await getRtsFieldsAction();

  return (
    <div className="w-full">
      <RtsFieldsConfig data={data} locale={locale} />
    </div>
  );
}
