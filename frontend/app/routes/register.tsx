import type { Route } from "./+types/register";
import { Register } from "../pages/Register";

export const meta: Route.MetaFunction = () => [
  { title: "Kayıt Ol" },
  { name: "description", content: "Yeni kullanıcı kaydı" },
];

export default function RegisterRoute() {
  return <Register />;
}
