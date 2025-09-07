"use client";
import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPhone } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appointmentAPI, type Guardian, type Veterinarian, type Pet } from "@/lib/api/appointments";
import { useAuth } from "@/store";
// Schema de validação
const newAppointmentSchema = z.object({
  dateTime: z.string().min(1, "Data e hora são obrigatórias"),
  notes: z.string().optional(),
  veterinarianId: z.string().min(1, "Veterinário é obrigatório"),
  guardianId: z.string().min(1, "Tutor é obrigatório"),
  petId: z.string().min(1, "Pet é obrigatório"),
});
type NewAppointmentFormData = z.infer<typeof newAppointmentSchema>;
// Não precisamos dessa interface, vamos usar Guardian diretamente
export default function NewAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [guardianSearch, setGuardianSearch] = useState("");
  const [showNewGuardianForm, setShowNewGuardianForm] = useState(false);
  // API Data
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
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
  // Verificar autenticação
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
  }, [checkAuth]);
  // Redirecionar se não autenticado
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router, authChecked]);
  // Carregar dados iniciais
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [guardiansData, veterinariansData] = await Promise.all([
          appointmentAPI.getGuardians(),
          appointmentAPI.getVeterinarians()
        ]);
        setGuardians(guardiansData);
        setVeterinarians(veterinariansData);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [authChecked, isAuthenticated]);

  // Filtrar tutores baseado na busca
  const filteredGuardians = guardians.filter(
    (guardian) =>
      (guardian.fullName && guardian.fullName.toLowerCase().includes(guardianSearch.toLowerCase())) ||
      (guardian.email && guardian.email.toLowerCase().includes(guardianSearch.toLowerCase())) ||
      (guardian.phone && guardian.phone.includes(guardianSearch)),
  );
  const selectedVeterinarian = veterinarians.find(
    (v) => v.veterinarian_id === watchedVeterinarian,
  );
  const onSubmit = async (data: NewAppointmentFormData) => {
    try {
      // Converter dateTime para date e time separados
      const [date, time] = data.dateTime.split('T');
      await appointmentAPI.createAppointment({
        date,
        time,
        petId: data.petId,
        veterinarianId: data.veterinarianId,
        guardianId: data.guardianId,
        notes: data.notes,
        type: 'CONSULTATION',
        status: 'SCHEDULED'
      });
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError("Erro ao criar agendamento");
    }
  };
  const handleGuardianSelect = async (guardian: Guardian) => {
    try {
      setSelectedGuardian(guardian);
      setValue("guardianId", guardian.guardian_id);
      // Carregar pets do tutor
      const guardianPets = await appointmentAPI.getPetsByGuardian(guardian.guardian_id);
      setPets(guardianPets);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error loading pets:", error);
      setError("Erro ao carregar pets do tutor");
    }
  };
  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setValue("petId", pet.pet_id);
    setCurrentStep(3);
  };
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Mínimo 30 minutos a partir de agora
    return now.toISOString().slice(0, 16);
  };
  const checkAvailability = async (dateTime: string, veterinarianId: string) => {
    if (!dateTime || !veterinarianId) return false;
    try {
      return await appointmentAPI.checkAvailability(veterinarianId, dateTime);
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    }
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
          {filteredGuardians.map((guardian, index) => (
            <div
              key={guardian.guardian_id || `guardian-${index}`}
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
                    {guardian.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {formatPhone(guardian.phone)}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      Ver pets
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <Button key="change-guardian" variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
            Alterar Tutor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Olá cursor, olhe aqui deveria aparecer a lista de pets para serem selecionados, porem nao aparece, deve aparecer somente do guardian selecionado, eu seleciono um que tem 2 pets e ele nao aparece */}
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
              {pets.length > 0 ? pets.map((pet, index) => (
                <div
                  key={pet.pet_id || `pet-${index}`}
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
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <Heart className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Nenhum pet encontrado
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Este tutor ainda não possui pets cadastrados.
                  </p>
                  <Button variant="secondary" asChild>
                    <Link href={`/dashboard/pets/new?guardian=${selectedGuardian.guardian_id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Pet
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            {pets.length > 0 && (
              <div className="text-center pt-4">
                <Button variant="secondary" asChild>
                  <Link href={`/dashboard/pets/new?guardian=${selectedGuardian.guardian_id}`} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Novo Pet
                  </Link>
                </Button>
              </div>
            )}
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
                  {veterinarians.map((vet, index) => (
                    <option
                      key={vet.veterinarian_id || `vet-${index}`}
                      value={vet.veterinarian_id}
                    >
                      {vet.fullName} - {vet.role}
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
              <Button key="back" variant="secondary" onClick={() => setCurrentStep(2)}>
                Voltar
              </Button>
              <Button
                key="submit"
                type="submit"
                loading={isSubmitting}
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
  if (!authChecked || loading) {
    return (
      <div className="p-6 mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 mx-auto">
      {/* Error Display */}
      {error && (
        <Card className="border-error mb-6">
          <CardContent className="p-4">
            <p className="text-error text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
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
        <div
          key={currentStep}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </form>
      {/* New Guardian Modal */}
      {showNewGuardianForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewGuardianForm(false)}
        >
          <div
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
                key="cancel"
                variant="secondary"
                onClick={() => setShowNewGuardianForm(false)}
              >
                Cancelar
              </Button>
              <Button key="confirm" asChild>
                <Link href="/dashboard/guardians/new" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Ir para Cadastro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
