'use client';

import React from "react";

import { RoomWiseSubmissionProps } from "@/types/room-details.types";
import { FullOffSetFormProps } from "@/types/offset-details.types";
import { OffSetSidebar } from "../floorSubmission/offset/OffSetSidebar";

// ── Reused state & pure-logic hooks (no Quick Data Entry–specific API calls) ──
import { useRoomSubmissionState } from "@/hooks/ptis/RoomSubmission/useRoomSubmissionState";
import { useRoomInputActions } from "@/hooks/ptis/RoomSubmission/useRoomInputActions";
import { useRoomEditActions } from "@/hooks/ptis/RoomSubmission/useRoomEditActions";
import { useApartmentQCOffsetActions } from "@/hooks/apartmentQc/useApartmentQCOffsetActions";

// ── Apartment QC–specific hooks (separated from QuickDataEntry) ──────────────
import { useApartmentQCRoomInitialization } from "@/hooks/apartmentQc/useApartmentQCRoomInitialization";
import { useApartmentQCRoomListActions } from "@/hooks/apartmentQc/useApartmentQCRoomListActions";
import { useApartmentQCRoomPersistenceActions } from "@/hooks/apartmentQc/useApartmentQCRoomPersistenceActions";

// ── Shared UI components (unchanged) ─────────────────────────────────────────
import { RoomSubmissionHeader } from "./components/RoomSubmissionHeader";
import { ApartmentQCRoomLayout } from "./ApartmentQCRoomLayout";
import { RoomSubmissionFooter } from "../../QuickDataEntry/floorSubmission/RoomSubmission/components/RoomSubmissionFooter";
import { InlineError } from "../../QuickDataEntry/floorSubmission/RoomSubmission/components/InlineError";

// ── Calculation utils (unchanged) ─────────────────────────────────────────────
import {
  calculateRoomArea,
  calculateRoomTotal,
  getDimensionsString,
  isOffsetValid,
} from "@/lib/utils/RoomSubmission/room-submission.utils";


export const RoomWiseSubmission: React.FC<
  RoomWiseSubmissionProps & {
    externalAreaUnit?: "sq.m" | "sq.ft";
    onExternalToggleUnit?: () => void;
  }
> = (props) => {
  const { isOpen, onClose, displayMode = "inline" } = props;

  // ── State bag (shared – no changes needed) ──────────────────────────────
  // Pass maxRooms=undefined so availableRooms stays null (no artificial cap).
  const state = useRoomSubmissionState(undefined, props.externalAreaUnit);

  // ── Pure-logic hooks (reused) ────────────────────────────────────────────
  const { handleEdit, handleCancelEdit } = useRoomEditActions(state);
  const { handleInputChange } = useRoomInputActions(state, null);
  const offsetActions = useApartmentQCOffsetActions(state, handleEdit);

  // ── Apartment QC initialization (no empty rows) ──────────────────────────
  useApartmentQCRoomInitialization(state, props);

  // ── Apartment QC CRUD (calls API immediately on each action) ─────────────
  const { handleAddRoom, handleUpdateRoom, handleDelete } =
    useApartmentQCRoomListActions(state, props, handleCancelEdit);

  // ── Apartment QC persistence (sync + close) ──────────────────────────────
  const { handleSaveData } = useApartmentQCRoomPersistenceActions(state, props);

  // ── Compose roomActions (satisfies RoomActions interface) ─────────────────
  const roomActions = {
    handleInputChange,
    handleEdit,
    handleCancelEdit,
    handleAddRoom,
    handleUpdateRoom,
    handleDelete,
    handleUpdate: handleSaveData, // "SAVE DATA" button
  };

  // ── Unit-toggle handler ────────────────────────────────────────────────────
  const handleToggleUnit = () => {
    if (props.onExternalToggleUnit) {
      props.onExternalToggleUnit();
    } else {
      state.setInternalAreaUnit((prev) =>
        prev === "sq.m" ? "sq.ft" : "sq.m"
      );
    }
  };

  // ── Drawer close: reset local state ───────────────────────────────────────
  const handleClose = () => {
    state.setValidationErrors({});
    state.setRooms([]);
    state.setEditingIndex(null);
    state.setIsEditMode(false);
    state.setOffsetModalOpen(false);
    onClose();
  };

  // ── Offset sidebar props (unchanged) ──────────────────────────────────────
  const fullOffSetProps: FullOffSetFormProps = {
    offsetModalOpen: state.offsetModalOpen,
    formData: state.formData,
    calculateAdjustedRoomTotal: offsetActions.calculateAdjustedRoomTotal,
    handleSubtractClick: offsetActions.handleSubtractClick,
    handleAddClick: offsetActions.handleAddClick,
    selectedOperation: state.selectedOperation,
    isShakingSubtract: state.isShakingSubtract,
    offsetData: state.offsetData,
    setOffsetValidationError: state.setOffsetValidationError,
    setSelectedOperation: state.setSelectedOperation,
    offsetValidationError: state.offsetValidationError,
    selectedShape: state.selectedShape,
    handleShapeChange: offsetActions.handleShapeChange,
    handleOffsetInputChange: offsetActions.handleOffsetInputChange,
    offsetList: state.offsetList,
    getDimensionsString,
    handleDeleteOffset: offsetActions.handleDeleteOffset,
    handleAddOffset: offsetActions.handleAddOffset,
    isOffsetDataValid: () => isOffsetValid(state.offsetData, state.selectedShape),
    handleOffsetOk: offsetActions.handleOffsetOk,
    handleOffsetClose: () => state.setOffsetModalOpen(false),
    areaUnit: state.areaUnit,
    shouldShake: state.shouldShake,
    deletingOffsetIndex: state.deletingOffsetIndex,
  };

  if (!state.mounted || !isOpen) return null;

  return (
    <div
      className={`w-full p-0 flex flex-col bg-white overflow-visible ${
        displayMode === "modal" ? "" : "mb-6"
      }`}
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="bg-white flex flex-col rounded-lg shadow-md border border-gray-200 overflow-visible">

          <RoomSubmissionHeader
            floorNumber={props.floorNumber}
            areaUnit={state.areaUnit}
            handleToggleUnit={handleToggleUnit}
            maxRooms={props.maxRooms}
            availableRooms={state.availableRooms}
            displayMode={displayMode}
          />

          {/* Apartment QC layout — uses always-editable InputBox and no empty-slot addNewRow */}
          <ApartmentQCRoomLayout
            displayMode={displayMode}
            state={state}
            actions={{ addNewRow: () => {} }}
            roomActions={roomActions}
            offsetActions={offsetActions}
            props={props}
            InlineError={InlineError}
            calculateArea={() => calculateRoomArea(state.formData, state.shapeParameters)}
            calculateTotal={calculateRoomTotal}
          />

          <RoomSubmissionFooter
            onSave={handleSaveData}
            onClose={handleClose}
            isSaving={state.isUpdating}
            canSave={state.grandTotal > 0}
          />

        </div>
      </form>
      <OffSetSidebar {...fullOffSetProps} />
    </div>
  );
};

export default RoomWiseSubmission;
