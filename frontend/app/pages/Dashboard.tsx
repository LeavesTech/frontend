import { useEffect, useState } from "react";
import { changePassword, clearToken, getAccount } from "../api/authService";
import { useNavigate } from "react-router";

interface Account {
  firstName?: string;
  lastName?: string;
  email?: string;
  login?: string;
  langKey?: string;
  imageUrl?: string;
}

/**
 * Protected dashboard that fetches the current account and allows password change.
 */
export function Dashboard() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [pwdMessage, setPwdMessage] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await getAccount();
        setAccount(data);
      } catch (err) {
        console.error(err);
        setError("Hesap bilgileri alınamadı. Lütfen tekrar giriş yapın.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage("");
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      setPwdMessage("Şifreniz başarıyla değiştirildi.");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      setPwdMessage("Şifre değiştirme başarısız oldu.");
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">JWT korumalı alan. Mevcut kullanıcı bilgileri aşağıda listelenir.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            >
              Çıkış Yap
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Hesap Bilgileri</h2>
            {loading ? (
              <div className="flex items-center gap-3 text-slate-600">
                <span className="h-6 w-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></span>
                Yükleniyor...
              </div>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <div className="space-y-2 text-slate-700">
                <p>
                  <span className="font-medium">Kullanıcı Adı:</span> {account?.login}
                </p>
                <p>
                  <span className="font-medium">Ad Soyad:</span> {account?.firstName} {account?.lastName}
                </p>
                <p>
                  <span className="font-medium">E-posta:</span> {account?.email}
                </p>
                <p>
                  <span className="font-medium">Dil:</span> {account?.langKey}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Şifre Değiştir</h2>
            <form className="space-y-3" onSubmit={handlePasswordChange}>
              <div>
                <label className="form-label">Mevcut Şifre</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="text-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Yeni Şifre</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="text-input"
                  required
                />
              </div>

              {pwdMessage && <p className="neutral-banner">{pwdMessage}</p>}

              <button
                type="submit"
                className="primary-button"
              >
                Güncelle
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
