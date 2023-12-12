// import type { PaginatedFinancialMutationResponse } from "@sudosos/sudosos-client";
// import apiService from "@/services/ApiService";
// import { handleError } from "@/utils/errorUtils";
// import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
// import router from "@/router";
// import { useToast } from "primevue/usetoast";
//
// const userStore = useUserStore();
// const authStore = useAuthStore();
// const toast = useToast();
// export async function getUserMutations (take: number, skip: number) : Promise<PaginatedFinancialMutationResponse> {
//   if (!authStore.getUser) {
//     await router.replace({ path: '/error' });
//   } else {
//     await userStore.fetchUsersFinancialMutations(authStore.getUser.id, apiService, take, skip)
//       .catch((err) => handleError(err, toast));
//   }
//   return userStore.getCurrentUser.financialMutations;
// }
