import { FloorForm } from "@/components/modules/property-tax/Floormaster/floor";
import React from "react";

export default async function AddPage(): Promise<React.ReactElement> {
  return <FloorForm floorId={null} initialData={undefined} />;
}