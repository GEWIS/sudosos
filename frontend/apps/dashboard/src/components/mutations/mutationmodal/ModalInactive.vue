<template>
  <Dialog
    v-if="id"
    ref="dialog"
    :draggable="false"
    :header="t('components.mutations.modal.header', { id: displayId })"
    modal
    :pt="{
      root: { class: 'w-full max-w-[90vw] md:max-w-[33rem]' },
    }"
    :visible="visible"
    @hide="handleClose"
    @show="() => addListenerOnDialogueOverlay(dialog)"
    @update:visible="
      (value) => {
        if (!value) handleClose();
      }
    "
  >
    <div v-if="isLoading">
      <Skeleton class="h-2rem my-1 surface-300 w-5" />
      <Skeleton class="h-2rem my-1 surface-300 w-10" />
      <br />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
    </div>

    <InactiveDetailModal v-else-if="inactiveInfo" :inactive-info="inactiveInfo" />

    <template v-if="canDelete" #footer>
      <div class="flex justify-end">
        <ConfirmButton icon="pi pi-trash" :initial-label="t('common.delete')" type="button" @confirm="deleteInactive" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { addListenerOnDialogueOverlay, isAllowed } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
import type { BaseInactiveAdministrativeCostResponse, TransferResponse } from '@sudosos/sudosos-client';
import ConfirmButton from '@/components/ConfirmButton.vue';
import { useAdministrativeCostsStore } from '@/stores/administrativeCosts.store';
import InactiveDetailModal from '@/components/mutations/mutationmodal/ModalDetailInactive.vue';

interface InactiveAdministrativeCostWithTransfer extends BaseInactiveAdministrativeCostResponse {
  transfer?: TransferResponse;
}

interface Props {
  id?: number;
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
});

const emit = defineEmits<{
  close: [];
  delete: [id: number];
}>();

const { t } = useI18n();
const store = useAdministrativeCostsStore();
const toast = useToast();

const dialog = ref();
const inactiveInfo = ref<InactiveAdministrativeCostWithTransfer | null>(null);
const isLoading = ref(false);
const visible = ref(false);
const isClosing = ref(false);

const canDelete = computed(() => isAllowed('delete', ['all'], 'InactiveAdministrativeCost', ['any']));

const displayId = computed(() => {
  return inactiveInfo.value?.transfer?.id ?? props.id ?? 0;
});

async function fetchInactive() {
  if (!props.id) return;
  isLoading.value = true;
  try {
    inactiveInfo.value = await store.fetchCost(props.id);
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => props.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      visible.value = true;
      void fetchInactive();
    } else if (!newId) {
      visible.value = false;
      inactiveInfo.value = null;
    }
  },
  { immediate: true },
);

function handleClose() {
  if (isClosing.value) {
    return;
  }
  visible.value = false;
  emit('close');
}

async function deleteInactive() {
  if (!inactiveInfo.value || isClosing.value) {
    return;
  }

  const costId = inactiveInfo.value.id;
  isClosing.value = true;
  try {
    await store.deleteCost(costId);
    toast.add({
      summary: t('common.toast.success.success'),
      detail: t('modules.financial.administrative.deleteSuccess'),
      severity: 'success',
      life: 3000,
    });
    visible.value = false;
    emit('delete', costId);
  } catch {
    toast.add({
      summary: t('common.toast.error.error'),
      detail: t('modules.financial.administrative.deleteError'),
      severity: 'error',
      life: 3000,
    });
  } finally {
    isClosing.value = false;
  }
}
</script>

<style scoped lang="scss"></style>
