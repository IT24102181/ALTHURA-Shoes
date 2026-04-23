import api from "@/services/axiosConfig";

export const userService = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (payload: Record<string, unknown>) => api.put("/users/profile", payload),
  changePassword: (payload: { oldPassword: string; newPassword: string }) => api.put("/users/password", payload),
  listUsers: () => api.get("/users/"),
  updateUserStatus: (id: number, status: "ACTIVE" | "DEACTIVATED") =>
    api.put(`/users/${id}/status`, null, { params: { status } }),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};
