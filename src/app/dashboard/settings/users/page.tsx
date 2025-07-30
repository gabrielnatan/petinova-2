//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Users,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  UserCheck,
  UserX,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock data
const mockUsers = [
  {
    id: "1",
    name: "Dr. João Silva",
    email: "joao.silva@clinica.com",
    role: "admin",
    status: "active",
    phone: "11999999999",
    lastLogin: new Date("2025-01-28T08:30:00"),
    createdAt: new Date("2024-01-15"),
    permissions: ["read", "write", "delete", "admin"],
    avatar: null,
    veterinarianId: "vet_1",
    guardianId: null,
  },
  {
    id: "2",
    name: "Dra. Maria Santos",
    email: "maria.santos@clinica.com",
    role: "veterinarian",
    status: "active",
    phone: "11888888888",
    lastLogin: new Date("2025-01-28T07:15:00"),
    createdAt: new Date("2024-02-20"),
    permissions: ["read", "write"],
    avatar: null,
    veterinarianId: "vet_2",
    guardianId: null,
  },
  {
    id: "3",
    name: "Carlos Mendes",
    email: "carlos@email.com",
    role: "client",
    status: "active",
    phone: "11777777777",
    lastLogin: new Date("2025-01-27T19:45:00"),
    createdAt: new Date("2024-03-10"),
    permissions: ["read"],
    avatar: null,
    veterinarianId: null,
    guardianId: "guard_1",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana.oliveira@clinica.com",
    role: "receptionist",
    status: "active",
    phone: "11666666666",
    lastLogin: new Date("2025-01-28T09:00:00"),
    createdAt: new Date("2024-04-05"),
    permissions: ["read", "write"],
    avatar: null,
    veterinarianId: null,
    guardianId: null,
  },
  {
    id: "5",
    name: "Pedro Costa",
    email: "pedro@email.com",
    role: "client",
    status: "inactive",
    phone: "11555555555",
    lastLogin: new Date("2024-12-15T14:20:00"),
    createdAt: new Date("2024-05-18"),
    permissions: ["read"],
    avatar: null,
    veterinarianId: null,
    guardianId: "guard_2",
  },
];

const roles = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total ao sistema",
    icon: Crown,
    color: "primary",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "veterinarian",
    name: "Veterinário",
    description: "Acesso a consultas e prontuários",
    icon: UserCheck,
    color: "secondary",
    permissions: ["read", "write"],
  },
  {
    id: "receptionist",
    name: "Recepcionista",
    description: "Agendamentos e cadastros básicos",
    icon: User,
    color: "accent",
    permissions: ["read", "write"],
  },
  {
    id: "client",
    name: "Cliente",
    description: "Acesso limitado aos próprios dados",
    icon: Users,
    color: "neutral",
    permissions: ["read"],
  },
];

const permissions = [
  { id: "read", name: "Visualizar", description: "Pode ver informações" },
  { id: "write", name: "Editar", description: "Pode criar e editar" },
  { id: "delete", name: "Excluir", description: "Pode excluir registros" },
  {
    id: "admin",
    name: "Administrar",
    description: "Acesso administrativo completo",
  },
];

const formatDateTime = (date) => {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPhone = (phone) => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const getTimeAgo = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 24) return `${hours}h atrás`;
  return `${days} dias atrás`;
};

const getRoleInfo = (roleId) => {
  return roles.find((role) => role.id === roleId) || roles[3];
};

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "text-success";
    case "inactive":
      return "text-error";
    case "pending":
      return "text-warning";
    default:
      return "text-text-tertiary";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return CheckCircle;
    case "inactive":
      return XCircle;
    case "pending":
      return AlertTriangle;
    default:
      return User;
  }
};

