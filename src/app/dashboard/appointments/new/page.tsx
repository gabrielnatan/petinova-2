"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Heart,
  Search,
  Plus,
  Check,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPhone } from "@/lib/utils";
import Link from "next/link";

// Schema de validação
const newAppointmentSchema = z.object({
  dateTime: z.string().min(1, "Data e hora são obrigatórias"),
  notes: z.string().min(1, "Observações são obrigatórias"),
  veterinarianId: z.string().min(1, "Veterinário é obrigatório"),
  guardianId: z.string().min(1, "Tutor é obrigatório"),
  petId: z.string().min(1, "Pet é obrigatório"),
});

type NewAppointmentFormData = z.infer<typeof newAppointmentSchema>;

// Mock data
const mockGuardians = [
  {
    guardian_id: "1",
    fullName: "João Silva",
    email: "joao@email.com",
    phone: "11999999999",
    pets: [
      { pet_id: "1", name: "Buddy", species: "Cão", breed: "Golden Retriever" },
      { pet_id: "2", name: "Rex", species: "Cão", breed: "Pastor Alemão" },
    ],
  },
  {
    guardian_id: "2",
    fullName: "Maria Santos",
    email: "maria@email.com",
    phone: "11888888888",
    pets: [{ pet_id: "3", name: "Luna", species: "Gato", breed: "Siamês" }],
  },
  {
    guardian_id: "3",
    fullName: "Pedro Costa",
    email: "pedro@email.com",
    phone: "11777777777",
    pets: [
      { pet_id: "4", name: "Max", species: "Cão", breed: "Bulldog" },
      { pet_id: "5", name: "Mia", species: "Gato", breed: "Persa" },
    ],
  },
];

const mockVeterinarians = [
  {
    veterinarian_id: "1",
    fullName: "Dra. Maria Santos",
    specialty: "Clínica Geral",
    crmv: "12345/SP",
    availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  },
  {
    veterinarian_id: "2",
    fullName: "Dr. Carlos Lima",
    specialty: "Cirurgia",
    crmv: "23456/SP",
    availableHours: ["08:00", "09:00", "13:00", "14:00", "15:00"],
  },
  {
    veterinarian_id: "3",
    fullName: "Dra. Ana Oliveira",
    specialty: "Dermatologia",
    crmv: "34567/SP",
    availableHours: ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
  },
];

