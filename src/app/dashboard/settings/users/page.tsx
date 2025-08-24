"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  User as UserIcon,
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
  Key,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userAPI, type User } from "@/lib/api/users";
import Link from "next/link";

const roleLabels = {
  ADMIN: 'Administrador',
  VETERINARIAN: 'Veterinário',
  RECEPTIONIST: 'Recepcionista'
};

const roleIcons = {
  ADMIN: Crown,
  VETERINARIAN: UserCheck,
  RECEPTIONIST: UserIcon
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPhone = (phone: string | undefined) => {
  if (!phone) return '-';
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 24) return `${hours}h atrás`;
  return `${days} dias atrás`;
};

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "RECEPTIONIST" as 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST',
    password: "",
    confirmPassword: "",
    isActive: true
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';

      const response = await userAPI.getUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'role') setRoleFilter(value);
    if (filter === 'status') setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUserFormChange = (field: string, value: any) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateUserForm = () => {
    const newErrors: Record<string, string> = {};

    if (!userForm.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!userForm.email.trim()) newErrors.email = "Email é obrigatório";

    if (!editingUser) {
      if (!userForm.password) newErrors.password = "Senha é obrigatória";
      if (userForm.password !== userForm.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    if (userForm.email && !userAPI.validateEmail(userForm.email)) {
      newErrors.email = "Email inválido";
    }

    if (userForm.password) {
      const passwordValidation = userAPI.validatePassword(userForm.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateUserForm()) return;

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.user_id, {
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          role: userForm.role,
          isActive: userForm.isActive
        });
      } else {
        await userAPI.createUser({
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          role: userForm.role,
          password: userForm.password,
          isActive: userForm.isActive,
          permissions: userAPI.generateDefaultPermissions(userForm.role),
          preferences: userAPI.generateDefaultPreferences()
        });
      }

      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({
        name: "",
        email: "",
        phone: "",
        role: "RECEPTIONIST",
        password: "",
        confirmPassword: "",
        isActive: true
      });
      loadUsers();
    } catch (error) {
      console.error("Error submitting user:", error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      password: "",
      confirmPassword: "",
      isActive: user.isActive
    });
    setShowUserModal(true);
    setShowUserMenu(null);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await userAPI.deleteUser(userToDelete.user_id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir usuário');
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await userAPI.toggleUserStatus(user.user_id, !user.isActive);
      setShowUserMenu(null);
      loadUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      setError(error instanceof Error ? error.message : 'Erro ao alterar status');
    }
  };

  const handlePasswordReset = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: "Senhas não coincidem" });
      return;
    }

    const passwordValidation = userAPI.validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      setErrors({ newPassword: passwordValidation.errors[0] });
      return;
    }

    if (!userToResetPassword) return;

    try {
      await userAPI.resetPassword(userToResetPassword.user_id, {
        newPassword: passwordForm.newPassword
      });
      setShowPasswordModal(false);
      setUserToResetPassword(null);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error instanceof Error ? error.message : 'Erro ao resetar senha');
    }
  };

  // Stats
  const totalUsers = pagination.total;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;
  const vetUsers = users.filter(u => u.role === 'VETERINARIAN').length;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/settings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
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

      {/* Error State */}
      {error && (
        <Card className="border-error mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-error">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-3"
              onClick={loadUsers}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          {
            label: "Total de Usuários",
            value: totalUsers,
            icon: Users,
            color: "primary",
          },
          {
            label: "Usuários Ativos",
            value: activeUsers,
            icon: CheckCircle,
            color: "success",
          },
          {
            label: "Administradores",
            value: adminUsers,
            icon: Crown,
            color: "warning",
          },
          {
            label: "Veterinários",
            value: vetUsers,
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
                  <stat.icon className="w-8 h-8 text-primary-500" />
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
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                icon={Search}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
            >
              <option value="all">Todas as funções</option>
              <option value="ADMIN">Administrador</option>
              <option value="VETERINARIAN">Veterinário</option>
              <option value="RECEPTIONIST">Recepcionista</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">
            Usuários ({users.length})
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-text-secondary mt-2">Carregando usuários...</p>
            </div>
          ) : (
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
                  {users.map((user, index) => {
                    const RoleIcon = roleIcons[user.role];

                    return (
                      <motion.tr
                        key={user.user_id}
                        className="border-t border-border hover:bg-background-secondary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-primary-600" />
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
                            <RoleIcon className="w-4 h-4 text-primary-600" />
                            <span className="text-text-primary">
                              {roleLabels[user.role]}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {user.isActive ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-error" />
                            )}
                            <span
                              className={`text-sm font-medium ${user.isActive ? 'text-success' : 'text-error'}`}
                            >
                              {user.isActive ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {user.lastLoginAt ? (
                            <div>
                              <div className="text-sm text-text-primary">
                                {formatDateTime(user.lastLoginAt)}
                              </div>
                              <div className="text-sm text-text-tertiary">
                                {getTimeAgo(user.lastLoginAt)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-text-tertiary">Nunca</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-text-primary">
                            {formatDateTime(user.created_at)}
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
                                    showUserMenu === user.user_id ? null : user.user_id,
                                  )
                                }
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>

                              {showUserMenu === user.user_id && (
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
                                    onClick={() => {
                                      setUserToResetPassword(user);
                                      setShowPasswordModal(true);
                                      setShowUserMenu(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                                  >
                                    <Key className="w-4 h-4 mr-2" />
                                    Resetar Senha
                                  </button>
                                  <button
                                    onClick={() => handleStatusToggle(user)}
                                    className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                                  >
                                    {user.isActive ? (
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-text-secondary">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} usuários
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-text-secondary">
              Página {pagination.page} de {pagination.pages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

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
                  icon={UserIcon}
                />

                <Input
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => handleUserFormChange("email", e.target.value)}
                  error={errors.email}
                  required
                  icon={Mail}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={userForm.phone}
                  onChange={(e) => handleUserFormChange("phone", e.target.value)}
                  error={errors.phone}
                  icon={Phone}
                />

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Função <span className="text-error">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => handleUserFormChange("role", e.target.value)}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                  >
                    <option value="RECEPTIONIST">Recepcionista</option>
                    <option value="VETERINARIAN">Veterinário</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userForm.isActive}
                    onChange={(e) => handleUserFormChange("isActive", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-text-primary">Usuário ativo</span>
                </label>
              </div>

              {!editingUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Senha"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => handleUserFormChange("password", e.target.value)}
                    error={errors.password}
                    required
                  />

                  <Input
                    label="Confirmar Senha"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={(e) => handleUserFormChange("confirmPassword", e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />
                </div>
              )}
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
                  {editingUser ? "Atualizar" : "Criar Usuário"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && userToResetPassword && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Resetar Senha
                </h3>
                <p className="text-sm text-text-secondary">
                  {userToResetPassword.name}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <Input
                label="Nova Senha"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                error={errors.newPassword}
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handlePasswordReset}>
                <Key className="w-4 h-4 mr-2" />
                Resetar Senha
              </Button>
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

      {!loading && users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || roleFilter !== "all" || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece criando o primeiro usuário"}
          </p>
          <Button onClick={() => setShowUserModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      )}
    </div>
  );
}