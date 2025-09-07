"use client";
import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { guardianAPI, type Guardian } from "@/lib/api/guardians";
import { useAuth } from "@/store";
// Schema de validação
const editGuardianSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type EditGuardianFormData = z.infer<typeof editGuardianSchema>;
export default function EditGuardianPage() {
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const guardianId = params?.id as string;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditGuardianFormData>({
    resolver: zodResolver(editGuardianSchema),
  });
  // Verificar autenticação
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);
  // Redirecionar se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router, loading]);
  // Buscar dados do tutor
  useEffect(() => {
    if (!isAuthenticated || !guardianId) return;
    const fetchGuardian = async () => {
      try {
        setLoading(true);
        const response = await guardianAPI.getGuardian(guardianId);
        setGuardian(response.guardian);
        // Preencher o formulário com os dados atuais
        reset({
          name: response.guardian.fullName,
          email: response.guardian.email,
          phone: response.guardian.phone || '',
          address: response.guardian.address || '',
        });
      } catch (error) {
        console.error("Error fetching guardian:", error);
        setError("Erro ao carregar dados do tutor");
      } finally {
        setLoading(false);
      }
    };
    fetchGuardian();
  }, [isAuthenticated, guardianId, reset]);
  const onSubmit = async (data: EditGuardianFormData) => {
    try {
      await guardianAPI.updateGuardian(guardianId, data);
      router.push(`/dashboard/guardians/${guardianId}`);
    } catch (error) {
      console.error("Error updating guardian:", error);
      setError("Erro ao atualizar tutor");
    }
  };
  const handleDelete = async () => {
    try {
      await guardianAPI.deleteGuardian(guardianId);
      router.push("/dashboard/guardians");
    } catch (error) {
      console.error("Error deleting guardian:", error);
      setError("Erro ao excluir tutor");
    }
  };
  const handleDeactivate = async () => {
    // Funcionalidade de desativação não implementada na API
    setError("Funcionalidade de desativação ainda não disponível");
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
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando dados do tutor...</span>
        </div>
      </div>
    );
  }
  if (error || !guardian) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/guardians" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <Card className="border-error">
          <CardContent className="p-6 text-center">
            <p className="text-error">{error || "Tutor não encontrado"}</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/guardians">Voltar para lista</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/guardians/${guardianId}`} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Tutor
            </h1>
            <p className="text-text-secondary">
              {guardian.fullName} • Última atualização:{" "}
              {formatDate(guardian.updated_at)}
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
        {/* Error Display */}
        {error && (
          <Card className="border-error">
            <CardContent className="p-4">
              <p className="text-error text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
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
                <Input
                  label="Nome Completo"
                  {...register("name")}
                  error={errors.name?.message}
                  placeholder="Ex: João Silva"
                  icon={User}
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
                    Pets Associados ({guardian.pets?.length || 0})
                  </h2>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/dashboard/pets/new?guardian=${guardianId}`} className="flex items-center justify-center">Adicionar Pet</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guardian.pets && guardian.pets.length > 0 ? guardian.pets.map((pet) => (
                    <div
                      key={pet.pet_id}
                      className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
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
                    </div>
                  )) : (
                    <p className="text-sm text-text-secondary text-center py-4">
                      Nenhum pet cadastrado
                    </p>
                  )}
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
                  <Link href={`/dashboard/guardians/${guardianId}`} className="flex items-center justify-center">
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
                    {guardian.petsCount || guardian.pets?.length || 0}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Pets Cadastrados
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Cliente desde:</span>
                    <span className="text-text-primary">
                      {formatDate(guardian.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Última atualização:</span>
                    <span className="text-text-primary">
                      {formatDate(guardian.updated_at)}
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
                  Este tutor possui {guardian.pets?.length || 0} pet
                  {(guardian.pets?.length || 0) !== 1 ? "s" : ""} cadastrado
                  {(guardian.pets?.length || 0) !== 1 ? "s" : ""}.
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
                    #{guardianId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Cadastrado em:</span>
                  <span className="text-text-primary">
                    {formatDate(guardian.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Última atualização:
                  </span>
                  <span className="text-text-primary">
                    {formatDate(guardian.updated_at)}
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
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
                    • {guardian.pets?.length || 0} pet
                    {(guardian.pets?.length || 0) !== 1 ? "s" : ""} precisará
                    {(guardian.pets?.length || 0) !== 1 ? "ão" : ""} de novo tutor
                  </li>
                  <li>
                    • Histórico será mantido mas dissociado do tutor
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
          </div>
        </div>
      )}
    </div>
  );
}
