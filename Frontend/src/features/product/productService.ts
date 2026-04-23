import api from "@/services/axiosConfig";

export const productService = {
  list: (params?: Record<string, string | number>) => api.get("/products", { params }),
  getById: (id: string | number) => api.get(`/products/${id}`),
  create: (payload: Record<string, unknown>) => api.post("/products", payload),
  update: (id: string | number, payload: Record<string, unknown>) => api.put(`/products/${id}`, payload),
  remove: (id: string | number) => api.delete(`/products/${id}`),
};
