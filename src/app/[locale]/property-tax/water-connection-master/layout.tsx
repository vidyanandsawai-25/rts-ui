// Suspense removed as per requirement
import { getTranslations } from "next-intl/server";

import { PageContainer } from "@/components/common/PageContainer";
import TableHeader from "@/components/common/TableHeader";
import { WaterConnectionToolbar } from "@/components/modules/property-tax/WaterConnectionMaster/WaterConnectionToolbar";

async function WaterConnectionLayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getTranslations("waterConnectionMaster");

  return (
    <PageContainer>
      <div>
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon="database"
          rightContent={<WaterConnectionToolbar />}
        />
        <div className="mt-2">{children}</div>
      </div>
    </PageContainer>
  );
}

type LayoutProps = { children: React.ReactNode };

export default function WaterConnectionMasterLayout(props: LayoutProps) {
  return <WaterConnectionLayoutContent>{props.children}</WaterConnectionLayoutContent>;
}
