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

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: string;
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
  role: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST';
  avatar?: string;
  permissions: UserPermissions;
  preferences: UserPreferences;
  isActive: boolean;
  lastLoginAt?: string;
  stats?: UserStats;
  created_at: string;
  updated_at: string;
}

interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UserResponse {
  user: User;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST';
  avatar?: string;
  permissions?: UserPermissions;
  preferences?: UserPreferences;
  isActive?: boolean;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST';
  avatar?: string;
  permissions?: UserPermissions;
  preferences?: UserPreferences;
  isActive?: boolean;
}

interface ResetPasswordData {
  newPassword: string;
}

class UserAPI {
  private baseURL = '/api/users';

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

    const response = await fetch(`${this.baseURL}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar usuários');
    }

    return response.json();
  }

  async getUser(id: string): Promise<UserResponse> {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar usuário');
    }

    return response.json();
  }

  async createUser(data: CreateUserData): Promise<UserResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar usuário');
    }

    return response.json();
  }

  async updateUser(id: string, data: UpdateUserData): Promise<UserResponse> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar usuário');
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir usuário');
    }

    return response.json();
  }

  async resetPassword(id: string, data: ResetPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao resetar senha');
    }

    return response.json();
  }

  // Métodos utilitários
  async searchUsers(search: string): Promise<User[]> {
    const response = await this.getUsers({ search, limit: 50 });
    return response.users;
  }

  async getActiveUsers(): Promise<User[]> {
    const response = await this.getUsers({ isActive: true, limit: 100 });
    return response.users;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const response = await this.getUsers({ role, limit: 100 });
    return response.users;
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
    return this.updateUser(id, { isActive });
  }

  // Geradores de permissões e preferências padrão
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

  generateDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'pt',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'BRL'
    };
  }

  // Utilitários de validação
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  generateRandomPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Garantir pelo menos um de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Preencher o resto
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Embaralhar
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  getRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'VETERINARIAN': 'Veterinário',
      'RECEPTIONIST': 'Recepcionista'
    };
    
    return roleLabels[role] || role;
  }

  getPermissionLabel(permission: keyof UserPermissions): string {
    const permissionLabels: Record<keyof UserPermissions, string> = {
      canManagePets: 'Gerenciar Pets',
      canManageGuardians: 'Gerenciar Tutores',
      canManageAppointments: 'Gerenciar Agendamentos',
      canManageConsultations: 'Gerenciar Consultas',
      canManageInventory: 'Gerenciar Estoque',
      canManageUsers: 'Gerenciar Usuários',
      canViewReports: 'Visualizar Relatórios',
      canManageSettings: 'Gerenciar Configurações'
    };
    
    return permissionLabels[permission] || permission;
  }
}

export const userAPI = new UserAPI();
export type { 
  User, 
  UserListResponse, 
  UserResponse, 
  CreateUserData, 
  UpdateUserData,
  ResetPasswordData,
  UserPermissions,
  UserPreferences,
  UserStats
};