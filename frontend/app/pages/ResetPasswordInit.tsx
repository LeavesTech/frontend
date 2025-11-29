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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Şifre Sıfırlama</h1>
          <p className="text-slate-500 text-sm mt-2">
            E-posta adresinizi girin, kayıtlıysa sıfırlama linki gönderilecektir.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ornek@firma.com"
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
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
