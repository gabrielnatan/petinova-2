//@ts-nocheck
"use client";
import Link from "next/link";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Stethoscope,
  Calendar,
  Activity,
  Scale,
  Thermometer,
  Download,
  Printer,
  Filter,
  Search,
  Eye,
  Pill,
  Syringe,
  FileText,
  User,
  TrendingUp,
  AlertCircle,
  Shield,
  Clipboard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatDate } from "@/lib/utils";
import { useParams } from "next/navigation";

// Mock data - replace with actual data fetching
const mockPet = {
  pet_id: "1",
  name: "Buddy",
  species: "Canina",
  breed: "Golden Retriever",
  birthDate: new Date("2021-03-15"),
  guardian: {
    fullName: "João Silva",
  },
};

const mockMedicalHistory = {
  consultations: [
    {
      consultation_id: "1",
      date: new Date("2025-01-20"),
      type: "Consulta de Rotina",
      veterinarian: "Dra. Maria Santos",
      specialty: "Clínica Geral",
      description:
        "Check-up geral preventivo. Animal apresentou-se alerta e responsivo. Exame físico sem alterações significativas. Aplicada vacina V10 conforme protocolo. Orientações sobre nutrição e exercícios fornecidas ao tutor.",
      weight: 30.0,
      temperature: 38.5,
      heartRate: 85,
      respiratoryRate: 24,
      symptoms: ["Nenhum sintoma específico"],
      diagnosis: "Animal saudável",
      treatment: ["Vacinação V10", "Orientações nutricionais"],
      prescriptions: [
        "Ração premium para cães grandes - 400g/dia divididos em 2 refeições",
      ],
      nextVisit: new Date("2025-07-20"),
      status: "completed",
      files: ["exame_sangue_20250120.pdf", "receituario_20250120.pdf"],
    },
    {
      consultation_id: "2",
      date: new Date("2024-12-15"),
      type: "Retorno Pós-cirúrgico",
      veterinarian: "Dra. Maria Santos",
      specialty: "Clínica Geral",
      description:
        "Retorno para avaliação pós-operatória da castração. Ferida cirúrgica com cicatrização adequada, sem sinais de infecção. Animal recuperado completamente do procedimento.",
      weight: 29.5,
      temperature: 38.2,
      heartRate: 88,
      respiratoryRate: 22,
      symptoms: ["Cicatrização normal"],
      diagnosis: "Pós-operatório sem complicações",
      treatment: ["Retirada de pontos", "Liberação para atividades normais"],
      prescriptions: [],
      nextVisit: new Date("2025-01-20"),
      status: "completed",
      files: ["foto_cicatrizacao_20241215.jpg"],
    },
    {
      consultation_id: "3",
      date: new Date("2024-11-20"),
      type: "Cirurgia Eletiva",
      veterinarian: "Dr. Carlos Lima",
      specialty: "Cirurgia",
      description:
        "Orquiectomia bilateral (castração) eletiva. Procedimento realizado sem intercorrências. Anestesia geral bem tolerada. Sutura com fio absorvível. Orientações pós-operatórias fornecidas.",
      weight: 29.0,
      temperature: 38.0,
      heartRate: 92,
      respiratoryRate: 20,
      symptoms: ["Procedimento eletivo"],
      diagnosis: "Pré-operatório normal",
      treatment: ["Orquiectomia bilateral", "Analgesia pós-operatória"],
      prescriptions: [
        "Meloxicam 0,5mg - 1 comprimido ao dia por 5 dias",
        "Cefalexina 500mg - 1 comprimido 2x ao dia por 7 dias",
      ],
      nextVisit: new Date("2024-12-15"),
      status: "completed",
      files: [
        "termo_cirurgia_20241120.pdf",
        "protocolo_anestesia_20241120.pdf",
      ],
    },
    {
      consultation_id: "4",
      date: new Date("2024-10-10"),
      type: "Consulta Preventiva",
      veterinarian: "Dra. Ana Oliveira",
      specialty: "Clínica Geral",
      description:
        "Avaliação pré-operatória para castração. Exames laboratoriais solicitados. Animal em bom estado geral, apto para procedimento cirúrgico.",
      weight: 28.5,
      temperature: 38.3,
      heartRate: 86,
      respiratoryRate: 23,
      symptoms: ["Animal saudável"],
      diagnosis: "Apto para cirurgia",
      treatment: ["Solicitação de exames pré-operatórios"],
      prescriptions: [],
      nextVisit: new Date("2024-11-20"),
      status: "completed",
      files: ["exames_preoperatorios_20241010.pdf"],
    },
    {
      consultation_id: "5",
      date: new Date("2024-08-15"),
      type: "Vacinação",
      veterinarian: "Dra. Maria Santos",
      specialty: "Clínica Geral",
      description:
        "Aplicação de vacina antirrábica anual. Animal apresentou-se em bom estado geral. Sem reações adversas à vacinação anterior.",
      weight: 28.0,
      temperature: 38.4,
      heartRate: 84,
      respiratoryRate: 25,
      symptoms: ["Nenhum"],
      diagnosis: "Animal saudável",
      treatment: ["Vacinação antirrábica"],
      prescriptions: [],
      nextVisit: new Date("2024-10-10"),
      status: "completed",
      files: ["cartao_vacina_20240815.pdf"],
    },
  ],

  vaccinations: [
    {
      id: "1",
      name: "V10 (Décupla)",
      date: new Date("2025-01-20"),
      nextDue: new Date("2026-01-20"),
      veterinarian: "Dra. Maria Santos",
      batch: "VAC2025001",
      manufacturer: "Zoetis",
      status: "current",
    },
    {
      id: "2",
      name: "Antirrábica",
      date: new Date("2024-08-15"),
      nextDue: new Date("2025-08-15"),
      veterinarian: "Dra. Maria Santos",
      batch: "RAB2024512",
      manufacturer: "MSD",
      status: "due_soon",
    },
    {
      id: "3",
      name: "Gripe Canina",
      date: new Date("2024-06-10"),
      nextDue: new Date("2025-06-10"),
      veterinarian: "Dr. Carlos Lima",
      batch: "GRI2024234",
      manufacturer: "Boehringer",
      status: "current",
    },
  ],

  procedures: [
    {
      id: "1",
      name: "Orquiectomia (Castração)",
      date: new Date("2024-11-20"),
      veterinarian: "Dr. Carlos Lima",
      description: "Castração eletiva realizada sem complicações",
      status: "completed",
    },
    {
      id: "2",
      name: "Microchip",
      date: new Date("2024-02-15"),
      veterinarian: "Dra. Maria Santos",
      description: "Implantação de microchip de identificação",
      chipNumber: "982000123456789",
      status: "completed",
    },
  ],

  conditions: [
    {
      id: "1",
      name: "Displasia Coxofemoral Leve",
      diagnosedDate: new Date("2024-06-15"),
      veterinarian: "Dr. Carlos Lima",
      description: "Displasia leve detectada em exame radiográfico",
      status: "monitoring",
      severity: "mild",
    },
    {
      id: "2",
      name: "Tendência à Obesidade",
      diagnosedDate: new Date("2024-08-20"),
      veterinarian: "Dra. Maria Santos",
      description: "Monitoramento de peso necessário devido à predisposição",
      status: "controlled",
      severity: "mild",
    },
  ],

  allergies: [
    {
      id: "1",
      allergen: "Chocolate",
      reaction: "Intoxicação",
      severity: "severe",
      notes: "Estritamente proibido. Pode causar intoxicação grave.",
    },
  ],
};

