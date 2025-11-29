import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { register } from "../api/authService";

/**
 * Registration form that calls /api/register and shows activation hint.
 */
export function Register() {
  const [form, setForm] = useState({
    login: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    langKey: "tr",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      await register({
        login: form.login,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        langKey: form.langKey,
      });
      setSuccess(
        "Kayıt başarılı! Lütfen e-posta kutunuzu kontrol edin ve aktivasyon linkine tıklayın."
      );
      setForm({ ...form, password: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setError("Kayıt sırasında bir hata oluştu. Lütfen bilgileri kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Yeni Hesap Oluştur</h1>
          <p className="text-slate-500 text-sm mt-2">
            Aktivasyon e-postası kayıt sonrası otomatik gönderilecektir.
          </p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Kullanıcı Adı</label>
            <input
              type="text"
              value={form.login}
              onChange={(e) => handleChange("login", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="jhipster"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ad</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Jane"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Soyad</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Doe"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ornek@firma.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Şifre</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Şifre (Tekrar)</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Dil</label>
            <select
              value={form.langKey}
              onChange={(e) => handleChange("langKey", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          {error && (
            <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>
          )}

          {success && (
            <div className="md:col-span-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
              {success}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
              )}
              {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-center text-slate-600">
          Zaten hesabınız var mı? {" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}
