import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock apiClient BEFORE importing services ──────────────────────────────────
vi.mock('@/services/api.service', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/services/api.service';
import {
  ApiError,
  getFloorPaged,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  getSubFloorPaged,
  getSubFloorById,
  createSubFloor,
  updateSubFloor,
  deleteSubFloor,
} from '@/lib/api/floor.services';
import type { FloorFormModel, SubFloorFormModel } from '@/types/floor.types';

// ── Shared helpers ────────────────────────────────────────────────────────────
const makeFloorItem = (overrides = {}) => ({
  id: 1,
  floorCode: 'GF',
  description: 'Ground Floor',
  sequenceNo: 1,
  isActive: true,
  createdDate: '2024-01-01',
  updatedDate: null,
  ...overrides,
});

const makeSubFloorItem = (overrides = {}) => ({
  id: 1,
  subFloorCode: 'B1',
  description: 'Basement 1',
  isActive: true,
  createdDate: '2024-01-01',
  updatedDate: null,
  ...overrides,
});

const makePagedRaw = (items: unknown[]) => ({
  items,
  totalCount: items.length,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
});

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

// ═════════════════════════════════════════════════════════════════════════════
// FLOOR SERVICES
// ═════════════════════════════════════════════════════════════════════════════

describe('floor.services — getFloorPaged', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns normalized paged floor data', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([makeFloorItem()]),
    });

    const result = await getFloorPaged(1, 10);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(1);
    expect(result.items[0].floorCode).toBe('GF');
    expect(result.items[0].isActive).toBe(true);
    expect(result.totalCount).toBe(1);
  });

  it('passes search term and sort params to API', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([]),
    });

    await getFloorPaged(1, 10, 'ground', 'floorCode', 'asc');

    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('SearchTerm=ground');
    expect(url).toContain('SortBy=floorCode');
    expect(url).toContain('SortOrder=asc');
  });

  it('throws ApiError when API returns success: false', async () => {
    mockGet.mockResolvedValue({ success: false, error: 'Server error' });

    await expect(getFloorPaged(1, 10)).rejects.toThrow();
  });

  it('throws ApiError on invalid response format (not paged)', async () => {
    mockGet.mockResolvedValue({ success: true, data: { wrong: 'format' } });

    await expect(getFloorPaged(1, 10)).rejects.toThrow();
  });

  it('throws ApiError when item has invalid id', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([{ ...makeFloorItem(), id: -1 }]),
    });

    await expect(getFloorPaged(1, 10)).rejects.toThrow('Invalid id');
  });

  it('throws ApiError when item has missing floorCode', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([{ ...makeFloorItem(), floorCode: '' }]),
    });

    await expect(getFloorPaged(1, 10)).rejects.toThrow('Missing floorCode');
  });
});

describe('floor.services — getFloorById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a normalized floor object', async () => {
    mockGet.mockResolvedValue({ success: true, data: makeFloorItem() });

    const result = await getFloorById(1);

    expect(result.id).toBe(1);
    expect(result.floorCode).toBe('GF');
  });

  it('throws when id is 0 or negative', async () => {
    await expect(getFloorById(0)).rejects.toThrow('Valid Floor ID is required');
    await expect(getFloorById(-5)).rejects.toThrow('Valid Floor ID is required');
  });

  it('throws when API returns success: false', async () => {
    mockGet.mockResolvedValue({ success: false, error: 'Not found' });

    await expect(getFloorById(1)).rejects.toThrow();
  });

  it('throws when response data is invalid shape', async () => {
    mockGet.mockResolvedValue({ success: true, data: { notAFloor: true } });

    await expect(getFloorById(1)).rejects.toThrow();
  });
});

