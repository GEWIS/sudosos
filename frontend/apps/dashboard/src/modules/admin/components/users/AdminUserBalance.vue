<template>
  <CardComponent
      :header="t('modules.admin.singleUser.balance.header')"
      :func="userBalance?.fine ? waiveFines : undefined"
      :action="userBalance?.fine ? t('modules.admin.singleUser.balance.waiveFines') : undefined"
  >
    <div class="flex flex-column justify-content-center">
      <div v-if="isLoading">
        <Skeleton class="h-4rem w-10rem mx-1rem my-6"/>
      </div>
      <h1 v-else class="text-center font-medium text-6xl">{{ displayBalance }}</h1>
      <p class="text-center text-base font-semibold text-red-500" v-if="userBalance && userBalance.fine">
        {{ isAllFine ?
          t('modules.admin.singleUser.balance.allIsFines')
          : t('modules.admin.singleUser.balance.someIsFines', { fine: displayFine }) }}
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
import { useConfirm } from "primevue/useconfirm";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";

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
    message: t('modules.admin.singleUser.balance.waiveFinesConfirmation' ),
    header: t('modules.admin.singleUser.balance.waiveFinesConfirmationTitle'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      await apiService.user.waiveUserFines(props.user?.id as number).then(() => { // Use 'as number' instead of <number>
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.waiveFinesSuccess'),
          life: 3000
        });
        updateUserBalance();
      });
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: t('common.toast.canceled'),
        detail: t('common.toast.reject.waiveFinesRejected'),
        life: 3000
      });
    },
  });
};
</script>

<style scoped lang="scss">
</style>
