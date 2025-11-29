import { api } from "./authService";

export interface Submission {
  id: number;
  examId: number;
  participant?: string;
  score?: number;
  status?: "PENDING" | "SUBMITTED" | "GRADED";
  submittedAt: string;
}

export interface SubmissionQuery {
  examId?: number;
  role?: "teacher" | "manager";
  owner?: string;
}

export async function getSubmissions(params?: SubmissionQuery) {
  const response = await api.get<Submission[]>("/api/submissions", { params });
  return response.data;
}
