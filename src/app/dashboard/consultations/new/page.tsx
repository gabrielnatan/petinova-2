//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Save,
  FileText,
  DollarSign,
  Calendar,
  Heart,
  User,
} from "lucide-react";
import {
  consultationSchema,
  type ConsultationFormData,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

// Mock data for selects
const mockAppointments = [
  {
    id: "1",
    dateTime: new Date(2025, 0, 28, 9, 0),
    pet: { name: "Buddy", species: "Cão" },
    guardian: { fullName: "João Silva" },
    veterinarian: { fullName: "Dra. Maria Santos" },
    status: "confirmed",
  },
  {
    id: "2",
    dateTime: new Date(2025, 0, 28, 14, 30),
    pet: { name: "Luna", species: "Gato" },
    guardian: { fullName: "Pedro Costa" },
    veterinarian: { fullName: "Dr. Carlos Lima" },
    status: "confirmed",
  },
];

const paymentMethods = [
  { value: "cash", label: "Dinheiro" },
  { value: "card", label: "Cartão" },
  { value: "pix", label: "PIX" },
  { value: "transfer", label: "Transferência" },
];

export default function NewConsultationPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [createPrescription, setCreatePrescription] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      paid: false,
      payment_plan: 1,
    },
  });

  const paymentPlan = watch("payment_plan");

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      console.log("Consultation data:", data);
      console.log("Selected appointment:", selectedAppointment);
      console.log("Create prescription:", createPrescription);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = "/dashboard/consultations";
    } catch (error) {
      console.error("Error creating consultation:", error);
    }
  };

  const handleAppointmentSelect = (appointmentId: string) => {
    const appointment = mockAppointments.find((a) => a.id === appointmentId);
    setSelectedAppointment(appointment);
    setValue("appointment_id", appointmentId);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost">
          <Link href="/dashboard/consultations">
            <ArrowLeft className="w-4 h-4 mr-2" />
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
                    >
                      <option value="">Selecione um agendamento</option>
                      {mockAppointments.map((appointment) => (
                        <option key={appointment.id} value={appointment.id}>
                          {appointment.pet.name} -{" "}
                          {appointment.guardian.fullName} -{" "}
                          {appointment.dateTime.toLocaleDateString("pt-BR")}{" "}
                          {appointment.dateTime.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </option>
                      ))}
                    </select>
                    {errors.appointment_id && (
                      <p className="text-sm text-error mt-1">
                        {errors.appointment_id.message}
                      </p>
                    )}
                  </div>

                  {selectedAppointment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
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
                    </motion.div>
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
                    {...register("description")}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                    rows={4}
                    placeholder="Descreva os procedimentos realizados, diagnóstico, observações..."
                  />
                  {errors.description && (
                    <p className="text-sm text-error mt-1">
                      {errors.description.message}
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Informações de Pagamento
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Valor da Consulta"
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  error={errors.amount?.message}
                  placeholder="150.00"
                  icon={DollarSign}
                />

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Forma de Pagamento
                  </label>
                  <select
                    {...register("payment_method")}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                  >
                    <option value="">Selecione a forma de pagamento</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                  {errors.payment_method && (
                    <p className="text-sm text-error mt-1">
                      {errors.payment_method.message}
                    </p>
                  )}
                </div>

                <Input
                  label="Número de Parcelas"
                  type="number"
                  min="1"
                  max="12"
                  {...register("payment_plan", { valueAsNumber: true })}
                  error={errors.payment_plan?.message}
                  placeholder="1"
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("paid")}
                    className="h-4 w-4 text-primary-600 border-border rounded focus:ring-primary-500"
                  />
                  <label className="text-sm text-text-primary">
                    Pagamento realizado
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Resumo
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Valor total:</span>
                  <span className="text-text-primary font-medium">
                    {watch("amount")
                      ? `R$ ${Number(watch("amount")).toFixed(2)}`
                      : "R$ 0,00"}
                  </span>
                </div>
                {paymentPlan && paymentPlan > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      Valor por parcela:
                    </span>
                    <span className="text-text-primary font-medium">
                      {watch("amount")
                        ? `R$ ${(Number(watch("amount")) / paymentPlan).toFixed(2)}`
                        : "R$ 0,00"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Status:</span>
                  <span
                    className={`font-medium ${watch("paid") ? "text-success" : "text-warning"}`}
                  >
                    {watch("paid") ? "Pago" : "Pendente"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary">
            <Link href="/dashboard/consultations">Cancelar</Link>
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
