import { useEffect, useMemo, useState } from "react";
import { changePassword, clearToken, getAccount } from "../api/authService";
import { getExams } from "../api/examService";
import { getSecurityIncidents } from "../api/securityService";
import { getSubmissions } from "../api/submissionService";
import type { Exam, ExamStatus } from "../api/examService";
import type { SecurityIncident, SecuritySeverity } from "../api/securityService";
import type { Submission } from "../api/submissionService";
import { useNavigate } from "react-router";

interface Account {
  firstName?: string;
  lastName?: string;
  email?: string;
  login?: string;
  langKey?: string;
  imageUrl?: string;
}

type Role = "teacher" | "manager";
type ExamFilter = "all" | "upcoming" | "live" | "closed" | "draft";
type ViolationFilter = "all" | SecuritySeverity;

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

  const [role, setRole] = useState<Role>("teacher");
  const [examFilter, setExamFilter] = useState<ExamFilter>("all");
  const [violationFilter, setViolationFilter] = useState<ViolationFilter>("all");

  const [exams, setExams] = useState<Exam[]>([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");

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

  useEffect(() => {
    const loadData = async () => {
      if (loading || !account?.login) return;

      const query = role === "teacher" ? { role, owner: account.login } : { role };
      setExamLoading(true);
      setExamError("");
      setSubmissionLoading(true);
      setSubmissionError("");
      setSecurityLoading(true);
      setSecurityError("");

      try {
        const [examData, submissionData, violationData] = await Promise.all([
          getExams(query),
          getSubmissions(query),
          getSecurityIncidents(query),
        ]);
        setExams(examData);
        setSubmissions(submissionData);
        setSecurityIncidents(violationData);
      } catch (err) {
        console.error(err);
        setExamError("Sınavlar alınamadı.");
        setSubmissionError("Gönderimler alınamadı.");
        setSecurityError("İhlal verileri alınamadı.");
      } finally {
        setExamLoading(false);
        setSubmissionLoading(false);
        setSecurityLoading(false);
      }
    };

    loadData();
  }, [role, account?.login, loading]);

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

  const filteredExams = useMemo(() => {
    const statusMap: Record<ExamFilter, ExamStatus[]> = {
      all: ["UPCOMING", "LIVE", "CLOSED", "DRAFT"],
      upcoming: ["UPCOMING"],
      live: ["LIVE"],
      closed: ["CLOSED"],
      draft: ["DRAFT"],
    };
    const desiredStatuses = statusMap[examFilter];
    return exams.filter((exam) => desiredStatuses.includes(exam.status));
  }, [exams, examFilter]);

  const filteredIncidents = useMemo(() => {
    if (violationFilter === "all") return securityIncidents;
    return securityIncidents.filter((incident) => incident.severity === violationFilter);
  }, [securityIncidents, violationFilter]);

  const submissionCountByExam = useMemo(() => {
    return submissions.reduce<Record<number, number>>((acc, submission) => {
      acc[submission.examId] = (acc[submission.examId] || 0) + 1;
      return acc;
    }, {});
  }, [submissions]);

  const averageScoreByExam = useMemo(() => {
    const totals = submissions.reduce<Record<number, { total: number; count: number }>>((acc, submission) => {
      if (typeof submission.score !== "number") return acc;
      const existing = acc[submission.examId] || { total: 0, count: 0 };
      acc[submission.examId] = {
        total: existing.total + submission.score,
        count: existing.count + 1,
      };
      return acc;
    }, {});

    return Object.entries(totals).reduce<Record<number, number>>((acc, [examId, value]) => {
      acc[Number(examId)] = value.total / value.count;
      return acc;
    }, {});
  }, [submissions]);

  const recentActivities = useMemo(() => {
    return submissions
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
  }, [submissions]);

  const criticalAlerts = useMemo(
    () => securityIncidents.filter((incident) => incident.severity === "critical").length,
    [securityIncidents]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">
              JWT korumalı alan. Mevcut kullanıcı bilgileri ve sınav etkinlikleri aşağıda listelenir.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              {(["teacher", "manager"] as Role[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setRole(option)}
                  className={`px-3 py-1 rounded-md text-sm font-medium capitalize ${
                    role === option ? "bg-indigo-600 text-white" : "text-slate-700"
                  }`}
                >
                  {option === "teacher" ? "Öğretmen" : "Yönetici"}
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            >
              Çıkış Yap
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-2">
            <p className="text-sm text-slate-500">Toplam Sınav</p>
            <p className="text-3xl font-semibold text-slate-900">{filteredExams.length}</p>
            {examLoading && <p className="text-xs text-slate-500">Sınavlar yükleniyor...</p>}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-2">
            <p className="text-sm text-slate-500">Gönderimler</p>
            <p className="text-3xl font-semibold text-slate-900">{submissions.length}</p>
            {submissionLoading && <p className="text-xs text-slate-500">Gönderimler yükleniyor...</p>}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-2">
            <p className="text-sm text-slate-500">Kritik Uyarılar</p>
            <p className="text-3xl font-semibold text-red-600">{criticalAlerts}</p>
            {securityLoading && <p className="text-xs text-slate-500">İhlaller yükleniyor...</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Hesap Bilgileri</h2>
              <div className="flex gap-3">
                <select
                  className="text-input h-10"
                  value={examFilter}
                  onChange={(event) => setExamFilter(event.target.value as ExamFilter)}
                >
                  <option value="all">Tüm Sınavlar</option>
                  <option value="upcoming">Yaklaşan</option>
                  <option value="live">Canlı</option>
                  <option value="closed">Tamamlandı</option>
                  <option value="draft">Taslak</option>
                </select>
                <select
                  className="text-input h-10"
                  value={violationFilter}
                  onChange={(event) => setViolationFilter(event.target.value as ViolationFilter)}
                >
                  <option value="all">Tüm İhlaller</option>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik</option>
                </select>
              </div>
            </div>
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

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Sınavlar</h3>
              {examError && <p className="text-red-600">{examError}</p>}
              {examLoading ? (
                <p className="text-slate-600">Sınavlar yükleniyor...</p>
              ) : filteredExams.length === 0 ? (
                <p className="text-slate-600">Gösterilecek sınav bulunamadı.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredExams.map((exam) => (
                    <li key={exam.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{exam.title}</p>
                        <p className="text-sm text-slate-600">
                          {exam.subject || "Genel"} • {exam.durationMinutes ?? 0} dk • {exam.status}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Gönderim</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {submissionCountByExam[exam.id] || 0}
                        </p>
                        {typeof averageScoreByExam[exam.id] === "number" && (
                          <p className="text-xs text-indigo-600">Ort. skor: {averageScoreByExam[exam.id].toFixed(1)}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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

              <button type="submit" className="primary-button">
                Güncelle
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Güvenlik</h3>
              {securityError && <p className="text-red-600">{securityError}</p>}
              {securityLoading ? (
                <p className="text-slate-600">Güvenlik verileri yükleniyor...</p>
              ) : filteredIncidents.length === 0 ? (
                <p className="text-slate-600">Seçili filtre için ihlal bulunamadı.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredIncidents.map((incident) => (
                    <li key={incident.id} className="py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{incident.type}</p>
                          <p className="text-sm text-slate-600">{incident.description}</p>
                          <p className="text-xs text-slate-500">
                            {incident.examId ? `Sınav #${incident.examId} • ` : ""}
                            {new Date(incident.detectedAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            incident.severity === "critical"
                              ? "bg-red-100 text-red-700"
                              : incident.severity === "high"
                              ? "bg-orange-100 text-orange-700"
                              : incident.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Son Etkinlikler</h3>
              {submissionError && <p className="text-red-600">{submissionError}</p>}
              {submissionLoading ? (
                <p className="text-slate-600">Etkinlikler yükleniyor...</p>
              ) : recentActivities.length === 0 ? (
                <p className="text-slate-600">Henüz gönderim yok.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentActivities.map((activity) => (
                    <li key={activity.id} className="py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Gönderim #{activity.id}</p>
                          <p className="text-sm text-slate-600">{activity.participant || "Öğrenci"}</p>
                          <p className="text-xs text-slate-500">
                            Sınav #{activity.examId} • {new Date(activity.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        {typeof activity.score === "number" && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                            Skor: {activity.score}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
