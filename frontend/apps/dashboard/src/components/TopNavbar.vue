<template>
  <nav class="flex justify-around w-full" :class="isBeta ? 'bg-green-500' : 'navbar-background'">
    <Menubar class="hidden lg:flex" :model="navItems">
      <template #start>
        <router-link class="items-center flex flex-row font-bold no-underline py-1 text-white" to="/">
          {{ t('common.sudosos') }}
          <img alt="SudoSOS" class="h-16 py-2" src="../assets/img/gewis-branding.svg" />
        </router-link>
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" custom :to="item.route">
          <a v-bind="props.action" class="items-center flex justify-between" :href="href" @click="navigate">
            <span class="p-menuitem-text">{{ item.label }}</span>
            <span v-if="item.notifications" class="p-badge p-badge-danger">{{ item.notifications }}</span>
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <div class="items-center flex justify-between">
            <span class="p-menuitem-text">{{ item.label }}</span>
            <span v-if="item.notifications" class="ml-2 p-badge p-badge-danger-inverse p-badge-no-gutter">
              {{ item.notifications }}
            </span>
            <span v-else-if="hasSubmenu" class="ml-2 pi pi-angle-down pi-fw" />
          </div>
        </a>
      </template>
    </Menubar>
    <Menubar class="hidden lg:flex" :model="profileItems">
      <template #start>
        <img alt="beer" class="h-4" src="../assets/img/bier.png" />
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" custom :to="item.route">
          <a :href="href" v-bind="props.action" @click="navigate">
            <span class="p-menuitem-text">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <span class="p-menuitem-text">{{ item.label }}</span>
          <span v-if="item.icon" :class="item.icon" />
          <span v-if="hasSubmenu" class="ml-2 pi pi-angle-down pi-fw" />
        </a>
      </template>
    </Menubar>
    <Menubar
      class="flex flex-row flex-wrap justify-between lg:hidden mx-2 my-4 transition-all w-full"
      :model="mobileItems"
    >
      <template #start>
        <router-link class="items-center flex flex-row font-bold no-underline py-1 text-white" to="/">
          {{ t('common.sudosos') }}
          <img alt="SudoSOS" class="h-4 py-2" src="../assets/img/gewis-branding.svg" />
        </router-link>
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" custom :to="item.route">
          <a :href="href" v-bind="props.action" @click="navigate">
            <span class="p-menuitem-text">{{ item.label }}</span>
            <span v-if="item.icon" :class="item.icon" />
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <span class="p-menuitem-text">{{ item.label }}</span>
          <span v-if="item.icon" :class="item.icon" />
          <span v-if="hasSubmenu" class="ml-2 pi pi-angle-down pi-fw" />
        </a>
      </template>
    </Menubar>
  </nav>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, type Ref } from 'vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePendingPayouts } from '@/mixins/pendingPayoutsMixin';
import apiService from '@/services/ApiService';

import { useOpenInvoiceAccounts } from '@/mixins/openInvoiceAccountsMixin';
import { isAllowed } from '@/utils/permissionUtils';
import { isBetaEnabled } from '@/utils/betaUtil';
import { useInactiveDebtors } from '@/mixins/inactiveDebtorsMixin';
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const { t, locale } = useI18n();

const firstName = computed((): string | undefined => {
  return userStore.getCurrentUser.user ? userStore.getCurrentUser.user.firstName : undefined;
});

const handleLogout = () => {
  authStore.logout();
  void router.push('/');
};

const isBeta = isBetaEnabled();

const { pendingPayouts } = usePendingPayouts();
const { openInvoiceAccounts } = useOpenInvoiceAccounts();
const { inactiveDebtors } = useInactiveDebtors();
const getFinancialNotifications = () =>
  isAllowed('update', ['all'], 'SellerPayout', ['any']) &&
  pendingPayouts?.value + openInvoiceAccounts?.value + inactiveDebtors?.value;

const organs: Ref<
  {
    label: string;
    route: string;
    notifications: string;
  }[]
> = ref([]);

