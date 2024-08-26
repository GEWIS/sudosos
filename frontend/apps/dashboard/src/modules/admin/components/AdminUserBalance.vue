<template>
  <CardComponent
      :header="$t('c_currentBalance.balance')"
      :func="userBalance?.fine ? waiveFines : undefined"
      :action="userBalance?.fine ? $t('c_currentBalance.waiveFines') : undefined"
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
    <ConfirmDialog />
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import { computed, ref, onMounted, type Ref, watch } from "vue";
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { formatPrice } from "@/utils/formatterUtils";
import ConfirmDialog from "primevue/confirmdialog";
import {useConfirm} from "primevue/useconfirm";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";

const props = defineProps<{
    user: UserResponse | undefined;
}>();

const confirm = useConfirm();
const { t } = useI18n();
const toast = useToast();

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

const waiveFines = () => {
  if (!props.user || !props.user.id) return;
  confirm.require({
    message: t('c_currentBalance.waiveFinesConfirmation' ),
    header: t('c_currentBalance.waiveFinesConfirmationTitle'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      await apiService.user.waiveUserFines(<number>props.user?.id).then(() => {
        toast.add({
          severity: 'success',
          summary: t('successMessages.success'),
          detail: t('successMessages.waiveFinesSuccess'),
          life: 3000
        });
        updateUserBalance();
      });
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: t('successMessages.canceled'),
        detail: t('successMessages.waiveFinesRejected'),
        life: 3000
      });
    },
  });
}
</script>

<style scoped lang="scss">
</style>
