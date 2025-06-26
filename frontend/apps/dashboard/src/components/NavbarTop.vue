<template>
  <nav class="flex justify-around w-full navbar-background" role="navigation">
    <NavbarMenu v-if="isLg" :model="navItems">
      <template #start>
        <router-link class="items-center flex flex-row font-bold no-underline py-1 text-white" to="/">
          {{ t('common.sudosos') }}
          <img alt="SudoSOS" class="h-16 py-2" src="@/assets/img/gewis-branding.svg" />
        </router-link>
      </template>
    </NavbarMenu>
    <NavbarMenu v-if="isLg" :model="profileNav">
      <template #start>
        <img v-if="isAdmin" alt="beer" class="h-4" src="@/assets/img/bier.png" />
      </template>
    </NavbarMenu>
    <NavbarMenu
      v-else
      menu-class="flex flex-row flex-wrap justify-between mx-2 my-4 transition-all w-full"
      :model="mobileItems"
    >
      <template #start>
        <router-link class="items-center flex flex-row font-bold no-underline py-1 text-white" to="/">
          {{ t('common.sudosos') }}
          <img alt="SudoSOS" class="h-4 py-2" src="@/assets/img/gewis-branding.svg" />
        </router-link>
      </template>
    </NavbarMenu>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@/utils/permissionUtils';
import { useAdminNav } from '@/modules/admin/navbar';
import { useFinancialNav } from '@/modules/financial/navbar';
import { useSellerNav } from '@/modules/seller/navbar';
import NavbarMenu from '@/components/NavbarMenu.vue';
import { useProfileNav } from '@/composables/profileNavbar';
import { useSizeBreakpoints } from '@/composables/sizeBreakpoints';

const { t } = useI18n();
const { isLg } = useSizeBreakpoints();

// If you can override maintenance mode, you are an admin
const isAdmin = computed(() => isAllowed('override', ['all'], 'Maintenance', ['any']));

const adminNav = useAdminNav();
const financialNav = useFinancialNav();
const sellerNav = useSellerNav();
const profileNav = useProfileNav();

const navItems = computed(() => [
  {
    label: t('common.navigation.transactions'),
    route: '/transaction',
  },
  ...adminNav.value,
  ...financialNav.value,
  ...sellerNav.value,
]);

const mobileItems = computed(() => [...navItems.value, ...profileNav.value]);
</script>

<style scoped lang="scss">
.navbar-background {
  background-color: var(--p-menubar-background);
  z-index: 9999;
  position: relative;
}
</style>
