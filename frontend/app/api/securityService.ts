import axios from "axios";
import { getToken } from "./authService";

export interface SecurityIncident {
  id: number;
  examId?: number;
  examName?: string;
  student?: string;
  type?: string;
  severity?: "normal" | "uyari" | "kritik";
  count?: number;
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

export async function getSecurityIncidents(params?: { role?: "teacher" | "manager"; owner?: string; examId?: number }) {
  const response = await api.get<SecurityIncident[]>("/api/security/incidents", {
    params,
  });
  return response.data;
}
