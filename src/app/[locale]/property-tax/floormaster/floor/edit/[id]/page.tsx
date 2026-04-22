import { FloorForm } from "@/components/modules/property-tax/Floormaster/floor";
import { getFloorById } from "@/lib/api/floor.services";
import React from "react";

export const dynamic = "force-dynamic";

export default async function EditPage({ 
  params 
}: Readonly<{ params: Promise<{ id: string }> }>): Promise<React.ReactElement> {
  const { id } = await params;
  const floorId = Number(id);
  const floor = await getFloorById(floorId);
  
  return <FloorForm id={floorId} initialData={floor} />;
}