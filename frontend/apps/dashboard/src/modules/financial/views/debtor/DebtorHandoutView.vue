<template>
  <PageContainer class="max-w-[100rem]">
    <div class="flex flex-col gap-5">
      <DebtorTable v-if="handout" :handout-event="handout" />
    </div>
    <Button
      v-if="handout"
      class="mt-5 float-end"
      :disabled="debtorStore.isDebtorsLoading || debtorStore.isDeleteLoading"
      @click="startDelete"
    >
      {{ t('modules.financial.debtor.handoutEvents.delete') }}
    </Button>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { FineHandoutEventResponse } from '@sudosos/sudosos-client';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import DebtorTable from '@/modules/financial/components/debtor/DebtorTable.vue';
import { useDebtorStore } from '@/stores/debtor.store';
import { handleError } from '@/utils/errorUtils';
import PageContainer from '@/layout/PageContainer.vue';
import router from '@/router';

const { t } = useI18n();

const debtorStore = useDebtorStore();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

const handout = ref<FineHandoutEventResponse>();

onMounted(async () => {
  const id = Number(route.params.id);
  await debtorStore
    .fetchSingleHandoutEvent(id)
    .catch((error) => {
      handleError(error, toast);
    })
    .then((res) => {
      handout.value = res as FineHandoutEventResponse;
    });
});

function startDelete() {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.debtor.handoutEvents.confirm.deleteMessage'),
    icon: 'pi pi-question-circle',
    acceptLabel: t('modules.financial.debtor.handoutEvents.confirm.delete'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      debtorStore
        .deleteFineHandoutEvent(handout.value!.id)
        .then(() => {
          void router.replace('/debtor');

          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('modules.financial.debtor.handoutEvents.deleteSuccess'),
            life: 3000,
            severity: 'success',
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
}
</script>

<style scoped lang="scss"></style>
