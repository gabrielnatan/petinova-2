//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Trash2,
  Eye,
  Heart,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {  formatDate } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

// Schema de validação
const editGuardianSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  rg: z.string().min(1, "RG é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  birthDate: z.date().optional(),
  gender: z.enum(["Male", "Female", "Other", "Unknown"]),
});

type EditGuardianFormData = z.infer<typeof editGuardianSchema>;

// Mock data - replace with actual data fetching
const mockGuardian = {
  guardian_id: "1",
  fullName: "João Silva",
  cpf: "12345678901",
  rg: "123456789",
  email: "joao@email.com",
  phone: "11999999999",
  address: "Rua das Flores, 123 - Centro, São Paulo - SP",
  birthDate: new Date("1985-03-15"),
  gender: "Male",
  avatarUrl: null,
  created_at: new Date("2024-01-15"),
  updated_at: new Date("2024-12-20"),

  pets: [
    {
      pet_id: "1",
      name: "Buddy",
      species: "Cão",
      breed: "Golden Retriever",
      age: "4 anos",
      lastVisit: new Date("2024-12-20"),
      nextAppointment: new Date("2025-02-15"),
    },
    {
      pet_id: "2",
      name: "Rex",
      species: "Cão",
      breed: "Pastor Alemão",
      age: "2 anos",
      lastVisit: new Date("2024-11-15"),
      nextAppointment: null,
    },
  ],

  stats: {
    totalAppointments: 8,
    totalConsultations: 6,
    totalSpent: 1250.0,
    lastVisit: new Date("2024-12-20"),
    clientSince: new Date("2024-01-15"),
  },
};

