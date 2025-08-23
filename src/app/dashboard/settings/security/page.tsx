"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Globe,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data
const mockUser = {
  email: "joao.silva@clinica.com",
  lastPasswordChange: new Date("2024-10-15"),
  twoFactorEnabled: true,
  loginAttempts: 0,
  lastLogin: new Date("2025-01-28T08:30:00"),
  activeSessions: [
    {
      id: "1",
      device: "Chrome - Windows",
      location: "São Paulo, SP",
      ip: "192.168.1.100",
      lastActive: new Date("2025-01-28T09:15:00"),
      current: true,
    },
    {
      id: "2",
      device: "Safari - iPhone",
      location: "São Paulo, SP",
      ip: "192.168.1.101",
      lastActive: new Date("2025-01-27T18:30:00"),
      current: false,
    },
    {
      id: "3",
      device: "Firefox - MacOS",
      location: "Rio de Janeiro, RJ",
      ip: "10.0.0.50",
      lastActive: new Date("2025-01-26T14:20:00"),
      current: false,
    },
  ],
  securityEvents: [
    {
      id: "1",
      type: "login_success",
      description: "Login realizado com sucesso",
      timestamp: new Date("2025-01-28T08:30:00"),
      ip: "192.168.1.100",
      device: "Chrome - Windows",
    },
    {
      id: "2",
      type: "password_change",
      description: "Senha alterada",
      timestamp: new Date("2024-10-15T16:45:00"),
      ip: "192.168.1.100",
      device: "Chrome - Windows",
    },
    {
      id: "3",
      type: "failed_login",
      description: "Tentativa de login falhada",
      timestamp: new Date("2025-01-25T22:15:00"),
      ip: "203.0.113.10",
      device: "Unknown",
    },
  ],
};

