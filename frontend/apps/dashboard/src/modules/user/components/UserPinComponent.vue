<template>
  <FormCard
    :enable-edit="true"
    :form="form"
    :header="t('modules.user.settings.changePin')"
    :simple-save="true"
    @cancel="form.context.resetForm"
    @save="() => form.submit()"
    @update:model-value="edit = $event"
  >
    <ChangePinForm :edit="edit" :form="form" />
  </FormCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ChangePinForm from '@/modules/user/components/forms/ChangePinForm.vue';
import FormCard from '@/components/FormCard.vue';
import { schemaToForm } from '@/utils/formUtils';
import { editPinSchema } from '@/utils/validation-schema';
const { t } = useI18n();

const form = schemaToForm(editPinSchema);
const edit = ref(true);
</script>
