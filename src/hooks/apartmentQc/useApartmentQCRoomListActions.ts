import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useConfirm } from "@/components/common";
import {
  RoomWiseSubmissionProps,
  RoomData,
} from "@/types/room-details.types";
import { RoomFormData, ShapeParameters } from "@/types/common-details.types";
import { calculateRoomArea } from "@/lib/utils/RoomSubmission/room-submission.utils";
import { validateRoomDetails } from "@/lib/utils/RoomSubmission/room-validation.utils";
import {
  calculateRoomAreas,
  calculateNetOffsetArea,
} from "@/lib/utils/RoomSubmission/room-calculation.util";
import {
  createRoomWiseSubmissionAction,
  updateRoomWiseSubmissionAction,
  deleteRoomWiseSubmissionAction,
  syncRoomsForPropertyDetailsAction,
} from "@/app/[locale]/property-tax/ptis/appartmentQC/action";
import { RoomSubmissionState } from "@/hooks/ptis/RoomSubmission/useRoomSubmissionState";

/**
 * Extract API dimension fields from form state.
 *
 * When a shape is selected the user enters dimensions in the RoomPreview panel,
 * which stores them in `shapeParameters` — NOT in `formData.length/width`.
 * Sending formData.length/width (which stay "0") causes the backend to reject
 * the request. This helper reads the correct source for each case.
 */
function extractDimensions(
  formData: Pick<RoomFormData, "shape" | "length">,
  sp: ShapeParameters
): {
  lengthMtr: number;
  widthMtr: number;
  heightMtr: number;
  base1Mtr: number;
  base2Mtr: number;
} {
  const isManual = !formData.shape || formData.shape === "-Select-";
  if (isManual) {
    return {
      lengthMtr: parseFloat(formData.length) || 0,
      widthMtr: 0,
      heightMtr: 0,
      base1Mtr: 0,
      base2Mtr: 0,
    };
  }
  const str = (v: string | number | undefined) => String(v ?? "");
  return {
    // Circle / Semi / Quarter → radius stored in shapeParameters.radius; Rectangle → length
    lengthMtr:
      parseFloat(str(sp.length) || str(sp.radius) || str(sp.side) || "0") || 0,
    widthMtr: parseFloat(str(sp.width) || "0") || 0,
    heightMtr: parseFloat(str(sp.height) || "0") || 0,
    // Triangle → base; Trapezoid → base1
    base1Mtr: parseFloat(str(sp.base1) || str(sp.base) || "0") || 0,
    base2Mtr: parseFloat(str(sp.base2) || "0") || 0,
  };
}

/**
 * Apartment QC–specific room list actions.
 *
 * All three operations (add, update, delete) call the apartment QC server actions
 * immediately — there is no "pending deletions" deferred mechanism.
 */
