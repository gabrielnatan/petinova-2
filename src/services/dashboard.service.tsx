import { dashboardAPI, type DashboardLayout } from '../lib/api/dashboard';

class DashboardService {
  async getLayout() {
    try {
      const response = await dashboardAPI.getLayout();
      return {
        success: true,
        data: response.layout,
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar layout do dashboard:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar layout'
      };
    }
  }

  async saveLayout(layout: DashboardLayout) {
    try {
      const response = await dashboardAPI.saveLayout(layout);
      return {
        success: true,
        data: response.layout,
        error: null
      };
    } catch (error) {
      console.error('Erro ao salvar layout do dashboard:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao salvar layout'
      };
    }
  }
}

export const dashboardService = new DashboardService();
