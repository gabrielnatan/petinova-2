"use client";
import React, { useState, useEffect } from "react";
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
import { useParams, useRouter } from "next/navigation";
import { consultationAPI, type Consultation } from "@/lib/api/consultations";
import { useAuth } from "@/store";

export default function ConsultationDetailPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "prescription" | "history"
  >("details");
  const [showActions, setShowActions] = useState(false);
  
  const params = useParams();
  const consultationId = params?.id as string;

  // Carregar dados da consulta
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadConsultation = async () => {
      try {
        setLoading(true);
        const response = await consultationAPI.getConsultation(consultationId);
        setConsultation(response.consultation);
      } catch (error) {
        console.error('Error loading consultation:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar consulta');
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [consultationId, isAuthenticated]);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Carregando consulta...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Erro ao carregar consulta
          </h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!consultation) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Consulta não encontrada
          </h2>
          <p className="text-text-secondary mb-4">
            A consulta que você está procurando não existe.
          </p>
          <Button asChild>
            <Link href="/dashboard/consultations">
              Voltar para Consultas
            </Link>
          </Button>
        </div>
      </div>
    );
  }
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
          <Button variant="ghost" asChild>
            <Link href="/dashboard/consultations" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Consulta #{consultationId}
            </h1>
            <p className="text-text-secondary">
              Realizada em {formatDateTime(consultation.created_at)}
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
              <div
                className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[200px]"
              >
                <Link
                  href={`/dashboard/consultations/${consultationId}/edit`}
                  className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Consulta
                </Link>
                <Link
                  href={`/dashboard/consultations/${consultationId}/prescription`}
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
              </div>
            )}
          </div>
          <Button asChild>
            <Link href={`/dashboard/consultations/${consultationId}/edit`} className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

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
                        {formatDateTime(consultation.date)}
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
                      {consultation.diagnosis || 'Nenhum diagnóstico registrado'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Observações do Agendamento
                  </label>
                  <div className="mt-1 p-3 bg-background-secondary rounded-md">
                    <p className="text-text-primary">
                      {consultation.notes || 'Nenhuma observação registrada'}
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
                      {consultation.pet.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Espécie:</span>
                        <div className="font-medium text-text-primary">
                          {consultation.pet.species}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Raça:</span>
                        <div className="font-medium text-text-primary">
                          {consultation.pet.breed || 'Não informado'}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Peso:</span>
                        <div className="font-medium text-text-primary">
                          {consultation.pet.weight ? `${consultation.pet.weight}kg` : 'Não informado'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      href={`/dashboard/pets/${consultation.pet.id}`} className="flex items-center"
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
                      {consultation.guardian.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {formatPhone(consultation.guardian.phone)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {consultation.guardian.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      href={`/dashboard/guardians/${consultation.guardian.id}`} className="flex items-center"
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
                    {consultation.veterinarian.name}
                  </h4>
                  <p className="text-sm text-text-secondary mb-2">
                    {consultation.veterinarian.role}
                  </p>
                  <p className="text-xs text-text-tertiary mb-4">
                    Veterinário responsável
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
                  <Link
                    href={`/dashboard/consultations/${consultationId}/prescription`} className="flex items-center"
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
                    #{consultation.consultation_id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Agendamento:</span>
                  <span className="text-text-primary">
                    #{consultation.appointment.appointment_id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Criada em:</span>
                  <span className="text-text-primary">
                    {formatDateTime(consultation.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Clínica:</span>
                  <span className="text-text-primary">
                    Clínica Petinova
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
                <Button variant="secondary" size="sm" asChild>
                  <Link
                    href={`/dashboard/consultations/${consultationId}/prescription`} className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Receituário Completo
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">
                O receituário médico veterinário está disponível na página dedicada.
              </p>
              <Button asChild>
                <Link href={`/dashboard/consultations/${consultationId}/prescription`}>
                  Ver Receituário Completo
                </Link>
              </Button>
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
                  date: new Date(consultation.created_at),
                  action: "Consulta criada",
                  user: consultation.veterinarian.name,
                  details: "Consulta médica veterinária registrada no sistema",
                },
                {
                  date: new Date(consultation.updated_at),
                  action: "Consulta atualizada",
                  user: consultation.veterinarian.name,
                  details: "Dados da consulta foram atualizados",
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