export const useApartmentQCRoomListActions = (
  state: RoomSubmissionState,
  props: RoomWiseSubmissionProps,
  handleCancelEdit: () => void
) => {
  const t = useTranslations("quickDataEntry");
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const {
    rooms,
    setRooms,
    formData,
    shapeParameters,
    editingIndex,
    currentRoomOffsets,
    setValidationErrors,
    areaUnit: _areaUnit,
  } = state;

  const propertyId = Number(props.initialPropertyID || 0);
  const propertyDetailsId = Number(props.initialFloorId || 0);

  // ─── ADD ──────────────────────────────────────────────────────────────────

  const handleAddRoom = () => {
    const baseArea = calculateRoomArea(formData, shapeParameters);

    const { success, errors } = validateRoomDetails(
      formData as unknown as Partial<RoomData>,
      null,
      baseArea
    );

    if (!success) {
      setValidationErrors(errors);
      const firstMsg = Object.values(errors)[0];
      if (firstMsg) toast.error(t(firstMsg));
      return;
    }

    const totalOffsetArea = calculateNetOffsetArea(currentRoomOffsets);
    const computed = calculateRoomAreas(
      baseArea,
      formData.offsetMinus,
      totalOffsetArea,
      formData.outer
    );

    const dims = extractDimensions(formData, shapeParameters);
    const isManualArea = !formData.shape || formData.shape === "-Select-";

    startTransition(async () => {
      const result = await createRoomWiseSubmissionAction({
      propertyId,
      propertyDetailsId,
      ...dims,
      areaSqMtr: baseArea,
      noOfRooms: 1,
      totalAreaSqMtr: computed.carpetArea,
      roomNo: String(rooms.length + 1),
      roomType: formData.utilities === "-Select-" ? "" : formData.utilities,
      roomTypeId: formData.roomTypeId ? Number(formData.roomTypeId) : undefined,
      shape: formData.shape === "-Select-" ? "" : formData.shape,
      outerYesNo: formData.outer === "Yes",
      minusYesNo: formData.offsetMinus === "Yes",
      submissionType: "room",
      roomWiseMinusData: currentRoomOffsets.map((o) => ({
        id: o.id ? Number(o.id) : undefined,
        lengthMtr: parseFloat(o.length || "0") || 0,
        widthMtr: parseFloat(o.width || "0") || 0,
        heightMtr: parseFloat(o.height || "0") || 0,
        areaSqMtr: o.area || 0,
        shape: o.shape || "Rectangle",
        operation: o.operation,
        remark: o.operation === "add" ? "ADD" : "SUB",
      })),
    });

      if (!result.success) {
        toast.error((result as { error?: string }).error || "Failed to create room");
        return;
      }

      const createdId = (result.data as { id?: number } | undefined)?.id;

      const newRoom: RoomData = {
        id: createdId,
        roomWiseSubmissionId: createdId,
        tempId: `aqc-created-${Date.now()}`,
        roomNo: String(rooms.length + 1),
        length: isManualArea ? formData.length : (shapeParameters.length || shapeParameters.radius || ""),
        width: isManualArea ? formData.width : (shapeParameters.width || ""),
        area: baseArea,
        mainArea: baseArea,
        carpetArea: computed.carpetArea,
        builtUpArea: computed.builtUpArea,
        roomCount: "1",
        offsetMinus: formData.offsetMinus,
        offsets: [...currentRoomOffsets],
        roomWiseMinusData: [...currentRoomOffsets],
        outer: formData.outer,
        total: computed.carpetArea,
        areaSqMtr: baseArea,
        totalAreaSqMtr: computed.carpetArea,
        remark: formData.remark === "-Select-" ? "" : formData.remark,
        utilities: formData.utilities === "-Select-" ? "" : formData.utilities,
        roomType: formData.utilities === "-Select-" ? "" : formData.utilities,
        roomTypeId: formData.roomTypeId ? Number(formData.roomTypeId) : undefined,
        shape: formData.shape === "-Select-" ? "" : formData.shape,
        shapeParams: { ...shapeParameters },
        shapeParameters: { ...shapeParameters },
        isAutoGenerated: false,
      };

      setRooms((prev) => [...prev, newRoom]);

      // Call sync-rooms API to update floor aggregates
      if (propertyId > 0 && propertyDetailsId > 0) {
        const syncResult = await syncRoomsForPropertyDetailsAction(propertyId, propertyDetailsId);
        if (syncResult.success) {
          // Trigger Floor QC table refresh via onUpdate callback
          const updatedRooms = [...rooms, newRoom];
          const totalArea = updatedRooms.reduce((sum, room) => {
            const area = Number(room.total || room.totalAreaSqMtr || room.carpetArea || room.area || 0);
            return sum + area;
          }, 0);
          const builtUpArea = updatedRooms.reduce((sum, room) => {
            const area = Number(room.builtUpArea || room.total || room.totalAreaSqMtr || room.area || 0);
            return sum + area;
          }, 0);
          if (props.onUpdate) {
            try {
              props.onUpdate({
                floorNumber: String(propertyDetailsId),
                rooms: updatedRooms,
                totalAreaSqM: totalArea,
                builtUpAreaSqM: builtUpArea,
                roomCount: updatedRooms.length,
              });
            } catch {
              // onUpdate errors are non-critical
            }
          }
        }
      }

      toast.success("Room added successfully");
      handleCancelEdit();
    });
  };

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  const handleUpdateRoom = () => {
    if (editingIndex === null) return;

    const currentRoom = rooms[editingIndex];
    if (!currentRoom) return;

    const dbId = currentRoom.id || currentRoom.roomWiseSubmissionId;
    if (!dbId || Number(dbId) <= 0) {
      toast.error("Cannot update room: missing database ID");
      return;
    }

    const baseArea = calculateRoomArea(formData, shapeParameters);

    const { success, errors } = validateRoomDetails(
      formData as unknown as Partial<RoomData>,
      null,
      baseArea
    );

    if (!success) {
      setValidationErrors(errors);
      const firstMsg = Object.values(errors)[0];
      if (firstMsg) toast.error(t(firstMsg));
      return;
    }

    const computed = calculateRoomAreas(
      baseArea,
      formData.offsetMinus,
      calculateNetOffsetArea(currentRoomOffsets),
      formData.outer
    );

    const updateDims = extractDimensions(formData, shapeParameters);
    const isManualUpdate = !formData.shape || formData.shape === "-Select-";

    startTransition(async () => {
      const result = await updateRoomWiseSubmissionAction(Number(dbId), {
        propertyId,
        propertyDetailsId,
        ...updateDims,
        areaSqMtr: baseArea,
        noOfRooms: 1,
        totalAreaSqMtr: computed.carpetArea,
        roomNo: formData.roomNo || currentRoom.roomNo,
        roomType: formData.utilities === "-Select-" ? "" : formData.utilities,
        roomTypeId: formData.roomTypeId ? Number(formData.roomTypeId) : undefined,
        shape: formData.shape === "-Select-" ? "" : formData.shape,
        outerYesNo: formData.outer === "Yes",
        minusYesNo: formData.offsetMinus === "Yes",
        roomWiseMinusData: currentRoomOffsets.map((o) => {
          // Ensure id is properly converted to number (may be string from API)
          const offsetId = o.id ? Number(o.id) : undefined;
          // Access dimensions from both possible field names (length or lengthMtr)
          const oAny = o as unknown as Record<string, unknown>;
          return {
            id: offsetId && offsetId > 0 ? offsetId : undefined,
            roomWiseSubmissionId: Number(dbId),
            lengthMtr: parseFloat(String(o.length || oAny.lengthMtr || "0")) || 0,
            widthMtr: parseFloat(String(o.width || oAny.widthMtr || "0")) || 0,
            heightMtr: parseFloat(String(o.height || oAny.heightMtr || "0")) || 0,
            areaSqMtr: Number(o.area || oAny.areaSqMtr || 0) || 0,
            shape: o.shape || (oAny.shape as string) || "Rectangle",
            operation: o.operation,
            remark: o.operation === "add" ? "ADD" : "SUB",
            base1Mtr: parseFloat(String(o.base1 || oAny.base1Mtr || "0")) || 0,
            base2Mtr: parseFloat(String(o.base2 || oAny.base2Mtr || "0")) || 0,
          };
        }),
      });

      if (!result.success) {
        toast.error((result as { error?: string }).error || "Failed to update room");
        return;
      }

      const resultData = result.data as any;
      const processedOffsets = resultData?.roomWiseMinusData || currentRoomOffsets;

      const updatedRoom: RoomData = {
        ...currentRoom,
        roomNo: formData.roomNo || currentRoom.roomNo,
        length: isManualUpdate ? formData.length : (shapeParameters.length || shapeParameters.radius || ""),
        width: isManualUpdate ? formData.width : (shapeParameters.width || ""),
        area: baseArea,
        mainArea: baseArea,
        carpetArea: computed.carpetArea,
        builtUpArea: computed.builtUpArea,
        roomCount: "1",
        offsetMinus: formData.offsetMinus,
        offsets: processedOffsets,
        roomWiseMinusData: processedOffsets,
        outer: formData.outer,
        total: computed.carpetArea,
        areaSqMtr: baseArea,
        totalAreaSqMtr: computed.carpetArea,
        remark: formData.remark === "-Select-" ? "" : formData.remark,
        utilities: formData.utilities === "-Select-" ? "" : formData.utilities,
        roomType: formData.utilities === "-Select-" ? "" : formData.utilities,
        roomTypeId: formData.roomTypeId ? Number(formData.roomTypeId) : undefined,
        shape: formData.shape === "-Select-" ? "" : formData.shape,
        shapeParams: { ...shapeParameters },
        shapeParameters: { ...shapeParameters },
      };

      setRooms((prev) => {
        const updated = [...prev];
        updated[editingIndex] = updatedRoom;
        return updated;
      });

      // Call sync-rooms API to update floor aggregates
      if (propertyId > 0 && propertyDetailsId > 0) {
        const syncResult = await syncRoomsForPropertyDetailsAction(propertyId, propertyDetailsId);
        if (syncResult.success) {
          // Trigger Floor QC table refresh via onUpdate callback
          const updatedRooms = rooms.map((r, i) => i === editingIndex ? updatedRoom : r);
          const totalArea = updatedRooms.reduce((sum, room) => {
            const area = Number(room.total || room.totalAreaSqMtr || room.carpetArea || room.area || 0);
            return sum + area;
          }, 0);
          const builtUpArea = updatedRooms.reduce((sum, room) => {
            const area = Number(room.builtUpArea || room.total || room.totalAreaSqMtr || room.area || 0);
            return sum + area;
          }, 0);
          if (props.onUpdate) {
            try {
              props.onUpdate({
                floorNumber: String(propertyDetailsId),
                rooms: updatedRooms,
                totalAreaSqM: totalArea,
                builtUpAreaSqM: builtUpArea,
                roomCount: updatedRooms.length,
              });
            } catch {
              // onUpdate errors are non-critical
            }
          }
        }
      }

      toast.success("Room updated successfully");
      handleCancelEdit();
    });
  };

  // ─── DELETE ───────────────────────────────────────────────────────────────

  const handleDelete = (index: number) => {
    const roomToDelete = rooms[index];
    if (!roomToDelete) return;

    const dbId = roomToDelete.id || roomToDelete.roomWiseSubmissionId;

    confirm({
      variant: "delete",
      title: t("roomSubmission.table.delete"),
      description:
        t("roomSubmission.validation.deleteConfirm") ||
        "Are you sure you want to delete this room? This will also remove all associated offsets.",
      confirmText: t("roomSubmission.table.delete"),
      cancelText: t("roomSubmission.table.cancel"),
      onConfirm: async () => {
        if (dbId && Number(dbId) > 0) {
          const result = await deleteRoomWiseSubmissionAction(Number(dbId));
          if (!result.success) {
            toast.error(
              (result as { error?: string }).error || "Failed to delete room"
            );
            return;
          }

          // Call sync-rooms after successful delete
          if (propertyId > 0 && propertyDetailsId > 0) {
            const syncResult = await syncRoomsForPropertyDetailsAction(propertyId, propertyDetailsId);
            if (!syncResult.success) {
              toast.error(
                (syncResult as { error?: string }).error || "Failed to sync rooms"
              );
            } else {
              // Trigger Floor QC table refresh via onUpdate callback
              if (props.onUpdate) {
                try {
                  await (props.onUpdate as unknown as (...a: unknown[]) => Promise<void>)({
                    totalAreaSqM: 0, // Will be recalculated by sync-rooms
                    roomCount: rooms.length - 1, // One room deleted
                  });
                } catch {
                  // onUpdate errors are non-critical
                }
              }
            }
          }
        }

        // Calculate remaining rooms data for floor QC update
        const remainingRooms = rooms.filter((_, i) => i !== index);
        const remainingRoomCount = remainingRooms.length;
        // Calculate total area from remaining rooms
        const totalAreaAfterDelete = remainingRooms.reduce((sum, room) => {
          const area = Number(room.total || room.totalAreaSqMtr || room.carpetArea || room.area || 0);
          return sum + area;
        }, 0);
        // Calculate built-up area from remaining rooms
        const builtUpAreaAfterDelete = remainingRooms.reduce((sum, room) => {
          const area = Number(room.builtUpArea || room.total || room.totalAreaSqMtr || room.area || 0);
          return sum + area;
        }, 0);

        // Update local state first
        setRooms(
          remainingRooms.map((r, i) => ({ ...r, roomNo: (i + 1).toString() }))
        );

        // Trigger Floor QC table refresh via onUpdate callback with calculated values
        // This will call syncRoomsForPropertyDetailsAction and hookRefetchFloorQC
        if (props.onUpdate && propertyId > 0 && propertyDetailsId > 0) {
          try {
            props.onUpdate({
              floorNumber: String(propertyDetailsId),
              rooms: remainingRooms,
              totalAreaSqM: totalAreaAfterDelete,
              builtUpAreaSqM: builtUpAreaAfterDelete,
              roomCount: remainingRoomCount,
            });
          } catch {
            // onUpdate errors are non-critical, floor QC will still be refreshed
          }
        }

        toast.success(
          t("roomSubmission.success.deleted") || "Room deleted successfully"
        );

        if (editingIndex === index) {
          handleCancelEdit();
        }
      },
    });
  };

  return { handleAddRoom, handleUpdateRoom, handleDelete, isPending };
};
