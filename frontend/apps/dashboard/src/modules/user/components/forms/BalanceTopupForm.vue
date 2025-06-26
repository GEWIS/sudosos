<template>
  <BalanceTopupModal v-model:visible="visible" :amount="form.model.amount.value.value" />
  <form class="flex flex-col w-full sm:w-1/2 min-h-[10rem] justify-between" @submit.prevent="handleSubmit">
    <div>
      <InputSpan
        id="amount"
        column
        v-bind="form.model.amount.attr.value"
        :errors="form.context.errors.value.amount"
        :label="t('modules.user.balance.increaseAmount')"
        type="currency"
        :value="form.model.amount.value.value"
        @update:value="form.context.setFieldValue('amount', $event)"
      />
    </div>
    <div class="flex justify-end my-2">
      <Button class="justify-center sm:w-1/3 w-full" :disabled="!form.context.meta.value.valid" type="submit">
        {{ t('modules.user.balance.topUp') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import type { Form } from '@/utils/formUtils';
import { topupSchema } from '@/utils/validation-schema';
import InputSpan from '@/components/InputSpan.vue';
import BalanceTopupModal from '@/modules/user/components/balance/BalanceTopupModal.vue';

const { t } = useI18n();

defineProps<{
  form: Form<yup.InferType<typeof topupSchema>>;
}>();

const visible = ref(false);

const handleSubmit = () => {
  visible.value = true;
};
</script>

<style scoped lang="scss"></style>
