<template>
  <BalanceTopupModal v-model:visible="visible" :amount="topupAmount!!" />
  <CardComponent class="sm:w-full w-full" :header="t('modules.user.balance.balance')">
    <div class="flex flex-col sm:flex-row justify-center">
      <div class="flex flex-col justify-center w-full sm:w-1/2">
        <Skeleton v-if="loading" class="h-16 mx-auto w-5/12" />
        <h1 v-else class="font-medium my-0 sm:text-7xl text-3xl text-center">{{ displayBalance }}</h1>
        <p v-if="userBalance && userBalance.fine" class="font-semibold text-base text-center text-red-500">
          {{
            isAllFine
              ? t('modules.user.balance.allIsFines')
              : t('modules.user.balance.someIsFines', { fine: displayFine })
          }}
        </p>
        <div v-show="displayBalanceAfterTopup" class="font-italic text-600 text-center">
          {{ t('modules.user.balance.after') }}
          <span v-if="displayBalanceAfterTopup">{{
            formatPrice(
              Dinero(userBalance?.amount!! as Dinero.Options)
                .add(Dinero({ amount: Math.round(topupAmount!! * 100), currency: 'EUR' }))
                .toObject(),
            )
          }}</span>
        </div>
      </div>
      <Divider class="block sm:hidden" layout="horizontal" />
      <Divider class="hidden sm:block" layout="vertical" />

      <div class="flex flex-col w-full sm:w-1/2">
        <div>
          <p class="font-bold">{{ t('modules.user.balance.increaseAmount') }}</p>
          <div class="flex-1 w-full">
            <InputNumber
              v-model="topupAmount"
              currency="EUR"
              input-id="amount"
              :input-props="{
                inputmode: 'decimal',
                class: 'w-full',
              }"
              locale="nl-NL"
              :max-fraction-digits="2"
              :min="0.0"
              :min-fraction-digits="0"
              mode="currency"
              :placeholder="t('modules.user.balance.price')"
              @input="
                (data) => {
                  setFieldValue('Top up amount', data.value as number, errors['Top up amount'] !== undefined);
                  setTouched(true);
                }
              "
            />
          </div>
          <span class="font-bold text-red-500">{{ errors['Top up amount'] }}</span>
        </div>
        <div class="flex justify-end my-2">
          <Button class="justify-center sm:w-1/3 w-full" @click="onSubmit">
            {{ t('modules.user.balance.topUp') }}
          </Button>
        </div>
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { computed, ref, onMounted, type Ref, watch } from 'vue';
import type { BalanceResponse } from '@sudosos/sudosos-client';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { toTypedSchema } from '@vee-validate/yup';
import Divider from 'primevue/divider';
// eslint-disable-next-line import/no-named-as-default
import Dinero from 'dinero.js';
import InputNumber from 'primevue/inputnumber';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import apiService from '@/services/ApiService';
import BalanceTopupModal from '@/modules/user/components/balance/BalanceTopupModal.vue';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();

const loading: Ref<boolean> = ref(true);
const productSchema = toTypedSchema(
  yup.object({
    'Top up amount': yup
      .number()
      .required()
      .test('is-min10-or-balance', `Top up should be more than €10 or settle debt exactly.`, (value) => {
        return value >= 10 || Math.round(value * -100) == userBalance.value?.amount.amount;
      })
      .test('is-total-less-than-150', `Your new balance cannot surpass €150.`, (value) => {
        return userBalance.value!.amount.amount + value * 100 <= 15000;
      }),
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { values, errors, defineField, meta, setFieldValue, setTouched, handleSubmit, validate } = useForm({
  validationSchema: productSchema,
});

const [topupAmount] = defineField('Top up amount', {
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
  validateOnBlur: false,
});

const onSubmit = handleSubmit(() => {
  visible.value = true;
});

const userStore = useUserStore();
const userBalance: Ref<BalanceResponse | null> = ref(null);
const router = useRouter();
const updateUserBalance = async () => {
  // Force refresh balance, since people tend to refresh pages like this to ensure an up to date balance.
  loading.value = true;
  const auth = useAuthStore();
  if (!auth.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchCurrentUserBalance(auth.getUser.id, apiService);
  userBalance.value = userStore.getCurrentUser.balance;
  loading.value = false;
};

onMounted(() => {
  setTimeout(updateUserBalance, 1000);
});

watch(userStore, () => {
  loading.value = true;
  userBalance.value = userStore.getCurrentUser.balance;
  loading.value = false;
});

const isAllFine = computed(() => {
  if (!userBalance.value?.fine) return false;
  return userBalance.value.fine.amount >= -1 * userBalance.value?.amount.amount;
});

const displayFine = computed(() => {
  if (!userBalance.value?.fine) return undefined;
  return formatPrice(userBalance.value.fine || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayBalance = computed(() => {
  return formatPrice(userBalance.value?.amount || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayBalanceAfterTopup = computed(() => {
  return meta.value.touched && userBalance.value?.amount != undefined && topupAmount.value != undefined;
});

// Define the 'visible' ref variable to control dialog visibility
const visible = ref(false);
</script>
<style scoped lang="scss">
.invisible {
  visibility: hidden;
}
</style>
