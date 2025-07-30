//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  FileText,
  Package,
  DollarSign,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

// Mock data for reports
const inventoryReports = {
  summary: {
    totalProducts: 128,
    totalValue: 45620.5,
    lowStockItems: 12,
    expiredItems: 3,
    expiringItems: 8,
    avgTurnover: 2.4,
    monthlyGrowth: 8.5,
  },

  categoryAnalysis: [
    {
      category: "Medicamentos",
      products: 45,
      value: 18750.0,
      percentage: 41.1,
    },
    { category: "Alimentos", products: 32, value: 15230.0, percentage: 33.4 },
    { category: "Higiene", products: 28, value: 8940.5, percentage: 19.6 },
    { category: "Acessórios", products: 23, value: 2700.0, percentage: 5.9 },
  ],

  topProducts: [
    {
      name: "Ração Premium Cães Adultos",
      movement: 156,
      revenue: 14040.4,
      margin: 45.2,
    },
    { name: "Vacina V10 Canina", movement: 89, revenue: 5785.0, margin: 57.7 },
    { name: "Shampoo Antipulgas", movement: 67, revenue: 2338.3, margin: 54.4 },
    {
      name: "Antibiótico Amoxicilina",
      movement: 45,
      revenue: 400.5,
      margin: 71.2,
    },
    {
      name: "Brinquedo Corda Dental",
      movement: 34,
      revenue: 846.6,
      margin: 65.9,
    },
  ],

  lowStockAlert: [
    {
      name: "Antibiótico Amoxicilina",
      current: 3,
      minimum: 20,
      status: "critical",
    },
    { name: "Vacina V8 Felina", current: 5, minimum: 15, status: "critical" },
    { name: "Soro Fisiológico", current: 8, minimum: 25, status: "low" },
    { name: "Luvas Procedimento", current: 12, minimum: 30, status: "low" },
  ],

  expiryAlert: [
    {
      name: "Antibiótico Cefalexina",
      expiry: new Date("2025-02-15"),
      daysLeft: 18,
    },
    {
      name: "Pomada Cicatrizante",
      expiry: new Date("2025-02-28"),
      daysLeft: 31,
    },
    {
      name: "Vacina Gripe Canina",
      expiry: new Date("2025-03-10"),
      daysLeft: 41,
    },
  ],

  monthlyTrends: [
    { month: "Set", purchases: 12500, sales: 18400, profit: 5900 },
    { month: "Out", purchases: 15200, sales: 21300, profit: 6100 },
    { month: "Nov", purchases: 13800, sales: 19850, profit: 6050 },
    { month: "Dez", purchases: 16500, sales: 24200, profit: 7700 },
    { month: "Jan", purchases: 14200, sales: 20500, profit: 6300 },
  ],
};

