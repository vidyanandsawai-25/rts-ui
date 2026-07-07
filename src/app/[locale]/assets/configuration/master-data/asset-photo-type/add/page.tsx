import React from "react";
import { AssetPhotoTypeForm } from "@/components/modules/assets/configuration/master-data/asset-photo-type-master";
import { getAssetCategoriesAction, getAssetTypesAction } from "../action";

export default async function AddPage(): Promise<React.ReactElement> {
  const [categories, types] = await Promise.all([
    getAssetCategoriesAction(),
    getAssetTypesAction(),
  ]);

  return (
    <AssetPhotoTypeForm
      id={null}
      initialData={undefined}
      categories={categories.map(c => ({ id: c.id, name: c.categoryName }))}
      types={types.map(t => ({ id: t.id, name: t.typeName }))}
    />
  );
}
