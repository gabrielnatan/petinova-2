import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  description: string;
  amount: number;
  payment_method: string;
  payment_plan?: number;
  paid: boolean;
  clinic_id: string;
  veterinarian_id: string;
  pet_id: string;
  appointment_id: string;
}

export interface Product {
  product_id: string;
  name: string;
  type: string;
  unit: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  validity?: Date;
  clinic_id: string;
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

  // Dashboard Actions
  setDashboardWidgets: (widgets: DashboardWidget[]) => void;
  addDashboardWidget: (widget: DashboardWidget) => void;
  updateDashboardWidget: (
    widgetId: string,
    widget: Partial<DashboardWidget>,
  ) => void;
  removeDashboardWidget: (widgetId: string) => void;
  toggleWidgetVisibility: (widgetId: string) => void;

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
  }));

export const useDashboard = () =>
  useAppStore((state) => ({
    widgets: state.dashboardWidgets,
    setWidgets: state.setDashboardWidgets,
    addWidget: state.addDashboardWidget,
    updateWidget: state.updateDashboardWidget,
    removeWidget: state.removeDashboardWidget,
    toggleWidgetVisibility: state.toggleWidgetVisibility,
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

export const useUI = () =>
  useAppStore((state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
  }));
