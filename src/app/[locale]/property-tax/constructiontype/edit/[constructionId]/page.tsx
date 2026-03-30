import ConstructionTypeForm from "@/components/modules/property-tax/construction-type-master/ConstructionTypeForm";
import { getConstructionTypeByIdAction } from "../../action";
import { notFound } from "next/navigation";
import React from "react";
import type { ConstructionType } from "@/types/construction.types";

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
    // If record not found or error occurs, show 404 page
    console.error("Failed to fetch construction type:", error);
    notFound();
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