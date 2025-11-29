import type { Route } from "./+types/reset-password.finish";
import { ResetPasswordFinish } from "../pages/ResetPasswordFinish";

export const meta: Route.MetaFunction = () => [
  { title: "Şifreyi Güncelle" },
  { name: "description", content: "Sıfırlama anahtarı ile şifreyi tamamla" },
];

export default function ResetPasswordFinishRoute() {
  return <ResetPasswordFinish />;
}
