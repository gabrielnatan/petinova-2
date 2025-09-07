import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dashboardService } from "../services/dashboard.service";

// Função utilitária para obter títulos dos widgets
const getWidgetTitle = (type: string): string => {
  const titles: Record<string, string> = {
    "appointments-today": "Consultas de Hoje",
    "revenue-chart": "Receita",
    "pets-count": "Total de Pets",
    "stock-alerts": "Alertas de Estoque",
    "recent-consultations": "Consultas Recentes",
    "quick-actions": "Ações Rápidas"
  };
  return titles[type] || type;
};

// Types baseadas nas entidades do backend
export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  clinic_id?: string;
  veterinarian_id?: string;
  guardian_id?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Clinic {
  clinic_id: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  address: string;
  logoUrl?: string;
  isActive: boolean;
  created_at: Date;
}

export interface Pet {
  pet_id: string;
  name: string;
  species: string;
  breed: string;
  size: string;
  weight: number;
  isNeutered: boolean;
  environment: string;
  birthDate?: Date;
  deathDate?: Date;
  notes?: string;
  avatarUrl?: string;
  guardian_id: string;
  clinic_id: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Guardian {
  guardian_id: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  birthDate?: Date;
  gender: string;
  avatarUrl?: string;
  clinic_id: string;
}

export interface Veterinarian {
  veterinarian_id: string;
  fullName: string;
  crmv: {
    number: string;
    state: string;
    issueDate: Date;
    expirationDate: Date;
  };
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  yearsOfExperience?: number;
  specialties?: string[];
  clinic_id: string;
}

export interface Appointment {
  appointment_id: string;
  dateTime: Date;
  status: string;
  notes: string;
  clinic_id: string;
  veterinarian_id: string;
  guardian_id: string;
  pet_id: string;
}

export interface Consultation {
  consultation_id: string;
  appointment: {
    appointment_id: string;
    dateTime: string;
    status: string;
  };
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    weight?: number;
    birthDate?: string;
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

export interface Product {
  product_id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  supplier?: string;
  prices: {
    purchase: number;
    sale: number;
    margin?: number;
  };
  inventory: {
    stock: number;
    minimumStock: number;
    unit: 'un' | 'kg' | 'g' | 'l' | 'ml' | 'cx' | 'pct';
    location?: string;
    estimatedDaysToStock?: number;
  };
  details: {
    expirationDate?: string;
    batchNumber?: string;
    prescriptionRequired: boolean;
    notes?: string;
    images?: string[];
  };
  stats: {
    totalSales: number;
    totalPurchases: number;
    salesThisMonth?: number;
    lastSaleDate?: string;
    averageMonthlyUsage?: number;
    isLowStock: boolean;
    isExpiringSoon?: boolean;
  };
  recentSales?: Array<{
    id: string;
    quantity: number;
    price: number;
    createdAt: string;
    consultation?: {
      id: string;
      createdAt: string;
      pet: {
        id: string;
        name: string;
      };
    };
  }>;
  recentPurchases?: Array<{
    id: string;
    quantity: number;
    price: number;
    createdAt: string;
    supplier?: string;
    invoiceNumber?: string;
  }>;
  isActive: boolean;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  type:
    | "appointments-today"
    | "revenue-chart"
    | "pets-count"
    | "stock-alerts"
    | "recent-consultations"
    | "quick-actions";
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visible: boolean;
  settings?: Record<string, any>;
}

// Store Interface
interface AppStore {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  currentClinic: Clinic | null;

  // Data
  pets: Pet[];
  guardians: Guardian[];
  veterinarians: Veterinarian[];
  appointments: Appointment[];
  consultations: Consultation[];
  products: Product[];

  // Dashboard
  dashboardWidgets: DashboardWidget[];

  // UI State
  sidebarCollapsed: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setCurrentClinic: (clinic: Clinic | null) => void;
  login: (user: User, clinic: Clinic) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Data Actions
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  updatePet: (petId: string, pet: Partial<Pet>) => void;
  removePet: (petId: string) => void;

