import type { FormEvent } from "react";
import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { resetPasswordFinish } from "../api/authService";

/**
 * Page to finalize password reset using key and new password.
 */
export function ResetPasswordFinish() {
  const [searchParams] = useSearchParams();
  const [key, setKey] = useState(searchParams.get("key") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordFinish(key, password);
      setMessage("Şifreniz başarıyla güncellendi. Artık giriş yapabilirsiniz.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      setError("Sıfırlama anahtarı geçersiz veya işlem tamamlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--blue">
      <div className="auth-card auth-card-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Yeni Şifre Belirle</h1>
          <p className="text-slate-500 text-sm mt-2">
            E-posta ile iletilen anahtarı ve yeni şifrenizi girin.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Sıfırlama Anahtarı</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="text-input"
              placeholder="E-postadaki anahtar"
              required
            />
          </div>

          <div>
            <label className="form-label">Yeni Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="text-input"
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
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-slate-600">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}
