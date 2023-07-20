
<template>
  <div class="container">
    <nav>
      <Menubar :model="leftItems" >
        <template #start>
          <a id="sudosos" href="https://sudosos.gewis.nl/">SudoSOS<img id="logo" src="../assets/img/gewis-branding.svg"></a>

        </template>
      </Menubar>
      <Menubar :model="rightItems" />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useUserStore} from "@sudosos/sudosos-frontend-common";
import {computed} from "vue";

const userStore = useUserStore();
const balance = computed((): number | undefined => {
  const balance = userStore.getCurrentUser.balance;
  if (!balance) return undefined
  return balance.amount.amount;
})

// TODO: Style the hovering of buttons
const leftItems = ref([ // TODO: Implement Submenus
  {
    label: 'Transactions'
  },
  {
    label: 'Balance',
    to: 'balance',
  },
  {
    label: 'Points of Sale'
  },
  {
    label: 'BAC' // TODO: Implement RBAC Determination for permissions
  },
    ])

const rightItems = ref([
  {
    label: 'Robin' // TODO: Implement User Getter
  },
  {
    label: `€${(balance.value / 100).toFixed(2)}`, // TODO: Implement Balance Getter
  },
  {
    label: 'World'
  },
])


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
  }
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
}

#sudosos {
  color: white;
  font-weight: 700;
  font-family: Raleway, sans-serif;
  display: flex;
  flex-direction: row;
  align-items: center;
}

</style>
