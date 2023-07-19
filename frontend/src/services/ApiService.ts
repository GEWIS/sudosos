import {ApiService, useAuthStore} from "@sudosos/sudosos-frontend-common";

export default new ApiService(import.meta.env.VITE_APP_API_BASE,() => `Bearer ${useAuthStore().getToken}`);
