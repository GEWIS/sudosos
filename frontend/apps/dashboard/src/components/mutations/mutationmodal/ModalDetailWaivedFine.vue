<template>
  <div class="flex flex-column">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t("components.mutations.modal.waivedFineDescription") }}</span>
    <br>
    <DataTable
      :value="[{
        amount: waivedAmount,
        firstName: toFirstName,
        lastName: toLastName,
        description: description
      }]"
      :pt="{
        tfoot: 'font-bold'
      }"
    >
      <Column field="description" :header="t('common.description')" class="p-1">
      </Column>
      <Column
        field="waivedAmount"
        :header="t('common.amount')"
        class="p-1"
        footerClass="font-bold"
      >
        <template #body="product">
          {{ formatPrice(product.data.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from "@/utils/formatterUtils";
import { onMounted, type Ref, ref, computed } from "vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import type {
  DineroObjectResponse,
  TransferResponse
} from "@sudosos/sudosos-client";
import router from "@/router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const toFirstName: Ref<string> = ref('');
const toLastName: Ref<string> = ref('');
const description: Ref<string> = ref('');
const waivedAmount: Ref<DineroObjectResponse> = ref({ amount: 0, currency: 'EUR', precision: 2 });

const props = defineProps({
  waivedFines: {
    type: Object as () => TransferResponse,
    required: true,
  }
});

onMounted(async () => {
  console.warn(props.waivedFines);
  if (!props.waivedFines.to) {
    await router.replace('/error');
    return;
  }
  waivedAmount.value = props.waivedFines.amount;
  toFirstName.value = props.waivedFines.to.firstName;
  toLastName.value = props.waivedFines.to.lastName;
  description.value = props.waivedFines.description;
});

const dateString = computed(() => {
  return new Date(props.waivedFines.createdAt!!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
});

</script>

<style scoped>

</style>
