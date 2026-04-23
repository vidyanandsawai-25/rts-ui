import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { PageContainer } from "@/components/common/PageContainer";
import TableHeader from "@/components/common/TableHeader";
import { FloorMasterToolbar } from "@/components/modules/property-tax/Floormaster/FloorMasterToolbar";

async function FloorMasterLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use floor translations as default for server-side rendering
  // The client component will handle dynamic updates
  const t = await getTranslations("floor.floor");

  return (
    <PageContainer>
      <div className="">
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon="layers"
          rightContent={<FloorMasterToolbar />}
        />

        <div className="p-6">
          {children}
        </div>
      </div>
    </PageContainer>
  );
}

export default function FloorMasterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <FloorMasterLayoutContent>
        {children}
      </FloorMasterLayoutContent>
    </Suspense>
  );
}
