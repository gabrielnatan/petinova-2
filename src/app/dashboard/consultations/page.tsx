"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Heart,
  User,
  Stethoscope,
  CheckCircle,
  Clock,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  AlertCircle,
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
import { formatDate, formatDateTime } from "@/lib/utils";
import { consultationAPI, type Consultation } from "@/lib/api/consultations";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ConsultationCard({ 
  consultation, 
  onDelete 
}: { 
  consultation: Consultation;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {consultation.pet.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {consultation.pet.breed} • {consultation.pet.species}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="flex items-center space-x-1 justify-end mb-1">
                  {consultation.diagnosis ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Clock className="w-4 h-4 text-warning" />
                  )}
                  <span className={`text-xs ${
                    consultation.diagnosis 
                      ? 'text-success' 
                      : 'text-warning'
                  }`}>
                    {consultation.diagnosis ? 'Concluída' : 'Em Andamento'}
                  </span>
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
                    className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[160px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <button
                      onClick={() => router.push(`/dashboard/consultations/${consultation.consultation_id}`)}
                      className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </button>
                    <Link
                      href={`/dashboard/consultations/${consultation.consultation_id}/edit`}
                      className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                    {/* {consultation.prescription && (
                      <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary">
                        <Receipt className="w-4 h-4 mr-2" />
                        Ver Prescrição
                      </button>
                    )} */}
                    <button 
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta consulta?')) {
                          onDelete(consultation.consultation_id);
                        }
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-background-secondary"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-text-secondary">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDateTime(consultation.created_at)}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <User className="w-4 h-4 mr-2" />
              {consultation.guardian.name}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <Stethoscope className="w-4 h-4 mr-2" />
              {consultation.veterinarian.name} - {consultation.veterinarian.role}
            </div>
          </div>

          <div className="bg-background-secondary rounded-md p-3 mb-3">
            <p className="text-sm text-text-primary line-clamp-2">
              <strong>Diagnóstico:</strong> {consultation.diagnosis}
            </p>
            {consultation.treatment && (
              <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                <strong>Tratamento:</strong> {consultation.treatment}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {/* {consultation.vitalSigns.weight && (
                <span className="text-text-secondary">
                  {consultation.vitalSigns.weight}kg
                </span>
              )} */}
              {/* {consultation.symptoms && consultation.symptoms.length > 0 && (
                <span className="text-text-secondary">
                  {consultation.symptoms.length} sintomas
                </span>
              )} */}
            </div>
            <div className="flex items-center space-x-2">
              {/* {consultation.prescription && (
                <span className="text-primary-600 text-xs bg-primary-100 px-2 py-1 rounded">
                  Com prescrição
                </span>
              )} */}
              {/* {consultation.followUpDate && (
                <span className="text-warning text-xs bg-warning/10 px-2 py-1 rounded">
                  Retorno
                </span>
              )} */}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ConsultationsListPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [veterinarianFilter, setVeterinarianFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const router = useRouter();

  const loadConsultations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (veterinarianFilter !== 'all') params.veterinarianId = veterinarianFilter;
      
      const response = await consultationAPI.getConsultations(params);
      
      setConsultations(response.consultations);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, veterinarianFilter]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const handleDelete = async (consultationId: string) => {
    try {
      await consultationAPI.deleteConsultation(consultationId);
      loadConsultations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir consulta');
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'status') setStatusFilter(value);
    if (filter === 'veterinarian') setVeterinarianFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const totalConsultations = pagination.total;
  const completedConsultations = consultations.filter(c => c.diagnosis).length;
  const inProgressConsultations = consultations.filter(c => !c.diagnosis).length;
  const thisMonthConsultations = consultations.filter(
    c => new Date(c.created_at).getMonth() === new Date().getMonth()
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Consultas</h1>
          <p className="text-text-secondary">
            Gerencie o histórico de consultas realizadas
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/consultations/new" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-error">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-error">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-3"
              onClick={loadConsultations}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar por pet, tutor, diagnóstico..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              icon={Search}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="COMPLETED">Concluída</option>
            <option value="IN_PROGRESS">Em Andamento</option>
          </select>

          <select
            value={veterinarianFilter}
            onChange={(e) => handleFilterChange('veterinarian', e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="all">Todos veterinários</option>
            {/* Veterinarians would be loaded from API in a real implementation */}
          </select>
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
                <p className="text-sm text-text-secondary">
                  Total de Consultas
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {totalConsultations}
                </p>
              </div>
              <FileText className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Concluídas</p>
                <p className="text-2xl font-bold text-success">
                  {completedConsultations}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Em Andamento</p>
                <p className="text-2xl font-bold text-warning">
                  {inProgressConsultations}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Este Mês</p>
                <p className="text-2xl font-bold text-text-primary">
                  {thisMonthConsultations}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-secondary-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-background-secondary rounded w-3/4"></div>
                  <div className="h-4 bg-background-secondary rounded w-1/2"></div>
                  <div className="h-20 bg-background-secondary rounded"></div>
                  <div className="h-4 bg-background-secondary rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.map((consultation, index) => (
            <motion.div
              key={consultation.consultation_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ConsultationCard 
                consultation={consultation} 
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow key={consultation.consultation_id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {consultation.pet.name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {consultation.pet.breed}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {consultation.guardian.name}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {consultation.veterinarian.name}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatDate(consultation.created_at)}
                  </TableCell>
                  <TableCell className="text-text-primary">
                    {consultation.diagnosis}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {consultation.diagnosis ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning" />
                      )}
                      <span
                        className={`text-sm ${
                          consultation.diagnosis 
                            ? 'text-success' 
                            : 'text-warning'
                        }`}
                      >
                        {consultation.diagnosis ? 'Concluída' : 'Em Andamento'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => router.push(`/dashboard/consultations/${consultation.consultation_id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} consultas
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-text-secondary">
              Página {pagination.page} de {pagination.pages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {!loading && consultations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Nenhuma consulta encontrada
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || statusFilter !== "all" || veterinarianFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece registrando a primeira consulta"}
          </p>
          <Button asChild>
            <Link href="/dashboard/consultations/new" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}