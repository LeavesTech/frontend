import type { FormEvent } from "react";
import { useState } from "react";
import { resetPasswordInit } from "../api/authService";

/**
 * Page to request password reset mail.
 */
export function ResetPasswordInit() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPasswordInit(email);
      setMessage("Eğer e-posta sistemde kayıtlı ise bir sıfırlama bağlantısı gönderildi.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--blue">
      <div className="auth-card auth-card-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Şifre Sıfırlama</h1>
          <p className="text-slate-500 text-sm mt-2">
            E-posta adresinizi girin, kayıtlıysa sıfırlama linki gönderilecektir.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-input"
              placeholder="ornek@firma.com"
              required
            />
          </div>

          {error && <p className="error-banner">{error}</p>}
          {message && (
            <p className="success-banner">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading && (
              <span className="button-spinner"></span>
            )}
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
