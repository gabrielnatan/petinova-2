"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  role: z.enum(['VETERINARIAN', 'ASSISTANT']).default('VETERINARIAN'),
  active: z.boolean().default(true)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type VeterinarianFormData = z.infer<typeof veterinarianSchema>;



export default function NewVeterinarianPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
        password: data.password,
        role: data.role,
        active: data.active
      };
      
      await veterinarianAPI.createVeterinarian(veterinarianData);
      router.push('/dashboard/veterinarians');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar veterinário');
    }
  };

  return (
    <div className="p-6  mx-auto">
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

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Função
                </label>
                <select
                  {...register("role")}
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="VETERINARIAN">Veterinário</option>
                  <option value="ASSISTANT">Assistente</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-error mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Informações de Contato
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="exemplo@email.com"
              icon={Mail}
            />
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Informações de Segurança
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                error={errors.password?.message}
                placeholder="Mínimo 8 caracteres"
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmar Senha"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                placeholder="Confirme sua senha"
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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