
<template>
    <nav class="bg-primary w-full flex justify-content-around">
        <Menubar class="hidden md:flex" :model="leftItems">
          <template #start>
            <router-link to="/" id="sudosos">
              {{ $t("login.SudoSOS") }}
              <img id="logo" src="../assets/img/gewis-branding.svg" alt="SudoSOS" />
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
          <img id="bier" src="../assets/img/bier.png"/>
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
      <Menubar class="flex md:hidden" :model="mobileItems">
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

console.log(isSeller(), isAdmin(), isBAC());

const leftItems = ref([
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
      }
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
    label: balance, // TODO: Fix balance view
                    // See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/28
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
      }
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
    label: balance, // TODO: Fix balance view
                    // See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/28
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
// Define normal top-level menu-items
//:deep(.p-menuitem) {
//  .p-menuitem-content {
//    > a {
//      > * {
//        //color: white;
//        transition: color .2s linear;
//      }
//    }
//    &:hover {
//      > a {
//        &:hover {
//          background-color: transparent;
//        }
//
//        > * {
//          color: hsla(0, 0%, 100%, .75);
//        }
//      }
//    }
//  }
//}
//
//:deep(.p-submenu-list){
//  //padding: 0.5rem 0;
//  width: fit-content;
//  height: fit-content;
//}
//
//// Define an exception for submenu-items
//:deep(.p-submenu-list .p-menuitem){
//
//  font-size: 1rem;
//  white-space: nowrap;
//  .p-menuitem-content > a > * {
//    //padding: 0.5rem 1.5rem;
//    //color: black;
//    font-weight: 400;
//  }
//}

#logo {
  height: 65px;
  padding-top: 8px;
  padding-bottom: 8px;
}

#sudosos {
  color: white;
  font-weight: 700;
  font-family: Raleway, sans-serif;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.3125rem 0;
}

:deep(svg){
  margin: 0!important;
}

#bier {
  height: 12px;
}
</style>
