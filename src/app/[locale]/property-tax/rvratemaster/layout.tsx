"use client";

import { PageContainer } from "@/components/common/PageContainer";
import TableHeader from "@/components/common/TableHeader";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RVRateMasterLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("ptis_RVRateMaster");

  return (
    <PageContainer>
      <div className="mb-2">
        <TableHeader
          title={t("header.rateableTitle")}
          icon={Calculator}
          subtitle={t("header.rateableDescription")}
        />
      </div>
      <div className="">
        {children}
      </div>
    </PageContainer>
  );
}
