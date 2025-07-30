//@ts-nocheck
"use client";

import React, { useState } from "react";
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

// Mock data
const mockMovements = [
  {
    id: "1",
    type: "IN",
    product: {
      name: "Ração Premium Cães Adultos",
      type: "Alimento",
      unit: "kg",
    },
    quantity: 50,
    reason: "Compra - Fornecedor",
    date: new Date("2025-01-28"),
    user: "Admin Sistema",
    reference: "NF-001234",
    batch: "L2025001",
    unitCost: 45.5,
    created_at: new Date("2025-01-28"),
  },
  {
    id: "2",
    type: "OUT",
    product: {
      name: "Vacina V10 Canina",
      type: "Medicamento",
      unit: "dose",
    },
    quantity: 2,
    reason: "Consulta Veterinária",
    date: new Date("2025-01-27"),
    user: "Dra. Maria Santos",
    reference: "Consulta #123",
    batch: "V2024512",
    unitCost: 28.0,
    created_at: new Date("2025-01-27"),
  },
  {
    id: "3",
    type: "OUT",
    product: {
      name: "Antibiótico Amoxicilina",
      type: "Medicamento",
      unit: "comprimido",
    },
    quantity: 5,
    reason: "Prescrição Médica",
    date: new Date("2025-01-26"),
    user: "Dr. Carlos Lima",
    reference: "Receita #456",
    batch: "A2024890",
    unitCost: 2.5,
    created_at: new Date("2025-01-26"),
  },
  {
    id: "4",
    type: "IN",
    product: {
      name: "Shampoo Antipulgas",
      type: "Higiene",
      unit: "un",
    },
    quantity: 24,
    reason: "Reposição de Estoque",
    date: new Date("2025-01-25"),
    user: "Admin Sistema",
    reference: "NF-001235",
    batch: "S2025002",
    unitCost: 15.9,
    created_at: new Date("2025-01-25"),
  },
  {
    id: "5",
    type: "OUT",
    product: {
      name: "Brinquedo Corda Dental",
      type: "Acessório",
      unit: "un",
    },
    quantity: 3,
    reason: "Venda Balcão",
    date: new Date("2025-01-24"),
    user: "Recepção",
    reference: "Venda #789",
    batch: null,
    unitCost: 8.5,
    created_at: new Date("2025-01-24"),
  },
  {
    id: "6",
    type: "ADJUST",
    product: {
      name: "Ração Premium Gatos",
      type: "Alimento",
      unit: "kg",
    },
    quantity: -2,
    reason: "Ajuste de Inventário",
    date: new Date("2025-01-23"),
    user: "Admin Sistema",
    reference: "INV-2025001",
    batch: "G2024789",
    unitCost: 52.0,
    created_at: new Date("2025-01-23"),
  },
];

const movementTypes = [
  { value: "all", label: "Todos os tipos" },
  { value: "IN", label: "Entradas", icon: TrendingUp, color: "text-success" },
  { value: "OUT", label: "Saídas", icon: TrendingDown, color: "text-error" },
  { value: "ADJUST", label: "Ajustes", icon: BarChart3, color: "text-warning" },
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterReason, setFilterReason] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  // Filtrar movimentações
  const filteredMovements = mockMovements.filter((movement) => {
    const matchesSearch =
      searchTerm === "" ||
      movement.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.reference &&
        movement.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || movement.type === filterType;
    const matchesReason =
      filterReason === "all" || movement.reason === filterReason;

    const matchesDate =
      movement.date >= dateRange.start && movement.date <= dateRange.end;

    return matchesSearch && matchesType && matchesReason && matchesDate;
  });

  // Estatísticas
  const totalMovements = filteredMovements.length;
  const totalEntries = filteredMovements.filter((m) => m.type === "IN").length;
  const totalExits = filteredMovements.filter((m) => m.type === "OUT").length;
  const totalAdjustments = filteredMovements.filter(
    (m) => m.type === "ADJUST",
  ).length;

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "IN":
        return TrendingUp;
      case "OUT":
        return TrendingDown;
      case "ADJUST":
        return BarChart3;
      default:
        return Package;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "IN":
        return "text-success bg-success/10";
      case "OUT":
        return "text-error bg-error/10";
      case "ADJUST":
        return "text-warning bg-warning/10";
      default:
        return "text-text-tertiary bg-background-secondary";
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "IN":
        return "Entrada";
      case "OUT":
        return "Saída";
      case "ADJUST":
        return "Ajuste";
      default:
        return type;
    }
  };

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
          <Button variant="ghost">
            <Link href="/dashboard/inventory">
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
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Link href="/dashboard/inventory/movements/new">
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
              Movimentações ({filteredMovements.length})
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filtrar
              </Button>
              <Button variant="ghost" size="sm">
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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement, index) => {
                const MovementIcon = getMovementIcon(movement.type);
                const ReasonIcon = getReasonIcon(movement.reason);

                return (
                  <motion.tr
                    key={movement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-background-secondary"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${getMovementColor(movement.type)}`}
                        >
                          <MovementIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-text-primary">
                          {getMovementLabel(movement.type)}
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
                            {movement.product.type}
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
                          {movement.type === "IN"
                            ? "+"
                            : movement.type === "OUT"
                              ? "-"
                              : ""}
                          {Math.abs(movement.quantity)}
                        </span>
                        <span className="text-text-secondary text-sm">
                          {movement.product.unit}
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
                      {formatDate(movement.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">
                          {movement.user}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>

          {filteredMovements.length === 0 && (
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
              <Button>
                <Link href="/dashboard/inventory/movements/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Movimentação
                </Link>
              </Button>
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
                  const categoryMovements = filteredMovements.filter(
                    (m) => m.product.type === category,
                  );
                  const percentage =
                    filteredMovements.length > 0
                      ? (categoryMovements.length / filteredMovements.length) *
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
              {Array.from(new Set(filteredMovements.map((m) => m.user)))
                .map((user) => ({
                  user,
                  count: filteredMovements.filter((m) => m.user === user)
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
    </div>
  );
}
