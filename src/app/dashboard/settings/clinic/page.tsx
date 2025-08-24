"use client";
import Link from "next/link"
import React from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/store";

export default function ClinicSettingsPage() {
  const { currentClinic } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      legalName: currentClinic?.legalName || "",
      tradeName: currentClinic?.tradeName || "",
      cnpj: currentClinic?.cnpj || "",
      email: currentClinic?.email || "",
      address: currentClinic?.address || "",
      phoneNumber: "",
      mobileNumber: "",
      siteUrl: "",
      operatingHours: "",
      specialties: "",
      stateRegistration: "",
      sanitaryLicense: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      console.log("Clinic data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error("Error updating clinic:", error);
    }
  };

  return (
    <div className="p-6  mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/settings" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Dados da Clínica
          </h1>
          <p className="text-text-secondary">
            Configure as informações básicas da clínica
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Informações Básicas
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Razão Social"
                {...register("legalName", {
                  required: "Razão social é obrigatória",
                })}
                error={errors.legalName?.message as string}
                placeholder="Clínica Veterinária São Bento LTDA"
              />

              <Input
                label="Nome Fantasia"
                {...register("tradeName", {
                  required: "Nome fantasia é obrigatório",
                })}
                error={errors.tradeName?.message as string}
                placeholder="Clínica São Bento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CNPJ"
                {...register("cnpj", { required: "CNPJ é obrigatório" })}
                error={errors.cnpj?.message as string}
                placeholder="12.345.678/0001-90"
              />

              <Input
                label="Inscrição Estadual"
                {...register("stateRegistration")}
                error={errors.stateRegistration?.message as string}
                placeholder="123.456.789.123"
              />
            </div>

            <Input
              label="Licença Sanitária"
              {...register("sanitaryLicense")}
              error={errors.sanitaryLicense?.message as string}
              placeholder="LS-123456789"
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
                {...register("email", { required: "Email é obrigatório" })}
                error={errors.email?.message as string}
                placeholder="contato@clinica.com"
                icon={Mail}
              />

              <Input
                label="Site"
                {...register("siteUrl")}
                error={errors.siteUrl?.message as string}
                placeholder="https://www.clinica.com"
                icon={Globe}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Telefone Fixo"
                {...register("phoneNumber")}
                error={errors.phoneNumber?.message as string}
                placeholder="(11) 3333-4444"
                icon={Phone}
              />

              <Input
                label="Celular/WhatsApp"
                {...register("mobileNumber")}
                error={errors.mobileNumber?.message as string}
                placeholder="(11) 99999-8888"
                icon={Phone}
              />
            </div>

            <Input
              label="Endereço Completo"
              {...register("address", { required: "Endereço é obrigatório" })}
              error={errors.address?.message as string}
              placeholder="Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01000-000"
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
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Horário de Funcionamento
              </label>
              <textarea
                {...register("operatingHours")}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                rows={3}
                placeholder="Segunda a Sexta: 08:00 às 18:00&#10;Sábado: 08:00 às 12:00&#10;Domingo: Fechado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Especialidades
              </label>
              <textarea
                {...register("specialties")}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                rows={3}
                placeholder="Clínica Geral, Cirurgia, Cardiologia, Dermatologia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Logo da Clínica
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-background-secondary border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-text-tertiary" />
                </div>
                <div className="flex-1">
                  <Button variant="secondary" type="button">
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher Arquivo
                  </Button>
                  <p className="text-xs text-text-tertiary mt-1">
                    PNG, JPG até 2MB (recomendado: 200x200px)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/settings" className="flex items-center justify-center">Cancelar</Link>
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