export default function PetMedicalHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [expandedConsultation, setExpandedConsultation] = useState<
    string | null
  >(null);
  const params = useParams();
  const appointmentId = params?.id as string;
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

  // Filtrar consultas
  const filteredConsultations = mockMedicalHistory.consultations.filter(
    (consultation) => {
      const matchesSearch =
        searchTerm === "" ||
        consultation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.veterinarian
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        consultation.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "all" ||
        (filterType === "consultation" &&
          consultation.type.includes("Consulta")) ||
        (filterType === "surgery" && consultation.type.includes("Cirurgia")) ||
        (filterType === "vaccination" &&
          consultation.type.includes("Vacinação")) ||
        (filterType === "emergency" &&
          consultation.type.includes("Emergência"));

      let matchesPeriod = true;
      if (filterPeriod === "last_month") {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        matchesPeriod = consultation.date >= lastMonth;
      } else if (filterPeriod === "last_year") {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        matchesPeriod = consultation.date >= lastYear;
      }

      return matchesSearch && matchesType && matchesPeriod;
    },
  );

  const handleExportPDF = () => {
    console.log("Exporting medical history to PDF...");
  };

  const handlePrint = () => {
    window.print();
  };

  const getConditionSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "text-success bg-success/10";
      case "moderate":
        return "text-warning bg-warning/10";
      case "severe":
        return "text-error bg-error/10";
      default:
        return "text-text-secondary bg-background-secondary";
    }
  };

  const getAllergySeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "text-warning bg-warning/10";
      case "moderate":
        return "text-error bg-error/10";
      case "severe":
        return "text-error bg-error/20 border border-error/30";
      default:
        return "text-text-secondary bg-background-secondary";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost">
            <Link href={`/dashboard/pets/${appointmentId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para {mockPet.name}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Histórico Médico Completo
            </h1>
            <p className="text-text-secondary">
              {mockPet.name} • {mockPet.breed} • {ageString} • Tutor:{" "}
              {mockPet.guardian.fullName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="secondary" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button>
            <Link href="/dashboard/consultations/new">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar no histórico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
              >
                <option value="all">Todos os tipos</option>
                <option value="consultation">Consultas</option>
                <option value="surgery">Cirurgias</option>
                <option value="vaccination">Vacinações</option>
                <option value="emergency">Emergências</option>
              </select>
            </div>

            <div>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
              >
                <option value="all">Todo o período</option>
                <option value="last_month">Último mês</option>
                <option value="last_year">Último ano</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="secondary" className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {/* Medical Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Linha do Tempo Médica ({filteredConsultations.length})
                </h3>
                <span className="text-sm text-text-secondary">
                  {filteredConsultations.length} registro
                  {filteredConsultations.length !== 1 ? "s" : ""} encontrado
                  {filteredConsultations.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredConsultations.map((consultation, index) => (
                  <motion.div
                    key={consultation.consultation_id}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Timeline Line */}
                    {index < filteredConsultations.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-20 bg-border" />
                    )}

                    <div className="flex items-start space-x-4">
                      {/* Timeline Dot */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          consultation.type.includes("Cirurgia")
                            ? "bg-warning/10 text-warning"
                            : consultation.type.includes("Vacinação")
                              ? "bg-success/10 text-success"
                              : consultation.type.includes("Emergência")
                                ? "bg-error/10 text-error"
                                : "bg-primary/10 text-primary-600"
                        }`}
                      >
                        {consultation.type.includes("Cirurgia") ? (
                          <Pill className="w-6 h-6" />
                        ) : consultation.type.includes("Vacinação") ? (
                          <Syringe className="w-6 h-6" />
                        ) : (
                          <Stethoscope className="w-6 h-6" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-text-primary text-lg">
                                  {consultation.type}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDateTime(consultation.date)}
                                  </span>
                                  <span className="flex items-center">
                                    <User className="w-4 h-4 mr-1" />
                                    {consultation.veterinarian}
                                  </span>
                                  <span className="text-xs bg-background-secondary px-2 py-1 rounded">
                                    {consultation.specialty}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedConsultation(
                                      expandedConsultation ===
                                        consultation.consultation_id
                                        ? null
                                        : consultation.consultation_id,
                                    )
                                  }
                                >
                                  {expandedConsultation ===
                                  consultation.consultation_id
                                    ? "Ocultar"
                                    : "Expandir"}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Link
                                    href={`/dashboard/consultations/${consultation.consultation_id}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>

                            <p className="text-text-primary mb-4">
                              {consultation.description}
                            </p>

                            {/* Vital Signs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center space-x-2 p-2 bg-background-secondary rounded">
                                <Scale className="w-4 h-4 text-text-tertiary" />
                                <div>
                                  <div className="text-xs text-text-secondary">
                                    Peso
                                  </div>
                                  <div className="font-medium text-text-primary">
                                    {consultation.weight} kg
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 p-2 bg-background-secondary rounded">
                                <Thermometer className="w-4 h-4 text-text-tertiary" />
                                <div>
                                  <div className="text-xs text-text-secondary">
                                    Temp
                                  </div>
                                  <div className="font-medium text-text-primary">
                                    {consultation.temperature}°C
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 p-2 bg-background-secondary rounded">
                                <Heart className="w-4 h-4 text-text-tertiary" />
                                <div>
                                  <div className="text-xs text-text-secondary">
                                    FC
                                  </div>
                                  <div className="font-medium text-text-primary">
                                    {consultation.heartRate} bpm
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 p-2 bg-background-secondary rounded">
                                <Activity className="w-4 h-4 text-text-tertiary" />
                                <div>
                                  <div className="text-xs text-text-secondary">
                                    FR
                                  </div>
                                  <div className="font-medium text-text-primary">
                                    {consultation.respiratoryRate} rpm
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedConsultation ===
                              consultation.consultation_id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-border pt-4 space-y-4"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-text-primary mb-2">
                                      Sintomas
                                    </h5>
                                    <ul className="space-y-1">
                                      {consultation.symptoms.map(
                                        (symptom, i) => (
                                          <li
                                            key={i}
                                            className="text-sm text-text-secondary flex items-center"
                                          >
                                            <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full mr-2" />
                                            {symptom}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>

                                  <div>
                                    <h5 className="font-medium text-text-primary mb-2">
                                      Diagnóstico
                                    </h5>
                                    <p className="text-sm text-text-secondary">
                                      {consultation.diagnosis}
                                    </p>
                                  </div>

                                  <div>
                                    <h5 className="font-medium text-text-primary mb-2">
                                      Tratamento
                                    </h5>
                                    <ul className="space-y-1">
                                      {consultation.treatment.map(
                                        (treatment, i) => (
                                          <li
                                            key={i}
                                            className="text-sm text-text-secondary flex items-center"
                                          >
                                            <div className="w-1.5 h-1.5 bg-success rounded-full mr-2" />
                                            {treatment}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>

                                  {consultation.prescriptions.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-text-primary mb-2">
                                        Prescrições
                                      </h5>
                                      <ul className="space-y-1">
                                        {consultation.prescriptions.map(
                                          (prescription, i) => (
                                            <li
                                              key={i}
                                              className="text-sm text-text-secondary flex items-center"
                                            >
                                              <Pill className="w-3 h-3 mr-2 text-accent-500" />
                                              {prescription}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>

                                {consultation.files.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-text-primary mb-2">
                                      Arquivos
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {consultation.files.map((file, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center space-x-2 bg-background-secondary px-3 py-2 rounded"
                                        >
                                          <FileText className="w-4 h-4 text-text-tertiary" />
                                          <span className="text-sm text-text-primary">
                                            {file}
                                          </span>
                                          <Button variant="ghost" size="sm">
                                            <Eye className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {consultation.nextVisit && (
                                  <div className="bg-primary/10 p-3 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-primary-600" />
                                      <span className="text-sm font-medium text-primary-600">
                                        Próxima visita:{" "}
                                        {formatDate(consultation.nextVisit)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredConsultations.length === 0 && (
                <div className="text-center py-12">
                  <Stethoscope className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Nenhum registro encontrado
                  </h3>
                  <p className="text-text-secondary">
                    Tente ajustar os filtros ou criar uma nova consulta
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Resumo Médico
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500 mb-1">
                  {mockMedicalHistory.consultations.length}
                </div>
                <div className="text-sm text-text-secondary">
                  Total de Consultas
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-success">
                    {mockMedicalHistory.vaccinations.length}
                  </div>
                  <div className="text-xs text-text-secondary">Vacinas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-warning">
                    {mockMedicalHistory.procedures.length}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Procedimentos
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Última consulta:</span>
                  <span className="text-text-primary">
                    {formatDate(mockMedicalHistory.consultations[0].date)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Peso atual:</span>
                  <span className="text-text-primary">
                    {mockMedicalHistory.consultations[0].weight} kg
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Condições ativas:</span>
                  <span className="text-warning">
                    {mockMedicalHistory.conditions.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Conditions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-warning" />
                Condições Ativas
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMedicalHistory.conditions.map((condition, index) => (
                  <motion.div
                    key={condition.id}
                    className={`p-3 rounded-lg ${getConditionSeverityColor(condition.severity)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{condition.name}</h4>
                        <p className="text-sm opacity-80 mt-1">
                          {condition.description}
                        </p>
                        <div className="text-xs opacity-70 mt-2">
                          Diagnosticado: {formatDate(condition.diagnosedDate)}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded">
                        {condition.status === "monitoring"
                          ? "Monitorando"
                          : "Controlado"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <Shield className="w-5 h-5 mr-2 text-error" />
                Alergias
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMedicalHistory.allergies.map((allergy, index) => (
                  <motion.div
                    key={allergy.id}
                    className={`p-3 rounded-lg ${getAllergySeverityColor(allergy.severity)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{allergy.allergen}</h4>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded">
                        {allergy.severity === "severe"
                          ? "Grave"
                          : allergy.severity === "moderate"
                            ? "Moderada"
                            : "Leve"}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">{allergy.reaction}</p>
                    <p className="text-xs opacity-70 mt-2">{allergy.notes}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Vaccinations */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <Syringe className="w-5 h-5 mr-2 text-success" />
                Vacinas Recentes
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMedicalHistory.vaccinations
                  .slice(0, 3)
                  .map((vaccine, index) => (
                    <motion.div
                      key={vaccine.id}
                      className="p-3 bg-background-secondary rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text-primary">
                          {vaccine.name}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            vaccine.status === "current"
                              ? "bg-success/20 text-success"
                              : vaccine.status === "due_soon"
                                ? "bg-warning/20 text-warning"
                                : "bg-error/20 text-error"
                          }`}
                        >
                          {vaccine.status === "current"
                            ? "Em dia"
                            : vaccine.status === "due_soon"
                              ? "Vence em breve"
                              : "Atrasada"}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary space-y-1">
                        <div>Aplicada: {formatDate(vaccine.date)}</div>
                        <div>Próxima: {formatDate(vaccine.nextDue)}</div>
                        <div>Lote: {vaccine.batch}</div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Procedures */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <Clipboard className="w-5 h-5 mr-2 text-accent-500" />
                Procedimentos
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMedicalHistory.procedures.map((procedure, index) => (
                  <motion.div
                    key={procedure.id}
                    className="p-3 bg-background-secondary rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-text-primary">
                        {procedure.name}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">
                        Concluído
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">
                      {procedure.description}
                    </p>
                    <div className="text-xs text-text-tertiary">
                      {formatDate(procedure.date)} • {procedure.veterinarian}
                    </div>
                    {"chipNumber" in procedure && (
                      <div className="text-xs text-text-tertiary mt-1">
                        Chip: {procedure.chipNumber}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weight Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Evolução do Peso
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMedicalHistory.consultations
                  .slice(0, 5)
                  .map((consultation, index) => {
                    const prevWeight =
                      mockMedicalHistory.consultations[index + 1]?.weight;
                    const weightChange = prevWeight
                      ? consultation.weight - prevWeight
                      : 0;

                    return (
                      <motion.div
                        key={consultation.consultation_id}
                        className="flex items-center justify-between p-2 bg-background-secondary rounded"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div>
                          <div className="font-medium text-text-primary">
                            {consultation.weight} kg
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatDate(consultation.date)}
                          </div>
                        </div>
                        {weightChange !== 0 && (
                          <div
                            className={`text-xs font-medium ${
                              weightChange > 0 ? "text-warning" : "text-success"
                            }`}
                          >
                            {weightChange > 0 ? "+" : ""}
                            {weightChange.toFixed(1)} kg
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
