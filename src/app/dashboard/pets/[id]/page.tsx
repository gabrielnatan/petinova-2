"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  Calendar,
  User,
  Phone,
  Mail,
  Scale,
  Ruler,
  Home,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface Pet {
  pet_id: string;
  name: string;
  species: string;
  breed: string;
  size: string;
  weight: number;
  isNeutered: boolean;
  environment: string;
  birthDate: string;
  deathDate: string | null;
  notes: string;
  avatarUrl: string | null;
  guardian: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  consultations: Array<{
    id: string;
    date: string;
    diagnosis: string;
    treatment: string;
    notes: string;
    veterinarian: {
      id: string;
      name: string;
    };
  }>;
  appointments: Array<{
    id: string;
    date: string;
    status: string;
    notes: string;
    veterinarian: {
      id: string;
      name: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function PetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/pets/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Pet não encontrado");
          }
          throw new Error("Erro ao carregar pet");
        }

        const data = await response.json();
        setPet(data.pet);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [resolvedParams.id]);

  const getAgeText = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} ano${years > 1 ? "s" : ""}`;
    } else {
      return `${months} mes${months > 1 ? "es" : ""}`;
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/pets/${resolvedParams.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push("/dashboard/pets");
      } else {
        alert("Erro ao excluir pet");
      }
    } catch (error) {
      console.error("Erro ao excluir pet:", error);
      alert("Erro ao excluir pet");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-error" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {error || "Pet não encontrado"}
          </h3>
          <Button asChild>
            <Link href="/dashboard/pets" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Pets
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/pets" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{pet.name}</h1>
            <p className="text-text-secondary">
              {pet.breed} • {pet.species} • {pet.birthDate ? getAgeText(pet.birthDate) : "Idade não informada"}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/pets/${pet.pet_id}/edit`} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary">
                Informações Básicas
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Espécie</p>
                    <p className="font-medium text-text-primary">{pet.species}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Ruler className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Porte</p>
                    <p className="font-medium text-text-primary">
                      {pet.size || "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Scale className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Peso</p>
                    <p className="font-medium text-text-primary">
                      {pet.weight ? `${pet.weight}kg` : "Não informado"}
                    </p>
                  </div>
                </div>

                {pet.birthDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">Idade</p>
                      <p className="font-medium text-text-primary">
                        {getAgeText(pet.birthDate)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Ambiente</p>
                    <p className="font-medium text-text-primary">
                      {pet.environment || "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Castrado</p>
                    <p
                      className={`font-medium ${
                        pet.isNeutered ? "text-success" : "text-warning"
                      }`}
                    >
                      {pet.isNeutered ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>
              </div>

              {pet.notes && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-text-secondary mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary mb-2">Observações</p>
                      <p className="text-text-primary">{pet.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary">
                Histórico Médico
              </h2>
            </CardHeader>
            <CardContent>
              {pet.consultations && pet.consultations.length > 0 ? (
                <div className="space-y-4">
                  {pet.consultations.slice(0, 3).map((consultation) => (
                    <div key={consultation.id} className="border-l-4 border-primary-200 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-text-primary">
                          {consultation.diagnosis || "Consulta"}
                        </p>
                        <span className="text-sm text-text-secondary">
                          {new Date(consultation.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-1">
                        Dr. {consultation.veterinarian.name}
                      </p>
                      {consultation.treatment && (
                        <p className="text-sm text-text-primary">
                          {consultation.treatment}
                        </p>
                      )}
                    </div>
                  ))}
                  {pet.consultations.length > 3 && (
                    <p className="text-sm text-text-secondary text-center pt-2">
                      +{pet.consultations.length - 3} consultas anteriores
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-4">
                  Nenhuma consulta registrada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guardian Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary">
                Tutor Responsável
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="font-medium text-text-primary">
                      {pet.guardian.name}
                    </p>
                  </div>
                </div>

                {pet.guardian.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-primary">
                        {pet.guardian.email}
                      </p>
                    </div>
                  </div>
                )}

                {pet.guardian.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-primary">
                        {pet.guardian.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary">
                Ações Rápidas
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="secondary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Consulta
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  Nova Consulta
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  <Heart className="w-4 h-4 mr-2" />
                  Ver Histórico Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary">
                Próximos Agendamentos
              </h2>
            </CardHeader>
            <CardContent>
              {pet.appointments && pet.appointments.length > 0 ? (
                <div className="space-y-3">
                  {pet.appointments
                    .filter(apt => new Date(apt.date) >= new Date())
                    .slice(0, 3)
                    .map((appointment) => (
                    <div key={appointment.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Dr. {appointment.veterinarian.name}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'CONFIRMED' 
                          ? 'bg-success/20 text-success'
                          : 'bg-warning/20 text-warning'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-4 text-sm">
                  Nenhum agendamento próximo
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}