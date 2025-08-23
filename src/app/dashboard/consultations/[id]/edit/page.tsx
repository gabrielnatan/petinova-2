"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Stethoscope,
  DollarSign,
  CreditCard,
  User,
  Heart,
  FileText,
  AlertTriangle,
  Trash2,
  Pill,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

// Schema de validação
const editConsultationSchema = z.object({
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  amount: z.number().min(0, "Valor deve ser positivo"),
  payment_method: z.enum([
    "cash",
    "debit_card",
    "credit_card",
    "pix",
    "bank_transfer",
    "insurance",
  ]),
  payment_plan: z.number().min(1).max(12, "Parcelamento máximo de 12x"),
  paid: z.boolean(),
  prescriptionText: z.string().optional(),
});

type EditConsultationFormData = z.infer<typeof editConsultationSchema>;

// Mock data - replace with actual data fetching
const mockConsultation = {
  consultation_id: "1",
  description:
    "Consulta de rotina com exame físico completo, aferição de peso e temperatura. Aplicação de vacina V10 e orientações sobre alimentação. Pet apresentou comportamento normal e sinais vitais estáveis.",
  amount: 150.0,
  payment_method: "credit_card",
  payment_plan: 1,
  paid: true,
  created_at: new Date(2025, 0, 28, 9, 30),
  updated_at: new Date(2025, 0, 28, 10, 15),

  appointment: {
    appointment_id: "1",
    dateTime: new Date(2025, 0, 28, 9, 0),
    status: "completed",
    notes: "Consulta de rotina - Verificação geral",
  },

  pet: {
    pet_id: "1",
    name: "Buddy",
    species: "Cão",
    breed: "Golden Retriever",
    age: "4 anos",
    weight: 30,
    color: "Dourado",
    isNeutered: true,
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

  prescription: {
    prescription_id: "1",
    text: `RECEITUÁRIO VETERINÁRIO

Para: Buddy (Cão, Golden Retriever)
Tutor: João Silva

Prescrição:
- Ração Premium para cães adultos grandes - 2x ao dia
- Suplemento vitamínico: 1 comprimido ao dia por 30 dias
- Retorno em 6 meses para check-up

Observações:
- Manter peso atual
- Exercícios regulares
- Evitar alimentos industrializados para humanos`,
    created_at: new Date(2025, 0, 28, 10, 0),
  },
};

const paymentMethodOptions = [
  { value: "cash", label: "Dinheiro", icon: DollarSign },
  { value: "debit_card", label: "Cartão de Débito", icon: CreditCard },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard },
  { value: "pix", label: "PIX", icon: DollarSign },
  { value: "bank_transfer", label: "Transferência Bancária", icon: DollarSign },
  { value: "insurance", label: "Plano de Saúde Pet", icon: FileText },
];

