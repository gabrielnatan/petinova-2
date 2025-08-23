//@ts-nocheck
"use client";

import React, { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { petSchema, type PetFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
}


export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loadingGuardians, setLoadingGuardians] = useState(true);
  const [loadingPet, setLoadingPet] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        // Fetch pet data and guardians in parallel
        const [petResponse, guardiansResponse] = await Promise.all([
          fetch(`/api/pets/${resolvedParams.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/guardians", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (petResponse.ok) {
          const petData = await petResponse.json();
          const pet = petData.pet;
          
          // Reset form with pet data
          reset({
            name: pet.name,
            species: pet.species,
            breed: pet.breed || "",
            size: pet.size || "",
            weight: pet.weight || 0,
            isNeutered: pet.isNeutered,
            environment: pet.environment || "",
            birthDate: pet.birthDate ? new Date(pet.birthDate) : undefined,
            notes: pet.notes || "",
            coatType: "",
            color: "",
            proceduresPerformed: [],
            preexistingConditions: [],
            restrictions: [],
            guardian_id: pet.guardian_id,
          });
        }

        if (guardiansResponse.ok) {
          const guardiansData = await guardiansResponse.json();
          setGuardians(guardiansData.guardians);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitError("Erro ao carregar dados");
      } finally {
        setLoadingPet(false);
        setLoadingGuardians(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, reset]);

  const onSubmit = async (data: PetFormData) => {
    setSubmitError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/pets/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          species: data.species,
          breed: data.breed,
          size: data.size,
          weight: data.weight,
          isNeutered: data.isNeutered,
          environment: data.environment,
          birthDate: data.birthDate?.toISOString(),
          notes: data.notes,
          guardianId: data.guardian_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar pet");
      }

      router.push(`/dashboard/pets/${resolvedParams.id}`);
    } catch (error) {
      console.error("Error updating pet:", error);
      setSubmitError(error instanceof Error ? error.message : "Erro desconhecido");
    }
  };

  if (loadingPet) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard/pets/${resolvedParams.id}`} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Editar Pet</h1>
          <p className="text-text-secondary">Atualize as informações do pet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Informações Básicas
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Pet"
                {...register("name")}
                error={errors.name?.message}
                placeholder="Ex: Buddy"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Espécie
                </label>
                <select
                  {...register("species")}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="">Selecione a espécie</option>
                  <option value="Cão">Cão</option>
                  <option value="Gato">Gato</option>
                  <option value="Pássaro">Pássaro</option>
                  <option value="Coelho">Coelho</option>
                  <option value="Hamster">Hamster</option>
                  <option value="Outro">Outro</option>
                </select>
                {errors.species && (
                  <p className="text-sm text-error mt-1">
                    {errors.species.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Raça"
                {...register("breed")}
                error={errors.breed?.message}
                placeholder="Ex: Golden Retriever"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Porte
                </label>
                <select
                  {...register("size")}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="">Selecione o porte</option>
                  <option value="Pequeno">Pequeno</option>
                  <option value="Médio">Médio</option>
                  <option value="Grande">Grande</option>
                </select>
                {errors.size && (
                  <p className="text-sm text-error mt-1">
                    {errors.size.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Peso (kg)"
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
                error={errors.weight?.message}
                placeholder="Ex: 15.5"
              />

              <Input
                label="Data de Nascimento"
                type="date"
                {...register("birthDate", { valueAsDate: true })}
                error={errors.birthDate?.message}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Ambiente
                </label>
                <select
                  {...register("environment")}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="">Selecione o ambiente</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Sítio/Fazenda">Sítio/Fazenda</option>
                  <option value="Outro">Outro</option>
                </select>
                {errors.environment && (
                  <p className="text-sm text-error mt-1">
                    {errors.environment.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("isNeutered")}
                className="h-4 w-4 text-primary-600 border-border rounded focus:ring-primary-500"
              />
              <label className="text-sm text-text-primary">
                Pet castrado/esterilizado
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Informações Adicionais
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Observações
              </label>
              <textarea
                {...register("notes")}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                rows={3}
                placeholder="Observações gerais sobre o pet..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tutor Responsável
              </label>
              <select
                {...register("guardian_id")}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                disabled={loadingGuardians}
              >
                <option value="">
                  {loadingGuardians ? "Carregando..." : "Selecione o tutor"}
                </option>
                {guardians.map((guardian) => (
                  <option key={guardian.id} value={guardian.id}>
                    {guardian.name} - {guardian.phone || guardian.email}
                  </option>
                ))}
              </select>
              {errors.guardian_id && (
                <p className="text-sm text-error mt-1">
                  {errors.guardian_id.message}
                </p>
              )}
              {guardians.length === 0 && !loadingGuardians && (
                <p className="text-sm text-text-secondary mt-1">
                  Nenhum tutor encontrado. Cadastre um tutor primeiro.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {submitError && (
          <Card className="border-error">
            <CardContent className="p-4">
              <p className="text-error text-sm">{submitError}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/pets/${resolvedParams.id}`} className="flex items-center justify-center">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}