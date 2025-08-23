"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building,
  Users,
  UserCircle,
  Palette,
  Bell,
  Shield,
  Database,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

const settingsMenuItems = [
  {
    id: "clinic",
    title: "Dados da Clínica",
    description: "Informações básicas e configurações da clínica",
    icon: Building,
    href: "/dashboard/settings/clinic",
  },
  {
    id: "users",
    title: "Usuários",
    description: "Gerenciar usuários e permissões do sistema",
    icon: Users,
    href: "/dashboard/settings/users",
  },
  {
    id: "profile",
    title: "Meu Perfil",
    description: "Dados pessoais e preferências da conta",
    icon: UserCircle,
    href: "/dashboard/settings/profile",
  },
  {
    id: "notifications",
    title: "Notificações",
    description: "Configurar alertas e notificações do sistema",
    icon: Bell,
    href: "/dashboard/settings/notifications",
  },
  {
    id: "security",
    title: "Segurança",
    description: "Configurações de segurança e backup",
    icon: Shield,
    href: "/dashboard/settings/security",
  },
  {
    id: "data",
    title: "Dados e Backup",
    description: "Backup, exportação e importação de dados",
    icon: Database,
    href: "/dashboard/settings/data",
  },
];

function SettingsMenuItem({ item }: { item: any }) {
  return (
    <motion.a
      href={item.href}
      className="block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-tertiary" />
          </div>
        </CardContent>
      </Card>
    </motion.a>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: "light",
      label: "Claro",
      icon: Sun,
      description: "Interface clara e brilhante",
    },
    {
      value: "dark",
      label: "Escuro",
      icon: Moon,
      description: "Interface escura, ideal para ambientes com pouca luz",
    },
    {
      value: "monochromatic",
      label: "Monocromático",
      icon: Monitor,
      description: "Interface em tons de cinza",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Tema da Aplicação
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">
          Escolha o tema que melhor se adapta ao seu ambiente de trabalho
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => setTheme(option.value as any)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                theme === option.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-border hover:border-primary-300"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <option.icon
                  className={`w-5 h-5 ${
                    theme === option.value
                      ? "text-primary-600"
                      : "text-text-tertiary"
                  }`}
                />
                <span
                  className={`font-medium ${
                    theme === option.value
                      ? "text-primary-700"
                      : "text-text-primary"
                  }`}
                >
                  {option.label}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {option.description}
              </p>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Configurações</h1>
        <p className="text-text-secondary">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Settings Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsMenuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SettingsMenuItem item={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
