"use client";

import React, { useState, useEffect } from "react";
import {
  Link,
  Globe,
  Bell,
  TestTube,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Download,
  RefreshCw,
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

interface Laboratory {
  id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  apiKey?: string;
  apiUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  eventType: string;
  isActive: boolean;
  createdAt: string;
}

interface WebhookAttempt {
  id: string;
  eventType: string;
  success: boolean;
  responseStatus: number;
  createdAt: string;
  webhook: {
    name: string;
    url: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  createdAt: string;
}

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Laboratories
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [laboratoriesLoading, setLaboratoriesLoading] = useState(false);

  // Webhooks
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [webhookAttempts, setWebhookAttempts] = useState<WebhookAttempt[]>([]);
  const [webhookAttemptsLoading, setWebhookAttemptsLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Form states
  const [showLaboratoryForm, setShowLaboratoryForm] = useState(false);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadIntegrationsData();
    }
  }, [user]);

  const loadIntegrationsData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadLaboratories(),
        loadWebhooks(),
        loadWebhookAttempts(),
        loadNotifications(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar integrações');
    } finally {
      setLoading(false);
    }
  };

  const loadLaboratories = async () => {
    try {
      setLaboratoriesLoading(true);
      const response = await apiClient.get('/integrations/laboratories');
      setLaboratories(response.laboratories);
    } catch (err) {
      console.error('Erro ao carregar laboratórios:', err);
    } finally {
      setLaboratoriesLoading(false);
    }
  };

  const loadWebhooks = async () => {
    try {
      setWebhooksLoading(true);
      const response = await apiClient.get('/webhooks');
      setWebhooks(response.webhooks);
    } catch (err) {
      console.error('Erro ao carregar webhooks:', err);
    } finally {
      setWebhooksLoading(false);
    }
  };

  const loadWebhookAttempts = async () => {
    try {
      setWebhookAttemptsLoading(true);
      const response = await apiClient.get('/webhooks/send/attempts');
      setWebhookAttempts(response.attempts);
    } catch (err) {
      console.error('Erro ao carregar tentativas de webhook:', err);
    } finally {
      setWebhookAttemptsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await apiClient.get('/notifications');
      setNotifications(response.notifications);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await apiClient.post('/webhooks/send', {
        eventType: 'TEST',
        data: { message: 'Teste de webhook' },
        webhookId
      });
      
      alert(`Webhook testado: ${response.summary.successful} sucesso, ${response.summary.failed} falhas`);
      await loadWebhookAttempts();
    } catch (err) {
      alert('Erro ao testar webhook: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await apiClient.put('/notifications', { markAllAsRead: true });
      await loadNotifications();
      alert('Todas as notificações foram marcadas como lidas');
    } catch (err) {
      alert('Erro ao marcar notificações como lidas: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando integrações...</p>
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
            <Link className="w-8 h-8 mr-3" />
            Integrações
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie integrações com laboratórios, webhooks e notificações
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadIntegrationsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
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
        {/* Laboratórios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <TestTube className="w-5 h-5 mr-2" />
                Laboratórios
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLaboratoryForm(!showLaboratoryForm)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {laboratoriesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">Carregando...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {laboratories.map((lab) => (
                  <div key={lab.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{lab.name}</span>
                          <span className="text-sm text-text-secondary">({lab.code})</span>
                          {lab.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {lab.email} • {lab.phone}
                        </p>
                        {lab.apiUrl && (
                          <p className="text-xs text-text-secondary">
                            API: {lab.apiUrl}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {laboratories.length === 0 && (
                  <p className="text-center text-text-secondary py-4">
                    Nenhum laboratório configurado
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Webhooks
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWebhookForm(!showWebhookForm)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {webhooksLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">Carregando...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{webhook.name}</span>
                          {webhook.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {webhook.url}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Evento: {webhook.eventType}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhook(webhook.id)}
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {webhooks.length === 0 && (
                  <p className="text-center text-text-secondary py-4">
                    Nenhum webhook configurado
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tentativas de Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Tentativas de Webhook
          </CardTitle>
        </CardHeader>
        <CardContent>
          {webhookAttemptsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-text-secondary">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhookAttempts.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{attempt.webhook.name}</span>
                        {attempt.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {attempt.webhook.url}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Evento: {attempt.eventType} • Status: {attempt.responseStatus} • {formatDate(attempt.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {webhookAttempts.length === 0 && (
                <p className="text-center text-text-secondary py-4">
                  Nenhuma tentativa de webhook encontrada
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificações
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={markNotificationsAsRead}
            >
              Marcar como Lidas
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-text-secondary">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{notification.title}</span>
                        {!notification.read && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Nova
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          notification.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        Tipo: {notification.type} • {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-text-secondary py-4">
                  Nenhuma notificação encontrada
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulários (simplificados) */}
      {showLaboratoryForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Laboratório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Nome</label>
                <Input placeholder="Nome do laboratório" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Código</label>
                <Input placeholder="Código único" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Email</label>
                <Input type="email" placeholder="email@laboratorio.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Telefone</label>
                <Input placeholder="(11) 99999-9999" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">Endereço</label>
                <Input placeholder="Endereço completo" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">URL da API</label>
                <Input placeholder="https://api.laboratorio.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Chave da API</label>
                <Input placeholder="Chave de autenticação" className="mt-1" />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button>Salvar</Button>
              <Button variant="outline" onClick={() => setShowLaboratoryForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showWebhookForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Nome</label>
                <Input placeholder="Nome do webhook" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Tipo de Evento</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPOINTMENT_CREATED">Agendamento Criado</SelectItem>
                    <SelectItem value="APPOINTMENT_UPDATED">Agendamento Atualizado</SelectItem>
                    <SelectItem value="CONSULTATION_CREATED">Consulta Criada</SelectItem>
                    <SelectItem value="PRESCRIPTION_CREATED">Prescrição Criada</SelectItem>
                    <SelectItem value="INVENTORY_LOW">Estoque Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">URL</label>
                <Input placeholder="https://seu-sistema.com/webhook" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Secret (Opcional)</label>
                <Input placeholder="Chave secreta para assinatura" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Status</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button>Salvar</Button>
              <Button variant="outline" onClick={() => setShowWebhookForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
