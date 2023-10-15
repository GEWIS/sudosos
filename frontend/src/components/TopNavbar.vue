
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
  return authStore.roles.indexOf('SudoSOS - Board') !== -1;
}

const isBAC = () => {
  return authStore.roles.indexOf('SudoSOS - BAC') !== -1;
}

const isSeller = () => {
  return authStore.roles.indexOf('Seller') !== -1;
}

console.log(authStore.roles);

// TODO: Style the hovering of buttons
const leftItems = ref([ // TODO: Implement Submenus
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
    label: 'BAC', // TODO: Implement RBAC Determination for permissions
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

// TODO: fix wonky fucking background colors man
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
  }
}

:deep(.p-menuitem-icon) {
  color: white!important;
}

:deep(.p-menubar){
  padding: 0 1rem;
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link .p-menuitem-text) {
  color: white;
  font-family: Raleway, sans-serif;
  font-weight: 500;
  font-size: 1rem;
  padding-right: 5px;
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

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link .p-submenu-icon){
  color: white;
}

:deep(a:hover){
  background-color: transparent;
}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled) >
 .p-menuitem-content:hover .p-menuitem-link .p-menuitem-text){
  color: hsla(0,0%,100%,.5)!important;
}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled) >
 .p-menuitem-content .p-menuitem-link .p-menuitem-text) {
  transition: color .2s linear;
}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled) >
 .p-menuitem-content:hover .p-menuitem-link svg){
  color: hsla(0,0%,100%,.5)!important;

}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled) >
 .p-menuitem-content .p-menuitem-link svg){
  transition: color .2s linear;
}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled).p-focus > .p-menuitem-content){
  background-color: transparent;
}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled).p-focus >
 .p-menuitem-content .p-menuitem-link .p-menuitem-text){
  color: hsla(0,0%,100%,.5)!important;
}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled).p-focus > .p-menuitem-content .p-menuitem-link svg){
  color: hsla(0,0%,100%,.5)!important;
}

:deep(.p-menubar .p-menuitem.p-highlight > .p-menuitem-content){
  background-color: transparent!important;

}

:deep(.p-menubar .p-menuitem.p-highlight > .p-menuitem-content .p-menuitem-link .p-menuitem-text){
  color: hsla(0, 0%, 100%, .5)!important;
}

:deep(.p-menubar .p-menuitem:not(.p-highlight):not(.p-disabled) > .p-menuitem-content:hover) {
  background-color: lightgray;
}

:deep(.p-menubar .p-menubar-root-list .p-menuitem-active .p-submenu-list >
 .p-menuitem > .p-menuitem-content:hover .p-menuitem-link .p-menuitem-text){
  color: black!important;
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link) {
  padding: 0 0.5rem;
}

#bier {
  height: 12px;
}
</style>
