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
  consultations?: Array<{
    id: string;
    date: string;
    diagnosis: string;
    treatment: string;
    notes: string;
    veterinarian: {
      id: string;
      name: string;
    };
  }>;
  appointments?: Array<{
    id: string;
    date: string;
    status: string;
    notes: string;
    veterinarian: {
      id: string;
      name: string;
    };
  }>;
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
    // Mapear guardian_id para guardianId para compatibilidade com a API
    const apiData = {
      ...data,
      guardianId: data.guardian_id
    };
    delete (apiData as any).guardian_id;
    
    return apiClient.post<PetResponse>(this.baseURL, apiData);
  }

  async updatePet(id: string, data: UpdatePetData): Promise<PetResponse> {
    // Mapear guardian_id para guardianId para compatibilidade com a API se presente
    const apiData = { ...data };
    if ((data as any).guardian_id) {
      (apiData as any).guardianId = (data as any).guardian_id;
      delete (apiData as any).guardian_id;
    }
    
    return apiClient.put<PetResponse>(`${this.baseURL}/${id}`, apiData);
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