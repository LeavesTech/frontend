import { redirect } from "react-router";
import type { Route } from "./+types/_index";

// Redirect root path to the login screen.
export async function loader() {
  return redirect("/login");
}

export const meta: Route.MetaFunction = () => [
  { title: "LeavesTech Auth" },
  { name: "description", content: "Kullanıcı giriş ve kayıt ekranı" },
];

export default function Index() {
  return null;
}