describe('floor.services — createFloor', () => {
  beforeEach(() => vi.clearAllMocks());

  const validPayload: FloorFormModel = {
    floorCode: 'GF',
    description: 'Ground Floor',
    sequenceNo: 1,
    isActive: true,
  };

  it('calls POST /Floor with correct trimmed payload', async () => {
    mockPost.mockResolvedValue({ success: true });

    await createFloor(validPayload);

    expect(mockPost).toHaveBeenCalledWith(
      '/Floor',
      expect.objectContaining({ floorCode: 'GF', description: 'Ground Floor', sequenceNo: 1 })
    );
  });

  it('throws when floorCode is empty', async () => {
    await expect(createFloor({ ...validPayload, floorCode: '' })).rejects.toThrow(
      'floorCode required'
    );
  });

  it('throws when description is empty', async () => {
    await expect(createFloor({ ...validPayload, description: '   ' })).rejects.toThrow(
      'description required'
    );
  });

  it('throws ApiError when API returns success: false', async () => {
    mockPost.mockResolvedValue({ success: false, statusCode: 409, error: 'Conflict' });

    await expect(createFloor(validPayload)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('floor.services — updateFloor', () => {
  beforeEach(() => vi.clearAllMocks());

  const validPayload: FloorFormModel = {
    id: 1,
    floorCode: 'GF',
    description: 'Ground Floor',
    sequenceNo: 1,
    isActive: true,
  };

  it('calls PUT /Floor/:id with correct payload', async () => {
    mockPut.mockResolvedValue({ success: true });

    await updateFloor(validPayload);

    expect(mockPut).toHaveBeenCalledWith(
      '/Floor/1',
      expect.objectContaining({ id: 1, floorCode: 'GF' })
    );
  });

  it('throws when id is missing', async () => {
    await expect(updateFloor({ ...validPayload, id: undefined })).rejects.toThrow(
      'Floor ID required'
    );
  });

  it('throws when floorCode is empty', async () => {
    await expect(updateFloor({ ...validPayload, floorCode: '' })).rejects.toThrow(
      'floorCode required'
    );
  });

  it('throws ApiError on API failure', async () => {
    mockPut.mockResolvedValue({ success: false, error: 'Update failed' });

    await expect(updateFloor(validPayload)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('floor.services — deleteFloor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls DELETE /Floor/:id', async () => {
    mockDelete.mockResolvedValue({ success: true });

    await deleteFloor(3);

    expect(mockDelete).toHaveBeenCalledWith('/Floor/3');
  });

  it('throws when id is 0 or negative', async () => {
    await expect(deleteFloor(0)).rejects.toThrow('Valid Floor ID required');
    await expect(deleteFloor(-1)).rejects.toThrow('Valid Floor ID required');
  });

  it('throws ApiError on API failure', async () => {
    mockDelete.mockResolvedValue({ success: false, statusCode: 409, error: 'In use' });

    await expect(deleteFloor(1)).rejects.toBeInstanceOf(ApiError);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUBFLOOR SERVICES
// ═════════════════════════════════════════════════════════════════════════════

describe('floor.services — getSubFloorPaged', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns normalized paged subfloor data', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([makeSubFloorItem()]),
    });

    const result = await getSubFloorPaged(1, 10);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(1);
    expect(result.items[0].subFloorCode).toBe('B1');
  });

  it('passes search term to API URL', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([]),
    });

    await getSubFloorPaged(1, 10, 'basement');

    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('SearchTerm=basement');
  });

  it('throws on API failure', async () => {
    mockGet.mockResolvedValue({ success: false, error: 'error' });

    await expect(getSubFloorPaged(1, 10)).rejects.toThrow();
  });

  it('throws when item has invalid subFloorId', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([{ ...makeSubFloorItem(), subFloorId: 0 }]),
    });

    await expect(getSubFloorPaged(1, 10)).rejects.toThrow('Invalid subFloorId');
  });

  it('throws when item has missing subFloorCode', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: makePagedRaw([{ ...makeSubFloorItem(), subFloorCode: '' }]),
    });

    await expect(getSubFloorPaged(1, 10)).rejects.toThrow('Missing subFloorCode');
  });
});

