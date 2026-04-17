import { SubFloorForm } from "@/components/modules/property-tax/Floormaster/subfloor";
import React from "react";

export default async function AddPage(): Promise<React.ReactElement> {
  return <SubFloorForm subFloorId={null} initialData={undefined} />;
}