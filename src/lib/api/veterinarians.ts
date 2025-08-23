interface Stats {
  totalAppointments?: number;
  totalConsultations?: number;
  todayAppointments?: number;
  thisMonthConsultations?: number;
}

interface Veterinarian {
  veterinarian_id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  clinic_id: string;
  stats?: Stats;
  appointments?: Array<{
    id: string;
    date: string;
    status: string;
    pet: {
      id: string;
      name: string;
      species: string;
      breed?: string;
    };
    guardian: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  }>;
  consultations?: Array<{
    id: string;
    createdAt: string;
    diagnosis?: string;
    treatment?: string;
    pet: {
      id: string;
      name: string;
      species: string;
      breed?: string;
      guardian: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
    };
  }>;
  created_at: string;
  updated_at: string;
}

interface VeterinarianListResponse {
  veterinarians: Veterinarian[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface VeterinarianResponse {
  veterinarian: Veterinarian;
}

interface CreateVeterinarianData {
  name: string;
  email: string;
  password: string;
  role: 'VETERINARIAN' | 'ASSISTANT';
  active?: boolean;
}

type UpdateVeterinarianData = Partial<CreateVeterinarianData>

class VeterinarianAPI {
  private baseURL = '/api/veterinarians';

  async getVeterinarians(params?: {
    page?: number;
    limit?: number;
    search?: string;
    specialty?: string;
    isActive?: boolean;
  }): Promise<VeterinarianListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.specialty) searchParams.append('specialty', params.specialty);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

    const response = await fetch(`${this.baseURL}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar veterinários');
    }

    return response.json();
  }

  async getVeterinarian(id: string): Promise<VeterinarianResponse> {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar veterinário');
    }

    return response.json();
  }

  async createVeterinarian(data: CreateVeterinarianData): Promise<VeterinarianResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar veterinário');
    }

    return response.json();
  }

  async updateVeterinarian(id: string, data: UpdateVeterinarianData): Promise<VeterinarianResponse> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar veterinário');
    }

    return response.json();
  }

  async deleteVeterinarian(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir veterinário');
    }

    return response.json();
  }

  // Métodos utilitários
  async searchVeterinarians(search: string): Promise<Veterinarian[]> {
    const response = await this.getVeterinarians({ search, limit: 50 });
    return response.veterinarians;
  }

  async getActiveVeterinarians(): Promise<Veterinarian[]> {
    const response = await this.getVeterinarians({ isActive: true, limit: 100 });
    return response.veterinarians;
  }

  async toggleVeterinarianStatus(id: string, active: boolean): Promise<VeterinarianResponse> {
    return this.updateVeterinarian(id, { active });
  }
}

export const veterinarianAPI = new VeterinarianAPI();
export type { 
  Veterinarian, 
  VeterinarianListResponse, 
  VeterinarianResponse, 
  CreateVeterinarianData, 
  UpdateVeterinarianData,
  Stats
};