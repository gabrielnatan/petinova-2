"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Pill,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/store";

interface Prescription {
  prescription_id: string;
  consultationId?: string;
  petId: string;
  prescriptionNumber: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  notes?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  clinicId: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
  };
  veterinarian: {
    id: string;
    name: string;
    role: string;
  };
  consultation?: {
    id: string;
    date: string;
  };
  items: PrescriptionItem[];
  created_at: string;
  updated_at: string;
}

interface PrescriptionItem {
  item_id: string;
  prescriptionId: string;
  itemId: string;
  quantity: number;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  isDispensed: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  clinicId: string;
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
  };
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const prescriptionStatuses = [
  { value: 'ACTIVE', label: 'Ativa', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'COMPLETED', label: 'Concluída', color: 'text-blue-600', bg: 'bg-blue-100' },
  { value: 'CANCELLED', label: 'Cancelada', color: 'text-red-600', bg: 'bg-red-100' },
  { value: 'EXPIRED', label: 'Expirada', color: 'text-gray-600', bg: 'bg-gray-100' },
];

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadPrescriptions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await apiClient.get(`/prescriptions?${params}`);
      setPrescriptions(response.prescriptions);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prescrições');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, startDate, endDate]);

  useEffect(() => {
    if (user) {
      loadPrescriptions(1);
    }
  }, [user, loadPrescriptions]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPrescriptions(page);
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta prescrição?')) {
      return;
    }

    try {
      await apiClient.delete(`/prescriptions/${prescriptionId}`);
      setPrescriptions(prev => prev.filter(p => p.prescription_id !== prescriptionId));
      
      // Atualizar paginação
      if (pagination.total > 0) {
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      }
    } catch (err) {
      alert('Erro ao deletar prescrição: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const getStatusInfo = (status: string) => {
    return prescriptionStatuses.find(s => s.value === status) || prescriptionStatuses[0];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'EXPIRED':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const calculateStats = () => {
    const stats = prescriptions.reduce((acc, prescription) => {
      acc.total++;
      
      switch (prescription.status) {
        case 'ACTIVE':
          acc.active++;
          break;
        case 'COMPLETED':
          acc.completed++;
          break;
        case 'CANCELLED':
          acc.cancelled++;
          break;
        case 'EXPIRED':
          acc.expired++;
          break;
      }

      // Contar itens dispensados
      const dispensedItems = prescription.items.filter(item => item.isDispensed).length;
      const totalItems = prescription.items.length;
      
      acc.totalItems += totalItems;
      acc.dispensedItems += dispensedItems;

      return acc;
    }, { 
      total: 0, 
      active: 0, 
      completed: 0, 
      cancelled: 0, 
      expired: 0,
      totalItems: 0,
      dispensedItems: 0
    });

    return {
      ...stats,
      pendingItems: stats.totalItems - stats.dispensedItems
    };
  };

  const stats = calculateStats();

  if (loading && prescriptions.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando prescrições...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Prescrições
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie todas as prescrições veterinárias
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadPrescriptions(currentPage)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button asChild>
            <a href="/dashboard/prescriptions/new">
              <Plus className="w-4 h-4 mr-2" />
              Nova Prescrição
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Prescrições</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-text-secondary">
                  {stats.totalItems} itens
                </p>
              </div>
              <Pill className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-text-secondary">
                  {stats.pendingItems} itens pendentes
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Concluídas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                <p className="text-sm text-text-secondary">
                  {stats.dispensedItems} itens dispensados
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Canceladas/Expiradas</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled + stats.expired}</p>
                <p className="text-sm text-text-secondary">
                  {stats.cancelled} canceladas, {stats.expired} expiradas
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Buscar</label>
              <Input
                placeholder="Número, pet, veterinário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {prescriptionStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescrições</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-error">{error}</p>
              <Button onClick={() => loadPrescriptions(currentPage)} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">Nenhuma prescrição encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead>Veterinário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription) => {
                    const statusInfo = getStatusInfo(prescription.status);
                    const dispensedItems = prescription.items.filter(item => item.isDispensed).length;
                    const totalItems = prescription.items.length;
                    
                    return (
                      <TableRow key={prescription.prescription_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prescription.prescriptionNumber}</p>
                            {prescription.consultation && (
                              <p className="text-sm text-text-secondary">
                                Consulta: {formatDate(prescription.consultation.date)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prescription.pet.name}</p>
                            <p className="text-sm text-text-secondary">
                              {prescription.pet.species} • {prescription.pet.breed || 'Raça não informada'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prescription.veterinarian.name}</p>
                            <p className="text-sm text-text-secondary">{prescription.veterinarian.role}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                            {getStatusIcon(prescription.status)}
                            <span className="text-sm font-medium">{statusInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{totalItems} itens</p>
                            <p className="text-sm text-text-secondary">
                              {dispensedItems} dispensados
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatDate(prescription.startDate)}</p>
                            {prescription.endDate && (
                              <p className="text-sm text-text-secondary">
                                Até: {formatDate(prescription.endDate)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={`/dashboard/prescriptions/${prescription.prescription_id}`}>
                                <Eye className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={`/dashboard/prescriptions/${prescription.prescription_id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </a>
                            </Button>
                            {user?.role === 'ADMIN' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePrescription(prescription.prescription_id)}
                                className="text-error hover:text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-text-secondary">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} prescrições
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-text-secondary">
                  Página {currentPage} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
