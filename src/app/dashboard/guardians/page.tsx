"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
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
import { guardianAPI, type Guardian } from "@/lib/api/guardians";
import Link from "next/link";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function GuardianCard({ 
  guardian, 
  onDelete, 
  deleting 
}: { 
  guardian: Guardian;
  onDelete: (id: string, name: string) => void;
  deleting: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const formatAddress = (address: Guardian['address']) => {
    if (!address) return 'Endereço não informado';
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - ${address.state}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 relative">
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
                {guardian.cpf && (
                  <p className="text-sm text-text-secondary">
                    CPF: {formatCPF(guardian.cpf)}
                  </p>
                )}
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
                    <Link href={`/dashboard/guardians/${guardian.guardian_id}`} className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Perfil
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href={`/dashboard/guardians/${guardian.guardian_id}/edit`} className="flex items-center">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-error hover:bg-error/10"
                    onClick={() => onDelete(guardian.guardian_id, guardian.fullName)}
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

          <div className="space-y-2">
            <div className="flex items-center text-sm text-text-secondary">
              <Mail className="w-4 h-4 mr-2" />
              {guardian.email}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <Phone className="w-4 h-4 mr-2" />
              {formatPhone(guardian.phone)}
            </div>
            {guardian.address && (
              <div className="flex items-start text-sm text-text-secondary">
                <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                <span className="line-clamp-2">{formatAddress(guardian.address)}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-text-secondary">
              <Heart className="w-4 h-4 mr-2" />
              {guardian.petsCount || 0} pet{(guardian.petsCount || 0) !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Pets Preview */}
          {guardian.pets && guardian.pets.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary mb-2">Pets:</p>
              <div className="flex flex-wrap gap-1">
                {guardian.pets.slice(0, 3).map((pet) => (
                  <div
                    key={pet.pet_id}
                    className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                  >
                    {pet.name} ({pet.species})
                  </div>
                ))}
                {guardian.pets.length > 3 && (
                  <div className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                    +{guardian.pets.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GuardiansListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadGuardians = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const response = await guardianAPI.getGuardians({
        page,
        limit: 10,
        search: search.trim() || undefined
      });
      setGuardians(response.guardians);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tutores');
      setGuardians([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuardians(1);
  }, [loadGuardians]);

  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadGuardians(1, searchTerm);
    }, 500);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm, searchDebounce, loadGuardians]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadGuardians(page, searchTerm);
  };

  const handleDelete = async (guardianId: string, guardianName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o tutor ${guardianName}?`)) {
      return;
    }

    try {
      setDeleting(guardianId);
      await guardianAPI.deleteGuardian(guardianId);
      await loadGuardians(currentPage, searchTerm);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir tutor');
    } finally {
      setDeleting(null);
    }
  };

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
        <Button asChild>
          <Link href="/dashboard/guardians/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Tutor
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="max-w-md">
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          <Button variant="secondary" className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="flex items-center border border-border rounded-md">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="rounded-r-none border-r"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total de Tutores</p>
                <p className="text-2xl font-bold text-text-primary">
                  {pagination.total}
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
                <p className="text-sm text-text-secondary">Com Pets</p>
                <p className="text-2xl font-bold text-text-primary">
                  {guardians.filter(g => (g.petsCount || 0) > 0).length}
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
                <p className="text-sm text-text-secondary">Novos este Mês</p>
                <p className="text-2xl font-bold text-text-primary">
                  {guardians.filter(g => {
                    const createdDate = new Date(g.created_at);
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Plus className="w-8 h-8 text-accent-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {viewMode === "cards" && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-text-secondary">Carregando tutores...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-error mb-4">{error}</div>
              <Button onClick={() => loadGuardians(currentPage, searchTerm)}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guardians.map((guardian, index) => (
                  <motion.div
                    key={guardian.guardian_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GuardianCard 
                      guardian={guardian} 
                      onDelete={handleDelete}
                      deleting={deleting === guardian.guardian_id}
                    />
                  </motion.div>
                ))}
              </div>
              
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-text-secondary">
                    Mostrando {((currentPage - 1) * pagination.limit) + 1} até {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} tutores
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
        </>
      )}

      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-text-secondary">Carregando tutores...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-error mb-4">{error}</div>
                <Button onClick={() => loadGuardians(currentPage, searchTerm)}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Pets</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guardians.map((guardian) => (
                    <TableRow key={guardian.guardian_id}>
                      <TableCell className="font-medium">
                        {guardian.fullName}
                      </TableCell>
                      <TableCell>{guardian.email}</TableCell>
                      <TableCell>{formatPhone(guardian.phone)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-primary-500" />
                          <span>{guardian.petsCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/guardians/${guardian.guardian_id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/guardians/${guardian.guardian_id}/edit`}
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(guardian.guardian_id, guardian.fullName)}
                            disabled={deleting === guardian.guardian_id}
                          >
                            {deleting === guardian.guardian_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-error"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !error && guardians.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm
              ? "Nenhum tutor encontrado"
              : "Nenhum tutor cadastrado"}
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm
              ? "Tente ajustar sua busca"
              : "Comece cadastrando o primeiro tutor"}
          </p>
          <Button asChild>
            <Link href="/dashboard/guardians/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar Tutor
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}