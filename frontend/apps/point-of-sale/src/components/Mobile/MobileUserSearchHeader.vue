<template>
  <header class="shrink-0 bg-white shadow-sm z-30">
    <div v-if="!searching" class="flex items-center gap-1 h-14 px-2">
      <button class="flex flex-1 min-w-0 items-center gap-3 rounded-lg px-2 py-1 text-left" @click="openSearch">
        <i class="pi text-xl text-primary" :class="buyer ? 'pi-user' : 'pi-search'" />
        <span class="flex flex-col min-w-0 leading-tight">
          <span class="font-bold truncate">{{ buyer ? displayName() : 'Search user to charge...' }}</span>
          <span v-if="buyer" class="flex items-center gap-1.5 text-xs">
            <span
              v-if="cartStore.buyerBalance"
              :class="cartStore.checkBuyerInDebt ? 'text-red-600 font-semibold' : 'text-gray-600'"
            >
              {{ formatDineroObjectToString(cartStore.buyerBalance) }}
            </span>
            <span v-if="!isOfAge()" class="badge bg-orange-100 text-orange-800">
              <i class="pi pi-user-minus text-[0.6rem]" /> Underage
            </span>
            <span v-if="cartStore.checkBuyerInDebt" class="badge bg-red-100 text-red-700">In debt</span>
          </span>
        </span>
      </button>
      <Button
        v-if="showLock()"
        :aria-label="cartStore.lockedIn ? 'Unlock buyer' : 'Lock buyer'"
        :icon="cartStore.lockedIn ? 'pi pi-lock' : 'pi pi-unlock'"
        rounded
        :text="!cartStore.lockedIn"
        @click="lockUser"
      />
      <Button aria-label="Settings" icon="pi pi-cog" rounded severity="secondary" text @click="emit('openSettings')" />
      <Button
        v-if="!settings.isBorrelmode"
        aria-label="Log out"
        icon="pi pi-sign-out"
        rounded
        severity="secondary"
        text
        @click="logout"
      />
    </div>

    <div v-else class="flex items-center gap-2 h-14 px-2">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref="searchInput"
          v-model="searchValue"
          aria-label="Search user to charge"
          autocomplete="off"
          class="w-full rounded-lg bg-gray-100 border-2 border-transparent py-2 pl-9 pr-3 search-input"
          enterkeyhint="search"
          placeholder="Search user to charge..."
          type="text"
        />
      </div>
      <Button aria-label="Cancel search" icon="pi pi-times" rounded severity="secondary" text @click="closeSearch" />
    </div>

    <div v-if="searching" class="fixed left-0 right-0 bottom-0 top-14 z-30 overflow-y-auto bg-gray-50 px-3 pb-6">
      <Button
        v-if="!settings.isBorrelmode"
        class="w-full mt-3"
        icon="pi pi-user"
        label="Charge yourself"
        @click="selectUser(authStore.user)"
      />
      <Button v-else class="w-full mt-3" icon="pi pi-users" label="Select no one" @click="selectUser(null)" />

      <div class="pt-4 pb-1 text-xs font-semibold uppercase tracking-widest opacity-50">
        {{ searchValue ? 'Results' : 'Quick suggestions' }}
      </div>
      <div class="user-results">
        <UserSearchRowComponent
          v-for="user in getUsers"
          :key="user.id"
          :user="user as UserResponse"
          @click="selectUser(user as UserResponse)"
        />
      </div>
      <p v-if="searchValue && getUsers.length === 0" class="text-center text-gray-500 py-6">No users found.</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { UserResponse } from '@gewis/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useCartStore } from '@/stores/cart.store';
import { useSettingStore } from '@/stores/settings.store';
import { useCartTransactions } from '@/composables/useCartTransactions';
import { useUserSearch } from '@/composables/useUserSearch';
import { logoutService } from '@/services/logoutService';
import { formatDineroObjectToString } from '@/utils/FormatUtils';
import UserSearchRowComponent from '@/components/UserSearch/UserSearchRowComponent.vue';

const emit = defineEmits<{
  openSettings: [];
}>();

const cartStore = useCartStore();
const authStore = useAuthStore();
const settings = useSettingStore();
const { displayName, isOfAge, lockUser, showLock } = useCartTransactions();
const { searchValue, getUsers, loadRecentUsers } = useUserSearch();

const buyer = computed(() => cartStore.getBuyer);
const searching = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

const openSearch = async () => {
  searching.value = true;
  await nextTick();
  searchInput.value?.focus();
  await loadRecentUsers();
};

const closeSearch = () => {
  searching.value = false;
  searchValue.value = '';
};

const selectUser = (user: UserResponse | null) => {
  void cartStore.setBuyer(user);
  closeSearch();
};

const logout = async () => {
  await logoutService();
};

defineExpose({ openSearch });
</script>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border-radius: 9999px;
  padding: 0 0.4rem;
  font-weight: 600;
}

.search-input:focus {
  outline: none;
  border-color: var(--p-primary-color);
  background-color: white;
}

/* UserSearchRowComponent is sized for the kiosk; tighten it for a phone. */
.user-results :deep(.user-row) {
  margin: 0.375rem 0;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  text-align: left;
  justify-content: flex-start;
}
</style>
