
<template>
    <nav class="bg-primary w-full flex justify-content-around">
      <Menubar class="hidden mb:flex" :model="navItems">
          <template #start>
            <router-link to="/" class="no-underline text-white font-bold flex align-items-center flex-row py-1">
              {{ t("common.sudosos") }}
              <img class="h-4rem py-2" src="../assets/img/gewis-branding.svg" alt="SudoSOS" />
            </router-link>
          </template>
          <template #item="{ item, props, hasSubmenu }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a :href="href"
                 v-bind="props.action"
                 @click="navigate"
                 class="flex align-items-center justify-content-between"
              >
                <span class="p-menuitem-text">{{ item.label }}</span>
                <span v-if="item.notifications" class="p-badge p-badge-danger">{{ item.notifications }}</span>
              </a>
            </router-link>
            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
              <div class="flex align-items-center justify-content-between">
                <span class="p-menuitem-text">{{ item.label }}</span>
                <span
                    v-if="item.notifications"
                    class="p-badge p-badge-no-gutter p-badge-danger-inverse ml-2">
                  {{ item.notifications }}
                </span>
                <span v-else-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
              </div>
            </a>
          </template>
      </Menubar>
      <Menubar class="hidden mb:flex" :model="profileItems">
        <template #start>
          <img class="h-1rem" src="../assets/img/bier.png" alt="beer"/>
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
            {{ t("modules.auth.login.sudosos") }}
            <img class="h-4rem py-2" src="../assets/img/gewis-branding.svg" alt="SudoSOS" />
          </router-link>
        </template>
        <template #item="{ item, props, hasSubmenu }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <span class="p-menuitem-text">{{ item.label }}</span>
              <span v-if="item.icon" :class="item.icon" />
            </a>
          </router-link>
          <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <span class="p-menuitem-text">{{ item.label }}</span>
              <span v-if="item.icon" :class="item.icon" />
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
        </template>
      </Menubar>
    </nav>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, type Ref } from "vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { useRouter } from "vue-router";
import { UserRole } from "@/utils/rbacUtils";
import { useI18n } from "vue-i18n";
import { usePendingPayouts } from "@/mixins/pendingPayoutsMixin";
import apiService from "@/services/ApiService";
import { GetAllUsersTypeEnum } from "@sudosos/sudosos-client";

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const { t, locale } = useI18n();

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

const isSeller = () => {
  return userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.SELLER) != -1;
};

const isBACPM = () => {
  return userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BAC_PM) != -1;
};

const { pendingPayouts } = usePendingPayouts();
const getFinancialNotifications = () => pendingPayouts?.value;

const organs: Ref<any[]> = ref([]);

const getOrgans = async () => {
  organs.value = [];
  const promises = [];
  for (let organ of authStore.organs) {
    promises.push(apiService.balance.getBalanceId(organ.id).then((res) => {
      organs.value.push({
        label: `${organ.firstName} ${organ.lastName}`,
        route: '/user/' + organ.id,
        notifications: res.data.amount.amount > 0 ? ' ' : '',
      });
    }));
  }
  await Promise.all(promises);
  organs.value = organs.value.sort((a, b) => a.label.localeCompare(b.label));
};

const getAllOrgans = async () => {
  organs.value = [];
  const promises: Promise<any>[] = [];
  await apiService.user.getAllUsers(100, undefined, undefined, undefined, undefined,
      undefined, GetAllUsersTypeEnum.Organ).then((res) => {
    const orgs = res.data.records;
    orgs.forEach((organ) => {
      promises.push(apiService.balance.getBalanceId(organ.id).then((res) => {
        organs.value.push({
          label: organ.firstName + ' ' + organ.lastName,
          route: '/user/' + organ.id,
          notifications: res.data.amount.amount > 0 ? ' ' : '',
        });
      }));
    });
  });
  await Promise.all(promises);
  organs.value = organs.value.sort((a, b) => a.label.localeCompare(b.label));
};

onBeforeMount(async () => {
  await getOrgans();
});

const navItems = computed(() => [
  {
    label: t('common.navigation.transactions'),
    route: '/transaction'
  },
  {
    label: t('common.navigation.admin'),
    visible: isBoard(),
    items: [
      {
        label: t('common.navigation.users'),
        route: '/user'
      },
      {
        label: t('common.navigation.banners'),
        route: '/banner'
      },
    ],
  },
  {
    label: t('common.navigation.financial'),
    visible: isBACPM(),
    notifications: getFinancialNotifications(),
    items: [
      {
        label: t('common.navigation.users'),
        route: '/user',
      },
      {
        label: t('common.navigation.invoices'),
        route: '/invoice',
      },
      {
        label: t('common.navigation.fines'),
        route: '/fine',
      },
      {
        label: t('common.navigation.payouts'),
        route: '/payout',
        notifications: pendingPayouts?.value
      }
    ]
  },
  {
    label: t('common.navigation.seller'),
    visible: isSeller(),
    items: [
      {
        label: t('common.navigation.productsContainers'),
        route: '/product',
      },
      {
        label: t('common.navigation.pos'),
        route: '/point-of-sale',
      },
        ...organs.value,
    ]
  },
]);

const profileItems = computed(() =>[
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
    ]
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
