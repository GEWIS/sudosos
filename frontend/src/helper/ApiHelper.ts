import apiService from "@/services/ApiService";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";

/**
 * Populates the auth and userStore from the token stored in the localStorage.
 */
export function populateStoresFromToken() {
    const isAuthenticated = apiService.isAuthenticated();

    if (isAuthenticated) {
        useAuthStore().extractStateFromToken();
        const user = useAuthStore().getUser;
        if (user) {
            useUserStore().setCurrentUser(user);
            useUserStore().fetchCurrentUserBalance(user.id, apiService);
        }
    }
}
