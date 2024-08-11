<template>
  <Dialog
      modal
      ref="dialog"
      @show="addListenerOnDialogueOverlay(dialog)"
      v-model:visible="visible"
      :draggable="false"
      class="w-auto flex w-9 md:w-4"
      :header="header">
    <slot name="form" :form="form" />
    <div class="flex flex-row gap-2 justify-content-end w-full mt-3">
      <Button
          type="submit"
          icon="pi pi-check"
          :disabled="!props.form.context.meta.value.valid"
          :label="$t('common.create')"
          @click="props.form.submit"
      />
      <Button
          type="button"
          severity="secondary"
          icon="pi pi-times"
          :label="$t('common.close')"
          @click="visible = false"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, type PropType, ref } from 'vue';
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import type { Form } from "@/utils/formUtils";
import Button from "primevue/button";

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
});

const emits = defineEmits(['update:modelValue']);

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
</script>

<style scoped lang="scss">
</style>
