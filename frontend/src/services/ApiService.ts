import {ApiService} from "sudosos-frontend-common";
import {useAuthStore} from "@/stores/auth.store";

export default new ApiService(import.meta.env.VITE_APP_API_BASE,() => `Bearer ${useAuthStore().getToken()}`);
