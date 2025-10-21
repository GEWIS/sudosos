<template>
  <div class="point-of-sale">
    <div class="header">
      <div class="flex flex-row">
        <Button class="icon-large search-close square mr-3" @click="cancelSearch()">
          <i class="pi pi-times" style="font-size: 2rem" />
        </Button>
        <input
          ref="searchInput"
          v-model="searchValue"
          autocomplete="off"
          class="flex-sm-grow-1 rounded mr-3 p-2"
          placeholder="Search user to charge..."
          type="text"
          @input="updateSearchQuery($event as InputEvent)"
        />
        <Button v-if="!settings.isBorrelmode" class="text-xl" @click="selectSelf()"> Charge yourself </Button>
        <Button v-else-if="settings.isBorrelmode" class="text-xl" @click="selectNone()"> Select no one </Button>
      </div>
    </div>
    <div>
      <ScrollPanel class="custombar" style="width: 100%; height: 25rem">
        <UserSearchRowComponent
          v-for="user in getUsers"
          :key="user.id"
          :user="user as UserResponse"
          @click="selectUser(user as UserResponse)"
        />
      </ScrollPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from 'vue';
import { BaseUserResponse, PaginatedUserResponse, UserResponse } from '@sudosos/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { debounce } from 'lodash';
import type { AxiosResponse } from 'axios';
import ScrollPanel from 'primevue/scrollpanel';
import Fuse from 'fuse.js';
import { useSettingStore } from '@/stores/settings.store';
import { useCartStore } from '@/stores/cart.store';
import UserSearchRowComponent from '@/components/UserSearch/UserSearchRowComponent.vue';
import apiService from '@/services/ApiService';
import { usePointOfSaleStore } from '@/stores/pos.store';

const searchValue = ref<string>('');
const searchQuery = computed(() => searchValue.value.split(' ')[0]);

const users = ref<UserResponse[]>([]);
const cartStore = useCartStore();
const authStore = useAuthStore();
const settings = useSettingStore();
const posStore = usePointOfSaleStore();

const getRecentUsers = async () => {
  if (!posStore.getPos?.id) return;
  const recentUsers: BaseUserResponse[] = [];
  await apiService.pos.getTransactions(posStore.getPos?.id, 100).then((res) => {
    const data = res.data;
    const ids = new Set<number>([]);
    data.records.map((u) => {
      if (!ids.has(u.from.id)) {
        recentUsers.push(u.from);
        ids.add(u.from.id);
      }
    });
    return ids;
  });
  return recentUsers;
};

const updateSearchQuery = (event: InputEvent) => {
  if (event.target) {
    searchValue.value = (event.target as HTMLInputElement).value;
  }
};

const delayedAPICall = debounce(() => {
  void apiService.user
    .getAllUsers(200, 0, searchQuery.value, true)
    .then((res: AxiosResponse<PaginatedUserResponse>) => {
      users.value = res.data.records;
    });
}, 50);

watch(searchQuery, () => {
  delayedAPICall();
});

const recent: Ref<BaseUserResponse[]> = ref([]);

const getUsers = computed(() => {
  if (searchValue.value) return sortedUsers.value;
  return recent.value;
});

const sortedUsers = computed(() => {
  // This fuzzy search allows us to effectively search in the front-end, but this should be done in the backend.
  const full = [...users.value].map((u: UserResponse) => {
    return {
      ...u,
      fullName: `${u.firstName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')} ${u.lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`,
    };
  });
  const fuzzed: UserResponse[] = new Fuse(full, {
    keys: [
      { name: 'fullName', weight: 0.3 },
      { name: 'nickname', weight: 0.7 },
    ],
    isCaseSensitive: false,
    shouldSort: true,
    threshold: 0.2,
  })
    .search(searchValue.value)
    .map((r) => r.item);

  const filteredUsers = [...fuzzed].filter((user) =>
    ['MEMBER', 'LOCAL_USER', 'LOCAL_ADMIN', 'INVOICE', 'AUTOMATIC_INVOICE'].includes(user.type),
  );
  const validUsers = filteredUsers.filter((user) => user.active && user.acceptedToS !== 'NOT_ACCEPTED');
  const invalidUsers = filteredUsers.filter((user) => !user.active || user.acceptedToS === 'NOT_ACCEPTED');
  return [...validUsers, ...invalidUsers];
});

const searchInput = ref<null | HTMLInputElement>(null);

onMounted(async () => {
  if (searchInput.value) searchInput.value.focus();
  const rec = await getRecentUsers();

  if (rec) recent.value = rec;
});

const emit = defineEmits(['cancelSearch']);
const selectSelf = () => {
  if (authStore.user) {
    selectUser(authStore.user);
    return;
  }
};

const selectNone = () => {
  selectUser(null);
};

const selectUser = (user: UserResponse | null) => {
  void cartStore.setBuyer(user);
  cancelSearch();
};

const cancelSearch = () => {
  emit('cancelSearch');
};
</script>

<style scoped lang="scss">
::v-deep(.p-scrollpanel.custombar .p-scrollpanel-wrapper) {
  border-right: 10px solid var(--surface-ground);
}

::v-deep(.p-scrollpanel.custombar .p-scrollpanel-bar) {
  background-color: var(--primary-300);
  opacity: 1;
  transition: background-color 0.3s;
}

::v-deep(.p-scrollpanel.custombar .p-scrollpanel-bar:hover) {
  background-color: var(--primary-400);
}
</style>
