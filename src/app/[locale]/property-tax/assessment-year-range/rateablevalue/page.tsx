import { PageContainer } from "@/components/common";
import AssessmentYearMaster from "@/components/modules/property-tax/AssesssmentYearRange/RateableValue/AssesssmentYearMasterRV";

import { getAssessmentYearsPagedServer } from "@/lib/api/assessmentYearMaster.service";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AssessmentYearRangePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const size = Number(resolvedParams?.size) || 10;
  const search = (resolvedParams?.search as string) || "";

  const paginatedData = await getAssessmentYearsPagedServer(page, size, search);

  return (
    <PageContainer>
      <AssessmentYearMaster paginatedData={paginatedData} />
    </PageContainer>
  );
}
