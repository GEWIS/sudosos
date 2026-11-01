<template>
  <DataTable
    :scroll-height="scrollable ? 'flex' : undefined"
    :scrollable="scrollable"
    table-style="table-layout: fixed"
    :value="entries"
  >
    <Column class="p-1" field="amount" header="#" header-style="width: 2.5rem" />
    <Column class="p-1" field="description" :header="t('common.description')" />
    <Column class="p-1" field="priceInclVat" :header="t('common.price')">
      <template #body="{ data }">
        {{ formatPrice(data.priceInclVat) }}
      </template>
    </Column>
    <Column class="p-1" field="vatPercentage" :header="t('common.vat')">
      <template #body="{ data }">
        {{ data.vatPercentage + '%' }}
      </template>
    </Column>
    <Column class="p-1" field="totalPriceInclVat" :header="t('common.amount')">
      <template #body="{ data }">
        {{ formatPrice(rowTotal(data)) }}
      </template>
    </Column>

    <ColumnGroup type="footer">
      <Row v-for="(row, index) in totalRows" :key="index">
        <Column class="p-1" :colspan="2" />
        <Column class="p-1" :colspan="2">
          <template #footer>
            <span :class="{ 'font-bold': !row.muted, 'font-normal': row.muted, ...row.class }">
              {{ row.description }}
            </span>
          </template>
        </Column>
        <Column class="p-1">
          <template #footer>
            <span :class="{ 'font-bold': !row.muted, 'font-normal': row.muted, ...row.class }">
              {{ formatPrice(rowTotal(row)) }}
            </span>
          </template>
        </Column>
      </Row>
    </ColumnGroup>
  </DataTable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { InvoiceEntryResponse, TransferResponse } from '@gewis/sudosos-client';
import { useInvoiceEntries } from '@/modules/financial/composables/useInvoiceEntries';
import { formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();
const props = withDefaults(
  defineProps<{ entries: InvoiceEntryResponse[]; transfer?: TransferResponse; scrollable?: boolean }>(),
  { transfer: undefined, scrollable: false },
);

const { totalRows, rowTotal } = useInvoiceEntries(
  computed(() => props.entries),
  computed(() => props.transfer),
);
</script>

<style scoped lang="scss">
:deep(.p-datatable-tfoot > tr:first-child > td) {
  border-top: 1px solid var(--p-datatable-body-cell-border-color);
}
</style>
