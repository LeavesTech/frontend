import axios from "axios";
import { getToken } from "./authService";

export interface TeacherInput {
  title?: string;
  officeRoom?: string;
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

export async function getTeachers() {
  const response = await api.get<any[]>("/api/teachers");
  return response.data || [];
}

export async function createTeacher(payload: TeacherInput) {
  const body: any = {};
  if (payload.title) body.title = payload.title;
  if (payload.officeRoom) body.officeRoom = payload.officeRoom;
  const response = await api.post<any>("/api/teachers", body);
  return response.data;
}

