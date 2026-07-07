import AssetPhotoTypeForm from "@/components/modules/assets/configuration/master-data/asset-photo-type-master/AssetPhotoTypeForm";
import { getAssetPhotoTypeByIdAction, getAssetCategoriesAction, getAssetTypesAction } from "../../action";
import { notFound } from "next/navigation";
import type { AssetPhotoType } from "@/types/asset-masters/asset-photo-type.types";
import { ApiError } from "@/lib/utils/api";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("EditPhotoTypePage");

interface PageProps {
  params: Promise<{
    photoTypeId: string;
  }>;
}


export default async function EditPage({ params }: PageProps): Promise<React.ReactElement> {
  const { photoTypeId: photoTypeIdParam } = await params;

  const photoTypeId = Number(photoTypeIdParam);
  if (!Number.isFinite(photoTypeId) || photoTypeId <= 0) {
    notFound();
  }

  let photoTypeData: AssetPhotoType;
  try {
    photoTypeData = await getAssetPhotoTypeByIdAction(photoTypeId);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    logger.error("Failed to fetch asset photo type", { photoTypeId }, error);
    throw error;
  }

  const [categories, types] = await Promise.all([
    getAssetCategoriesAction(),
    getAssetTypesAction(),
  ]);

  return (
    <AssetPhotoTypeForm
      id={photoTypeId}
      initialData={photoTypeData}
      categories={categories.map(c => ({ id: c.id, name: c.categoryName }))}
      types={types.map(t => ({ id: t.id, name: t.typeName }))}
    />
  );
}
