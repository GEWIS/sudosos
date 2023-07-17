<template>
<Menubar :model="items">

</Menubar>
</template>

<script setup>
import { ref } from "vue";

const items = ref([
  {
    label: 'SudoSOS'
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
    label: 'BAC'
  },
    ])
</script>

<style scoped>

</style>
