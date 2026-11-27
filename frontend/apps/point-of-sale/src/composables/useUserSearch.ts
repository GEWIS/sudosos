import { computed, onMounted, ref, watch } from 'vue';
import { BaseUserResponse, PaginatedUserResponse, UserResponse } from '@gewis/sudosos-client';
import { debounce } from 'lodash';
import type { AxiosResponse } from 'axios';
import Fuse from 'fuse.js';
import { useSettingStore } from '@/stores/settings.store';
import { usePointOfSaleStore } from '@/stores/pos.store';
import apiService from '@/services/ApiService';

const CHARGEABLE_TYPES = ['MEMBER', 'LOCAL_USER', 'LOCAL_ADMIN', 'INVOICE', 'AUTOMATIC_INVOICE'];

/**
 * Finding someone to charge: recent buyers while the search field is empty,
 * otherwise a fuzzy-sorted backend search. Shared by the kiosk user search
 * and the mobile buyer sheet.
 */
export function useUserSearch() {
  const settings = useSettingStore();
  const posStore = usePointOfSaleStore();

  const searchValue = ref('');
  const searchQuery = computed(() => searchValue.value.split(' ')[0]);
  const users = ref<UserResponse[]>([]);
  const recent = ref<BaseUserResponse[]>([]);

  const getRecentUsers = async (): Promise<BaseUserResponse[]> => {
    if (settings.isBorrelmode) {
      // Borrel mode: derive recent users from POS transactions.
      const posId = posStore.getPos?.id;
      if (!posId) return [];
      const res = await apiService.pos.getTransactions({ id: posId, take: 100 });
      const seen = new Set<number>();
      return res.data.records
        .map((transaction) => transaction.from)
        .filter((user) => !seen.has(user.id) && seen.add(user.id));
    }
    // Authenticated POS: use the value pre-fetched at login, or fetch it now.
    if (posStore.recentUsers === null) await posStore.fetchRecentUsers();
    return posStore.recentUsers ?? [];
  };

  const search = debounce(() => {
    void apiService.user
      .getAllUsers({ take: 200, skip: 0, search: searchQuery.value, active: true })
      .then((res: AxiosResponse<PaginatedUserResponse>) => {
        users.value = res.data.records;
      });
  }, 50);

  watch(searchQuery, () => search());

  // This fuzzy search allows us to effectively search in the front-end, but this should be done in the backend.
  const sortedUsers = computed(() => {
    const full = users.value.map((u) => ({
      ...u,
      fullName: `${u.firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')} ${u.lastName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')}`,
    }));
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

    const filteredUsers = fuzzed.filter((user) => CHARGEABLE_TYPES.includes(user.type));
    const validUsers = filteredUsers.filter((user) => user.active && user.acceptedToS !== 'NOT_ACCEPTED');
    const invalidUsers = filteredUsers.filter((user) => !user.active || user.acceptedToS === 'NOT_ACCEPTED');
    return [...validUsers, ...invalidUsers];
  });

  const results = computed<UserResponse[]>(() =>
    searchValue.value ? sortedUsers.value : (recent.value as UserResponse[]),
  );

  const loadRecent = async () => {
    recent.value = await getRecentUsers();
  };

  onMounted(loadRecent);

  return { searchValue, results, recent, loadRecent };
}
