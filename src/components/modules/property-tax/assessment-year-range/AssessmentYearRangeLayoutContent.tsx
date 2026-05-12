"use client";

import { CalendarRange } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import TableHeader from "@/components/common/TableHeader";
import { AssessmentYearRangeToolbar } from "./AssessmentYearRangeToolbar";

interface AssessmentYearRangeLayoutContentProps {
  children: React.ReactNode;
}

export function AssessmentYearRangeLayoutContent({
  children,
}: AssessmentYearRangeLayoutContentProps) {
  const pathname = usePathname();
  const tRV = useTranslations("assessmentYearRange.rateableValue");
  const tCV = useTranslations("assessmentYearRange.capitalValue");

  // Detect active tab from pathname
  const isCapitalValue = pathname.includes("/capitalvalue");
  const t = isCapitalValue ? tCV : tRV;

  return (
    <div className="">
      <TableHeader
        title={t("list.title")}
        subtitle={t("list.subtitle")}
        icon={CalendarRange}
        rightContent={<AssessmentYearRangeToolbar />}
      />

      <div className="pt-6">
        {children}
      </div>
    </div>
  );
}
