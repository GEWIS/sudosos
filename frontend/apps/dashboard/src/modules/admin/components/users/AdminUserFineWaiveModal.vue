<template>
  <FormDialog
    v-model:model-value="isVisible"
    :form="form"
    :header="t('modules.admin.singleUser.balance.waiveFines')"
    :is-editable="true"
  >
    <template #form="slotProps">
      <div>
        <i>
          {{ t('modules.admin.singleUser.balance.someIsFinesDetailed', { fine: displayFine, waived: displayWaived }) }}
        </i>
        <i v-tooltip="t('modules.admin.singleUser.balance.waiveExplanation')" class="pi pi-info-circle"></i>
      </div>
      <Divider />
      <UserFineWaiveForm
        v-model:is-visible="isVisible"
        :balance="props.balance"
        :form="slotProps.form"
        :user="props.user"
      />
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import { computed, onMounted } from 'vue';
import { waiveUserFineSchema } from '@/utils/validation-schema';
import FormDialog from '@/components/FormDialog.vue';
import { schemaToForm } from '@/utils/formUtils';
import UserFineWaiveForm from '@/modules/admin/components/users/forms/UserFineWaiveForm.vue';
import { formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();

const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(waiveUserFineSchema);

const props = defineProps<{
  user: UserResponse;
  balance: BalanceResponse;
}>();

onMounted(() => {
  // If already fine waived then add that as placeholder.
  if (props.balance.fineWaived) {
    form.context.setFieldValue('amount', props.balance.fineWaived.amount / 100);
  }
});

const displayFine = computed(() => {
  return formatPrice(props.balance.fine || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayWaived = computed(() => {
  return formatPrice(props.balance.fineWaived || { amount: 0, currency: 'EUR', precision: 2 });
});
</script>

<style scoped lang="scss"></style>
