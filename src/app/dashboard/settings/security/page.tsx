"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Smartphone,
  Users,
  Activity,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  Globe,
  Trash2,
  LogOut,
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
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/store";

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  ipAddress: string;
  isCurrent: boolean;
  isRevoked: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function SecurityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [setupStep, setSetupStep] = useState<'initial' | 'qr' | 'verify'>('initial');

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);

  // Filtros
  const [auditAction, setAuditAction] = useState("");
  const [auditUserId, setAuditUserId] = useState("");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados de segurança do usuário
      const userResponse = await apiClient.get('/auth/me');
      setTwoFactorEnabled(userResponse.twoFactorEnabled || false);

      // Carregar sessões
      await loadSessions();

      // Carregar logs de auditoria (se for ADMIN)
      if (user?.role === 'ADMIN') {
        await loadAuditLogs();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de segurança');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await apiClient.get('/auth/sessions');
      setSessions(response.sessions);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadAuditLogs = async (page = 1) => {
    try {
      setAuditLogsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(auditAction && { action: auditAction }),
        ...(auditUserId && { userId: auditUserId }),
        ...(auditStartDate && { startDate: auditStartDate }),
        ...(auditEndDate && { endDate: auditEndDate }),
      });

      const response = await apiClient.get(`/audit-logs?${params}`);
      setAuditLogs(response.logs);
      setAuditLogsTotal(response.pagination.total);
      setAuditLogsPage(page);
    } catch (err) {
      console.error('Erro ao carregar logs de auditoria:', err);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const setupTwoFactor = async () => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/2fa/setup');
      setQrCodeUrl(response.qrCodeUrl);
      setBackupCodes(response.backupCodes);
      setSetupStep('qr');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao configurar 2FA');
    }
  };

  const verifyTwoFactor = async () => {
    try {
      setError(null);
      await apiClient.put('/auth/2fa/setup', {
        token: verificationToken,
        backupCodes
      });
      
      setTwoFactorEnabled(true);
      setSetupStep('initial');
      setVerificationToken("");
      alert('2FA ativado com sucesso! Guarde seus códigos de backup em um local seguro.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
    }
  };

  const disableTwoFactor = async () => {
    if (!confirm('Tem certeza que deseja desativar o 2FA? Isso reduzirá a segurança da sua conta.')) {
      return;
    }

    try {
      setError(null);
      await apiClient.delete('/auth/2fa/setup', {
        token: verificationToken
      });
      
      setTwoFactorEnabled(false);
      setVerificationToken("");
      alert('2FA desativado com sucesso');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desativar 2FA');
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja revogar esta sessão?')) {
      return;
    }

    try {
      await apiClient.delete('/auth/sessions', { sessionId });
      await loadSessions();
      alert('Sessão revogada com sucesso');
    } catch (err) {
      alert('Erro ao revogar sessão: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm('Tem certeza que deseja revogar todas as sessões exceto a atual?')) {
      return;
    }

    try {
      await apiClient.post('/auth/sessions');
      await loadSessions();
      alert('Todas as sessões foram revogadas com sucesso');
    } catch (err) {
      alert('Erro ao revogar sessões: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const exportAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        startDate: auditStartDate,
        endDate: auditEndDate,
        action: auditAction,
        userId: auditUserId,
      });

      const response = await apiClient.get(`/audit-logs?${params}`);
      
      // Simular download
      const dataStr = JSON.stringify(response.logs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao exportar logs: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando configurações de segurança...</p>
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
            <Shield className="w-8 h-8 mr-3" />
            Segurança
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie a segurança da sua conta e monitore atividades
          </p>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center text-error">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Two-Factor Authentication (2FA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status do 2FA</p>
                <p className="text-sm text-text-secondary">
                  {twoFactorEnabled ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <div className={`flex items-center ${twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {twoFactorEnabled ? (
                  <CheckCircle className="w-5 h-5 mr-1" />
                ) : (
                  <AlertTriangle className="w-5 h-5 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {twoFactorEnabled ? 'Protegido' : 'Vulnerável'}
                </span>
              </div>
            </div>

            {!twoFactorEnabled && setupStep === 'initial' && (
              <Button onClick={setupTwoFactor} className="w-full">
                Configurar 2FA
              </Button>
            )}

            {setupStep === 'qr' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-2">
                    Escaneie o QR Code com seu aplicativo autenticador
                  </p>
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto border rounded-lg" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Código de Verificação</label>
                  <Input
                    type="text"
                    placeholder="Digite o código de 6 dígitos"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={verifyTwoFactor} className="flex-1">
                    Verificar e Ativar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSetupStep('initial')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Códigos de Backup:</strong> Guarde estes códigos em um local seguro.
                    Eles podem ser usados para acessar sua conta se você perder seu dispositivo.
                  </p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                    >
                      {showBackupCodes ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showBackupCodes ? 'Ocultar' : 'Mostrar'} Códigos
                    </Button>
                    {showBackupCodes && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-mono">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="bg-white p-2 rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {twoFactorEnabled && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Seu 2FA está ativo e protegendo sua conta.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Código para Desativar</label>
                  <Input
                    type="text"
                    placeholder="Digite o código de 6 dígitos para desativar"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <Button 
                  variant="destructive" 
                  onClick={disableTwoFactor}
                  className="w-full"
                >
                  Desativar 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessões Ativas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Sessões Ativas
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={revokeAllSessions}
                disabled={sessionsLoading}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Revogar Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">Carregando sessões...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 border rounded-lg ${
                      session.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {session.userAgent.includes('Chrome') ? 'Chrome' :
                             session.userAgent.includes('Firefox') ? 'Firefox' :
                             session.userAgent.includes('Safari') ? 'Safari' : 'Navegador'}
                          </span>
                          {session.isCurrent && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Atual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          {session.ipAddress} • {formatDate(session.createdAt)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Expira em: {formatDate(session.expiresAt)}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-center text-text-secondary py-4">
                    Nenhuma sessão ativa encontrada
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs de Auditoria (Apenas para ADMIN) */}
      {user?.role === 'ADMIN' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Logs de Auditoria
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAuditLogs}
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-text-secondary">Ação</label>
                <Select value={auditAction} onValueChange={setAuditAction}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as ações</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="2FA_ENABLED">2FA Ativado</SelectItem>
                    <SelectItem value="2FA_DISABLED">2FA Desativado</SelectItem>
                    <SelectItem value="SESSION_REVOKED">Sessão Revogada</SelectItem>
                    <SelectItem value="PASSWORD_CHANGED">Senha Alterada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">Data Inicial</label>
                <Input
                  type="date"
                  value={auditStartDate}
                  onChange={(e) => setAuditStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">Data Final</label>
                <Input
                  type="date"
                  value={auditEndDate}
                  onChange={(e) => setAuditEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => loadAuditLogs(1)} 
                  className="w-full"
                  disabled={auditLogsLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${auditLogsLoading ? 'animate-spin' : ''}`} />
                  Filtrar
                </Button>
              </div>
            </div>

            {/* Lista de Logs */}
            {auditLogsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-text-secondary">Carregando logs...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{log.action}</span>
                          <span className="text-xs text-text-secondary">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {log.details}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {log.user.name}
                          </span>
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {log.ipAddress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center text-text-secondary py-8">
                    Nenhum log de auditoria encontrado
                  </p>
                )}
              </div>
            )}

            {/* Paginação */}
            {auditLogsTotal > 20 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-text-secondary">
                  Mostrando {((auditLogsPage - 1) * 20) + 1} a {Math.min(auditLogsPage * 20, auditLogsTotal)} de {auditLogsTotal} logs
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAuditLogs(auditLogsPage - 1)}
                    disabled={auditLogsPage <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAuditLogs(auditLogsPage + 1)}
                    disabled={auditLogsPage * 20 >= auditLogsTotal}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
