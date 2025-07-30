//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Save,
  Stethoscope,
  Mail,
  Phone,
  Award,
  X,
} from "lucide-react";
import {
  veterinarianSchema,
  type VeterinarianFormData,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

const availableSpecialties = [
  "Clínica Geral",
  "Cirurgia",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Neurologia",
  "Oftalmologia",
  "Odontologia",
  "Fisioterapia",
  "Oncologia",
  "Ortopedia",
  "Anestesiologia",
];

export default function NewVeterinarianPage() {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VeterinarianFormData>({
    resolver: zodResolver(veterinarianSchema),
    defaultValues: {
      specialties: [],
      crmv: {
        issueDate: new Date(),
        expirationDate: new Date(new Date().getFullYear() + 5, 11, 31),
      },
    },
  });

  const onSubmit = async (data: VeterinarianFormData) => {
    try {
      const veterinarianData = {
        ...data,
        specialties: selectedSpecialties,
      };
      console.log("Veterinarian data:", veterinarianData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = "/dashboard/veterinarians";
    } catch (error) {
      console.error("Error creating veterinarian:", error);
    }
  };

  const addSpecialty = (specialty: string) => {
    if (!selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSelectedSpecialties(selectedSpecialties.filter((s) => s !== specialty));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost">
          <Link href="/dashboard/veterinarians">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Novo Veterinário
          </h1>
          <p className="text-text-secondary">
            Cadastre um novo veterinário na equipe
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Informações Pessoais
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nome Completo"
              {...register("fullName")}
              error={errors.fullName?.message}
              placeholder="Dr. João Silva"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="joao.silva@clinica.com"
                icon={Mail}
              />

              <Input
                label="Telefone"
                {...register("phoneNumber")}
                error={errors.phoneNumber?.message}
                placeholder="(11) 99999-9999"
                icon={Phone}
              />
            </div>

            <Input
              label="Anos de Experiência"
              type="number"
              {...register("yearsOfExperience", { valueAsNumber: true })}
              error={errors.yearsOfExperience?.message}
              placeholder="5"
              icon={Award}
            />
          </CardContent>
        </Card>

        {/* CRMV Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Informações do CRMV
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número do CRMV"
                {...register("crmv.number")}
                error={errors.crmv?.number?.message}
                placeholder="12345"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Estado
                </label>
                <select
                  {...register("crmv.state")}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
                {errors.crmv?.state && (
                  <p className="text-sm text-error mt-1">
                    {errors.crmv.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data de Emissão"
                type="date"
                {...register("crmv.issueDate", { valueAsDate: true })}
                error={errors.crmv?.issueDate?.message}
              />

              <Input
                label="Data de Expiração"
                type="date"
                {...register("crmv.expirationDate", { valueAsDate: true })}
                error={errors.crmv?.expirationDate?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Especialidades
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Adicionar Especialidade
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addSpecialty(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
              >
                <option value="">Selecione uma especialidade</option>
                {availableSpecialties
                  .filter((spec) => !selectedSpecialties.includes(spec))
                  .map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
              </select>
            </div>

            {selectedSpecialties.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Especialidades Selecionadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedSpecialties.map((specialty) => (
                    <motion.span
                      key={specialty}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary">
            <Link href="/dashboard/veterinarians">Cancelar</Link>
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Veterinário
          </Button>
        </div>
      </form>
    </div>
  );
}
