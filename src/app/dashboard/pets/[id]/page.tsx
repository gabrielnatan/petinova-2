//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  User,
  Heart,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  FileText,
  Camera,
  Plus,
  Activity,
  Scale,
  Shield,
  AlertCircle,
  Eye,
  Syringe,
  Clipboard,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatDate, formatPhone } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock data - replace with actual data fetching
const mockPet = {
  pet_id: "1",
  name: "Buddy",
  species: "Canina",
  breed: "Golden Retriever",
  size: "Grande",
  weight: 30,
  isNeutered: true,
  environment: "Casa com quintal",
  deathDate: null,
  birthDate: new Date("2021-03-15"),
  notes:
    "Pet muito dócil e brincalhão. Gosta de água e tem tendência a ganhar peso. Necessita exercícios regulares.",
  coatType: "Longo",
  color: "Dourado",
  avatarUrl: null,
  proceduresPerformed: [
    "Castração",
    "Microchip",
    "Vacinação V10",
    "Vermifugação",
  ],
  preexistingConditions: [
    "Displasia coxofemoral leve",
    "Tendência à obesidade",
  ],
  restrictions: [
    "Evitar exercícios intensos",
    "Dieta controlada",
    "Não pode comer chocolate",
  ],
  created_at: new Date("2024-01-15"),
  updated_at: new Date("2025-01-20"),

  guardian: {
    guardian_id: "1",
    fullName: "João Silva",
    phone: "11999999999",
    email: "joao.silva@email.com",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    cpf: "123.456.789-00",
  },

  clinic: {
    clinic_id: "1",
    tradeName: "Clínica São Bento",
  },

  // Últimas consultas
  recentConsultations: [
    {
      consultation_id: "1",
      date: new Date("2025-01-20"),
      type: "Consulta de Rotina",
      veterinarian: "Dra. Maria Santos",
      description: "Check-up geral, vacinação V10 e orientações nutricionais.",
      weight: 30,
      temperature: 38.5,
      heartRate: 85,
      status: "completed",
    },
    {
      consultation_id: "2",
      date: new Date("2024-12-15"),
      type: "Retorno",
      veterinarian: "Dra. Maria Santos",
      description: "Acompanhamento pós-cirúrgico. Cicatrização adequada.",
      weight: 29.5,
      temperature: 38.2,
      heartRate: 88,
      status: "completed",
    },
    {
      consultation_id: "3",
      date: new Date("2024-11-20"),
      type: "Cirurgia",
      veterinarian: "Dr. Carlos Lima",
      description: "Castração eletiva. Procedimento sem intercorrências.",
      weight: 29,
      temperature: 38.0,
      heartRate: 92,
      status: "completed",
    },
  ],

  // Próximos agendamentos
  upcomingAppointments: [
    {
      appointment_id: "1",
      date: new Date("2025-02-15"),
      time: "10:00",
      type: "Check-up",
      veterinarian: "Dra. Maria Santos",
      notes: "Retorno preventivo - 6 meses",
      status: "scheduled",
    },
  ],

  // Vacinas
  vaccinations: [
    {
      id: "1",
      name: "V10 (Décupla)",
      date: new Date("2025-01-20"),
      nextDue: new Date("2026-01-20"),
      veterinarian: "Dra. Maria Santos",
      batch: "VAC2025001",
      status: "current",
    },
    {
      id: "2",
      name: "Antirrábica",
      date: new Date("2024-08-15"),
      nextDue: new Date("2025-08-15"),
      veterinarian: "Dra. Maria Santos",
      batch: "RAB2024512",
      status: "due_soon",
    },
    {
      id: "3",
      name: "Gripe Canina",
      date: new Date("2024-06-10"),
      nextDue: new Date("2025-06-10"),
      veterinarian: "Dr. Carlos Lima",
      batch: "GRI2024234",
      status: "current",
    },
  ],

  // Histórico de peso
  weightHistory: [
    { date: new Date("2025-01-20"), weight: 30.0 },
    { date: new Date("2024-12-15"), weight: 29.5 },
    { date: new Date("2024-11-20"), weight: 29.0 },
    { date: new Date("2024-10-15"), weight: 28.5 },
    { date: new Date("2024-09-10"), weight: 28.0 },
  ],

  stats: {
    totalConsultations: 8,
    totalVaccinations: 6,
    avgWeight: 29.2,
    lastVisit: new Date("2025-01-20"),
    nextVisit: new Date("2025-02-15"),
    clientSince: new Date("2024-01-15"),
  },
};

