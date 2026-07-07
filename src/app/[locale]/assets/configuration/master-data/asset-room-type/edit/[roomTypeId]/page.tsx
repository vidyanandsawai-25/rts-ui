import AssetRoomTypeForm from "@/components/modules/assets/configuration/master-data/asset-room-type-master/AssetRoomTypeForm";
import { getAssetRoomTypeByIdAction, getAssetTypesAction } from "../../action";
import { notFound } from "next/navigation";
import type { AssetRoomType } from "@/types/asset-masters/asset-room-type.types";
import { ApiError } from "@/lib/utils/api";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("EditRoomTypePage");

interface PageProps {
  params: Promise<{
    roomTypeId: string;
  }>;
}

export default async function EditPage({ params }: PageProps): Promise<React.ReactElement> {
  const { roomTypeId: roomTypeIdParam } = await params;

  const roomTypeId = Number(roomTypeIdParam);
  if (!Number.isFinite(roomTypeId) || roomTypeId <= 0) {
    notFound();
  }

  let roomTypeData: AssetRoomType;
  try {
    roomTypeData = await getAssetRoomTypeByIdAction(roomTypeId);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    logger.error("Failed to fetch asset room type", { roomTypeId }, error);
    throw error;
  }

  const types = await getAssetTypesAction();

  return (
    <AssetRoomTypeForm
      id={roomTypeId}
      initialData={roomTypeData}
      types={types.map(t => ({ id: t.id, name: t.typeName }))}
    />
  );
}
