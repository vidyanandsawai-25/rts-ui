import { SubFloorForm } from "@/components/modules/property-tax/Floormaster/subfloor";
import { getSubFloorById } from "@/lib/api/subfloor.service";
import React from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const subFloorId = Number(id);
  const subFloor = await getSubFloorById(subFloorId);
  
  return <SubFloorForm id={subFloorId} initialData={subFloor} />;
}
