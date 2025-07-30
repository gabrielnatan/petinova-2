//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCPF, formatPhone } from "@/lib/utils";
import Link from "next/link";

// Mock data
const mockGuardians = [
  {
    guardian_id: "1",
    fullName: "João Silva",
    cpf: "12345678901",
    email: "joao@email.com",
    phone: "11999999999",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    birthDate: new Date("1985-03-15"),
    gender: "Male",
    pets: [
      { name: "Buddy", species: "Cão" },
      { name: "Rex", species: "Cão" },
    ],
    created_at: new Date("2024-01-15"),
  },
  {
    guardian_id: "2",
    fullName: "Maria Santos",
    cpf: "98765432109",
    email: "maria@email.com",
    phone: "11888888888",
    address: "Av. Paulista, 456 - Bela Vista, São Paulo - SP",
    birthDate: new Date("1990-07-22"),
    gender: "Female",
    pets: [{ name: "Luna", species: "Gato" }],
    created_at: new Date("2024-02-10"),
  },
  {
    guardian_id: "3",
    fullName: "Pedro Costa",
    cpf: "11122233344",
    email: "pedro@email.com",
    phone: "11777777777",
    address: "Rua Augusta, 789 - Consolação, São Paulo - SP",
    birthDate: new Date("1978-11-08"),
    gender: "Male",
    pets: [
      { name: "Max", species: "Cão" },
      { name: "Mia", species: "Gato" },
      { name: "Bob", species: "Cão" },
    ],
    created_at: new Date("2024-03-05"),
  },
];

function GuardianCard({ guardian }: { guardian: any }) {
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
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {guardian.fullName}
                </h3>
                <p className="text-sm text-text-secondary">
                  CPF: {formatCPF(guardian.cpf)}
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
                    href={`/dashboard/guardians/${guardian.guardian_id}`}
                    className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Perfil
                  </Link>
                  <Link
                    href={`/dashboard/guardians/${guardian.guardian_id}/edit`}
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
            <div className="flex items-center text-sm text-text-secondary">
              <Mail className="w-4 h-4 mr-2" />
              {guardian.email}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <Phone className="w-4 h-4 mr-2" />
              {formatPhone(guardian.phone)}
            </div>
            <div className="flex items-start text-sm text-text-secondary">
              <MapPin className="w-4 h-4 mr-2 mt-0.5" />
              <span className="line-clamp-2">{guardian.address}</span>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Heart className="w-4 h-4" />
                <span>
                  {guardian.pets.length} pet
                  {guardian.pets.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex -space-x-1">
                {guardian.pets.slice(0, 3).map((pet: { name: string | undefined; species: string; }, index: React.Key | null | undefined) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-secondary-100 border-2 border-surface rounded-full flex items-center justify-center"
                    title={pet.name}
                  >
                    <span className="text-xs text-secondary-600">
                      {pet.species === "Cão" ? "🐕" : "🐱"}
                    </span>
                  </div>
                ))}
                {guardian.pets.length > 3 && (
                  <div className="w-6 h-6 bg-neutral-100 border-2 border-surface rounded-full flex items-center justify-center">
                    <span className="text-xs text-neutral-600">
                      +{guardian.pets.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GuardiansListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredGuardians = searchTerm
    ? mockGuardians.filter(
        (guardian) =>
          guardian.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guardian.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guardian.phone.includes(searchTerm),
      )
    : mockGuardians;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tutores</h1>
          <p className="text-text-secondary">
            Gerencie os tutores responsáveis pelos pets
          </p>
        </div>
        <Button>
          <Link href="/dashboard/guardians/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Tutor
          </Link>
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar por nome, email ou telefone..."
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

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "cards" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Tabela
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total de Tutores</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockGuardians.length}
                </p>
              </div>
              <User className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Novos este Mês</p>
                <p className="text-2xl font-bold text-text-primary">3</p>
              </div>
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Com Múltiplos Pets
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockGuardians.filter((g) => g.pets.length > 1).length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-secondary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total de Pets</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockGuardians.reduce((total, g) => total + g.pets.length, 0)}
                </p>
              </div>
              <Heart className="w-8 h-8 text-accent-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuardians.map((guardian, index) => (
            <motion.div
              key={guardian.guardian_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GuardianCard guardian={guardian} />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Pets</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuardians.map((guardian) => (
                <TableRow key={guardian.guardian_id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {guardian.fullName}
                        </div>
                        <div className="text-sm text-text-secondary">
                          CPF: {formatCPF(guardian.cpf)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {guardian.email}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatPhone(guardian.phone)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="text-text-primary font-medium">
                        {guardian.pets.length}
                      </span>
                      <Heart className="w-4 h-4 text-text-tertiary" />
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {guardian.created_at.toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredGuardians.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Nenhum tutor encontrado
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm
              ? "Tente ajustar sua busca"
              : "Comece cadastrando o primeiro tutor"}
          </p>
          <Button>
            <Link href="/dashboard/guardians/new">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Tutor
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
