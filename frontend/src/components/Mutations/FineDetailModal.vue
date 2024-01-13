<template>
  <div class="flex flex-column">
    <div class="flex flex-row justify-content-between">
      <p>{{ t('fine.total') }}</p>
      <p>{{ formatPrice(amount) }}</p>
    </div>
    <div class="flex flex-row justify-content-between">
      <p>{{ t('fine.from') }}</p>
      <p>{{ `${firstName} ${lastName}` }}</p>
    </div>
    <div class="flex flex-row justify-content-between">
      <p>{{ t('fine.type') }}</p>
      <p>{{ t('fine.fine')  }}</p>
    </div>
    <div class="flex flex-row justify-content-between">
      <p>{{ t('fine.description') }}</p>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatPrice } from "../../utils/formatterUtils";
import { onMounted, type Ref, ref } from "vue";
import type {
  DineroObjectResponse,
  TransferResponse
} from "@sudosos/sudosos-client";
import router from "@/router";

const { t } = useI18n();

const firstName: Ref<string> = ref('');
const lastName: Ref<string> = ref('');
const description: Ref<string> = ref('');
const amount: Ref<DineroObjectResponse> = ref({amount: 0, currency: 'EUR', precision: 2});

const props = defineProps({
  fine: {
    type: Object as () => TransferResponse,
    required: true,
  }
});

onMounted(async () => {
  if (!props.fine.from) {
    await router.replace('/error');
    return;
  }
  amount.value = props.fine.amount;
  firstName.value = props.fine.from.firstName;
  lastName.value = props.fine.from.lastName;
  description.value = props.fine.description;
});

</script>

<style scoped>

</style>
