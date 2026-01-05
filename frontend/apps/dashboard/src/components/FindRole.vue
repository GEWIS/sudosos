<template>
  <Select
    v-model="selectedRole"
    auto-filter-focus
    class="w-full md:w-15rem"
    :filter="true"
    :filter-fields="['name']"
    :loading="loading"
    option-label="name"
    :options="roles"
    :placeholder="placeholder"
    @filter="filterRoles"
  >
  </Select>
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref, watch, type Ref } from 'vue';
import { type RoleResponse } from '@sudosos/sudosos-client';
import type { SelectFilterEvent } from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { handleError } from '@/utils/errorUtils';
import apiService from '@/services/ApiService';

const emits = defineEmits(['update:role']);

const props = defineProps({
  role: {
    type: Object as PropType<RoleResponse>,
  },
  default: {
    type: Object as PropType<RoleResponse>,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: '',
  },
  take: {
    type: Number,
    required: false,
    default: 10,
  },
});

const lastQuery = ref('');
const selectedRole: Ref<RoleResponse | undefined> = ref(undefined);

const loading = ref(false);
const roles: Ref<RoleResponse[]> = ref([]);

const getAllRoles = () => {
  loading.value = true;
  apiService.rbac
    .getAllRoles()
    .then((res) => {
      roles.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    })
    .catch((err) => {
      handleError(err, useToast());
    });
};

const filterRoles = (e: SelectFilterEvent) => {
  if (e.value.split(' ')[0] !== lastQuery.value) {
    if (e.value.length < 3) return;
    getAllRoles();
  }
};

onMounted(() => {
  apiService.rbac
    .getAllRoles()
    .then((res) => {
      roles.value = res.data;
      if (props.default) {
        selectedRole.value = props.default;
      }
    })
    .catch((err) => {
      handleError(err, useToast());
    });
});

watch(selectedRole, () => {
  emits('update:role', selectedRole.value);
});
</script>

<style scoped lang="scss"></style>
