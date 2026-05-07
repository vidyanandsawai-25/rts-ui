import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the module-master.service before importing action
const mockGetModuleMaster = vi.fn();
vi.mock('@/lib/api/home/module-master.service', () => ({
    getModuleMaster: () => mockGetModuleMaster(),
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Import after mocks are set up
import { listServices, ListServicesResponse } from '@/app/[locale]/home/action';
import { ModuleMaster } from '@/types/home/module-master.types';

const createMockModule = (overrides: Partial<ModuleMaster> = {}): ModuleMaster => ({
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

describe('listServices Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('successful responses', () => {
        it('returns mapped services when API returns modules', async () => {
            const mockModules: ModuleMaster[] = [
                createMockModule({ id: 1, moduleCode: 'pt', moduleName: 'Property Tax' }),
                createMockModule({ id: 2, moduleCode: 'wt', moduleName: 'Water Tax' }),
            ];

            mockGetModuleMaster.mockResolvedValue({
                items: mockModules,
                totalCount: 2,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
                hasPrevious: false,
                hasNext: false,
            });

            const result: ListServicesResponse = await listServices('en');

            expect(result.services).toHaveLength(2);
            expect(result.error).toBeUndefined();
            expect(result.services[0].id).toBe(1);
            expect(result.services[0].title).toBe('Revenue Department');
            expect(result.services[0].link).toBe('/en/property-tax/ptis');
        });

        it('returns correct route for each module code', async () => {
            const mockModules: ModuleMaster[] = [
                createMockModule({ id: 1, moduleCode: 'pt' }),
                createMockModule({ id: 2, moduleCode: 'wt' }),
                createMockModule({ id: 3, moduleCode: 'gc' }),
            ];

            mockGetModuleMaster.mockResolvedValue({
                items: mockModules,
                totalCount: 3,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
                hasPrevious: false,
                hasNext: false,
            });

            const result = await listServices('en');

            expect(result.services[0].link).toBe('/en/property-tax/ptis');
            expect(result.services[1].link).toBe('/en/water-tax');
            expect(result.services[2].link).toBe('/en/garbage-collection');
        });

        it('returns localized routes based on locale parameter', async () => {
            const mockModules: ModuleMaster[] = [
                createMockModule({ id: 1, moduleCode: 'pt' }),
            ];

            mockGetModuleMaster.mockResolvedValue({
                items: mockModules,
                totalCount: 1,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
                hasPrevious: false,
                hasNext: false,
            });

            const resultHi = await listServices('hi');
            expect(resultHi.services[0].link).toBe('/hi/property-tax/ptis');

            const resultMr = await listServices('mr');
            expect(resultMr.services[0].link).toBe('/mr/property-tax/ptis');
        });

        it('uses moduleDescription as subtext when available', async () => {
            const mockModules: ModuleMaster[] = [
                createMockModule({
                    id: 1,
                    moduleCode: 'pt',
                    moduleDescription: 'Custom description for property tax',
                }),
            ];

            mockGetModuleMaster.mockResolvedValue({
                items: mockModules,
                totalCount: 1,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
                hasPrevious: false,
                hasNext: false,
            });

            const result = await listServices('en');

            expect(result.services[0].subtext).toBe('Custom description for property tax');
        });

        it('generates default subtext when moduleDescription is null', async () => {
            const mockModules: ModuleMaster[] = [
                createMockModule({
                    id: 1,
                    moduleCode: 'pt',
                    moduleName: 'Property Tax',
                    moduleDescription: null,
                }),
            ];

            mockGetModuleMaster.mockResolvedValue({
                items: mockModules,
                totalCount: 1,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
                hasPrevious: false,
                hasNext: false,
            });

            const result = await listServices('en');

            expect(result.services[0].subtext).toContain('Property Tax');
        });
    });

    describe('empty responses', () => {
        it('returns empty services array when API returns no modules', async () => {
            mockGetModuleMaster.mockResolvedValue({
                items: [],
                totalCount: 0,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 0,
                hasPrevious: false,
                hasNext: false,
            });

            const result = await listServices('en');

            expect(result.services).toHaveLength(0);
            expect(result.error).toBeUndefined();
        });

        it('handles null items array gracefully', async () => {
            mockGetModuleMaster.mockResolvedValue({
                items: null,
                totalCount: 0,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 0,
                hasPrevious: false,
                hasNext: false,
            });

            const result = await listServices('en');

            expect(result.services).toHaveLength(0);
            expect(result.error).toBeUndefined();
        });
    });

    describe('error handling', () => {
        it('returns error message when API throws an error', async () => {
            mockGetModuleMaster.mockRejectedValue(new Error('Network error'));

            const result = await listServices('en');

            expect(result.services).toHaveLength(0);
            expect(result.error).toBe('Failed to load services. Please try refreshing the page.');
        });

        it('returns error message when API throws ApiError', async () => {
            const apiError = {
                statusCode: 500,
                contextMessage: 'Server error',
                message: 'Internal Server Error',
            };
            mockGetModuleMaster.mockRejectedValue(apiError);

            const result = await listServices('en');

            expect(result.services).toHaveLength(0);
            expect(result.error).toBeDefined();
        });

        it('handles unknown error types gracefully', async () => {
            mockGetModuleMaster.mockRejectedValue('Unknown error string');

            const result = await listServices('en');

            expect(result.services).toHaveLength(0);
            expect(result.error).toBeDefined();
        });
    });
});
