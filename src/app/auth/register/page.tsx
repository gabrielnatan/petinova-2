"use client";
import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeStyles } from "@/components/theme-provider";
import { useAuth } from "@/store";
import { AuthRedirect } from "@/components/auth-redirect";
import Link from "next/link";
const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha obrigatória"),
    clinicName: z.string().min(2, "Nome da clínica obrigatório"),
    cnpj: z.string().min(14, "CNPJ inválido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });
type RegisterFormData = z.infer<typeof registerSchema>;
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const styles = useThemeStyles();
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const nextStep = async () => {
    const isValid = await trigger(["name", "email"]);
    if (isValid) {
      setStep(2);
    }
  };
  const prevStep = () => {
    setStep(1);
  };
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta');
      }
      // Login with returned data
      login(result.user, result.clinic);
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Registration error:", error);
      alert(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };
  // title="Criar Conta"
  //   subtitle="Cadastre sua clínica e comece a usar o Petinova"
  return (
    <AuthRedirect>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1
                ? "bg-primary-500 text-text-inverse"
                : "bg-background-secondary text-text-tertiary"
            }`}
          >
            1
          </div>
          <div
            className={`w-8 h-1 ${step >= 2 ? "bg-primary-500" : "bg-background-secondary"}`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2
                ? "bg-primary-500 text-text-inverse"
                : "bg-background-secondary text-text-tertiary"
            }`}
          >
            2
          </div>
        </div>
      </div>
      {/* Login Link */}
      <div className="text-center pt-4">
        <p className="text-sm text-text-secondary">
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200"
          >
            Faça login
          </Link>
        </p>
      </div>
    </form>
    </AuthRedirect>
  );
}
