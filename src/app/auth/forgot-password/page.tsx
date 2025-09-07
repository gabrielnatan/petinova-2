"use client";
import { useThemeStyles } from "@/components/theme-provider";
import { AuthRedirect } from "@/components/auth-redirect";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const styles = useThemeStyles();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({
        email: z.string().email("Email inválido"),
      }),
    ),
  });

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setEmailSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //  title="Email Enviado"
  //     subtitle="Verifique sua caixa de entrada"
  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div
          className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto"
        >
          <Mail className="w-8 h-8 text-white" />
        </div>

        <div>
          <p className="text-text-primary mb-2">
            Enviamos um link de recuperação para seu email.
          </p>
          <p className="text-sm text-text-secondary">
            Verifique também sua pasta de spam.
          </p>
        </div>

        <a
          href="/auth/login"
          className={`inline-block ${styles.buttonPrimary} mt-4`}
        >
          Voltar ao Login
        </a>
      </div>
    );
  }
  //  title="Esqueceu sua Senha?"
  //   subtitle="Digite seu email para receber um link de recuperação"
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
          <p
            className="mt-1 text-sm text-error"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full ${styles.buttonPrimary} flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Enviar Link</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Back to Login Link */}
      <div className="text-center pt-4">
        <Link
          href="/auth/login"
          className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200"
        >
          ← Voltar ao Login
        </Link>
      </div>
    </form>
    </AuthRedirect>
  );
}
