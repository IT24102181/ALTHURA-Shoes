import api from "@/services/axiosConfig";

export const cartService = {
  getCart: () => api.get("/cart"),
  addItem: (payload: { productId: number; quantity: number; size?: string }) => api.post("/cart/add", payload),
  updateItem: (payload: { itemId: number; quantity: number }) => api.put("/cart/update", payload),
  removeItem: (itemId: number) => api.delete(`/cart/${itemId}`),
};
