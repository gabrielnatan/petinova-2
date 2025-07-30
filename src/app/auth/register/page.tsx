//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful registration
      const mockUser = {
        user_id: "1",
        name: data.name,
        email: data.email,
        role: "admin",
        active: true,
        clinic_id: "1",
        created_at: new Date(),
      };

      const mockClinic = {
        clinic_id: "1",
        legalName: data.clinicName,
        tradeName: data.clinicName,
        cnpj: data.cnpj,
        email: data.email,
        address: "Endereço a ser preenchido",
        isActive: true,
        created_at: new Date(),
      };

      login(mockUser, mockClinic);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // title="Criar Conta"
  //   subtitle="Cadastre sua clínica e comece a usar o Petinova"
  return (
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

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-tertiary" />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  className={`${styles.input} pl-10 w-full`}
                  placeholder="Dr. João Silva"
                />
              </div>
              {errors.name && (
                <motion.p
                  className="mt-1 text-sm text-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-tertiary" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className={`${styles.input} pl-10 w-full`}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  className="mt-1 text-sm text-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Next Button */}
            <motion.button
              type="button"
              onClick={nextStep}
              className={`w-full ${styles.buttonPrimary} flex items-center justify-center space-x-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Clinic Name Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nome da Clínica
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-text-tertiary" />
                </div>
                <input
                  {...register("clinicName")}
                  type="text"
                  className={`${styles.input} pl-10 w-full`}
                  placeholder="Clínica Veterinária São Bento"
                />
              </div>
              {errors.clinicName && (
                <motion.p
                  className="mt-1 text-sm text-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.clinicName.message}
                </motion.p>
              )}
            </div>

            {/* CNPJ Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                CNPJ
              </label>
              <input
                {...register("cnpj")}
                type="text"
                className={`${styles.input} w-full`}
                placeholder="12.345.678/0001-90"
              />
              {errors.cnpj && (
                <motion.p
                  className="mt-1 text-sm text-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.cnpj.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-tertiary" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} pl-10 pr-10 w-full`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-tertiary" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-tertiary" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className="mt-1 text-sm text-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-tertiary" />
                </div>
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${styles.input} pl-10 pr-10 w-full`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-text-tertiary" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-tertiary" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  className="mt-1 text-sm text-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 border-border rounded focus:ring-primary-500 mt-0.5"
              />
              <label className="ml-2 text-sm text-text-secondary">
                Concordo com os{" "}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Termos de Serviço
                </Link>{" "}
                e{" "}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Política de Privacidade
                </Link>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                type="button"
                onClick={prevStep}
                className={`flex-1 ${styles.buttonSecondary}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Voltar
              </motion.button>

              <motion.button
                type="submit"
                disabled={isLoading}
                className={`flex-1 ${styles.buttonPrimary} flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Criar Conta</span>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
  );
}
