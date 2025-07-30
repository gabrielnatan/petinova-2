//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Heart,
  Calendar,
  User,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// Mock data - replace with real data
const mockPets = [
  {
    pet_id: "1",
    name: "Buddy",
    species: "Cão",
    breed: "Golden Retriever",
    size: "Grande",
    weight: 30,
    isNeutered: true,
    environment: "Casa",
    birthDate: new Date("2020-03-15"),
    avatarUrl: null,
    guardian: { fullName: "João Silva", phone: "(11) 99999-9999" },
    guardian_id: "1",
    clinic_id: "1",
    created_at: new Date(),
  },
  {
    pet_id: "2",
    name: "Luna",
    species: "Gato",
    breed: "Siamês",
    size: "Pequeno",
    weight: 4,
    isNeutered: false,
    environment: "Apartamento",
    birthDate: new Date("2021-07-22"),
    avatarUrl: null,
    guardian: { fullName: "Maria Santos", phone: "(11) 88888-8888" },
    guardian_id: "2",
    clinic_id: "1",
    created_at: new Date(),
  },
];

function PetCard({ pet }: { pet: any }) {
  const [showMenu, setShowMenu] = useState(false);

  const getAgeText = (birthDate: Date) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
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
                <p className="text-sm text-text-secondary">{pet.breed}</p>
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
                    href={`/dashboard/pets/${pet.pet_id}`}
                    className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Perfil
                  </Link>
                  <Link
                    href={`/dashboard/pets/${pet.pet_id}/edit`}
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

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Espécie:</span>
              <span className="text-text-primary">{pet.species}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Idade:</span>
              <span className="text-text-primary">
                {getAgeText(pet.birthDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Peso:</span>
              <span className="text-text-primary">{pet.weight}kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Castrado:</span>
              <span
                className={`text-sm ${pet.isNeutered ? "text-success" : "text-warning"}`}
              >
                {pet.isNeutered ? "Sim" : "Não"}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <User className="w-4 h-4" />
              <span>{pet.guardian.fullName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PetsListPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const displayPets = searchTerm
    ? mockPets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.guardian.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : mockPets;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Pets</h1>
          <p className="text-text-secondary">
            Gerencie todos os pets da clínica
          </p>
        </div>
        <Button>
          <Link href="/dashboard/pets/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Pet
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por nome, raça ou tutor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total de Pets</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockPets.length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Cães</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockPets.filter((p) => p.species === "Cão").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                <span className="text-secondary-600 text-xs">🐕</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Gatos</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockPets.filter((p) => p.species === "Gato").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                <span className="text-accent-600 text-xs">🐱</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Consultas Hoje</p>
                <p className="text-2xl font-bold text-text-primary">5</p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPets.map((pet, index) => (
          <motion.div
            key={pet.pet_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PetCard pet={pet} />
          </motion.div>
        ))}
      </div>

      {displayPets.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Nenhum pet encontrado
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm
              ? "Tente ajustar sua busca"
              : "Comece cadastrando o primeiro pet"}
          </p>
          <Button>
            <Link href="/dashboard/pets/new">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Pet
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
