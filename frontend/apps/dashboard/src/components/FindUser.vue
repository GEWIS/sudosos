<template>
  <Dropdown
      v-model="selectedUser"
      :options="users"
      optionLabel="fullName"
      :loading="loading"
      :filter="true"
      autoFilterFocus
      :filter-fields="['fullName']"
      :placeholder="placeholder"
      class="w-full md:w-15rem"
      @filter="filterUsers"
  >
  <template #option="slotProps">
    {{ slotProps.option.fullName }} {{ slotProps.option.gewisId ? `(${slotProps.option.gewisId})` : '' }}
  </template>
  </Dropdown>
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref, watch } from "vue";
import type { Ref } from "vue";
import apiService from "@/services/ApiService";
import { debounce } from "lodash";
import type { BaseUserResponse, UserResponse } from "@sudosos/sudosos-client";

const lastQuery = ref("");
const selectedUser = ref(null);
const loading = ref(false);

const users: Ref<(BaseUserResponse & { fullName: string })[]> = ref([]);
const emits = defineEmits(['update:value']);

defineProps({
  value: {
    type: Object as PropType<UserResponse>,
  },
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
});

const transformUsers = (userData: BaseUserResponse[]) => {
  return userData.map((user: BaseUserResponse) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  }));
};

const debouncedSearch = debounce((e: any) => {
  loading.value = true;
  apiService.user.getAllUsers(50, 0, e.value).then((res) => {
    users.value = transformUsers(res.data.records); // Transform users
  }).finally(() => {
    loading.value = false;
  });
  lastQuery.value = e.value;
}, 500);

const filterUsers = (e: any) => {
  if (e.value.split(' ')[0] !== lastQuery.value) {
    if (e.value.length < 3) return;
    debouncedSearch(e);
  }
};

onMounted(async () => {
  apiService.user.getAllUsers(10, 0).then((res) => {
    users.value = transformUsers(res.data.records); // Transform users
  });
});

watch(selectedUser, () => {
  emits('update:value', selectedUser.value);
});

</script>

<style scoped lang="scss">

</style>
