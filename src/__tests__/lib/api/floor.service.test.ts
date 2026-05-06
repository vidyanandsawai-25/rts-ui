import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFloorRange } from '@/lib/api/floor.service';
import { apiClient } from '@/services/api.service';
import type { FloorRangePayload } from '@/types/floor.types';

// Mock the api service
vi.mock('@/services/api.service', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('createFloorRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload: FloorRangePayload = {
    rangeFrom: '1',
    rangeTo: '10',
    prefix: '',
    suffix: 'Floor',
    template: {
      isActive: true,
      floorCode: '0',
      description: '',
      sequenceNo: 1,
      maxFloorNo: 10,
    },
    startSequenceNo: 1,
  };

  it('should call apiClient.post with correct endpoint and payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ success: true });

    await createFloorRange(validPayload, '123');

    expect(apiClient.post).toHaveBeenCalledWith('/Floor/Range', {
      rangeFrom: '1',
      rangeTo: '10',
      prefix: '',
      suffix: 'Floor',
      template: {
        isActive: true,
        createdBy: 123,
        updatedBy: 123,
        floorCode: '0',
        description: '',
        sequenceNo: 1,
        maxFloorNo: 10,
      },
      startSequenceNo: 1,
    });
  });

  it('should throw error when rangeFrom is empty', async () => {
    const invalidPayload = { ...validPayload, rangeFrom: '' };
    
    await expect(createFloorRange(invalidPayload, '123')).rejects.toThrow('rangeFrom required');
  });

  it('should throw error when rangeTo is empty', async () => {
    const invalidPayload = { ...validPayload, rangeTo: '' };
    
    await expect(createFloorRange(invalidPayload, '123')).rejects.toThrow('rangeTo required');
  });

  it('should throw error when rangeFrom is greater than rangeTo', async () => {
    const invalidPayload = { ...validPayload, rangeFrom: '100', rangeTo: '10' };
    
    await expect(createFloorRange(invalidPayload, '123')).rejects.toThrow(
      'rangeFrom cannot be greater than rangeTo'
    );
  });

  it('should throw error when range values are not valid numbers', async () => {
    const invalidPayload = { ...validPayload, rangeFrom: 'abc', rangeTo: '10' };
    
    await expect(createFloorRange(invalidPayload, '123')).rejects.toThrow(
      'Range values must be valid numbers'
    );
  });

  it('should throw ApiError when API call fails', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ 
      success: false, 
      statusCode: 500, 
      error: 'Server error' 
    });

    await expect(createFloorRange(validPayload, '123')).rejects.toThrow();
  });

  it('should trim prefix and suffix values', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ success: true });

    const payloadWithSpaces = {
      ...validPayload,
      prefix: '  Test  ',
      suffix: '  Floor  ',
    };

    await createFloorRange(payloadWithSpaces, '123');

    expect(apiClient.post).toHaveBeenCalledWith('/Floor/Range', expect.objectContaining({
      prefix: 'Test',
      suffix: 'Floor',
    }));
  });

  it('should use rangeFrom as startSequenceNo when not provided', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ success: true });

    const payloadWithoutStartSeq = {
      ...validPayload,
      startSequenceNo: 0,
    };

    await createFloorRange(payloadWithoutStartSeq, '123');

    expect(apiClient.post).toHaveBeenCalledWith('/Floor/Range', expect.objectContaining({
      startSequenceNo: 1, // Should use rangeFrom value
    }));
  });

  it('should use rangeTo as maxFloorNo when template maxFloorNo is 0', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ success: true });

    const payloadWithZeroMaxFloor = {
      ...validPayload,
      template: {
        ...validPayload.template,
        maxFloorNo: 0,
        updatedBy: validPayload.template.updatedBy,
      },
    };

    await createFloorRange(payloadWithZeroMaxFloor, '123');

    expect(apiClient.post).toHaveBeenCalledWith('/Floor/Range', expect.objectContaining({
      template: expect.objectContaining({
        maxFloorNo: 10, // Should use rangeTo value
      }),
    }));
  });
});
