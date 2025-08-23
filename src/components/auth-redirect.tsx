"use client";

import { useEffect } from "react";
import { useAuth } from "@/store";
import { useRouter } from "next/navigation";

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
  redirectWhenAuthenticated?: boolean;
}

export function AuthRedirect({ 
  children, 
  redirectTo = "/dashboard",
  redirectWhenAuthenticated = true 
}: AuthRedirectProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (redirectWhenAuthenticated && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, redirectWhenAuthenticated, router]);

  // If should redirect and is authenticated, don't render children
  if (redirectWhenAuthenticated && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}