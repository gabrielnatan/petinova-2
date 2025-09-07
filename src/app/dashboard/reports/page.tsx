"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Pill,
  Package,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface FinancialReport {
  summary: {
    totalRevenue: number;
    totalCosts: number;
    grossProfit: number;
    profitMargin: number;
    totalTransactions: number;
    totalSales: number;
    totalPurchases: number;
  };
  categoryAnalysis: any[];
  monthlyAnalysis: any[];
}

interface ClinicalReport {
  summary: {
    totalConsultations: number;
    totalAppointments: number;
    totalPrescriptions: number;
    totalPets: number;
    averageConsultationsPerDay: number;
  };
  speciesAnalysis: any[];
  veterinarianAnalysis: any[];
  monthlyAnalysis: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [clinicalReport, setClinicalReport] = useState<ClinicalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reportType, setReportType] = useState('all');

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      if (reportType === 'all' || reportType === 'financial') {
        const financialResponse = await apiClient.get(`/reports/financial?${params}&type=summary`);
        setFinancialReport(financialResponse.report.data);
      }

      if (reportType === 'all' || reportType === 'clinical') {
        const clinicalResponse = await apiClient.get(`/reports/clinical?${params}&type=summary`);
        setClinicalReport(clinicalResponse.report.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, startDate, endDate, reportType]);

  const handleExport = async (type: string) => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: 'summary',
      });

      const response = await apiClient.get(`/reports/${type}?${params}`);
      
      // Simular download do relatório
      const dataStr = JSON.stringify(response.report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${type}_${startDate}_${endDate}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao exportar relatório: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando relatórios...</p>
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
            Relatórios e Analytics
          </h1>
          <p className="text-text-secondary mt-1">
            Análises financeiras e clínicas da clínica
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadReports}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={() => handleExport('financial')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Financeiro
          </Button>
          <Button variant="outline" onClick={() => handleExport('clinical')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Clínico
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Relatórios</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="clinical">Clínico</SelectItem>
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

            <div className="flex items-end">
              <Button onClick={loadReports} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-error">{error}</p>
              <Button onClick={loadReports} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Financial Reports */}
          {(reportType === 'all' || reportType === 'financial') && financialReport && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Relatórios Financeiros
              </h2>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Receita Total</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(financialReport.summary.totalRevenue)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Custos Totais</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(financialReport.summary.totalCosts)}
                        </p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Lucro Bruto</p>
                        <p className={`text-2xl font-bold ${financialReport.summary.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(financialReport.summary.grossProfit)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Margem de Lucro</p>
                        <p className={`text-2xl font-bold ${financialReport.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {financialReport.summary.profitMargin.toFixed(1)}%
                        </p>
                      </div>
                      <BarChart className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue vs Costs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Receita vs Custos Mensais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={financialReport.monthlyAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), '']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stackId="1" 
                          stroke="#00C49F" 
                          fill="#00C49F" 
                          name="Receita"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="costs" 
                          stackId="1" 
                          stroke="#FF8042" 
                          fill="#FF8042" 
                          name="Custos"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Análise por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={financialReport.categoryAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#00C49F" name="Receita" />
                        <Bar dataKey="costs" fill="#FF8042" name="Custos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Clinical Reports */}
          {(reportType === 'all' || reportType === 'clinical') && clinicalReport && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Relatórios Clínicos
              </h2>

              {/* Clinical Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Total Consultas</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {clinicalReport.summary.totalConsultations}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Total Agendamentos</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {clinicalReport.summary.totalAppointments}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Total Prescrições</p>
                        <p className="text-2xl font-bold text-green-600">
                          {clinicalReport.summary.totalPrescriptions}
                        </p>
                      </div>
                      <Pill className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Total Pets</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {clinicalReport.summary.totalPets}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clinical Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Atividade Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={clinicalReport.monthlyAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="consultations" 
                          stroke="#0088FE" 
                          name="Consultas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="appointments" 
                          stroke="#00C49F" 
                          name="Agendamentos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="prescriptions" 
                          stroke="#FFBB28" 
                          name="Prescrições"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Species Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Espécie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={clinicalReport.speciesAnalysis}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ species, totalPets }) => `${species}: ${totalPets}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalPets"
                        >
                          {clinicalReport.speciesAnalysis.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Veterinarian Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance dos Veterinários</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={clinicalReport.veterinarianAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="veterinarian" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consultations" fill="#0088FE" name="Consultas" />
                      <Bar dataKey="appointments" fill="#00C49F" name="Agendamentos" />
                      <Bar dataKey="prescriptions" fill="#FFBB28" name="Prescrições" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
