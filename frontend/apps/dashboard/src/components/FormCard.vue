<template>
  <CardComponent :header="header">
    <template #topAction>
      <div v-if="showEdit" class="mx-2">
        <div v-if="!edit">
          <Button
              severity="primary"
              :label="t('common.edit')"
              icon="pi pi-pencil"
              @click="toggleEdit(true)"
          />
        </div>
        <div v-else class="flex flex-row gap-2">
          <Button
              severity="primary"
              :label="t('common.save')"
              icon="pi pi-check"
              @click="handleSave"
          />
          <Button
              severity="secondary"
              :label="t('common.close')"
              icon="pi pi-times"
              @click="cancel"
          />
        </div>
      </div>
    </template>
    <slot :edit="edit"></slot>
    <div v-if="create && form" class="flex flex-row gap-2 justify-content-end w-full mt-3">
      <div class="flex flex-row gap-2 justify-content-end w-full mt-3">
        <ActionButton
            type="submit"
            :disabled="!props.form?.context.meta.value.valid"
            :label="t('common.create')"
            :submitting="form.context.isSubmitting.value"
            :result="form.success?.value != null"
            @click="form.submit"
        />
        <Button
            type="button"
            severity="secondary"
            icon="pi pi-times"
            @click="cancel"
            :label="t('common.cancel')"
        />
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue';
import CardComponent from "@/components/CardComponent.vue";
import Button from 'primevue/button';
import { useI18n } from "vue-i18n";
import { type Form, setSuccess } from "@/utils/formUtils";
import ActionButton from "@/components/ActionButton.vue";

const { t } = useI18n();

const showEdit = computed(() => props.enableEdit && !props.create);

const props = defineProps({
  header: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    required: false,
  },
  enableEdit: {
    type: Boolean,
    required: false,
    default: true,
  },
  create: {
    type: Boolean,
    required: false,
    default: false,
  },
  form: {
    type: Object as PropType<Form<any>>,
    required: false,
  },
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const edit = ref(props.modelValue);
const toggleEdit = (value: boolean) => {
  edit.value = value;
  emit('update:modelValue', value);
};

const cancel = () => {
  emit('cancel');
  if (props.form) setSuccess(props.form, null);
  toggleEdit(false);
};

const handleSave = () => {
  emit('save');
  toggleEdit(false);
};

</script>

<style scoped lang="scss">

</style>
