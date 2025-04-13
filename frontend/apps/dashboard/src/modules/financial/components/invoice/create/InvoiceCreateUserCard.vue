<template>
  <CardComponent header="User Selection">
    <!-- TODO: Improve two way binding such that resetting the form will also reset the user selection -->
    <InputUserSpan
      v-model:value="selectedUser"
      class="mb-3"
      :default="queryUser"
      :label="t('modules.financial.invoice.for')"
      :show-positive="false"
      :type="GetAllUsersTypeEnum.Invoice"
      @update:value="updateUser($event)"
    />

    <div class="flex flex-row justify-content-between">
      <span>{{ t('modules.financial.invoice.create.userBalance') }}</span>
      <span v-if="userBalance">{{ formatPrice(userBalance) }}</span>
      <span v-else>{{ t('common.na') }}</span>
    </div>

    <div class="flex flex-row justify-content-between">
      <span>{{ t('modules.financial.invoice.create.invocieAmount') }}</span>
      <span>{{ formatPrice(transactionTotal) }}</span>
    </div>

    <Divider />

    <div class="flex flex-row font-bold justify-content-between">
      <span>{{ t('modules.financial.invoice.create.balanceAfter') }}</span>
      <span>{{ formatPrice(balanceAfterInvoice) }}</span>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
/**
 * Component used to select the invoiced user and display the balance before and after the invoice.
 */

import { computed, onMounted, type PropType, type Ref, ref, watch } from 'vue';
import * as yup from 'yup';
import {
  type BaseUserResponse,
  type DineroObjectResponse,
  GetAllUsersTypeEnum,
  type UserResponse,
} from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import { type Form, getProperty } from '@/utils/formUtils';
import { createInvoiceObject } from '@/utils/validation-schema';
import CardComponent from '@/components/CardComponent.vue';
import InputUserSpan from '@/components/InputUserSpan.vue';
import { formatPrice } from '@/utils/formatterUtils';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const selectedUser = ref<BaseUserResponse | undefined>(undefined);
const route = useRoute();
const userStore = useUserStore();

const transactionTotal = computed(() => {
  const total = getProperty(props.form, 'transactionTotal');
  if (total) {
    return total;
  } else {
    return { precision: 2, currency: 'EUR', amount: 0 };
  }
});

/**
 * Calculate the balance after the invoice.
 */
const balanceAfterInvoice: Ref<DineroObjectResponse> = computed(() => {
  let amount = 0;
  const transactionTotal = getProperty(props.form, 'transactionTotal');
  if (userBalance.value?.amount && transactionTotal) {
    amount = userBalance.value?.amount + transactionTotal.amount;
  }
  return {
    amount,
    precision: 2,
    currency: 'EUR',
  };
});

/**
 * Update the invoice user and fetch the default invoice user preset.
 * @param event - User to be selected.
 */
const updateUser = (event: UserResponse) => {
  if (event.id) {
    props.form.context.setFieldValue('forId', event.id);
    updateUserBalance();
    updateDefaultUser(event.id);
  }
};

watch(
  () => props.form.model.forId.value.value,
  () => {
    console.error('forId changed', props.form.model.forId.value.value);
    if (props.form.model.forId.value.value === undefined) {
      selectedUser.value = undefined;
      userBalance.value = { precision: 2, currency: 'EUR', amount: 0 };
    }
  },
);

const userBalance: Ref<DineroObjectResponse> = ref({ precision: 2, currency: 'EUR', amount: 0 });

/**
 * Fetch the user balance from the API.
 */
const updateUserBalance = () => {
  const forId = getProperty(props.form, 'forId');
  if (forId) {
    apiService.balance
      .getBalanceId(forId)
      .then((res) => {
        userBalance.value = res.data.amount;
      })
      .catch(() => {
        userBalance.value = { precision: 2, currency: 'EUR', amount: 0 };
      });
  }
};

/**
 * Fetch default invoice user preset from the API.
 * @param forId - Invoice user id.
 */
const updateDefaultUser = (forId: number) => {
  apiService.invoices
    .getSingleInvoiceUser(forId)
    .then((res) => {
      const user = res.data;
      props.form.context.setFieldValue('addressee', user.user.firstName);
      props.form.context.setFieldValue('street', user.street);
      props.form.context.setFieldValue('postalCode', user.postalCode);
      props.form.context.setFieldValue('city', user.city);
      props.form.context.setFieldValue('country', user.country);
    })
    .catch((err) => handleError(err, useToast()));
};

const queryUser: Ref<BaseUserResponse | undefined> = ref(undefined);

onMounted(() => {
  console.error(route.query.userId);
  if (route.query.userId) {
    const userId = route.query.userId as unknown as number;
    props.form.context.setFieldValue('forId', userId);

    const user = userStore.getUserById(userId);
    queryUser.value = user;

    updateUserBalance();
    updateDefaultUser(userId);
  }
});
</script>

<style scoped lang="scss"></style>
