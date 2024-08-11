<template>
  <div v-if="payout">
    <div class="flex flex-column gap-2">
      <span>{{ $t('payout.Requested by') }} <UserLink :user="payout.requestedBy"/></span>
      <div v-if="isCreated">
        <skeleton v-if="userBalance === null" class="w-6 my-1 h-0.5rem surface-300"/>
        <div v-else
             :class="{'text-sm text-gray-700': !overBalance, 'text-red-500 font-bold': overBalance}">
          <div class="flex flex-row gap-1">
            <span v-if="overBalance"><i class="pi pi-exclamation-triangle"></i></span>
            <span v-if="userBalance">
            {{ t('payout.Current balance', { balance: formatPrice(userBalance.amount) }) }}
            </span>
            <span v-else>
              {{ t('payout.Current balance', { balance: '-' }) }}
            </span>
          </div>
        </div>
      </div>
      <table class="table text-left my-1">
        <thead>
        <tr>
          <th>{{ $t('payout.BankAccountNumber') }}</th>
          <th>{{ $t('payout.AccountName') }}</th>
          <th>{{ $t('payout.Amount') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="!loading">
          <td>{{ (payout as PayoutRequestResponse).bankAccountNumber }}</td>
          <td>{{ (payout as PayoutRequestResponse).bankAccountName }}</td>
          <td>{{ formatPrice(payout.amount) }}</td>
        </tr>
        <tr v-else>
          <td><Skeleton class="w-6 my-1 h-1rem surface-300"/></td>
          <td><Skeleton class="w-6 my-1 h-1rem surface-300"/></td>
          <td><Skeleton class="w-6 my-1 h-1rem surface-300"/></td>
        </tr>
        </tbody>
      </table>
      <div class="flex flex-column">
        <span>{{ $t('payout.CreatedAt') + ': '}}{{ formatDateFromString(payout.createdAt) }}</span>
        <span>{{ $t('payout.UpdatedAt') + ': '}}{{ formatDateFromString(payout.updatedAt) }}</span>
        <span>{{ $t('payout.PayoutID') + ': ' }}{{ payout.id }}</span>
      </div>
    </div>
    <div v-if="isApproved && payout.approvedBy" class="mt-1">
      <span class="font-italic text-sm">
        {{ t('payout.ApprovedBy', {approvedBy: payout.approvedBy.firstName + ' ' + payout.approvedBy.lastName}) }}
      </span>
    </div>
    <div class="flex flex-row gap-2 justify-content-end w-full mt-3">
      <div v-if="isCreated" class="flex flex-row gap-2">
        <Button
            severity="success"
            :label="$t('common.approve')"
            icon="pi pi-check"
            @click="approvePayout"
        />
        <Button
            severity="danger"
            :label="$t('common.deny')"
            icon="pi pi-times"
            @click="denyPayout"
        />
      </div>
      <Button
          v-else
          type="button"
          icon="pi pi-file-export"
          :disabled="downloadingPdf"
          severity="danger"
          :label="$t('common.download PDF')"
          @click="() => downloadPdf(payoutId)"
      />
      <Button
          severity="secondary"
          :label="$t('common.close')"
          icon="pi pi-times"
          @click="closeModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PayoutResponse, usePayoutStore } from "@/stores/payout.store";
import { computed, type ComputedRef, onMounted, type Ref, ref } from "vue";
import type {
   BalanceResponse, PayoutRequestResponse,
} from "@sudosos/sudosos-client";
import { PayoutRequestStatusRequestStateEnum } from "@sudosos/sudosos-client";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import { getPayoutPdfSrc } from "@/utils/urlUtils";
import { formatDateFromString, formatPrice } from "sudosos-dashboard/src/utils/formatterUtils";
import apiService from "@/services/ApiService";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import UserLink from "@/components/UserLink.vue";

const { t } = useI18n();
const toast = useToast();

const emits = defineEmits(['close', 'payout:approved', 'payout:denied']);

const props = defineProps({
  payoutId: {
    type: Number,
    required: true,
  }
});

// Retrieve all payouts with the given state
const payoutStore = usePayoutStore();
const payout: ComputedRef<PayoutResponse | null> = computed(() => payoutStore.getPayout(props.payoutId));

// null if the balance has not been fetched yet
const userBalance: Ref<BalanceResponse | null | undefined> = ref(null);

const loading = ref<boolean>(true);
const downloadingPdf = ref<boolean>(false);

const isApproved = computed(() => {
  if (!payout.value) return false;
  return payout.value.status === PayoutRequestStatusRequestStateEnum.Approved;
});

const isCreated = computed(() => {
  if (!payout.value) return false;
  return payout.value.status === PayoutRequestStatusRequestStateEnum.Created;
});

const overBalance = computed(() => {
  if (!payout.value) return false;
  if (!userBalance.value) return false;
  return userBalance.value.amount < payout.value.amount;
});

// fetch payout details and user balance
onMounted(() => {
  loading.value = true;
  payoutStore.fetchPayout(props.payoutId).catch((err) => {
    handleError(err, toast);
  }).finally(() => {
    loading.value = false;
  });
  if (!payout.value) return;
  apiService.balance.getBalanceId(payout.value.requestedBy.id).then((res) => {
    userBalance.value = res.data;
  }).catch(() => {
    userBalance.value = undefined;
  });
});

const approvePayout = async () => {
  if (!payout.value) return;
  await payoutStore.approvePayout(payout.value.id).then(() => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Payout approved successfully.', life: 3000 });
    emits('payout:approved');
    emits('close');
  }).catch((err) => handleError(err, toast));
};

const denyPayout = async () => {
  if (!payout.value) return;
  await payoutStore.denyPayout(payout.value.id).then(() => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Payout denied successfully.', life: 3000 });
    emits('payout:denied');
    emits('close');
  }).catch((err) => handleError(err, toast));
};

const closeModal = () => {
  emits('close');
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  const result = await payoutStore.fetchPdf(id);
  window.location.href = getPayoutPdfSrc(result);
  downloadingPdf.value = false;
};

</script>

<style scoped lang="scss">
</style>
