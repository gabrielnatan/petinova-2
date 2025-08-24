"use client";
import Link from "next/link"
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/store";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    watch,
  } = useForm();

  const newPassword = watch("newPassword");

  const onSubmitProfile = async (data: any) => {
    try {
      console.log("Profile data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const onSubmitPassword = async (data: any) => {
    try {
      console.log("Password data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  return (
    <div className="p-6  mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/settings" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Meu Perfil</h1>
          <p className="text-text-secondary">
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações Pessoais
            </h2>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitProfile(onSubmitProfile)}
              className="space-y-4"
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2 w-20"
                    type="button"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Foto
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <Input
                    label="Nome Completo"
                    {...registerProfile("name", {
                      required: "Nome é obrigatório",
                    })}
                    error={profileErrors.name?.message as string}
                    placeholder="João Silva"
                  />

                  <Input
                    label="Email"
                    type="email"
                    {...registerProfile("email", {
                      required: "Email é obrigatório",
                    })}
                    error={profileErrors.email?.message as string}
                    placeholder="joao@email.com"
                    icon={Mail}
                  />

                  <div className="pt-2">
                    <Button type="submit" loading={isSubmittingProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Informações
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Alterar Senha
            </h2>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="space-y-4"
            >
              <div className="relative">
                <Input
                  label="Senha Atual"
                  type={showCurrentPassword ? "text" : "password"}
                  {...registerPassword("currentPassword", {
                    required: "Senha atual é obrigatória",
                  })}
                  error={passwordErrors.currentPassword?.message as string}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-text-tertiary hover:text-text-primary"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                  {...registerPassword("newPassword", {
                    required: "Nova senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "Senha deve ter pelo menos 6 caracteres",
                    },
                  })}
                  error={passwordErrors.newPassword?.message as string}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-text-tertiary hover:text-text-primary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                  {...registerPassword("confirmPassword", {
                    required: "Confirmação de senha é obrigatória",
                    validate: (value) =>
                      value === newPassword || "Senhas não coincidem",
                  })}
                  error={passwordErrors.confirmPassword?.message as string}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-text-tertiary hover:text-text-primary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={isSubmittingPassword}>
                  <Save className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Informações da Conta
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Função
                </label>
                <p className="text-text-primary">
                  {user?.role || "Não definido"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Status
                </label>
                <p
                  className={`${user?.active ? "text-success" : "text-error"}`}
                >
                  {user?.active ? "Ativo" : "Inativo"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Membro desde
                </label>
                <p className="text-text-primary">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("pt-BR")
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Última atualização
                </label>
                <p className="text-text-primary">
                  {user?.updated_at
                    ? new Date(user.updated_at).toLocaleDateString("pt-BR")
                    : "Nunca"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
