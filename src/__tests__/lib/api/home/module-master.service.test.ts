import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PagedResponse } from '@/types/common.types';

// Mock the apiClient
const mockApiClientGet = vi.fn();
vi.mock('@/services/api.service', () => ({
    apiClient: {
        get: (...args: unknown[]) => mockApiClientGet(...args),
    },
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Import after mocks are set up
import { getModuleMaster } from '@/lib/api/home/module-master.service';
import { ModuleMaster } from '@/types/home/module-master.types';
import { ApiError } from '@/lib/utils/api';

const createMockApiModule = (overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> => ({
    id: 1,
    departmentId: 1,
    moduleCode: 'pt',
    moduleName: 'Property Tax',
    moduleNameLocal: 'संपत्ती कर',
    moduleIcon: 'pt',
    moduleLabel: 'Property Tax',
    moduleDescription: 'Property Tax Module',
    departmentName: 'Revenue Department',
    isActive: true,
    createdDate: '2024-01-01',
    updatedDate: null,
    ...overrides,
});

describe('getModuleMaster Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('successful responses', () => {
        it('returns normalized modules from API response', async () => {
            const mockResponse = {
                success: true,
                statusCode: 200,
                data: {
                    items: [
                        createMockApiModule({ id: 1, moduleCode: 'pt' }),
                        createMockApiModule({ id: 2, moduleCode: 'wt' }),
                    ],
                    totalCount: 2,
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 1,
                    hasPrevious: false,
                    hasNext: false,
                },
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            const result: PagedResponse<ModuleMaster> = await getModuleMaster();

            expect(mockApiClientGet).toHaveBeenCalledWith('/ModuleMaster');
            expect(result.items).toHaveLength(2);
            expect(result.items[0].moduleCode).toBe('pt');
            expect(result.items[1].moduleCode).toBe('wt');
        });

        it('normalizes PascalCase API response to camelCase', async () => {
            const mockResponse = {
                success: true,
                statusCode: 200,
                data: {
                    items: [
                        {
                            Id: 1,
                            DepartmentId: 1,
                            ModuleCode: 'PT',
                            ModuleName: 'Property Tax',
                            ModuleNameLocal: 'संपत्ती कर',
                            ModuleIcon: 'pt',
                            ModuleLabel: 'Property Tax',
                            ModuleDescription: 'Description',
                            DepartmentName: 'Revenue',
                            IsActive: true,
                            CreatedDate: '2024-01-01',
                            UpdatedDate: null,
                        },
                    ],
                    totalCount: 1,
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 1,
                    hasPrevious: false,
                    hasNext: false,
                },
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            const result = await getModuleMaster();

            expect(result.items[0].id).toBe(1);
            expect(result.items[0].moduleCode).toBe('PT');
            expect(result.items[0].moduleName).toBe('Property Tax');
        });

        it('filters out invalid items from response', async () => {
            const mockResponse = {
                success: true,
                statusCode: 200,
                data: {
                    items: [
                        createMockApiModule({ id: 1, moduleCode: 'pt' }),
                        { id: 'invalid', moduleCode: '' }, // Invalid - should be filtered
                        createMockApiModule({ id: 2, moduleCode: 'wt' }),
                    ],
                    totalCount: 3,
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 1,
                    hasPrevious: false,
                    hasNext: false,
                },
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            const result = await getModuleMaster();

            expect(result.items).toHaveLength(2);
        });
    });

    describe('error handling', () => {
        it('throws ApiError when API returns unsuccessful response', async () => {
            const mockResponse = {
                success: false,
                statusCode: 500,
                error: 'Internal Server Error',
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            await expect(getModuleMaster()).rejects.toThrow(ApiError);
        });

        it('throws ApiError when response data is missing items array', async () => {
            const mockResponse = {
                success: true,
                statusCode: 200,
                data: {
                    totalCount: 0,
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 0,
                    hasPrevious: false,
                    hasNext: false,
                    // items is missing
                },
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            await expect(getModuleMaster()).rejects.toThrow('Invalid data structure');
        });

        it('throws ApiError when items is not an array', async () => {
            const mockResponse = {
                success: true,
                statusCode: 200,
                data: {
                    items: 'not-an-array',
                    totalCount: 0,
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 0,
                    hasPrevious: false,
                    hasNext: false,
                },
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            await expect(getModuleMaster()).rejects.toThrow('Invalid data structure');
        });

        it('propagates network errors', async () => {
            mockApiClientGet.mockRejectedValue(new Error('Network error'));

            await expect(getModuleMaster()).rejects.toThrow('Network error');
        });

        it('throws ApiError with 401 for unauthorized access', async () => {
            const mockResponse = {
                success: false,
                statusCode: 401,
                error: 'Unauthorized',
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            await expect(getModuleMaster()).rejects.toThrow(ApiError);
        });
    });

    describe('edge cases', () => {
        it('handles empty items array correctly', async () => {
            const mockResponse = {
                success: true,
                statusCode: 200,
                data: {
                    items: [],
                    totalCount: 0,
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 0,
                    hasPrevious: false,
                    hasNext: false,
                },
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            const result = await getModuleMaster();

            expect(result.items).toHaveLength(0);
        });

        it('preserves pagination metadata in response', async () => {
            const mockResponse = {
                success: true,
                statusCode: 200,
                data: {
                    items: [createMockApiModule()],
                    totalCount: 100,
                    pageNumber: 2,
                    pageSize: 10,
                    totalPages: 10,
                    hasPrevious: true,
                    hasNext: true,
                },
            };

            mockApiClientGet.mockResolvedValue(mockResponse);

            const result = await getModuleMaster();

            expect(result.totalCount).toBe(100);
            expect(result.pageNumber).toBe(2);
            expect(result.totalPages).toBe(10);
            expect(result.hasPrevious).toBe(true);
            expect(result.hasNext).toBe(true);
        });
    });
});
