import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { getToken } from "../api/authService";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Simple client-side guard that redirects to /login when JWT is missing.
 * Dashboard and other private screens can wrap their content with this.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const token = typeof window !== "undefined" ? getToken() : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
