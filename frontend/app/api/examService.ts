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

export async function getExams(params?: { role?: "teacher" | "manager"; owner?: string }) {
  const response = await api.get<Exam[]>("/api/exams", {
    params,
  });
  return response.data;
}
