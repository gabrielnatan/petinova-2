interface Guardian {
  guardian_id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  clinic_id: string;
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
  phone: string;
  cpf?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
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

    const response = await fetch(`${this.baseURL}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar tutores');
    }

    return response.json();
  }

  async getGuardian(id: string): Promise<GuardianResponse> {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar tutor');
    }

    return response.json();
  }

  async createGuardian(data: CreateGuardianData): Promise<GuardianResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar tutor');
    }

    return response.json();
  }

  async updateGuardian(id: string, data: UpdateGuardianData): Promise<GuardianResponse> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar tutor');
    }

    return response.json();
  }

  async deleteGuardian(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir tutor');
    }

    return response.json();
  }

  // Método utilitário para busca simples (usado em dropdowns)
  async searchGuardians(search: string): Promise<Guardian[]> {
    const response = await this.getGuardians({ search, limit: 50 });
    return response.guardians;
  }
}

export const guardianAPI = new GuardianAPI();
export type { Guardian, GuardianListResponse, GuardianResponse, CreateGuardianData, UpdateGuardianData };