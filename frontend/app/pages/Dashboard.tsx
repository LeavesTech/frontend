import { useEffect, useMemo, useState } from "react";
import { changePassword, clearToken, getAccount } from "../api/authService";
import { getExams } from "../api/examService";
import CreateUpdateModal from "../components/CreateUpdateModal";
import CourseCreateUpdateModal from "../components/CourseCreateUpdateModal";
import { getSubmissions } from "../api/submissionService";
import { getSecurityIncidents } from "../api/securityService";
import type { Exam } from "../api/examService";
import type { Submission } from "../api/submissionService";
import type { SecurityIncident } from "../api/securityService";
import { useNavigate } from "react-router";

interface Account {
  firstName?: string;
  lastName?: string;
  email?: string;
  login?: string;
  langKey?: string;
  imageUrl?: string;
}

interface ActivityItem {
  type: "gonderim" | "ihlal" | "sistem";
  title: string;
  timestamp: string;
  context: string;
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

interface DerivedExam {
  id: number;
  name: string;
  status: "aktif" | "pasif";
  timeLeft: string;
  submissions: number;
  violations: number;
}

interface DerivedPerformance {
  student: string;
  exam: string;
  score: number;
  success: number;
  progress: "iyi" | "orta" | "dusuk";
  badge?: string;
}

interface DerivedMetric {
  exam: string;
  student: string;
  complexity: string;
  tests: string;
  build: string;
}

interface DerivedSecurityDetail {
  id: number;
  type: string;
  exam: string;
  student: string;
  count: number;
  severity: "normal" | "uyari" | "kritik";
}

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
  const [examData, setExamData] = useState<Exam[]>([]);
  const [submissionData, setSubmissionData] = useState<Submission[]>([]);
  const [securityData, setSecurityData] = useState<SecurityIncident[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedExam, setSelectedExam] = useState<Exam | undefined>(undefined);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseModalMode, setCourseModalMode] = useState<"create" | "update">("create");

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

  const reloadExams = async () => {
    try {
      const fetchedExams = await getExams();
      setExamData(fetchedExams ?? []);
    } catch {}
  };

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

  const formatTimeLeft = (exam: Exam) => {
    if (!exam.endDate) return "—";

    const end = new Date(exam.endDate).getTime();
    const now = Date.now();
    if (Number.isNaN(end) || end <= now) return "—";

    const diffSeconds = Math.floor((end - now) / 1000);
    const days = Math.floor(diffSeconds / (24 * 3600));
    const hours = Math.floor((diffSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);

    if (days > 0) return `${days}g ${hours}s`;
    if (hours > 0) return `${hours}s ${minutes}dk`;
    return `${minutes} dk`;
  };

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const [fetchedExams, fetchedSubmissions, fetchedSecurity] = await Promise.all([
          getExams(),
          getSubmissions(),
          getSecurityIncidents(),
        ]);

        if (cancelled) return;
        setExamData(fetchedExams ?? []);
        setSubmissionData(fetchedSubmissions ?? []);
        setSecurityData(fetchedSecurity ?? []);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setDataError("Veriler alınırken bir sorun oluştu.");
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const submissionCountByExam = useMemo(() => {
    return submissionData.reduce<Record<number, number>>((acc, submission) => {
      acc[submission.examId] = (acc[submission.examId] || 0) + 1;
      return acc;
    }, {});
  }, [submissionData]);

  const securityCountByExam = useMemo(() => {
    return securityData.reduce<Record<number, number>>((acc, incident) => {
      if (!incident.examId) return acc;
      acc[incident.examId] = (acc[incident.examId] || 0) + (incident.count || 1);
      return acc;
    }, {});
  }, [securityData]);

  const violationsByStudent = useMemo(() => {
    return securityData.reduce<Record<string, string>>((acc, incident) => {
      if (!incident.student || !incident.type) return acc;
      acc[incident.student] = incident.type;
      return acc;
    }, {});
  }, [securityData]);

  const exams: DerivedExam[] = useMemo(() => {
    const mapped = examData.map((exam) => {
      const isActive = exam.active ?? ["aktif", "active", "ongoing"].includes((exam.status || "").toLowerCase());
      return {
        id: exam.id,
        name: exam.title || exam.name || `Sınav #${exam.id}`,
        status: isActive ? "aktif" : "pasif",
        timeLeft: formatTimeLeft(exam),
        submissions: submissionCountByExam[exam.id] || 0,
        violations: securityCountByExam[exam.id] || 0,
      };
    });

    if (examFilter === "Tümü") return mapped;
    return mapped.filter((exam) => exam.name.toLowerCase().includes(examFilter.toLowerCase()));
  }, [examData, examFilter, securityCountByExam, submissionCountByExam]);

  const activities: ActivityItem[] = useMemo(() => {
    const submissionActivities = submissionData.map<ActivityItem>((submission) => ({
      type: "gonderim",
      title: "Yeni kod gönderimi",
      timestamp: submission.createdDate || new Date().toISOString(),
      context: `${submission.examName || "Sınav"} - ${submission.student || "Öğrenci"}`,
    }));

    const securityActivities = securityData.map<ActivityItem>((incident) => ({
      type: "ihlal",
      title: incident.type || "Güvenlik uyarısı",
      timestamp: incident.createdDate || new Date().toISOString(),
      context: `${incident.examName || "Sınav"} - ${incident.student || "Kullanıcı"}`,
    }));

    const items = [...submissionActivities, ...securityActivities].sort((a, b) => {
      const timeB = new Date(b.timestamp).getTime() || 0;
      const timeA = new Date(a.timestamp).getTime() || 0;
      return timeB - timeA;
    });

    return items.slice(0, 8);
  }, [securityData, submissionData]);

  const codeMetrics: DerivedMetric[] = useMemo(() => {
    const mapped = submissionData.map<DerivedMetric>((submission) => ({
      exam: submission.examName || "Sınav",
      student: submission.student || "Öğrenci",
      complexity: submission.complexity || "Belirleniyor",
      tests: submission.successRate != null ? `%${Math.round(submission.successRate * 100)} başarı` : "Test sonucu yok",
      build: submission.buildResult || "Bilinmiyor",
    }));

    if (examFilter === "Tümü") return mapped;
    return mapped.filter((metric) => metric.exam.toLowerCase().includes(examFilter.toLowerCase()));
  }, [examFilter, submissionData]);

  const performances: DerivedPerformance[] = useMemo(() => {
    const grouped = submissionData.reduce<Record<string, { total: number; count: number; exam?: string }>>((acc, submission) => {
      if (!submission.student) return acc;
      const key = `${submission.student}||${submission.examName || ""}`;
      acc[key] = acc[key] || { total: 0, count: 0, exam: submission.examName };
      acc[key].total += submission.score ?? 0;
      acc[key].count += 1;
      return acc;
    }, {});

    const mapped = Object.entries(grouped).map(([key, value]) => {
      const [student] = key.split("||");
      const average = value.total / value.count || 0;
      const success = Math.min(Math.max(average / 100, 0), 1);
      let progress: "iyi" | "orta" | "dusuk" = "dusuk";
      if (success >= 0.8) progress = "iyi";
      else if (success >= 0.6) progress = "orta";

      return {
        student,
        exam: value.exam || "Sınav",
        score: Math.round(average),
        success,
        progress,
        badge: violationsByStudent[student],
      };
    });

    if (examFilter === "Tümü") return mapped;
    return mapped.filter((perf) => perf.exam.toLowerCase().includes(examFilter.toLowerCase()));
  }, [examFilter, submissionData, violationsByStudent]);

  const securityDetails: DerivedSecurityDetail[] = useMemo(() => {
    const mapped = securityData.map((incident) => ({
      id: incident.id,
      type: incident.type || "İhlal",
      exam: incident.examName || "Sınav",
      student: incident.student || "—",
      count: incident.count || 1,
      severity: incident.severity || "normal",
    }));

    if (violationFilter === "tumu") return mapped;
    return mapped.filter((detail) => detail.severity === violationFilter);
  }, [securityData, violationFilter]);

  const summaryCards = useMemo(
    () => {
      const activeExamCount = exams.filter((e) => e.status === "aktif").length;
      const totalExams = exams.length;
      const totalViolations = securityDetails.reduce((acc, detail) => acc + detail.count, 0);
      const averageScore = submissionData.length
        ? Math.round(
            submissionData.reduce((acc, submission) => acc + (submission.score || 0), 0) / submissionData.length,
          )
        : 0;
      const pendingSubmissions = submissionData.filter((submission) => (submission.status || "").toLowerCase() !== "tamamlandı").length;

      if (role === "teacher") {
        return [
          { title: "Aktif Sınav", value: activeExamCount, detail: `${totalExams} toplam`, tone: "normal" },
          { title: "Genel Başarı", value: `%${averageScore}`, detail: "Gönderim ort.", tone: "normal" },
          { title: "Güvenlik İhlali", value: totalViolations.toString(), detail: "Son olaylar", tone: "uyari" },
          { title: "Bekleyen Gönderim", value: pendingSubmissions.toString(), detail: "İnceleniyor", tone: "normal" },
        ];
      }

      return [
        { title: "Sınav Durumu", value: `${activeExamCount} aktif`, detail: `${totalExams} toplam`, tone: "normal" },
        { title: "Başarı Ort.", value: `%${averageScore}`, detail: "Kurum geneli", tone: "normal" },
        { title: "İhlal Sayısı", value: totalViolations.toString(), detail: "Son olaylar", tone: "uyari" },
        { title: "Sistem Uyarısı", value: `${securityDetails.filter((detail) => detail.severity === "kritik").length} kritik`, detail: "Yönetici", tone: "kritik" },
      ];
    },
    [exams, role, securityDetails, submissionData],
  );

  const filteredExams = exams;
  const filteredMetrics = codeMetrics;
  const filteredPerformances = performances;
  const filteredSecurity = securityDetails;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50">
      <div className="min-h-screen">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
              {/* Top Bar - Logo & User Info */}
              <div className="border-b border-slate-100">
                  <div className="container mx-auto flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-sm">
                                  SE
                              </div>
                              <div>
                                  <h1 className="text-sm font-bold text-slate-900">Secure Exam</h1>
                                  <p className="text-xs text-slate-500">Güvenlik Odaklı Platform</p>
                              </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                              <span className="text-xs font-medium text-slate-600">Rol:</span>
                              <button
                                  onClick={() => setRole("teacher")}
                                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                      role === "teacher"
                                          ? "bg-indigo-600 text-white shadow-sm"
                                          : "text-slate-600 hover:bg-white"
                                  }`}
                              >
                                  Öğretmen
                              </button>
                              <button
                                  onClick={() => setRole("manager")}
                                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                      role === "manager"
                                          ? "bg-indigo-600 text-white shadow-sm"
                                          : "text-slate-600 hover:bg-white"
                                  }`}
                              >
                                  Kurum
                              </button>
                          </div>

                          <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                          </button>

                          <button
                              onClick={handleLogout}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                              Çıkış Yap
                          </button>
                      </div>
                  </div>
              </div>

              {/* Navigation & Actions */}
              <div className="container mx-auto px-6 py-3">
                  <div className="flex items-center justify-between gap-4">
                      {/* Navigation Links */}
                      <nav className="flex items-center gap-1">
                          {roleNavigation[role].map((item, index) => (
                              <a
                                  key={item}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                      index === 0
                                          ? "bg-indigo-50 text-indigo-700"
                                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                                  href="#"
                              >
                                  {item}
                              </a>
                          ))}
                      </nav>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                          <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                              Sınavı Başlat
                          </button>
                          <button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors">
                              Sınavı Sonlandır
                          </button>
                          <button
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                              onClick={() => {
                                  setCourseModalMode("create");
                                  setCourseModalOpen(true);
                              }}
                          >
                              + Ders Oluştur
                          </button>
                      </div>
                  </div>
              </div>
          </div>

        <main className="p-6 lg:p-10">
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

          {dataError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {dataError}
            </div>
          )}

          {dataLoading && (
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
              Veriler yükleniyor...
            </div>
          )}

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
                {examData.map((exam) => (
                  <option key={exam.id} value={exam.title || exam.name || `Sınav #${exam.id}`}>
                    {exam.title || exam.name || `Sınav #${exam.id}`}
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
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {filteredExams.length} kayıt
                    </span>
                    <button
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-200"
                      onClick={() => {
                        setSelectedExam(undefined);
                        setModalMode("create");
                        setModalOpen(true);
                      }}
                    >
                      Sınav Oluştur
                    </button>
                  </div>
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
                        <button
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-indigo-200"
                          onClick={() => {
                            const orig = examData.find((e) => e.id === exam.id);
                            setSelectedExam(orig);
                            setModalMode("update");
                            setModalOpen(true);
                          }}
                        >
                          Düzenle
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
                        <p>{new Date(activity.timestamp).toLocaleString("tr-TR")}</p>
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
      <CreateUpdateModal
        open={modalOpen}
        mode={modalMode}
        exam={selectedExam}
        onClose={() => setModalOpen(false)}
        onSaved={reloadExams}
      />
      <CourseCreateUpdateModal
        open={courseModalOpen}
        mode={courseModalMode}
        onClose={() => setCourseModalOpen(false)}
        onSaved={() => {}}
      />
    </div>
  );
}
