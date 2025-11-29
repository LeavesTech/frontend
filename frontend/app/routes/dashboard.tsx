import type { Route } from "./+types/dashboard";
import { Dashboard } from "../pages/Dashboard";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard" },
  { name: "description", content: "JWT korumalı yönetim sayfası" },
];

export default function DashboardRoute() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
