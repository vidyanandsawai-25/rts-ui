import { RoomSubmissionItem, RoomData } from "@/types/room-details.types";

/**
 * Maps UI RoomData to API RoomSubmissionItem payload
 * Converts form data structure to API-expected format
 */
export const mapRoomDataToApi = (room: RoomData): RoomSubmissionItem => {
  // Helper to safely access dynamic properties from RoomData's index signature
  const getRoomProp = (key: string): unknown => room[key];
  
  return {
    roomWiseSubmissionId: room.id !== undefined && room.id !== null ? Number(room.id) : undefined,
    isActive: true,
    roomNo: (getRoomProp('roomNo') as string) || '',
    lengthMtr: parseFloat(String(getRoomProp('lengthMtr') || room.length || 0)),
    widthMtr: parseFloat(String(getRoomProp('widthMtr') || getRoomProp('width') || 0)),
    heightMtr: parseFloat(String(getRoomProp('heightMtr') || room.height || 0)),
    baseMtr: parseFloat(String(getRoomProp('baseMtr') || getRoomProp('base1Mtr') || getRoomProp('base') || 0)),
    base2Mtr: parseFloat(String(getRoomProp('base2Mtr') || getRoomProp('base2') || 0)),
    breadth: parseFloat(String(room.breadth || 0)),
    totalAreaSqMtr: parseFloat(String(getRoomProp('total') || room.area || 0)),
    noOfRooms: Number(getRoomProp('roomCount')) || 1,
    roomType: (getRoomProp('utilities') as string) || 'Residential',
    shape: room.shape || 'Rectangle',
    outerYesNo: getRoomProp('outer') === 'Yes',
    minusYesNo: (room.offsets?.length || 0) > 0,
    roomWiseMinusData: (room.offsets || []).map(o => {
      // Helper to safely access dynamic properties from OffsetData's index signature
      const getOffsetProp = (key: string): unknown => o[key];
      
      return {
        id: o.id !== undefined && o.id !== null ? Number(o.id) : undefined,
        areaSqMtr: parseFloat(String(o.area || 0)),
        shape: o.shape || 'Rectangle',
        lengthMtr: parseFloat(String(getOffsetProp('lengthMtr') || getOffsetProp('length') || 0)),
        widthMtr: parseFloat(String(getOffsetProp('widthMtr') || getOffsetProp('width') || 0)),
        heightMtr: parseFloat(String(getOffsetProp('heightMtr') || getOffsetProp('height') || 0)),
        baseMtr: parseFloat(String(getOffsetProp('baseMtr') || getOffsetProp('base1Mtr') || getOffsetProp('base') || 0)),
        base2Mtr: parseFloat(String(getOffsetProp('base2Mtr') || getOffsetProp('base2') || 0)),
        breadth: parseFloat(String(getOffsetProp('breadth') || 0)),
        offsetValue: parseFloat(String(getOffsetProp('offsetValue') || 0)),
        offsetArea: parseFloat(String(getOffsetProp('offsetArea') || 0)),
      };
    }),
  };
};
