import type { Route } from "./+types/reset-password";
import { ResetPasswordInit } from "../pages/ResetPasswordInit";

export const meta: Route.MetaFunction = () => [
  { title: "Şifre Sıfırlama" },
  { name: "description", content: "E-posta ile şifre sıfırlama" },
];

export default function ResetPasswordRoute() {
  return <ResetPasswordInit />;
}
