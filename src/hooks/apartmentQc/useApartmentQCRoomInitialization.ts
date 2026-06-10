import { useEffect } from "react";
import { RoomWiseSubmissionProps, RoomAPIResponse } from "@/types/room-details.types";
import { ShapeParameters } from "@/types/common-details.types";
import {
  convertAreaUnit,
  convertDimension,
} from "@/lib/utils/RoomSubmission/room-calculation.util";
import { RoomSubmissionState } from "@/hooks/ptis/RoomSubmission/useRoomSubmissionState";

/**
 * Apartment QC–specific room initialization.
 *
 * Key difference from the shared useRoomInitialization:
 *   - Does NOT pre-allocate empty rows up to maxRooms.
 *   - Only loads the existingRooms passed in from the parent (fetched from API).
 *   - Does NOT auto-activate edit mode — drawer opens in "add" mode.
 */
export const useApartmentQCRoomInitialization = (
  state: RoomSubmissionState,
  props: Pick<
    RoomWiseSubmissionProps,
    "isOpen" | "existingRooms" | "externalAreaUnit"
  >
) => {
  const { isOpen, existingRooms } = props;
  const {
    setMounted,
    setRooms,
    setEditingIndex,
    setIsEditMode,
    prevAreaUnit,
    areaUnit,
    setPrevAreaUnit,
    setShapeParameters,
    setFormData,
  } = state;

  // 1. Mount flag
  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  // 2. Load existing rooms (no empty-row padding)
  useEffect(() => {
    if (!isOpen) {
      setRooms([]);
      setEditingIndex(null);
      setIsEditMode(false);
      return;
    }

    const source: RoomAPIResponse[] = existingRooms || [];

    const loaded = source.map((r, i) => {
      // Merge offsets from all possible sources
      const offsetsRaw = [
        ...(Array.isArray(r.offsets) ? r.offsets : []),
        ...(Array.isArray(r.roomWiseMinusData) ? r.roomWiseMinusData : []),
        ...(Array.isArray(r.minusRooms) ? r.minusRooms : []),
      ];

      // Deduplicate by id and filter out marked for deletion
      const seen = new Set<unknown>();
      const offsets = offsetsRaw
        .filter((o) => {
          const markedForDeletion = (o as Record<string, unknown>).MarkedForDeletion ?? (o as Record<string, unknown>).markedForDeletion;
          return markedForDeletion !== 1 && markedForDeletion !== true;
        })
        .map((o) => ({
          ...o,
          id: (o as Record<string, unknown>).roomWiseMinusId ?? o.id,
          operation:
            (o as Record<string, unknown>).isOffset === true
              ? "add"
              : (o as Record<string, unknown>).isOffset === false
              ? "subtract"
              : ((o as Record<string, unknown>).type as string) ||
                (o as Record<string, unknown>).operation as string ||
                "subtract",
          area:
            (o as Record<string, unknown>).area ??
            (o as Record<string, unknown>).areaSqMtr ??
            0,
          shape:
            (o as Record<string, unknown>).shapeType as string ||
            (o as Record<string, unknown>).shape as string ||
            "Rectangle",
        }))
        .filter((o) => {
          const key = o.id || JSON.stringify(o);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      return {
        ...r,
        tempId: r.tempId || `aqc-init-${Date.now()}-${i}`,
        roomNo: (i + 1).toString(),
        id: r.roomWiseSubmissionId ?? r.id,
        area: Number(r.area || 0),
        total: Number(r.total || 0),
        offsets,
      };
    });

    setRooms(loaded);
    // Intentionally NOT calling handleEdit — start in add mode.
  }, [isOpen, existingRooms, setRooms, setEditingIndex, setIsEditMode]);

  // 3. Area-unit conversion sync (same logic as useRoomInitialization)
  useEffect(() => {
    if (prevAreaUnit === areaUnit) return;

    const targetDimUnit = areaUnit === "sq.ft" ? "ft" : "m";
    const oldUnit = areaUnit === "sq.ft" ? "sq.m" : "sq.ft";

    setShapeParameters((prev: ShapeParameters) => {
      const next: Partial<ShapeParameters> = {};
      (Object.keys(prev) as Array<keyof ShapeParameters>).forEach((k) => {
        const val = prev[k];
        if (typeof val === "string") next[k] = convertDimension(val, targetDimUnit);
      });
      return next as ShapeParameters;
    });

    setFormData((prev) => {
      const isManualArea = !prev.shape || prev.shape === "-Select-";
      return {
        ...prev,
        length: isManualArea
          ? convertAreaUnit(
              parseFloat(prev.length || "0"),
              oldUnit,
              areaUnit
            ).toString()
          : convertDimension(prev.length || "", targetDimUnit),
        width: isManualArea
          ? prev.width || ""
          : convertDimension(prev.width || "", targetDimUnit),
      };
    });

    state.setRooms((prevRooms) =>
      prevRooms.map((room) => {
        const isManualArea = !room.shape || room.shape === "-Select-";
        return {
          ...room,
          area: convertAreaUnit(Number(room.area || 0), oldUnit, areaUnit),
          total: convertAreaUnit(Number(room.total || 0), oldUnit, areaUnit),
          length: isManualArea
            ? room.length
              ? convertAreaUnit(
                  parseFloat(String(room.length)),
                  oldUnit,
                  areaUnit
                ).toString()
              : ""
            : room.length
            ? convertDimension(String(room.length), targetDimUnit)
            : "",
          width: isManualArea
            ? room.width || ""
            : room.width
            ? convertDimension(String(room.width), targetDimUnit)
            : "",
          offsets: (room.offsets || []).map((o) => ({
            ...o,
            area: convertAreaUnit(o.area, oldUnit, areaUnit),
            length: o.length
              ? convertDimension(o.length as string, targetDimUnit)
              : undefined,
            width: o.width
              ? convertDimension(o.width as string, targetDimUnit)
              : undefined,
          })),
        };
      })
    );

    setPrevAreaUnit(areaUnit);
  }, [
    areaUnit,
    prevAreaUnit,
    setShapeParameters,
    setFormData,
    state,
    setPrevAreaUnit,
  ]);
};
