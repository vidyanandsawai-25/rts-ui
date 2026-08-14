import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/services/api.service';
import { municipalAssetRegisterServerService } from '@/lib/api/asset/asset-register/municipal-asset-register.server.service';

vi.mock('@/services/api.service', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('municipalAssetRegisterServerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssetRegisterPage', () => {
    it('sends correct query parameters for default options', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: { items: [], totalCount: 0 } });
      await municipalAssetRegisterServerService.getAssetRegisterPage();
      
      expect(apiClient.get).toHaveBeenCalledWith('/AssetMaster?PageNumber=1&PageSize=10&IsActive=true');
    });

    it('sends category and type query parameters when provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: { items: [], totalCount: 0 } });
      await municipalAssetRegisterServerService.getAssetRegisterPage({
        assetCategoryId: 10,
        assetTypeId: '2,3',
      });
      
      expect(apiClient.get).toHaveBeenCalledWith(
        '/AssetMaster?PageNumber=1&PageSize=10&IsActive=true&AssetCategoryId=10&AssetTypeId=2&AssetTypeId=3'
      );
    });

    it('sends sorting options', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: { items: [], totalCount: 0 } });
      await municipalAssetRegisterServerService.getAssetRegisterPage({
        sortBy: 'AssetName',
        sortOrder: 'desc',
      });
      
      expect(apiClient.get).toHaveBeenCalledWith(
        '/AssetMaster?PageNumber=1&PageSize=10&IsActive=true&SortBy=AssetName&SortOrder=desc'
      );
    });
  });

  describe('getAssetCategories', () => {
    it('unwraps items on success', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: { items: [{ id: 1, categoryName: 'Building' }] },
      });

      const res = await municipalAssetRegisterServerService.getAssetCategories();
      expect(res.success).toBe(true);
      expect(res.data).toEqual([{ id: 1, categoryName: 'Building' }]);
    });

    it('returns empty array when items is missing', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: {},
      });

      const res = await municipalAssetRegisterServerService.getAssetCategories();
      expect(res.data).toEqual([]);
    });
  });

  describe('getAssetTypesByCategory', () => {
    it('sets category ID query parameter', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: { items: [] } });
      await municipalAssetRegisterServerService.getAssetTypesByCategory(5);

      expect(apiClient.get).toHaveBeenCalledWith('/AssetType?IsActive=true&PageSize=-1&AssetCategoryId=5');
    });
  });

  describe('getWardsByZone', () => {
    it('appends ZoneId when valid', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: { items: [] } });
      await municipalAssetRegisterServerService.getWardsByZone(2);

      expect(apiClient.get).toHaveBeenCalledWith('/Ward?PageSize=-1&ZoneId=2');
    });

    it('does not append ZoneId when zoneId is all', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: { items: [] } });
      await municipalAssetRegisterServerService.getWardsByZone('all');

      expect(apiClient.get).toHaveBeenCalledWith('/Ward?PageSize=-1');
    });
  });

  describe('getDocumentViewUrl', () => {
    it('encodes documentGuid into url correctly', () => {
      const url = municipalAssetRegisterServerService.getDocumentViewUrl('some-guid-123');
      expect(url).toBe('/api/documents/some-guid-123/view');
    });
  });
});
