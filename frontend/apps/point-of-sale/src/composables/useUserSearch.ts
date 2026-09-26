import { computed, Ref, ref, watch } from 'vue';
import { BaseUserResponse, PaginatedUserResponse, UserResponse } from '@gewis/sudosos-client';
import { debounce } from 'lodash';
import type { AxiosResponse } from 'axios';
import Fuse from 'fuse.js';
import { useSettingStore } from '@/stores/settings.store';
import apiService from '@/services/ApiService';
import { usePointOfSaleStore } from '@/stores/pos.store';

/**
 * Search state for picking the user to charge. Shared by the kiosk
 * UserSearchComponent and the mobile header.
 */
export function useUserSearch() {
  const settings = useSettingStore();
  const posStore = usePointOfSaleStore();

  const searchValue = ref<string>('');
  const searchQuery = computed(() => searchValue.value.split(' ')[0]);
  const users = ref<UserResponse[]>([]);
  const recent: Ref<BaseUserResponse[]> = ref([]);

  const getRecentUsers = async () => {
    if (settings.isBorrelmode) {
      // Borrelmode: derive recent users from POS transactions (existing behavior)
      if (!posStore.getPos?.id) return;
      const recentUsers: BaseUserResponse[] = [];
      await apiService.pos.getTransactions({ id: posStore.getPos?.id, take: 100 }).then((res) => {
        const data = res.data;
        const ids = new Set<number>([]);
        data.records.map((u) => {
          if (!ids.has(u.from.id)) {
            recentUsers.push(u.from);
            ids.add(u.from.id);
          }
        });
      });
      return recentUsers;
    } else {
      // Authenticated POS: use pre-fetched store value (populated at login), or fall back to fetching now
      if (posStore.recentUsers === null) {
        await posStore.fetchRecentUsers();
      }
      return posStore.recentUsers ?? [];
    }
  };

  const loadRecentUsers = async () => {
    const rec = await getRecentUsers();
    if (rec) recent.value = rec;
  };

  const delayedAPICall = debounce(() => {
    void apiService.user
      .getAllUsers({ take: 200, skip: 0, search: searchQuery.value, active: true })
      .then((res: AxiosResponse<PaginatedUserResponse>) => {
        users.value = res.data.records;
      });
  }, 50);

  watch(searchQuery, () => {
    delayedAPICall();
  });

  const sortedUsers = computed(() => {
    // This fuzzy search allows us to effectively search in the front-end, but this should be done in the backend.
    const full = [...users.value].map((u: UserResponse) => {
      return {
        ...u,
        fullName: `${u.firstName
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')} ${u.lastName.normalize('NFD').replace(/[̀-ͯ]/g, '')}`,
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

  const getUsers = computed(() => {
    if (searchValue.value) return sortedUsers.value;
    return recent.value;
  });

  return { searchValue, getUsers, loadRecentUsers };
}
