"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { veterinarianAPI, type Veterinarian } from "@/lib/api/veterinarians";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const veterinarianUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['VETERINARIAN', 'ASSISTANT']),
  active: z.boolean()
});

type VeterinarianUpdateData = z.infer<typeof veterinarianUpdateSchema>;

export default function EditVeterinarianPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [veterinarian, setVeterinarian] = useState<Veterinarian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<VeterinarianUpdateData>({
    resolver: zodResolver(veterinarianUpdateSchema)
  });

  const watchedRole = watch("role");
  const watchedActive = watch("active");

  // Carregar dados do veterinário
  useEffect(() => {
    const loadVeterinarian = async () => {
      try {
        setLoading(true);
        setError(null);
        const resolvedParams = await params;
        const response = await veterinarianAPI.getVeterinarian(resolvedParams.id);
        const vet = response.veterinarian;
        setVeterinarian(vet);
        
        // Preencher formulário com dados existentes
        setValue("name", vet.fullName);
        setValue("email", vet.email);
        setValue("role", vet.role as 'VETERINARIAN' | 'ASSISTANT');
        setValue("active", vet.isActive);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar veterinário');
      } finally {
        setLoading(false);
      }
    };

    loadVeterinarian();
  }, [params, setValue]);

  const onSubmit = async (data: VeterinarianUpdateData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const resolvedParams = await params;
      
      await veterinarianAPI.updateVeterinarian(resolvedParams.id, data);
      router.push('/dashboard/veterinarians');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar veterinário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const resolvedParams = await params;
      
      await veterinarianAPI.deleteVeterinarian(resolvedParams.id);
      router.push('/dashboard/veterinarians');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir veterinário');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando veterinário...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-error mb-4">{error}</div>
          <Button asChild>
            <Link href="/dashboard/veterinarians">Voltar para Veterinários</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!veterinarian) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-error mb-4">Veterinário não encontrado</div>
          <Button asChild>
            <Link href="/dashboard/veterinarians">Voltar para Veterinários</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/veterinarians" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Veterinário
            </h1>
            <p className="text-text-secondary">
              Atualize as informações do veterinário
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="error"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-error mr-2" />
            <p className="text-error">{error}</p>
          </div>
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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("active")}
                  className="mr-2"
                />
                <span className="text-sm text-text-secondary">Ativo</span>
              </label>
              {errors.active && (
                <p className="text-sm text-error mt-1">
                  {errors.active.message}
                </p>
              )}
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
        
        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/veterinarians" className="flex items-center justify-center">
              Cancelar
            </Link>
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-error mr-3" />
              <h3 className="text-lg font-semibold text-text-primary">
                Confirmar Exclusão
              </h3>
            </div>
            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir o veterinário <strong>{veterinarian.fullName}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="error"
                onClick={handleDelete}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
