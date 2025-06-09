<template>
  <CardComponent
    :action="getAction"
    class="w-19rem"
    :func="!isOrgan ? openFineWaiveModal : undefined"
    :header="t('modules.admin.singleUser.balance.header')"
    :router-link="getRouterLink"
    :router-params="getRouterParams"
  >
    <div class="flex flex-col justify-center">
      <div v-if="userBalance === null">
        <Skeleton class="h-4rem mx-1rem my-6 w-10rem" />
      </div>
      <h1 v-else class="font-medium text-6xl text-center">{{ displayBalance }}</h1>
      <p v-if="userBalance && userBalance.fine" class="font-semibold text-base text-center text-red-500">
        {{
          isAllFine
            ? t('modules.admin.singleUser.balance.allIsFines')
            : t('modules.admin.singleUser.balance.someIsFines', { fine: displayFine })
        }}
      </p>
    </div>
    <AdminUserFineWaiveModal
      v-if="userBalance"
      v-model:is-visible="isFineWaiveModalVisible"
      :balance="userBalance"
      :user="props.user"
    />
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, type ComputedRef } from 'vue';
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
// eslint-disable-next-line import/no-named-as-default
import Dinero from 'dinero.js';
import apiService from '@/services/ApiService';
import { formatPrice } from '@/utils/formatterUtils';
import AdminUserFineWaiveModal from '@/modules/admin/components/users/AdminUserFineWaiveModal.vue';
import CardComponent from '@/components/CardComponent.vue';

const props = defineProps<{
  user: UserResponse;
}>();

const { t } = useI18n();
const userStore = useUserStore();

const userBalance: ComputedRef<BalanceResponse | null> = computed(() => {
  return userStore.getBalanceById(props.user.id);
});
const isOrgan = computed(() => props.user?.type == 'ORGAN');
const isFineWaiveModalVisible = ref(false);

const getAction = computed(() => {
  if (isOrgan.value) {
    return t('modules.seller.payouts.payout.CreatePayout');
  }
  return userBalance.value?.fine ? t('modules.admin.singleUser.balance.waiveFinesConfirmationTitle') : undefined;
});

const getRouterLink = computed(() => {
  if (isOrgan.value) {
    return 'sellerPayouts';
  }
  return undefined;
});

const getRouterParams = computed(() => {
  if (isOrgan.value && props.user) {
    return { id: props.user.id, name: props.user.firstName };
  }
  return undefined;
});

// Ideally this is done less dirty, and instead of refreshing, we make the mutations from the store reactive
const emit = defineEmits(['updateMutations']);
watch(userBalance, () => {
  emit('updateMutations');
});

onMounted(async () => {
  await userStore.fetchUserBalance(props.user.id, apiService);
});

const isAllFine = computed(() => {
  if (!userBalance.value?.fine) return false;
  return userBalance.value.fine.amount >= -1 * userBalance.value?.amount.amount;
});

const displayFine = computed(() => {
  if (!userBalance.value?.fine) return undefined;
  return formatPrice(
    Dinero(userBalance.value.fine as Dinero.Options)
      .subtract(
        Dinero((userBalance.value.fineWaived as Dinero.Options) || { amount: 0, currency: 'EUR', precision: 2 }),
      )
      .toObject() || { amount: 0, currency: 'EUR', precision: 2 },
  );
});

const displayBalance = computed(() => {
  return formatPrice(userBalance.value?.amount || { amount: 0, currency: 'EUR', precision: 2 });
});

const openFineWaiveModal = () => {
  isFineWaiveModalVisible.value = true;
};
</script>

<style scoped lang="scss"></style>
