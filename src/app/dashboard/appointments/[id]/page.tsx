"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Trash2,
  Copy,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatPhone } from "@/lib/utils";
import Link from "next/link";
import { appointmentAPI, type Appointment } from "@/lib/api/appointments";
import { useAuth } from "@/store";
const statusConfig = {
  SCHEDULED: {
    label: "Agendado",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
    description: "Agendamento confirmado, aguardando data",
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "bg-primary-500 text-text-inverse",
    icon: CheckCircle,
    description: "Cliente confirmou presença",
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-info text-info-foreground",
    icon: Clock,
    description: "Consulta em andamento",
  },
  COMPLETED: {
    label: "Concluído",
    color: "bg-success text-success-foreground",
    icon: CheckCircle,
    description: "Consulta realizada com sucesso",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-error text-error-foreground",
    icon: XCircle,
    description: "Agendamento cancelado",
  },
};
export default function AppointmentDetailPage() {
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const [showActions, setShowActions] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const appointmentId = params?.id as string;
  // Verificar autenticação
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
  }, [checkAuth]);
  // Redirecionar se não autenticado
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router, authChecked]);
  // Buscar dados do agendamento
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !appointmentId) return;
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await appointmentAPI.getAppointment(appointmentId);
        setAppointment(response.appointment);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        setError("Erro ao carregar dados do agendamento");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [authChecked, isAuthenticated, appointmentId]);
  const handleStatusChange = async (newStatus: string) => {
    if (!appointment) return;
    try {
      await appointmentAPI.updateAppointmentStatus(appointment.appointment_id, newStatus as any);
      // Recarregar dados
      const response = await appointmentAPI.getAppointment(appointmentId);
      setAppointment(response.appointment);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Erro ao atualizar status");
    }
  };
  const handleCopyInfo = () => {
    if (!appointment) return;
    const info = `
Agendamento #${appointmentId}
Pet: ${appointment.pet.name}
Tutor: ${appointment.guardian.fullName}
Data: ${formatDateTime(appointment.dateTime)}
Veterinário: ${appointment.veterinarian.fullName}
    `.trim();
    navigator.clipboard.writeText(info);
    // Show success toast
  };
  if (!authChecked || loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando agendamento...</span>
        </div>
      </div>
    );
  }
  if (error || !appointment) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/appointments" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <Card className="border-error">
          <CardContent className="p-6 text-center">
            <p className="text-error">{error || "Agendamento não encontrado"}</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/appointments">Voltar para lista</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig];
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/appointments" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Agendamento #{appointmentId}
            </h1>
            <p className="text-text-secondary">
              Criado em {formatDateTime(appointment.created_at)}
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
              <div
                className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[200px]"
              >
                <Link
                  href={`/dashboard/appointments/${appointmentId}/edit`}
                  className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Agendamento
                </Link>
                                    {appointment.status === "SCHEDULED" && (
                      <button
                        onClick={() => handleStatusChange("CONFIRMED")}
                        className="flex items-center w-full px-3 py-2 text-sm text-primary-600 hover:bg-background-secondary"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Confirmado
                      </button>
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleStatusChange("COMPLETED")}
                        className="flex items-center w-full px-3 py-2 text-sm text-success hover:bg-background-secondary"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Concluído
                      </button>
                    )}
                <hr className="my-1 border-border" />
                <button
                  onClick={() => handleStatusChange("CANCELLED")}
                  className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-background-secondary"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar Agendamento
                </button>
              </div>
            )}
          </div>
          <Button asChild>
            <Link href={`/dashboard/appointments/${appointmentId}/edit`} className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>
      {/* Status Banner */}
      <div
        className={`${statusInfo.color} rounded-lg p-4 mb-6 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-3">
          <statusInfo.icon className="w-6 h-6" />
          <div>
            <div className="font-semibold text-lg">{statusInfo.label}</div>
            <div className="text-sm opacity-90">{statusInfo.description}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-75">Status atualizado em</div>
          <div className="font-medium">
            {formatDateTime(appointment.updated_at)}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "details", label: "Detalhes" },
          { key: "history", label: "Histórico" },
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
      {/* Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Detalhes do Agendamento
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Data e Hora
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-text-tertiary" />
                      <span className="text-text-primary font-medium">
                        {formatDateTime(appointment.dateTime)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Status
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <statusInfo.icon className="w-4 h-4 text-text-tertiary" />
                      <span className="text-text-primary font-medium">
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Observações
                  </label>
                  <div className="mt-1 p-3 bg-background-secondary rounded-md">
                    <p className="text-text-primary">{appointment.notes || 'Nenhuma observação adicional'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Pet Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Informações do Pet
                </h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {appointment.pet.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Espécie:</span>
                        <div className="font-medium text-text-primary">
                          {appointment.pet.species}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Raça:</span>
                        <div className="font-medium text-text-primary">
                          {appointment.pet.breed || 'Não informado'}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-secondary">ID:</span>
                        <div className="font-medium text-text-primary">
                          #{appointment.pet.pet_id}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      href={`/dashboard/pets/${appointment.pet.pet_id}`} className="flex items-center justify-center"
                    >
                      Ver Perfil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Guardian Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações do Tutor
                </h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      {appointment.guardian.fullName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {appointment.guardian.phone ? formatPhone(appointment.guardian.phone) : 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {appointment.guardian.email}
                        </span>
                      </div>
                      {appointment.guardian.address && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-text-tertiary mt-0.5" />
                          <span className="text-text-primary">
                            {appointment.guardian.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link
                        href={`/dashboard/guardians/${appointment.guardian.guardian_id}`} className="flex items-center justify-center"
                      >
                        Ver Perfil
                      </Link>
                    </Button>
                    {appointment.guardian.phone && (
                      <Button variant="secondary" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Veterinarian Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Veterinário
                </h3>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-10 h-10 text-accent-600" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-1">
                    {appointment.veterinarian.fullName}
                  </h4>
                  <p className="text-sm text-text-secondary mb-2">
                    {appointment.veterinarian.role}
                  </p>

                  <Button variant="secondary" size="sm" className="w-full">
                    Ver Agenda
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Ações Rápidas
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/dashboard/consultations/new" className="flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Iniciar Consulta
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reagendar
                </Button>
                <Button variant="secondary" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Lembrete
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-error hover:bg-error/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancelar Agendamento
                </Button>
              </CardContent>
            </Card>
            {/* Appointment Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Informações
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    ID do Agendamento:
                  </span>
                  <span className="text-text-primary font-medium">
                    #{appointmentId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Criado em:</span>
                  <span className="text-text-primary">
                    {formatDateTime(appointment.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Última atualização:
                  </span>
                  <span className="text-text-primary">
                    {formatDateTime(appointment.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* History Tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Histórico de Alterações
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: new Date(2025, 0, 25, 14, 30),
                  action: "Status alterado para Confirmado",
                  user: "Recepção",
                  details: "Cliente confirmou presença via WhatsApp",
                },
                {
                  date: new Date(2025, 0, 20, 9, 15),
                  action: "Agendamento criado",
                  user: "João Silva",
                  details: "Agendamento realizado pelo portal do cliente",
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-background-secondary rounded-lg"
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-text-primary">
                        {event.action}
                      </span>
                      <span className="text-sm text-text-tertiary">
                        {formatDateTime(event.date)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">
                      {event.details}
                    </p>
                    <span className="text-xs text-text-tertiary">
                      por {event.user}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
