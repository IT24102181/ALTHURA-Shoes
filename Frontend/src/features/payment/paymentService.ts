import api from "@/services/axiosConfig";

export const paymentService = {
  list: () => api.get("/payments"),
  pay: (payload: Record<string, unknown>) => api.post("/payments", payload),
  updateStatus: (id: string | number, status: string) => api.patch(`/payments/${id}/status`, { status }),
};
