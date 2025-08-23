interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface BusinessHours {
  dayOfWeek: number; // 0 = domingo, 6 = sábado
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
}

interface Service {
  name: string;
  description?: string;
  duration: number; // duração em minutos
  price: number;
  isActive: boolean;
}

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

interface ClinicNotifications {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  lowStockAlerts: boolean;
  expirationAlerts: boolean;
}

interface ClinicStats {
  totalPets: number;
  totalGuardians: number;
  totalVeterinarians: number;
  totalAppointments: number;
  monthlyConsultations: number;
}

interface Clinic {
  clinic_id: string;
  name: string;
  cnpj?: string;
  email: string;
  phone: string;
  address: Address;
  businessHours: BusinessHours[];
  services?: Service[];
  logo?: string;
  website?: string;
  socialMedia?: SocialMedia;
  notifications?: ClinicNotifications;
  stats?: ClinicStats;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: string;
  notifications?: {
    email: boolean;
    push: boolean;
    appointments: boolean;
    reminders: boolean;
  };
}

interface UserPermissions {
  canManagePets: boolean;
  canManageGuardians: boolean;
  canManageAppointments: boolean;
  canManageConsultations: boolean;
  canManageInventory: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

interface UserStats {
  totalAppointments: number;
  totalConsultations: number;
  specialty?: string;
  yearsOfExperience?: number;
  crmv?: {
    number: string;
    state: string;
    issueDate: string;
    expirationDate: string;
  };
}

interface User {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST';
  preferences: UserPreferences;
  permissions: UserPermissions;
  isActive: boolean;
  lastLoginAt?: string;
  clinic?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  stats?: UserStats;
  created_at: string;
  updated_at: string;
}

interface ClinicResponse {
  clinic: Clinic;
}

interface UserResponse {
  user: User;
}

interface UpdateClinicData {
  name: string;
  cnpj?: string;
  email: string;
  phone: string;
  address: Address;
  businessHours: BusinessHours[];
  services?: Service[];
  logo?: string;
  website?: string;
  socialMedia?: SocialMedia;
  notifications?: ClinicNotifications;
}

interface UpdateUserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST';
  preferences?: UserPreferences;
  permissions?: UserPermissions;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class SettingsAPI {
  // Configurações da Clínica
  async getClinicSettings(): Promise<ClinicResponse> {
    const response = await fetch('/api/settings/clinic');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar configurações da clínica');
    }

    return response.json();
  }

  async updateClinicSettings(data: UpdateClinicData): Promise<ClinicResponse> {
    const response = await fetch('/api/settings/clinic', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar configurações da clínica');
    }

    return response.json();
  }

  // Perfil do Usuário
  async getUserProfile(): Promise<UserResponse> {
    const response = await fetch('/api/settings/profile');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar perfil do usuário');
    }

    return response.json();
  }

  async updateUserProfile(data: UpdateUserData): Promise<UserResponse> {
    const response = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar perfil do usuário');
    }

    return response.json();
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao alterar senha');
    }

    return response.json();
  }

  // Métodos utilitários
  generateDefaultBusinessHours(): BusinessHours[] {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days.map((_, index) => ({
      dayOfWeek: index,
      isOpen: index >= 1 && index <= 5, // Segunda a Sexta
      openTime: index >= 1 && index <= 5 ? '08:00' : undefined,
      closeTime: index >= 1 && index <= 5 ? '18:00' : undefined,
      lunchBreakStart: index >= 1 && index <= 5 ? '12:00' : undefined,
      lunchBreakEnd: index >= 1 && index <= 5 ? '13:00' : undefined
    }));
  }

  generateDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'pt',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'BRL',
      notifications: {
        email: true,
        push: true,
        appointments: true,
        reminders: true
      }
    };
  }

  generateDefaultPermissions(role: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST'): UserPermissions {
    const basePermissions: UserPermissions = {
      canManagePets: true,
      canManageGuardians: true,
      canManageAppointments: true,
      canManageConsultations: false,
      canManageInventory: false,
      canManageUsers: false,
      canViewReports: false,
      canManageSettings: false
    };

    switch (role) {
      case 'ADMIN':
        return {
          canManagePets: true,
          canManageGuardians: true,
          canManageAppointments: true,
          canManageConsultations: true,
          canManageInventory: true,
          canManageUsers: true,
          canViewReports: true,
          canManageSettings: true
        };
      case 'VETERINARIAN':
        return {
          ...basePermissions,
          canManageConsultations: true,
          canManageInventory: true,
          canViewReports: true
        };
      case 'RECEPTIONIST':
        return basePermissions;
      default:
        return basePermissions;
    }
  }

  // Validações
  validateCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;

    // Verifica se não são todos os dígitos iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Validação do algoritmo
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    return result === parseInt(digits.charAt(1));
  }

  formatCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  validateZipCode(zipCode: string): boolean {
    zipCode = zipCode.replace(/[^\d]/g, '');
    return /^\d{8}$/.test(zipCode);
  }

  formatZipCode(zipCode: string): string {
    zipCode = zipCode.replace(/[^\d]/g, '');
    return zipCode.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  formatPhone(phone: string): string {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  // Buscar CEP na API dos Correios
  async fetchAddressByZipCode(zipCode: string): Promise<{
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null> {
    try {
      zipCode = zipCode.replace(/[^\d]/g, '');
      if (!this.validateZipCode(zipCode)) return null;

      const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
      const data = await response.json();

      if (data.erro) return null;

      return {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  }

  // Gerar avatar padrão baseado nas iniciais do nome
  generateAvatarUrl(name: string): string {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${initials}&size=128&background=0ea5e9&color=fff`;
  }
}

export const settingsAPI = new SettingsAPI();
export type { 
  Clinic, 
  User, 
  ClinicResponse, 
  UserResponse, 
  UpdateClinicData, 
  UpdateUserData,
  ChangePasswordData,
  Address,
  BusinessHours,
  Service,
  SocialMedia,
  ClinicNotifications,
  UserPreferences,
  UserPermissions,
  UserStats,
  ClinicStats
};