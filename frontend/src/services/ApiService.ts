import { ApiService, useAuthStore } from "@sudosos/sudosos-frontend-common";

const apiService = new ApiService(import.meta.env.VITE_APP_API_BASE,() => `Bearer ${useAuthStore().getToken}`);
export default apiService;