  setGuardians: (guardians: Guardian[]) => void;
  addGuardian: (guardian: Guardian) => void;
  updateGuardian: (guardianId: string, guardian: Partial<Guardian>) => void;
  removeGuardian: (guardianId: string) => void;

  setVeterinarians: (veterinarians: Veterinarian[]) => void;
  addVeterinarian: (veterinarian: Veterinarian) => void;
  updateVeterinarian: (
    veterinarianId: string,
    veterinarian: Partial<Veterinarian>,
  ) => void;
  removeVeterinarian: (veterinarianId: string) => void;

  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (
    appointmentId: string,
    appointment: Partial<Appointment>,
  ) => void;
  removeAppointment: (appointmentId: string) => void;

  setConsultations: (consultations: Consultation[]) => void;
  addConsultation: (consultation: Consultation) => void;
  updateConsultation: (
    consultationId: string,
    consultation: Partial<Consultation>,
  ) => void;
  removeConsultation: (consultationId: string) => void;

  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, product: Partial<Product>) => void;
  removeProduct: (productId: string) => void;

  // Data Loading Actions
  loadConsultations: () => Promise<void>;
  loadProducts: () => Promise<void>;

  // Dashboard Actions
  setDashboardWidgets: (widgets: DashboardWidget[]) => void;
  addDashboardWidget: (widget: DashboardWidget) => void;
  updateDashboardWidget: (
    widgetId: string,
    widget: Partial<DashboardWidget>,
  ) => void;
  removeDashboardWidget: (widgetId: string) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  loadDashboardLayout: () => Promise<void>;
  saveDashboardLayout: () => Promise<void>;

  // UI Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

// Default Dashboard Widgets
const defaultDashboardWidgets: DashboardWidget[] = [
  {
    id: "appointments-today",
    type: "appointments-today",
    title: "Agendamentos de Hoje",
    position: { x: 0, y: 0 },
    size: { w: 6, h: 4 },
    visible: true,
  },
  {
    id: "revenue-chart",
    type: "revenue-chart",
    title: "Faturamento Mensal",
    position: { x: 6, y: 0 },
    size: { w: 6, h: 4 },
    visible: true,
  },
  {
    id: "pets-count",
    type: "pets-count",
    title: "Total de Pets",
    position: { x: 0, y: 4 },
    size: { w: 3, h: 3 },
    visible: true,
  },
  {
    id: "stock-alerts",
    type: "stock-alerts",
    title: "Alertas de Estoque",
    position: { x: 3, y: 4 },
    size: { w: 3, h: 3 },
    visible: true,
  },
  {
    id: "recent-consultations",
    type: "recent-consultations",
    title: "Consultas Recentes",
    position: { x: 6, y: 4 },
    size: { w: 6, h: 4 },
    visible: true,
  },
  {
    id: "quick-actions",
    type: "quick-actions",
    title: "Ações Rápidas",
    position: { x: 0, y: 7 },
    size: { w: 12, h: 2 },
    visible: true,
  },
];

// Create Store
export const useAppStore = create<AppStore>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      currentClinic: null,

      // Data
      pets: [],
      guardians: [],
      veterinarians: [],
      appointments: [],
      consultations: [],
      products: [],

      // Dashboard
      dashboardWidgets: defaultDashboardWidgets,

      // UI State
      sidebarCollapsed: false,

      // Authentication Actions
      setUser: (user) => set({ user }),
      setCurrentClinic: (clinic) => set({ currentClinic: clinic }),

      login: (user, clinic) =>
        set({
          user,
          currentClinic: clinic,
          isAuthenticated: true,
        }),

