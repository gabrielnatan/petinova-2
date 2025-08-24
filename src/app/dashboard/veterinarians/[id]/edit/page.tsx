"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Stethoscope,
  Award,
  Clock,
  X,
  AlertTriangle,
  Trash2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data - replace with actual data fetching
const mockVeterinarian = {
  veterinarian_id: "1",
  fullName: "Dra. Maria Santos",
  crmv: {
    number: "12345",
    state: "SP",
    issueDate: new Date("2015-06-15"),
    expirationDate: new Date("2025-06-15"),
  },
  email: "maria.santos@clinica.com",
  phoneNumber: "11987654321",
  yearsOfExperience: 8,
  specialties: ["Clínica Geral", "Cirurgia", "Cardiologia"],
  availabilitySchedule: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ],
  biography:
    "Veterinária especializada em clínica geral e cirurgia com mais de 8 anos de experiência. Formada pela FMVZ-USP, possui especialização em cardiologia veterinária e é membro da ANCLIVEPA.",
  created_at: new Date("2015-06-20"),

  // Weekly schedule
  weeklySchedule: {
    Monday: { start: "08:00", end: "17:00", enabled: true },
    Tuesday: { start: "08:00", end: "17:00", enabled: true },
    Wednesday: { start: "08:00", end: "17:00", enabled: true },
    Thursday: { start: "08:00", end: "17:00", enabled: true },
    Friday: { start: "08:00", end: "16:00", enabled: true },
    Saturday: { start: "08:00", end: "12:00", enabled: false },
    Sunday: { start: "08:00", end: "12:00", enabled: false },
  },
};

const availableSpecialties = [
  "Clínica Geral",
  "Cirurgia",
  "Cardiologia",
  "Dermatologia",
  "Oftalmologia",
  "Neurologia",
  "Oncologia",
  "Ortopedia",
  "Anestesiologia",
  "Medicina Intensiva",
  "Reprodução Animal",
  "Medicina Felina",
  "Medicina Aviária",
  "Medicina de Animais Silvestres",
];

const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const formatDate = (date: any) => {
  return date.toISOString().split("T")[0];
};

const getDayName = (day: any) => {
  const days = {
    Monday: "Segunda-feira",
    Tuesday: "Terça-feira",
    Wednesday: "Quarta-feira",
    Thursday: "Quinta-feira",
    Friday: "Sexta-feira",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };
  return (days as any)[day] || day;
};

