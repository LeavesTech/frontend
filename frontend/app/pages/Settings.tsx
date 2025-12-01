import { useEffect, useState } from "react";
import { changePassword, getAccount, updateAccount } from "../api/authService";

interface Account {
  firstName?: string;
  lastName?: string;
  email?: string;
  login?: string;
  langKey?: string;
  imageUrl?: string;
}

export function Settings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<Account>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [pwdMessage, setPwdMessage] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await getAccount();
        setAccount(data);
        setProfile({
          firstName: data?.firstName,
          lastName: data?.lastName,
          email: data?.email,
          langKey: data?.langKey,
          imageUrl: data?.imageUrl,
        });
      } catch (err) {
        setError("Hesap bilgileri alınamadı. Lütfen tekrar giriş yapın.");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    setSavingProfile(true);
    try {
      await updateAccount(profile);
      setProfileMessage("Profil bilgileriniz güncellendi.");
    } catch (err) {
      setProfileMessage("Profil güncelleme başarısız oldu.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage("");
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      setPwdMessage("Şifreniz başarıyla değiştirildi.");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwdMessage("Şifre değiştirme başarısız oldu.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
          <p className="text-sm text-slate-600">Hesap bilgileri ve şifre yönetimi</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Profil Bilgileri</h2>
                  <p className="text-sm text-slate-500">Ad, e-posta ve dil ayarı</p>
                </div>
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" aria-hidden />
                ) : (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{account?.login}</span>
                )}
              </div>

              <form className="space-y-3" onSubmit={handleProfileSave}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="form-label">Ad</label>
                    <input
                      className="text-input"
                      value={profile.firstName || ""}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Soyad</label>
                    <input
                      className="text-input"
                      value={profile.lastName || ""}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">E-posta</label>
                  <input
                    type="email"
                    className="text-input"
                    value={profile.email || ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Dil</label>
                  <input
                    className="text-input"
                    value={profile.langKey || ""}
                    onChange={(e) => setProfile({ ...profile, langKey: e.target.value })}
                    placeholder="Örn. tr"
                  />
                </div>

                {profileMessage && <p className="text-xs text-emerald-700">{profileMessage}</p>}
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  disabled={savingProfile}
                >
                  Kaydet
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Şifre Güncelle</h2>
                  <p className="text-sm text-slate-500">Mevcut ve yeni şifre</p>
                </div>
              </div>

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

                {pwdMessage && <p className="text-xs text-emerald-700">{pwdMessage}</p>}
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Güncelle
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Hızlı Bağlam</h2>
              <p className="text-sm text-slate-500">Giriş yapan kullanıcı</p>
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm">
                {loading ? (
                  <p>Yükleniyor...</p>
                ) : (
                  <>
                    <p className="font-semibold">{account?.firstName} {account?.lastName}</p>
                    <p className="text-slate-600">{account?.email}</p>
                    <p className="text-slate-600">Dil: {account?.langKey}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

