import { Suspense } from "react";
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

export default function WaterConnectionMasterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center p-6"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      }
    >
      <WaterConnectionLayoutContent>{children}</WaterConnectionLayoutContent>
    </Suspense>
  );
}
