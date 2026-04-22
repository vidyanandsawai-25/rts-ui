import { FloorForm } from "@/components/modules/property-tax/Floormaster/floor";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AddPage(): Promise<React.ReactElement> {
  return <FloorForm id={null} initialData={undefined} />
}