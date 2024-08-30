<template>
  <CardComponent :header="header">
    <template #topAction>
      <div v-if="showEdit" class="mx-2">
        <div v-if="!edit">
          <Button
              severity="primary"
              :label="t('c_formCard.edit')"
              icon="pi pi-pencil"
              @click="toggleEdit(true)"
          />
        </div>
        <div v-else class="flex flex-row gap-2">
          <Button
              severity="primary"
              :label="t('c_formCard.save')"
              icon="pi pi-check"
              @click="handleSave"
          />
          <Button
              severity="secondary"
              :label="t('c_formCard.close')"
              icon="pi pi-times"
              @click="cancel"
          />
        </div>
      </div>
    </template>
    <slot :edit="edit"></slot>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CardComponent from "@/components/CardComponent.vue";
import Button from 'primevue/button';
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const showEdit = computed(() => props.enableEdit);

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
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const edit = ref(props.modelValue);
const toggleEdit = (value: boolean) => {
  edit.value = value;
  emit('update:modelValue', value);
};

const cancel = () => {
  emit('cancel');
  toggleEdit(false);
};

const handleSave = () => {
  emit('save');
  toggleEdit(false);
};

</script>

<style scoped lang="scss">

</style>
