import { apiClient } from '@/services/api.service';
import { ApiResponse } from '@/types/common.types';
import { ScreenGroupMaster, ScreenMaster, SidebarDataResponse } from '@/types/sidebar-navigation.types';

class SidebarNavigationService {
  async getScreenGroups(): Promise<ApiResponse<SidebarDataResponse<ScreenGroupMaster>>> {
    return apiClient.get<SidebarDataResponse<ScreenGroupMaster>>('/ScreenGroupMaster');
  }

  async getScreens(): Promise<ApiResponse<SidebarDataResponse<ScreenMaster>>> {
    return apiClient.get<SidebarDataResponse<ScreenMaster>>('/ScreenMaster');
  }
}

export const sidebarNavigationService = new SidebarNavigationService();
