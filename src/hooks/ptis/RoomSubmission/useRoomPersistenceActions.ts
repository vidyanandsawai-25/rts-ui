import { useTranslations } from "next-intl";
import { useConfirm } from "@/components/common";
import { RoomWiseSubmissionProps, FloorData } from "@/types/room-details.types";
import { convertAreaUnit } from "@/lib/utils/RoomSubmission/room-calculation.util";
import { 
  deleteRoomSubmissionNoRedirectAction, 
  deleteOffsetSubmissionNoRedirectAction 
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions";
import { RoomSubmissionState } from "./useRoomSubmissionState";

export const useRoomPersistenceActions = (state: RoomSubmissionState, props: RoomWiseSubmissionProps & { floorData?: FloorData }) => {
  const t = useTranslations("quickDataEntry");
  const { confirm } = useConfirm();
  const {
    rooms, grandTotal, builtupGrandTotal, areaUnit, setIsUpdating
  } = state;

  const { onClose, onUpdate, onRoomsUpdate, floorNumber, onSaveRooms } = props;

  const warning = (msg: string) => {
    confirm({
      variant: "warning",
      title: t("common.warning") || "Warning",
      description: msg,
      confirmText: t("common.ok") || "OK",
      onConfirm: () => { },
    });
  };

  const handleUpdate = async () => {
    if (grandTotal <= 0) {
      warning(t("roomSubmission.validation.atLeastOneRoom"));
      return;
    }

    setIsUpdating(true);

    try {
      // 1. Execute Pending Deletions
      const { pendingDeletions, setPendingDeletions } = state;
      
      // Parallel execution of deletions
      const roomResults = await Promise.all(
        pendingDeletions.rooms.map(async (roomId) => ({
          id: roomId,
          success: (await deleteRoomSubmissionNoRedirectAction(roomId))?.success
        }))
      );
      
      const offsetResults = await Promise.all(
        pendingDeletions.offsets.map(async (offsetId) => ({
          id: offsetId,
          success: (await deleteOffsetSubmissionNoRedirectAction(offsetId))?.success
        }))
      );

      const failedRooms = roomResults.filter(r => !r.success).map(r => r.id);
      const failedOffsets = offsetResults.filter(o => !o.success).map(o => o.id);

      // Only clear successful deletions
      setPendingDeletions({ rooms: failedRooms, offsets: failedOffsets });

      // Abort update if any deletion failed
      if (failedRooms.length > 0 || failedOffsets.length > 0) {
        warning(t("roomSubmission.validation.deleteFailed") || "Failed to delete one or more rooms or offsets. Please try again.");
        setIsUpdating(false);
        return;
      }

      // 2. Proceed with Updates
      const areaSqM = convertAreaUnit(grandTotal, areaUnit || "sq.m", "sq.m");
      const builtUpSqM = convertAreaUnit(builtupGrandTotal, areaUnit || "sq.m", "sq.m");
      const roomsToUpdate = [...rooms];

      if (onRoomsUpdate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRoomsUpdate(roomsToUpdate as any);
      }

      if (onSaveRooms) onSaveRooms(roomsToUpdate, parseFloat(areaSqM.toFixed(2)));

      if (onUpdate) {
        onUpdate({
          floorNumber: floorNumber || "0",
          rooms: roomsToUpdate,
          totalAreaSqM: parseFloat(areaSqM.toFixed(2)),
          builtUpAreaSqM: parseFloat(builtUpSqM.toFixed(2)),
          roomCount: roomsToUpdate.filter(r => Number(r.area || 0) > 0).length
        });
      }

      confirm({
        variant: 'info',
        title: t('roomSubmission.success.title') || 'Success',
        description: t('roomSubmission.success.message') || 'Room data updated in the form.',
        onConfirm: onClose
      });
    } catch {
      warning(t("roomSubmission.validation.updateFailed") || "An error occurred while updating rooms.");
    } finally {
      setIsUpdating(false);
    }
  };

  return { handleUpdate };
};
