// import PageContainer from "@/components/common/PageContainer";
import { PageContainer } from "@/components/common";
import AssessmentYearMasterCV from "@/components/modules/property-tax/AssesssmentYearRange/CapitalValue/AssesssmentYearMasterCV";
import { getAssessmentYearsPagedServerCV } from "@/lib/api/assessmentYearMasterCV.service";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CapitalValuePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const size = Number(resolvedParams?.size) || 10;
  const search = (resolvedParams?.search as string) || "";

  const paginatedData = await getAssessmentYearsPagedServerCV(page, size, search);

  return (
    <PageContainer>
      <AssessmentYearMasterCV paginatedData={paginatedData} />
    </PageContainer>
  );
}