const getOrgans = async () => {
  organs.value = [];
  const promises = [];
  for (const organ of authStore.organs) {
    promises.push(
      apiService.balance.getBalanceId(organ.id).then((res) => {
        organs.value.push({
          label: `${organ.firstName} ${organ.lastName}`,
          route: '/user/' + organ.id,
          notifications: res.data.amount.amount > 0 ? ' ' : '',
        });
      }),
    );
  }
  await Promise.all(promises);
  organs.value = organs.value.sort((a, b) => a.label.localeCompare(b.label));
};

onBeforeMount(async () => {
  await getOrgans();
});

const navItems = computed(() => [
  {
    label: t('common.navigation.transactions'),
    route: '/transaction',
  },
  {
    label: t('common.navigation.admin'),
    visible: isAllowed('update', ['all'], 'User', ['any']) || isAllowed('get', ['all'], 'Banner', ['any']),
    items: [
      {
        label: t('common.navigation.users'),
        route: '/user',
        visible: isAllowed('update', ['all'], 'User', ['any']),
      },
      {
        label: t('common.navigation.banners'),
        route: '/banner',
        visible: isAllowed('get', ['own'], 'Banner', ['any']),
      },
    ],
  },
  {
    label: t('common.navigation.financial'),
    notifications: getFinancialNotifications(),
    visible:
      isAllowed('update', ['all'], 'User', ['any']) ||
      isAllowed('get', ['all'], 'Invoice', ['any']) ||
      isAllowed('get', ['all'], 'Fine', ['any']) ||
      isAllowed('get', ['all'], 'SellerPayout', ['any']),
    items: [
      {
        label: t('common.navigation.users'),
        route: '/user',
        // TODO: Change to `action: get` after https://github.com/GEWIS/sudosos-backend/issues/62 is fully finished
        visible: isAllowed('update', ['all'], 'User', ['any']),
      },
      {
        label: t('common.navigation.invoices'),
        route: '/invoice',
        notifications: openInvoiceAccounts?.value,
        visible: isAllowed('get', ['all'], 'Invoice', ['any']),
      },
      {
        label: t('common.navigation.debtors'),
        route: '/debtor',
        visible: isAllowed('get', ['all'], 'Fine', ['any']),
      },
      {
        label: t('common.navigation.payouts'),
        route: '/payout',
        visible: isAllowed('get', ['all'], 'SellerPayout', ['any']),
        notifications: pendingPayouts?.value,
      },
      {
        label: t('common.navigation.writeOffs'),
        route: '/write-offs',
        visible: isAllowed('get', ['all'], 'WriteOff', ['any']),
        notifications: inactiveDebtors?.value,
      },
    ],
  },
  {
    label: t('common.navigation.seller'),
    items: [
      {
        label: t('common.navigation.productsContainers'),
        route: '/product',
        // TODO: Change to `action: get` after https://github.com/GEWIS/sudosos-backend/issues/62 is fully finished
        visible: isAllowed('get', ['own', 'organ'], 'Product', ['any']),
      },
      {
        label: t('common.navigation.pos'),
        route: '/point-of-sale',
        // TODO: Change to `action: get` after https://github.com/GEWIS/sudosos-backend/issues/62 is fully finished
        visible: isAllowed('update', ['own', 'organ'], 'PointOfSale', ['any']),
      },
      ...organs.value,
    ],
  },
]);

const profileItems = computed(() => [
  {
    label: firstName.value,
    items: [
      {
        label: t('common.navigation.profile'),
        route: '/profile',
      },
      {
        label: t('common.navigation.signOut'),
        command: handleLogout,
      },
    ],
  },
  {
    label: '',
    icon: 'pi pi-globe',
    items: [
      {
        label: t('common.navigation.dutch'),
        disabled: () => locale.value == 'nl',
        command: () => {
          locale.value = 'nl';
          localStorage.setItem('locale', 'nl');
        },
      },
      {
        label: t('common.navigation.english'),
        disabled: () => locale.value == 'en',
        command: () => {
          locale.value = 'en';
          localStorage.setItem('locale', 'en');
        },
      },
    ],
  },
]);

const mobileItems = computed(() => [...navItems.value, ...profileItems.value]);
</script>

<style scoped lang="scss">
@media screen and (min-width: 1000px) {
  .mb\:hidden {
    display: none !important;
  }
  .mb\:flex {
    display: flex !important;
  }
}

.navbar-background {
  background-color: var(--p-menubar-background);
}
</style>