export default function EditConsultationPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"consultation" | "prescription">(
    "consultation",
  );

    const params = useParams();
    const appointmentId = params?.id as string;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditConsultationFormData>({
    resolver: zodResolver(editConsultationSchema),
    defaultValues: {
      description: mockConsultation.description,
      amount: mockConsultation.amount,
      payment_method: mockConsultation.payment_method as any,
      payment_plan: mockConsultation.payment_plan,
      paid: mockConsultation.paid,
      prescriptionText: mockConsultation.prescription?.text || "",
    },
  });

  const watchAmount = watch("amount");
  const watchPaymentPlan = watch("payment_plan");
  const watchPaid = watch("paid");
  const watchPaymentMethod = watch("payment_method");

  const installmentValue =
    watchAmount && watchPaymentPlan ? watchAmount / watchPaymentPlan : 0;

  const onSubmit = async (data: EditConsultationFormData) => {
    try {
      console.log("Updating consultation:", { id: appointmentId, ...data });

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to consultation details
      window.location.href = `/dashboard/consultations/${appointmentId}`;
    } catch (error) {
      console.error("Error updating consultation:", error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting consultation:", appointmentId);

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to consultations list
      window.location.href = "/dashboard/consultations";
    } catch (error) {
      console.error("Error deleting consultation:", error);
    }
  };

  const calculatePaymentPlan = () => {
    if (watchPaymentMethod === "credit_card" && watchAmount > 100) {
      // Auto-suggest installment based on amount
      const suggestedPlan = Math.min(Math.floor(watchAmount / 50), 6);
      setValue("payment_plan", suggestedPlan || 1);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/consultations/${appointmentId}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Consulta #{appointmentId}
            </h1>
            <p className="text-text-secondary">
              Última atualização: {formatDateTime(mockConsultation.updated_at)}
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

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          {
            key: "consultation",
            label: "Dados da Consulta",
            icon: Stethoscope,
          },
          { key: "prescription", label: "Receituário", icon: Pill },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "ghost"}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
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
                  Informações do Paciente
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
                          {mockConsultation.pet.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {mockConsultation.pet.breed} •{" "}
                          {mockConsultation.pet.species}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>Idade:</strong> {mockConsultation.pet.age}
                      </p>
                      <p>
                        <strong>Peso:</strong> {mockConsultation.pet.weight}kg
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
                          {mockConsultation.guardian.fullName}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Tutor responsável
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>Email:</strong>{" "}
                        {mockConsultation.guardian.email}
                      </p>
                      <p>
                        <strong>Telefone:</strong>{" "}
                        {mockConsultation.guardian.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Tab */}
            {activeTab === "consultation" && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-text-primary flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2" />
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
                      rows={6}
                      className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                      placeholder="Descreva detalhadamente os procedimentos realizados, observações, diagnóstico..."
                    />
                    {errors.description && (
                      <p className="text-sm text-error mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prescription Tab */}
            {activeTab === "prescription" && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-text-primary flex items-center">
                    <Pill className="w-5 h-5 mr-2" />
                    Receituário Médico
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Prescrição Médica
                    </label>
                    <textarea
                      {...register("prescriptionText")}
                      rows={12}
                      className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical font-mono text-sm"
                      placeholder="Digite a prescrição médica veterinária..."
                    />
                    {errors.prescriptionText && (
                      <p className="text-sm text-error mt-1">
                        {errors.prescriptionText.message}
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-background-secondary rounded-lg">
                    <h4 className="font-medium text-text-primary mb-2">
                      Dicas para Receituário:
                    </h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>
                        • Inclua dosagem, frequência e duração dos medicamentos
                      </li>
                      <li>• Especifique cuidados especiais e restrições</li>
                      <li>
                        • Adicione orientações sobre alimentação se necessário
                      </li>
                      <li>• Indique quando deve ser o próximo retorno</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Informações de Pagamento
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Valor da Consulta"
                      type="number"
                      step="0.01"
                      {...register("amount", { valueAsNumber: true })}
                      error={errors.amount?.message}
                      icon={DollarSign}
                      placeholder="0,00"
                      onBlur={calculatePaymentPlan}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Método de Pagamento
                    </label>
                    <select
                      {...register("payment_method")}
                      className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                      onChange={(e) => {
                        setValue("payment_method", e.target.value as any);
                        if (e.target.value !== "credit_card") {
                          setValue("payment_plan", 1);
                        }
                      }}
                    >
                      {paymentMethodOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.payment_method && (
                      <p className="text-sm text-error mt-1">
                        {errors.payment_method.message}
                      </p>
                    )}
                  </div>
                </div>

                {watchPaymentMethod === "credit_card" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Parcelamento
                      </label>
                      <select
                        {...register("payment_plan", { valueAsNumber: true })}
                        className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (num) => (
                            <option key={num} value={num}>
                              {num}x{" "}
                              {num > 1
                                ? `de ${formatCurrency(installmentValue)}`
                                : "à vista"}
                            </option>
                          ),
                        )}
                      </select>
                      {errors.payment_plan && (
                        <p className="text-sm text-error mt-1">
                          {errors.payment_plan.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <div className="p-3 bg-background-secondary rounded-lg w-full">
                        <div className="text-sm text-text-secondary">
                          Valor da Parcela
                        </div>
                        <div className="text-lg font-bold text-primary-500">
                          {formatCurrency(installmentValue)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register("paid")}
                    className="w-4 h-4 text-primary-500 bg-surface border-border rounded focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-text-primary">
                    Pagamento confirmado
                  </label>
                </div>

                {watchPaid && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-success/10 border border-success/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 text-success">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Pagamento Confirmado</span>
                    </div>
                    <p className="text-sm text-success/80 mt-1">
                      Esta consulta está marcada como paga. O valor total é{" "}
                      {formatCurrency(watchAmount || 0)}.
                    </p>
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
                  Status da Consulta
                </h3>
              </CardHeader>
              <CardContent>
                <div
                  className={`${mockConsultation.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"} rounded-lg p-4 text-center`}
                >
                  <div className="font-semibold text-lg mb-1">
                    {mockConsultation.paid
                      ? "Consulta Paga"
                      : "Pagamento Pendente"}
                  </div>
                  <div className="text-sm opacity-90">
                    {formatCurrency(mockConsultation.amount)}
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
                  <Link href={`/dashboard/consultations/${appointmentId}`} className="flex items-center justify-center">
                    Cancelar Edição
                  </Link>
                </Button>

                <hr className="border-border" />

                <Button variant="secondary" className="w-full" asChild>
                  <Link
                    href={`/dashboard/consultations/${appointmentId}/prescription`}
                    className="flex items-center justify-center"
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    Ver Receituário
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Calculator */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculadora Rápida
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-text-secondary">
                  <p>
                    <strong>Valor total:</strong>{" "}
                    {formatCurrency(watchAmount || 0)}
                  </p>
                  {watchPaymentPlan > 1 && (
                    <p>
                      <strong>Parcelado:</strong> {watchPaymentPlan}x de{" "}
                      {formatCurrency(installmentValue)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-text-primary">
                    Valores Sugeridos:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[80, 120, 150, 200].map((value) => (
                      <Button
                        key={value}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setValue("amount", value)}
                        type="button"
                      >
                        {formatCurrency(value)}
                      </Button>
                    ))}
                  </div>
                </div>
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
                  <span className="text-text-secondary">Agendamento:</span>
                  <span className="text-text-primary">
                    #{mockConsultation.appointment.appointment_id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Veterinário:</span>
                  <span className="text-text-primary">
                    {mockConsultation.veterinarian.fullName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Criada em:</span>
                  <span className="text-text-primary">
                    {formatDateTime(mockConsultation.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Clínica:</span>
                  <span className="text-text-primary">
                    {mockConsultation.clinic.tradeName}
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
                  Excluir Consulta
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir permanentemente esta consulta?
              Todas as informações associadas, incluindo receituário, serão
              perdidas.
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
