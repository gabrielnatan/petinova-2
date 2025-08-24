"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { petAPI, type Pet } from "@/lib/api/pets";

function PetCard({ pet, onDelete }: { pet: Pet; onDelete: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getAgeText = (birthDate?: string) => {
    if (!birthDate) return 'Idade não informada';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) {
      return 'Data inválida';
    }
    
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
    if (!confirm("Tem certeza que deseja excluir este pet?")) return;
    
    setIsDeleting(true);
    try {
      await petAPI.deletePet(pet.pet_id);
      onDelete(pet.pet_id);
      setShowMenu(false);
    } catch (error) {
      console.error("Erro ao excluir pet:", error);
      alert(error instanceof Error ? error.message : "Erro ao excluir pet");
    } finally {
      setIsDeleting(false);
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
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-background-secondary disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {isDeleting ? "Excluindo..." : "Excluir"}
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
              <span className="text-text-primary">{pet.weight ? `${pet.weight}kg` : 'Não informado'}</span>
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
              <span>{pet.guardian?.fullName || 'Tutor não informado'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PetsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  const loadPets = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const response = await petAPI.getPets({
        page,
        limit: 12,
        search: search.trim() || undefined
      });
      setPets(response.pets);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pets');
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPets(1);
  }, [loadPets]);

  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadPets(1, searchTerm);
    }, 500);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm, loadPets]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPets(page, searchTerm);
  };

  const handleDeletePet = (petId: string) => {
    setPets(prev => prev.filter(pet => pet.pet_id !== petId));
    // Atualizar stats
    if (pagination.total > 0) {
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    }
  };

  // Calculate stats from current pets
  const stats = {
    total: pagination.total,
    dogs: pets.filter(pet => pet.species.toLowerCase().includes('cão') || pet.species.toLowerCase().includes('dog')).length,
    cats: pets.filter(pet => pet.species.toLowerCase().includes('gato') || pet.species.toLowerCase().includes('cat')).length,
    consultationsToday: 5 // Mock data - would come from a separate API
  };

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
        <Button asChild>
          <Link href="/dashboard/pets/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
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
                  {loading ? "--" : stats.total}
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
                  {loading ? "--" : stats.dogs}
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
                  {loading ? "--" : stats.cats}
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
                <p className="text-2xl font-bold text-text-primary">{stats.consultationsToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-error" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Erro ao carregar pets
          </h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={() => loadPets(currentPage, searchTerm)}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-16" />
                      <div className="h-3 bg-gray-200 rounded w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pets Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, index) => (
              <motion.div
                key={pet.pet_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PetCard pet={pet} onDelete={handleDeletePet} />
              </motion.div>
            ))}
          </div>
          
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-text-secondary">
                Mostrando {((currentPage - 1) * pagination.limit) + 1} até {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} pets
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  if (page > pagination.pages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages || loading}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && pets.length === 0 && (
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
          <Button asChild>
            <Link href="/dashboard/pets/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar Pet
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
