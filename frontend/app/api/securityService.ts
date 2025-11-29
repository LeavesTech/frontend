import { api } from "./authService";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityIncident {
  id: number;
  examId?: number;
  type: string;
  description: string;
  severity: SecuritySeverity;
  detectedAt: string;
  resolved?: boolean;
}

export interface SecurityQuery {
  examId?: number;
  role?: "teacher" | "manager";
  owner?: string;
  severity?: SecuritySeverity;
}

export async function getSecurityIncidents(params?: SecurityQuery) {
  const response = await api.get<SecurityIncident[]>("/api/security/incidents", { params });
  return response.data;
}

export async function getAlerts(params?: SecurityQuery) {
  const response = await api.get<SecurityIncident[]>("/api/security/alerts", { params });
  return response.data;
}
