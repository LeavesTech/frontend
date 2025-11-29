import axios from "axios";
import { getToken } from "./authService";

export interface Exam {
  id: number;
  title?: string;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  ownerLogin?: string;
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

export async function getExams() {
  const response = await api.get<any[]>("/api/exams");
  const now = Date.now();
  return (response.data || []).map((e) => {
    const startedAt = e?.startedAt ? new Date(e.startedAt).toISOString() : undefined;
    const endAt = e?.endAt ? new Date(e.endAt).toISOString() : undefined;
    const startMs = e?.startedAt ? new Date(e.startedAt).getTime() : undefined;
    const endMs = e?.endAt ? new Date(e.endAt).getTime() : undefined;
    const isActive = startMs != null && endMs != null && startMs <= now && now < endMs;
    return {
      id: e?.id,
      title: e?.title,
      name: e?.title,
      status: isActive ? "active" : "inactive",
      startDate: startedAt,
      endDate: endAt,
      active: isActive,
    } as Exam;
  });
}
