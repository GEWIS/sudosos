<template>
  <PageContainer>
    <div v-if="isLoading && !voucherGroup" class="flex justify-center items-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="voucherGroup" class="flex flex-col gap-6">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" outlined severity="secondary" size="small" @click="navigateBack" />
        <h1 class="text-3xl font-bold">
          {{ voucherGroup.name }}
        </h1>
      </div>

      <VoucherGroupInfoCard :voucher-group="voucherGroup" @updated="handleUpdated" />

      <VoucherCardsTable :users="voucherGroup.users || []" />
    </div>

    <div v-else class="text-center p-8 text-muted-color">
      {{ t('modules.financial.vouchers.list.empty') }}
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import type { VoucherGroupResponse } from '@gewis/sudosos-client';
import PageContainer from '@/layout/PageContainer.vue';
import VoucherGroupInfoCard from '@/modules/financial/components/voucher/VoucherGroupInfoCard.vue';
import VoucherCardsTable from '@/modules/financial/components/voucher/VoucherCardsTable.vue';
import { useVoucherGroupStore } from '@/stores/voucherGroup.store';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const voucherGroupStore = useVoucherGroupStore();

const props = defineProps<{
  id?: string | number;
}>();

const groupId = computed(() => Number(props.id || route.params.id));
const voucherGroup = ref<VoucherGroupResponse | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  await loadGroup();
});

const loadGroup = async () => {
  if (!groupId.value) return;
  isLoading.value = true;
  try {
    const data = await voucherGroupStore.fetchVoucherGroupById(groupId.value);
    voucherGroup.value = data;
  } catch (error) {
    handleError(error as AxiosError, toast);
  } finally {
    isLoading.value = false;
  }
};

const handleUpdated = (updated: VoucherGroupResponse) => {
  voucherGroup.value = updated;
};

const navigateBack = () => {
  void router.push({ name: 'vouchers' });
};
</script>
