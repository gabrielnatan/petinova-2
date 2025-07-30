//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  Package2,
  DollarSign,
  ExternalLink,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

// Mock data
const mockProducts = [
  {
    product_id: "1",
    name: "Ração Premium Cães Adultos",
    type: "Alimento",
    unit: "kg",
    quantity: 45,
    minStock: 20,
    costPrice: 45.5,
    salePrice: 89.9,
    validity: new Date("2025-08-15"),
    supplier: "PetFood Distribuidora",
    lastMovement: new Date("2025-01-25"),
    movementType: "IN",
    created_at: new Date("2024-03-10"),
  },
  {
    product_id: "2",
    name: "Vacina V10 Canina",
    type: "Medicamento",
    unit: "dose",
    quantity: 8,
    minStock: 15,
    costPrice: 28.0,
    salePrice: 65.0,
    validity: new Date("2025-06-20"),
    supplier: "VetMed Laboratório",
    lastMovement: new Date("2025-01-27"),
    movementType: "OUT",
    created_at: new Date("2024-02-15"),
  },
  {
    product_id: "3",
    name: "Shampoo Antipulgas",
    type: "Higiene",
    unit: "un",
    quantity: 32,
    minStock: 10,
    costPrice: 15.9,
    salePrice: 34.9,
    validity: new Date("2026-12-10"),
    supplier: "Clean Pet Produtos",
    lastMovement: new Date("2025-01-20"),
    movementType: "IN",
    created_at: new Date("2024-01-20"),
  },
  {
    product_id: "4",
    name: "Antibiótico Amoxicilina",
    type: "Medicamento",
    unit: "comprimido",
    quantity: 3,
    minStock: 20,
    costPrice: 2.5,
    salePrice: 8.9,
    validity: new Date("2025-04-30"),
    supplier: "FarmVet Nacional",
    lastMovement: new Date("2025-01-28"),
    movementType: "OUT",
    created_at: new Date("2024-05-08"),
  },
  {
    product_id: "5",
    name: "Brinquedo Corda Dental",
    type: "Acessório",
    unit: "un",
    quantity: 18,
    minStock: 5,
    costPrice: 8.5,
    salePrice: 24.9,
    validity: null,
    supplier: "Pet Toys Brasil",
    lastMovement: new Date("2025-01-26"),
    movementType: "IN",
    created_at: new Date("2024-06-12"),
  },
];

