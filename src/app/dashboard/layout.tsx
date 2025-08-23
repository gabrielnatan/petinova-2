//@ts-nocheck
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  Heart,
  Stethoscope,
  Package,
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { useAuth, useUI } from "@/store";
import { useTheme } from "@/components/theme-provider";
import { ClientOnly } from "@/components/client-only";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
  {
    id: "appointments",
    label: "Agendamentos",
    icon: Calendar,
    href: "/dashboard/appointments",
  },
  { id: "pets", label: "Pets", icon: Heart, href: "/dashboard/pets" },
  {
    id: "guardians",
    label: "Tutores",
    icon: Users,
    href: "/dashboard/guardians",
  },
  {
    id: "veterinarians",
    label: "Veterinários",
    icon: Stethoscope,
    href: "/dashboard/veterinarians",
  },
  {
    id: "consultations",
    label: "Consultas",
    icon: FileText,
    href: "/dashboard/consultations",
  },
  {
    id: "inventory",
    label: "Estoque",
    icon: Package,
    href: "/dashboard/inventory",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

function Sidebar() {
  const { sidebarCollapsed } = useUI();
  const { user, logout } = useAuth();

  return (
    <motion.aside
      className="h-screen bg-surface border-r border-border flex flex-col"
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border">
        <motion.div
          className="flex items-center space-x-2"
          animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {!sidebarCollapsed && (
            <>
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-text-inverse" />
              </div>
              <span className="text-xl font-bold text-text-primary">
                Petinova
              </span>
            </>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <motion.a
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors duration-200 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      className="font-medium"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !sidebarCollapsed && (
                  <motion.span
                    className="ml-auto bg-primary-500 text-text-inverse text-xs rounded-full px-2 py-0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-2">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-text-tertiary truncate">
                  {user?.role || "Função"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!sidebarCollapsed && (
          <motion.button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:text-error hover:bg-background-secondary transition-colors duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </motion.button>
        )}
      </div>
    </motion.aside>
  );
}

function Header() {
  const { toggleSidebar } = useUI();
  const { theme, setTheme, availableThemes } = useTheme();
  const { user, currentClinic } = useAuth();

  const themeIcons = {
    light: Sun,
    dark: Moon,
    monochromatic: Palette,
  };

  const nextTheme = () => {
    const currentIndex = availableThemes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex]);
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4">
      {/* Left Side */}
      <div className="flex items-center space-x-4">
        <motion.button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-text-primary">
            {currentClinic?.tradeName || "Petinova"}
          </h1>
          <p className="text-xs text-text-tertiary">
            Sistema de Gestão Veterinária
          </p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Buscar pets, tutores, agendamentos..."
            className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none transition-colors duration-200"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-2">
        {/* Theme Switcher */}
        <ClientOnly
          fallback={
            <div className="p-2 rounded-lg w-10 h-10 bg-background-secondary animate-pulse"></div>
          }
        >
          <motion.button
            onClick={nextTheme}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Tema atual: ${theme}`}
          >
            {React.createElement(themeIcons[theme], { className: "w-5 h-5" })}
          </motion.button>
        </ClientOnly>

        {/* Notifications */}
        <motion.button
          className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
        </motion.button>

        {/* User Menu */}
        <motion.div
          className="flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-background-secondary transition-colors duration-200 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">
              {user?.name || "Usuário"}
            </p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {

  return (
    <div className="h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
