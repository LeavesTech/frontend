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
  startedAt?: string;
  endAt?: string;
  durationTime?: number;
  type?: string;
  courseId?: number;
  questionIds?: number[];
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
      startedAt,
      endAt,
      durationTime: e?.durationTime,
      type: e?.type,
      courseId: e?.course?.id,
      questionIds: Array.isArray(e?.questions) ? e.questions.map((q: any) => q?.id).filter((v: any) => v != null) : undefined,
    } as Exam;
  });
}

export interface ExamInput {
  title: string;
  startedAt: string;
  endAt: string;
  durationTime?: number;
  type?: string;
  courseId?: number;
  questionIds?: number[];
}

export async function createExam(payload: ExamInput) {
  const body: any = {
    title: payload.title,
    startedAt: payload.startedAt,
    endAt: payload.endAt,
  };
  if (payload.durationTime != null) body.durationTime = payload.durationTime;
  if (payload.type != null) body.type = payload.type;
  if (payload.courseId != null) body.course = { id: payload.courseId };
  if (Array.isArray(payload.questionIds)) body.questions = payload.questionIds.map((id) => ({ id }));
  const response = await api.post<any>("/api/exams", body);
  return response.data;
}

export async function updateExam(id: number, payload: ExamInput) {
  const body: any = {
    id,
    title: payload.title,
    startedAt: payload.startedAt,
    endAt: payload.endAt,
  };
  if (payload.durationTime != null) body.durationTime = payload.durationTime;
  if (payload.type != null) body.type = payload.type;
  if (payload.courseId != null) body.course = { id: payload.courseId };
  if (Array.isArray(payload.questionIds)) body.questions = payload.questionIds.map((id) => ({ id }));
  const response = await api.put<any>(`/api/exams/${id}`, body);
  return response.data;
}
