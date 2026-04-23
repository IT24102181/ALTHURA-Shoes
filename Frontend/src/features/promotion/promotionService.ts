import api from "@/services/axiosConfig";

export const promotionService = {
  list: () => api.get("/promotions"),
  create: (payload: Record<string, unknown>) => api.post("/promotions", payload),
  update: (id: string | number, payload: Record<string, unknown>) => api.put(`/promotions/${id}`, payload),
  remove: (id: string | number) => api.delete(`/promotions/${id}`),
};
