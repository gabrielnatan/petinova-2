"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Mail,
  Send,
  Settings,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Phone,
  Calendar,
  FileText,
  Users,
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
import { useAuth } from "@/store";

interface WhatsAppStatus {
  configured: boolean;
  status?: any;
  templates?: any[];
}

interface EmailStatus {
  configured: boolean;
  connected?: boolean;
  templates?: string[];
}

interface MessageData {
  type: string;
  to: string;
  data: Record<string, any>;
}

export default function CommunicationsPage() {
  const { user } = useAuth();
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<'whatsapp' | 'email'>('whatsapp');
  const [messageType, setMessageType] = useState('text');
  const [recipient, setRecipient] = useState('');
  const [messageData, setMessageData] = useState<MessageData>({
    type: 'text',
    to: '',
    data: {}
  });

  useEffect(() => {
    if (user) {
      loadStatus();
    }
  }, [user]);

  const loadStatus = async () => {
    try {
      // Carregar status do WhatsApp
      const whatsappResponse = await fetch('/api/whatsapp');
      if (whatsappResponse.ok) {
        const whatsappData = await whatsappResponse.json();
        setWhatsappStatus(whatsappData);
      }

      // Carregar status do Email
      const emailResponse = await fetch('/api/email');
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        setEmailStatus(emailData);
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const testConnection = async (service: 'whatsapp' | 'email') => {
    try {
      setLoading(true);
      
      if (service === 'whatsapp') {
        const response = await fetch('/api/whatsapp?action=status');
        if (response.ok) {
          const data = await response.json();
          setWhatsappStatus(prev => ({ ...prev, ...data }));
        }
      } else {
        const response = await fetch('/api/email?action=test');
        if (response.ok) {
          const data = await response.json();
          setEmailStatus(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!recipient || !messageData.data) return;

    try {
      setLoading(true);

      const payload = {
        ...messageData,
        to: recipient
      };

      const endpoint = selectedService === 'whatsapp' ? '/api/whatsapp' : '/api/email';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        alert('Mensagem enviada com sucesso!');
        setRecipient('');
        setMessageData({ type: 'text', to: '', data: {} });
      } else {
        alert('Erro ao enviar mensagem: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageData = (field: string, value: any) => {
    setMessageData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }));
  };

  const renderWhatsAppForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text-secondary">Tipo de Mensagem</label>
        <Select value={messageType} onValueChange={setMessageType}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="appointment_confirmation">Confirmação de Consulta</SelectItem>
            <SelectItem value="appointment_reminder">Lembrete de Consulta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-text-secondary">Número do WhatsApp</label>
        <Input
          type="text"
          placeholder="+5511999999999"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mt-1"
        />
      </div>

      {messageType === 'text' && (
        <div>
          <label className="text-sm font-medium text-text-secondary">Mensagem</label>
          <textarea
            className="w-full mt-1 p-3 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Digite sua mensagem..."
            onChange={(e) => updateMessageData('text', e.target.value)}
          />
        </div>
      )}

      {messageType === 'appointment_confirmation' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-text-secondary">Nome do Pet</label>
            <Input
              type="text"
              placeholder="Rex"
              onChange={(e) => updateMessageData('petName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Data</label>
            <Input
              type="date"
              onChange={(e) => updateMessageData('date', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Horário</label>
            <Input
              type="time"
              onChange={(e) => updateMessageData('time', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Veterinário</label>
            <Input
              type="text"
              placeholder="Dr. Silva"
              onChange={(e) => updateMessageData('veterinarian', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {messageType === 'appointment_reminder' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-text-secondary">Nome do Pet</label>
            <Input
              type="text"
              placeholder="Rex"
              onChange={(e) => updateMessageData('petName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Data</label>
            <Input
              type="date"
              onChange={(e) => updateMessageData('date', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Horário</label>
            <Input
              type="time"
              onChange={(e) => updateMessageData('time', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Endereço</label>
            <Input
              type="text"
              placeholder="Rua das Flores, 123"
              onChange={(e) => updateMessageData('address', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderEmailForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text-secondary">Tipo de Email</label>
        <Select value={messageType} onValueChange={setMessageType}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appointment_confirmation">Confirmação de Consulta</SelectItem>
            <SelectItem value="appointment_reminder">Lembrete de Consulta</SelectItem>
            <SelectItem value="exam_result">Resultado de Exame</SelectItem>
            <SelectItem value="prescription_ready">Prescrição Disponível</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-text-secondary">Email do Destinatário</label>
        <Input
          type="email"
          placeholder="cliente@email.com"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mt-1"
        />
      </div>

      {messageType === 'appointment_confirmation' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-text-secondary">Nome do Responsável</label>
            <Input
              type="text"
              placeholder="João Silva"
              onChange={(e) => updateMessageData('guardianName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Nome do Pet</label>
            <Input
              type="text"
              placeholder="Rex"
              onChange={(e) => updateMessageData('petName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Data</label>
            <Input
              type="date"
              onChange={(e) => updateMessageData('date', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Horário</label>
            <Input
              type="time"
              onChange={(e) => updateMessageData('time', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Veterinário</label>
            <Input
              type="text"
              placeholder="Dr. Silva"
              onChange={(e) => updateMessageData('veterinarian', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Endereço</label>
            <Input
              type="text"
              placeholder="Rua das Flores, 123"
              onChange={(e) => updateMessageData('address', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {messageType === 'exam_result' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-text-secondary">Nome do Responsável</label>
            <Input
              type="text"
              placeholder="João Silva"
              onChange={(e) => updateMessageData('guardianName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Nome do Pet</label>
            <Input
              type="text"
              placeholder="Rex"
              onChange={(e) => updateMessageData('petName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Tipo de Exame</label>
            <Input
              type="text"
              placeholder="Hemograma"
              onChange={(e) => updateMessageData('examType', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Data do Exame</label>
            <Input
              type="date"
              onChange={(e) => updateMessageData('examDate', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Status</label>
            <Select onValueChange={(value) => updateMessageData('status', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="attention">Atenção</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Observações</label>
            <textarea
              className="w-full mt-1 p-3 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Observações sobre o exame..."
              onChange={(e) => updateMessageData('observations', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <MessageSquare className="w-8 h-8 mr-3" />
            Comunicações
          </h1>
          <p className="text-text-secondary mt-1">
            Integração com WhatsApp e Email
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status dos Serviços */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  {whatsappStatus?.configured ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Configurado</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Não Configurado</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection('whatsapp')}
                  disabled={loading}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  {emailStatus?.configured ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Configurado</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Não Configurado</span>
                    </div>
                  )}
                </div>

                {emailStatus?.connected !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conexão:</span>
                    {emailStatus.connected ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Conectado</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Desconectado</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection('email')}
                  disabled={loading}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Templates Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">WhatsApp:</div>
                <div className="text-xs text-text-secondary space-y-1">
                  <div>• Confirmação de Consulta</div>
                  <div>• Lembrete de Consulta</div>
                  <div>• Resultado de Exame</div>
                  <div>• Prescrição Disponível</div>
                </div>
                
                <div className="text-sm font-medium mt-3">Email:</div>
                <div className="text-xs text-text-secondary space-y-1">
                  <div>• Confirmação de Consulta</div>
                  <div>• Lembrete de Consulta</div>
                  <div>• Resultado de Exame</div>
                  <div>• Prescrição Disponível</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Envio */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Enviar Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Seleção de Serviço */}
                <div>
                  <label className="text-sm font-medium text-text-secondary">Serviço</label>
                  <div className="flex space-x-4 mt-2">
                    <Button
                      variant={selectedService === 'whatsapp' ? 'default' : 'outline'}
                      onClick={() => setSelectedService('whatsapp')}
                      className="flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant={selectedService === 'email' ? 'default' : 'outline'}
                      onClick={() => setSelectedService('email')}
                      className="flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                {/* Formulário específico */}
                {selectedService === 'whatsapp' ? renderWhatsAppForm() : renderEmailForm()}

                {/* Botão de Envio */}
                <Button
                  onClick={sendMessage}
                  disabled={loading || !recipient}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
