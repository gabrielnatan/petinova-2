/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
  Award,
  Clock,
  MapPin,
  FileText,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  Copy,
  MessageSquare,
  MoreVertical,
  Eye,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Mock data - replace with actual data fetching
const mockVeterinarian = {
  veterinarian_id: "1",
  fullName: "Dra. Maria Santos",
  crmv: {
    number: "12345",
    state: "SP",
    issueDate: new Date("2015-06-15"),
    expirationDate: new Date("2025-06-15"),
  },
  email: "maria.santos@clinica.com",
  phoneNumber: "11987654321",
  yearsOfExperience: 8,
  specialties: ["Clínica Geral", "Cirurgia", "Cardiologia"],
  availabilitySchedule: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ],
  created_at: new Date("2015-06-20"),

  // Additional profile info
  biography:
    "Veterinária especializada em clínica geral e cirurgia com mais de 8 anos de experiência. Formada pela FMVZ-USP, possui especialização em cardiologia veterinária e é membro da ANCLIVEPA.",
  education: [
    {
      degree: "Medicina Veterinária",
      institution: "FMVZ-USP",
      year: "2015",
    },
    {
      degree: "Especialização em Cardiologia Veterinária",
      institution: "ANCLIVEPA",
      year: "2018",
    },
  ],

  // Statistics
  stats: {
    totalConsultations: 1250,
    totalPets: 890,
    averageRating: 4.9,
    thisMonthConsultations: 45,
  },

  // Recent appointments
  recentAppointments: [
    {
      id: "1",
      petName: "Buddy",
      guardianName: "João Silva",
      date: new Date("2025-01-28T09:00:00"),
      type: "Consulta de rotina",
      status: "confirmed",
    },
    {
      id: "2",
      petName: "Luna",
      guardianName: "Maria Costa",
      date: new Date("2025-01-28T14:30:00"),
      type: "Cirurgia",
      status: "scheduled",
    },
    {
      id: "3",
      petName: "Max",
      guardianName: "Pedro Oliveira",
      date: new Date("2025-01-29T10:00:00"),
      type: "Exame cardiológico",
      status: "scheduled",
    },
  ],

  // Schedule
  weeklySchedule: {
    Monday: { start: "08:00", end: "17:00" },
    Tuesday: { start: "08:00", end: "17:00" },
    Wednesday: { start: "08:00", end: "17:00" },
    Thursday: { start: "08:00", end: "17:00" },
    Friday: { start: "08:00", end: "16:00" },
    Saturday: null,
    Sunday: null,
  },
};

const formatCRMV = (crmv) => {
  return `${crmv.number}/${crmv.state}`;
};