      logout: async () => {
        try {
          // Call logout API
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state regardless of API response
          set({
            user: null,
            currentClinic: null,
            isAuthenticated: false,
            pets: [],
            guardians: [],
            veterinarians: [],
            appointments: [],
            consultations: [],
            products: [],
          });
          
          // Redirect to login page
          window.location.href = '/auth/login';
        }
      },

      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              currentClinic: data.clinic,
              isAuthenticated: true,
            });
          } else {
            // Token inválido ou expirado
            set({
              user: null,
              currentClinic: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          set({
            user: null,
            currentClinic: null,
            isAuthenticated: false,
          });
        }
      },

      // Pet Actions
      setPets: (pets) => set({ pets }),
      addPet: (pet) => set((state) => ({ pets: [...state.pets, pet] })),
      updatePet: (petId, petData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.pet_id === petId ? { ...pet, ...petData } : pet,
          ),
        })),
      removePet: (petId) =>
        set((state) => ({
          pets: state.pets.filter((pet) => pet.pet_id !== petId),
        })),

      // Guardian Actions
      setGuardians: (guardians) => set({ guardians }),
      addGuardian: (guardian) =>
        set((state) => ({ guardians: [...state.guardians, guardian] })),
      updateGuardian: (guardianId, guardianData) =>
        set((state) => ({
          guardians: state.guardians.map((guardian) =>
            guardian.guardian_id === guardianId
              ? { ...guardian, ...guardianData }
              : guardian,
          ),
        })),
      removeGuardian: (guardianId) =>
        set((state) => ({
          guardians: state.guardians.filter(
            (guardian) => guardian.guardian_id !== guardianId,
          ),
        })),

      // Veterinarian Actions
      setVeterinarians: (veterinarians) => set({ veterinarians }),
      addVeterinarian: (veterinarian) =>
        set((state) => ({
          veterinarians: [...state.veterinarians, veterinarian],
        })),
      updateVeterinarian: (veterinarianId, veterinarianData) =>
        set((state) => ({
          veterinarians: state.veterinarians.map((veterinarian) =>
            veterinarian.veterinarian_id === veterinarianId
              ? { ...veterinarian, ...veterinarianData }
              : veterinarian,
          ),
        })),
      removeVeterinarian: (veterinarianId) =>
        set((state) => ({
          veterinarians: state.veterinarians.filter(
            (veterinarian) => veterinarian.veterinarian_id !== veterinarianId,
          ),
        })),

      // Appointment Actions
      setAppointments: (appointments) => set({ appointments }),
      addAppointment: (appointment) =>
        set((state) => ({
          appointments: [...state.appointments, appointment],
        })),
      updateAppointment: (appointmentId, appointmentData) =>
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.appointment_id === appointmentId
              ? { ...appointment, ...appointmentData }
              : appointment,
          ),
        })),
      removeAppointment: (appointmentId) =>
        set((state) => ({
          appointments: state.appointments.filter(
            (appointment) => appointment.appointment_id !== appointmentId,
          ),
        })),

      // Consultation Actions
      setConsultations: (consultations) => set({ consultations }),
      addConsultation: (consultation) =>
        set((state) => ({
          consultations: [...state.consultations, consultation],
        })),
      updateConsultation: (consultationId, consultationData) =>
        set((state) => ({
          consultations: state.consultations.map((consultation) =>
            consultation.consultation_id === consultationId
              ? { ...consultation, ...consultationData }
              : consultation,
          ),
        })),
      removeConsultation: (consultationId) =>
        set((state) => ({
          consultations: state.consultations.filter(
            (consultation) => consultation.consultation_id !== consultationId,
          ),
        })),

      // Product Actions
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
      updateProduct: (productId, productData) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.product_id === productId
              ? { ...product, ...productData }
              : product,
          ),
        })),
      removeProduct: (productId) =>
        set((state) => ({
          products: state.products.filter(
            (product) => product.product_id !== productId,
          ),
        })),

      // Dashboard Actions
      setDashboardWidgets: (widgets) => set({ dashboardWidgets: widgets }),
      addDashboardWidget: (widget) =>
        set((state) => ({
          dashboardWidgets: [...state.dashboardWidgets, widget],
        })),
      updateDashboardWidget: (widgetId, widgetData) =>
        set((state) => ({
          dashboardWidgets: state.dashboardWidgets.map((widget) =>
            widget.id === widgetId ? { ...widget, ...widgetData } : widget,
          ),
        })),
      removeDashboardWidget: (widgetId) =>
        set((state) => ({
          dashboardWidgets: state.dashboardWidgets.filter(
            (widget) => widget.id !== widgetId,
          ),
        })),
      toggleWidgetVisibility: (widgetId) =>
        set((state) => ({
          dashboardWidgets: state.dashboardWidgets.map((widget) =>
            widget.id === widgetId
              ? { ...widget, visible: !widget.visible }
              : widget,
          ),
        })),

      // Dashboard Server Actions
      loadDashboardLayout: async () => {
        try {
          const result = await dashboardService.getLayout();
          if (result.success && result.data) {
            // Mapear dados da API para incluir títulos
            const widgetsWithTitles = result.data.widgets.map(widget => ({
              ...widget,
              type: widget.type as DashboardWidget["type"],
              title: getWidgetTitle(widget.type)
            }));
            set({ dashboardWidgets: widgetsWithTitles });
          }
          // Se não houver layout salvo, usar o padrão
        } catch (error) {
          console.error('Erro ao carregar layout do dashboard:', error);
        }
      },

      saveDashboardLayout: async () => {
        try {
          const { dashboardWidgets } = get();
          const result = await dashboardService.saveLayout({
            widgets: dashboardWidgets
          });
          if (!result.success) {
            console.error('Erro ao salvar layout:', result.error);
          }
        } catch (error) {
          console.error('Erro ao salvar layout do dashboard:', error);
        }
      },

      // Data Loading Actions
      loadConsultations: async () => {
        try {
          const response = await fetch('/api/consultations?limit=100');
          if (response.ok) {
            const data = await response.json();
            set({ consultations: data.consultations || [] });
          }
        } catch (error) {
          console.error('Erro ao carregar consultas:', error);
        }
      },

      loadProducts: async () => {
        try {
          const response = await fetch('/api/products?limit=100');
          if (response.ok) {
            const data = await response.json();
            set({ products: data.products || [] });
          }
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        }
      },

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "petinova-store",
      partialize: (state) => ({
        // Persist only necessary data
        user: state.user,
        currentClinic: state.currentClinic,
        isAuthenticated: state.isAuthenticated,
        dashboardWidgets: state.dashboardWidgets,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

// Selectors for better performance
export const useAuth = () =>
  useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    currentClinic: state.currentClinic,
    login: state.login,
    logout: state.logout,
    checkAuth: state.checkAuth,
  }));

