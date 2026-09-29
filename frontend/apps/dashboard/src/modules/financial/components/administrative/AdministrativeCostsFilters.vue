<template>
  <div class="flex flex-row gap-2 align-items-center flex-wrap">
    <IconField icon-position="left">
      <InputIcon class="pi pi-search" />
      <InputNumber
        v-model="userId"
        :placeholder="t('modules.financial.administrative.filters.userId')"
        @update:model-value="onUserIdChange"
      />
    </IconField>

    <IconField icon-position="left">
      <InputIcon class="pi pi-search" />
      <InputNumber
        v-model="costId"
        :placeholder="t('modules.financial.administrative.filters.costId')"
        @update:model-value="onCostIdChange"
      />
    </IconField>

    <Button :label="t('common.clear')" outlined @click="clearFilters" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import IconField from 'openvue/iconfield';
import InputIcon from 'openvue/inputicon';
import InputNumber from 'openvue/inputnumber';
import Button from 'openvue/button';
import { useI18n } from 'vue-i18n';

interface Props {
  filters: {
    fromId?: number;
    inactiveAdministrativeCostId?: number;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:filters': [filters: { fromId?: number; inactiveAdministrativeCostId?: number }];
  clear: [];
}>();

const { t } = useI18n();

const userId = ref<number | null>(props.filters.fromId || null);
const costId = ref<number | null>(props.filters.inactiveAdministrativeCostId || null);

watch(
  () => props.filters,
  (newFilters) => {
    userId.value = newFilters.fromId || null;
    costId.value = newFilters.inactiveAdministrativeCostId || null;
  },
  { deep: true },
);

function onUserIdChange(value: number | null) {
  emit('update:filters', {
    ...props.filters,
    fromId: value || undefined,
  });
}

function onCostIdChange(value: number | null) {
  emit('update:filters', {
    ...props.filters,
    inactiveAdministrativeCostId: value || undefined,
  });
}

function clearFilters() {
  userId.value = null;
  costId.value = null;
  emit('clear');
}
</script>

<style scoped lang="scss"></style>