const formatDateTime = (date) => {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date) => {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatPhone = (phone) => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const getDayName = (day) => {
  const days = {
    Monday: "Segunda",
    Tuesday: "Terça",
    Wednesday: "Quarta",
    Thursday: "Quinta",
    Friday: "Sexta",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };
  return days[day] || day;
};

export default function VeterinarianDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showActions, setShowActions] = useState(false);

  const handleCopyInfo = () => {
    const info = `
Veterinário: ${mockVeterinarian.fullName}
CRMV: ${formatCRMV(mockVeterinarian.crmv)}
Email: ${mockVeterinarian.email}
Telefone: ${formatPhone(mockVeterinarian.phoneNumber)}
Especialidades: ${mockVeterinarian.specialties.join(", ")}
    `.trim();

    navigator.clipboard.writeText(info);
    alert("Informações copiadas!");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {mockVeterinarian.fullName}
            </h1>
            <p className="text-text-secondary">
              CRMV {formatCRMV(mockVeterinarian.crmv)} •{" "}
              {mockVeterinarian.yearsOfExperience} anos de experiência
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleCopyInfo}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Info
          </Button>

          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showActions && (
              <motion.div
                className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[200px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Agenda
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Horários
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </button>
              </motion.div>
            )}
          </div>

          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <motion.div
        className="bg-success text-text-inverse rounded-lg p-4 mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6" />
          <div>
            <div className="font-semibold text-lg">Ativo</div>
            <div className="text-sm opacity-90">Disponível para consultas</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-75">Próxima consulta</div>
          <div className="font-medium">
            Hoje às{" "}
            {mockVeterinarian.recentAppointments[0]?.date.toLocaleTimeString(
              "pt-BR",
              { hour: "2-digit", minute: "2-digit" },
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          {
            label: "Consultas Totais",
            value: mockVeterinarian.stats.totalConsultations.toLocaleString(),
            icon: FileText,
            color: "primary",
          },
          {
            label: "Pets Atendidos",
            value: mockVeterinarian.stats.totalPets.toLocaleString(),
            icon: Users,
            color: "secondary",
          },
          {
            label: "Avaliação",
            value: `${mockVeterinarian.stats.averageRating}/5`,
            icon: Star,
            color: "accent",
          },
          {
            label: "Este Mês",
            value: mockVeterinarian.stats.thisMonthConsultations,
            icon: TrendingUp,
            color: "success",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "overview", label: "Visão Geral" },
          { key: "schedule", label: "Agenda" },
          { key: "appointments", label: "Consultas" },
          { key: "profile", label: "Perfil" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "ghost"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Informações Profissionais
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Nome Completo
                    </label>
                    <p className="text-text-primary">
                      {mockVeterinarian.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      CRMV
                    </label>
                    <p className="text-text-primary">
                      {formatCRMV(mockVeterinarian.crmv)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Anos de Experiência
                    </label>
                    <p className="text-text-primary">
                      {mockVeterinarian.yearsOfExperience} anos
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Data de Registro
                    </label>
                    <p className="text-text-primary">
                      {formatDate(mockVeterinarian.created_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Especialidades
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mockVeterinarian.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Biografia
                  </label>
                  <p className="text-text-primary leading-relaxed mt-1">
                    {mockVeterinarian.biography}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Informações de Contato
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-text-tertiary" />
                    <div>
                      <label className="text-sm font-medium text-text-secondary">
                        Email
                      </label>
                      <p className="text-text-primary">
                        {mockVeterinarian.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-text-tertiary" />
                    <div>
                      <label className="text-sm font-medium text-text-secondary">
                        Telefone
                      </label>
                      <p className="text-text-primary">
                        {formatPhone(mockVeterinarian.phoneNumber)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Ações Rápidas
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Agenda
                </Button>
                <Button variant="secondary" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Histórico de Consultas
                </Button>
                <Button variant="secondary" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button variant="secondary" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Próximas Consultas
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVeterinarian.recentAppointments
                    .slice(0, 3)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">
                            {appointment.petName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {appointment.date.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            • {appointment.guardianName}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Horários de Trabalho
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(mockVeterinarian.weeklySchedule).map(
                ([day, schedule]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                  >
                    <span className="font-medium text-text-primary">
                      {getDayName(day)}
                    </span>
                    {schedule ? (
                      <span className="text-text-secondary">
                        {schedule.start} - {schedule.end}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">Não trabalha</span>
                    )}
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Consultas Recentes
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockVeterinarian.recentAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  className="flex items-center space-x-4 p-4 bg-background-secondary rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-text-primary">
                        {appointment.petName}
                      </h4>
                      <span className="text-sm text-text-tertiary">•</span>
                      <span className="text-sm text-text-tertiary">
                        {appointment.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDateTime(appointment.date)}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {appointment.guardianName}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "confirmed"
                        ? "bg-success text-text-inverse"
                        : "bg-warning text-text-primary"
                    }`}
                  >
                    {appointment.status === "confirmed"
                      ? "Confirmado"
                      : "Agendado"}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Formação Acadêmica
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockVeterinarian.education.map((edu, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-primary-500 pl-4"
                  >
                    <h4 className="font-medium text-text-primary">
                      {edu.degree}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-text-tertiary">{edu.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Informações do CRMV
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Número de Registro
                </label>
                <p className="text-text-primary">
                  {formatCRMV(mockVeterinarian.crmv)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Data de Emissão
                </label>
                <p className="text-text-primary">
                  {formatDate(mockVeterinarian.crmv.issueDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Validade
                </label>
                <p className="text-text-primary">
                  {formatDate(mockVeterinarian.crmv.expirationDate)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
