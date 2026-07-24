import RtsFieldsConfig from "@/components/modules/rts/configuration-settings/RtsFieldsConfig";
import {
  deleteRtsFieldConfigAction,
  getRtsFieldConfigData,
  saveRtsFieldConfigAction,
  updateRtsFieldConfigAction,
} from "./actions";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsFieldsPage({ params }: PageProps) {
  const { locale } = await params;
  const data = await getRtsFieldConfigData();

  return (
    <div className="w-full">
      <RtsFieldsConfig
        data={data}
        locale={locale}
        saveField={saveRtsFieldConfigAction}
        updateField={updateRtsFieldConfigAction}
        deleteField={deleteRtsFieldConfigAction}
      />
    </div>
  );
}
