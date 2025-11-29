import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { activateAccount } from "../api/authService";

/**
 * Activation screen that accepts ?key=... and calls /api/activate.
 */
export function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const key = searchParams.get("key");
    if (!key) return;

    const runActivation = async () => {
      setStatus("loading");
      setMessage("");
      try {
        await activateAccount(key);
        setStatus("success");
        setMessage("Hesabınız aktive edildi! Şimdi giriş yapabilirsiniz.");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Aktivasyon anahtarı geçersiz veya süresi dolmuş.");
      }
    };

    runActivation();
  }, [searchParams]);

  return (
    <div className="auth-page auth-page--emerald">
      <div className="auth-card auth-card-xl text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hesap Aktivasyonu</h1>
        <p className="text-slate-500 text-sm mt-2">
          Aktivasyon bağlantınızdaki anahtar doğrulanacaktır.
        </p>

        <div className="mt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <span className="h-8 w-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></span>
              <p className="text-slate-600">Hesabınız etkinleştiriliyor...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <p className="success-banner">{message}</p>
              <Link to="/login" className="primary-button primary-button-inline inline-flex">
                Giriş Yap
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <p className="error-banner">{message}</p>
              <p className="text-sm text-slate-500">Yeni bir aktivasyon e-postası talep etmek için lütfen kayıt olun.</p>
            </div>
          )}

          {status === "idle" && (
            <p className="text-slate-500 text-sm">Aktivasyon anahtarını içeren bağlantıya tıklayarak bu sayfayı açın.</p>
          )}
        </div>
      </div>
    </div>
  );
}
