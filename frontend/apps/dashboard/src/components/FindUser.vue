<template>
  <Select
    v-model="selectedUser"
    auto-filter-focus
    class="md:w-15rem w-full"
    :filter="true"
    :filter-fields="['fullName']"
    :loading="loading"
    option-label="fullName"
    :options="users"
    :placeholder="placeholder"
    @filter="filterUsers"
  >
    <template #option="slotProps">
      <span :class="{ 'text-gray-500': isNegative(slotProps.option) === true }">
        {{ slotProps.option.fullName }} {{ slotProps.option.memberId ? `(${slotProps.option.memberId})` : '' }}
      </span>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { debounce } from 'lodash';
import { type BaseUserResponse, GetAllUsersTypeEnum, type UserResponse } from '@sudosos/sudosos-client';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import type { SelectFilterEvent } from 'primevue/select';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const emits = defineEmits(['update:user']);

const props = withDefaults(
  defineProps<{
    user?: UserResponse;
    default?: BaseUserResponse;
    placeholder?: string;
    type?: GetAllUsersTypeEnum;
    take?: number;
    showPositive?: boolean;
  }>(),
  {
    user: undefined,
    default: undefined,
    placeholder: '',
    type: undefined,
    take: 10,
    showPositive: true,
  },
);
const lastQuery = ref('');
const selectedUser: Ref<BaseUserResponse | undefined> = ref(undefined);
const userStore = useUserStore();

const loading = ref(false);
const users: Ref<(BaseUserResponse & { fullName: string })[]> = ref([]);

const compareBalance = (a: BaseUserResponse, b: BaseUserResponse) => {
  const isANegative = isNegative(a);
  const isBNegative = isNegative(b);

  if (isANegative && !isBNegative) {
    return -1;
  }
  if (!isANegative && isBNegative) {
    return 1;
  }
  return 0;
};

const transformUsers = (userData: BaseUserResponse[]) => {
  const usersData: (BaseUserResponse & { fullName: string })[] = userData.map((user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
  }));

  usersData.sort((a, b) => {
    if (!props.showPositive) {
      const res = compareBalance(a, b);
      if (res !== 0) return res;
    }
    return a.fullName.localeCompare(b.fullName);
  });
  return usersData;
};

const debouncedSearch = debounce((e: SelectFilterEvent) => {
  loading.value = true;
  apiService.user
    .getAllUsers(props.take, 0, e.value, undefined, undefined, undefined, props.type)
    .then((res) => {
      users.value = transformUsers(res.data.records);
    })
    .catch((err) => {
      handleError(err, useToast());
    })
    .finally(() => {
      loading.value = false;
    });
  lastQuery.value = e.value;
}, 500);

const filterUsers = (e: SelectFilterEvent) => {
  if (e.value.split(' ')[0] !== lastQuery.value) {
    if (e.value.length < 3) return;
    debouncedSearch(e);
  }
};

function isNegative(user: BaseUserResponse) {
  const balance = userStore.getBalanceById(user.id);
  if (!balance) return undefined;
  else return balance.amount.amount < 0;
}

onMounted(() => {
  let selected = undefined;
  if (props.default) {
    // Quick load the default user
    selected = transformUsers([props.default])[0]!;
    users.value = [selected];
    selectedUser.value = selected;
  }

  apiService.user
    .getAllUsers(props.take, 0, undefined, undefined, undefined, undefined, props.type)
    .then((res) => {
      userStore.addUsers(res.data.records);
      void userStore.fetchUserBalances(res.data.records, apiService).then(() => {
        const transformed = transformUsers(res.data.records);
        if (selected) {
          users.value = [...transformed, selected];
          selectedUser.value = selected;
        } else {
          users.value = transformed;
        }
      });
    })
    .catch((err) => {
      handleError(err, useToast());
    });
});

watch(selectedUser, () => {
  emits('update:user', selectedUser.value);
});
</script>

<style scoped lang="scss"></style>
