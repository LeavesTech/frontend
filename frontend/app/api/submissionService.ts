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

export async function getSubmissions(params?: { examId?: number; role?: "teacher" | "manager"; owner?: string }) {
  const response = await api.get<Submission[]>("/api/submissions", {
    params,
  });
  return response.data;
}
