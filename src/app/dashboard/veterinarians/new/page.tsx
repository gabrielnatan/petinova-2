"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, User, Mail, Phone, Award, Clock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { veterinarianAPI, type CreateVeterinarianData } from "@/lib/api/veterinarians";
import { useRouter } from "next/navigation";
import Link from "next/link";

const veterinarianSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  crmvNumber: z.string().min(1, 'Número do CRMV é obrigatório'),
  crmvState: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
  crmvIssueDate: z.string().min(1, 'Data de emissão é obrigatória'),
  crmvExpirationDate: z.string().min(1, 'Data de expiração é obrigatória'),
  specialty: z.string().optional(),
  yearsOfExperience: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  availabilitySchedule: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
  notes: z.string().optional()
});

type VeterinarianFormData = z.infer<typeof veterinarianSchema>;

const daysOfWeek = [
  'Segunda-feira',
  'Terça-feira', 
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const specialties = [
  'Clínica Geral',
  'Cirurgia',
  'Cardiologia',
  'Dermatologia',
  'Endocrinologia',
  'Neurologia',
  'Oftalmologia',
  'Odontologia',
  'Fisioterapia',
  'Oncologia',
  'Radiologia',
  'Anestesiologia'
];

export default function NewVeterinarianPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VeterinarianFormData>({
    resolver: zodResolver(veterinarianSchema)
  });

  const onSubmit = async (data: VeterinarianFormData) => {
    try {
      setError(null);
      
      const veterinarianData: CreateVeterinarianData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        crmv: {
          number: data.crmvNumber,
          state: data.crmvState.toUpperCase(),
          issueDate: data.crmvIssueDate,
          expirationDate: data.crmvExpirationDate
        },
        specialty: data.specialty || undefined,
        yearsOfExperience: data.yearsOfExperience || undefined,
        availabilitySchedule: selectedDays.length > 0 ? selectedDays : undefined,
        avatarUrl: data.avatarUrl || undefined,
        notes: data.notes || undefined,
        isActive: true
      };
      
      await veterinarianAPI.createVeterinarian(veterinarianData);
      router.push('/dashboard/veterinarians');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar veterinário');
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/veterinarians" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Novo Veterinário</h1>
          <p className="text-text-secondary">
            Cadastre um novo veterinário na equipe
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-md">
          <p className="text-error">{error}</p>
        </div>
      )}
      
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
                {...register("name")}
                error={errors.name?.message}
                placeholder="Ex: Dr. João Silva"
                icon={User}
              />

              <Input
                label="Anos de Experiência"
                type="number"
                {...register("yearsOfExperience")}
                error={errors.yearsOfExperience?.message}
                placeholder="Ex: 5"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Especialidade
              </label>
              <select
                {...register("specialty")}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
              >
                <option value="">Selecione uma especialidade</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              {errors.specialty && (
                <p className="text-sm text-error mt-1">
                  {errors.specialty.message}
                </p>
              )}
            </div>
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
          </CardContent>
        </Card>
        
        {/* CRMV Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Registro CRMV
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número do CRMV"
                {...register("crmvNumber")}
                error={errors.crmvNumber?.message}
                placeholder="Ex: 12345"
              />
              
              <Input
                label="Estado"
                {...register("crmvState")}
                error={errors.crmvState?.message}
                placeholder="Ex: SP"
                maxLength={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data de Emissão"
                type="date"
                {...register("crmvIssueDate")}
                error={errors.crmvIssueDate?.message}
              />
              
              <Input
                label="Data de Expiração"
                type="date"
                {...register("crmvExpirationDate")}
                error={errors.crmvExpirationDate?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Availability Schedule */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Disponibilidade Semanal
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Selecione os dias da semana em que o veterinário estará disponível:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {daysOfWeek.map(day => (
                <label
                  key={day}
                  className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-surface border-border hover:bg-background-secondary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{day}</span>
                </label>
              ))}
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
            <Input
              label="URL do Avatar (opcional)"
              {...register("avatarUrl")}
              error={errors.avatarUrl?.message}
              placeholder="https://exemplo.com/avatar.jpg"
            />
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Observações (opcional)
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                placeholder="Informações adicionais sobre o veterinário..."
              />
              {errors.notes && (
                <p className="text-sm text-error mt-1">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/veterinarians" className="flex items-center justify-center">
              Cancelar
            </Link>
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex items-center">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Veterinário'}
          </Button>
        </div>
      </form>
    </div>
  );
}