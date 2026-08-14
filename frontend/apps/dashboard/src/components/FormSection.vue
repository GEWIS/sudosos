<template>
  <div class="flex flex-col gap-2">
    <div class="items-center flex flex-row">
      <h4 class="flex-grow-1">{{ header }}</h4>
      <div class="flex flex-row">
        <Button v-if="simpleSave" class="my-0" icon="pi pi-save" label="Save" @click="handleSave()"></Button>
        <Button v-else-if="!edit" class="my-0" icon="pi pi-pencil" label="Edit" @click="toggleEdit(true)"></Button>
        <div v-else class="flex flex-row gap-2">
          <Button class="my-0" icon="pi pi-check" @click="handleSave" />
          <Button class="my-0" icon="pi pi-times" @click="cancel" />
        </div>
      </div>
    </div>
  </div>
  <slot :edit="edit" />
  <Divider v-if="divider" class="w-full" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Divider from 'primevue/divider';
import Button from 'primevue/button';

const props = defineProps({
  header: {
    type: String,
    required: true,
  },
  enableEdit: {
    type: Boolean,
    required: false,
    default: false,
  },
  modelValue: {
    type: Boolean,
    required: false,
  },
  divider: {
    type: Boolean,
    required: false,
    default: false,
  },
  simpleSave: {
    type: Boolean,
    required: false,
    default: false,
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
  if (!props.simpleSave) {
    toggleEdit(false);
  }
};

onMounted(() => {
  if (props.simpleSave) {
    toggleEdit(true);
  }
});
</script>

<style scoped></style>
