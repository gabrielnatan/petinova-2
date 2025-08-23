//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeStyles } from "@/components/theme-provider";
import { useAuth } from "@/store";
import { AuthRedirect } from "@/components/auth-redirect";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const styles = useThemeStyles();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer login');
      }

      // Login with returned data
      login(result.user, result.clinic);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setError("email", { 
        message: error instanceof Error ? error.message : "Credenciais inválidas" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  //         title="Entrar"
  //   subtitle="Acesse sua conta para gerenciar sua clínica"

  return (
    <AuthRedirect>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 border-border rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-text-secondary">Lembrar-me</span>
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200"
        >
          Esqueceu a senha?
        </Link>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className={`w-full ${styles.buttonPrimary} flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* Register Link */}
      <div className="text-center pt-4">
        <p className="text-sm text-text-secondary">
          Não tem uma conta?{" "}
          <Link
            href="/auth/register"
            className="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </form>
    </AuthRedirect>
  );
}
