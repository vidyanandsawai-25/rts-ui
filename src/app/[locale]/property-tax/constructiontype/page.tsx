import React from "react";
import { ConstructionTypeMaster } from "@/components/modules/property-tax/construction-type-master";
import { fetchConstructionPagedServerAction } from "./action";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const pageNumber = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const searchTerm = params.q || undefined;
  const result = await fetchConstructionPagedServerAction(pageNumber, pageSize, searchTerm);
  return (

    <ConstructionTypeMaster
      data={result.items}
      pageNumber={result.pageNumber}
      pageSize={result.pageSize}
      totalCount={result.totalCount}
      totalPages={result.totalPages}
    />
  );
}
