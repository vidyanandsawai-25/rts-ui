import React from "react";
import { InventoryConditionForm } from "@/components/modules/assets/configuration/master-data/inventory-condition-master";
import { getInventoryConditionCategoriesAction, getInventoryConditionByIdAction, getAssetCategoriesForConditionAction } from "../../actions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  
  const [inventoryCategories, assetCategories, conditionData] = await Promise.all([
    getInventoryConditionCategoriesAction(),
    getAssetCategoriesForConditionAction(),
    getInventoryConditionByIdAction(id),
  ]);

  if (!conditionData) {
    notFound();
  }

  return <InventoryConditionForm id={Number(id)} initialData={conditionData as unknown as import("@/types/asset-masters/inventory-condition.types").InventoryConditionFormModel} inventoryCategories={inventoryCategories} assetCategories={assetCategories} />;
}
