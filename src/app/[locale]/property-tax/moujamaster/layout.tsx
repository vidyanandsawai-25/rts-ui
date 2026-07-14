"use client";

import { PageContainer } from "@/components/common/PageContainer";
import TableHeader from "@/components/common/TableHeader";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MoujaMasterLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("ptis_RVRateMaster");

  return (
    <PageContainer>
      <div className="mb-2">
        <TableHeader
          title={t("header.moujaTitle")}
          icon={MapPin}
          subtitle={t("header.moujaDescription")}
        />
      </div>
      <div className="">
        {children}
      </div>
    </PageContainer>
  );
}
