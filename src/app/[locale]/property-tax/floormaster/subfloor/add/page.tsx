import { SubFloorForm } from "@/components/modules/property-tax/Floormaster/subfloor";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AddPage(): Promise<React.ReactElement> {
  return <SubFloorForm id={null} initialData={undefined} />;
}