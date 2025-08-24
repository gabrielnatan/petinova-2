"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Package,
  FileText,
  Download,
  Eye,
  BarChart3,
  Package2,
  ShoppingCart,
  Pill,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { inventoryAPI, type StockMovement, type MovementStats } from "@/lib/api/inventory";
import { useAuth } from "@/store";


const movementTypes = [
  { value: "all", label: "Todos os tipos" },
  { value: "IN", label: "Entradas", icon: TrendingUp, color: "text-success" },
  { value: "OUT", label: "Saídas", icon: TrendingDown, color: "text-error" },
  { value: "ADJUSTMENT", label: "Ajustes", icon: BarChart3, color: "text-warning" },
];

const movementReasons = [
  "Compra - Fornecedor",
  "Consulta Veterinária",
  "Prescrição Médica",
  "Venda Balcão",
  "Reposição de Estoque",
  "Ajuste de Inventário",
  "Transferência",
  "Devolução",
  "Vencimento",
  "Perda/Avaria",
];

export default function StockMovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<MovementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterReason, setFilterReason] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(null);

  const loadMovements = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType }),
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
      };
      
      const response = await inventoryAPI.getMovements(params);
      setMovements(response.movements);
      setStats(response.stats);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações');
      console.error('Erro ao carregar movimentações:', err);
    } finally {
      setLoading(false);
    }
  }, [user, pagination.page, pagination.limit, searchTerm, filterType, dateRange]);

  // Load movements data
  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const handleDeleteMovement = async () => {
    if (!movementToDelete) return;
    
    try {
      await inventoryAPI.deleteMovement(movementToDelete.movement_id);
      setShowDeleteModal(false);
      setMovementToDelete(null);
      loadMovements(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar movimentação');
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType }),
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
        format: 'xlsx' as const,
      };
      
      const blob = await inventoryAPI.exportMovements(params);
      const filename = `movimentacoes_estoque_${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}.xlsx`;
      inventoryAPI.downloadExportFile(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar movimentações');
    }
  };

  // Statistics from API response
  const totalMovements = movements.length;
  const totalEntries = stats?.summary?.in?.count || 0;
  const totalExits = stats?.summary?.out?.count || 0;
  const totalAdjustments = stats?.summary?.adjustment?.count || 0;

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "IN":
        return TrendingUp;
      case "OUT":
        return TrendingDown;
      case "ADJUSTMENT":
        return BarChart3;
      default:
        return Package;
    }
  };

  const canDeleteMovement = (movement: StockMovement): boolean => {
    const movementDate = new Date(movement.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return movementDate >= dayAgo && user?.role === 'ADMIN';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center text-error">Erro: {error}</div>
        <Button onClick={() => loadMovements()}>Tentar Novamente</Button>
      </div>
    );
  }

  const getReasonIcon = (reason: string) => {
    if (reason.includes("Compra") || reason.includes("Reposição"))
      return ShoppingCart;
    if (reason.includes("Consulta") || reason.includes("Prescrição"))
      return Pill;
    if (reason.includes("Venda")) return Package2;
    if (reason.includes("Ajuste") || reason.includes("Inventário"))
      return BarChart3;
    return FileText;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/inventory" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Estoque
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Movimentações de Estoque
            </h1>
            <p className="text-text-secondary">
              Histórico completo de entradas e saídas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button asChild>
            <Link href="/dashboard/inventory/movements/new" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Total de Movimentações
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {totalMovements}
                </p>
              </div>
              <Package className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Entradas</p>
                <p className="text-2xl font-bold text-success">
                  {totalEntries}
                </p>
              </div>
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Saídas</p>
                <p className="text-2xl font-bold text-error">{totalExits}</p>
              </div>
              <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Ajustes</p>
                <p className="text-2xl font-bold text-warning">
                  {totalAdjustments}
                </p>
              </div>
              <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Buscar movimentações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
              >
                {movementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
              >
                <option value="all">Todas as razões</option>
                {movementReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                type="date"
                value={dateRange.start.toISOString().split("T")[0]}
                onChange={(e) =>
                  setDateRange({
                    ...dateRange,
                    start: new Date(e.target.value),
                  })
                }
                icon={Calendar}
              />
            </div>

            <div>
              <Input
                type="date"
                value={dateRange.end.toISOString().split("T")[0]}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: new Date(e.target.value) })
                }
                icon={Calendar}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">
              Movimentações ({totalMovements})
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filtrar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement, index) => {
                const MovementIcon = getMovementIcon(movement.type);
                const ReasonIcon = getReasonIcon(movement.reason);

                return (
                  <motion.tr
                    key={movement.movement_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-background-secondary"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${inventoryAPI.getMovementTypeColor(movement.type)}`}
                        >
                          <MovementIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-text-primary">
                          {inventoryAPI.getMovementTypeLabel(movement.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {movement.product.name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {movement.product.category}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span
                          className={`font-semibold ${
                            movement.type === "IN"
                              ? "text-success"
                              : movement.type === "OUT"
                                ? "text-error"
                                : "text-warning"
                          }`}
                        >
                          {inventoryAPI.formatMovementQuantity(movement)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ReasonIcon className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {movement.reason}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDate(new Date(movement.created_at))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {movement.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {movement.reference ? (
                        <span className="text-primary-600 font-medium">
                          {movement.reference}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canDeleteMovement(movement) && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-error hover:text-error"
                            onClick={() => {
                              setMovementToDelete(movement);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>

          {movements.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Nenhuma movimentação encontrada
              </h3>
              <p className="text-text-secondary mb-4">
                {searchTerm || filterType !== "all" || filterReason !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Nenhuma movimentação registrada no período selecionado"}
              </p>
              <Button asChild>
                <Link href="/dashboard/inventory/movements/new" className="flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Movimentação
                </Link>
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-text-secondary">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} movimentações
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-text-secondary">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Movements Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Movimentações por Categoria
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Medicamento", "Alimento", "Higiene", "Acessório"].map(
                (category, index) => {
                  const categoryMovements = movements.filter(
                    (m) => m.product.category === category,
                  );
                  const percentage =
                    movements.length > 0
                      ? (categoryMovements.length / movements.length) *
                        100
                      : 0;

                  return (
                    <motion.div
                      key={category}
                      className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full bg-primary-500 opacity-80"
                          style={{
                            backgroundColor: `hsl(${index * 90}, 70%, 50%)`,
                          }}
                        />
                        <span className="font-medium text-text-primary">
                          {category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-text-primary">
                          {categoryMovements.length}
                        </div>
                        <div className="text-sm text-text-tertiary">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Usuários Mais Ativos
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(movements.map((m) => m.user.name)))
                .map((userName) => ({
                  user: userName,
                  count: movements.filter((m) => m.user.name === userName)
                    .length,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 4)
                .map((userStat, index) => (
                  <motion.div
                    key={userStat.user}
                    className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-secondary-600" />
                      </div>
                      <span className="font-medium text-text-primary">
                        {userStat.user}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-text-primary">
                        {userStat.count}
                      </div>
                      <div className="text-sm text-text-tertiary">
                        movimentações
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Movement Modal */}
      {showDeleteModal && movementToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Cancelar Movimentação
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação reverterá o estoque do produto
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-text-secondary mb-2">
                <strong>Produto:</strong> {movementToDelete.product.name}
              </p>
              <p className="text-text-secondary mb-2">
                <strong>Tipo:</strong> {inventoryAPI.getMovementTypeLabel(movementToDelete.type)}
              </p>
              <p className="text-text-secondary">
                <strong>Quantidade:</strong> {inventoryAPI.formatMovementQuantity(movementToDelete)}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="error"
                onClick={handleDeleteMovement}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancelar Movimentação
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
