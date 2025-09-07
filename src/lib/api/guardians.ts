import { apiClient } from './client';

interface Guardian {
  guardian_id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  petsCount?: number;
  pets?: Array<{
    pet_id: string;
    name: string;
    species: string;
    breed?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface GuardianListResponse {
  guardians: Guardian[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface GuardianResponse {
  guardian: Guardian;
}

interface CreateGuardianData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

type UpdateGuardianData = Partial<CreateGuardianData>

class GuardianAPI {
  private baseURL = '/api/guardians';

  async getGuardians(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GuardianListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const url = `${this.baseURL}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiClient.get<GuardianListResponse>(url);
  }

  async getGuardian(id: string): Promise<GuardianResponse> {
    return apiClient.get<GuardianResponse>(`${this.baseURL}/${id}`);
  }

  async createGuardian(data: CreateGuardianData): Promise<GuardianResponse> {
    return apiClient.post<GuardianResponse>(this.baseURL, data);
  }

  async updateGuardian(id: string, data: UpdateGuardianData): Promise<GuardianResponse> {
    return apiClient.put<GuardianResponse>(`${this.baseURL}/${id}`, data);
  }

  async deleteGuardian(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.baseURL}/${id}`);
  }

  // Método utilitário para busca simples (usado em dropdowns)
  async searchGuardians(search: string): Promise<Guardian[]> {
    const response = await this.getGuardians({ search, limit: 50 });
    return response.guardians;
  }
}

export const guardianAPI = new GuardianAPI();
export type { Guardian, GuardianListResponse, GuardianResponse, CreateGuardianData, UpdateGuardianData };