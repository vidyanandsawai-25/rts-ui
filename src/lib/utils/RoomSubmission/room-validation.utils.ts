import { RoomData } from "@/types/room-details.types";

export const validateRoomDetails = (
  roomData: Partial<RoomData>, 
  availableRooms: number | null,
  baseArea: number
) => {
  const errors: Record<string, string> = {};
  
  // 1. Room Number Validation
  if (!roomData.roomNo) {
    errors.roomNo = "roomSubmission.validation.enterRoomNumber";
  }
  
  // 2. Capacity Validation
  const requestedCount = parseInt(String(roomData.roomCount || "1")) || 1;
  if (availableRooms !== null && requestedCount > availableRooms) {
    errors.roomCount = "roomSubmission.validation.insufficientEmptySlots";
  }

  // 3. Room Type Validation
  if (!roomData.roomType || roomData.roomType === "-Select-" || roomData.roomType.trim() === "") {
    errors.roomType = "roomSubmission.validation.roomTypeRequired";
  }

  // 4. Dimension/Area Validation
  if ((!roomData.shape || roomData.shape === "-Select-") && baseArea <= 0) {
    errors.area = "roomSubmission.validation.selectShapeOrEnterArea";
  } else if (roomData.shape && roomData.shape !== "-Select-" && baseArea <= 0) {
    errors.shape = "roomSubmission.validation.enterValidDimensions";
  }
  
  return {
    success: Object.keys(errors).length === 0,
    errors
  };
};
