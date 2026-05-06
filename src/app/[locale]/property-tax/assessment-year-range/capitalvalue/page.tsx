import React from "react";
import { AssessmentYearRangeMaster } from "@/components/modules/property-tax/assessment-year-range";
import { capitalValueConfig } from "@/components/modules/property-tax/assessment-year-range/config";
import { fetchAssessmentYearRangeCVPagedAction, deleteAssessmentYearRangeCVAction } from "./action";
import { AssessmentYearRangeCV } from "@/types/assessment-year-range.types";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

/** Pagination constraints */
const MIN_PAGE = 1;
const MAX_PAGE = 10_000;
const MIN_PAGE_SIZE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * Sanitizes and clamps all query-string parameters
 */
function sanitizeParams(raw: Awaited<PageProps["searchParams"]>) {
  const rawPage = parseInt(raw.page ?? "", 10);
  const pageNumber = Number.isFinite(rawPage)
    ? Math.min(Math.max(rawPage, MIN_PAGE), MAX_PAGE)
    : MIN_PAGE;

  const rawPageSize = parseInt(raw.pageSize ?? "", 10);
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(Math.max(rawPageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  return { pageNumber, pageSize };
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const { pageNumber, pageSize } = sanitizeParams(params);
  const result = await fetchAssessmentYearRangeCVPagedAction(pageNumber, pageSize);

  return (
    <AssessmentYearRangeMaster<AssessmentYearRangeCV>
      config={capitalValueConfig}
      data={result.items}
      pageNumber={result.pageNumber}
      pageSize={result.pageSize}
      totalCount={result.totalCount}
      totalPages={result.totalPages}
      deleteAction={deleteAssessmentYearRangeCVAction}
    />
  );
}
