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
  CheckCircle,
  XCircle,
  DollarSign,
  CreditCard,
  Eye,
  Printer,
  Download,
  MoreVertical,
  Receipt,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatPhone, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

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
    avatarUrl: null,
  },

  guardian: {
    guardian_id: "1",
    fullName: "João Silva",
    phone: "11999999999",
    email: "joao.silva@email.com",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
  },

  veterinarian: {
    veterinarian_id: "1",
    fullName: "Dra. Maria Santos",
    specialty: "Clínica Geral",
    crmv: "12345/SP",
    phone: "11888888888",
  },

  clinic: {
    clinic_id: "1",
    tradeName: "Clínica São Bento",
    address: "Av. Paulista, 456 - Bela Vista, São Paulo - SP",
    phone: "1133334444",
  },

  prescription: {
    prescription_id: "1",
    text: "RECEITUÁRIO VETERINÁRIO\n\nPara: Buddy (Cão, Golden Retriever)\nTutor: João Silva\n\nPrescrição:\n- Ração Premium para cães adultos grandes - 2x ao dia\n- Suplemento vitamínico: 1 comprimido ao dia por 30 dias\n- Retorno em 6 meses para check-up\n\nObservações:\n- Manter peso atual\n- Exercícios regulares\n- Evitar alimentos industrializados para humanos",
    created_at: new Date(2025, 0, 28, 10, 0),
  },
};

const paymentMethodConfig = {
  cash: {
    label: "Dinheiro",
    icon: DollarSign,
  },
  debit_card: {
    label: "Cartão de Débito",
    icon: CreditCard,
  },
  credit_card: {
    label: "Cartão de Crédito",
    icon: CreditCard,
  },
  pix: {
    label: "PIX",
    icon: DollarSign,
  },
  bank_transfer: {
    label: "Transferência",
    icon: DollarSign,
  },
  insurance: {
    label: "Plano de Saúde",
    icon: Receipt,
  },
};