// Stock movements mock data
const mockStockMovements = [
  {
    id: "1",
    product: "Ração Premium Cães Adultos",
    type: "IN",
    quantity: 50,
    reason: "Compra - Fornecedor",
    date: new Date("2025-01-25"),
    user: "Admin",
  },
  {
    id: "2",
    product: "Vacina V10 Canina",
    type: "OUT",
    quantity: 2,
    reason: "Consulta - Pet: Buddy",
    date: new Date("2025-01-27"),
    user: "Dra. Maria Santos",
  },
  {
    id: "3",
    product: "Antibiótico Amoxicilina",
    type: "OUT",
    quantity: 5,
    reason: "Prescrição médica",
    date: new Date("2025-01-28"),
    user: "Dr. Carlos Lima",
  },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [activeTab, setActiveTab] = useState<"products" | "movements">(
    "products",
  );

  // Filtrar produtos
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || product.type === filterType;

    let matchesStatus = true;
    if (filterStatus === "low_stock") {
      matchesStatus = product.quantity <= product.minStock;
    } else if (filterStatus === "expired") {
      matchesStatus = product.validity ? product.validity < new Date() : false;
    } else if (filterStatus === "expiring") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      matchesStatus = product.validity
        ? product.validity <= thirtyDaysFromNow &&
          product.validity >= new Date()
        : false;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  // Estatísticas
  const totalProducts = mockProducts.length;
  const lowStockProducts = mockProducts.filter(
    (p) => p.quantity <= p.minStock,
  ).length;
  const expiringProducts = mockProducts.filter((p) => {
    if (!p.validity) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return p.validity <= thirtyDaysFromNow && p.validity >= new Date();
  }).length;
  const totalValue = mockProducts.reduce(
    (sum, p) => sum + p.quantity * p.costPrice,
    0,
  );

  const getStockStatus = (product: any) => {
    if (product.quantity <= product.minStock) {
      return {
        status: "low",
        color: "text-error",
        bg: "bg-error/10",
        label: "Estoque Baixo",
      };
    }
    if (product.quantity <= product.minStock * 1.5) {
      return {
        status: "medium",
        color: "text-warning",
        bg: "bg-warning/10",
        label: "Estoque Médio",
      };
    }
    return {
      status: "good",
      color: "text-success",
      bg: "bg-success/10",
      label: "Estoque OK",
    };
  };

  const getValidityStatus = (validity: Date | null) => {
    if (!validity) return null;

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (validity < now) {
      return { status: "expired", color: "text-error", label: "Vencido" };
    }
    if (validity <= thirtyDaysFromNow) {
      return {
        status: "expiring",
        color: "text-warning",
        label: "Vence em breve",
      };
    }
    return { status: "valid", color: "text-success", label: "Válido" };
  };

  const ProductCard = ({ product }: { product: any }) => {
    const stockStatus = getStockStatus(product);
    const validityStatus = getValidityStatus(product.validity);
    const [showMenu, setShowMenu] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {product.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {product.type} • {product.supplier}
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
                      href={`/dashboard/inventory/${product.product_id}`}
                      className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Link>
                    <Link
                      href={`/dashboard/inventory/${product.product_id}/edit`}
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Estoque:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-text-primary">
                    {product.quantity} {product.unit}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}
                  >
                    {stockStatus.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Preço venda:
                </span>
                <span className="font-medium text-text-primary">
                  {formatCurrency(product.salePrice)}
                </span>
              </div>

              {validityStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Validade:</span>
                  <span className={`text-sm ${validityStatus.color}`}>
                    {validityStatus.label}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>Custo: {formatCurrency(product.costPrice)}</span>
                <span>
                  Margem:{" "}
                  {Math.round(
                    ((product.salePrice - product.costPrice) /
                      product.costPrice) *
                      100,
                  )}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Estoque</h1>
          <p className="text-text-secondary">
            Gerencie produtos, medicamentos e suprimentos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary">
            <Link href="/dashboard/inventory/movements/new">
              <TrendingUp className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Link>
          </Button>
          <Button>
            <Link href="/dashboard/inventory/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
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
                <p className="text-sm text-text-secondary">Total de Produtos</p>
                <p className="text-2xl font-bold text-text-primary">
                  {totalProducts}
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
                <p className="text-sm text-text-secondary">Estoque Baixo</p>
                <p className="text-2xl font-bold text-error">
                  {lowStockProducts}
                </p>
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
                <p className="text-sm text-text-secondary">
                  Vencendo em 30 dias
                </p>
                <p className="text-2xl font-bold text-warning">
                  {expiringProducts}
                </p>
              </div>
              <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Valor Total</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1">
        {[
          { key: "products", label: "Produtos", icon: Package2 },
          { key: "movements", label: "Movimentações", icon: BarChart3 },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "ghost"}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="all">Todos os tipos</option>
                <option value="Alimento">Alimentos</option>
                <option value="Medicamento">Medicamentos</option>
                <option value="Higiene">Higiene</option>
                <option value="Acessório">Acessórios</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="all">Todos os status</option>
                <option value="low_stock">Estoque baixo</option>
                <option value="expiring">Vencendo</option>
                <option value="expired">Vencidos</option>
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

          {/* Content */}
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const validityStatus = getValidityStatus(product.validity);

                    return (
                      <TableRow key={product.product_id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">
                                {product.name}
                              </div>
                              <div className="text-sm text-text-secondary">
                                {product.supplier}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-text-secondary">
                          {product.type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-text-primary font-medium">
                              {product.quantity} {product.unit}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}
                            >
                              {stockStatus.status === "low"
                                ? "Baixo"
                                : stockStatus.status === "medium"
                                  ? "Médio"
                                  : "OK"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-text-primary">
                              {formatCurrency(product.salePrice)}
                            </div>
                            <div className="text-xs text-text-secondary">
                              Custo: {formatCurrency(product.costPrice)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.validity ? (
                            <div
                              className={`text-sm ${validityStatus?.color || "text-text-primary"}`}
                            >
                              {formatDate(product.validity)}
                            </div>
                          ) : (
                            <span className="text-text-tertiary">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}
                          >
                            {stockStatus.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-text-secondary mb-4">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece cadastrando o primeiro produto do estoque"}
              </p>
              <Button>
                <Link href="/dashboard/inventory/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Produto
                </Link>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Movements Tab */}
      {activeTab === "movements" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Movimentações Recentes
              </h3>
              <Button variant="secondary">
                <Link href="/dashboard/inventory/movements">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Todas
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStockMovements.map((movement, index) => (
                <motion.div
                  key={movement.id}
                  className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        movement.type === "IN" ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      {movement.type === "IN" ? (
                        <TrendingUp className={`w-5 h-5 text-success`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 text-error`} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {movement.product}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {movement.reason}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-semibold ${movement.type === "IN" ? "text-success" : "text-error"}`}
                    >
                      {movement.type === "IN" ? "+" : "-"}
                      {movement.quantity}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {formatDate(movement.date)} • {movement.user}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
