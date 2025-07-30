//@ts-nocheck
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from "lucide-react";
import { guardianSchema, type GuardianFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function NewGuardianPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      gender: "Unknown",
    },
  });

  const onSubmit = async (data: GuardianFormData) => {
    try {
      console.log("Guardian data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = "/dashboard/guardians";
    } catch (error) {
      console.error("Error creating guardian:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost">
          <Link href="/dashboard/guardians">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Novo Tutor</h1>
          <p className="text-text-secondary">
            Cadastre um novo tutor responsável
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações Pessoais
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                {...register("fullName")}
                error={errors.fullName?.message}
                placeholder="Ex: João Silva"
                icon={User}
              />

              <Input
                label="CPF"
                {...register("cpf")}
                error={errors.cpf?.message}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="RG"
                {...register("rg")}
                error={errors.rg?.message}
                placeholder="Ex: 12.345.678-9"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Gênero
                </label>
                <select
                  {...register("gender")}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="Male">Masculino</option>
                  <option value="Female">Feminino</option>
                  <option value="Other">Outro</option>
                  <option value="Unknown">Prefiro não informar</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-error mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <Input
              label="Data de Nascimento"
              type="date"
              {...register("birthDate", { valueAsDate: true })}
              error={errors.birthDate?.message}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Informações de Contato
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="exemplo@email.com"
                icon={Mail}
              />

              <Input
                label="Telefone"
                {...register("phone")}
                error={errors.phone?.message}
                placeholder="(11) 99999-9999"
                icon={Phone}
              />
            </div>

            <Input
              label="Endereço Completo"
              {...register("address")}
              error={errors.address?.message}
              placeholder="Rua, número, bairro, cidade - Estado"
              icon={MapPin}
            />
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
            <div className="p-4 bg-background-secondary rounded-lg">
              <p className="text-sm text-text-secondary mb-2">
                <strong>Próximo passo:</strong> Após cadastrar o tutor, você
                poderá:
              </p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Cadastrar os pets do tutor</li>
                <li>• Agendar consultas</li>
                <li>• Visualizar histórico completo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary">
            <Link href="/dashboard/guardians">Cancelar</Link>
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Tutor
          </Button>
        </div>
      </form>
    </div>
  );
}
