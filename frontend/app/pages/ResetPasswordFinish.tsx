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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Yeni Şifre Belirle</h1>
          <p className="text-slate-500 text-sm mt-2">
            E-posta ile iletilen anahtarı ve yeni şifrenizi girin.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Sıfırlama Anahtarı</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="E-postadaki anahtar"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Yeni Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
          {message && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
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