const formatDateTime = (date) => {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeAgo = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days} dias atrás`;
};

const getDeviceIcon = (device) => {
  if (device.includes("iPhone") || device.includes("Android"))
    return Smartphone;
  if (device.includes("Mac")) return Monitor;
  return Globe;
};

const getEventIcon = (type) => {
  switch (type) {
    case "login_success":
      return CheckCircle;
    case "failed_login":
      return AlertTriangle;
    case "password_change":
      return Key;
    default:
      return Shield;
  }
};

const getEventColor = (type) => {
  switch (type) {
    case "login_success":
      return "text-success";
    case "failed_login":
      return "text-error";
    case "password_change":
      return "text-primary-500";
    default:
      return "text-text-secondary";
  }
};

export default function SecuritySettingsPage() {
  const [activeTab, setActiveTab] = useState("password");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Senha atual é obrigatória";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Nova senha deve ter pelo menos 8 caracteres";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;

    setIsSubmitting(true);
    try {
      console.log("Updating password:", passwordForm);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Senha alterada com sucesso!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      console.log("Terminating session:", sessionId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Sessão encerrada com sucesso!");
      setShowTerminateModal(false);
      setSessionToTerminate(null);
    } catch (error) {
      console.error("Error terminating session:", error);
      alert("Erro ao encerrar sessão. Tente novamente.");
    }
  };

  const handle2FAToggle = async () => {
    try {
      console.log("Toggling 2FA:", !mockUser.twoFactorEnabled);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(
        mockUser.twoFactorEnabled
          ? "Autenticação 2FA desabilitada!"
          : "Autenticação 2FA habilitada!",
      );
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      alert("Erro ao alterar configuração 2FA. Tente novamente.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Configurações de Segurança
          </h1>
          <p className="text-text-secondary">
            Gerencie suas configurações de segurança e privacidade
          </p>
        </div>
      </div>

      {/* Security Status */}
      <motion.div
        className="bg-success text-text-inverse rounded-lg p-4 mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6" />
          <div>
            <div className="font-semibold text-lg">Conta Segura</div>
            <div className="text-sm opacity-90">
              Autenticação 2FA ativa • Última alteração de senha:{" "}
              {getTimeAgo(mockUser.lastPasswordChange)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-75">Último login</div>
          <div className="font-medium">
            {formatDateTime(mockUser.lastLogin)}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "password", label: "Senha", icon: Lock },
          { key: "two-factor", label: "Autenticação 2FA", icon: Smartphone },
          { key: "sessions", label: "Sessões Ativas", icon: Monitor },
          { key: "activity", label: "Atividade", icon: Clock },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "ghost"}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center"
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Alterar Senha
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    label="Senha Atual"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    error={errors.currentPassword}
                    required
                    icon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-9 text-text-tertiary hover:text-text-primary"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Nova Senha"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    error={errors.newPassword}
                    required
                    icon={Key}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-9 text-text-tertiary hover:text-text-primary"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar Nova Senha"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    error={errors.confirmPassword}
                    required
                    icon={Key}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-text-tertiary hover:text-text-primary"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.submit && (
                  <p className="text-sm text-error">{errors.submit}</p>
                )}

                <Button
                  onClick={handlePasswordSubmit}
                  loading={isSubmitting}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Alterando..." : "Alterar Senha"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Requisitos de Senha
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Pelo menos 1 letra maiúscula</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Pelo menos 1 número</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Pelo menos 1 símbolo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Histórico
                </h3>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-text-secondary">
                  <p>
                    <strong>Última alteração:</strong>
                  </p>
                  <p>{formatDateTime(mockUser.lastPasswordChange)}</p>
                  <p className="mt-2 text-text-tertiary">
                    Recomendamos alterar sua senha a cada 90 dias.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Two Factor Tab */}
      {activeTab === "two-factor" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Autenticação de Dois Fatores (2FA)
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      userSecurity.twoFactorEnabled
                        ? "bg-success text-text-inverse"
                        : "bg-background-tertiary"
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">
                      Autenticação por Aplicativo
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {userSecurity.twoFactorEnabled ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={userSecurity.twoFactorEnabled ? "danger" : "primary"}
                  onClick={handle2FAToggle}
                >
                  {userSecurity.twoFactorEnabled ? "Desabilitar" : "Habilitar"}
                </Button>
              </div>

              {userSecurity.twoFactorEnabled && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="font-medium text-success">2FA Ativo</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Sua conta está protegida com autenticação de dois fatores.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">
                  Códigos de Backup
                </h4>
                <p className="text-sm text-text-secondary">
                  Gere códigos de backup para usar caso perca acesso ao seu
                  dispositivo.
                </p>
                <Button variant="secondary">Gerar Códigos de Backup</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Como Configurar
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-text-inverse rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Baixe um aplicativo
                    </p>
                    <p className="text-text-secondary">
                      Google Authenticator, Authy ou similar
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-text-inverse rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Escaneie o QR Code
                    </p>
                    <p className="text-text-secondary">
                      Ou digite o código manualmente
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-text-inverse rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Digite o código
                    </p>
                    <p className="text-text-secondary">
                      Confirme com o código do app
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Sessões Ativas ({mockUser.activeSessions.length})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUser.activeSessions.map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.device);
                return (
                  <motion.div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          session.current
                            ? "bg-success text-text-inverse"
                            : "bg-background-tertiary"
                        }`}
                      >
                        <DeviceIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-text-primary">
                            {session.device}
                          </h3>
                          {session.current && (
                            <span className="px-2 py-1 bg-success text-text-inverse text-xs rounded-full">
                              Atual
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {session.location} • {session.ip}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          Última atividade: {getTimeAgo(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSessionToTerminate(session);
                          setShowTerminateModal(true);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Encerrar
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Atividade de Segurança
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUser.securityEvents.map((event, index) => {
                const EventIcon = getEventIcon(event.type);
                const eventColor = getEventColor(event.type);
                return (
                  <motion.div
                    key={event.id}
                    className="flex items-start space-x-4 p-4 bg-background-secondary rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center bg-background-tertiary`}
                    >
                      <EventIcon className={`w-4 h-4 ${eventColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-text-primary">
                          {event.description}
                        </h3>
                        <span className="text-sm text-text-tertiary">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        <p>
                          IP: {event.ip} • {event.device}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terminate Session Modal */}
      {showTerminateModal && sessionToTerminate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTerminateModal(false)}
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
                  Encerrar Sessão
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação encerrará a sessão imediatamente
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-text-secondary mb-2">
                <strong>Dispositivo:</strong> {sessionToTerminate.device}
              </p>
              <p className="text-text-secondary mb-2">
                <strong>Localização:</strong> {sessionToTerminate.location}
              </p>
              <p className="text-text-secondary">
                <strong>IP:</strong> {sessionToTerminate.ip}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowTerminateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleTerminateSession(sessionToTerminate.id)}
              >
                <X className="w-4 h-4 mr-2" />
                Encerrar Sessão
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
