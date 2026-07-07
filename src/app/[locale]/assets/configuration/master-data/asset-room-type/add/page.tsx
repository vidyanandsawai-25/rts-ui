import React from "react";
import { AssetRoomTypeForm } from "@/components/modules/assets/configuration/master-data/asset-room-type-master";
import { getAssetTypesAction } from "../action";

export default async function AddPage(): Promise<React.ReactElement> {
  const types = await getAssetTypesAction();

  return (
    <AssetRoomTypeForm
      id={null}
      initialData={undefined}
      types={types.map(t => ({ id: t.id, name: t.typeName }))}
    />
  );
}
