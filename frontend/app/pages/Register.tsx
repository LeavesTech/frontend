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
    <div className="auth-page auth-page--indigo">
      <div className="auth-card auth-card-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Yeni Hesap Oluştur</h1>
          <p className="text-slate-500 text-sm mt-2">
            Aktivasyon e-postası kayıt sonrası otomatik gönderilecektir.
          </p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="form-label">Kullanıcı Adı</label>
            <input
              type="text"
              value={form.login}
              onChange={(e) => handleChange("login", e.target.value)}
              className="text-input"
              placeholder="jhipster"
              required
            />
          </div>

          <div>
            <label className="form-label">Ad</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="text-input"
              placeholder="Jane"
            />
          </div>

          <div>
            <label className="form-label">Soyad</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="text-input"
              placeholder="Doe"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="text-input"
              placeholder="ornek@firma.com"
              required
            />
          </div>

          <div>
            <label className="form-label">Şifre</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="text-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Şifre (Tekrar)</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="text-input"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Dil</label>
            <select
              value={form.langKey}
              onChange={(e) => handleChange("langKey", e.target.value)}
              className="text-input"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          {error && (
            <div className="md:col-span-2 error-banner">{error}</div>
          )}

          {success && (
            <div className="md:col-span-2 success-banner">
              {success}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="primary-button"
            >
              {loading && (
                <span className="button-spinner"></span>
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