export default function UsersSettingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "client",
    status: "active",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter users
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserFormChange = (field, value) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateUserForm = () => {
    const newErrors = {};

    if (!userForm.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!userForm.email.trim()) newErrors.email = "Email é obrigatório";
    if (!userForm.phone.trim()) newErrors.phone = "Telefone é obrigatório";

    if (!editingUser) {
      if (!userForm.password) newErrors.password = "Senha é obrigatória";
      if (userForm.password !== userForm.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userForm.email && !emailRegex.test(userForm.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateUserForm()) return;

    setIsSubmitting(true);
    try {
      console.log(editingUser ? "Updating user:" : "Creating user:", userForm);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(
        editingUser
          ? "Usuário atualizado com sucesso!"
          : "Usuário criado com sucesso!",
      );
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({
        name: "",
        email: "",
        phone: "",
        role: "client",
        status: "active",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error submitting user:", error);
      alert("Erro ao salvar usuário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      password: "",
      confirmPassword: "",
    });
    setShowUserModal(true);
    setShowUserMenu(null);
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting user:", userToDelete.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Usuário excluído com sucesso!");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erro ao excluir usuário. Tente novamente.");
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      console.log("Toggling user status:", user.id, newStatus);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(
        `Usuário ${newStatus === "active" ? "ativado" : "desativado"} com sucesso!`,
      );
      setShowUserMenu(null);
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Erro ao alterar status. Tente novamente.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Gerenciar Usuários
            </h1>
            <p className="text-text-secondary">
              Gerencie usuários e suas permissões no sistema
            </p>
          </div>
        </div>

        <Button onClick={() => setShowUserModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          {
            label: "Total de Usuários",
            value: mockUsers.length,
            icon: Users,
            color: "primary",
          },
          {
            label: "Usuários Ativos",
            value: mockUsers.filter((u) => u.status === "active").length,
            icon: CheckCircle,
            color: "success",
          },
          {
            label: "Administradores",
            value: mockUsers.filter((u) => u.role === "admin").length,
            icon: Crown,
            color: "warning",
          },
          {
            label: "Veterinários",
            value: mockUsers.filter((u) => u.role === "veterinarian").length,
            icon: UserCheck,
            color: "info",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                />
              </div>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
            >
              <option value="all">Todas as funções</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">
            Usuários ({filteredUsers.length})
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-text-secondary">
                    Usuário
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-text-secondary">
                    Função
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-text-secondary">
                    Último Login
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-text-secondary">
                    Criado em
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-text-secondary">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const roleInfo = getRoleInfo(user.role);
                  const StatusIcon = getStatusIcon(user.status);
                  const statusColor = getStatusColor(user.status);

                  return (
                    <motion.tr
                      key={user.id}
                      className="border-t border-border hover:bg-background-secondary"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">
                              {user.name}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {user.email}
                            </div>
                            <div className="text-sm text-text-tertiary">
                              {formatPhone(user.phone)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <roleInfo.icon
                            className={`w-4 h-4 text-${roleInfo.color}-600`}
                          />
                          <span className="text-text-primary">
                            {roleInfo.name}
                          </span>
                        </div>
                        <div className="text-sm text-text-secondary">
                          {roleInfo.description}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                          <span
                            className={`text-sm font-medium ${statusColor}`}
                          >
                            {user.status === "active"
                              ? "Ativo"
                              : user.status === "inactive"
                                ? "Inativo"
                                : "Pendente"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-text-primary">
                          {formatDateTime(user.lastLogin)}
                        </div>
                        <div className="text-sm text-text-tertiary">
                          {getTimeAgo(user.lastLogin)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-text-primary">
                          {formatDateTime(user.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setShowUserMenu(
                                  showUserMenu === user.id ? null : user.id,
                                )
                              }
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>

                            {showUserMenu === user.id && (
                              <motion.div
                                className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[180px]"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                              >
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleStatusToggle(user)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                                >
                                  {user.status === "active" ? (
                                    <>
                                      <UserX className="w-4 h-4 mr-2" />
                                      Desativar
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Ativar
                                    </>
                                  )}
                                </button>
                                <hr className="my-1 border-border" />
                                <button
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setShowDeleteModal(true);
                                    setShowUserMenu(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-background-secondary"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Modal */}
      {showUserModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUserModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  {editingUser ? "Editar Usuário" : "Novo Usuário"}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  value={userForm.name}
                  onChange={(e) => handleUserFormChange("name", e.target.value)}
                  error={errors.name}
                  required
                  icon={User}
                />

                <Input
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    handleUserFormChange("email", e.target.value)
                  }
                  error={errors.email}
                  required
                  icon={Mail}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={userForm.phone}
                  onChange={(e) =>
                    handleUserFormChange("phone", e.target.value)
                  }
                  error={errors.phone}
                  required
                  icon={Phone}
                />

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Função <span className="text-error">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      handleUserFormChange("role", e.target.value)
                    }
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Status
                </label>
                <select
                  value={userForm.status}
                  onChange={(e) =>
                    handleUserFormChange("status", e.target.value)
                  }
                  className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>

              {!editingUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Senha"
                    type="password"
                    value={userForm.password}
                    onChange={(e) =>
                      handleUserFormChange("password", e.target.value)
                    }
                    error={errors.password}
                    required
                  />

                  <Input
                    label="Confirmar Senha"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={(e) =>
                      handleUserFormChange("confirmPassword", e.target.value)
                    }
                    error={errors.confirmPassword}
                    required
                  />
                </div>
              )}

              {/* Permissions Preview */}
              <div className="bg-background-secondary rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-3">
                  Permissões da Função
                </h4>
                <div className="space-y-2">
                  {permissions.map((permission) => {
                    const roleInfo = getRoleInfo(userForm.role);
                    const hasPermission = roleInfo.permissions.includes(
                      permission.id,
                    );
                    return (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-3"
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            hasPermission
                              ? "bg-primary-500 border-primary-500"
                              : "border-border"
                          }`}
                        >
                          {hasPermission && (
                            <CheckCircle className="w-3 h-3 text-text-inverse" />
                          )}
                        </div>
                        <div>
                          <span
                            className={`text-sm font-medium ${hasPermission ? "text-text-primary" : "text-text-tertiary"}`}
                          >
                            {permission.name}
                          </span>
                          <p className="text-xs text-text-secondary">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} loading={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting
                    ? "Salvando..."
                    : editingUser
                      ? "Atualizar"
                      : "Criar Usuário"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
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
                  Excluir Usuário
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir permanentemente o usuário{" "}
              <strong>{userToDelete.name}</strong>? Todos os dados associados
              serão perdidos.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button variant="error" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
