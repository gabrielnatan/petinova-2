//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Stethoscope,
  Mail,
  Phone,
  Calendar,
  Award,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// Mock data
const mockVeterinarians = [
  {
    veterinarian_id: "1",
    fullName: "Dra. Maria Santos",
    crmv: {
      number: "12345",
      state: "SP",
      issueDate: new Date("2018-01-15"),
      expirationDate: new Date("2025-12-31"),
    },
    email: "maria.santos@clinica.com",
    phoneNumber: "(11) 99999-1111",
    avatarUrl: null,
    yearsOfExperience: 8,
    specialties: ["Clínica Geral", "Cirurgia", "Cardiologia"],
    availabilitySchedule: ["Segunda", "Terça", "Quarta", "Quinta"],
    stats: {
      totalConsultations: 1245,
      thisMonth: 89,
      avgRating: 4.8,
      nextAppointment: new Date(2025, 0, 28, 9, 0),
    },
    created_at: new Date("2023-03-15"),
  },
  {
    veterinarian_id: "2",
    fullName: "Dr. Carlos Lima",
    crmv: {
      number: "67890",
      state: "SP",
      issueDate: new Date("2015-06-20"),
      expirationDate: new Date("2025-12-31"),
    },
    email: "carlos.lima@clinica.com",
    phoneNumber: "(11) 88888-2222",
    avatarUrl: null,
    yearsOfExperience: 12,
    specialties: ["Dermatologia", "Endocrinologia", "Neurologia"],
    availabilitySchedule: ["Terça", "Quarta", "Quinta", "Sexta"],
    stats: {
      totalConsultations: 2103,
      thisMonth: 67,
      avgRating: 4.9,
      nextAppointment: new Date(2025, 0, 28, 14, 30),
    },
    created_at: new Date("2022-08-10"),
  },
  {
    veterinarian_id: "3",
    fullName: "Dra. Ana Oliveira",
    crmv: {
      number: "11223",
      state: "SP",
      issueDate: new Date("2020-09-10"),
      expirationDate: new Date("2025-12-31"),
    },
    email: "ana.oliveira@clinica.com",
    phoneNumber: "(11) 77777-3333",
    avatarUrl: null,
    yearsOfExperience: 5,
    specialties: ["Oftalmologia", "Odontologia", "Fisioterapia"],
    availabilitySchedule: ["Segunda", "Quarta", "Sexta", "Sábado"],
    stats: {
      totalConsultations: 876,
      thisMonth: 52,
      avgRating: 4.7,
      nextAppointment: new Date(2025, 0, 29, 10, 0),
    },
    created_at: new Date("2023-11-05"),
  },
];

function VeterinarianCard({ veterinarian }: { veterinarian: any }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {veterinarian.fullName}
                </h3>
                <p className="text-sm text-text-secondary">
                  CRMV {veterinarian.crmv.number}/{veterinarian.crmv.state}
                </p>
              </div>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showMenu && (
                <motion.div
                  className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[150px]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Link
                    href={`/dashboard/veterinarians/${veterinarian.veterinarian_id}`}
                    className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Perfil
                  </Link>
                  <Link
                    href={`/dashboard/veterinarians/${veterinarian.veterinarian_id}/edit`}
                    className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                  <button className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-background-secondary">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-text-secondary">
              <Mail className="w-4 h-4 mr-2" />
              {veterinarian.email}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <Phone className="w-4 h-4 mr-2" />
              {veterinarian.phoneNumber}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <Award className="w-4 h-4 mr-2" />
              {veterinarian.yearsOfExperience} anos de experiência
            </div>
          </div>

          {/* Specialties */}
          <div className="mb-4">
            <p className="text-sm font-medium text-text-primary mb-2">
              Especialidades:
            </p>
            <div className="flex flex-wrap gap-1">
              {veterinarian.specialties.map(
                (specialty: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                  >
                    {specialty}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2 bg-background-secondary rounded-md">
              <p className="text-lg font-bold text-text-primary">
                {veterinarian.stats.thisMonth}
              </p>
              <p className="text-xs text-text-secondary">Consultas este mês</p>
            </div>
            <div className="text-center p-2 bg-background-secondary rounded-md">
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-4 h-4 text-warning fill-current" />
                <p className="text-lg font-bold text-text-primary">
                  {veterinarian.stats.avgRating}
                </p>
              </div>
              <p className="text-xs text-text-secondary">Avaliação média</p>
            </div>
          </div>

          {/* Availability */}
          <div className="border-t border-border pt-3">
            <p className="text-sm font-medium text-text-primary mb-2">
              Disponibilidade:
            </p>
            <div className="flex flex-wrap gap-1">
              {veterinarian.availabilitySchedule.map(
                (day: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-accent-100 text-accent-700 text-xs rounded"
                  >
                    {day}
                  </span>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function VeterinariansListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const allSpecialties = Array.from(
    new Set(mockVeterinarians.flatMap((vet) => vet.specialties)),
  );

  const filteredVeterinarians = mockVeterinarians.filter((vet) => {
    const matchesSearch =
      searchTerm === "" ||
      vet.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialties.some((spec) =>
        spec.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesSpecialty =
      specialtyFilter === "all" || vet.specialties.includes(specialtyFilter);

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Veterinários</h1>
          <p className="text-text-secondary">
            Gerencie a equipe de veterinários da clínica
          </p>
        </div>
        <Button>
          <Link href="/dashboard/veterinarians/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Veterinário
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por nome, email ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
        >
          <option value="all">Todas as especialidades</option>
          {allSpecialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>

        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Mais Filtros
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Total de Veterinários
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockVeterinarians.length}
                </p>
              </div>
              <Stethoscope className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Consultas Hoje</p>
                <p className="text-2xl font-bold text-text-primary">15</p>
              </div>
              <Calendar className="w-8 h-8 text-secondary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Disponíveis Agora</p>
                <p className="text-2xl font-bold text-text-primary">2</p>
              </div>
              <Clock className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Avaliação Média</p>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-warning fill-current" />
                  <p className="text-2xl font-bold text-text-primary">4.8</p>
                </div>
              </div>
              <Award className="w-8 h-8 text-accent-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Veterinarians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVeterinarians.map((veterinarian, index) => (
          <motion.div
            key={veterinarian.veterinarian_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <VeterinarianCard veterinarian={veterinarian} />
          </motion.div>
        ))}
      </div>

      {filteredVeterinarians.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Nenhum veterinário encontrado
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || specialtyFilter !== "all"
              ? "Tente ajustar sua busca"
              : "Comece cadastrando o primeiro veterinário"}
          </p>
          <Button>
            <Link href="/dashboard/veterinarians/new">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Veterinário
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
