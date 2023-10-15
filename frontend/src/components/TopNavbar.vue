
<template>
  <div class="container">
    <nav>
      <Menubar :model="leftItems" >
        <template #start>
          <router-link to="/" id="sudosos">
            {{ $t("login.SudoSOS") }}
            <img id="logo" src="../assets/img/gewis-branding.svg" alt="SudoSOS" />
          </router-link>

        </template>
      </Menubar>
      <Menubar :model="rightItems">
        <template #start>
          <img id="bier" src="../assets/img/bier.png"/>
        </template>
      </Menubar>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { useRouter } from "vue-router";
import {UserRole} from "@/utils/rbacUtils";

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const balance = computed((): string | undefined => {
  const balanceInCents = userStore.getCurrentUser.balance;
  if (!balanceInCents) return undefined;
  const balanceInEuros = (balanceInCents.amount.amount / 100).toFixed(2);
  return `€${balanceInEuros}`;
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
    label: 'Transactions'
  },
  {
    label: 'Balance',
    to: '/balance',
  },
  {
    label: 'Points of Sale',
    visible: isSeller(),
    items: [
      {
        label: 'POS Overview',
        to: '/point-of-sale/overview',
      },
      {
        label: 'Create POS',
        to: '/point-of-sale/request'
      }
    ]
  },
  {
    label: 'Admin',
    visible: isAdmin(),
    items: [
      {
        label: 'Manage POS',
      },
      {
        label: 'TV Screens',
      },
      {
        label: 'Banners',
      },
    ],
  },
  {
    label: 'BAC',
    visible: isBAC(),
    items: [
      {
        label: 'User Overview',
        to: '/user-overview',
      },
      {
        label: 'Flagged Transactions',
      },
      {
        label: 'Manage Products',
        to: '/manage-products',
      },
      {
        label: 'Social Drink Cards',
      }
    ]
  },
    ]);

const rightItems = ref([
  {
    label: firstName,
    items: [
      {
        label: 'Profile',
      },
      {
        label: 'Sign Out',
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
        label: 'Nederlands',
      },
      {
        label: 'English',
      },
    ]
  },
]);

</script>

<style scoped lang="scss">

.container {
  background-color: #d40000;
  display: flex;
  width: 100%;
  justify-content: space-around;
  line-height: 1.5;
  padding: 0.5rem 1rem;
}
nav {
  display: flex;
  flex-direction: row;
  max-width: 1180px;
  width: 100%;
  justify-content: space-between;


  .p-menubar {
    background-color: #d40000;
    padding: 0 1rem;
  }
}

:deep(.p-menuitem-text){
  color: white;
  font-family: Raleway, sans-serif;
  font-weight: 500;
  font-size: 1rem;
  padding-right: 5px;
}

// Define normal top-level menu-items
:deep(.p-menuitem) {
  &.p-focus, &.p-focus, &.p-highlight > .p-menuitem-content {
    background-color: transparent;
    > a > * {
      color: hsla(0, 0%, 100%, .75);
    }
  }

  .p-menuitem-content {
    > a {
      padding: 0 0.5rem;
      > * {
        color: white;
        transition: color .2s linear;
      }
    }
    &:hover {
      > a {
        &:hover {
          background-color: transparent;
        }

        > * {
          color: hsla(0, 0%, 100%, .75);
        }
      }
    }
  }
}

// Define an exception for submenu-items
:deep(.p-submenu-list .p-menuitem){
  .p-menuitem-content > a > * {
    color: black;
  }
}

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