export default function NewAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGuardian, setSelectedGuardian] = useState<
    (typeof mockGuardians)[0] | null
  >(null);
  const [selectedPet, setSelectedPet] = useState<
    (typeof mockGuardians)[0]["pets"][0] | null
  >(null);
  const [guardianSearch, setGuardianSearch] = useState("");
  const [showNewGuardianForm, setShowNewGuardianForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewAppointmentFormData>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      dateTime: "",
      notes: "",
      veterinarianId: "",
      guardianId: "",
      petId: "",
    },
  });

  const watchedVeterinarian = watch("veterinarianId");
  const watchedDateTime = watch("dateTime");

  // Filtrar tutores baseado na busca
  const filteredGuardians = mockGuardians.filter(
    (guardian) =>
      guardian.fullName.toLowerCase().includes(guardianSearch.toLowerCase()) ||
      guardian.email.toLowerCase().includes(guardianSearch.toLowerCase()) ||
      guardian.phone.includes(guardianSearch),
  );

  const selectedVeterinarian = mockVeterinarians.find(
    (v) => v.veterinarian_id === watchedVeterinarian,
  );

  const onSubmit = async (data: NewAppointmentFormData) => {
    try {
      console.log("Creating appointment:", data);

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to appointments list
      window.location.href = "/dashboard/appointments";
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleGuardianSelect = (guardian: (typeof mockGuardians)[0]) => {
    setSelectedGuardian(guardian);
    setValue("guardianId", guardian.guardian_id);
    setCurrentStep(2);
  };

  const handlePetSelect = (pet: (typeof mockGuardians)[0]["pets"][0]) => {
    setSelectedPet(pet);
    setValue("petId", pet.pet_id);
    setCurrentStep(3);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Mínimo 30 minutos a partir de agora
    return now.toISOString().slice(0, 16);
  };

  const isTimeAvailable = (dateTime: string, veterinarianId: string) => {
    if (!dateTime || !veterinarianId) return false;

    const selectedDate = new Date(dateTime);
    const time = selectedDate.toTimeString().slice(0, 5);
    const veterinarian = mockVeterinarians.find(
      (v) => v.veterinarian_id === veterinarianId,
    );

    return veterinarian?.availableHours.includes(time) || false;
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <User className="w-5 h-5 mr-2" />
          1. Selecionar Tutor
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={guardianSearch}
              onChange={(e) => setGuardianSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowNewGuardianForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Tutor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredGuardians.map((guardian) => (
            <motion.div
              key={guardian.guardian_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="p-4 border border-border rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
              onClick={() => handleGuardianSelect(guardian)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">
                    {guardian.fullName}
                  </h3>
                  <div className="text-sm text-text-secondary space-y-1">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {guardian.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {formatPhone(guardian.phone)}
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      {guardian.pets.length} pet
                      {guardian.pets.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredGuardians.length === 0 && guardianSearch && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Nenhum tutor encontrado
            </h3>
            <p className="text-text-secondary mb-4">
              Não encontramos tutores com &quot;{guardianSearch}&quot;
            </p>
            <Button onClick={() => setShowNewGuardianForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Novo Tutor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            2. Selecionar Pet
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
            Alterar Tutor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedGuardian && (
          <>
            <div className="p-3 bg-background-secondary rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">
                    {selectedGuardian.fullName}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {selectedGuardian.email}
                  </p>
                </div>
                <Check className="w-5 h-5 text-success ml-auto" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedGuardian.pets.map((pet) => (
                <motion.div
                  key={pet.pet_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className="p-4 border border-border rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
                  onClick={() => handlePetSelect(pet)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {pet.breed} • {pet.species}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button variant="secondary" asChild>
                <Link href="/dashboard/pets/new" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Novo Pet
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          3. Detalhes do Agendamento
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedGuardian && selectedPet && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-background-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">
                      {selectedGuardian.fullName}
                    </h3>
                    <p className="text-sm text-text-secondary">Tutor</p>
                  </div>
                  <Check className="w-4 h-4 text-success ml-auto" />
                </div>
              </div>

              <div className="p-3 bg-background-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">
                      {selectedPet.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {selectedPet.breed}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-success ml-auto" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Veterinário
                </label>
                <select
                  {...register("veterinarianId")}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="">Selecione um veterinário</option>
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

              <Input
                label="Data e Hora"
                type="datetime-local"
                {...register("dateTime")}
                error={errors.dateTime?.message}
                min={getMinDateTime()}
                icon={Calendar}
              />
            </div>

            {watchedDateTime &&
              watchedVeterinarian &&
              !isTimeAvailable(watchedDateTime, watchedVeterinarian) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning mb-1">
                      Horário não disponível
                    </h4>
                    <p className="text-sm text-warning/80">
                      O veterinário selecionado não está disponível neste
                      horário.
                    </p>
                    {selectedVeterinarian && (
                      <p className="text-sm text-warning/80 mt-1">
                        <strong>Horários disponíveis:</strong>{" "}
                        {selectedVeterinarian.availableHours.join(", ")}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Observações
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                placeholder="Descreva o motivo da consulta, sintomas observados, procedimentos necessários, etc."
              />
              {errors.notes && (
                <p className="text-sm text-error mt-1">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                Voltar
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={
                  (watchedDateTime &&
                  watchedVeterinarian &&
                  !isTimeAvailable(watchedDateTime, watchedVeterinarian)) as boolean
                }
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Agendando..." : "Agendar Consulta"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6  mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/appointments" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Novo Agendamento
          </h1>
          <p className="text-text-secondary">
            Agende uma nova consulta para o pet
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step <= currentStep
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "border-border text-text-tertiary"
                }`}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step < currentStep ? "bg-primary-500" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span
            className={
              currentStep >= 1 ? "text-primary-600" : "text-text-tertiary"
            }
          >
            Selecionar Tutor
          </span>
          <span
            className={
              currentStep >= 2 ? "text-primary-600" : "text-text-tertiary"
            }
          >
            Selecionar Pet
          </span>
          <span
            className={
              currentStep >= 3 ? "text-primary-600" : "text-text-tertiary"
            }
          >
            Detalhes
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </motion.div>
      </form>

      {/* New Guardian Modal */}
      {showNewGuardianForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewGuardianForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Cadastrar Novo Tutor
            </h3>
            <p className="text-text-secondary mb-6">
              Para agilizar o processo, você será redirecionado para a página de
              cadastro de tutores.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowNewGuardianForm(false)}
              >
                Cancelar
              </Button>
              <Button asChild>
                <Link href="/dashboard/guardians/new" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Ir para Cadastro
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