export default function InventoryReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    end: new Date(),
  });
  const [selectedReport, setSelectedReport] = useState<string>("overview");

  const handleExportPDF = () => {
    console.log("Exporting to PDF...");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
              Relatórios de Estoque
            </h1>
            <p className="text-text-secondary">
              Análises e métricas do inventário
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="secondary" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tipo de Relatório
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
              >
                <option value="overview">Visão Geral</option>
                <option value="financial">Financeiro</option>
                <option value="stock">Controle de Estoque</option>
                <option value="movement">Movimentação</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Data Início
              </label>
              <Input
                type="date"
                value={dateRange.start.toISOString().split("T")[0]}
                onChange={(e) =>
                  setDateRange({
                    ...dateRange,
                    start: new Date(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Data Fim
              </label>
              <Input
                type="date"
                value={dateRange.end.toISOString().split("T")[0]}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: new Date(e.target.value) })
                }
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total de Produtos</p>
                <p className="text-2xl font-bold text-text-primary">
                  {inventoryReports.summary.totalProducts}
                </p>
                <p className="text-xs text-success">
                  +{inventoryReports.summary.monthlyGrowth}% este mês
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
                <p className="text-sm text-text-secondary">Valor Total</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(inventoryReports.summary.totalValue)}
                </p>
                <p className="text-xs text-text-tertiary">Valor do estoque</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Estoque Baixo</p>
                <p className="text-2xl font-bold text-error">
                  {inventoryReports.summary.lowStockItems}
                </p>
                <p className="text-xs text-error">Requer atenção</p>
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
                <p className="text-sm text-text-secondary">Giro Médio</p>
                <p className="text-2xl font-bold text-text-primary">
                  {inventoryReports.summary.avgTurnover}x
                </p>
                <p className="text-xs text-text-tertiary">Por mês</p>
              </div>
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Análise por Categoria
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryReports.categoryAnalysis.map((category, index) => (
              <motion.div
                key={category.category}
                className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full bg-primary-500 opacity-80"
                    style={{ backgroundColor: `hsl(${index * 90}, 70%, 50%)` }}
                  />
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {category.category}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {category.products} produtos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-primary">
                    {formatCurrency(category.value)}
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {category.percentage}%
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Produtos Mais Movimentados
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryReports.topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {product.name}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {product.movement} movimentações
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-primary">
                    {formatCurrency(product.revenue)}
                  </div>
                  <div className="text-sm text-success">
                    {product.margin}% margem
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              Alertas de Estoque Baixo
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventoryReports.lowStockAlert.map((item, index) => (
              <motion.div
                key={item.name}
                className={`p-3 rounded-lg border-l-4 ${
                  item.status === "critical"
                    ? "bg-error/5 border-l-error"
                    : "bg-warning/5 border-l-warning"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {item.name}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Estoque atual: {item.current} | Mínimo: {item.minimum}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "critical"
                        ? "bg-error text-error-foreground"
                        : "bg-warning text-warning-foreground"
                    }`}
                  >
                    {item.status === "critical" ? "Crítico" : "Baixo"}
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Expiry Alerts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-warning" />
              Produtos Vencendo
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventoryReports.expiryAlert.map((item, index) => (
              <motion.div
                key={item.name}
                className="p-3 bg-warning/5 border-l-4 border-l-warning rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {item.name}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Vence em: {formatDate(item.expiry)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-warning/20 text-warning rounded-full text-xs font-medium">
                    {item.daysLeft} dias
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Tendências Mensais
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {inventoryReports.monthlyTrends.map((month, index) => (
              <motion.div
                key={month.month}
                className="p-4 bg-background-secondary rounded-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-semibold text-text-primary mb-3">
                  {month.month}
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-text-secondary">Compras</p>
                    <p className="text-sm font-medium text-error">
                      {formatCurrency(month.purchases)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Vendas</p>
                    <p className="text-sm font-medium text-success">
                      {formatCurrency(month.sales)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Lucro</p>
                    <p className="text-sm font-bold text-primary-500">
                      {formatCurrency(month.profit)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Resumo do Relatório
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <h4 className="font-semibold text-success mb-2">
                Pontos Positivos
              </h4>
              <ul className="text-sm text-success/80 space-y-1">
                <li>
                  • Crescimento de {inventoryReports.summary.monthlyGrowth}% no
                  estoque
                </li>
                <li>• Boa margem de lucro nos produtos principais</li>
                <li>• Giro de estoque dentro da média</li>
              </ul>
            </div>

            <div className="p-4 bg-warning/10 rounded-lg">
              <h4 className="font-semibold text-warning mb-2">
                Atenção Necessária
              </h4>
              <ul className="text-sm text-warning/80 space-y-1">
                <li>
                  • {inventoryReports.summary.lowStockItems} produtos com
                  estoque baixo
                </li>
                <li>
                  • {inventoryReports.summary.expiringItems} produtos vencendo
                  em breve
                </li>
                <li>• Necessário reposição urgente</li>
              </ul>
            </div>

            <div className="p-4 bg-error/10 rounded-lg">
              <h4 className="font-semibold text-error mb-2">Ações Urgentes</h4>
              <ul className="text-sm text-error/80 space-y-1">
                <li>
                  • {inventoryReports.summary.expiredItems} produtos vencidos
                </li>
                <li>• Reposição crítica de medicamentos</li>
                <li>• Revisar fornecedores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
