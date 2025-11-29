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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">LeavesTech Hesabınıza Giriş Yapın</h1>
          <p className="text-slate-500 text-sm mt-2">
            Hoş geldiniz! Devam etmek için kullanıcı adınızı ve şifrenizi girin.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="jhipster"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
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
