<template>
  <div class="point-of-sale">
    <div class="header min-h-[4rem] flex items-center">
      <div class="flex flex-row gap-4 w-full">
        <Button class="border-none" @click="cancelSearch()">
          <i class="pi pi-times" style="font-size: 2rem" />
        </Button>
        <input
          ref="searchInput"
          v-model="searchValue"
          autocomplete="off"
          class="flex-sm-grow-1 shadow-md p-2 rounded border-2 border-transparent search-input"
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
        <template v-if="!searchValue && !settings.isBorrelmode && getUsers.length">
          <div class="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-widest opacity-50">Quick suggestions</div>
          <div class="grid grid-cols-2 gap-x-2 suggestions-grid">
            <UserSearchRowComponent
              v-for="user in getUsers"
              :key="user.id"
              :user="user as UserResponse"
              @click="selectUser(user as UserResponse)"
            />
          </div>
        </template>
        <template v-else>
          <UserSearchRowComponent
            v-for="user in getUsers"
            :key="user.id"
            :user="user as UserResponse"
            @click="selectUser(user as UserResponse)"
          />
        </template>
      </ScrollPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { UserResponse } from '@gewis/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import ScrollPanel from 'primevue/scrollpanel';
import { useSettingStore } from '@/stores/settings.store';
import { useCartStore } from '@/stores/cart.store';
import UserSearchRowComponent from '@/components/UserSearch/UserSearchRowComponent.vue';
import { useUserSearch } from '@/composables/useUserSearch';

const cartStore = useCartStore();
const authStore = useAuthStore();
const settings = useSettingStore();
const { searchValue, getUsers, loadRecentUsers } = useUserSearch();

const updateSearchQuery = (event: InputEvent) => {
  if (event.target) {
    searchValue.value = (event.target as HTMLInputElement).value;
  }
};

const searchInput = ref<null | HTMLInputElement>(null);

onMounted(async () => {
  if (searchInput.value) searchInput.value.focus();
  await loadRecentUsers();
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
.header > div {
  width: 100%;
}

.search-input {
  &:focus {
    outline: none;
    border: 2px solid var(--p-primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-primary-color) 20%, transparent);
  }
}

::v-deep(.p-scrollpanel.custombar .p-scrollpanel-wrapper) {
  border-right: 10px solid var(--surface-ground);
}

::v-deep(.p-scrollpanel.custombar .p-scrollpanel-bar) {
  background-color: var(--p-primary-color);
  opacity: 1;
  transition: background-color 0.3s;
}

::v-deep(.p-scrollpanel.custombar .p-scrollpanel-bar:hover) {
  background-color: var(--p-primary-color);
  filter: brightness(0.85);
}

.suggestions-grid {
  padding-right: 30px;
}

.suggestions-grid :deep(.user-row) {
  margin-right: 0;
  padding-left: 0;
  justify-content: center;
}
</style>
