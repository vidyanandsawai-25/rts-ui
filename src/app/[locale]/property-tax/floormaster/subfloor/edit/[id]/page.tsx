
import { SubFloorForm } from "@/components/modules/property-tax/Floormaster/subfloor";
import { getSubFloorById } from "@/lib/api/floor.services";
import React from "react";

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const subFloorId = Number(id);
  const subFloor = await getSubFloorById(subFloorId);
  
  return <SubFloorForm subFloorId={subFloorId} initialData={subFloor} />;
}