export default function PetDetailPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "medical" | "vaccinations" | "history"
  >("overview");
  const params = useParams();
  const appointmentId = params?.id as string;
  // Calcular idade
  const calculateAge = (birthDate: Date) => {
    const now = new Date();
    const years = now.getFullYear() - birthDate.getFullYear();
    const months = now.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      return { years: years - 1, months: months + 12 };
    }

    return { years, months };
  };

  const age = calculateAge(mockPet.birthDate);
  const ageString = `${age.years} ano${age.years !== 1 ? "s" : ""}${age.months > 0 ? ` e ${age.months} mes${age.months !== 1 ? "es" : ""}` : ""}`;

  // Status das vacinas
  const getVaccineStatus = (vaccine: any) => {
    const now = new Date();
    const daysUntilDue = Math.ceil(
      (vaccine.nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilDue < 0) {
      return {
        status: "overdue",
        color: "text-error",
        bg: "bg-error/10",
        label: "Atrasada",
        days: Math.abs(daysUntilDue),
      };
    } else if (daysUntilDue <= 30) {
      return {
        status: "due_soon",
        color: "text-warning",
        bg: "bg-warning/10",
        label: "Vence em breve",
        days: daysUntilDue,
      };
    } else {
      return {
        status: "current",
        color: "text-success",
        bg: "bg-success/10",
        label: "Em dia",
        days: daysUntilDue,
      };
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost">
            <Link href="/dashboard/pets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {mockPet.name}
            </h1>
            <p className="text-text-secondary">
              {mockPet.breed} • {mockPet.species} • {ageString}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary">
            <Link href="/dashboard/appointments/new">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Consulta
            </Link>
          </Button>

          <Button>
            <Link href={`/dashboard/pets/${appointmentId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Pet Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                {mockPet.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mockPet.avatarUrl}
                    alt={mockPet.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Heart className="w-12 h-12 text-primary-600" />
                )}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <Camera className="w-4 h-4 mr-1" />
                Foto
              </Button>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Espécie
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.species}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Raça
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.breed}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Porte
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.size}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Peso Atual
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.weight} kg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Cor
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.color}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Pelagem
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.coatType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Castrado
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.isNeutered ? "Sim" : "Não"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Ambiente
                  </label>
                  <p className="text-text-primary font-medium">
                    {mockPet.environment}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-1 gap-3 text-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-lg font-bold text-primary-500">
                    {mockPet.stats.totalConsultations}
                  </div>
                  <div className="text-xs text-text-secondary">Consultas</div>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="text-lg font-bold text-success">
                    {mockPet.stats.totalVaccinations}
                  </div>
                  <div className="text-xs text-text-secondary">Vacinas</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="text-lg font-bold text-accent-500">
                    {mockPet.stats.avgWeight}
                  </div>
                  <div className="text-xs text-text-secondary">Peso Médio</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "overview", label: "Visão Geral" },
          { key: "medical", label: "Histórico Médico" },
          { key: "vaccinations", label: "Vacinas" },
          { key: "history", label: "Evolução" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "ghost"}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guardian Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Tutor Responsável
                </h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      {mockPet.guardian.fullName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {formatPhone(mockPet.guardian.phone)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {mockPet.guardian.email}
                        </span>
                      </div>
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-text-tertiary mt-0.5" />
                        <span className="text-text-primary">
                          {mockPet.guardian.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Link
                      href={`/dashboard/guardians/${mockPet.guardian.guardian_id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Perfil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Consultas Recentes
                  </h2>
                  <Button variant="secondary" size="sm">
                    <Link href="/dashboard/consultations">Ver Todas</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPet.recentConsultations.map((consultation, index) => (
                    <motion.div
                      key={consultation.consultation_id}
                      className="p-4 bg-background-secondary rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            {consultation.type}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            {formatDateTime(consultation.date)} •{" "}
                            {consultation.veterinarian}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Link
                            href={`/dashboard/consultations/${consultation.consultation_id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                      <p className="text-text-primary text-sm mb-3">
                        {consultation.description}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Scale className="w-4 h-4 text-text-tertiary" />
                          <span className="text-text-secondary">Peso:</span>
                          <span className="text-text-primary font-medium">
                            {consultation.weight} kg
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-text-tertiary" />
                          <span className="text-text-secondary">Temp:</span>
                          <span className="text-text-primary font-medium">
                            {consultation.temperature}°C
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-text-tertiary" />
                          <span className="text-text-secondary">FC:</span>
                          <span className="text-text-primary font-medium">
                            {consultation.heartRate} bpm
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes and Observations */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Observações Gerais
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-text-primary whitespace-pre-line">
                  {mockPet.notes}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Próximos Agendamentos
                  </h3>
                  <Button size="sm">
                    <Link href="/dashboard/appointments/new">
                      <Plus className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mockPet.upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {mockPet.upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.appointment_id}
                        className="p-3 bg-background-secondary rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {appointment.type}
                          </h4>
                          <span className="text-xs text-success font-medium">
                            Agendado
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-text-tertiary" />
                            <span className="text-text-primary">
                              {formatDate(appointment.date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-text-tertiary" />
                            <span className="text-text-primary">
                              {appointment.time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-text-tertiary" />
                            <span className="text-text-primary">
                              {appointment.veterinarian}
                            </span>
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-xs text-text-secondary mt-2">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                    <p className="text-text-secondary text-sm">
                      Nenhum agendamento
                    </p>
                    <Button size="sm" className="mt-2">
                      <Link href="/dashboard/appointments/new">
                        <Plus className="w-4 h-4 mr-1" />
                        Agendar
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Health Status */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Status de Saúde
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Última consulta:</span>
                  <span className="text-text-primary font-medium">
                    {formatDate(mockPet.stats.lastVisit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Próxima visita:</span>
                  <span className="text-text-primary font-medium">
                    {formatDate(mockPet.stats.nextVisit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Vacinas em dia:</span>
                  <span className="text-success font-medium">Sim</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Peso ideal:</span>
                  <span className="text-warning font-medium">Monitorar</span>
                </div>
              </CardContent>
            </Card>

            {/* Procedures Performed */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Clipboard className="w-5 h-5 mr-2" />
                  Procedimentos Realizados
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockPet.proceduresPerformed.map((procedure, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-text-primary text-sm">
                        {procedure}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Health Conditions */}
            {mockPet.preexistingConditions.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-warning" />
                    Condições Pré-existentes
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockPet.preexistingConditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-warning rounded-full" />
                        <span className="text-text-primary text-sm">
                          {condition}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Restrictions */}
            {mockPet.restrictions.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-error" />
                    Restrições
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockPet.restrictions.map((restriction, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-error rounded-full" />
                        <span className="text-text-primary text-sm">
                          {restriction}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Medical Tab */}
      {activeTab === "medical" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Histórico de Consultas
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPet.recentConsultations.map((consultation, index) => (
                    <motion.div
                      key={consultation.consultation_id}
                      className="p-4 border border-border rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            {consultation.type}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            {formatDateTime(consultation.date)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Link
                            href={`/dashboard/consultations/${consultation.consultation_id}`}
                          >
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                      <p className="text-sm text-text-primary mb-3">
                        {consultation.description}
                      </p>
                      <div className="text-xs text-text-secondary">
                        Veterinário: {consultation.veterinarian}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Sinais Vitais
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPet.recentConsultations
                    .slice(0, 3)
                    .map((consultation, index) => (
                      <div
                        key={index}
                        className="p-3 bg-background-secondary rounded-lg"
                      >
                        <div className="text-sm text-text-secondary mb-2">
                          {formatDate(consultation.date)}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-text-secondary">Peso:</span>
                            <div className="font-medium text-text-primary">
                              {consultation.weight} kg
                            </div>
                          </div>
                          <div>
                            <span className="text-text-secondary">Temp:</span>
                            <div className="font-medium text-text-primary">
                              {consultation.temperature}°C
                            </div>
                          </div>
                          <div>
                            <span className="text-text-secondary">FC:</span>
                            <div className="font-medium text-text-primary">
                              {consultation.heartRate} bpm
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Procedimentos
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPet.proceduresPerformed.map((procedure, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-success/10 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-success text-sm font-medium">
                        {procedure}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Condições
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPet.preexistingConditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-warning/10 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-warning text-sm font-medium">
                        {condition}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Restrições
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPet.restrictions.map((restriction, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-error/10 rounded-lg"
                    >
                      <Shield className="w-4 h-4 text-error" />
                      <span className="text-error text-sm font-medium">
                        {restriction}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Vaccinations Tab */}
      {activeTab === "vaccinations" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Syringe className="w-5 h-5 mr-2" />
                  Cartão de Vacinação
                </h3>
                <Button variant="secondary">
                  <Link href="/dashboard/vaccinations/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Vacina
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPet.vaccinations.map((vaccine, index) => {
                  const status = getVaccineStatus(vaccine);

                  return (
                    <motion.div
                      key={vaccine.id}
                      className={`p-4 border rounded-lg ${status.bg} border-opacity-20`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            {vaccine.name}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Aplicada em {formatDate(vaccine.date)}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">
                            Próxima dose:
                          </span>
                          <span className="text-text-primary font-medium">
                            {formatDate(vaccine.nextDue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">
                            Veterinário:
                          </span>
                          <span className="text-text-primary">
                            {vaccine.veterinarian}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">Lote:</span>
                          <span className="text-text-primary font-mono text-xs">
                            {vaccine.batch}
                          </span>
                        </div>

                        {status.status === "due_soon" && (
                          <div className="mt-3 p-2 bg-warning/20 rounded-md">
                            <p className="text-warning text-xs">
                              Vence em {status.days} dia
                              {status.days !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}

                        {status.status === "overdue" && (
                          <div className="mt-3 p-2 bg-error/20 rounded-md">
                            <p className="text-error text-xs">
                              Atrasada há {status.days} dia
                              {status.days !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Vaccination Schedule */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Calendário de Vacinação
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-medium text-primary mb-2">
                    Vacinas Obrigatórias para Cães
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-text-primary mb-2">
                        Essenciais:
                      </h5>
                      <ul className="space-y-1 text-text-secondary">
                        <li>• V10 (Décupla) - Anual</li>
                        <li>• Antirrábica - Anual</li>
                        <li>• Gripe Canina - Anual</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-text-primary mb-2">
                        Opcionais:
                      </h5>
                      <ul className="space-y-1 text-text-secondary">
                        <li>• Leishmaniose - Anual</li>
                        <li>• Giardia - Anual</li>
                        <li>• Bordetella - 6 meses</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Evolution */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Evolução do Peso
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPet.weightHistory.map((record, index) => {
                    const isLatest = index === 0;
                    const prevRecord = mockPet.weightHistory[index + 1];
                    const weightChange = prevRecord
                      ? record.weight - prevRecord.weight
                      : 0;

                    return (
                      <motion.div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isLatest
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-background-secondary"
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div>
                          <div className="font-medium text-text-primary">
                            {record.weight} kg
                          </div>
                          <div className="text-sm text-text-secondary">
                            {formatDate(record.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          {isLatest && (
                            <span className="text-xs text-primary font-medium">
                              Atual
                            </span>
                          )}
                          {!isLatest && weightChange !== 0 && (
                            <span
                              className={`text-xs font-medium ${
                                weightChange > 0
                                  ? "text-warning"
                                  : "text-success"
                              }`}
                            >
                              {weightChange > 0 ? "+" : ""}
                              {weightChange.toFixed(1)} kg
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-background-secondary rounded-lg">
                  <div className="text-sm text-text-secondary">
                    Peso médio: {mockPet.stats.avgWeight} kg
                  </div>
                  <div className="text-sm text-text-secondary">
                    Variação:{" "}
                    {(
                      Math.max(...mockPet.weightHistory.map((w) => w.weight)) -
                      Math.min(...mockPet.weightHistory.map((w) => w.weight))
                    ).toFixed(1)}{" "}
                    kg
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Linha do Tempo
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: mockPet.recentConsultations[0].date,
                      event: "Última consulta",
                      type: "consultation",
                    },
                    {
                      date: mockPet.vaccinations[0].date,
                      event: "Vacinação V10",
                      type: "vaccination",
                    },
                    {
                      date: mockPet.recentConsultations[2].date,
                      event: "Cirurgia de castração",
                      type: "surgery",
                    },
                    {
                      date: mockPet.created_at,
                      event: "Cadastro na clínica",
                      type: "registration",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          item.type === "consultation"
                            ? "bg-primary-500"
                            : item.type === "vaccination"
                              ? "bg-success"
                              : item.type === "surgery"
                                ? "bg-warning"
                                : "bg-accent-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">
                          {item.event}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {formatDate(item.date)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complete Medical History */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Histórico Médico Completo
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPet.recentConsultations.map((consultation, index) => (
                  <motion.div
                    key={consultation.consultation_id}
                    className="border-l-4 border-l-primary-400 pl-4 pb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-text-primary">
                          {consultation.type}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {formatDateTime(consultation.date)} •{" "}
                          {consultation.veterinarian}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                        Concluída
                      </span>
                    </div>
                    <p className="text-text-primary mb-3">
                      {consultation.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Scale className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-secondary">Peso:</span>
                        <span className="text-text-primary font-medium">
                          {consultation.weight} kg
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-secondary">
                          Temperatura:
                        </span>
                        <span className="text-text-primary font-medium">
                          {consultation.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-secondary">
                          Freq. Cardíaca:
                        </span>
                        <span className="text-text-primary font-medium">
                          {consultation.heartRate} bpm
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
