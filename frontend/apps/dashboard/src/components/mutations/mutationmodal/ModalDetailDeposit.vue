<template>
  <div class="flex flex-column">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t("components.mutations.modal.depositDescription") }}</span>
    <br>
    <DataTable
      :value="[depositInfo]"
      :pt="{
        tfoot: 'font-bold'
      }"
    >
      <Column
        field="description"
        :header="t('common.id')"
        class="p-1">
        <template #body="">
          <span class="text-sm xl:text-base">{{ depositInfo.description }}</span>
        </template>
      </Column>
      <Column
        field="totalPriceInclVat"
        :header="t('common.amount')"
        class="p-1"
        footerClass="font-bold"
        >
        <template #body="">
            {{ formatPrice(depositInfo.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import type { TransferResponse } from "@sudosos/sudosos-client";
import { formatPrice } from "@/utils/formatterUtils";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { depositInfo } = defineProps({
  depositInfo: {
    type: Object as () => TransferResponse,
    required: true,
  }
});


const dateString = computed(() => {
  return new Date(depositInfo.createdAt!!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
});


</script>
