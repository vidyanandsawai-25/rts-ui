import ConstructionTypeForm from "@/components/modules/property-tax/construction-type-master/ConstructionTypeForm";
import { getConstructionTypeByIdAction } from "../../action";
import { notFound } from "next/navigation";
import React from "react";
import type { ConstructionType } from "@/types/construction.types";
import { ApiError } from "@/lib/utils/api";

interface PageProps {
  params: Promise<{
    constructionId: string;
  }>;
}

export default async function EditPage({ params }: PageProps): Promise<React.ReactElement> {
  const { constructionId: constructionIdParam } = await params;

  // Parse and validate the ID (Next.js route params are always strings)
  const constructionId = Number(constructionIdParam);
  if (!Number.isFinite(constructionId) || constructionId <= 0) {
    notFound();
  }

  // Fetch data server-side
  let constructionData: ConstructionType;
  try {
    constructionData = await getConstructionTypeByIdAction(constructionId);
  } catch (error) {
    // Only map a genuine 404 to Next.js's notFound().
    // Other failures (auth, timeout, server error) rethrow so error.tsx
    // can display a meaningful message instead of a misleading 404 page.
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    console.error("Failed to fetch construction type:", error);
    // Rethrow — Next.js will catch this and render the nearest error.tsx
    throw error;
  }

  return (
    <>
      <ConstructionTypeForm 
        constructionTypeId={constructionId} 
        initialData={constructionData}
      />
    </>
  );
}