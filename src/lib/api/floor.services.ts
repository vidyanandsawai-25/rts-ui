/**
 * Floor & SubFloor Services - Backward Compatibility
 * 
 * This file re-exports from the new split service files.
 * Existing imports will continue to work.
 * 
 * For new code, import directly from:
 * - floor.service.ts for Floor operations
 * - subfloor.service.ts for SubFloor operations
 */

// Re-export Floor services
export {
  ApiError,
  getFloorPaged,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
} from './floor.service';

// Re-export SubFloor services
export {
  getSubFloorPaged,
  getSubFloorById,
  createSubFloor,
  updateSubFloor,
  deleteSubFloor,
} from './subfloor.service';
