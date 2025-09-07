import { apiClient } from './client';

export interface DashboardLayout {
  widgets: Array<{
    id: string;
    type: string;
    visible: boolean;
    position: { x: number; y: number };
    size: { w: number; h: number };
  }>;
}

export interface DashboardLayoutResponse {
  layout: DashboardLayout | null;
}

export interface SaveLayoutRequest {
  layout: DashboardLayout;
}

export interface SaveLayoutResponse {
  success: boolean;
  layout: DashboardLayout;
}

class DashboardAPI {
  async getLayout(): Promise<DashboardLayoutResponse> {
    return apiClient.get<DashboardLayoutResponse>('/api/dashboard/layout');
  }

  async saveLayout(layout: DashboardLayout): Promise<SaveLayoutResponse> {
    return apiClient.post<SaveLayoutResponse>('/api/dashboard/layout', { layout });
  }
}

export const dashboardAPI = new DashboardAPI();


