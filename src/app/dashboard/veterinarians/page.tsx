"use client";

import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { veterinarianAPI, type Veterinarian } from "@/lib/api/veterinarians";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function VeterinarianCard({ 
  veterinarian, 
  onDelete, 
  onToggleStatus, 
  deleting,
  togglingStatus 
}: { 
  veterinarian: Veterinarian;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (id: string, name: string, currentStatus: boolean) => void;
  deleting: boolean;
  togglingStatus: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`hover:shadow-lg transition-shadow duration-200 ${
        !veterinarian.isActive ? 'opacity-60 border-dashed' : ''
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                veterinarian.isActive ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Stethoscope className={`w-6 h-6 ${
                  veterinarian.isActive ? 'text-primary-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {veterinarian.fullName}
                  </h3>
                  {!veterinarian.isActive && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      Inativo
                    </span>
                  )}
                </div>
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
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link
                      href={`/dashboard/veterinarians/${veterinarian.veterinarian_id}`}
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Perfil
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link
                      href={`/dashboard/veterinarians/${veterinarian.veterinarian_id}/edit`}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start ${
                      veterinarian.isActive 
                        ? 'text-warning hover:bg-warning/10' 
                        : 'text-success hover:bg-success/10'
                    }`}
                    onClick={() => onToggleStatus(
                      veterinarian.veterinarian_id, 
                      veterinarian.fullName, 
                      veterinarian.isActive
                    )}
                    disabled={togglingStatus}
                  >
                    {togglingStatus ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : veterinarian.isActive ? (
                      <UserX className="w-4 h-4 mr-2" />
                    ) : (
                      <UserCheck className="w-4 h-4 mr-2" />
                    )}
                    {veterinarian.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                  <hr className="my-1 border-border" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-error hover:bg-error/10"
                    onClick={() => onDelete(veterinarian.veterinarian_id, veterinarian.fullName)}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-error mr-2"></div>
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {deleting ? 'Excluindo...' : 'Excluir'}
                  </Button>
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
              {veterinarian.yearsOfExperience || 0} anos de experiência
            </div>
          </div>

          {/* Specialties */}
          {veterinarian.specialty && (
            <div className="mb-4">
              <p className="text-sm font-medium text-text-primary mb-2">
                Especialidade:
              </p>
              <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                {veterinarian.specialty}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2 bg-background-secondary rounded-md">
              <p className="text-lg font-bold text-text-primary">
                {veterinarian.stats?.todayAppointments || 0}
              </p>
              <p className="text-xs text-text-secondary">Consultas hoje</p>
            </div>
            <div className="text-center p-2 bg-background-secondary rounded-md">
              <p className="text-lg font-bold text-text-primary">
                {veterinarian.stats?.totalConsultations || 0}
              </p>
              <p className="text-xs text-text-secondary">Total consultas</p>
            </div>
          </div>

          {/* Availability */}
          {veterinarian.availabilitySchedule && veterinarian.availabilitySchedule.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium text-text-primary mb-2">
                Disponibilidade:
              </p>
              <div className="flex flex-wrap gap-1">
                {veterinarian.availabilitySchedule.map((day: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-accent-100 text-accent-700 text-xs rounded"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function VeterinariansListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  });
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  // Extract unique specialties for filter
  const allSpecialties = Array.from(
    new Set(veterinarians.map(vet => vet.specialty).filter(Boolean))
  );

  const loadVeterinarians = async (page = 1, search = "", specialty = "all", status = "all") => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        limit: 9,
        search: search.trim() || undefined,
      };
      
      if (specialty !== "all") params.specialty = specialty;
      if (status !== "all") params.isActive = status === "active";
      
      const response = await veterinarianAPI.getVeterinarians(params);
      setVeterinarians(response.veterinarians);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar veterinários');
      setVeterinarians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVeterinarians(1);
  }, []);

  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadVeterinarians(1, searchTerm, specialtyFilter, statusFilter);
    }, 500);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm, specialtyFilter, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadVeterinarians(page, searchTerm, specialtyFilter, statusFilter);
  };

  const handleDelete = async (veterinarianId: string, veterinarianName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o veterinário ${veterinarianName}?`)) {
      return;
    }

    try {
      setDeleting(veterinarianId);
      await veterinarianAPI.deleteVeterinarian(veterinarianId);
      await loadVeterinarians(currentPage, searchTerm, specialtyFilter, statusFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir veterinário');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (veterinarianId: string, veterinarianName: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desativar' : 'ativar';
    if (!window.confirm(`Tem certeza que deseja ${action} o veterinário ${veterinarianName}?`)) {
      return;
    }

    try {
      setTogglingStatus(veterinarianId);
      await veterinarianAPI.toggleVeterinarianStatus(veterinarianId, !currentStatus);
      await loadVeterinarians(currentPage, searchTerm, specialtyFilter, statusFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : `Erro ao ${action} veterinário`);
    } finally {
      setTogglingStatus(null);
    }
  };

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
        <Button asChild>
          <Link href="/dashboard/veterinarians/new" className="flex items-center">
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        <Button variant="secondary" className="flex items-center">
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
                <p className="text-sm text-text-secondary">Total de Veterinários</p>
                <p className="text-2xl font-bold text-text-primary">
                  {pagination.total}
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
                <p className="text-sm text-text-secondary">Ativos</p>
                <p className="text-2xl font-bold text-text-primary">
                  {veterinarians.filter(v => v.isActive).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Consultas Hoje</p>
                <p className="text-2xl font-bold text-text-primary">
                  {veterinarians.reduce((sum, v) => sum + (v.stats?.todayAppointments || 0), 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-secondary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Especialidades</p>
                <p className="text-2xl font-bold text-text-primary">
                  {allSpecialties.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-accent-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Veterinarians Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando veterinários...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-error mb-4">{error}</div>
          <Button onClick={() => loadVeterinarians(currentPage, searchTerm, specialtyFilter, statusFilter)}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {veterinarians.map((veterinarian, index) => (
              <motion.div
                key={veterinarian.veterinarian_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VeterinarianCard 
                  veterinarian={veterinarian} 
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  deleting={deleting === veterinarian.veterinarian_id}
                  togglingStatus={togglingStatus === veterinarian.veterinarian_id}
                />
              </motion.div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-text-secondary">
                Mostrando {((currentPage - 1) * pagination.limit) + 1} até {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} veterinários
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
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
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
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

      {!loading && !error && veterinarians.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm || specialtyFilter !== "all" || statusFilter !== "all"
              ? "Nenhum veterinário encontrado"
              : "Nenhum veterinário cadastrado"}
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || specialtyFilter !== "all" || statusFilter !== "all"
              ? "Tente ajustar sua busca"
              : "Comece cadastrando o primeiro veterinário"}
          </p>
          <Button asChild>
            <Link href="/dashboard/veterinarians/new" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Veterinário
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}