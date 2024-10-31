<template>
  <CardComponent
    :header="t('modules.admin.singleUser.balance.header')"
    :action="getAction"
    :routerLink="getRouterLink"
    :routerParams="getRouterParams"
    :func="!isOrgan ? openFineWaiveModal : undefined"
    class="w-19rem"
  >
    <div class="flex flex-column justify-content-center">
      <div v-if="userBalance === null">
        <Skeleton class="h-4rem w-10rem mx-1rem my-6"/>
      </div>
      <h1 v-else class="text-center font-medium text-6xl">{{ displayBalance }}</h1>
      <p class="text-center text-base font-semibold text-red-500" v-if="userBalance && userBalance.fine">
        {{ isAllFine ?
          t('modules.admin.singleUser.balance.allIsFines')
          : t('modules.admin.singleUser.balance.someIsFines', { fine: displayFine }) }}
      </p>
    </div>
    <AdminUserFineWaiveModal
        v-if="userBalance"
        :user="props.user"
        :balance="userBalance"
        v-model:is-visible="isFineWaiveModalVisible" />
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import { computed, ref, onMounted, watch, type ComputedRef } from "vue";
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { formatPrice } from "@/utils/formatterUtils";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import AdminUserFineWaiveModal from "@/modules/admin/components/users/AdminUserFineWaiveModal.vue";
import Dinero from "dinero.js";

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
  return userBalance.value?.fine
      ? t('modules.admin.singleUser.balance.waiveFinesConfirmationTitle')
      : undefined;
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
  return userBalance.value.fine.amount >= -1*userBalance.value?.amount.amount;
});

const displayFine = computed(() => {
  if (!userBalance.value?.fine) return undefined;
  return formatPrice(
      Dinero(userBalance.value.fine as Dinero.Options)
          .subtract(
              Dinero(userBalance.value.fineWaived as Dinero.Options
                  || { amount: 0, currency: 'EUR', precision: 2 })
          ).toObject()
      || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayBalance = computed(() => {
  return formatPrice(userBalance.value?.amount || { amount: 0, currency: 'EUR', precision: 2 });
});

const openFineWaiveModal = () => {
  isFineWaiveModalVisible.value = true;
};
</script>

<style scoped lang="scss">
</style>
