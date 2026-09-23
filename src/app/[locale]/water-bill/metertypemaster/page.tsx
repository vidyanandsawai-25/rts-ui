import React from "react";
import { MeterTypeMaster } from "@/components/modules/water-tax/meter-type-master";
import { fetchMeterTypesPagedServerAction } from "./action";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

import { TEXT_SANITIZE } from "@/lib/utils/validation-rules";

function sanitizeParams(raw: Awaited<PageProps["searchParams"]>) {
  const rawPage = parseInt(raw.page ?? "", 10);
  const pageNumber = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawPageSize = parseInt(raw.pageSize ?? "", 10);
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;

  const rawSearch = raw.q?.trim();
  const searchTerm = rawSearch ? rawSearch.replace(TEXT_SANITIZE, "") || undefined : undefined;
  const sortBy = raw.sortBy?.trim() || undefined;
  const sortOrder = raw.sortOrder?.trim() || undefined;

  return { pageNumber, pageSize, searchTerm, sortBy, sortOrder };
}

export default async function MeterTypeMasterPage({ searchParams }: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const { pageNumber, pageSize, searchTerm, sortBy, sortOrder } = sanitizeParams(params);

  const result = await fetchMeterTypesPagedServerAction(pageNumber, pageSize, searchTerm, sortBy, sortOrder);

  return (
    <MeterTypeMaster
      data={result.items}
      pageNumber={result.pageNumber}
      pageSize={result.pageSize}
      totalCount={result.totalCount}
      totalPages={result.totalPages}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  );
}
