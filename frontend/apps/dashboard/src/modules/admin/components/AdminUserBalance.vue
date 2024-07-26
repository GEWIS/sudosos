<template>
  <CardComponent
      :header="$t('c_currentBalance.balance')"
  >
    <div class="flex flex-column justify-content-center">
      <div v-if="isLoading">
        <Skeleton class="h-4rem w-10rem mx-1rem my-6"/>
      </div>
      <h1 v-else class="text-center font-medium text-6xl">{{ displayBalance }}</h1>
      <p class="text-center text-base font-semibold text-red-500" v-if="userBalance && userBalance.fine">
        {{ isAllFine ? $t('c_currentBalance.allIsFines') : $t('c_currentBalance.someIsFines', { fine: displayFine }) }}
      </p>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import { computed, ref, onMounted, type Ref, watch } from "vue";
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { formatPrice } from "@/utils/formatterUtils";

const props = defineProps<{
    user: UserResponse | undefined;
}>();

const userBalance: Ref<BalanceResponse | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);
const updateUserBalance = async () => {
  if(props.user) {
    const response = await apiService.balance.getBalanceId(props.user.id);
    userBalance.value = response.data;
    isLoading.value = false;
  }
};

onMounted(updateUserBalance);

watch(() => props.user, () => {
  updateUserBalance();
});

const isAllFine = computed(() => {
  if (!userBalance.value?.fine) return false;
  return userBalance.value.fine.amount >= -1*userBalance.value?.amount.amount;
});

const displayFine = computed(() => {
  if (!userBalance.value?.fine) return undefined;
  return formatPrice(userBalance.value.fine || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayBalance = computed(() => {
  return formatPrice(userBalance.value?.amount || { amount: 0, currency: 'EUR', precision: 2 });
});
</script>

<style scoped lang="scss">
</style>
