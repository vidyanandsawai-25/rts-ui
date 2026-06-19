'use client';

import React from "react";

import { RoomWiseSubmissionProps } from "@/types/room-details.types";
import { FullOffSetFormProps } from "@/types/offset-details.types";
import type { DrawerFloorDataRow } from "@/hooks/apartmentQc/propertyEditScreenDrawer.types";
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
import { MasterTable } from "@/components/common";


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
    handleOffsetClose: offsetActions.handleOffsetClose,
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

          {/* Selected floor row from Floor QC table */}
          {props.selectedFloorRow && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <MasterTable<DrawerFloorDataRow>
                columns={[
                  {
                    key: "floorId",
                    label: "Floor",
                    render: (_: unknown, row: DrawerFloorDataRow) => {
                      const id = row.floorId;
                      const lookup = props.floorLookup || [];
                      const item = lookup.find((i) => String(i.value) === String(id));
                      return item ? item.label : (id || "-");
                    },
                    headerClassName: "text-center",
                    cellClassName: "text-center font-bold text-slate-700"
                  },
                  {
                    key: "conYear",
                    label: "Con. Year",
                    render: (val: unknown) => (val as string | number) || "-",
                    headerClassName: "text-center",
                    cellClassName: "text-center font-semibold"
                  },
                  {
                    key: "asstYear",
                    label: "Asst. Year",
                    render: (val: unknown) => (val as string | number) || "-",
                    headerClassName: "text-center",
                    cellClassName: "text-center font-semibold"
                  },
                  {
                    key: "constructionTypeId",
                    label: "Construction Type",
                    render: (_: unknown, row: DrawerFloorDataRow) => {
                      const id = row.constructionTypeId;
                      const lookup = props.constructionLookup || [];
                      const item = lookup.find((i) => String(i.value) === String(id));
                      return item ? item.label : (id || "-");
                    },
                    headerClassName: "text-center",
                    cellClassName: "text-center font-semibold"
                  },
                  {
                    key: "typeOfUseId",
                    label: "Type of Use",
                    render: (_: unknown, row: DrawerFloorDataRow) => {
                      const id = row.typeOfUseId;
                      const lookup = props.useLookup || [];
                      const item = lookup.find((i) => String(i.value) === String(id));
                      return item ? item.label : (id || "-");
                    },
                    headerClassName: "text-center",
                    cellClassName: "text-center font-semibold"
                  },
                  {
                    key: "subTypeOfUseId",
                    label: "Sub Type",
                    render: (_: unknown, row: DrawerFloorDataRow) => {
                      const id = row.subTypeOfUseId;
                      const lookup = props.subTypeLookup || [];
                      const item = lookup.find((i) => String(i.value) === String(id));
                      return item ? item.label : (id || "-");
                    },
                    headerClassName: "text-center",
                    cellClassName: "text-center font-semibold"
                  },
                  {
                    key: "noOfRooms",
                    label: "Rooms",
                    render: (val: unknown) => (val as string | number) ?? "-",
                    headerClassName: "text-center",
                    cellClassName: "text-center font-semibold"
                  },
                  {
                    key: "area",
                    label: "Area",
                    render: (val: unknown) => (val as string | number) ?? "-",
                    headerClassName: "text-center",
                    cellClassName: "text-center font-bold text-slate-800"
                  }
                ]}
                data={[props.selectedFloorRow]}
                headerTitle={props.t?.('floorQC.selectedFloorDetails') || 'Selected Floor Row'}
                containerClassName="rounded-xl overflow-hidden shadow-sm pt-0"
                tableClassName="text-xs"
              />
            </div>
          )}

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
