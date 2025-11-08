<template>
  <CardComponent :header="t('modules.admin.transactions.search')">
    <div class="flex flex-col gap-3">
      <IconField icon-position="left">
        <InputIcon class="pi pi-search" />
        <InputNumber
          v-model="transactionId"
          :placeholder="t('common.id')"
          :use-grouping="false"
          @blur="handleSearch"
          @keyup.enter="handleSearch"
        />
      </IconField>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InputNumber from 'primevue/inputnumber';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();

const props = defineProps<{
  initialValue?: number;
}>();

const transactionId = ref<number | null>(props.initialValue || null);

const emit = defineEmits<{
  search: [id: number];
}>();

// Watch for changes to initialValue prop
watch(
  () => props.initialValue,
  (newValue) => {
    if (newValue !== undefined) {
      transactionId.value = newValue;
    }
  },
);

function handleSearch() {
  if (transactionId.value !== null && transactionId.value > 0) {
    emit('search', transactionId.value);
  }
}
</script>
