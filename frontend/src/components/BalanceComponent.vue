<template>
  <CardComponent header="balance" action="Increase Online" routerLink="balance">
      <div class="body">
        <h1>{{ balance }}</h1>
      </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { computed } from "vue";

const userStore = useUserStore();
const balance = computed((): string | undefined => {
  const balanceInCents = userStore.getCurrentUser.balance;
  if (!balanceInCents) return undefined;
  const balanceInEuros = (balanceInCents.amount.amount / 100).toFixed(2);
  return `€${balanceInEuros}`;
});

</script>

<style scoped lang="scss">
h1 {
  font-size: 50px;
  text-align: center;
  font-family: Raleway, sans-serif!important;
  font-weight: 500;
}
</style>
