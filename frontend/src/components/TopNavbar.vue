
<template>
    <nav class="bg-primary w-full flex justify-content-around">
        <Menubar class="hidden md:flex" :model="leftItems">
          <template #start>
            <router-link to="/" class="no-underline text-white font-bold flex align-items-center flex-row py-1">
              {{ $t("login.SudoSOS") }}
              <img class="h-4rem py-2" src="../assets/img/gewis-branding.svg" alt="SudoSOS" />
            </router-link>
          </template>
          <template #item="{ item, props, hasSubmenu }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a :href="href" v-bind="props.action" @click="navigate">
                <span class="p-menuitem-text">{{ item.label }}</span>
              </a>
            </router-link>
            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
              <span class="p-menuitem-text">{{ item.label }}</span>
              <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
            </a>
          </template>
        </Menubar>
      <Menubar class="hidden md:flex" :model="rightItems">
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
        class="flex md:hidden flex-row flex-wrap justify-content-between mx-2 my-2 transition-all w-full"
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
import { computed, ref } from "vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { useRouter } from "vue-router";
import { UserRole } from "@/utils/rbacUtils";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/utils/formatterUtils";

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

const isAdmin = () => {
  return authStore.roles.includes(UserRole.BOARD);
};

const isBAC = () => {
  return authStore.roles.includes(UserRole.BAC);
};

const isSeller = () => {
  return authStore.roles.includes(UserRole.SELLER);
};

const leftItems = ref([
  {
    label: t('app.Transactions'),
    route: '/transactions'
  },
  {
    label: t('app.Balance'),
    route: '/balance',
  },
  {
    label: t('app.Points of Sale'),
    visible: isSeller(),
    items: [
      {
        label: t('app.Overview'),
        route: '/point-of-sale/overview',
      },
      {
        label: t('app.Create POS'),
        route: '/point-of-sale/request'
      }
    ]
  },
  {
    label: t('app.Admin'),
    visible: isAdmin(),
    items: [
      {
        label: t('app.Manage POS'),
      },
      {
        label: t('app.Screens'),
      },
      {
        label: t('app.Banners'),
      },
    ],
  },
  {
    label: t('app.BAC'),
    visible: isBAC(),
    items: [
      {
        label: t('app.User overview'),
        route: '/user-overview',
      },
      {
        label: t('flagged.Flagged transactions'),
      },
      {
        label: t('app.Manage products'),
        route: '/manage-products',
      },
      {
        label: t('app.Social drink cards'),
      },
      {
        label: t('fine.fineOverview'),
        route: '/fine',
      },
    ]
  },
    ]);

const rightItems = ref([
  {
    label: firstName,
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
    label: balance,
    route: '/balance',
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

const mobileItems = ref([
  {
    label: t('app.Transactions'),
  },
  {
    label: t('app.Balance'),
    route: '/balance',
  },
  {
    label: t('app.Points of Sale'),
    visible: isSeller(),
    items: [
      {
        label: t('app.Overview'),
        route: '/point-of-sale/overview',
      },
      {
        label: t('app.Create POS'),
        route: '/point-of-sale/request'
      }
    ]
  },
  {
    label: t('app.Admin'),
    visible: isAdmin(),
    items: [
      {
        label: t('app.Manage POS'),
      },
      {
        label: t('app.Screens'),
      },
      {
        label: t('app.Banners'),
      },
    ],
  },
  {
    label: t('app.BAC'),
    visible: isBAC(),
    items: [
      {
        label: t('app.User overview'),
        route: '/user-overview',
      },
      {
        label: t('flagged.Flagged transactions'),
      },
      {
        label: t('app.Manage products'),
        route: '/manage-products',
      },
      {
        label: t('app.Social drink cards'),
      },
      {
        label: t('fine.fineOverview'),
        route: '/fine',
      },
    ]
  },
  {
    label: firstName,
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
    label: balance,
    route: '/balance',
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

</script>

<style scoped lang="scss">
</style>
