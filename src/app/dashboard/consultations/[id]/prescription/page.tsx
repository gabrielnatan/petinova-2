"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Share2,
  Eye,
  Calendar,
  Stethoscope,
  Heart,
  User,
  Building,
  FileText,
  Copy,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatPhone } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { prescriptionAPI, type Prescription } from "@/lib/api/prescriptions";
import { useAuth } from "@/store";
export default function ConsultationPrescriptionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const params = useParams();
  const consultationId = params?.id as string;

  // Carregar dados da prescrição
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadPrescription = async () => {
      try {
        setLoading(true);
        const response = await prescriptionAPI.getPrescription(consultationId);
        setPrescription(response.prescription);
      } catch (error) {
        console.error('Error loading prescription:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar prescrição');
      } finally {
        setLoading(false);
      }
    };

    loadPrescription();
  }, [consultationId, isAuthenticated]);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);
  const handlePrint = () => {
    window.print();
  };
  const handleDownloadPDF = () => {
    console.log("Downloading prescription PDF...");
    // Implementar download em PDF
  };
  const handleCopyText = () => {
    const fullPrescription = generateFullPrescriptionText();
    navigator.clipboard.writeText(fullPrescription);
    // Mostrar toast de sucesso
  };
  const handleSendEmail = () => {
    if (!prescription) return;
    const subject = `Receituário Médico Veterinário - ${prescription.consultation.pet.name}`;
    const body = generateFullPrescriptionText();
    const mailtoLink = `mailto:${prescription.consultation.guardian.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };
  const handleSendWhatsApp = () => {
    if (!prescription) return;
    const message = `Olá ${prescription.consultation.guardian.fullName}!\n\nSegue o receituário médico veterinário do ${prescription.consultation.pet.name}:\n\n${generateFullPrescriptionText()}`;
    const whatsappLink = `https://wa.me/55${prescription.consultation.guardian.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };
  const generateFullPrescriptionText = () => {
    if (!prescription) return '';
    const { consultation } = prescription;
    return `RECEITUÁRIO MÉDICO VETERINÁRIO
═══════════════════════════════════════════════════════════════
DADOS DO PACIENTE:
Nome: ${consultation.pet.name}
Espécie: ${consultation.pet.species}
Raça: ${consultation.pet.breed || 'Não informado'}
Peso: ${consultation.pet.weight ? `${consultation.pet.weight} kg` : 'Não informado'}
Data de Nascimento: ${consultation.pet.birthDate ? formatDateTime(consultation.pet.birthDate) : 'Não informado'}

TUTOR RESPONSÁVEL:
Nome: ${consultation.guardian.fullName}
Telefone: ${formatPhone(consultation.guardian.phone)}
Email: ${consultation.guardian.email}
Endereço: ${consultation.guardian.address || 'Não informado'}

═══════════════════════════════════════════════════════════════
PRESCRIÇÃO MÉDICA VETERINÁRIA:
${prescription.text}

═══════════════════════════════════════════════════════════════
VETERINÁRIO RESPONSÁVEL:
${consultation.veterinarian.fullName}
${consultation.veterinarian.role}

DATA DE EMISSÃO: ${formatDateTime(prescription.created_at)}
CONSULTA: #${consultation.consultation_id}
RECEITA: #${prescription.prescription_id}
VALIDADE: 30 dias a partir da data de emissão

═══════════════════════════════════════════════════════════════
OBSERVAÇÕES LEGAIS:
- Este receituário é válido apenas para o animal identificado
- Deve ser apresentado no momento da compra dos medicamentos
- Em caso de dúvidas, entre em contato com a clínica
- Documento gerado digitalmente com validade legal`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Carregando prescrição...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Erro ao carregar prescrição
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
  if (!prescription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Prescrição não encontrada
          </h2>
          <p className="text-text-secondary mb-4">
            A prescrição que você está procurando não existe.
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

  return (
    <div className="min-h-screen bg-background">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          .prescription-content {
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .prescription-text {
            font-family: "Courier New", monospace !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
            color: black !important;
            white-space: pre-wrap !important;
          }
          .clinic-header {
            text-align: center !important;
            margin-bottom: 20px !important;
            border-bottom: 2px solid black !important;
            padding-bottom: 10px !important;
          }
          .section-divider {
            border-top: 1px solid black !important;
            margin: 15px 0 !important;
          }
        }
      `}</style>
      <div
        className={`${isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : "p-6"} max-w-6xl mx-auto`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between mb-6 ${isFullscreen ? "p-6 pb-0" : ""} no-print`}
        >
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href={`/dashboard/consultations/${consultationId}`} className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Consulta
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Receituário Médico Veterinário
              </h1>
              <p className="text-text-secondary">
                Consulta #{consultationId} • {prescription.consultation.pet.name}{" "}
                • {formatDateTime(prescription.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="secondary" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="secondary" onClick={() => setShowShareModal(true)}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button>
              <Link href={`/dashboard/consultations/${consultationId}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
        <div
          className={`grid grid-cols-1 ${isFullscreen ? "" : "lg:grid-cols-4"} gap-6`}
        >
          {/* Main Prescription Document */}
          <div className={`${isFullscreen ? "" : "lg:col-span-3"}`}>
            <Card className="prescription-content">
              <CardContent className="p-0">
                {/* Official Prescription Document */}
                <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                  {/* Clinic Header */}
                  <div className="clinic-header bg-gray-50 p-6 text-center border-b-2 border-gray-300">
                    <div className="mb-2">
                      <Building className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                      <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                        Clínica Veterinária
                      </h2>
                      <p className="text-sm text-gray-600 font-medium">
                        Sistema Petinova
                      </p>
                    </div>
                  </div>
                  {/* Document Title */}
                  <div className="bg-primary-50 p-4 text-center border-b border-gray-200">
                    <h3 className="text-lg font-bold text-primary-800 uppercase tracking-widest">
                      RECEITUÁRIO MÉDICO VETERINÁRIO
                    </h3>
                    <p className="text-sm text-primary-600">
                      Receita Nº {prescription.prescription_id} • Emitida em{" "}
                      {formatDateTime(prescription.created_at)}
                    </p>
                  </div>
                  {/* Patient Information */}
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
                      Dados do Paciente
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Nome:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.pet.name}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Espécie:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.pet.species}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Raça:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.pet.breed || 'Não informado'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Peso:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.pet.weight ? `${prescription.consultation.pet.weight} kg` : 'Não informado'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Data Nasc.:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.pet.birthDate ? formatDateTime(prescription.consultation.pet.birthDate) : 'Não informado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Guardian Information */}
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
                      Tutor Responsável
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Nome:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.guardian.fullName}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Telefone:
                          </span>
                          <span className="text-gray-900">
                            {formatPhone(prescription.consultation.guardian.phone)}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-16">
                            Email:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.guardian.email}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex">
                        <span className="font-semibold text-gray-700 w-16">
                          Endereço:
                        </span>
                        <span className="text-gray-900">
                          {prescription.consultation.guardian.address || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Prescription Content */}
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-300 pb-1">
                      Prescrição Médica Veterinária
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="prescription-text whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-900">
                        {prescription.text}
                      </pre>
                    </div>
                  </div>
                  {/* Veterinarian Signature */}
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
                      Veterinário Responsável
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-20">
                            Nome:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.veterinarian.fullName}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-20">
                            Especialidade:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.veterinarian.role}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-20">
                            Especialidade:
                          </span>
                          <span className="text-gray-900">
                            {prescription.consultation.veterinarian.role}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-20">
                            Data/Hora:
                          </span>
                          <span className="text-gray-900">
                            {formatDateTime(prescription.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Digital Signature & Validation */}
                  <div className="p-6 bg-green-50 border-t-2 border-green-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-green-800">
                            Documento Digital Válido
                          </h4>
                          <p className="text-sm text-green-600">
                            Receituário gerado digitalmente com validade legal
                          </p>
                          <p className="text-xs text-green-500 mt-1">
                            Validade: 30 dias • Consulta #
                            {prescription.consultation.consultation_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-green-600">
                          Código de Verificação
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Legal Notice */}
                  <div className="p-4 bg-gray-100 text-center">
                    <p className="text-xs text-gray-600">
                      <strong>OBSERVAÇÕES LEGAIS:</strong> Este receituário é
                      válido apenas para o animal identificado • Deve ser
                      apresentado no momento da compra dos medicamentos • Em
                      caso de dúvidas, entre em contato com a clínica •
                      Documento gerado digitalmente com validade legal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar - Only show when not in fullscreen */}
          {!isFullscreen && (
            <div className="space-y-6 no-print">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Ações Rápidas
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handlePrint}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Receita
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleSendEmail}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar por Email
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleSendWhatsApp}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar WhatsApp
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleCopyText}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Texto
                  </Button>
                </CardContent>
              </Card>
              {/* Patient Summary */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Resumo do Paciente
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-10 h-10 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {prescription.consultation.pet.name}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {prescription.consultation.pet.breed || 'Não informado'} •{" "}
                        {prescription.consultation.pet.species}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {prescription.consultation.pet.weight ? `${prescription.consultation.pet.weight}kg` : 'Peso não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-10 h-10 text-secondary-500" />
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {prescription.consultation.guardian.fullName}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Tutor responsável
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {formatPhone(prescription.consultation.guardian.phone)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="w-10 h-10 text-accent-500" />
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {prescription.consultation.veterinarian.fullName}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {prescription.consultation.veterinarian.role}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Veterinário responsável
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Prescription Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Detalhes da Receita
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Receita:</span>
                    <span className="text-text-primary font-medium">
                      #{prescription.prescription_id}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Consulta:</span>
                    <span className="text-text-primary">
                      #{prescription.consultation.consultation_id}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Emitida em:</span>
                    <span className="text-text-primary">
                      {formatDateTime(prescription.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Validade:</span>
                    <span className="text-success font-medium">30 dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Status:</span>
                    <span className="flex items-center text-success">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Válida
                    </span>
                  </div>
                </CardContent>
              </Card>
              {/* Related Links */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Links Relacionados
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href={`/dashboard/consultations/${consultationId}`} className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Consulta Completa
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link
                      href={`/dashboard/pets/${prescription.consultation.pet.pet_id}`}
                      className="flex items-center"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Perfil do Pet
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link
                      href={`/dashboard/guardians/${prescription.consultation.guardian.guardian_id}`}
                      className="flex items-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Perfil do Tutor
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/appointments/new" className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Retorno
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-surface rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Share2 className="w-6 h-6 text-primary-500" />
              <h3 className="text-lg font-semibold text-text-primary">
                Compartilhar Receituário
              </h3>
            </div>
            <p className="text-text-secondary mb-6">
              Selecione como deseja compartilhar o receituário com o tutor:
            </p>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  handleSendEmail();
                  setShowShareModal(false);
                }}
              >
                <Mail className="w-5 h-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Enviar por Email</div>
                  <div className="text-xs text-text-tertiary">
                    {prescription.consultation.guardian.email}
                  </div>
                </div>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  handleSendWhatsApp();
                  setShowShareModal(false);
                }}
              >
                <MessageSquare className="w-5 h-5 mr-3 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">Enviar via WhatsApp</div>
                  <div className="text-xs text-text-tertiary">
                    {formatPhone(prescription.consultation.guardian.phone)}
                  </div>
                </div>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  handleCopyText();
                  setShowShareModal(false);
                }}
              >
                <Copy className="w-5 h-5 mr-3 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium">Copiar Texto</div>
                  <div className="text-xs text-text-tertiary">
                    Copiar receita para área de transferência
                  </div>
                </div>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  handleDownloadPDF();
                  setShowShareModal(false);
                }}
              >
                <Download className="w-5 h-5 mr-3 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Download PDF</div>
                  <div className="text-xs text-text-tertiary">
                    Baixar arquivo em PDF
                  </div>
                </div>
              </Button>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowShareModal(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
