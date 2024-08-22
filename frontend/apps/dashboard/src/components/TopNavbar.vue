
<template>
    <nav class="bg-primary w-full flex justify-content-around">
      <Menubar class="hidden mb:flex" :model="navItems">
          <template #start>
            <router-link to="/" class="no-underline text-white font-bold flex align-items-center flex-row py-1">
              {{ $t("login.SudoSOS") }}
              <img class="h-4rem py-2" src="../assets/img/gewis-branding.svg" alt="SudoSOS" />
            </router-link>
          </template>
          <template #item="{ item, props, hasSubmenu }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a :href="href" v-bind="props.action" @click="navigate" class="flex align-items-center justify-content-between">
                <span class="p-menuitem-text">{{ item.label }}</span>
                <span v-if="item.notifications" class="p-badge p-badge-danger">{{ item.notifications }}</span>
              </a>
            </router-link>
            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
              <div class="flex align-items-center justify-content-between">
                <span class="p-menuitem-text">{{ item.label }}</span>
                <span v-if="item.notifications" class="p-badge p-badge-no-gutter p-badge-danger-inverse ml-2">{{ item.notifications }}</span>
                <span v-else-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
              </div>
            </a>
          </template>
      </Menubar>
      <Menubar class="hidden mb:flex" :model="profileItems">
        <template #start>
          <img class="h-1rem" src="../assets/img/bier.png"/>
        </template>
        <template #item="{ item, props, hasSubmenu }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <span class="p-menuitem-text">{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <span class="p-menuitem-text">{{ item.label }}</span>
            <span v-if="item.icon" :class="item.icon" />
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
        </template>
      </Menubar>
      <Menubar
        class="flex mb:hidden flex-row flex-wrap justify-content-between mx-2 my-2 transition-all w-full"
        :model="mobileItems"
      >
        <template #start>
          <router-link to="/" class="no-underline text-white font-bold flex align-items-center flex-row py-1">
            {{ $t("login.SudoSOS") }}
            <img class="h-4rem py-2" src="../assets/img/gewis-branding.svg" alt="SudoSOS" />
          </router-link>
        </template>
        <template #item="{ item, props, hasSubmenu }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <span class="p-menuitem-text">{{ item.label}}</span>
              <span v-if="item.icon" :class="item.icon" />
            </a>
          </router-link>
          <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <span class="p-menuitem-text">{{ item.label}}</span>
              <span v-if="item.icon" :class="item.icon" />
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
        </template>
      </Menubar>
    </nav>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from "vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { useRouter } from "vue-router";
import { UserRole } from "@/utils/rbacUtils";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/utils/formatterUtils";
import { usePendingPayouts } from "@/mixins/pendingPayoutsMixin";

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const { t, locale } = useI18n();

const balance = computed((): string | undefined => {
  const balanceInCents = userStore.getCurrentUser.balance;
  if (!balanceInCents) return undefined;
  return formatPrice(balanceInCents.amount);
});

const firstName = computed((): string | undefined => {
  return userStore.getCurrentUser.user ? userStore.getCurrentUser.user.firstName : undefined;
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const isBoard = () => {
  return userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BOARD) != -1;
};

const isBAC = () => {
  return userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BAC) != -1;
};

const isSeller = () => {
  return userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.SELLER) != -1;
};

const isBACPM = () => {
  return userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BAC_PM) != -1;
};

const { pendingPayouts } = usePendingPayouts();
const getFinancialNotifications = () => pendingPayouts?.value;

const navItems = computed(() => [
  {
    label: t('app.Transactions'),
    route: '/transactions'
  },
  {
    label: t('app.Admin'),
    visible: isBoard(),
    items: [
      {
        label: t('app.User overview'),
        route: '/user-overview'
      },
      {
        label: t('app.Banners'),
        route: '/banners'
      },
    ],
  },
  {
    label: t('app.Financial'),
    visible: isBACPM(),
    notifications: getFinancialNotifications(),
    items: [
      {
        label: t('app.User overview'),
        route: '/user-overview',
      },
      {
        label: t('flagged.Flagged transactions'),
      },
      {
        label: t('app.Social drink cards'),
      },
      {
        label: t('app.Invoices'),
        route: '/invoice',
      },
      {
        label: t('fine.fineOverview'),
        route: '/fine',
      },
      {
        label: t('payout.Payouts'),
        route: '/payouts',
        notifications: pendingPayouts?.value
      }
    ]
  },
  {
    label: t('app.Seller'),
    visible: isSeller(),
    items: [
      {
        label: t('app.Manage products'),
        route: '/manage-products',
      },
      {
        label: t('app.Overview'),
        route: '/point-of-sale/overview',
      }
    ]
  },
]);

const profileItems = computed(() =>[
  {
    label: firstName.value,
    items: [
      {
        label: t('app.Profile'),
        route: '/profile',
      },
      {
        label: t('app.Sign out'),
        command: handleLogout,
      },
    ]
  },
  {
    label: '',
    icon: 'pi pi-globe',
    items: [
      {
        label: t('app.Netherlands'),
        disabled: () => locale.value == 'nl',
        command: () => {
          locale.value = 'nl';
          localStorage.setItem('locale', 'nl');
        },
      },
      {
        label: t('app.English'),
        disabled: () => locale.value == 'en',
        command: () => {
          locale.value = 'en';
          localStorage.setItem('locale', 'en');
        },
      },
    ]
  },
]);

const mobileItems = computed(() => [
  ...navItems.value,
  ...profileItems.value,
]);

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
</style>
