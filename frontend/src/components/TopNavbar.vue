<template>
  <div class="navbar">
    <Menubar :model="leftItems" />
    <Menubar :model="rightItems" />
  </div>
</template>

<script setup>
import { ref } from "vue";

const leftItems = ref([ // TODO: Implement Submenus
  {
    label: 'SudoSOS', // TODO: Do fancy logo
  },
  {
    label: 'Transactions'
  },
  {
    label: 'Balance'
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
    label: '€420.69' // TODO: Implement Balance Getter
  },
  {
    label: 'World'
  },
])
</script>

<style scoped lang="scss">
.navbar {
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: #d40000;
  position: absolute;
  top: 0;
  left: 0;
  justify-content: space-between;

  .p-menubar {
    background-color: #d40000;
  }
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link .p-menuitem-text) {
  color: white;
}

</style>
