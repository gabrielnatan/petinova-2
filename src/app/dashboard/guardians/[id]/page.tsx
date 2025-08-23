"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCPF, formatPhone, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  created_at: new Date("2024-01-15"),
  pets: [
    {
      pet_id: "1",
      name: "Buddy",
      species: "Cão",
      breed: "Golden Retriever",
      age: "4 anos",
      lastVisit: new Date("2024-12-20"),
    },
    {
      pet_id: "2",
      name: "Rex",
      species: "Cão",
      breed: "Pastor Alemão",
      age: "2 anos",
      lastVisit: new Date("2024-11-15"),
    },
  ],
  recentAppointments: [
    {
      id: "1",
      petName: "Buddy",
      date: new Date("2024-12-20"),
      type: "Consulta de rotina",
      veterinarian: "Dr. Maria Santos",
    },
    {
      id: "2",
      petName: "Rex",
      date: new Date("2024-11-15"),
      type: "Vacinação",
      veterinarian: "Dr. Carlos Lima",
    },
  ],
};

export default function GuardianProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "pets" | "appointments"
  >("overview");
  const params = useParams();
  const appointmentId = params?.id as string;
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
              {mockGuardian.fullName}
            </h1>
            <p className="text-text-secondary">Tutor responsável</p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/dashboard/guardians/${appointmentId}/edit`} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "overview", label: "Visão Geral" },
          { key: "pets", label: `Pets (${mockGuardian.pets.length})` },
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
                    <p className="text-text-primary">{mockGuardian.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      CPF
                    </label>
                    <p className="text-text-primary">
                      {formatCPF(mockGuardian.cpf)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      RG
                    </label>
                    <p className="text-text-primary">{mockGuardian.rg}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Data de Nascimento
                    </label>
                    <p className="text-text-primary">
                      {formatDate(mockGuardian.birthDate)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Endereço
                  </label>
                  <p className="text-text-primary">{mockGuardian.address}</p>
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
                      <p className="text-text-primary">{mockGuardian.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-text-tertiary" />
                    <div>
                      <label className="text-sm font-medium text-text-secondary">
                        Telefone
                      </label>
                      <p className="text-text-primary">
                        {formatPhone(mockGuardian.phone)}
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
                    {mockGuardian.pets.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Cliente desde</span>
                  <span className="text-text-primary">
                    {formatDate(mockGuardian.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Última visita</span>
                  <span className="text-text-primary">
                    {formatDate(mockGuardian.recentAppointments[0]?.date)}
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
                  {mockGuardian.pets.map((pet) => (
                    <div
                      key={pet.pet_id}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {pet.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {pet.breed} • {pet.age}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Pets Tab */}
      {activeTab === "pets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGuardian.pets.map((pet, index) => (
            <motion.div
              key={pet.pet_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                      <span className="text-text-secondary">Idade:</span>
                      <span className="text-text-primary">{pet.age}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        Última visita:
                      </span>
                      <span className="text-text-primary">
                        {formatDate(pet.lastVisit)}
                      </span>
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/dashboard/pets/${pet.pet_id}`} className="flex items-center justify-center">
                      Ver Perfil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add Pet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mockGuardian.pets.length * 0.1 }}
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
                  <Link href="/dashboard/pets/new" className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
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
            <div className="space-y-4">
              {mockGuardian.recentAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  className="flex items-center space-x-4 p-4 bg-background-secondary rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-text-primary">
                        {appointment.petName}
                      </h4>
                      <span className="text-sm text-text-secondary">•</span>
                      <span className="text-sm text-text-secondary">
                        {appointment.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(appointment.date)}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {appointment.veterinarian}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
