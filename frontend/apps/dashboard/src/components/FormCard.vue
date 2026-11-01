<template>
  <CardComponent :header="header">
    <template #topAction>
      <div v-if="simpleSave" class="min-w-[120px] flex justify-end">
        <Button
          :disabled="form && !form.context.meta.value.valid"
          icon="pi pi-check"
          :label="t('common.save')"
          severity="primary"
          @click="handleSimpleSave"
        />
      </div>
      <div v-else-if="showEdit" class="min-w-[200px] flex justify-end">
        <div v-if="!edit">
          <Button icon="pi pi-pencil" :label="t('common.edit')" severity="primary" @click="toggleEdit(true)" />
        </div>
        <div v-else class="flex flex-row gap-2">
          <Button
            icon="pi pi-check"
            :label="t('common.save')"
            :loading="saving"
            severity="primary"
            @click="handleSave"
          />
          <Button icon="pi pi-times" :label="t('common.close')" severity="secondary" @click="cancel" />
        </div>
      </div>
    </template>

    <slot :edit="simpleSave ? true : edit"></slot>

    <div v-if="create && form" class="flex flex-row gap-2 justify-end mt-3 w-full">
      <ActionButton
        :disabled="!form?.context.meta.value.valid"
        :label="t('common.create')"
        :result="form.success?.value"
        :submitting="form.context.isSubmitting.value"
        type="submit"
        @click="() => form && form.submit()"
      />
      <Button icon="pi pi-times" :label="t('common.cancel')" severity="secondary" type="button" @click="cancel" />
    </div>
  </CardComponent>
</template>

<script setup lang="ts" generic="T extends AnyObject">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { type AnyObject } from 'yup';
import CardComponent from '@/components/CardComponent.vue';
import { type Form, setSuccess } from '@/utils/formUtils';
import ActionButton from '@/components/ActionButton.vue';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    header: string;
    modelValue?: boolean;
    enableEdit?: boolean;
    create?: boolean;
    form?: Form<T>;
    simpleSave?: boolean;
    onSave?: () => unknown;
  }>(),
  {
    enableEdit: true,
    create: false,
    form: undefined,
    simpleSave: false,
    onSave: undefined,
  },
);

const emit = defineEmits(['update:modelValue', 'cancel']);

const showEdit = computed(() => props.enableEdit && !props.create && !props.simpleSave);

const edit = ref(props.modelValue);
const saving = ref(false);

const toggleEdit = (value: boolean) => {
  edit.value = value;
  emit('update:modelValue', value);
};

const cancel = () => {
  emit('cancel');
  if (props.form) {
    setSuccess(props.form, null);
    props.form.context.resetForm();
  }
  toggleEdit(false);
};

// A save handler that resolves to false keeps the card in edit mode.
const handleSave = async () => {
  if (props.form?.context.meta.value.dirty) {
    saving.value = true;
    try {
      if ((await props.onSave?.()) === false) return;
    } finally {
      saving.value = false;
    }
  }
  toggleEdit(false);
};

const handleSimpleSave = () => {
  if (props.form) {
    void props.form.submit();
  } else {
    void props.onSave?.();
  }
};
</script>

<style scoped lang="scss"></style>
