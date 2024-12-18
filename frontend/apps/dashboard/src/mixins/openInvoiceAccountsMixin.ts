// src/mixins/pendingPayoutsMixin.ts
import { computed, watch } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { UserRole } from '@/utils/rbacUtils';
import apiService from '@/services/ApiService';
import type { BaseUserResponse } from "@sudosos/sudosos-client";



export function useOpenInvoiceAccounts() {
    const userStore = useUserStore();
    const openInvoiceAccounts = computed(() => {
            return Object.values(userStore.users).filter(isNotZeroAndInvoice).length;
        }
    );

    function updateOpenInvoiceAccounts() {
        if (userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BAC_PM) != -1) {
            const userStore = useUserStore();
            userStore.fetchInvoiceAccountsWithBalance(apiService);
        }
    }

    function isNotZeroAndInvoice(user: BaseUserResponse) {
        if(userStore.getBalanceById(user.id) !== undefined) {
            return userStore.getBalanceById(user.id).amount.amount != 0 &&
                userStore.getUserById(user.id).type == "INVOICE" &&
                userStore.getUserById(user.id).active == true;
        }
        else{
            return false;
        }

    }

    watch(() => userStore.current.rolesWithPermissions, () => {
        updateOpenInvoiceAccounts();
    });

    updateOpenInvoiceAccounts();
    return { openInvoiceAccounts };
}