export default function ConsultationDetailPage() {
  const [activeTab, setActiveTab] = useState<
    "details" | "prescription" | "history"
  >("details");
  const [showActions, setShowActions] = useState(false);
  const params = useParams();
  const appointmentId = params?.id as string;
  const paymentMethod =
    paymentMethodConfig[
      mockConsultation.payment_method as keyof typeof paymentMethodConfig
    ];

  const handlePrintConsultation = () => {
    console.log("Printing consultation...");
    window.print();
  };

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost">
            <Link href="/dashboard/consultations">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Consulta #{appointmentId}
            </h1>
            <p className="text-text-secondary">
              Realizada em {formatDateTime(mockConsultation.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handlePrintConsultation}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>

          <Button variant="secondary" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
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
                <Link
                  href={`/dashboard/consultations/${appointmentId}/edit`}
                  className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Consulta
                </Link>
                <Link
                  href={`/dashboard/consultations/${appointmentId}/prescription`}
                  className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Ver Receituário
                </Link>
                <button
                  onClick={handlePrintConsultation}
                  className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Receita
                </button>
              </motion.div>
            )}
          </div>

          <Button>
            <Link href={`/dashboard/consultations/${appointmentId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <motion.div
        className={`${mockConsultation.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"} rounded-lg p-4 mb-6 flex items-center justify-between`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          {mockConsultation.paid ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <div>
            <div className="font-semibold text-lg">
              {mockConsultation.paid ? "Consulta Paga" : "Pagamento Pendente"}
            </div>
            <div className="text-sm opacity-90">
              {mockConsultation.paid
                ? "Pagamento confirmado e consulta finalizada"
                : "Aguardando confirmação do pagamento"}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-75">Valor Total</div>
          <div className="font-bold text-xl">
            {formatCurrency(mockConsultation.amount)}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "details", label: "Detalhes da Consulta" },
          { key: "prescription", label: "Receituário" },
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
            {/* Consultation Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Detalhes da Consulta
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
                        {formatDateTime(mockConsultation.appointment.dateTime)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Duração
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-text-tertiary" />
                      <span className="text-text-primary font-medium">
                        45 minutos
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Descrição da Consulta
                  </label>
                  <div className="mt-1 p-4 bg-background-secondary rounded-md">
                    <p className="text-text-primary whitespace-pre-line">
                      {mockConsultation.description}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Observações do Agendamento
                  </label>
                  <div className="mt-1 p-3 bg-background-secondary rounded-md">
                    <p className="text-text-primary">
                      {mockConsultation.appointment.notes}
                    </p>
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
                      {mockConsultation.pet.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Espécie:</span>
                        <div className="font-medium text-text-primary">
                          {mockConsultation.pet.species}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Raça:</span>
                        <div className="font-medium text-text-primary">
                          {mockConsultation.pet.breed}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Idade:</span>
                        <div className="font-medium text-text-primary">
                          {mockConsultation.pet.age}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Peso:</span>
                        <div className="font-medium text-text-primary">
                          {mockConsultation.pet.weight}kg
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Link
                      href={`/dashboard/pets/${mockConsultation.pet.pet_id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
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
                      {mockConsultation.guardian.fullName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {formatPhone(mockConsultation.guardian.phone)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {mockConsultation.guardian.email}
                        </span>
                      </div>
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-text-tertiary mt-0.5" />
                        <span className="text-text-primary">
                          {mockConsultation.guardian.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Link
                      href={`/dashboard/guardians/${mockConsultation.guardian.guardian_id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Perfil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pagamento
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-500 mb-2">
                    {formatCurrency(mockConsultation.amount)}
                  </div>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      mockConsultation.paid
                        ? "bg-success text-success-foreground"
                        : "bg-warning text-warning-foreground"
                    }`}
                  >
                    {mockConsultation.paid ? "Pago" : "Pendente"}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Método:</span>
                    <div className="flex items-center space-x-1">
                      <paymentMethod.icon className="w-4 h-4" />
                      <span className="text-text-primary font-medium">
                        {paymentMethod.label}
                      </span>
                    </div>
                  </div>

                  {mockConsultation.payment_plan > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Parcelamento:</span>
                      <span className="text-text-primary font-medium">
                        {mockConsultation.payment_plan}x
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      Data do Pagamento:
                    </span>
                    <span className="text-text-primary">
                      {formatDateTime(mockConsultation.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    {mockConsultation.veterinarian.fullName}
                  </h4>
                  <p className="text-sm text-text-secondary mb-2">
                    {mockConsultation.veterinarian.specialty}
                  </p>
                  <p className="text-xs text-text-tertiary mb-4">
                    CRMV {mockConsultation.veterinarian.crmv}
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
                <Button variant="secondary" className="w-full">
                  <Link
                    href={`/dashboard/consultations/${appointmentId}/prescription`}
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    Ver Receituário
                  </Link>
                </Button>

                <Button variant="secondary" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Retorno
                </Button>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handlePrintConsultation}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Consulta
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
                  <span className="text-text-secondary">ID da Consulta:</span>
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
      )}

      {/* Prescription Tab */}
      {activeTab === "prescription" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Receituário Médico Veterinário
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrintConsultation}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="secondary" size="sm">
                  <Link
                    href={`/dashboard/consultations/${appointmentId}/prescription`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Completo
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background-secondary rounded-lg p-6">
              <div className="border-b border-border pb-4 mb-4">
                <h4 className="font-semibold text-text-primary mb-2">
                  {mockConsultation.clinic.tradeName}
                </h4>
                <p className="text-sm text-text-secondary">
                  {mockConsultation.clinic.address}
                </p>
                <p className="text-sm text-text-secondary">
                  Tel: {mockConsultation.clinic.phone}
                </p>
              </div>

              <div className="whitespace-pre-line text-text-primary font-mono text-sm leading-relaxed">
                {mockConsultation.prescription.text}
              </div>

              <div className="border-t border-border pt-4 mt-6">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>
                    Emitido em:{" "}
                    {formatDateTime(mockConsultation.prescription.created_at)}
                  </span>
                  <span>
                    {mockConsultation.veterinarian.fullName} - CRMV{" "}
                    {mockConsultation.veterinarian.crmv}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Histórico da Consulta
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: new Date(2025, 0, 28, 10, 15),
                  action: "Consulta finalizada",
                  user: "Dra. Maria Santos",
                  details: "Consulta concluída com prescrição médica",
                },
                {
                  date: new Date(2025, 0, 28, 10, 0),
                  action: "Receituário emitido",
                  user: "Dra. Maria Santos",
                  details: "Prescrição médica gerada e anexada à consulta",
                },
                {
                  date: new Date(2025, 0, 28, 9, 30),
                  action: "Consulta iniciada",
                  user: "Dra. Maria Santos",
                  details: "Início do atendimento médico veterinário",
                },
                {
                  date: new Date(2025, 0, 28, 9, 0),
                  action: "Agendamento confirmado",
                  user: "Recepção",
                  details: "Cliente compareceu no horário agendado",
                },
              ].map((event, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-background-secondary rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
