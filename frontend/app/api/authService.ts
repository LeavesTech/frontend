import axios from "axios";

export const api = axios.create({
  // Default to local Spring Boot/JHipster backend when env is unset
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Attach JWT token to every request when available
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

export const saveToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("jwtToken", token);
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwtToken");
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwtToken");
  }
};

export async function login(username: string, password: string) {
  const response = await api.post("/api/authenticate", { username, password });
  if (response.data?.id_token) {
    saveToken(response.data.id_token);
  }
  return response.data;
}

export async function register(data: Record<string, unknown>) {
  const response = await api.post("/api/register", data);
  return response.data;
}

export async function getAccount() {
  const response = await api.get("/api/account");
  return response.data;
}

export async function updateAccount(data: Record<string, unknown>) {
  const response = await api.post("/api/account", data);
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await api.post("/api/account/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
}

export async function resetPasswordInit(email: string) {
  const response = await api.post("/api/account/reset-password/init", email, {
    headers: { "Content-Type": "text/plain" },
  });
  return response.data;
}

export async function resetPasswordFinish(key: string, newPassword: string) {
  const response = await api.post("/api/account/reset-password/finish", {
    key,
    newPassword,
  });
  return response.data;
}

export async function activateAccount(key: string) {
  const response = await api.get(`/api/activate`, { params: { key } });
  return response.data;
}
