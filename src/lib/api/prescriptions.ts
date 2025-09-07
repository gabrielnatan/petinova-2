import { apiClient } from './client'

interface Prescription {
  prescription_id: string;
  text: string;
  created_at: string;
  consultation: {
    consultation_id: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    created_at: string;
    pet: {
      pet_id: string;
      name: string;
      species: string;
      breed?: string;
      birthDate?: string;
      weight?: number;
    };
    guardian: {
      guardian_id: string;
      fullName: string;
      email: string;
      phone: string;
      address?: string;
    };
    veterinarian: {
      veterinarian_id: string;
      fullName: string;
      role: string;
    };
  };
}

interface PrescriptionResponse {
  prescription: Prescription;
}

interface CreatePrescriptionData {
  text: string;
}

class PrescriptionAPI {
  private baseURL = '/api/consultations';

  async getPrescription(consultationId: string): Promise<PrescriptionResponse> {
    return apiClient.get<PrescriptionResponse>(`${this.baseURL}/${consultationId}/prescription`);
  }

  async createPrescription(consultationId: string, data: CreatePrescriptionData): Promise<PrescriptionResponse> {
    return apiClient.post<PrescriptionResponse>(`${this.baseURL}/${consultationId}/prescription`, data);
  }

  async updatePrescription(consultationId: string, data: CreatePrescriptionData): Promise<PrescriptionResponse> {
    return apiClient.post<PrescriptionResponse>(`${this.baseURL}/${consultationId}/prescription`, data);
  }
}

export const prescriptionAPI = new PrescriptionAPI();
export type { Prescription, PrescriptionResponse, CreatePrescriptionData };
