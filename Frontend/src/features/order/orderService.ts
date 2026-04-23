import api from "@/services/axiosConfig";

export const orderService = {
  list: () => api.get("/orders"),
  getById: (id: string | number) => api.get(`/orders/${id}`),
  create: (payload: Record<string, unknown>) => api.post("/orders", payload),
  updateStatus: (id: string | number, status: string) => api.patch(`/orders/${id}/status`, { status }),
};
