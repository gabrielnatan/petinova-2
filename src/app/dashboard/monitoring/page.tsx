"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from "@/store";
import { formatDate } from "@/lib/utils";

interface PerformanceStats {
  hourly: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  daily: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  total: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  errorRate: {
    hourly: number;
    daily: number;
  };
}

interface HealthCheck {
  status: string;
  timestamp: string;
  checks: {
    database: {
      status: string;
      message: string;
    };
    externalApis: Array<{
      name: string;
      status: string;
      message: string;
    }>;
  };
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  version: string;
}

interface PerformanceMetric {
  id: string;
  responseTime: number;
  memoryUsage: number;
  endpoint: string;
  method: string;
  statusCode: number;
  timestamp: string;
}

export default function MonitoringPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (user) {
      loadMonitoringData();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadMonitoringData, 30000); // 30 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPerformanceStats(),
        loadHealthCheck(),
        loadMetrics()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceStats = async () => {
    try {
      const response = await fetch('/api/performance');
      const data = await response.json();
      setPerformanceStats(data.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadHealthCheck = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthCheck(data);
    } catch (error) {
      console.error('Erro ao carregar health check:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch(`/api/performance?limit=50&timeRange=${timeRange}`);
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    return status === 'healthy' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando monitoramento...</p>
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
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <Activity className="w-8 h-8 mr-3" />
            Monitoramento
          </h1>
          <p className="text-text-secondary mt-1">
            Performance, health check e métricas do sistema
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button variant="outline" onClick={loadMonitoringData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Health Check */}
      {healthCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`${getStatusColor(healthCheck.status)}`}>
                  {getStatusIcon(healthCheck.status)}
                </div>
                <div>
                  <p className="font-medium">Status Geral</p>
                  <p className="text-sm text-text-secondary capitalize">
                    {healthCheck.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Uptime</p>
                  <p className="text-sm text-text-secondary">
                    {formatUptime(healthCheck.uptime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">Memória</p>
                  <p className="text-sm text-text-secondary">
                    {formatMemory(healthCheck.memory.heapUsed)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="font-medium">Versão</p>
                  <p className="text-sm text-text-secondary">
                    {healthCheck.version}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="font-medium">Verificações</h3>
              
              <div className="flex items-center space-x-2">
                <div className={`${getStatusColor(healthCheck.checks.database.status)}`}>
                  {getStatusIcon(healthCheck.checks.database.status)}
                </div>
                <span className="text-sm">{healthCheck.checks.database.message}</span>
              </div>

              {healthCheck.checks.externalApis.map((api) => (
                <div key={api.name} className="flex items-center space-x-2">
                  <div className={`${getStatusColor(api.status)}`}>
                    {getStatusIcon(api.status)}
                  </div>
                  <span className="text-sm">{api.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      {performanceStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance - Última Hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Requisições</p>
                  <p className="text-2xl font-bold">{performanceStats.hourly.count}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Tempo Médio</p>
                  <p className="text-2xl font-bold">{performanceStats.hourly.avg.toFixed(2)}ms</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Taxa de Erro</p>
                  <p className="text-2xl font-bold">{performanceStats.errorRate.hourly.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Pico</p>
                  <p className="text-2xl font-bold">{performanceStats.hourly.max}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance - Últimas 24h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Requisições</p>
                  <p className="text-2xl font-bold">{performanceStats.daily.count}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Tempo Médio</p>
                  <p className="text-2xl font-bold">{performanceStats.daily.avg.toFixed(2)}ms</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Taxa de Erro</p>
                  <p className="text-2xl font-bold">{performanceStats.errorRate.daily.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Pico</p>
                  <p className="text-2xl font-bold">{performanceStats.daily.max}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Response Time Chart */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => formatDate(value).split(' ')[1]}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: number) => [`${value}ms`, 'Tempo de Resposta']}
                />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.slice(0, 10).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      metric.method === 'GET' ? 'bg-green-100 text-green-800' :
                      metric.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      metric.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.method}
                    </span>
                    <span className="font-mono text-sm">{metric.endpoint}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded ${
                    metric.statusCode < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.statusCode}
                  </span>
                  <span className="text-text-secondary">
                    {metric.responseTime}ms
                  </span>
                  <span className="text-text-secondary">
                    {formatDate(metric.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