export default function EditGuardianPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const params = useParams();
  const appointmentId = params?.id as string;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditGuardianFormData>({
    resolver: zodResolver(editGuardianSchema),
    defaultValues: {
      fullName: mockGuardian.fullName,
      cpf: mockGuardian.cpf,
      rg: mockGuardian.rg,
      email: mockGuardian.email,
      phone: mockGuardian.phone,
      address: mockGuardian.address,
      birthDate: mockGuardian.birthDate,
      gender: mockGuardian.gender as any,
    },
  });

  const onSubmit = async (data: EditGuardianFormData) => {
    try {
      console.log("Updating guardian:", { id: appointmentId, ...data });

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to guardian profile
      window.location.href = `/dashboard/guardians/${appointmentId}`;
    } catch (error) {
      console.error("Error updating guardian:", error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting guardian:", appointmentId);

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to guardians list
      window.location.href = "/dashboard/guardians";
    } catch (error) {
      console.error("Error deleting guardian:", error);
    }
  };

  const handleDeactivate = async () => {
    try {
      setIsDeactivating(true);
      console.log("Deactivating guardian:", appointmentId);

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsDeactivating(false);
      // Mostrar toast de sucesso
    } catch (error) {
      console.error("Error deactivating guardian:", error);
      setIsDeactivating(false);
    }
  };

  const formatCPFInput = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhoneInput = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/guardians/${appointmentId}`} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Tutor
            </h1>
            <p className="text-text-secondary">
              {mockGuardian.fullName} • Última atualização:{" "}
              {formatDate(mockGuardian.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="text-warning hover:bg-warning/10"
            onClick={handleDeactivate}
            loading={isDeactivating}
          >
            <Shield className="w-4 h-4 mr-2" />
            {isDeactivating ? "Desativando..." : "Desativar"}
          </Button>

          <Button
            variant="ghost"
            className="text-error hover:bg-error/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    onChange={(e) => {
                      e.target.value = formatCPFInput(e.target.value);
                    }}
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
                    onChange={(e) => {
                      e.target.value = formatPhoneInput(e.target.value);
                    }}
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

            {/* Associated Pets */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Pets Associados ({mockGuardian.pets.length})
                  </h2>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/dashboard/pets/new" className="flex items-center justify-center">Adicionar Pet</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGuardian.pets.map((pet) => (
                    <motion.div
                      key={pet.pet_id}
                      className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            {pet.name}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            {pet.breed} • {pet.species}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            Última visita: {formatDate(pet.lastVisit)}
                            {pet.nextAppointment && (
                              <span className="ml-2">
                                • Próximo: {formatDate(pet.nextAppointment)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/pets/${pet.pet_id}`} className="flex items-center justify-center">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/pets/${pet.pet_id}/edit`} className="flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Ações
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={!isDirty}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>

                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/dashboard/guardians/${appointmentId}`} className="flex items-center justify-center">
                    Cancelar Edição
                  </Link>
                </Button>

                <hr className="border-border" />

                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/dashboard/appointments/new" className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Consulta
                  </Link>
                </Button>

                <Button variant="secondary" className="w-full">
                  <Link href="/dashboard/pets/new">
                    <Heart className="w-4 h-4 mr-2" />
                    Cadastrar Novo Pet
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Estatísticas
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500 mb-1">
                    {mockGuardian.pets.length}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Pets Cadastrados
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-text-primary">
                      {mockGuardian.stats.totalAppointments}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Agendamentos
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-text-primary">
                      {mockGuardian.stats.totalConsultations}
                    </div>
                    <div className="text-xs text-text-secondary">Consultas</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Cliente desde:</span>
                    <span className="text-text-primary">
                      {formatDate(mockGuardian.stats.clientSince)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Última visita:</span>
                    <span className="text-text-primary">
                      {formatDate(mockGuardian.stats.lastVisit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total gasto:</span>
                    <span className="text-text-primary font-medium">
                      R$ {mockGuardian.stats.totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Card */}
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <h3 className="text-lg font-semibold text-warning flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Atenção
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-warning/80">
                  Este tutor possui {mockGuardian.pets.length} pet
                  {mockGuardian.pets.length !== 1 ? "s" : ""} cadastrado
                  {mockGuardian.pets.length !== 1 ? "s" : ""}.
                </p>

                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full text-warning hover:bg-warning/10"
                    onClick={handleDeactivate}
                    loading={isDeactivating}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Desativar Tutor
                  </Button>

                  <p className="text-xs text-warning/60">
                    Desativar irá manter os dados mas impedir novos
                    agendamentos.
                  </p>
                </div>
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
                  <span className="text-text-secondary">ID do Tutor:</span>
                  <span className="text-text-primary font-medium">
                    #{appointmentId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Cadastrado em:</span>
                  <span className="text-text-primary">
                    {formatDate(mockGuardian.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Última atualização:
                  </span>
                  <span className="text-text-primary">
                    {formatDate(mockGuardian.updated_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Status:</span>
                  <span className="text-success font-medium">Ativo</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
                  Excluir Tutor
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Tem certeza que deseja excluir permanentemente este tutor?
              </p>

              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <h4 className="font-medium text-error mb-2">
                  ⚠️ Consequências da exclusão:
                </h4>
                <ul className="text-sm text-error/80 space-y-1">
                  <li>• Todos os dados do tutor serão perdidos</li>
                  <li>
                    • {mockGuardian.pets.length} pet
                    {mockGuardian.pets.length !== 1 ? "s" : ""} precisará
                    {mockGuardian.pets.length !== 1 ? "ão" : ""} de novo tutor
                  </li>
                  <li>
                    • Histórico de {mockGuardian.stats.totalConsultations}{" "}
                    consulta
                    {mockGuardian.stats.totalConsultations !== 1
                      ? "s"
                      : ""}{" "}
                    será mantido
                  </li>
                  <li>
                    • {mockGuardian.stats.totalAppointments} agendamento
                    {mockGuardian.stats.totalAppointments !== 1 ? "s" : ""} será
                    {mockGuardian.stats.totalAppointments !== 1
                      ? "ão"
                      : ""}{" "}
                    cancelado
                    {mockGuardian.stats.totalAppointments !== 1 ? "s" : ""}
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="ghost"
                className="text-error hover:bg-error/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Permanentemente
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
