import { apiClient } from './client';

interface Pet {
  pet_id: string;
  name: string;
  species: string;
  breed?: string;
  size?: string;
  weight?: number;
  isNeutered: boolean;
  environment?: string;
  birthDate?: string;
  deathDate?: string;
  notes?: string;
  avatarUrl?: string;
  guardian_id: string;
  clinic_id: string;
  guardian?: {
    guardian_id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
}

interface PetListResponse {
  pets: Pet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface PetResponse {
  pet: Pet;
}

interface CreatePetData {
  name: string;
  species: string;
  breed?: string;
  size?: string;
  weight?: number;
  isNeutered: boolean;
  environment?: string;
  birthDate?: string;
  notes?: string;
  avatarUrl?: string;
  guardian_id: string;
}

type UpdatePetData = Partial<CreatePetData>

class PetAPI {
  private baseURL = '/api/pets';

  async getPets(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PetListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    return apiClient.get<PetListResponse>(`${this.baseURL}?${searchParams.toString()}`);
  }

  async getPet(id: string): Promise<PetResponse> {
    return apiClient.get<PetResponse>(`${this.baseURL}/${id}`);
  }

  async createPet(data: CreatePetData): Promise<PetResponse> {
    return apiClient.post<PetResponse>(this.baseURL, data);
  }

  async updatePet(id: string, data: UpdatePetData): Promise<PetResponse> {
    return apiClient.put<PetResponse>(`${this.baseURL}/${id}`, data);
  }

  async deletePet(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.baseURL}/${id}`);
  }

  // Método utilitário para busca simples (usado em dropdowns)
  async searchPets(search: string): Promise<Pet[]> {
    const response = await this.getPets({ search, limit: 50 });
    return response.pets;
  }
}

export const petAPI = new PetAPI();
export type { Pet, PetListResponse, PetResponse, CreatePetData, UpdatePetData };