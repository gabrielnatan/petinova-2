"use client";
import React from "react";
import { Heart } from "lucide-react";
import { useThemeStyles } from "@/components/theme-provider";
interface LayoutProps {
  children: React.ReactNode;
}
export default function AuthLayout({ children }: LayoutProps) {
  const styles = useThemeStyles();
  return (
    <div
      className={`min-h-screen ${styles.background} flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-text-inverse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Petinova</h1>
          <p className="text-text-tertiary">Sistema de Gestão Veterinária</p>
        </div>
        {/* Auth Card */}
        <div
          className={`${styles.card} p-8`}
        >
          {children}
        </div>
        {/* Footer */}
        <div
          className="text-center mt-6"
        >
          <p className="text-xs text-text-tertiary">
            © 2025 Petinova. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
