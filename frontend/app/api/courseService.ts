import axios from "axios";
import { getToken } from "./authService";

export interface Course {
  id: number;
  code?: string;
  name?: string;
  term?: string;
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

export async function getCourses() {
  const response = await api.get<any[]>("/api/courses");
  return (response.data || []).map((c) => ({
    id: c?.id,
    code: c?.code,
    name: c?.name ?? (c?.id != null ? `Ders #${c.id}` : undefined),
    term: c?.term,
  })) as Course[];
}

export async function getCourse(id: number) {
  const response = await api.get<any>(`/api/courses/${id}`);
  return response.data;
}

export interface CourseInput {
  code: string;
  name: string;
  term: string;
  ownerId: number;
  departmentId?: number;
}

export async function createCourse(payload: CourseInput) {
  const body: any = {
    code: payload.code,
    name: payload.name,
    term: payload.term,
    owner: { id: payload.ownerId },
  };
  if (payload.departmentId != null) {
    body.department = { id: payload.departmentId };
  }
  const response = await api.post<any>("/api/courses", body);
  return response.data;
}

export async function updateCourse(id: number, payload: CourseInput) {
  const body: any = {
    id,
    code: payload.code,
    name: payload.name,
    term: payload.term,
    owner: { id: payload.ownerId },
  };
  if (payload.departmentId != null) {
    body.department = { id: payload.departmentId };
  }
  const response = await api.put<any>(`/api/courses/${id}`, body);
  return response.data;
}
