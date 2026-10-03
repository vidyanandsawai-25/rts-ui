import React from "react";
import { PageContainer } from "@/components/common";
import { ExtendedAreaAssessmentHeader } from "@/components/modules/property-tax/extended-area-assessment/components/ExtendedAreaAssessmentHeader";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <PageContainer className="p-4 sm:p-6 space-y-4">
      <div className="print:hidden">
        <ExtendedAreaAssessmentHeader locale={locale} />
      </div>
      <div className="mt-0">{children}</div>
    </PageContainer>
  );
}