export const useDashboard = () =>
  useAppStore((state) => ({
    widgets: state.dashboardWidgets,
    setWidgets: state.setDashboardWidgets,
    addWidget: state.addDashboardWidget,
    updateWidget: state.updateDashboardWidget,
    removeWidget: state.removeDashboardWidget,
    toggleWidgetVisibility: state.toggleWidgetVisibility,
    loadDashboardLayout: state.loadDashboardLayout,
    saveDashboardLayout: state.saveDashboardLayout,
  }));

export const usePets = () =>
  useAppStore((state) => ({
    pets: state.pets,
    setPets: state.setPets,
    addPet: state.addPet,
    updatePet: state.updatePet,
    removePet: state.removePet,
  }));

export const useGuardians = () =>
  useAppStore((state) => ({
    guardians: state.guardians,
    setGuardians: state.setGuardians,
    addGuardian: state.addGuardian,
    updateGuardian: state.updateGuardian,
    removeGuardian: state.removeGuardian,
  }));

export const useAppointments = () =>
  useAppStore((state) => ({
    appointments: state.appointments,
    setAppointments: state.setAppointments,
    addAppointment: state.addAppointment,
    updateAppointment: state.updateAppointment,
    removeAppointment: state.removeAppointment,
  }));

export const useConsultations = () =>
  useAppStore((state) => ({
    consultations: state.consultations,
    setConsultations: state.setConsultations,
    addConsultation: state.addConsultation,
    updateConsultation: state.updateConsultation,
    removeConsultation: state.removeConsultation,
    loadConsultations: state.loadConsultations,
  }));

export const useProducts = () =>
  useAppStore((state) => ({
    products: state.products,
    setProducts: state.setProducts,
    addProduct: state.addProduct,
    updateProduct: state.updateProduct,
    removeProduct: state.removeProduct,
    loadProducts: state.loadProducts,
  }));

export const useUI = () =>
  useAppStore((state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
  }));
