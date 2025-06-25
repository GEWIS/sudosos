<template>
  <Dialog
    ref="dialog"
    v-model:visible="visible"
    class="flex max-w-full w-auto"
    :draggable="false"
    :header="header"
    modal
    @hide="emits('close')"
    @show="openDialog()"
  >
    <slot :form="form" name="form" />
    <div class="flex flex-row gap-2 justify-between mt-6 w-full">
      <Button
        v-if="isEditable && deletable"
        icon="pi pi-trash"
        :label="deleteLabel || t('common.delete')"
        outlined
        type="button"
        @click="emits('delete')"
      />
      <div class="flex flex-1 flex-row gap-2 justify-end">
        <Button
          v-if="isEditable"
          icon="pi pi-times"
          :label="t('common.close')"
          outlined
          type="button"
          @click="
            visible = false;
            emits('close');
          "
        />
        <ConfirmButton
          v-if="isEditable && confirm"
          :confirm-label="t('common.confirm')"
          :disabled="!props.form.context.meta.value.valid"
          icon="pi pi-check"
          :initial-label="t('common.save')"
          type="submit"
          @confirm="props.form.submit"
        />
        <Button
          v-if="isEditable && !confirm"
          :disabled="!props.form.context.meta.value.valid"
          icon="pi pi-check"
          :label="t('common.save')"
          type="submit"
          @click="props.form.submit"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts" generic="T extends AnyObject">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import { type AnyObject } from 'yup';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import type { Form } from '@/utils/formUtils';
import ConfirmButton from '@/components/ConfirmButton.vue';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    form: Form<T>;
    header?: string;
    isEditable: boolean;
    deletable?: boolean;
    deleteLabel?: string;
    confirm?: boolean;
  }>(),
  {
    header: '',
    deletable: false,
    deleteLabel: '',
  },
);

const emits = defineEmits(['update:modelValue', 'show', 'close', 'delete']);

const dialog = ref();
const visible = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    if (!value) props.form.context.resetForm();
    emits('update:modelValue', value);
  },
});

const openDialog = () => {
  addListenerOnDialogueOverlay(dialog.value);
  emits('show');
};
</script>

<style scoped lang="scss"></style>
