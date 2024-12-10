<template>
  <Dialog
      modal
      ref="dialog"
      @show="openDialog()"
      @hide="emits('close')"
      v-model:visible="visible"
      :draggable="false"
      class="max-w-full w-auto flex"
      :header="header">
    <slot name="form" :form="form" />
    <div class="flex flex-row gap-2 justify-content-between w-full mt-3">
      <Button
          v-if="isEditable && deletable"
          type="button"
          icon="pi pi-trash"
          :label="deleteLabel || t('common.delete')"
          outlined
          @click="emits('delete')"/>
      <div class="flex flex-row justify-content-end gap-2 flex-1">
        <Button
            v-if="isEditable"
            type="button"
            outlined
            icon="pi pi-times"
            :label="t('common.close')"
            @click="visible = false; emits('close')"
        />
        <Button
            v-if="isEditable"
            type="submit"
            icon="pi pi-check"
            :disabled="!props.form.context.meta.value.valid"
            :label="t('common.save')"
            @click="props.form.submit"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, type PropType, ref } from 'vue';
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import type { Form } from "@/utils/formUtils";
import Button from "primevue/button";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  form: {
    type: Object as PropType<Form<any>>,
    required: true,
  },
  header: {
    type: String,
    required: false,
    default: '',
  },
  isEditable: {
    type: Boolean,
    required: true
  },
  deletable: {
    type: Boolean,
    required: false,
    default: false
  },
  deleteLabel: {
    type: String,
    required: false
  }
});

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

<style scoped lang="scss">
</style>