export default function EditVeterinarianPage({ params }:{ params:any }) {
  const [formData, setFormData] = useState({
    fullName: mockVeterinarian.fullName,
    email: mockVeterinarian.email,
    phoneNumber: mockVeterinarian.phoneNumber,
    biography: mockVeterinarian.biography,
    crmvNumber: mockVeterinarian.crmv.number,
    crmvState: mockVeterinarian.crmv.state,
    crmvIssueDate: formatDate(mockVeterinarian.crmv.issueDate),
    crmvExpirationDate: formatDate(mockVeterinarian.crmv.expirationDate),
  });

  const [specialties, setSpecialties] = useState(mockVeterinarian.specialties);
  const [schedule, setSchedule] = useState(mockVeterinarian.weeklySchedule);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addSpecialty = (specialty: string) => {
    if (!specialties.includes(specialty)) {
      setSpecialties((prev) => [...prev, specialty]);
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties((prev) => prev.filter((s) => s !== specialty));
  };

  const updateSchedule = (day: string, field: string, value: string | boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...(prev as any)[day],
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Telefone é obrigatório";
    if (!formData.crmvNumber.trim())
      newErrors.crmvNumber = "Número do CRMV é obrigatório";
    if (!formData.crmvState)
      newErrors.crmvState = "Estado do CRMV é obrigatório";
    if (!formData.crmvIssueDate)
      newErrors.crmvIssueDate = "Data de emissão é obrigatória";
    if (!formData.crmvExpirationDate)
      newErrors.crmvExpirationDate = "Data de validade é obrigatória";

    if (specialties.length === 0) {
      newErrors.specialties = "Adicione pelo menos uma especialidade";
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validate CRMV expiration date
    if (formData.crmvExpirationDate && formData.crmvIssueDate) {
      if (
        new Date(formData.crmvExpirationDate) <=
        new Date(formData.crmvIssueDate)
      ) {
        newErrors.crmvExpirationDate =
          "Data de validade deve ser posterior à data de emissão";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const veterinarianData = {
        ...formData,
        specialties,
        schedule,
        updated_at: new Date(),
      };

      console.log("Updating veterinarian:", veterinarianData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Veterinário atualizado com sucesso!");
      // Redirect to veterinarian details
      // window.location.href = `/dashboard/veterinarians/${params.id}`;
    } catch (error) {
      console.error("Error updating veterinarian:", error);
      alert("Erro ao atualizar veterinário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting veterinarian:", params.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Veterinário removido com sucesso!");
      // window.location.href = '/dashboard/veterinarians';
    } catch (error) {
      console.error("Error deleting veterinarian:", error);
      alert("Erro ao remover veterinário. Tente novamente.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Veterinário
            </h1>
            <p className="text-text-secondary">
              {mockVeterinarian.fullName} • CRMV {mockVeterinarian.crmv.number}/
              {mockVeterinarian.crmv.state}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="error" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações Pessoais
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome Completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                error={errors.fullName}
                required
                icon={User}
                placeholder="Ex: Dr. João Silva"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  required
                  icon={Mail}
                  placeholder="exemplo@email.com"
                />

                <Input
                  label="Telefone"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  error={errors.phoneNumber}
                  required
                  icon={Phone}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Biografia
                </label>
                <textarea
                  value={formData.biography}
                  onChange={(e) =>
                    handleInputChange("biography", e.target.value)
                  }
                  rows={4}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                  placeholder="Descreva a experiência e qualificações do veterinário..."
                />
              </div>
            </CardContent>
          </Card>

          {/* CRMV Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Informações do CRMV
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número do CRMV"
                  value={formData.crmvNumber}
                  onChange={(e) =>
                    handleInputChange("crmvNumber", e.target.value)
                  }
                  error={errors.crmvNumber}
                  required
                  placeholder="Ex: 12345"
                />

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Estado <span className="text-error">*</span>
                  </label>
                  <select
                    value={formData.crmvState}
                    onChange={(e) =>
                      handleInputChange("crmvState", e.target.value)
                    }
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                  >
                    <option value="">Selecione o estado</option>
                    {brazilianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.crmvState && (
                    <p className="text-sm text-error mt-1">
                      {errors.crmvState}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data de Emissão"
                  type="date"
                  value={formData.crmvIssueDate}
                  onChange={(e) =>
                    handleInputChange("crmvIssueDate", e.target.value)
                  }
                  error={errors.crmvIssueDate}
                  required
                />

                <Input
                  label="Data de Validade"
                  type="date"
                  value={formData.crmvExpirationDate}
                  onChange={(e) =>
                    handleInputChange("crmvExpirationDate", e.target.value)
                  }
                  error={errors.crmvExpirationDate}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Especialidades
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Specialties */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Especialidades Atuais
                </label>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {specialty}
                      <button
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {specialties.length === 0 && (
                    <p className="text-text-tertiary text-sm">
                      Nenhuma especialidade adicionada
                    </p>
                  )}
                </div>
                {errors.specialties && (
                  <p className="text-sm text-error mt-1">
                    {errors.specialties}
                  </p>
                )}
              </div>

              {/* Add Specialty */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Adicionar Especialidade
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSpecialties
                    .filter((specialty) => !specialties.includes(specialty))
                    .map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => addSpecialty(specialty)}
                        className="text-left px-3 py-2 text-sm border border-border rounded-md hover:bg-background-secondary transition-colors"
                      >
                        {specialty}
                      </button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Horários de Trabalho
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(schedule).map(([day, daySchedule]) => (
                <div
                  key={day}
                  className="flex items-center space-x-4 p-3 bg-background-secondary rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={daySchedule.enabled}
                      onChange={(e) =>
                        updateSchedule(day, "enabled", e.target.checked)
                      }
                      className="w-4 h-4 text-primary-600 border-border rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-text-primary min-w-[100px]">
                      {getDayName(day)}
                    </span>
                  </div>

                  {daySchedule.enabled ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={daySchedule.start}
                        onChange={(e) =>
                          updateSchedule(day, "start", e.target.value)
                        }
                        className="bg-surface border border-border rounded px-2 py-1 text-sm text-text-primary focus:border-border-focus focus:outline-none"
                      />
                      <span className="text-text-secondary">às</span>
                      <input
                        type="time"
                        value={daySchedule.end}
                        onChange={(e) =>
                          updateSchedule(day, "end", e.target.value)
                        }
                        className="bg-surface border border-border rounded px-2 py-1 text-sm text-text-primary focus:border-border-focus focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-text-tertiary text-sm">
                      Não trabalha
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Ações</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>

              <Button variant="secondary" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Ver Agenda
              </Button>

              <Button variant="secondary" className="w-full">
                Cancelar Edição
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
                  #{params.id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Cadastrado em:</span>
                <span className="text-text-primary">
                  {mockVeterinarian.created_at.toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Experiência:</span>
                <span className="text-text-primary">
                  {mockVeterinarian.yearsOfExperience} anos
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-1">Atenção</h4>
                  <p className="text-sm text-text-secondary">
                    Alterações nos dados do CRMV podem afetar a validade do
                    registro profissional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
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
                  Excluir Veterinário
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir permanentemente{" "}
              <strong>{mockVeterinarian.fullName}</strong>? Todos os dados
              associados serão perdidos.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button variant="error" onClick={handleDelete}>
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