describe('floor.services — getSubFloorById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns normalized subfloor', async () => {
    mockGet.mockResolvedValue({ success: true, data: makeSubFloorItem() });

    const result = await getSubFloorById(1);

    expect(result.subFloorId).toBe(1);
    expect(result.subFloorCode).toBe('B1');
  });

  it('throws for invalid ID', async () => {
    await expect(getSubFloorById(0)).rejects.toThrow('Valid SubFloor ID is required');
  });

  it('throws on API failure', async () => {
    mockGet.mockResolvedValue({ success: false, error: 'Not found' });

    await expect(getSubFloorById(1)).rejects.toThrow();
  });
});

describe('floor.services — createSubFloor', () => {
  beforeEach(() => vi.clearAllMocks());

  const validPayload: SubFloorFormModel = {
    subFloorCode: 'B1',
    description: 'Basement 1',
    isActive: true,
  };

  it('calls POST /SubFloor with correct payload', async () => {
    mockPost.mockResolvedValue({ success: true });

    await createSubFloor(validPayload);

    expect(mockPost).toHaveBeenCalledWith(
      '/SubFloor',
      expect.objectContaining({ subFloorCode: 'B1', description: 'Basement 1' })
    );
  });

  it('throws when subFloorCode is empty', async () => {
    await expect(createSubFloor({ ...validPayload, subFloorCode: '' })).rejects.toThrow(
      'subFloorCode required'
    );
  });

  it('throws when description is empty', async () => {
    await expect(createSubFloor({ ...validPayload, description: '' })).rejects.toThrow(
      'description required'
    );
  });

  it('throws ApiError on API failure', async () => {
    mockPost.mockResolvedValue({ success: false, statusCode: 500, error: 'fail' });

    await expect(createSubFloor(validPayload)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('floor.services — updateSubFloor', () => {
  beforeEach(() => vi.clearAllMocks());

  const validPayload: SubFloorFormModel = {
    subFloorId: 5,
    subFloorCode: 'B1',
    description: 'Basement 1',
    isActive: true,
  };

  it('calls PUT /SubFloor/:id with correct payload', async () => {
    mockPut.mockResolvedValue({ success: true });

    await updateSubFloor(validPayload);

    expect(mockPut).toHaveBeenCalledWith(
      '/SubFloor/5',
      expect.objectContaining({ subFloorId: 5, subFloorCode: 'B1' })
    );
  });

  it('throws when subFloorId is missing', async () => {
    await expect(updateSubFloor({ ...validPayload, subFloorId: undefined })).rejects.toThrow(
      'SubFloor ID required'
    );
  });

  it('throws when subFloorCode is empty', async () => {
    await expect(updateSubFloor({ ...validPayload, subFloorCode: '' })).rejects.toThrow(
      'subFloorCode required'
    );
  });

  it('throws ApiError on API failure', async () => {
    mockPut.mockResolvedValue({ success: false, error: 'fail' });

    await expect(updateSubFloor(validPayload)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('floor.services — deleteSubFloor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls DELETE /SubFloor/:id', async () => {
    mockDelete.mockResolvedValue({ success: true });

    await deleteSubFloor(5);

    expect(mockDelete).toHaveBeenCalledWith('/SubFloor/5');
  });

  it('throws when subFloorId is 0 or negative', async () => {
    await expect(deleteSubFloor(0)).rejects.toThrow('Valid SubFloor ID required');
    await expect(deleteSubFloor(-3)).rejects.toThrow('Valid SubFloor ID required');
  });

  it('throws ApiError on API failure', async () => {
    mockDelete.mockResolvedValue({ success: false, statusCode: 409, error: 'In use' });

    await expect(deleteSubFloor(1)).rejects.toBeInstanceOf(ApiError);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ApiError class
// ═════════════════════════════════════════════════════════════════════════════

describe('ApiError', () => {
  it('has correct name, statusCode, responseText, message', () => {
    const err = new ApiError(404, 'not found text', 'Not Found');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe('ApiError');
    expect(err.statusCode).toBe(404);
    expect(err.responseText).toBe('not found text');
    expect(err.message).toBe('Not Found');
  });
});
