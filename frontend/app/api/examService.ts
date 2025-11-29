import { api } from "./authService";

export type ExamStatus = "UPCOMING" | "LIVE" | "CLOSED" | "DRAFT";

export interface Exam {
  id: number;
  title: string;
  subject?: string;
  owner?: string;
  durationMinutes?: number;
  startTime: string;
  endTime: string;
  status: ExamStatus;
}

export interface ExamQuery {
  role?: "teacher" | "manager";
  owner?: string;
}

export async function getExams(params?: ExamQuery) {
  const response = await api.get<Exam[]>("/api/exams", { params });
  return response.data;
}

export async function getExamById(examId: number) {
  const response = await api.get<Exam>(`/api/exams/${examId}`);
  return response.data;
}
