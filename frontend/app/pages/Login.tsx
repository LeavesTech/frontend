import type { FormEvent } from "react";
import { useState } from "react";
import type { Location } from "react-router";
import { useNavigate, useLocation, Link } from "react-router";
import { login } from "../api/authService";

/**
 * Login form that authenticates against /api/authenticate and stores JWT.
 */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      const redirectTo = (location.state as { from?: Location })?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setError("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--indigo">
      <div className="auth-card auth-card-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">LeavesTech Hesabınıza Giriş Yapın</h1>
          <p className="text-slate-500 text-sm mt-2">
            Hoş geldiniz! Devam etmek için kullanıcı adınızı ve şifrenizi girin.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-input"
              placeholder="jhipster"
              required
            />
          </div>

          <div>
            <label className="form-label">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="error-banner">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading && (
              <span className="button-spinner"></span>
            )}
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-center text-slate-600">
          <Link to="/reset-password" className="text-indigo-600 hover:underline">
            Şifremi Unuttum
          </Link>
          <p>
            Hesabınız yok mu? {" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
