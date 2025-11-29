import axios from "axios";
import { getToken } from "./authService";

export interface Submission {
  id: number;
  examId: number;
  examName?: string;
  student?: string;
  score?: number;
  status?: string;
  successRate?: number;
  complexity?: string;
  testResult?: string;
  buildResult?: string;
  createdDate?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function mapStatus(s?: string) {
  if (!s) return undefined;
  if (s === "PASSED") return "Tamamlandı";
  if (s === "PENDING") return "Beklemede";
  if (s === "FAILED") return "Başarısız";
  return s;
}

export async function getSubmissions() {
  const response = await api.get<any[]>("/api/submissions");
  return (response.data || []).map((s) => {
    const score = typeof s?.score === "number" ? s.score : undefined;
    const status = mapStatus(s?.status);
    const createdDate = s?.submissionDate ? new Date(s.submissionDate).toISOString() : undefined;
    const examId = s?.exam?.id;
    const examName = s?.exam?.title;
    const student = s?.student?.user?.login ?? (s?.student?.id != null ? `Öğrenci#${s.student.id}` : undefined);
    const successRate = score != null ? Math.max(0, Math.min(1, score / 100)) : undefined;
    const buildResult = s?.status === "PASSED" ? "Geçti" : s?.status === "FAILED" ? "Hata" : "Bilinmiyor";
    return {
      id: s?.id,
      examId,
      examName,
      student,
      score,
      status,
      successRate,
      complexity: s?.complexity,
      testResult: s?.testResult,
      buildResult,
      createdDate,
    } as Submission;
  });
}
