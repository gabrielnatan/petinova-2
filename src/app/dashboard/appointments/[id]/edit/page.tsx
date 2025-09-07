"use client"
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Heart,
  AlertTriangle,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { appointmentAPI, type Appointment, type Veterinarian } from "@/lib/api/appointments";
import { useAuth } from "@/store";
// Schema de validação
const editAppointmentSchema = z.object({
  dateTime: z.string().min(1, "Data e hora são obrigatórias"),
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
  notes: z.string().optional(),
  veterinarianId: z.string().min(1, "Veterinário é obrigatório"),
});
type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;
const statusConfig = {
  SCHEDULED: {
    label: "Agendado",
    color: "bg-warning text-warning-foreground",
    description: "Agendamento confirmado, aguardando data",
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "bg-primary-500 text-text-inverse",
    description: "Cliente confirmou presença",
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-info text-info-foreground",
    description: "Consulta em andamento",
  },
  COMPLETED: {
    label: "Concluído",
    color: "bg-success text-success-foreground",
    description: "Consulta realizada com sucesso",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-error text-error-foreground",
    description: "Agendamento cancelado",
  },
};
export default function EditAppointmentPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const appointmentId = params?.id as string;
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditAppointmentFormData>({
    resolver: zodResolver(editAppointmentSchema),
  });
  const selectedStatus = watch("status");
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
  // Buscar dados do agendamento e veterinários
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !appointmentId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Buscar agendamento e veterinários em paralelo
        const [appointmentResponse, veterinariansData] = await Promise.all([
          appointmentAPI.getAppointment(appointmentId),
          appointmentAPI.getVeterinarians()
        ]);
        setAppointment(appointmentResponse.appointment);
        setVeterinarians(veterinariansData);
        // Preencher formulário
        const appointment = appointmentResponse.appointment;
        reset({
          dateTime: appointment.dateTime.slice(0, 16), // Remove timezone info
          status: appointment.status,
          notes: appointment.notes || '',
          veterinarianId: appointment.veterinarian_id,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Erro ao carregar dados do agendamento");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authChecked, isAuthenticated, appointmentId, reset]);
  const onSubmit = async (data: EditAppointmentFormData) => {
    try {
      // Converter dateTime para o formato esperado pela API
      const [date, time] = data.dateTime.split('T');
      await appointmentAPI.updateAppointment(appointmentId, {
        date,
        time,
        status: data.status,
        notes: data.notes,
        veterinarianId: data.veterinarianId,
      });
      router.push(`/dashboard/appointments/${appointmentId}`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Erro ao atualizar agendamento");
    }
  };
  const handleDelete = async () => {
    try {
      await appointmentAPI.deleteAppointment(appointmentId);
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setError("Erro ao excluir agendamento");
    }
  };
  const isStatusCritical = selectedStatus === "CANCELLED";
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
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/appointments/${appointmentId}`} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Agendamento #{appointmentId}
            </h1>
            <p className="text-text-secondary">
              Última atualização: {formatDateTime(appointment.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="text-error hover:bg-error/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Display */}
        {error && (
          <Card className="border-error">
            <CardContent className="p-4">
              <p className="text-error text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pet and Guardian Info (Read-only) */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Informações do Agendamento
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {appointment.pet.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {appointment.pet.breed} •{" "}
                          {appointment.pet.species}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>ID:</strong> #{appointment.pet.pet_id}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {appointment.guardian.fullName}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Tutor responsável
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>Email:</strong> {appointment.guardian.email}
                      </p>
                      <p>
                        <strong>Telefone:</strong>{" "}
                        {appointment.guardian.phone || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Appointment Details Form */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Detalhes do Agendamento
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Data e Hora"
                    type="datetime-local"
                    {...register("dateTime")}
                    error={errors.dateTime?.message}
                    icon={Calendar}
                  />
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Veterinário
                    </label>
                    <select
                      {...register("veterinarianId")}
                      className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                    >
                      {veterinarians.map((vet) => (
                        <option
                          key={vet.veterinarian_id}
                          value={vet.veterinarian_id}
                        >
                          {vet.fullName} - {vet.role}
                        </option>
                      ))}
                    </select>
                    {errors.veterinarianId && (
                      <p className="text-sm text-error mt-1">
                        {errors.veterinarianId.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                  >
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="text-sm text-error mt-1">
                      {errors.status.message}
                    </p>
                  )}
                  {selectedStatus && (
                    <div
                      className={`mt-2 p-2 rounded-md text-sm ${statusConfig[selectedStatus].color}`}
                    >
                      {statusConfig[selectedStatus].description}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Observações
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={4}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                    placeholder="Descreva o motivo da consulta, procedimentos necessários, etc."
                  />
                  {errors.notes && (
                    <p className="text-sm text-error mt-1">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
                {isStatusCritical && (
                  <div
                    className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start space-x-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                    <div>
                      <h4 className="font-medium text-error mb-1">Atenção</h4>
                                          <p className="text-sm text-error/80">
                      Ao alterar o status para &quot;Cancelado&quot;, o horário ficará disponível para outros agendamentos e isso será registrado no histórico do cliente.
                    </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Status Atual
                </h3>
              </CardHeader>
              <CardContent>
                <div
                  className={`${statusConfig[appointment.status as keyof typeof statusConfig].color} rounded-lg p-4 text-center`}
                >
                  <div className="font-semibold text-lg mb-1">
                    {statusConfig[appointment.status as keyof typeof statusConfig].label}
                  </div>
                  <div className="text-sm opacity-90">
                    {statusConfig[appointment.status as keyof typeof statusConfig].description}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Ações
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={!isDirty}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/dashboard/appointments/${appointmentId}`} className="flex items-center justify-center">
                    Cancelar Edição
                  </Link>
                </Button>
                <hr className="border-border" />
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/dashboard/consultations/new" className="flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Iniciar Consulta
                  </Link>
                </Button>
              </CardContent>
            </Card>
            {/* Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Informações
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">ID:</span>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-surface rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Excluir Agendamento
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir permanentemente este agendamento?
              Todas as informações associadas serão perdidas.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="ghost"
                className="text-error hover:bg-error/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
