"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Stethoscope,
  User,
  Heart,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { consultationAPI } from "@/lib/api/consultations";
import { useAuth } from "@/store";
// Schema de validação
const editConsultationSchema = z.object({
  diagnosis: z.string().min(1, "Diagnóstico é obrigatório"),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});
type EditConsultationFormData = z.infer<typeof editConsultationSchema>;
// Removido dados mock - agora usa API

export default function EditConsultationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const params = useParams();
  const consultationId = params?.id as string;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditConsultationFormData>({
    resolver: zodResolver(editConsultationSchema),
  });

  // Carregar dados da consulta
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadConsultation = async () => {
      try {
        setLoading(true);
        const response = await consultationAPI.getConsultation(consultationId);
        setConsultation(response.consultation);
      } catch (error) {
        console.error('Error loading consultation:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar consulta');
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [consultationId, isAuthenticated]);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);
  const onSubmit = async (data: EditConsultationFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await consultationAPI.updateConsultation(consultationId, data);
      router.push(`/dashboard/consultations/${consultationId}`);
    } catch (error) {
      console.error("Error updating consultation:", error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar consulta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await consultationAPI.deleteConsultation(consultationId);
      router.push('/dashboard/consultations');
    } catch (error) {
      console.error("Error deleting consultation:", error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir consulta');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Carregando consulta...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="border-error">
          <CardContent className="p-4">
            <p className="text-error text-sm">{error}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!consultation) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Consulta não encontrada
              </h2>
              <p className="text-text-secondary mb-4">
                A consulta que você está procurando não existe ou foi removida.
              </p>
              <Button asChild>
                <Link href="/dashboard/consultations">
                  Voltar para Consultas
                </Link>
              </Button>
            </div>
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
            <Link href={`/dashboard/consultations/${consultationId}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Consulta #{consultationId}
            </h1>
            <p className="text-text-secondary">
              Última atualização: {formatDateTime(consultation.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <div className="space-y-6">
            {/* Pet and Guardian Info (Read-only) */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Informações do Paciente
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {consultation.pet.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {consultation.pet.breed} •{" "}
                          {consultation.pet.species}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>Espécie:</strong> {consultation.pet.species}
                      </p>
                      <p>
                        <strong>Raça:</strong> {consultation.pet.breed || 'Não informada'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {consultation.guardian.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Tutor responsável
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <p>
                        <strong>Email:</strong>{" "}
                        {consultation.guardian.email}
                      </p>
                      <p>
                        <strong>Telefone:</strong>{" "}
                        {consultation.guardian.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Consultation Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Detalhes da Consulta
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Diagnóstico
                  </label>
                  <textarea
                    {...register("diagnosis")}
                    rows={4}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                    placeholder="Descreva o diagnóstico da consulta..."
                    defaultValue={consultation.diagnosis || ''}
                  />
                  {errors.diagnosis && (
                    <p className="text-sm text-error mt-1">
                      {errors.diagnosis.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tratamento
                  </label>
                  <textarea
                    {...register("treatment")}
                    rows={4}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                    placeholder="Descreva o tratamento prescrito..."
                    defaultValue={consultation.treatment || ''}
                  />
                  {errors.treatment && (
                    <p className="text-sm text-error mt-1">
                      {errors.treatment.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Observações
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                    placeholder="Observações adicionais..."
                    defaultValue={consultation.notes || ''}
                  />
                  {errors.notes && (
                    <p className="text-sm text-error mt-1">
                      {errors.notes.message}
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
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/dashboard/consultations/${consultationId}`} className="flex items-center justify-center">
                    Cancelar Edição
                  </Link>
                </Button>
                <hr className="border-border" />
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
                  <span className="text-text-secondary">ID:</span>
                  <span className="text-text-primary font-medium">
                    #{consultationId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Veterinário:</span>
                  <span className="text-text-primary">
                    {consultation.veterinarian.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Criada em:</span>
                  <span className="text-text-primary">
                    {formatDateTime(consultation.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            variant="secondary"
            onClick={() => router.push(`/dashboard/consultations/${consultationId}`)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
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
                  Excluir Consulta
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir permanentemente esta consulta?
              Todas as informações associadas, incluindo receituário, serão
              perdidas.
            </p>
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
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
