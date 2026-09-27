import { AuthService } from "@src/services/auth";
import { CartService } from "@src/services/cart";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

export function RequireAuth({ children }: { children: ReactNode }) {
  const authApi = AuthService.getInstance();

  if (!authApi.getToken()) {
    authApi.clearSession();
    CartService.getInstance().clearCart();
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
