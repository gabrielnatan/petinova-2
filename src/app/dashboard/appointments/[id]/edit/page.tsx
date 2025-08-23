"use client"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

// Schema de validação
const editAppointmentSchema = z.object({
  dateTime: z.string().min(1, "Data e hora são obrigatórias"),
  status: z.enum([
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ]),
  notes: z.string().min(1, "Observações são obrigatórias"),
  veterinarianId: z.string().min(1, "Veterinário é obrigatório"),
});

type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;

// Mock data - replace with actual data fetching
const mockAppointment = {
  appointment_id: "1",
  dateTime: new Date(2025, 0, 28, 9, 0),
  status: "confirmed",
  notes:
    "Consulta de rotina - Verificação geral de saúde, atualização de vacinas e exame de sangue preventivo.",
  pet: {
    pet_id: "1",
    name: "Buddy",
    species: "Cão",
    breed: "Golden Retriever",
    age: "4 anos",
    weight: "30kg",
    color: "Dourado",
    isNeutered: true,
    avatarUrl: null,
  },
  guardian: {
    guardian_id: "1",
    fullName: "João Silva",
    phone: "11999999999",
    email: "joao.silva@email.com",
  },
  veterinarian: {
    veterinarian_id: "1",
    fullName: "Dra. Maria Santos",
    specialty: "Clínica Geral",
    crmv: "12345/SP",
  },
  clinic: {
    clinic_id: "1",
    tradeName: "Clínica São Bento",
  },
  created_at: new Date(2025, 0, 20),
  updated_at: new Date(2025, 0, 25),
};

// Mock veterinarians list
const mockVeterinarians = [
  {
    veterinarian_id: "1",
    fullName: "Dra. Maria Santos",
    specialty: "Clínica Geral",
    crmv: "12345/SP",
  },
  {
    veterinarian_id: "2",
    fullName: "Dr. Carlos Lima",
    specialty: "Cirurgia",
    crmv: "23456/SP",
  },
  {
    veterinarian_id: "3",
    fullName: "Dra. Ana Oliveira",
    specialty: "Dermatologia",
    crmv: "34567/SP",
  },
];

const statusConfig = {
  scheduled: {
    label: "Agendado",
    color: "bg-warning text-warning-foreground",
    description: "Agendamento confirmado, aguardando data",
  },
  confirmed: {
    label: "Confirmado",
    color: "bg-primary-500 text-text-inverse",
    description: "Cliente confirmou presença",
  },
  completed: {
    label: "Concluído",
    color: "bg-success text-success-foreground",
    description: "Consulta realizada com sucesso",
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-error text-error-foreground",
    description: "Agendamento cancelado",
  },
  no_show: {
    label: "Não Compareceu",
    color: "bg-error text-error-foreground",
    description: "Cliente não compareceu na data agendada",
  },
};

export default function EditAppointmentPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const params = useParams();
  const appointmentId = params?.id as string;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditAppointmentFormData>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      dateTime: mockAppointment.dateTime.toISOString().slice(0, 16),
      status: mockAppointment.status as any,
      notes: mockAppointment.notes,
      veterinarianId: mockAppointment.veterinarian.veterinarian_id,
    },
  });

  const selectedStatus = watch("status");

  const onSubmit = async (data: EditAppointmentFormData) => {
    try {
      console.log("Updating appointment:", { id: appointmentId, ...data });

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to appointment details
      window.location.href = `/dashboard/appointments/${appointmentId}`;
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting appointment:", appointmentId);

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to appointments list
      window.location.href = "/dashboard/appointments";
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };



  const isStatusCritical =
    selectedStatus === "cancelled" || selectedStatus === "no_show";

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
              Última atualização: {formatDateTime(mockAppointment.updated_at)}
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
                          {mockAppointment.pet.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {mockAppointment.pet.breed} •{" "}
                          {mockAppointment.pet.species}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>Idade:</strong> {mockAppointment.pet.age}
                      </p>
                      <p>
                        <strong>Peso:</strong> {mockAppointment.pet.weight}
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
                          {mockAppointment.guardian.fullName}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Tutor responsável
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>Email:</strong> {mockAppointment.guardian.email}
                      </p>
                      <p>
                        <strong>Telefone:</strong>{" "}
                        {mockAppointment.guardian.phone}
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
                      {mockVeterinarians.map((vet) => (
                        <option
                          key={vet.veterinarian_id}
                          value={vet.veterinarian_id}
                        >
                          {vet.fullName} - {vet.specialty}
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
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start space-x-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                    <div>
                      <h4 className="font-medium text-error mb-1">Atenção</h4>
                      <p className="text-sm text-error/80">
                        {selectedStatus === "cancelled"
                          ? 'Ao alterar o status para "Cancelado", o horário ficará disponível para outros agendamentos.'
                          : 'Ao marcar como "Não Compareceu", isso será registrado no histórico do cliente.'}
                      </p>
                    </div>
                  </motion.div>
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
                  className={`${statusConfig[mockAppointment.status as keyof typeof statusConfig].color} rounded-lg p-4 text-center`}
                >
                  <div className="font-semibold text-lg mb-1">
                    {
                      statusConfig[
                        mockAppointment.status as keyof typeof statusConfig
                      ].label
                    }
                  </div>
                  <div className="text-sm opacity-90">
                    {
                      statusConfig[
                        mockAppointment.status as keyof typeof statusConfig
                      ].description
                    }
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
                    {formatDateTime(mockAppointment.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Clínica:</span>
                  <span className="text-text-primary">
                    {mockAppointment.clinic.tradeName}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
