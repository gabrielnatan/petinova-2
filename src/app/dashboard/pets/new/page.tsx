//@ts-nocheck
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { petSchema, type PetFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function NewPetPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      isNeutered: false,
      proceduresPerformed: [],
      preexistingConditions: [],
      restrictions: [],
    },
  });

  const onSubmit = async (data: PetFormData) => {
    try {
      console.log("Pet data:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect to pets list
      window.location.href = "/dashboard/pets";
    } catch (error) {
      console.error("Error creating pet:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost">
          <Link href="/dashboard/pets">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Novo Pet</h1>
          <p className="text-text-secondary">Cadastre um novo pet na clínica</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tipo de Pelagem"
                {...register("coatType")}
                error={errors.coatType?.message}
                placeholder="Ex: Longo, Curto, Crespo"
              />

              <Input
                label="Cor"
                {...register("color")}
                error={errors.color?.message}
                placeholder="Ex: Dourado, Preto, Malhado"
              />
            </div>

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
              >
                <option value="">Selecione o tutor</option>
                <option value="1">João Silva - (11) 99999-9999</option>
                <option value="2">Maria Santos - (11) 88888-8888</option>
              </select>
              {errors.guardian_id && (
                <p className="text-sm text-error mt-1">
                  {errors.guardian_id.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary">
            <Link href="/dashboard/pets">Cancelar</Link>
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Pet
          </Button>
        </div>
      </form>
    </div>
  );
}
