import api from "@/services/axiosConfig";

export const deliveryService = {
  track: (orderId: string | number) => api.get(`/delivery/${orderId}`),
  list: () => api.get("/delivery"),
  updateStatus: (id: string | number, status: string) => api.patch(`/delivery/${id}/status`, { status }),
};
