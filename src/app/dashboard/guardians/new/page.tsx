"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { guardianAPI, type CreateGuardianData } from "@/lib/api/guardians";
import { useRouter } from "next/navigation";
import Link from "next/link";

const guardianSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  cpf: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional()
});

type GuardianFormData = z.infer<typeof guardianSchema>;

export default function NewGuardianPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema)
  });

  const onSubmit = async (data: GuardianFormData) => {
    try {
      setError(null);
      
      const guardianData: CreateGuardianData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf || undefined,
        notes: data.notes || undefined
      };
      
      // Adicionar endereço se pelo menos rua e número foram preenchidos
      if (data.street && data.number) {
        guardianData.address = {
          street: data.street,
          number: data.number,
          complement: data.complement || undefined,
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || ''
        };
      }
      
      await guardianAPI.createGuardian(guardianData);
      router.push('/dashboard/guardians');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tutor');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/guardians" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
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
                placeholder="Ex: João Silva"
                icon={User}
              />

              <Input
                label="CPF (opcional)"
                {...register("cpf")}
                error={errors.cpf?.message}
                placeholder="000.000.000-00"
              />
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
        
        {/* Address Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Endereço (opcional)
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Rua"
                  {...register("street")}
                  error={errors.street?.message}
                  placeholder="Ex: Rua das Flores"
                />
              </div>
              
              <Input
                label="Número"
                {...register("number")}
                error={errors.number?.message}
                placeholder="123"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Complemento"
                {...register("complement")}
                error={errors.complement?.message}
                placeholder="Apto 45, Bloco B"
              />
              
              <Input
                label="Bairro"
                {...register("neighborhood")}
                error={errors.neighborhood?.message}
                placeholder="Centro"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Cidade"
                {...register("city")}
                error={errors.city?.message}
                placeholder="São Paulo"
              />
              
              <Input
                label="Estado"
                {...register("state")}
                error={errors.state?.message}
                placeholder="SP"
              />
              
              <Input
                label="CEP"
                {...register("zipCode")}
                error={errors.zipCode?.message}
                placeholder="01234-567"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Observações (opcional)
            </h2>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Notas adicionais
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                placeholder="Informações adicionais sobre o tutor..."
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
            <Link href="/dashboard/guardians" className="flex items-center justify-center">Cancelar</Link>
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex items-center">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Tutor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
