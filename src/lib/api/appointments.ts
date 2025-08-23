interface Pet {
  pet_id: string;
  name: string;
  species: string;
  breed?: string;
  avatarUrl?: string;
}

interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: any;
}

interface Veterinarian {
  id: string;
  name: string;
  specialty?: string;
  crmv?: string;
}

interface Appointment {
  appointment_id: string;
  date: string;
  time: string;
  dateTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'CONSULTATION' | 'VACCINATION' | 'SURGERY' | 'CHECKUP' | 'OTHER';
  notes?: string;
  pet_id: string;
  guardian_id: string;
  veterinarian_id: string;
  clinic_id: string;
  pet: Pet;
  guardian: Guardian;
  veterinarian: Veterinarian;
  consultations?: Array<{
    id: string;
    createdAt: string;
    diagnosis?: string;
    treatment?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface AppointmentListResponse {
  appointments: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AppointmentResponse {
  appointment: Appointment;
}

interface CreateAppointmentData {
  date: string;
  time: string;
  petId: string;
  veterinarianId: string;
  guardianId: string;
  notes?: string;
  type?: 'CONSULTATION' | 'VACCINATION' | 'SURGERY' | 'CHECKUP' | 'OTHER';
  status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

type UpdateAppointmentData = Partial<CreateAppointmentData>

class AppointmentAPI {
  private baseURL = '/api/appointments';

  async getAppointments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    veterinarianId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AppointmentListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.veterinarianId) searchParams.append('veterinarianId', params.veterinarianId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${this.baseURL}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar agendamentos');
    }

    return response.json();
  }

  async getAppointment(id: string): Promise<AppointmentResponse> {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar agendamento');
    }

    return response.json();
  }

  async createAppointment(data: CreateAppointmentData): Promise<AppointmentResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar agendamento');
    }

    return response.json();
  }

  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<AppointmentResponse> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar agendamento');
    }

    return response.json();
  }

  async deleteAppointment(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir agendamento');
    }

    return response.json();
  }

  // Métodos utilitários
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const response = await this.getAppointments({ 
      startDate: date, 
      endDate: date, 
      limit: 100 
    });
    return response.appointments;
  }

  async getAppointmentsByWeek(startDate: string, endDate: string): Promise<Appointment[]> {
    const response = await this.getAppointments({ 
      startDate, 
      endDate, 
      limit: 500 
    });
    return response.appointments;
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<AppointmentResponse> {
    return this.updateAppointment(id, { status });
  }

  // Methods for new appointment form
  async getGuardians(search?: string): Promise<Guardian[]> {
    const searchParams = new URLSearchParams();
    if (search) searchParams.append('search', search);
    searchParams.append('limit', '50');
    
    const response = await fetch(`/api/guardians?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar tutores');
    }

    const result = await response.json();
    return result.guardians || [];
  }

  async getVeterinarians(): Promise<Veterinarian[]> {
    const response = await fetch('/api/veterinarians?isActive=true&limit=50');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar veterinários');
    }

    const result = await response.json();
    return result.veterinarians || [];
  }

  async getPetsByGuardian(guardianId: string): Promise<Pet[]> {
    const response = await fetch(`/api/pets?guardianId=${guardianId}&limit=50`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar pets');
    }

    const result = await response.json();
    return result.pets || [];
  }

  // Check veterinarian availability
  async checkAvailability(veterinarianId: string, dateTime: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/veterinarians/${veterinarianId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateTime }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.available || false;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Utility functions
  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'SCHEDULED': 'Agendado',
      'CONFIRMED': 'Confirmado',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Realizado',
      'CANCELLED': 'Cancelado'
    };
    
    return statusLabels[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'SCHEDULED': 'text-primary-500 bg-primary-100',
      'CONFIRMED': 'text-info bg-info/10',
      'IN_PROGRESS': 'text-warning bg-warning/10',
      'COMPLETED': 'text-success bg-success/10',
      'CANCELLED': 'text-error bg-error/10'
    };
    
    return statusColors[status] || 'text-text-tertiary bg-background-secondary';
  }

  getTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'CONSULTATION': 'Consulta',
      'VACCINATION': 'Vacinação',
      'SURGERY': 'Cirurgia',
      'CHECKUP': 'Check-up',
      'OTHER': 'Outro'
    };
    
    return typeLabels[type] || type;
  }

  validateAppointmentData(data: CreateAppointmentData): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    if (!data.guardianId) {
      errors.guardianId = 'Tutor é obrigatório';
    }

    if (!data.petId) {
      errors.petId = 'Pet é obrigatório';
    }

    if (!data.veterinarianId) {
      errors.veterinarianId = 'Veterinário é obrigatório';
    }

    if (!data.date) {
      errors.date = 'Data é obrigatória';
    }

    if (!data.time) {
      errors.time = 'Horário é obrigatório';
    }

    if (data.date && data.time) {
      const appointmentDateTime = new Date(`${data.date}T${data.time}`);
      const now = new Date();
      
      if (appointmentDateTime <= now) {
        errors.dateTime = 'Data e hora devem ser no futuro';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  formatDateTime(date: string, time: string): string {
    return new Date(`${date}T${time}`).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  }
}

export const appointmentAPI = new AppointmentAPI();
export type { 
  Appointment, 
  AppointmentListResponse, 
  AppointmentResponse, 
  CreateAppointmentData, 
  UpdateAppointmentData,
  Pet,
  Guardian,
  Veterinarian
};