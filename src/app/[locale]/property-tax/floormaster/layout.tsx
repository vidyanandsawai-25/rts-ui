import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { PageContainer } from "@/components/common/PageContainer";
import TableHeader from "@/components/common/TableHeader";
import { FloorMasterToolbar } from "@/components/modules/property-tax/Floormaster/FloorMasterToolbar";

interface FloorMasterLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

async function FloorMasterLayoutContent({
  children,
  locale,
}: Readonly<{
  children: React.ReactNode;
  locale: string;
}>) {
  // Use floor translations with explicit locale for server-side rendering
  const t = await getTranslations({ locale, namespace: "floor" });

  return (
    <PageContainer>
      <div className="">
        <TableHeader
          title={t("floor.title")}
          subtitle={t("floor.subtitle")}
          icon="layers"
          rightContent={<FloorMasterToolbar />}
        />

        <div className="mt-2">
          {children}
        </div>
      </div>
    </PageContainer>
  );
}

export default async function FloorMasterLayout({
  children,
  params,
}: Readonly<FloorMasterLayoutProps>) {
  const { locale } = await params;
  
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
      <FloorMasterLayoutContent locale={locale}>
        {children}
      </FloorMasterLayoutContent>
    </Suspense>
  );
}
