import type { Route } from "./+types/login";
import { Login } from "../pages/Login";

export const meta: Route.MetaFunction = () => [
  { title: "Giriş" },
  { name: "description", content: "JHipster backend ile JWT giriş" },
];

export default function LoginRoute() {
  return <Login />;
}
