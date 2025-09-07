"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Save,
  FileText,
  Calendar,
  Heart,
  User,
} from "lucide-react";
import {
  consultationSchema,
  type ConsultationFormData,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { consultationAPI, type CreateConsultationData } from "@/lib/api/consultations";
import { appointmentAPI } from "@/lib/api/appointments";
import { useAuth } from "@/store";
import { useRouter } from "next/navigation";
export default function NewConsultationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createPrescription, setCreatePrescription] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {},
  });

  // Carregar agendamentos disponíveis
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const response = await appointmentAPI.getAppointments({
          status: 'CONFIRMED',
          limit: 100
        });
        setAppointments(response.appointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setError('Erro ao carregar agendamentos');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthenticated]);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      setError(null);
      
      if (!selectedAppointment) {
        setError('Selecione um agendamento');
        return;
      }

      const consultationData: CreateConsultationData = {
        petId: selectedAppointment.pet_id,
        veterinarianId: selectedAppointment.veterinarian_id,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes
      };

      await consultationAPI.createConsultation(consultationData);
      router.push('/dashboard/consultations');
    } catch (error) {
      console.error("Error creating consultation:", error);
      setError(error instanceof Error ? error.message : 'Erro ao criar consulta');
    }
  };
  const handleAppointmentSelect = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.appointment_id === appointmentId);
    setSelectedAppointment(appointment);
  };
  return (
    <div className="p-6  mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/consultations" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Nova Consulta
          </h1>
          <p className="text-text-secondary">
            Registre uma nova consulta realizada
          </p>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <Card className="border-error">
          <CardContent className="p-4">
            <p className="text-error text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando agendamentos...</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Appointment Selection */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendamento
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Selecionar Agendamento
                    </label>
                    <select
                      onChange={(e) => handleAppointmentSelect(e.target.value)}
                      className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                      disabled={loading}
                    >
                      <option value="">Selecione um agendamento</option>
                      {appointments.map((appointment) => (
                        <option key={appointment.appointment_id} value={appointment.appointment_id}>
                          {appointment.pet.name} -{" "}
                          {appointment.guardian.fullName} -{" "}
                          {new Date(appointment.dateTime).toLocaleDateString("pt-BR")}{" "}
                          {new Date(appointment.dateTime).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </option>
                      ))}
                    </select>
                    {/* {errors.appointment_id && (
                      <p className="text-sm text-error mt-1">
                        {errors.appointment_id.message}
                      </p>
                    )} */}
                  </div>
                  {selectedAppointment && (
                    <div
                      className="bg-background-secondary rounded-md p-4"
                    >
                      <h3 className="font-medium text-text-primary mb-2">
                        Detalhes do Agendamento
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-2 text-primary-500" />
                          <span>
                            {selectedAppointment.pet.name} (
                            {selectedAppointment.pet.species})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-text-tertiary" />
                          <span>{selectedAppointment.guardian.fullName}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-text-tertiary" />
                          <span>
                            {selectedAppointment.veterinarian.fullName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Consultation Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Detalhes da Consulta
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Descrição da Consulta
                  </label>
                  <textarea
                    {...register("notes")}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                    rows={4}
                    placeholder="Descreva os procedimentos realizados, diagnóstico, observações..."
                  />
                  {errors.notes && (
                    <p className="text-sm text-error mt-1">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createPrescription}
                    onChange={(e) => setCreatePrescription(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-border rounded focus:ring-primary-500"
                  />
                  <label className="text-sm text-text-primary">
                    Criar prescrição médica
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column - Commented out due to schema mismatch */}
          {/* <div className="space-y-6">
            Payment Information
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Informações de Pagamento
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                Payment form fields removed due to schema mismatch
              </CardContent>
            </Card>
          </div> */}
        </div>
        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/consultations" className="flex items-center justify-center">Cancelar</Link>
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Consulta
          </Button>
        </div>
      </form>
    </div>
  );
}
