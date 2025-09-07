"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Calendar,
  User,
  DollarSign,
  AlertTriangle,
  Eye,
  Trash2,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/store";

interface Movement {
  movement_id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'LOSS';
  quantity: number;
  reason?: string;
  reference?: string;
  referenceType?: string;
  unitCost?: number;
  totalCost?: number;
  supplier?: string;
  invoiceNumber?: string;
  batchNumber?: string;
  expirationDate?: string;
  userId: string;
  clinicId: string;
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
  };
  user: {
    id: string;
    name: string;
    role: string;
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

const movementTypes = [
  { value: 'IN', label: 'Entrada', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'OUT', label: 'Saída', color: 'text-red-600', bg: 'bg-red-100' },
  { value: 'ADJUSTMENT', label: 'Ajuste', color: 'text-blue-600', bg: 'bg-blue-100' },
  { value: 'TRANSFER', label: 'Transferência', color: 'text-purple-600', bg: 'bg-purple-100' },
  { value: 'RETURN', label: 'Devolução', color: 'text-orange-600', bg: 'bg-orange-100' },
  { value: 'LOSS', label: 'Perda', color: 'text-gray-600', bg: 'bg-gray-100' },
];

const referenceTypes = [
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'SALE', label: 'Venda' },
  { value: 'PRESCRIPTION', label: 'Prescrição' },
  { value: 'TRANSFER', label: 'Transferência' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'RETURN', label: 'Devolução' },
  { value: 'LOSS', label: 'Perda' },
];

export default function InventoryMovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
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
  const [typeFilter, setTypeFilter] = useState("all");
  const [referenceTypeFilter, setReferenceTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadMovements = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(referenceTypeFilter !== "all" && { referenceType: referenceTypeFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await apiClient.get(`/inventory/movements?${params}`);
      setMovements(response.movements);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, referenceTypeFilter, startDate, endDate]);

  useEffect(() => {
    if (user) {
      loadMovements(1);
    }
  }, [user, loadMovements]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadMovements(page);
  };

  const handleDeleteMovement = async (movementId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta movimentação?')) {
      return;
    }

    try {
      await apiClient.delete(`/inventory/movements/${movementId}`);
      setMovements(prev => prev.filter(m => m.movement_id !== movementId));
      
      // Atualizar paginação
      if (pagination.total > 0) {
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      }
    } catch (err) {
      alert('Erro ao deletar movimentação: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find(t => t.value === type) || movementTypes[0];
  };

  const getReferenceTypeInfo = (type: string) => {
    return referenceTypes.find(t => t.value === type);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <ArrowUp className="w-4 h-4" />;
      case 'OUT':
        return <ArrowDown className="w-4 h-4" />;
      case 'ADJUSTMENT':
        return <RefreshCw className="w-4 h-4" />;
      case 'TRANSFER':
        return <ArrowUpDown className="w-4 h-4" />;
      case 'RETURN':
        return <ArrowUp className="w-4 h-4" />;
      case 'LOSS':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const calculateStats = () => {
    const stats = movements.reduce((acc, movement) => {
      if (movement.type === 'IN' || movement.type === 'RETURN') {
        acc.totalIn += movement.quantity;
        acc.totalInValue += movement.totalCost || 0;
      } else if (movement.type === 'OUT' || movement.type === 'LOSS') {
        acc.totalOut += movement.quantity;
        acc.totalOutValue += movement.totalCost || 0;
      }
      return acc;
    }, { totalIn: 0, totalOut: 0, totalInValue: 0, totalOutValue: 0 });

    return {
      ...stats,
      netMovement: stats.totalIn - stats.totalOut,
      netValue: stats.totalInValue - stats.totalOutValue
    };
  };

  const stats = calculateStats();

  if (loading && movements.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando movimentações...</p>
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
            Movimentações de Estoque
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie todas as entradas, saídas e ajustes do estoque
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadMovements(currentPage)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button asChild>
            <a href="/dashboard/inventory/movements/new">
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
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
                <p className="text-sm text-text-secondary">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalIn}</p>
                <p className="text-sm text-text-secondary">
                  {formatCurrency(stats.totalInValue)}
                </p>
              </div>
              <ArrowUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalOut}</p>
                <p className="text-sm text-text-secondary">
                  {formatCurrency(stats.totalOutValue)}
                </p>
              </div>
              <ArrowDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Movimento Líquido</p>
                <p className={`text-2xl font-bold ${stats.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.netMovement >= 0 ? '+' : ''}{stats.netMovement}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatCurrency(stats.netValue)}
                </p>
              </div>
              <ArrowUpDown className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Movimentações</p>
                <p className="text-2xl font-bold text-text-primary">{pagination.total}</p>
                <p className="text-sm text-text-secondary">
                  {pagination.pages} páginas
                </p>
              </div>
              <Package className="w-8 h-8 text-primary-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Buscar</label>
              <Input
                placeholder="Produto, motivo, referência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {movementTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Referência</label>
              <Select value={referenceTypeFilter} onValueChange={setReferenceTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {referenceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-error">{error}</p>
              <Button onClick={() => loadMovements(currentPage)} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.type);
                    const referenceInfo = movement.referenceType ? getReferenceTypeInfo(movement.referenceType) : null;
                    
                    return (
                      <TableRow key={movement.movement_id}>
                        <TableCell>
                          <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                            {getMovementIcon(movement.type)}
                            <span className="text-sm font-medium">{typeInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.item.name}</p>
                            <p className="text-sm text-text-secondary">{movement.item.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${movement.type === 'IN' || movement.type === 'RETURN' ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.type === 'IN' || movement.type === 'RETURN' ? '+' : ''}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="max-w-xs truncate">{movement.reason || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            {movement.reference && (
                              <p className="font-medium">{movement.reference}</p>
                            )}
                            {referenceInfo && (
                              <p className="text-sm text-text-secondary">{referenceInfo.label}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {movement.totalCost ? (
                            <div>
                              <p className="font-medium">{formatCurrency(movement.totalCost)}</p>
                              {movement.unitCost && (
                                <p className="text-sm text-text-secondary">
                                  {formatCurrency(movement.unitCost)}/un
                                </p>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.user.name}</p>
                            <p className="text-sm text-text-secondary">{movement.user.role}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatDate(movement.created_at)}</p>
                            <p className="text-sm text-text-secondary">
                              {new Date(movement.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={`/dashboard/inventory/movements/${movement.movement_id}`}>
                                <Eye className="w-4 h-4" />
                              </a>
                            </Button>
                            {user?.role === 'ADMIN' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMovement(movement.movement_id)}
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
                {pagination.total} movimentações
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
