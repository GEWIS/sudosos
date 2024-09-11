<template>
  <div class="flex flex-column gap-2">
    <div class="flex flex-row align-items-center">
      <h4 class="flex-grow-1">{{ header }}</h4>
      <div class="flex flex-row ">
        <Button v-if="simpleSave" icon="pi pi-save" class="my-0" @click="toggleEdit(true)" label="Save" ></Button>
        <Button v-else-if="!edit" icon="pi pi-pencil" class="my-0" @click="toggleEdit(true)" label="Edit" ></Button>
        <div v-else class="flex flex-row gap-2">
          <Button icon ="pi pi-check" class="my-0" @click="handleSave" />
          <Button icon="pi pi-times" class="my-0" @click="cancel" />
        </div>
      </div>
    </div>
  </div>
  <slot :edit="edit" />
  <Divider class="w-full" v-if="divider" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Divider from "primevue/divider";
import Button from "primevue/button";

const props = defineProps({
  header: {
    type: String,
    required: true
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
  }
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

onMounted(() => {
  if (props.simpleSave) {
    toggleEdit(true);
  }
});
</script>

<style scoped>

</style>
