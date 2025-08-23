"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/store";

interface ReportData {
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    expiredItems: number;
    expiringItems: number;
    avgTurnover: number;
    monthlyGrowth: number;
  };
  categoryAnalysis: {
    category: string;
    products: number;
    value: number;
    percentage: number;
  }[];
  topProducts: {
    name: string;
    movement: number;
    revenue: number;
    margin: number;
  }[];
  lowStockAlert: {
    name: string;
    current: number;
    minimum: number;
    status: 'critical' | 'low';
  }[];
  expiryAlert: {
    name: string;
    expiry: Date;
    daysLeft: number;
  }[];
  monthlyTrends: {
    month: string;
    purchases: number;
    sales: number;
    profit: number;
  }[];
}

export default function InventoryReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    end: new Date(),
  });
  const [selectedReport, setSelectedReport] = useState<string>("inventory");
  const [refreshing, setRefreshing] = useState(false);

  const loadReportData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        type: selectedReport,
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
        groupBy: 'month'
      });
      
      const response = await fetch(`/api/reports?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar relatório');
      }
      
      const data = await response.json();
      
      // Transform API data to match our interface
      const transformedData: ReportData = {
        summary: {
          totalProducts: data.data?.totalProducts || 0,
          totalValue: data.data?.totalValue || 0,
          lowStockItems: data.data?.lowStockItems || 0,
          expiredItems: data.data?.expiredItems || 0,
          expiringItems: data.data?.expiringItems || 0,
          avgTurnover: data.data?.avgTurnover || 0,
          monthlyGrowth: data.data?.monthlyGrowth || 0,
        },
        categoryAnalysis: data.data?.categoryAnalysis || [],
        topProducts: data.data?.topProducts || [],
        lowStockAlert: data.data?.lowStockAlert || [],
        expiryAlert: (data.data?.expiryAlert || []).map((item: any) => ({
          ...item,
          expiry: new Date(item.expiry)
        })),
        monthlyTrends: data.data?.monthlyTrends || []
      };
      
      setReportData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório');
      console.error('Erro ao carregar relatório:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedReport, dateRange]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const handleExportPDF = async () => {
    if (!user) return;
    
    try {
      const params = new URLSearchParams({
        type: selectedReport,
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
        format: 'pdf'
      });
      
      const response = await fetch(`/api/reports/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao exportar relatório');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_estoque_${selectedReport}_${dateRange.start.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar relatório');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
              Relatórios de Estoque
            </h1>
            <p className="text-text-secondary">
              Análises e métricas do inventário
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
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
                <option value="inventory">Estoque</option>
                <option value="appointments">Consultas</option>
                <option value="revenue">Receita</option>
                <option value="pets">Pets</option>
                <option value="veterinarians">Veterinários</option>
                <option value="guardians">Tutores</option>
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
              <Button className="w-full" onClick={loadReportData} disabled={loading}>
                <Filter className="w-4 h-4 mr-2" />
                {loading ? 'Carregando...' : 'Aplicar Filtros'}
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
                  {reportData?.summary.totalProducts || 0}
                </p>
                <p className="text-xs text-success">
                  +{reportData?.summary.monthlyGrowth || 0}% este mês
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
                  {formatCurrency(reportData?.summary.totalValue || 0)}
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
                  {reportData?.summary.lowStockItems || 0}
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
                  {reportData?.summary.avgTurnover || 0}x
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
            {(reportData?.categoryAnalysis || []).map((category, index) => (
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
            {(reportData?.topProducts || []).map((product, index) => (
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
            {(reportData?.lowStockAlert || []).map((item, index) => (
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
            {(reportData?.expiryAlert || []).map((item, index) => (
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
            {(reportData?.monthlyTrends || []).map((month, index) => (
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
                  • Crescimento de {reportData?.summary.monthlyGrowth || 0}% no
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
                  • {reportData?.summary.lowStockItems || 0} produtos com
                  estoque baixo
                </li>
                <li>
                  • {reportData?.summary.expiringItems || 0} produtos vencendo
                  em breve
                </li>
                <li>• Necessário reposição urgente</li>
              </ul>
            </div>

            <div className="p-4 bg-error/10 rounded-lg">
              <h4 className="font-semibold text-error mb-2">Ações Urgentes</h4>
              <ul className="text-sm text-error/80 space-y-1">
                <li>
                  • {reportData?.summary.expiredItems || 0} produtos vencidos
                </li>
                <li>• Reposição crítica de medicamentos</li>
                <li>• Revisar fornecedores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-text-primary">Carregando relatório...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 bg-error text-error-foreground p-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-error-foreground hover:text-error-foreground/80"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
