import { useEffect, useMemo, useState } from "react";
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

interface ExamItem {
  name: string;
  status: "aktif" | "pasif";
  timeLeft: string;
  submissions: number;
  violations: number;
}

interface ActivityItem {
  type: "gonderim" | "ihlal" | "sistem";
  title: string;
  timestamp: string;
  context: string;
}

interface CodeMetricItem {
  exam: string;
  student: string;
  complexity: string;
  tests: string;
  build: string;
}

interface PerformanceItem {
  student: string;
  exam: string;
  score: number;
  success: number;
  progress: "iyi" | "orta" | "dusuk";
  badge?: string;
}

interface SecurityDetailItem {
  type: string;
  exam: string;
  student: string;
  count: number;
  severity: "normal" | "uyari" | "kritik";
}

const roleNavigation = {
  teacher: [
    "Dashboard",
    "Sınavlar",
    "Gönderimler (Kod)",
    "Güvenlik / İhlaller",
    "Öğrenciler",
    "Raporlar",
  ],
  manager: [
    "Genel Görünüm",
    "Sınavlar",
    "Güvenlik Raporları",
    "Performans İstatistikleri",
    "Sistem Uyarıları",
    "Raporlar",
  ],
};

const statusColors: Record<string, string> = {
  aktif: "bg-emerald-100 text-emerald-800",
  pasif: "bg-slate-100 text-slate-700",
  normal: "bg-indigo-50 text-indigo-700",
  uyari: "bg-amber-50 text-amber-700",
  kritik: "bg-rose-50 text-rose-700",
};

const badgeColors: Record<string, string> = {
  "plagiarism": "bg-rose-50 text-rose-700",
  "farklı IP": "bg-amber-50 text-amber-800",
};

