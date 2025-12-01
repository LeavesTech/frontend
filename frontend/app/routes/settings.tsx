import type { Route } from "./+types/settings";
import { Settings } from "../pages/Settings";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const meta: Route.MetaFunction = () => [
  { title: "Ayarlar" },
  { name: "description", content: "Kullanıcı ayarları ve şifre yönetimi" },
];

export default function SettingsRoute() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}

