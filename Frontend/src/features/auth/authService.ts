import api from "@/services/axiosConfig";

export const authService = {
  login: (payload: { email: string; password: string }) => api.post("/auth/login", payload),
  register: (payload: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post("/auth/register", payload),
  resetPassword: (payload: { email: string }) => api.post("/auth/reset-password", payload),
};
