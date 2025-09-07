"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Plus,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCPF, formatPhone, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { guardianAPI, type Guardian } from "@/lib/api/guardians";
import { useAuth } from "@/store";
export default function GuardianProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "pets" | "appointments"
  >("overview");
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const guardianId = params?.id as string;
  // Verificar autenticação
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setLoading(false);
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
      } catch (error) {
        console.error("Error fetching guardian:", error);
        setError("Erro ao carregar dados do tutor");
      } finally {
        setLoading(false);
      }
    };
    fetchGuardian();
  }, [isAuthenticated, guardianId]);
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
            <Link href="/dashboard/guardians" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {guardian.fullName}
            </h1>
            <p className="text-text-secondary">Tutor responsável</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/guardians/${guardianId}/edit`} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </Button>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "overview", label: "Visão Geral" },
          { key: "pets", label: `Pets (${guardian.pets?.length || 0})` },
          { key: "appointments", label: "Histórico" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "ghost"}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações Pessoais
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Nome Completo
                    </label>
                    <p className="text-text-primary">{guardian.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Email
                    </label>
                    <p className="text-text-primary">{guardian.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Telefone
                    </label>
                    <p className="text-text-primary">
                      {guardian.phone ? formatPhone(guardian.phone) : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Data de Cadastro
                    </label>
                    <p className="text-text-primary">
                      {formatDate(guardian.created_at)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Endereço
                  </label>
                  <p className="text-text-primary">{guardian.address || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contato
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-text-tertiary" />
                    <div>
                      <label className="text-sm font-medium text-text-secondary">
                        Email
                      </label>
                      <p className="text-text-primary">{guardian.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-text-tertiary" />
                    <div>
                      <label className="text-sm font-medium text-text-secondary">
                        Telefone
                      </label>
                      <p className="text-text-primary">
                        {guardian.phone ? formatPhone(guardian.phone) : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Resumo
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Total de Pets</span>
                  <span className="text-2xl font-bold text-primary-500">
                    {guardian.petsCount || guardian.pets?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Cliente desde</span>
                  <span className="text-text-primary">
                    {formatDate(guardian.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Última atualização</span>
                  <span className="text-text-primary">
                    {formatDate(guardian.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Pets
                  </h3>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/pets/new" className="flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guardian.pets && guardian.pets.length > 0 ? guardian.pets.map((pet) => (
                    <Link key={pet.pet_id} href={`/dashboard/pets/${pet.pet_id}`}>
                      <div className="flex items-center space-x-3 hover:bg-background-secondary p-2 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">
                            {pet.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {pet.breed} • {pet.species}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-sm text-text-secondary text-center py-4">
                      Nenhum pet cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Pets Tab */}
      {activeTab === "pets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guardian.pets && guardian.pets.length > 0 ? guardian.pets.map((pet, index) => (
            <div
              key={pet.pet_id}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                          {pet.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {pet.breed}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Espécie:</span>
                      <span className="text-text-primary">{pet.species}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">ID:</span>
                      <span className="text-text-primary">#{pet.pet_id}</span>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/dashboard/pets/${pet.pet_id}`} className="flex items-center justify-center">
                      Ver Perfil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )) : (
            <div className="col-span-full text-center py-8">
              <Heart className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Nenhum pet cadastrado
              </h3>
              <p className="text-text-secondary mb-4">
                Este tutor ainda não possui pets cadastrados.
              </p>
              <Button asChild>
                <Link href={`/dashboard/pets/new?guardian=${guardianId}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Pet
                </Link>
              </Button>
            </div>
          )}
          {/* Add Pet Card */}
          {guardian.pets && guardian.pets.length > 0 && (
            <div
            >
            <Card className="border-dashed hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Adicionar Pet
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Cadastre um novo pet para este tutor
                </p>
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/pets/new?guardian=${guardianId}`} className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      )}
      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Histórico de Consultas
            </h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h4 className="text-lg font-medium text-text-primary mb-2">
                Histórico em desenvolvimento
              </h4>
              <p className="text-text-secondary mb-4">
                O histórico de consultas estará disponível em breve.
              </p>
              <Button asChild>
                <Link href="/dashboard/appointments/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Nova Consulta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