export function Dashboard() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [pwdMessage, setPwdMessage] = useState("");
  const [role, setRole] = useState<"teacher" | "manager">("teacher");
  const [examFilter, setExamFilter] = useState<string>("Tümü");
  const [violationFilter, setViolationFilter] = useState<"tumu" | "normal" | "uyari" | "kritik">("tumu");

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

  const exams: ExamItem[] = role === "teacher"
    ? [
        { name: "Algoritmalar - Vize", status: "aktif", timeLeft: "38 dk", submissions: 42, violations: 3 },
        { name: "Veri Yapıları - Final", status: "pasif", timeLeft: "—", submissions: 0, violations: 0 },
        { name: "Programlama 101", status: "aktif", timeLeft: "2g 4s", submissions: 68, violations: 5 },
      ]
    : [
        { name: "Kurum Geneli Mart", status: "aktif", timeLeft: "1g 3s", submissions: 312, violations: 12 },
        { name: "Nisan Deneme", status: "pasif", timeLeft: "—", submissions: 0, violations: 1 },
        { name: "Bölüm Bazlı Ölçme", status: "aktif", timeLeft: "5g", submissions: 156, violations: 4 },
      ];

  const activities: ActivityItem[] = [
    { type: "gonderim", title: "Yeni kod gönderimi", timestamp: "5 dk önce", context: "Algoritmalar - Ayşe Y." },
    { type: "ihlal", title: "Plagiarism uyarısı", timestamp: "12 dk önce", context: "Programlama 101 - Emre K." },
    { type: "sistem", title: "Sistem uyarısı", timestamp: "20 dk önce", context: "Kurum VPN dışı erişim" },
    { type: "gonderim", title: "Test başarısı güncellendi", timestamp: "45 dk önce", context: "Algoritmalar - Kerem T." },
  ];

  const codeMetrics: CodeMetricItem[] = [
    { exam: "Algoritmalar", student: "Ayşe Y.", complexity: "Düşük karmaşıklık", tests: "%92 başarı", build: "Geçti" },
    { exam: "Programlama 101", student: "Emre K.", complexity: "Orta", tests: "%75 başarı", build: "Geçti" },
    { exam: "Veri Yapıları", student: "Kerem T.", complexity: "Yüksek", tests: "%60 başarı", build: "Hata" },
  ];

  const performances: PerformanceItem[] = [
    { student: "Ayşe Yılmaz", exam: "Algoritmalar", score: 92, success: 0.92, progress: "iyi" },
    { student: "Emre Kaya", exam: "Programlama 101", score: 78, success: 0.78, progress: "orta", badge: "plagiarism" },
    { student: "Kerem Tekin", exam: "Veri Yapıları", score: 65, success: 0.65, progress: "orta" },
    { student: "Zeynep Ak", exam: "Algoritmalar", score: 54, success: 0.54, progress: "dusuk", badge: "farklı IP" },
  ];

  const securityDetails: SecurityDetailItem[] = [
    { type: "Plagiarism", exam: "Programlama 101", student: "Emre Kaya", count: 2, severity: "uyari" },
    { type: "Farklı IP", exam: "Algoritmalar", student: "Zeynep Ak", count: 1, severity: "kritik" },
    { type: "Çoklu oturum", exam: "Kurum Geneli Mart", student: "—", count: 4, severity: "normal" },
  ];

  const summaryCards = useMemo(
    () => {
      if (role === "teacher") {
        return [
          { title: "Aktif Sınav", value: exams.filter((e) => e.status === "aktif").length, detail: "2 sınav", tone: "normal" },
          { title: "Genel Başarı", value: "%78", detail: "Trend ↑", tone: "normal" },
          { title: "Güvenlik İhlali", value: "8", detail: "Son 24 saat", tone: "uyari" },
          { title: "Bekleyen Gönderim", value: "12", detail: "İnceleniyor", tone: "normal" },
        ];
      }

      return [
        { title: "Sınav Durumu", value: "3 aktif", detail: "Toplam 5", tone: "normal" },
        { title: "Başarı Ort.", value: "%74", detail: "Kurum geneli", tone: "normal" },
        { title: "İhlal Sayısı", value: "17", detail: "Son 24 saat", tone: "uyari" },
        { title: "Sistem Uyarısı", value: "3 kritik", detail: "Yönetici", tone: "kritik" },
      ];
    },
    [exams, role],
  );

  const filteredExams = exams.filter((exam) => examFilter === "Tümü" || exam.name.includes(examFilter));
  const filteredMetrics = codeMetrics.filter((metric) => examFilter === "Tümü" || metric.exam.includes(examFilter));
  const filteredPerformances = performances.filter((perf) => examFilter === "Tümü" || perf.exam.includes(examFilter));
  const filteredSecurity = securityDetails.filter((detail) => violationFilter === "tumu" || detail.severity === violationFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-6 bg-white/80 border-r border-slate-200 p-6 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rol</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setRole("teacher")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold border ${
                  role === "teacher"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Öğretmen
              </button>
              <button
                onClick={() => setRole("manager")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold border ${
                  role === "manager"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Kurum
              </button>
            </div>
          </div>

          <nav className="space-y-1">
            {roleNavigation[role].map((item) => (
              <a
                key={item}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                href="#"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-200" aria-hidden />
                {item}
              </a>
            ))}
          </nav>

          <div className="mt-auto space-y-2 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Hızlı Aksiyonlar</p>
            <div className="flex flex-col gap-2 text-sm">
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left font-semibold text-slate-700 hover:border-indigo-200">
                Sınavı Başlat
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left font-semibold text-slate-700 hover:border-indigo-200">
                Sınavı Sonlandır
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left font-semibold text-slate-700 hover:border-rose-200">
                Uyarı Gönder
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Güvenlik Odaklı Dashboard</p>
              <h1 className="text-3xl font-bold text-slate-900">{role === "teacher" ? "Öğretmen Dashboard" : "Kurum Yöneticisi Genel Görünüm"}</h1>
              <p className="text-slate-600">
                {role === "teacher"
                  ? "Aktif sınavlar, kod analizi ve ihlaller için bütünleşik görünüm."
                  : "Kurum çapında sınav, başarı ve güvenlik metrikleri tek ekranda."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="w-full min-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 md:w-60"
                placeholder="Hızlı arama"
                aria-label="Hızlı arama"
              />
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                🔔 Uyarılar
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Çıkış Yap
              </button>
            </div>
          </header>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-600">{card.title}</div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[card.tone]}`}>
                    {card.detail}
                  </span>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-900">{card.value}</div>
                <p className="text-sm text-slate-500">Rol: {role === "teacher" ? "Öğretmen" : "Kurum Yöneticisi"}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Sınav filtresi</span>
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Tümü">Tümü</option>
                {exams.map((exam) => (
                  <option key={exam.name} value={exam.name}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">İhlal</span>
              <select
                value={violationFilter}
                onChange={(e) => setViolationFilter(e.target.value as typeof violationFilter)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="tumu">Tümü</option>
                <option value="normal">Normal</option>
                <option value="uyari">Uyarı</option>
                <option value="kritik">Kritik</option>
              </select>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Aktif Sınav Listesi</h2>
                    <p className="text-sm text-slate-500">Durum, kalan süre ve gönderim sayısı</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {filteredExams.length} kayıt
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredExams.map((exam) => (
                    <div key={exam.name} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{exam.name}</p>
                        <p className="text-xs text-slate-500">Gönderim: {exam.submissions} • Kalan: {exam.timeLeft}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[exam.status]}`}>
                          {exam.status === "aktif" ? "Aktif" : "Pasif"}
                        </span>
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          İhlal: {exam.violations}
                        </span>
                        <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-indigo-200">
                          Kodu Görüntüle
                        </button>
                        <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-amber-200">
                          {exam.status === "aktif" ? "Sınavı Sonlandır" : "Sınavı Başlat"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Son Aktiviteler Akışı</h2>
                    <p className="text-sm text-slate-500">Gönderim, ihlal ve sistem uyarıları</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Canlı</span>
                </div>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={`${activity.title}-${activity.timestamp}`} className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <div className="flex gap-3">
                        <span className="mt-1 text-lg" aria-hidden>
                          {activity.type === "gonderim" && "💻"}
                          {activity.type === "ihlal" && "⚠️"}
                          {activity.type === "sistem" && "🔔"}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                          <p className="text-xs text-slate-500">{activity.context}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>{activity.timestamp}</p>
                        <button className="text-indigo-600 hover:text-indigo-700">Detaya git</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Kod Analizi Metrikleri</h2>
                    <p className="text-sm text-slate-500">Derleme, test ve karmaşıklık</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Filtre: {examFilter}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredMetrics.map((metric) => (
                    <div key={`${metric.exam}-${metric.student}`} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                        <span>{metric.exam} – {metric.student}</span>
                        <button className="text-indigo-600 hover:text-indigo-700">Kodu Görüntüle</button>
                      </div>
                      <p className="text-xs text-slate-500">{metric.complexity}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{metric.tests}</span>
                        <span className={`rounded-full px-3 py-1 ${metric.build === "Geçti" ? "bg-indigo-50 text-indigo-700" : "bg-rose-50 text-rose-700"}`}>
                          {metric.build}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Güvenlik İhlal Detayı</h2>
                    <p className="text-sm text-slate-500">İhlal tipi, sınav ve öğrenci bağlamı</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[violationFilter === "tumu" ? "normal" : violationFilter]}`}>
                    {violationFilter === "tumu" ? "Tümü" : violationFilter.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredSecurity.map((detail) => (
                    <div key={`${detail.type}-${detail.exam}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{detail.type}</p>
                        <p className="text-xs text-slate-500">{detail.exam} • {detail.student}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[detail.severity]}`}>
                          {detail.severity.toUpperCase()}
                        </span>
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">{detail.count} ihlal</span>
                        <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-rose-200">
                          İncele
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Öğrenci Performans Tablosu</h2>
                  <p className="text-sm text-slate-500">Skor, başarı oranı ve ilerleme</p>
                </div>
                <button className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">CSV Dışa Aktar</button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Öğrenci</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Sınav</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Skor</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Başarı</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPerformances.map((perf) => (
                      <tr key={`${perf.student}-${perf.exam}`}>
                        <td className="px-3 py-2 text-sm font-semibold text-slate-800">{perf.student}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{perf.exam}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{perf.score}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-slate-100">
                              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${perf.success * 100}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{Math.round(perf.success * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-700">
                          <div className="flex flex-wrap items-center gap-2">
                            {perf.badge && (
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[perf.badge]}`}>
                                {perf.badge}
                              </span>
                            )}
                            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:border-indigo-200">
                              Kodu Görüntüle
                            </button>
                            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:border-amber-200">
                              Uyarı Gönder
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Grafiksel Raporlama</h2>
                    <p className="text-sm text-slate-500">Bar, çizgi ve dağılım özetleri</p>
                  </div>
                  <button className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">Tarih Seç</button>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <p className="font-semibold">Sınav bazlı başarı</p>
                    <div className="mt-2 space-y-2">
                      {exams.map((exam) => (
                        <div key={`graph-${exam.name}`} className="flex items-center gap-2 text-xs">
                          <span className="w-28 truncate text-slate-600">{exam.name}</span>
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, exam.submissions / 2)}%` }} />
                          </div>
                          <span className="w-10 text-right text-slate-600">{Math.min(100, Math.round(exam.submissions / 2))}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold">Test başarısı trendi</p>
                    <div className="mt-2 flex items-end gap-2">
                      {[78, 82, 76, 85, 88].map((value, index) => (
                        <div key={`trend-${index}`} className="w-10 rounded-t-lg bg-indigo-500/70" style={{ height: `${value / 2}px` }}>
                          <span className="sr-only">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold">İhlal dağılımı</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                      <span className="inline-flex h-3 w-3 rounded-full bg-rose-400" aria-hidden /> Plagiarism
                      <span className="inline-flex h-3 w-3 rounded-full bg-amber-400" aria-hidden /> Farklı IP
                      <span className="inline-flex h-3 w-3 rounded-full bg-indigo-400" aria-hidden /> Diğer
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Hesap ve Şifre</h2>
                    <p className="text-sm text-slate-500">Profil, dil ve parola güncelleme</p>
                  </div>
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" aria-hidden />
                  ) : (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{account?.login}</span>
                  )}
                </div>

                {error ? (
                  <p className="text-sm text-rose-700">{error}</p>
                ) : (
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
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

                    <form className="space-y-2" onSubmit={handlePasswordChange}>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Şifre Güncelle</label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        placeholder="Mevcut şifre"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        required
                      />
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        placeholder="Yeni şifre"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        required
                      />
                      {pwdMessage && <p className="text-xs text-emerald-700">{pwdMessage}</p>}
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                      >
                        Güncelle
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
