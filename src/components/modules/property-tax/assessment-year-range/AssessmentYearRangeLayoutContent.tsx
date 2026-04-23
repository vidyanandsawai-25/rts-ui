"use client";

import { CalendarRange } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageContainer } from "@/components/common/PageContainer";
import TableHeader from "@/components/common/TableHeader";
import { AssessmentYearRangeToolbar } from "./AssessmentYearRangeToolbar";

interface AssessmentYearRangeLayoutContentProps {
  children: React.ReactNode;
}

export function AssessmentYearRangeLayoutContent({
  children,
}: AssessmentYearRangeLayoutContentProps) {
  const t = useTranslations("assessmentYearRange.shared");

  return (
    <PageContainer>
      <div className="">
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={CalendarRange}
          rightContent={<AssessmentYearRangeToolbar />}
        />

        <div className="pt-6">
          {children}
        </div>
      </div>
    </PageContainer>
  );
}
