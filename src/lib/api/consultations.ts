interface Consultation {
  consultation_id: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    avatarUrl?: string;
  };
  veterinarian: {
    id: string;
    name: string;
    role: string;
  };
  guardian: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  date: string;
  petHistory?: Array<{
    id: string;
    date: string;
    diagnosis?: string;
    treatment?: string;
    veterinarian: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  created_at: string;
  updated_at: string;
}

interface ConsultationListResponse {
  consultations: Consultation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ConsultationResponse {
  consultation: Consultation;
}

interface CreateConsultationData {
  petId: string;
  veterinarianId: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

type UpdateConsultationData = Partial<Omit<CreateConsultationData, 'petId' | 'veterinarianId'>>

class ConsultationAPI {
  private baseURL = '/api/consultations';

  async getConsultations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    veterinarianId?: string;
    petId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ConsultationListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.veterinarianId) searchParams.append('veterinarianId', params.veterinarianId);
    if (params?.petId) searchParams.append('petId', params.petId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${this.baseURL}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar consultas');
    }

    return response.json();
  }

  async getConsultation(id: string): Promise<ConsultationResponse> {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar consulta');
    }

    return response.json();
  }

  async createConsultation(data: CreateConsultationData): Promise<ConsultationResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar consulta');
    }

    return response.json();
  }

  async updateConsultation(id: string, data: UpdateConsultationData): Promise<ConsultationResponse> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar consulta');
    }

    return response.json();
  }

  async deleteConsultation(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir consulta');
    }

    return response.json();
  }

  // Métodos utilitários
  async searchConsultations(search: string): Promise<Consultation[]> {
    const response = await this.getConsultations({ search, limit: 50 });
    return response.consultations;
  }

  async getConsultationsByPet(petId: string): Promise<Consultation[]> {
    const response = await this.getConsultations({ petId, limit: 100 });
    return response.consultations;
  }

  async getConsultationsByVeterinarian(veterinarianId: string): Promise<Consultation[]> {
    const response = await this.getConsultations({ veterinarianId, limit: 100 });
    return response.consultations;
  }


  async getConsultationsByDateRange(startDate: string, endDate: string): Promise<Consultation[]> {
    const response = await this.getConsultations({ startDate, endDate, limit: 100 });
    return response.consultations;
  }

  async getRecentConsultations(limit: number = 10): Promise<Consultation[]> {
    const response = await this.getConsultations({ limit });
    return response.consultations;
  }


  // Método para gerar relatórios
  async getConsultationReport(params?: {
    veterinarianId?: string;
    startDate?: string;
    endDate?: string;
    petId?: string;
  }): Promise<{
    totalConsultations: number;
    consultationsByMonth: { month: string; count: number }[];
    topDiagnoses: { diagnosis: string; count: number }[];
    avgConsultationsPerDay: number;
  }> {
    // Este seria implementado como um endpoint separado na API
    // Por ora, vamos simular com os dados existentes
    const consultations = await this.getConsultations({ 
      ...params, 
      limit: 1000 
    });
    
    const totalConsultations = consultations.pagination.total;
    
    // Análise simples dos dados
    const diagnosisCount: { [key: string]: number } = {};
    const monthlyCount: { [key: string]: number } = {};
    
    consultations.consultations.forEach(consultation => {
      // Contagem de diagnósticos
      if (consultation.diagnosis) {
        if (diagnosisCount[consultation.diagnosis]) {
          diagnosisCount[consultation.diagnosis]++;
        } else {
          diagnosisCount[consultation.diagnosis] = 1;
        }
      }
      
      // Contagem mensal
      const month = new Date(consultation.created_at).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (monthlyCount[month]) {
        monthlyCount[month]++;
      } else {
        monthlyCount[month] = 1;
      }
    });
    
    const topDiagnoses = Object.entries(diagnosisCount)
      .map(([diagnosis, count]) => ({ diagnosis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const consultationsByMonth = Object.entries(monthlyCount)
      .map(([month, count]) => ({ month, count }));
    
    const avgConsultationsPerDay = totalConsultations / 30; // Média dos últimos 30 dias
    
    return {
      totalConsultations,
      consultationsByMonth,
      topDiagnoses,
      avgConsultationsPerDay
    };
  }
}

export const consultationAPI = new ConsultationAPI();
export type { 
  Consultation, 
  ConsultationListResponse, 
  ConsultationResponse, 
  CreateConsultationData, 
  UpdateConsultationData
};