import type { Route } from "./+types/activate";
import { ActivateAccount } from "../pages/ActivateAccount";

export const meta: Route.MetaFunction = () => [
  { title: "Hesap Aktivasyonu" },
  { name: "description", content: "E-posta aktivasyon onayı" },
];

export default function ActivateRoute() {
  return <ActivateAccount />;
}
